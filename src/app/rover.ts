// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// D6 rover point of view (Tier 1, B-3): Curiosity Navcam frames from sols when the rover was in the boxwork unit
// (public/rover/images.json, chosen under G3-01). Shown as "similar terrain", never as the demo stops or a route check.
// The schema is local to the app (display-only file, DECISIONS C-22); it adds nothing to src/contracts.
import { z } from "zod";

const text = z.string().min(1);
export const RoverImages = z.object({
  datasetId: z.literal("D6"),
  label: text,
  selectedBy: text,
  processing: text,
  images: z.array(z.object({
    file: z.string().regex(/^[\w.-]+\.jpg$/), sha256: z.string().regex(/^[0-9a-f]{64}$/),
    imageId: text, sol: z.number().int().nonnegative(), camera: text, dateTakenUtc: z.string().regex(/^\d{4}-\d{2}-\d{2}T/),
    credit: text, sourceUrl: z.string().url(), rawImagePage: z.string().url(),
    terrainEvidence: z.object({ title: text, url: z.string().url() }),
  })).min(1),
});
export type RoverImages = z.infer<typeof RoverImages>;
type RoverImage = RoverImages["images"][number];

export const roverCaption = (i: RoverImage): string => `Sol ${i.sol} (${i.dateTakenUtc.slice(0, 10)}), ${i.camera}. Credit: ${i.credit}`;

export function roverSource(m: RoverImages): { id: "D6"; kind: "dataset"; title: string; detail: string } {
  const each = m.images.map((i) => `${i.imageId} (sol ${i.sol}, ${i.credit}; ${i.rawImagePage}; boxwork per "${i.terrainEvidence.title}", ${i.terrainEvidence.url})`);
  return { id: "D6", kind: "dataset", title: "D6: Curiosity rover raw images (NASA raw image archive)",
    detail: `${m.label}. ${m.selectedBy}. ${m.processing}. Images: ${each.join("; ")}.` };
}
