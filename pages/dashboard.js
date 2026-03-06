// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function dashboard(c) {
  const P = computePatrimoine();
  const B = computeBudget();
  const totalDebt = D.loans.reduce((s,l)=>s+l.remaining, 0);
  const etfMkt = sum(D.etfPositions,"market"), etfCost = sum(D.etfPositions,"cost");
  const stkMkt = sum(D.stockPositions,"market");
  const cryMkt = sum(D.cryptoPositions,"market"), cryCost = sum(D.cryptoPositions,"cost");
  const investMkt = etfMkt+stkMkt+cryMkt;
  const investCost = sum(D.etfPositions,"cost")+sum(D.stockPositions,"cost")+sum(D.cryptoPositions,"cost");
  const investPerf = (investMkt/investCost-1)*100;

  // Stats grid
  const sg = document.createElement("div"); sg.className = "stats-grid";
  const stats = [
    { label:"Patrimoine total", value:eur(P.total), sub:"Actifs nets", trend:null, icon:`<path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>` },
    { label:"Investissements", value:eur(investMkt), sub:pct(investPerf), trend:investPerf, icon:`<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>` },
    { label:"Épargne sécurité", value:eur(D.enveloppes.matelas), sub:"Matelas constitué ✓", trend:null, icon:`<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>` },
    { label:"Dettes restantes", value:eur(totalDebt), sub:`${D.loans.length} crédits immo`, trend:null, icon:`<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>` },
  ];
  stats.forEach((s,i) => {
    const el = document.createElement("div");
    el.className = "stat-card";
    el.style.animationDelay = (i*0.06)+"s";
    const trendHtml = s.trend !== null ? `<div class="stat-trend ${s.trend>=0?'up':'down'}">${pct(s.trend)}</div>` : `<div class="stat-sub">${s.sub}</div>`;
    el.innerHTML = `<div class="stat-icon"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">${s.icon}</svg></div>
      <div class="stat-label">${s.label}</div>
      <div class="stat-value">${s.value}</div>
      ${trendHtml}`;
    sg.appendChild(el);
  });
  c.appendChild(sg);

  // Row: evolution + allocation
  const row1 = document.createElement("div"); row1.className = "grid-2"; row1.style.animationDelay = ".1s";

  // Evo chart
  const evoCard = document.createElement("div"); evoCard.className = "card";
  evoCard.innerHTML = `<div class="card-title">Évolution du patrimoine</div>`;
  const evoChart = document.createElement("div");
  evoCard.appendChild(evoChart);
  row1.appendChild(evoCard);
  setTimeout(() => drawEvoChart(evoChart), 50);

  // Allocation
  const allocCard = document.createElement("div"); allocCard.className = "card";
  allocCard.innerHTML = `<div class="card-title">Allocation investissements</div>`;
  const allocRows = document.createElement("div"); allocRows.className = "alloc-rows";
  D.allocationCats.forEach((cat,i) => {
    const reel  = D.allocationReel[i];
    const cible = D.allocationCible[i];
    const maxW = Math.max(...D.allocationReel, ...D.allocationCible, 1);
    const row = document.createElement("div"); row.className = "alloc-row";
    row.innerHTML = `<div class="alloc-header">
      <span class="alloc-name">${cat}</span>
      <div class="alloc-vals"><span>${reel.toFixed(1)}%</span><span style="color:var(--text3)">/ cible ${cible}%</span></div>
    </div>
    <div class="alloc-bar-bg">
      <div class="alloc-bar-reel" style="width:${reel/maxW*100}%"></div>
      <div class="alloc-bar-cible" style="left:${cible/maxW*100}%"></div>
    </div>`;
    allocRows.appendChild(row);
  });
  allocCard.appendChild(allocRows);
  row1.appendChild(allocCard);
  c.appendChild(row1);

  // Budget summary
  const bRow = document.createElement("div"); bRow.className = "grid-3";
  const bStats = [
    { label:"Budget essentiel / mois", value:eur(B.essentiel), sub:"50% — Besoins" },
    { label:"Envies / mois",           value:eur(B.envies),    sub:"30% — Plaisirs" },
    { label:"Investissement / mois",   value:eur(B.invest),    sub:"20% — Épargne" },
  ];
  bStats.forEach((s,i) => {
    const el = document.createElement("div");
    el.className = "stat-card";
    el.style.animationDelay = (i*0.06+.2)+"s";
    el.innerHTML = `<div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div><div class="stat-sub">${s.sub}</div>`;
    bRow.appendChild(el);
  });
  c.appendChild(bRow);
}

// ─── PATRIMOINE ──────────────────────────────────────────────────────────────

