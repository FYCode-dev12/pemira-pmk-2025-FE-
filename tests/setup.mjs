// Test setup for running browser-oriented modules under `node --test`.
// - Lets plain `import data from "./file.json"` (as Vite allows) load in Node
//   by turning JSON files into ES modules.
// - Provides minimal in-memory sessionStorage/localStorage.
import { registerHooks } from "node:module";
import { readFileSync } from "node:fs";

registerHooks({
  load(url, context, nextLoad) {
    if (url.startsWith("file:") && url.endsWith(".json")) {
      return {
        format: "module",
        source: `export default ${readFileSync(new URL(url), "utf8")};`,
        shortCircuit: true,
      };
    }
    return nextLoad(url, context);
  },
});

class MemoryStorage {
  #data = new Map();
  getItem(key) {
    return this.#data.has(key) ? this.#data.get(key) : null;
  }
  setItem(key, value) {
    this.#data.set(key, String(value));
  }
  removeItem(key) {
    this.#data.delete(key);
  }
  clear() {
    this.#data.clear();
  }
}

globalThis.sessionStorage = new MemoryStorage();
globalThis.localStorage = new MemoryStorage();
