# Phase 1.1 source audit (D1, D2, D12 and the demo area)

SI-assisted: checks run and record drafted with Claude Code (Claude Opus 5.5) on Sat 14 Nov 2026, 10:40-10:50 Asia/Manila. Human Data and Science review is pending. Nothing here is agreed until that owner signs it off.

Plan references: sections 5.1, 5.2, 5.3 and 7.3 of the team's plan (part 1, pp. 1-77). **Section 19 (part 2) was not available to this session**, so any section-19 change to these datasets or to the demo area has not been checked.

Demo area checked: 4.790-4.840 S, 137.365-137.415 E, planetocentric and east-positive (DECISIONS.md D-03).

Scripts: `pipeline/checks/*.py`. They only read data and write to `$SHARPWALK_WORK` (git-ignored). Python 3.11.18, rasterio 1.4.4 (bundled GDAL **3.10.3**, not the pinned 3.12.3), numpy 2.4.6. QGIS was not available.

## D1 - MSL Gale merged DEM, 1 m, version 3 (USGS)

| Item | Finding | Matches plan 5.2 / 7.3? | Evidence |
|---|---|---|---|
| File | `mosaic/Mars/MSL/MSL_Gale_DEM_Mosaic_1m_v3.tif` on the USGS Astrogeology bucket, 3,868,256,546 bytes, dated 2022-11-09 | Yes (3.6 GB) | S3 listing |
| Size and type | 32,980 columns x 57,440 rows, float32, LZW, single-row strips, NoData -32767 | Yes | `d1_probe.py` |
| CRS | Equirectangular, standard parallel 0, central meridian 0, Mars 2000 sphere R = 3,396,190 m (ESRI 106971), metres | Yes (F1) | `d1_probe.py` |
| Latitude / longitude | Planetocentric sphere; east-positive (implied by the Easting axis and the 137 E bounds) | Yes | `d1_probe.py` |
| Elevation range (file statistics) | -4,625.875 to -322.560 m | Yes | header tags |
| Pixel convention | `AREA_OR_POINT=Point`. The 1.2 warp must honour this half-pixel convention. | Not stated in 5.2. **New note.** | header tags |
| Vertical reference | Not stated in the file header or on the USGS product page ("Accurate to Control Net") | Yes, still UNVERIFIED (O-02 / D-05) | product page |
| Licence / use | USGS page: "Access Constraints: Please credit authors"; "Use Constraints: None" | Not stated in part 1 | product page |
| HiRISE stereo in D1 | The USGS page lists 12 HiRISE stereo pairs, including PSP_009149/PSP_009294 ("Traverse") and ESP_019698/ESP_019988 ("T3") | Fits "12 HiRISE stereo pairs" (5.3) | product page |

### Demo-area window (3,201 x 3,201 cells with a 0.002 degree pad; checks use the unpadded area)

| Check (plan 5.3) | Result | Pass rule | Status |
|---|---|---|---|
| NoData inside the area | 0 of 8,782,332 cells (0.0000%) | Under 1% (Assumed) | PASS |
| Elevation inside the area | -3,865.81 to -3,247.22 m (618.6 m relief) | Record only | Recorded |
| Boxwork coverage (hillshade) | The 1 m hillshade shows metre-scale texture across the whole area, with no blurred fill patches. One straight, ladder-like linear feature near the centre may be a stereo artefact; the seam check (1.4) should look at it. | Visibly HiRISE quality | Supports **case A**, pending Data and Science sign-off |
| Local roughness (std of a 9 x 9 high-pass, per 50 m block) | p5 0.049 m, p50 0.192 m, p95 0.442 m; 5.5% of blocks below 0.05 m | No numeric rule in 5.3 | Recorded |
| HiRISE stereo footprint | By map-extent corners, DTEEC_019698_1750_019988_1750_U01 covers about 95% of the area and DTEEC_009149_1750_009294_1750_U01 about 93%; together 100%. These are the T3 and Traverse pairs listed for D1. | Area inside HiRISE stereo (7.8) | PASS on extents; valid-data footprints not checked |
| Slopes over 60 degrees | 19,569 cells (0.22%) | Seams logged and spikes explained (1.4, G1) | Deferred to 1.4 |
| Slope over 20 degrees (1 m, central differences) | 26.23% of cells | Record only; 20 degrees is Assumed | Recorded |
| Window checksum | sha256 `7a2eb7e46a2dc6f7040903a30ce51d95930c489e18ef2509b22bb089bfff59ea` (deflate-tiled crop, not a pipeline output) | n/a | Recorded |

