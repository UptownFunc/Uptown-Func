// SI-assisted: drafted with Claude Code (Claude Opus 5.5); human Route Engine review pending.
// Main-thread handle to the engine worker. The console only sends Commands through this handle.
// The Comlink proxy is kept inside a plain object: assigning onto the proxy would post a message to the worker.
import * as Comlink from "comlink";
import type { EngineApi } from "./worker";

export interface EngineClient { readonly api: Comlink.Remote<EngineApi>; terminate(): void }

/** In the build the worker is the `engine-worker` entry of vite.config.ts (it shares one chunk with the page, B-01);
 *  the dev server serves the module itself. Both are module workers. */
const WORKER_URL = import.meta.env.DEV ? "/src/engine/worker.ts" : `${import.meta.env.BASE_URL}engine-worker.js`;

export function createEngine(): EngineClient {
  const worker = new Worker(new URL(WORKER_URL, location.origin), { type: "module" });
  return { api: Comlink.wrap<EngineApi>(worker), terminate: () => worker.terminate() };
}
