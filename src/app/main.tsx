// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Design review pending.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "ol/ol.css";
import "./fonts.css";
import "./styles.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
