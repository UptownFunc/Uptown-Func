// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design + Data and Science review pending.
// Plan 7.8: F7 is registered in OpenLayers as our own projection (the files carry no authority code), with a
// point-resolution function of resolution x cos(lat) so the scale bar is true at the map's latitude. Display only.
import Projection from "ol/proj/Projection";
import { R_F1, f7PointResolution } from "../geo";

const HALF_X = Math.PI * R_F1, HALF_Y = (Math.PI * R_F1) / 2;
const K = (Math.PI * R_F1) / 180;

export const F7_PROJECTION = new Projection({
  code: "SHARPWALK:F7",
  units: "m",
  extent: [-HALF_X, -HALF_Y, HALF_X, HALF_Y],
  getPointResolution: (resolution: number, point: number[]) => f7PointResolution(resolution, (point[1] ?? 0) / K),
});
