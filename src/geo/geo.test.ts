// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Data and Science review pending.
// Plan 7.3: F1 -> F5 -> F6 on the F1 sphere (R = 3,396,190 m). The formulas are the test oracle.
import { describe, expect, it } from "vitest";
import { R_F1, f1, f1ToF5, f5ToF1, f5ToF6, f6ToF5, localFrame } from "./index";

const close = (a: number, b: number, tol: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(tol);

describe("F1 -> F5", () => {
  it("uses the plan's sphere radius", () => expect(R_F1).toBe(3_396_190));

  it("maps the axes", () => {
    const p = f1ToF5(f1(0, 0, 10));
    close(p.x, R_F1 + 10, 1e-6); close(p.y, 0, 1e-6); close(p.z, 0, 1e-6);
    const q = f1ToF5(f1(90, 0, 0));
    close(q.z, R_F1, 1e-6);
  });

  it("matches the Python pipeline origin (pipeline/sharpwalk/geo.py, 1.2 build report)", () => {
    const p = f1ToF5(f1(-4.815, 137.39, -3506.337));
    close(p.x, -2488131.803, 1e-3); close(p.y, 2288756.065, 1e-3); close(p.z, -284777.53, 1e-3);
  });

  it("round-trips through F5 back to F1", () => {
    const a = f1(-4.8123, 137.4011, -3600.5);
    const b = f5ToF1(f1ToF5(a));
    close(b.lat, a.lat, 1e-10); close(b.lon, a.lon, 1e-10); close(b.h, a.h, 1e-6);
  });
});

describe("F1 validation", () => {
  it("rejects latitude outside -90..90 and longitude outside -180..180", () => {
    expect(() => f1(91, 0, 0)).toThrow();
    expect(() => f1(0, 181, 0)).toThrow();
    expect(() => f1(Number.NaN, 0, 0)).toThrow();
  });
});

describe("F5 -> F6", () => {
  const origin = localFrame(f1(-4.815, 137.39, -3500));

  it("puts the origin at zero", () => {
    const o = f5ToF6(f1ToF5(f1(-4.815, 137.39, -3500)), origin);
    close(o.e, 0, 1e-6); close(o.n, 0, 1e-6); close(o.u, 0, 1e-6);
  });

  it("points east, north and up", () => {
    const e = f5ToF6(f1ToF5(f1(-4.815, 137.391, -3500)), origin);
    const n = f5ToF6(f1ToF5(f1(-4.814, 137.39, -3500)), origin);
    const u = f5ToF6(f1ToF5(f1(-4.815, 137.39, -3475)), origin);
    expect(e.e).toBeGreaterThan(0); close(e.n, 0, 1e-3);
    expect(n.n).toBeGreaterThan(0); close(n.e, 0, 1e-3);
    close(u.u, 25, 1e-6);
  });

  it("is metric: 0.001 deg of latitude is R * pi/180e3 of arc", () => {
    const n = f5ToF6(f1ToF5(f1(-4.814, 137.39, -3500)), origin);
    close(Math.hypot(n.n, n.u), (R_F1 - 3500) * 2 * Math.sin((0.001 * Math.PI) / 360), 1e-6);
  });

  it("round-trips through F6 back to F5", () => {
    const p = f1ToF5(f1(-4.83, 137.41, -3300));
    const back = f6ToF5(f5ToF6(p, origin), origin);
    close(back.x, p.x, 1e-6); close(back.y, p.y, 1e-6); close(back.z, p.z, 1e-6);
  });

  it("tags every point with its frame", () => {
    expect(f1(0, 0, 0).frame).toBe("F1");
    expect(f1ToF5(f1(0, 0, 0)).frame).toBe("F5");
    expect(f5ToF6(f1ToF5(f1(-4.815, 137.39, -3500)), origin).frame).toBe("F6");
  });
});
