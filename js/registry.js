// js/registry.js - Module registry for extensible sub-projects
// To add a new sub-project (e.g. scoreboard):
//   1. Create js/modules/scoreboard.js
//   2. Import it in js/app.js:  import "./modules/scoreboard.js";
//   3. Done - sidebar nav and view section auto-generate.

const _modules = [];

export function register(config) {
  if (!config || !config.id) {
    console.error("[registry] Module must have an id:", config);
    return;
  }
  if (_modules.find(m => m.id === config.id)) {
    console.warn(`[registry] Module "${config.id}" already registered, skipping`);
    return;
  }
  _modules.push(config);
}

export function list() {
  return [..._modules].sort((a, b) => (a.order || 99) - (b.order || 99));
}

export function get(id) {
  return _modules.find(m => m.id === id);
}

export function count() {
  return _modules.length;
}