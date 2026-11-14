// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
import { describe, expect, it } from "vitest";
import raw from "../../public/rover/images.json?raw";
import { RoverImages, roverCaption } from "./rover";

// File checksums are checked in pipeline/tests/test_rover_images.py.
const doc = JSON.parse(raw);

describe("D6 rover point of view (B-3, G3-01)", () => {
  it("the committed manifest is valid, labelled similar terrain, with a NASA/JPL-Caltech credit on every image", () => {
    const m = RoverImages.parse(doc);
    expect(m.images.length).toBeGreaterThanOrEqual(3);
    expect(m.label).toMatch(/similar terrain/);
    expect(m.label).toMatch(/not the demo stops/);
    for (const i of m.images) expect(i.credit).toBe("NASA/JPL-Caltech");
  });

  it("captions name the camera, sol, date and credit", () => {
    const i = RoverImages.parse(doc).images[0]!;
    expect(roverCaption(i)).toBe(`Sol ${i.sol} (${i.dateTakenUtc.slice(0, 10)}), ${i.camera}. Credit: NASA/JPL-Caltech`);
  });

  it("refuses a manifest without a credit or with a bad checksum", () => {
    const bad = structuredClone(doc);
    bad.images[0].credit = "";
    expect(RoverImages.safeParse(bad).success).toBe(false);
    const bad2 = structuredClone(doc);
    bad2.images[0].sha256 = "x";
    expect(RoverImages.safeParse(bad2).success).toBe(false);
  });
});

describe("D6 in the sources panel (UX-15)", () => {
  it("describes the dataset with its label, who chose the images, each image and its terrain evidence", async () => {
    const { roverSource } = await import("./rover");
    const m = RoverImages.parse(doc);
    const s = roverSource(m);
    expect(s).toMatchObject({ id: "D6", kind: "dataset" });
    expect(s.detail).toContain("chosen by SI");
    for (const i of m.images) { expect(s.detail).toContain(i.imageId); expect(s.detail).toContain(i.terrainEvidence.url); }
  });
});
