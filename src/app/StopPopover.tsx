// SI-assisted: drafted with Claude Code (Claude Opus 5.5) on design/sharpwalk-ui-ux (UI-11); human Design review pending.
// Point and click: clicking a stop on the map opens this card, pinned to the stop. It shows the stop's numbers (each a
// Quantity that opens its source) and offers the actions a planner reaches for: rename, move by clicking a new place,
// delete. Every change is a Command to the engine through the callbacks; nothing here edits the plan.
import { useEffect, useRef, useState } from "react";
import { Move, Trash2, X } from "lucide-react";
import type { Quantity, Stop } from "../contracts";
import type { PlanOutput } from "../engine/planner";
import { STOP_LIMITS } from "../engine/assumptions";
import { QuantityText } from "./QuantityText";

export function StopPopover({ stop, output, onOpenSource, onClose, onMove, onDelete, onEdit }: {
  stop: Stop; output: PlanOutput; onOpenSource: (q: Quantity) => void; onClose: () => void; onMove: () => void; onDelete: () => void;
  onEdit: (name: string, tasks: string[]) => void;
}) {
  const [name, setName] = useState(stop.name);
  const sent = useRef(stop.name); // Enter then blur must not send the same rename twice before the engine answers
  useEffect(() => { setName(stop.name); sent.current = stop.name; }, [stop.name]);
  const commit = () => { const n = name.trim(); if (n && n !== stop.name && n !== sent.current) { sent.current = n; onEdit(n, stop.tasks); } };
  const inbound = output.plan.legs.find((l) => l.toId === stop.id);
  return (
    <div className="pop" role="dialog" aria-label={`Stop ${stop.letter}`} data-testid="stop-popover">
      <div className="pop-head">
        <span className="letter" aria-hidden="true">{stop.letter}</span>
        <form onSubmit={(e) => { e.preventDefault(); commit(); }}>
          <input aria-label={`Stop ${stop.letter} name, on the map`} value={name} maxLength={STOP_LIMITS.nameChars} onChange={(e) => setName(e.target.value)}
            onBlur={commit} />
        </form>
        <button type="button" className="pop-x" onClick={onClose} aria-label="Close stop card"><X size={15} strokeWidth={2} /></button>
      </div>
      <dl className="pop-facts">
        <div><dt>Time at stop</dt><dd><QuantityText q={stop.duration} onOpen={onOpenSource} label={`Stop ${stop.letter} duration`} /></dd></div>
        {inbound && <div><dt>Walk in</dt><dd><QuantityText q={inbound.time} onOpen={onOpenSource} label={`Walking time to ${stop.letter}`} /></dd></div>}
      </dl>
      <div className="pop-acts">
        <button type="button" className="key small" onClick={onMove}><Move size={15} strokeWidth={2} aria-hidden="true" />Move</button>
        <button type="button" className="key small danger" onClick={onDelete}><Trash2 size={15} strokeWidth={2} aria-hidden="true" />Delete</button>
      </div>
    </div>
  );
}
