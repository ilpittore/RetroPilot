// ─── PATRIMOINE ──────────────────────────────────────────────────────────────

function patrimoine(c) {

  // ── Helper ──────────────────────────────────────────────────────────────────

  function sectionHeader(label) {
    const h = document.createElement("div");
    h.style.cssText = "display:flex;align-items:center;gap:10px;margin:28px 0 14px";
    h.innerHTML = `
      <div style="width:3px;height:14px;border-radius:2px;background:var(--amber);flex-shrink:0"></div>
      <span style="font-family:var(--font-head);font-weight:700;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text3)">${label}</span>
      <div style="flex:1;height:1px;background:var(--border)"></div>`;
    return h;
  }

  // ── 2-column layout ─────────────────────────────────────────────────────────

  const layout   = document.createElement("div"); layout.className = "pat-layout";
  const leftCol  = document.createElement("div");
  layout.appendChild(leftCol);
  c.appendChild(layout);

  // ═══════════════════════════════════════════════════════════════════════════
  // LEFT — all editable tables
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Liquidités ─────────────────────────────────────────────────────────────

  const liqHeader = sectionHeader("Liquidités");
  liqHeader.style.marginTop = "0";
  leftCol.appendChild(liqHeader);

  const liqGrid = document.createElement("div"); liqGrid.className = "grid-3";
  liqGrid.appendChild(buildAccountTable("compteCourants",   "Comptes courants"));
  liqGrid.appendChild(buildAccountTable("livrets",          "Livrets d'épargne"));
  liqGrid.appendChild(buildAccountTable("liquiditesInvest", "Liquidités invest."));
  leftCol.appendChild(liqGrid);

  // ── Plans d'épargne ────────────────────────────────────────────────────────

  leftCol.appendChild(sectionHeader("Plans d'épargne"));
  leftCol.appendChild(buildAccountTable("plansEpargne", "Plans d'épargne"));

  // ── Immobilier ─────────────────────────────────────────────────────────────

  leftCol.appendChild(sectionHeader("Immobilier"));
  leftCol.appendChild(buildAccountTable("immobilierBiens", "Immobilier (valeur nette)"));

  // ── Investissements (tableaux éditables) ────────────────────────────────────

  leftCol.appendChild(sectionHeader("Investissements"));

  function buildInvestReadonlyCard(title, amount, color, navPage) {
    const P2 = computePatrimoine();
    const pctOfInvest = P2.invest > 0 ? (amount / P2.invest * 100) : 0;
    const card = document.createElement("div"); card.className = "card";
    card.innerHTML = `
      <div class="card-title">
        <span style="display:flex;align-items:center;gap:6px">
          <span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block"></span>
          ${title}
        </span>
        <button class="btn-icon" onclick="navigate('${navPage}')">Gérer →</button>
      </div>
      <div style="font-family:var(--font-mono);font-size:20px;font-weight:600;color:${color};margin:8px 0 4px">${eur(amount)}</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px">${pctOfInvest.toFixed(1)} % du portefeuille invest.</div>
      <div style="height:5px;background:var(--bg2);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${Math.min(100, pctOfInvest).toFixed(1)}%;background:${color};border-radius:3px;transition:width .4s ease"></div>
      </div>`;
    return card;
  }

  const P0 = computePatrimoine();
  const invTopGrid = document.createElement("div"); invTopGrid.className = "grid-3";
  invTopGrid.appendChild(buildInvestReadonlyCard("ETF",     P0.etfMkt, "var(--chart1)", "investissements"));
  invTopGrid.appendChild(buildInvestReadonlyCard("Actions", P0.stkMkt, "var(--chart3)", "investissements"));
  invTopGrid.appendChild(buildInvestReadonlyCard("Crypto",  P0.cryMkt, "var(--chart6)", "investissements"));
  leftCol.appendChild(invTopGrid);

  const invBotGrid = document.createElement("div"); invBotGrid.className = "grid-2";
  invBotGrid.appendChild(buildAccountTable("investImmo",       "Invest. immo. (SCPI · Locatif)"));
  invBotGrid.appendChild(buildAccountTable("investAlternatif", "Alternatif (Art · PE · Crowdf.)"));
  leftCol.appendChild(invBotGrid);

  // ═══════════════════════════════════════════════════════════════════════════
  // RIGHT — all visuals / charts (sticky)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── 1. Total Actifs ─────────────────────────────────────────────────────────

  const totalCard = document.createElement("div"); totalCard.className = "card";

  const refreshTotal = () => {
    if (!totalCard.isConnected) return;
    const P = computePatrimoine();
    totalCard.innerHTML = `
      <div class="card-title">
        Total Actifs
        <span style="font-family:var(--font-mono);font-size:14px;font-weight:600;color:var(--amber);margin-left:auto">${eur(P.total)}</span>
      </div>`;

    const bar = document.createElement("div"); bar.className = "repartition-bar";
    P.cats.forEach(cat => {
      const seg = document.createElement("div"); seg.className = "seg";
      seg.style.cssText = `width:${cat.pct}%;background:${cat.color}`;
      seg.title = `${cat.label} : ${eur(cat.amount)} (${cat.pct.toFixed(1)}%)`;
      bar.appendChild(seg);
    });
    totalCard.appendChild(bar);

    const leg = document.createElement("div"); leg.className = "legend-grid";
    P.cats.forEach(cat => {
      const li = document.createElement("div"); li.className = "legend-item";
      li.innerHTML = `
        <div class="legend-dot" style="background:${cat.color}"></div>
        <div>
          <div class="lg-label">${cat.label} <span class="lg-pct">(${cat.pct.toFixed(1)}%)</span></div>
          <div class="lg-val">${eur(cat.amount)}</div>
        </div>`;
      leg.appendChild(li);
    });
    totalCard.appendChild(leg);
  };

  refreshTotal();
  leftCol.appendChild(totalCard);

  const onDataChanged = () => {
    if (!totalCard.isConnected) {
      document.removeEventListener("datachanged", onDataChanged);
      return;
    }
    refreshTotal();
  };
  document.addEventListener("datachanged", onDataChanged);

  // ── 2. Allocation réelle vs cible ───────────────────────────────────────────

  const allocHeader = sectionHeader("Allocation");
  allocHeader.style.marginTop = "20px";
  leftCol.appendChild(allocHeader);

  const allocCard = document.createElement("div"); allocCard.className = "card";
  allocCard.innerHTML = `<div class="card-title">Allocation réelle vs cible <span class="hint">Basée sur le total investissements</span></div>`;

  const allocColors = ["var(--chart5)", "var(--chart1)", "var(--chart3)", "var(--chart6)", "var(--chart4)"];
  const Palloc = computePatrimoine();
  const reelPcts = [
    Palloc.invest > 0 ? Palloc.investImmoTotal / Palloc.invest * 100 : 0,
    Palloc.invest > 0 ? Palloc.etfMkt          / Palloc.invest * 100 : 0,
    Palloc.invest > 0 ? Palloc.stkMkt          / Palloc.invest * 100 : 0,
    Palloc.invest > 0 ? Palloc.cryMkt          / Palloc.invest * 100 : 0,
    Palloc.invest > 0 ? Palloc.alternatif       / Palloc.invest * 100 : 0,
  ];

  D.allocationCats.forEach((cat, i) => {
    const reel  = reelPcts[i];
    const cible = D.allocationCible[i] || 0;
    const color = allocColors[i];
    const barMax = Math.max(reel, cible, 1);
    const diff   = reel - cible;
    const diffColor = diff >= 0 ? "var(--chart4)" : "#e05050";

    const row = document.createElement("div");
    row.style.cssText = "margin-bottom:16px";
    row.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
        <span style="font-family:var(--font-head);font-weight:700;font-size:11px;letter-spacing:.07em;color:${color}">${cat}</span>
        <div style="display:flex;align-items:center;gap:10px;font-family:var(--font-mono);font-size:11px">
          <span style="font-weight:700;color:${color}">${reel.toFixed(1)} %</span>
          <span style="color:var(--text3)">cible: ${cible.toFixed(1)} %</span>
          <span style="color:${diffColor};font-weight:600">${diff >= 0 ? "+" : ""}${diff.toFixed(1)} %</span>
        </div>
      </div>
      <div style="position:relative;height:8px;background:var(--bg2);border-radius:4px;overflow:visible;margin-bottom:2px">
        <div style="position:absolute;left:0;top:0;height:100%;width:${Math.min(100, reel / barMax * 100).toFixed(1)}%;background:${color};opacity:.9;border-radius:4px;transition:width .4s ease"></div>
        ${cible > 0 ? `<div style="position:absolute;top:-3px;left:${Math.min(99, cible / barMax * 100).toFixed(1)}%;width:2px;height:14px;background:${color};opacity:.35;border-radius:1px"></div>` : ""}
      </div>`;
    allocCard.appendChild(row);
  });

  leftCol.appendChild(allocCard);

  // ── 4. Historique ───────────────────────────────────────────────────────────

  const histo = sectionHeader("Historique");
  histo.style.marginTop = "20px";
  leftCol.appendChild(histo);

  const evoCard = document.createElement("div"); evoCard.className = "card";
  const evoHead = document.createElement("div"); evoHead.className = "collapsible-header";
  evoHead.innerHTML = `
    <div class="card-title" style="margin:0">Évolution du capital</div>
    <svg id="evo-chevron" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <polyline points="6 9 12 15 18 9"/>
    </svg>`;
  const evoBody = document.createElement("div"); evoBody.className = "collapsible-body";

  evoHead.addEventListener("click", () => {
    evoBody.classList.toggle("open");
    const ch = document.getElementById("evo-chevron");
    if (ch) ch.style.transform = evoBody.classList.contains("open") ? "rotate(180deg)" : "";
    if (evoBody.classList.contains("open")) {
      const chartEl = document.getElementById("evo-chart");
      if (chartEl) drawEvoChart(chartEl);
    }
  });

  const today = new Date().toLocaleDateString("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric" });
  evoBody.innerHTML = `
    <div id="evo-chart" style="margin-bottom:16px"></div>
    <div class="evo-list" id="evo-list"></div>
    <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:8px">
      <p style="font-size:11px;font-weight:600;color:var(--text3);margin-bottom:8px">Ajouter une valorisation</p>
      <div class="form-row" style="margin-bottom:8px">
        <input class="form-input" placeholder="Date (ex: ${today})" id="evo-date">
        <input class="form-input" type="number" placeholder="Valeur (€)" id="evo-val" step="100">
      </div>
      <button class="btn btn-primary btn-sm" style="width:100%" onclick="
        const d=document.getElementById('evo-date').value.trim();
        const v=parseFloat(document.getElementById('evo-val').value);
        if(!d||isNaN(v))return;
        D.evolutionCapital.push({date:d,patrimoine:v});
        saveData();renderEvoList_();
        document.getElementById('evo-date').value='';
        document.getElementById('evo-val').value='';
        toast('Snapshot enregistré ✓');
      ">Enregistrer ce snapshot</button>
    </div>`;

  const renderEvoList = () => {
    const list = document.getElementById("evo-list");
    if (!list) return;
    list.innerHTML = "";
    [...D.evolutionCapital].reverse().forEach((p, ri) => {
      const idx = D.evolutionCapital.length - 1 - ri;
      const row = document.createElement("div"); row.className = "evo-row";
      row.innerHTML = `
        <div class="row-left" style="gap:8px">
          <button class="del-btn" style="opacity:1" onclick="D.evolutionCapital.splice(${idx},1);saveData();renderEvoList_();toast('Point supprimé')">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <span class="evo-date">${p.date}</span>
        </div>
        <span class="evo-val">${eur(p.patrimoine)}</span>`;
      list.appendChild(row);
    });
  };
  window.renderEvoList_ = renderEvoList;

  evoCard.appendChild(evoHead);
  evoCard.appendChild(evoBody);
  leftCol.appendChild(evoCard);
  renderEvoList();
}

// ─── BUDGET ──────────────────────────────────────────────────────────────────

