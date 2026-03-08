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
  c.innerHTML = ""; // Nettoyage avant chaque rendu (évite les doublons)

  const soldes = livretComputeSoldes();

  // ── Grille des 4 enveloppes ───────────────────────────────────────────────
  const envGrid = document.createElement("div");
  envGrid.className = "env-grid";

  D.livretEnveloppes.forEach((env, i) => {
    const solde  = soldes[env.id] || 0;
    const isNeg  = solde < 0;
    const color  = isNeg ? "#e05050" : env.color;

    const card = document.createElement("div");
    card.className = "env-card";
    card.style.animationDelay = (i * 0.07) + "s";
    if (isNeg) {
      card.style.background   = "#e0505012";
      card.style.borderColor  = "#e0505044";
    }
    card.innerHTML = `
      <div class="env-card-header">
        <div class="env-card-name">
          <span class="env-card-dot" style="background:${color}"></span>
          ${env.name}
          ${isNeg ? `<span style="color:#e05050;font-size:14px;line-height:1;margin-left:4px">⚠</span>` : ""}
        </div>
        <button class="env-info-btn" title="${env.desc || 'Info'}">?</button>
      </div>
      <div class="env-card-body">
        <div class="env-card-solde" style="color:${color}">${eur(solde)}</div>
      </div>`;
    envGrid.appendChild(card);

    // Bouton info → modale description
    card.querySelector(".env-info-btn").addEventListener("click", () => {
      const overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;inset:0;background:#00000088;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px";
      overlay.innerHTML = `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;max-width:360px;width:100%">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
            <span style="width:10px;height:10px;border-radius:50%;background:${env.color};display:inline-block;flex-shrink:0"></span>
            <span style="font-family:var(--font-head);font-weight:700;font-size:15px">${env.name}</span>
          </div>
          <p style="font-size:13px;color:var(--text2);line-height:1.6">${env.desc || "—"}</p>
          <div style="margin-top:20px;text-align:right">
            <button class="btn btn-ghost btn-sm" id="env-info-close">Fermer</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
      overlay.querySelector("#env-info-close").addEventListener("click", () => overlay.remove());
    });
  });
  c.appendChild(envGrid);

  // ── Card Mouvements ───────────────────────────────────────────────────────
  const tableCard = document.createElement("div");
  tableCard.className = "card";

  // Titre + bouton
  const tableTitle = document.createElement("div");
  tableTitle.className = "card-title";
  tableTitle.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:10px";
  tableTitle.innerHTML = `
    <span>Mouvements</span>
    <button class="btn btn-ghost btn-sm" id="livret-add-mvt-btn" style="display:inline-flex;align-items:center">
      <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="margin-right:4px;flex-shrink:0"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      Ajouter un mouvement
    </button>`;
  tableCard.appendChild(tableTitle);

  const tableWrap = document.createElement("div");
  tableWrap.style.overflowX = "auto";
  tableCard.appendChild(tableWrap);

  const renderMvtTable = () => {
    const filtered = [...D.livretMouvements];
    const envCols = D.livretEnveloppes;
    const currentSoldes = livretComputeSoldes();

    tableWrap.innerHTML = `
      <table class="mvt-table">
        <thead><tr>
          <th style="text-align:center">Date</th>
          <th style="text-align:center">Libellé</th>
          ${envCols.map(e => `<th style="color:${e.color};text-align:center">${e.name}</th>`).join("")}
          <th></th>
        </tr></thead>
        <tbody>
          ${filtered.map((mvt) => {
            const realIdx = D.livretMouvements.indexOf(mvt);
            return `<tr>
              <td class="mvt-date" style="text-align:center">${mvt.date || "—"}</td>
              <td style="color:var(--text);text-align:center">${mvt.label}</td>
              ${envCols.map(env => {
                const add = mvt[env.id + "_add"] || 0;
                const ret = mvt[env.id + "_ret"] || 0;
                const net = add - ret;
                if (!net) return `<td></td>`;
                const color = net > 0 ? "var(--gain)" : "var(--loss)";
                const sign = net > 0 ? "+" : "−";
                return `<td style="color:${color};font-family:var(--font-mono);font-size:12.5px;text-align:center;font-variant-numeric:tabular-nums">${sign} ${eur(Math.abs(net))}</td>`;
              }).join("")}
              <td>
                <button class="budget-del-btn" data-idx="${realIdx}" title="Supprimer">
                  <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </td>
            </tr>`;
          }).join("")}
        </tbody>
        <tfoot><tr>
          <td colspan="2" style="text-align:center">Soldes calculés</td>
          ${envCols.map(env => {
            const s = currentSoldes[env.id] || 0;
            return `<td style="color:${env.color};font-family:var(--font-mono);font-size:12.5px;text-align:center;font-variant-numeric:tabular-nums">${eur(s)}</td>`;
          }).join("")}
          <td></td>
        </tr></tfoot>
      </table>`;

    tableWrap.querySelectorAll(".budget-del-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        confirmModal("Êtes-vous sûr de vouloir supprimer ce mouvement ?", "", () => {
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

  // Bouton → modale
  document.getElementById("livret-add-mvt-btn").addEventListener("click", () => {
    livretOpenMvtModal(c);
  });
}

// ── Modale ajout de mouvement ─────────────────────────────────────────────────
function livretOpenMvtModal(c) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:#00000088;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px";

  const modal = document.createElement("div");
  modal.style.cssText = "background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:24px;width:100%;max-width:580px;max-height:90vh;overflow-y:auto";
  modal.innerHTML = `
    <div style="font-family:var(--font-head);font-weight:700;font-size:16px;margin-bottom:18px">
      Nouveau mouvement
    </div>
    <div class="dep-form-grid" style="grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
      <div class="form-group">
        <label>Date</label>
        <input class="form-input" type="date" id="mvt-date" style="color-scheme:dark" value="${new Date().toISOString().slice(0,10)}">
      </div>
      <div class="form-group">
        <label>Libellé</label>
        <input class="form-input" id="mvt-label" placeholder="Ex: Virements du mois">
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:18px">
      ${D.livretEnveloppes.map(env => `
        <div style="border:1px solid ${env.color}33;border-radius:8px;padding:12px">
          <div style="font-size:11px;font-weight:600;color:${env.color};margin-bottom:10px;display:flex;align-items:center;gap:6px">
            <span style="width:8px;height:8px;border-radius:50%;background:${env.color};display:inline-block;flex-shrink:0"></span>
            ${env.name}
          </div>
          <div class="form-group" style="margin:0">
            <label style="font-size:11px;color:var(--text3)">Montant (€) — positif ou négatif</label>
            <input class="form-input" type="number" step="0.01" id="mvt-${env.id}" placeholder="0">
          </div>
        </div>`).join("")}
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost btn-sm" id="mvt-cancel">Annuler</button>
      <button class="btn btn-primary btn-sm" id="mvt-save">Enregistrer</button>
    </div>`;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  modal.querySelector("#mvt-cancel").addEventListener("click", close);

  modal.querySelector("#mvt-save").addEventListener("click", () => {
    const date  = modal.querySelector("#mvt-date").value;
    const label = modal.querySelector("#mvt-label").value.trim();
    if (!label) return toast("Libellé requis");

    const mvt = { date, label };
    let hasValue = false;
    D.livretEnveloppes.forEach(env => {
      const val = parseFloat(modal.querySelector(`#mvt-${env.id}`).value) || 0;
      if (val > 0) { mvt[env.id + "_add"] = val;  hasValue = true; }
      if (val < 0) { mvt[env.id + "_ret"] = -val; hasValue = true; }
    });
    if (!hasValue) return toast("Saisir au moins un montant");

    D.livretMouvements.push(mvt);
    D.livretMouvements.sort((a, b) => a.date.localeCompare(b.date));
    saveData();
    close();
    livret(c);
    toast("Mouvement enregistré ✓");
  });

  // Focus libellé
  setTimeout(() => modal.querySelector("#mvt-label").focus(), 50);
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
    const content = document.getElementById("content");
    livret(content);
    toast("Enveloppe mise à jour ✓");
  });
}
