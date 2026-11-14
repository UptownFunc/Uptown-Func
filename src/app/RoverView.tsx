// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// D6 rover point of view (Tier 1): Curiosity's view of similar boxwork terrain, with sol, camera, date and credit.
import { roverCaption, type RoverImages } from "./rover";

export function RoverView({ data, compact = false }: { data: RoverImages | "failed" | null; compact?: boolean }) {
  if (data === null) return null;
  if (data === "failed") return <p className="unknown" data-testid="rover-view">Rover views (D6) unavailable.</p>;
  return (
    <section className={compact ? "rover rover-compact" : "rover"} aria-label="Rover point of view" data-testid="rover-view">
      {!compact && <h2>Rover point of view <span className="sub">Similar terrain, not the demo stops</span></h2>}
      <div className="rover-strip">
        {data.images.map((i) => (
          <figure key={i.file}>
            <img src={`rover/${i.file}`} alt={`Curiosity Navcam view of boxwork terrain, sol ${i.sol}`} loading={compact ? "eager" : "lazy"} />
            <figcaption className="small">{roverCaption(i)}</figcaption>
          </figure>
        ))}
      </div>
      <p className={compact ? "small" : "note"}>D6: {data.label}. Raw images, downscaled.</p>
    </section>
  );
}
