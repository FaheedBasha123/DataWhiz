// router.js — Hash-based navigation for module views
let views = [];

export function registerView(id) {
  if (!views.includes(id)) views.push(id);
}

export function currentView() {
  const h = (location.hash || "").replace("#", "");
  return views.includes(h) ? h : (views[0] || "");
}

function show(name) {
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v.id === `view-${name}`));
  document.querySelectorAll(".nav a").forEach(a => a.classList.toggle("active", a.dataset.view === name));
  window.scrollTo({ top: 0, behavior: "instant" });
  document.dispatchEvent(new CustomEvent("viewchange", { detail: name }));
}

export function navigate(view) {
  if (!views.includes(view)) view = views[0];
  if (location.hash !== "#" + view) location.hash = view;
}

export function initRouter() {
  show(currentView());
  window.addEventListener("hashchange", () => show(currentView()));
  document.querySelectorAll(".nav a").forEach(a => {
    a.addEventListener("click", e => { e.preventDefault(); navigate(a.dataset.view); });
  });
}

export { views };