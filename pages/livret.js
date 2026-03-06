// ─── LIVRET ───────────────────────────────────────────────────────────────────
// Méthode des enveloppes : Matelas · Économies · Factures · Projets
// Chaque enveloppe est un "compte virtuel" à l'intérieur du livret réel

// ── Helpers ──────────────────────────────────────────────────────────────────

function livretComputeSoldes() {
  // Recalcule les soldes de chaque enveloppe à partir des mouvements
  const soldes = {};
  D.livretEnveloppes.forEach(e => soldes[e.id] = 0);

  D.livretMouvements.forEach(mvt => {
    D.livretEnveloppes.forEach(e => {
      const add = mvt[e.id + "_add"] || 0;
      const ret = mvt[e.id + "_ret"] || 0;
      soldes[e.id] += add - ret;
    });
  });

  return soldes;
}

function livretTotalLivret() {
  const soldes = livretComputeSoldes();
  return Object.values(soldes).reduce((s, v) => s + v, 0);
}

// ── Rendu principal ───────────────────────────────────────────────────────────

function livret(c) {
  const soldes = livretComputeSoldes();
  const totalLivret = Object.values(soldes).reduce((s, v) => s + v, 0);

  // ── Résumé total + bouton ajouter ────────────────────────────────────────
  const headerCard = document.createElement("div");
  headerCard.className = "card";
  headerCard.style.padding = "14px 20px";
  headerCard.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
      <div>
        <div style="font-size:11px;color:var(--text3);margin-bottom:3px">Total livrets (toutes enveloppes)</div>
        <div style="font-family:var(--font-mono);font-size:22px;font-weight:500;color:var(--amber)">${eur(totalLivret)}</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-ghost btn-sm" id="livret-add-mvt-btn">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="margin-right:4px"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Ajouter un mouvement
        </button>
      </div>
    </div>`;
  c.appendChild(headerCard);

  // ── Grille des 4 enveloppes ───────────────────────────────────────────────
  const envGrid = document.createElement("div");
  envGrid.className = "env-grid";

  D.livretEnveloppes.forEach((env, i) => {
    const solde = soldes[env.id] || 0;
    const hasObjectif = env.objectif > 0;
    const pct = hasObjectif ? Math.min(100, solde / env.objectif * 100) : 100;

    const card = document.createElement("div");
    card.className = "env-card";
    card.style.animationDelay = (i * 0.07) + "s";
    card.innerHTML = `
      <div class="env-card-header">
        <div class="env-card-name">
          <span class="env-card-dot" style="background:${env.color}"></span>
          ${env.name}
        </div>
        <div class="env-card-desc">${env.desc}</div>
      </div>
      <div class="env-card-body">
        <div class="env-card-solde" style="color:${env.color}">${eur(solde)}</div>
        ${hasObjectif ? `
          <div class="env-card-objectif">Objectif : ${eur(env.objectif)} — ${pct.toFixed(0)}%
            ${solde >= env.objectif ? ' <span style="color:var(--gain);font-weight:600">✓</span>' : ''}
          </div>
          <div class="env-progress-bg">
            <div class="env-progress-fg" style="width:${pct.toFixed(1)}%;background:${env.color}"></div>
          </div>` :
          `<div class="env-card-objectif" style="color:var(--text3)">Pas d'objectif fixé</div>
           <div class="env-progress-bg"><div class="env-progress-fg" style="width:100%;background:${env.color};opacity:.3"></div></div>`
        }
        <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" style="font-size:10px;padding:3px 8px"
            onclick="livretEditEnv(${i})">⚙ Objectif</button>
        </div>
      </div>`;
    envGrid.appendChild(card);
  });
  c.appendChild(envGrid);

  // ── Formulaire ajout mouvement ────────────────────────────────────────────
  const addMvtForm = document.createElement("div");
  addMvtForm.className = "card dep-add-form";
  addMvtForm.id = "livret-mvt-form";
  addMvtForm.innerHTML = `
    <div class="card-title" style="margin-bottom:10px">Nouveau mouvement</div>
    <div class="dep-form-grid" style="grid-template-columns:1fr 1fr 1fr;gap:10px">
      <div class="form-group">
        <label>Date</label>
        <input class="form-input" type="date" id="mvt-date" style="color-scheme:dark" value="${new Date().toISOString().slice(0,10)}">
      </div>
      <div class="form-group" style="grid-column:span 2">
        <label>Libellé</label>
        <input class="form-input" id="mvt-label" placeholder="Ex: Virements du mois">
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:4px">
      ${D.livretEnveloppes.map(env => `
        <div style="border:1px solid ${env.color}33;border-radius:8px;padding:10px">
          <div style="font-size:10px;font-weight:600;color:${env.color};margin-bottom:8px">${env.name}</div>
          <div class="form-group" style="margin-bottom:6px">
            <label>+ Ajout (€)</label>
            <input class="form-input" type="number" step="0.01" id="mvt-${env.id}-add" placeholder="0">
          </div>
          <div class="form-group">
            <label>− Retrait (€)</label>
            <input class="form-input" type="number" step="0.01" id="mvt-${env.id}-ret" placeholder="0">
          </div>
        </div>`).join("")}
    </div>
    <div class="form-actions" style="margin-top:14px">
      <button class="btn btn-ghost btn-sm" id="mvt-cancel">Annuler</button>
      <button class="btn btn-primary btn-sm" id="mvt-save">Enregistrer le mouvement</button>
    </div>`;
  c.appendChild(addMvtForm);

  document.getElementById("livret-add-mvt-btn").addEventListener("click", () => {
    addMvtForm.classList.toggle("open");
  });
  document.getElementById("mvt-cancel").addEventListener("click", () => {
    addMvtForm.classList.remove("open");
  });
  document.getElementById("mvt-save").addEventListener("click", () => {
    const date  = document.getElementById("mvt-date").value;
    const label = document.getElementById("mvt-label").value.trim();
    if (!label) return toast("Libellé requis");

    const mvt = { date, label };
    let hasValue = false;
    D.livretEnveloppes.forEach(env => {
      const add = parseFloat(document.getElementById(`mvt-${env.id}-add`).value) || 0;
      const ret = parseFloat(document.getElementById(`mvt-${env.id}-ret`).value) || 0;
      if (add) { mvt[env.id + "_add"] = add; hasValue = true; }
      if (ret) { mvt[env.id + "_ret"] = ret; hasValue = true; }
    });
    if (!hasValue) return toast("Saisir au moins un montant");

    D.livretMouvements.push(mvt);
    // Trier par date
    D.livretMouvements.sort((a, b) => a.date.localeCompare(b.date));
    saveData();
    addMvtForm.classList.remove("open");
    livret(c); // Re-render
    toast("Mouvement enregistré ✓");
  });

  // ── Tableau des mouvements (par enveloppe ou tous) ────────────────────────
  const tableCard = document.createElement("div");
  tableCard.className = "card";

  // Filtres tabs
  const tabs = [{ id: "tous", label: "Tous" }, ...D.livretEnveloppes.map(e => ({ id: e.id, label: e.name, color: e.color }))];
  let activeTab = "tous";

  const tabRow = document.createElement("div");
  tabRow.className = "livret-tab-row";
  tabs.forEach(tab => {
    const btn = document.createElement("button");
    btn.className = "livret-tab" + (tab.id === activeTab ? " active" : "");
    btn.textContent = tab.label;
    if (tab.color) btn.style.setProperty("--tab-color", tab.color);
    btn.addEventListener("click", () => {
      activeTab = tab.id;
      renderMvtTable();
    });
    tabRow.appendChild(btn);
  });

  const tableTitle = document.createElement("div");
  tableTitle.className = "card-title";
  tableTitle.textContent = "Mouvements";
  tableCard.appendChild(tableTitle);
  tableCard.appendChild(tabRow);

  const tableWrap = document.createElement("div");
  tableWrap.style.overflowX = "auto";
  tableCard.appendChild(tableWrap);

  const renderMvtTable = () => {
    // Màj tabs actifs
    tabRow.querySelectorAll(".livret-tab").forEach(btn => {
      const id = tabs.find(t => t.label === btn.textContent)?.id;
      btn.classList.toggle("active", id === activeTab);
    });

    const filtered = activeTab === "tous"
      ? [...D.livretMouvements]
      : D.livretMouvements.filter(m => m[activeTab + "_add"] || m[activeTab + "_ret"]);

    // Colonnes selon filtre
    const envCols = activeTab === "tous"
      ? D.livretEnveloppes
      : D.livretEnveloppes.filter(e => e.id === activeTab);

    tableWrap.innerHTML = `
      <table class="mvt-table">
        <thead><tr>
          <th>Date</th>
          <th>Libellé</th>
          ${envCols.map(e => `
            <th style="color:${e.color}" colspan="2">${e.name}</th>`).join("")}
          <th></th>
        </tr>
        <tr>
          <th></th><th></th>
          ${envCols.map(() => `<th style="color:var(--gain)">+ Ajout</th><th style="color:var(--loss)">− Retrait</th>`).join("")}
          <th></th>
        </tr></thead>
        <tbody>
          ${filtered.map((mvt, i) => {
            const realIdx = D.livretMouvements.indexOf(mvt);
            return `<tr>
              <td class="mvt-date">${mvt.date || "—"}</td>
              <td style="color:var(--text)">${mvt.label}</td>
              ${envCols.map(env => `
                <td class="mvt-add">${mvt[env.id + "_add"] ? eur(mvt[env.id + "_add"]) : ""}</td>
                <td class="mvt-ret">${mvt[env.id + "_ret"] ? eur(mvt[env.id + "_ret"]) : ""}</td>`).join("")}
              <td>
                <button class="dep-inline-btn del" data-idx="${realIdx}" title="Supprimer" style="opacity:0.4">
                  <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </td>
            </tr>`;
          }).join("")}
        </tbody>
        <tfoot><tr>
          <td colspan="2">Soldes calculés</td>
          ${envCols.map(env => {
            const s = soldes[env.id] || 0;
            return `<td class="mvt-add" colspan="2" style="color:${env.color}">${eur(s)}</td>`;
          }).join("")}
          <td></td>
        </tr></tfoot>
      </table>`;

    // Suppression
    tableWrap.querySelectorAll(".dep-inline-btn.del").forEach(btn => {
      btn.addEventListener("mouseenter", () => btn.style.opacity = "1");
      btn.addEventListener("mouseleave", () => btn.style.opacity = "0.4");
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        const label = D.livretMouvements[idx]?.label;
        confirmModal(`Supprimer "<strong>${label}</strong>" ?`, "Ce mouvement sera définitivement supprimé.", () => {
          D.livretMouvements.splice(idx, 1);
          saveData();
          livret(c);
          toast("Mouvement supprimé");
        });
      });
    });
  };

  renderMvtTable();
  c.appendChild(tableCard);
}

// ── Édition objectif d'une enveloppe ─────────────────────────────────────────
function livretEditEnv(idx) {
  const env = D.livretEnveloppes[idx];
  const overlay = document.createElement("div");
  overlay.className = "credit-form-overlay";
  overlay.style.cssText = "position:fixed;inset:0;background:#00000080;z-index:1000;display:flex;align-items:center;justify-content:center";

  overlay.innerHTML = `
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;min-width:320px;max-width:420px;width:90%">
      <div style="font-family:var(--font-head);font-weight:700;font-size:16px;margin-bottom:16px;display:flex;align-items:center;gap:8px">
        <span style="width:10px;height:10px;border-radius:50%;background:${env.color};display:inline-block"></span>
        ${env.name}
      </div>
      <div class="form-group" style="margin-bottom:12px">
        <label>Objectif (€) — 0 = sans objectif</label>
        <input class="form-input" type="number" step="100" id="env-objectif" value="${env.objectif}">
      </div>
      <div class="form-group" style="margin-bottom:16px">
        <label>Description</label>
        <input class="form-input" id="env-desc" value="${env.desc}">
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost btn-sm" id="env-cancel">Annuler</button>
        <button class="btn btn-primary btn-sm" id="env-save">Enregistrer</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
  document.getElementById("env-cancel").addEventListener("click", () => overlay.remove());
  document.getElementById("env-save").addEventListener("click", () => {
    const obj = parseFloat(document.getElementById("env-objectif").value) || 0;
    const desc = document.getElementById("env-desc").value.trim();
    D.livretEnveloppes[idx].objectif = obj;
    D.livretEnveloppes[idx].desc = desc;
    saveData();
    overlay.remove();
    // Re-render la page
    const content = document.getElementById("content");
    content.innerHTML = "";
    livret(content);
    toast("Enveloppe mise à jour ✓");
  });
}
