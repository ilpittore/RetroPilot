// ═══════════════════════════════════════════════════════════════
// MAIN — Point d'entrée, navigation, init
// Chargé en dernier, après tous les modules
// ═══════════════════════════════════════════════════════════════

// render() défini ici car il référence toutes les fonctions de pages
// qui ne sont disponibles qu'une fois tous les scripts chargés
function render() {
  const c = document.getElementById("content");
  c.innerHTML = "";
  const pages = { dashboard, patrimoine, budget, livret, virements, investissements, credits, analyse, parametres };
  if (pages[currentPage]) pages[currentPage](c);
  if (D.lastUpdated) document.getElementById("sidebar-footer").textContent = "Dernière MAJ : " + D.lastUpdated;
}

// Navigation par clic sur la sidebar
document.querySelectorAll(".nav-item[data-page]").forEach(el => {
  el.addEventListener("click", () => navigate(el.dataset.page));
});

// ── Init ──────────────────────────────────────────────────────────────────
render();
if (D.lastUpdated) {
  document.getElementById("sidebar-footer").textContent = "Dernière MAJ : " + D.lastUpdated;
}
window.addEventListener("resize", () => {
  if (currentPage === "dashboard") render();
});
