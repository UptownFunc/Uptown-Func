// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (3D-09); human Design and Data and Science review pending.
// Relief lighting for the 3D view (3D-09): the rendered D1 terrain lit by one directional light, the same light as the
// 2D sheet's D1 hillshade (pipeline display.hillshade_u8: from the north-west, 45 deg up). It is a reading aid for
// ridges and valleys, not the sun at the scenario time: no cast shadows, no atmosphere, no colour.
// Rendering path (inspected in CesiumJS 1.147.0): the terrain comes from CustomHeightmapTerrainProvider, which has no
// vertex normals, so globe.enableLighting would only shade by the sphere's normal (no relief), and Cesium drops a
// globe material whose source names the vertex-normal inputs. The material below therefore builds each fragment's
// normal from the screen-space derivatives of its eye-space position: the facet of the D1 mesh Cesium actually draws.
// It outputs black with an alpha, which Cesium's globe shader blends as colour * (1 - alpha): one factor for R, G and
// B, so the D2 orthophoto keeps its published hue; ground facing the light keeps its published brightness.
// Cesium hangs vertical "skirts" under every tile edge; hairline cracks between tiles of different detail show them,
// and lit as walls they drew dotted dark lines along tile edges (seen in the first renders). Facets steeper than
// about 83 deg (none in D1 on its 2 m grid) therefore take the sheet's up as their normal: the shade of level ground.
// Heights, imagery, texture coordinates and depth are untouched (picks, the readout and the overlays are unchanged).
import type * as CesiumNS from "cesium";
import { f6ToF5, localFrame, type F1Point } from "../geo";
import type { Cesium } from "./vendor";

/** The D1 hillshade's light (pipeline/sharpwalk/display.py hillshade_u8 defaults, as gdaldem): degrees. */
export const RELIEF_LIGHT = { azimuth_deg: 315, altitude_deg: 45 } as const;
/** The most the lighting darkens: ground turned away from the light keeps 1 - this (0.6) of its brightness, level
 *  ground 1 - 0.4 * (1 - sin 45 deg) = 0.88 (the 2D hillshade, multiplied at 60 %, leaves level ground at 0.82).
 *  Chosen from renders at five camera angles (3D-09): enough to read ridges and valleys, not so much that the facets
 *  of Cesium's coarser terrain levels show. */
export const RELIEF_STRENGTH = 0.4;

/** An F6 direction at `origin` as a unit F5 vector: the F5 point 1,000 km along it minus the origin (a far point keeps
 *  full precision next to F5 coordinates of ~3.4e6 m). */
function dirF5(origin: F1Point, e: number, n: number, u: number): [number, number, number] {
  const fr = localFrame(origin), o = fr.originF5, k = 1e6, p = f6ToF5({ frame: "F6", e: k * e, n: k * n, u: k * u }, fr);
  const v = [p.x - o.x, p.y - o.y, p.z - o.z] as const, len = Math.hypot(...v);
  return [v[0] / len, v[1] / len, v[2] / len];
}

/** The light's direction of travel (from the light towards the ground) in F5, built in the F6 frame at `origin`. */
export function reliefLightF5(origin: F1Point): [number, number, number] {
  const r = Math.PI / 180, az = RELIEF_LIGHT.azimuth_deg * r, alt = RELIEF_LIGHT.altitude_deg * r;
  return dirF5(origin, -Math.sin(az) * Math.cos(alt), -Math.cos(az) * Math.cos(alt), -Math.sin(alt));
}

/** The sheet's up (the F6 up at `origin`) in F5. */
export const reliefUpF5 = (origin: F1Point): [number, number, number] => dirF5(origin, 0, 0, 1);

/** Fabric source. Keep the words that name vertex-normal inputs out of it, comments included (see above). */
export const RELIEF_SHADER = `czm_material czm_getMaterial(czm_materialInput m)
{
  czm_material o = czm_getDefaultMaterial(m);
  vec3 p = m.positionToEyeEC;
  vec3 n = normalize(cross(dFdx(p), dFdy(p)));
  vec3 u = czm_viewRotation * upWC;
  n = normalize(mix(u, n, smoothstep(0.03, 0.12, dot(n, u))));
  o.diffuse = vec3(0.0);
  o.alpha = strength * (1.0 - max(dot(n, czm_lightDirectionEC), 0.0));
  return o;
}`;

/** Which relief the 3D view shows. Never both: the hillshade image is the same D1 relief under the same light, so
 *  drawing it under the lighting would count the relief twice. */
export const reliefSource = (hillshade: boolean, lighting: boolean): "lit" | "hillshade" | "none" =>
  lighting ? "lit" : hillshade ? "hillshade" : "none";

/** The base image to show for the wanted one and whether to light it: the wanted image, else the plain one; with the
 *  lighting on and no plain image, the hillshade image unlit. Never the lighting over the hillshade image. */
export function pickBase<T>(base: { relief?: T; plain?: T }, want: "relief" | "plain", lit: boolean): { shown: T | undefined; light: boolean } {
  const shown = base[want] ?? base.plain ?? (lit ? base.relief : undefined);
  return { shown, light: lit && shown !== undefined && shown === base.plain };
}

export const reliefMaterial = (C: Cesium, origin: F1Point): CesiumNS.Material =>
  new C.Material({ fabric: { uniforms: { strength: RELIEF_STRENGTH, upWC: new C.Cartesian3(...reliefUpF5(origin)) }, source: RELIEF_SHADER } });

export const reliefLight = (C: Cesium, origin: F1Point): CesiumNS.DirectionalLight =>
  new C.DirectionalLight({ direction: new C.Cartesian3(...reliefLightF5(origin)) });