**Does the area contain the boxwork itself?** Not established. At 1 m, no obvious polygonal ridge network is visible, which fits the plan's statement that 1-2 m ridges sit at or below what a 1 m DEM resolves. Whether the area is the right science target is a Data and Science judgement (R-06 / D-03).

### Vertical-reference lead (not a verification)

| Comparison | Points | Mean D1 minus HiRISE | Median | Std | Range |
|---|---|---|---|---|---|
| D1 vs DTEEC_019698 (T3) | 36 | -8.62 m | -9.08 m | 5.94 m | -21.94 to +4.69 m |
| D1 vs DTEEC_009149 (Traverse) | 35 | -9.21 m | -10.41 m | 13.43 m | -44.31 to +23.78 m |

The University of Arizona DTM labels state that their elevations are "above the martian equipotential surface (Mars 2000 Datum) defined by Smith et al. (2001)". D1 sits about 9 m below them on average. That fits D1 also being areoid-referenced with a small mosaic offset, and does not fit sphere- or ellipsoid-referenced heights, which would differ by far more. This is an inference (`model_derived`), not a verified reference. Per plan 5.3 and 7.4, the control-point comparison at G1 decides it.

**Flag for Data and Science (D-05):** if D1 heights are relative to the areoid, then plan 7.3 step 1 (`X = (R + h)...` on the 3,396,190 m sphere) places points off by the local areoid-sphere separation. The plan already expects this to show up in the 7.4 residuals; it is raised here so it is not mistaken for a horizontal error.

## D2 - MSL Gale colour orthophoto COG (USGS)

| Item | Finding | Matches plan 5.2? |
|---|---|---|
| File | `mosaic/Mars/MSL/MSL_Gale_HiRISE-LRGB_78quads_sharp_cog.tif` (authors T. J. Parker and F. J. Calef III; JPEG-compressed COG for streaming) | Yes (the "1 GB COG added July 2025") |
| Size | 36,000 x 76,000 px, 3 x uint8, 0.25 m, 512 px blocks, overviews 2-257 (8 levels), `LAYOUT=COG`, YCbCr JPEG quality 85 | Yes |
| CRS | Equirectangular on the 3,396,190 m sphere | Yes (same as D1) |
| Footprint | 137.3267-137.4786 E, 4.5551-4.8756 S | Yes (137.327-137.479 E, 4.555-4.876 S) |
| Demo area | Inside the footprint; a 300 x 300 sample of the area has 0% empty pixels | PASS |
| Licence / use | Orthophoto product page: "Please credit authors"; "Use Constraints: None" | Not stated in part 1 |

## D12 - MOLA-HRSC blended DEM, global 200 m, v2 (USGS)

| Item | Finding | Plan 5.2 said |
|---|---|---|
| File | `mosaic/Mars/HRSC_MOLA_Blend/Mars_HRSC_MOLA_BlendDEM_Global_200mp_v2.tif`, 11,384,463,908 bytes | 200 m, USGS download |
| Body shape | Sphere, equatorial = polar radius = 3,396,190 m (ISIS label and GeoTIFF) | "Sphere or ellipsoid: UNVERIFIED". **Now read: sphere.** |
| Latitude / longitude | Planetocentric, positive east, longitude domain -180 to 180 | Consistent with C-05 |
| Grid | 106,694 x 53,347, int16, NoData -32768, 200 m (296.3735 px/deg), `AREA_OR_POINT=Area` | Yes |
| Vertical reference | Not stated in the header | Still UNVERIFIED |

## Not checked in this part

- D3 (Cesium Mars): not the default; it depends on R-04 / D-02.
- D4, D6, D7, D9, D10, D11, D13: no pipeline grids depend on them at G1.
- D5 (rover traverse, MMGIS): host not on the session's allow-list.
- Section 19 of the plan (part 2): not available to this session.
- QGIS-based checks: QGIS is not installed.
