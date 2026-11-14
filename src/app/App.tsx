// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
// Tier 1 shell: the AREA sheet is the largest, brightest surface (plan 9). Every view carries the footer.
import { AreaSheet } from "../map/AreaSheet";

export function App() {
  return (
    <div className="housing">
      <header className="titlebar">
        <span className="wordmark">SharpWalk</span>
        <span className="muted">AREA sheet - slope-screened only, no rock detection</span>
      </header>
      <main className="well">
        <AreaSheet dataUrl="area/" />
      </main>
      <footer className="footer">Independent student project; not affiliated with or endorsed by NASA.</footer>
    </div>
  );
}
