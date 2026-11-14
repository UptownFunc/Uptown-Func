// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// Main-thread handle to the engine worker. The console only sends Commands through this handle.
// The Comlink proxy is kept inside a plain object: assigning onto the proxy would post a message to the worker.
import * as Comlink from "comlink";
import type { EngineApi } from "./worker";

export interface EngineClient { readonly api: Comlink.Remote<EngineApi>; terminate(): void }

export function createEngine(): EngineClient {
  const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  return { api: Comlink.wrap<EngineApi>(worker), terminate: () => worker.terminate() };
}
