// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on yujin/ux-polish (UX-17); human Design review pending.
// The orientation tour's geometry: where the spotlight goes around a control and where the card sits beside it.
import { describe, expect, it } from "vitest";
import { NARROW, TOUR, placeCard, spotFor } from "./Tutorial";

const rect = (left: number, top: number, width: number, height: number) => ({ left, top, right: left + width, bottom: top + height, width });

describe("spotlight rectangle", () => {
  it("leaves 8 px of air around the control", () => {
    expect(spotFor(rect(100, 200, 300, 50), 1440, 900)).toEqual({ x: 92, y: 192, w: 316, h: 66 });
  });
  it("stays inside the window when the control runs past an edge", () => {
    expect(spotFor(rect(0, 600, 500, 900), 1440, 900)).toEqual({ x: 4, y: 592, w: 504, h: 304 });
  });
  it("is null for a control with no box (not rendered) or entirely off screen", () => {
    expect(spotFor(rect(100, 100, 0, 0), 1440, 900)).toBeNull();
    expect(spotFor(rect(100, 2000, 200, 40), 1440, 900)).toBeNull();
  });
});

describe("card placement", () => {
  it("sits to the right of the spotlight where it fits, else to the left", () => {
    expect(placeCard({ x: 100, y: 300, w: 400, h: 200 }, 1440, 900).style.left).toBe(516);
    expect(placeCard({ x: 700, y: 300, w: 700, h: 200 }, 1440, 900).style.left).toBe(700 - 380 - 16);
  });
  it("puts a wide control's card below it, else above it, so it does not sit on the control", () => {
    // 1024 x 768, a control as wide as the window: no room beside.
    expect(placeCard({ x: 8, y: 100, w: 1000, h: 200 }, 1024, 768, 380, 300).style.top).toBe(312);
    expect(placeCard({ x: 8, y: 420, w: 1000, h: 200 }, 1024, 768, 380, 300).style.top).toBe(108);
    // Room on neither side: the side with more room, and never under the masthead.
    expect(placeCard({ x: 8, y: 150, w: 1000, h: 500 }, 1024, 768, 380, 300).style.top).toBe(456); // 118 px free below, 60 above
    expect(placeCard({ x: 8, y: 200, w: 1000, h: 540 }, 1024, 768, 380, 300).style.top).toBe(90); // 28 px below, 110 above
  });
  it("never starts under the masthead", () => {
    expect(placeCard({ x: 100, y: 20, w: 300, h: 100 }, 1440, 900).style.top).toBe(90);
  });
  it("docks a narrow window's card to the edge the spotlight is not on", () => {
    expect(placeCard({ x: 10, y: 600, w: 370, h: 200 }, 390, 844).dock).toBe("top");
    expect(placeCard({ x: 10, y: 60, w: 370, h: 200 }, 390, 844).dock).toBe("bottom");
    expect(placeCard({ x: 10, y: 60, w: 370, h: 200 }, NARROW, 844).dock).toBe("bottom");
    expect(placeCard({ x: 10, y: 60, w: 370, h: 200 }, NARROW + 1, 844).dock).toBeNull();
  });
});

describe("tour copy", () => {
  it("gives every card one short explanation and one thing to try", () => {
    for (const c of TOUR) {
      expect(c.body.split(/\s+/).length, c.title).toBeLessThanOrEqual(25);
      expect(c.act.split(/\s+/).length, c.title).toBeLessThanOrEqual(12);
    }
  });
  it("keeps the honesty words where the plan needs them", () => {
    const all = TOUR.map((c) => `${c.body} ${c.act}`).join(" ");
    expect(all).toMatch(/Assumed/);
    expect(all).toMatch(/estimate/i);
    expect(all).not.toMatch(/\bsafe\b/i);
  });
});
