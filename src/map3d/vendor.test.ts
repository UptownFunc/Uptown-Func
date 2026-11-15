// SI-assisted: drafted with Claude Code (Claude Opus 5.5) (B-02); human review pending.
// The vendor path the page loads, the copied build and the pinned dependency must name the same CesiumJS version.
import { describe, expect, it } from "vitest";
import pkgRaw from "../../package.json?raw";
import { CESIUM_DIR, CESIUM_VERSION } from "./vendor";

describe("B-02 CesiumJS vendor", () => {
  it("loads the version package.json pins (exact, no range), from a versioned folder", () => {
    const pkg = JSON.parse(pkgRaw) as { dependencies: Record<string, string> };
    expect(pkg.dependencies.cesium).toBe(CESIUM_VERSION);
    expect(CESIUM_VERSION).toBe("1.147.0"); // the plan's stack (CLAUDE.md)
    expect(CESIUM_DIR).toBe("cesium-1.147.0/");
  });
});
