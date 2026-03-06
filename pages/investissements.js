// ─── INVESTISSEMENTS ──────────────────────────────────────────────────────────

function investissements(c) {
  const etfMkt  = sum(D.etfPositions,"market"),  etfPnl  = sum(D.etfPositions,"pnl"),  etfCost  = sum(D.etfPositions,"cost");
  const stkMkt  = sum(D.stockPositions,"market"), stkPnl  = sum(D.stockPositions,"pnl"), stkCost  = sum(D.stockPositions,"cost");
  const cryMkt  = sum(D.cryptoPositions,"market"),cryPnl  = sum(D.cryptoPositions,"pnl"),cryCost  = sum(D.cryptoPositions,"cost");
  const totalMkt = etfMkt+stkMkt+cryMkt, totalPnl = etfPnl+stkPnl+cryPnl, totalCost = etfCost+stkCost+cryCost;

  // Summary stats
  const sg = document.createElement("div"); sg.className = "stats-grid";
  const sData = [
    { label:"Total investissements", value:eur(totalMkt), trend:(totalMkt/totalCost-1)*100 },
    { label:"ETF",    value:eur(etfMkt),  trend:(etfMkt/etfCost-1)*100 },
    { label:"Actions",value:eur(stkMkt),  trend:(stkMkt/stkCost-1)*100 },
    { label:"Crypto", value:eur(cryMkt),  trend:(cryMkt/cryCost-1)*100 },
  ];
  sData.forEach((s,i)=>{
    const el=document.createElement("div"); el.className="stat-card"; el.style.animationDelay=(i*.06)+"s";
    el.innerHTML=`<div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div><div class="stat-trend ${s.trend>=0?'up':'down'}">${pct(s.trend)}</div>`;
    sg.appendChild(el);
  });
  c.appendChild(sg);

  // Allocation
  const allocCard = document.createElement("div"); allocCard.className = "card";
  allocCard.innerHTML = `<div class="card-title">Allocation réelle vs cible</div>`;
  const allocRows = document.createElement("div"); allocRows.className = "alloc-rows";
  D.allocationCats.forEach((cat,i) => {
    const reel = D.allocationReel[i]; const cible = D.allocationCible[i];
    const maxW = Math.max(...D.allocationReel,...D.allocationCible,1);
    const row = document.createElement("div"); row.className = "alloc-row";
    row.innerHTML = `<div class="alloc-header">
      <span class="alloc-name">${cat}</span>
      <div class="alloc-vals"><span style="color:var(--amber)">${reel.toFixed(1)}%</span><span>/ cible ${cible}%</span></div>
    </div>
    <div class="alloc-bar-bg">
      <div class="alloc-bar-reel" style="width:${reel/maxW*100}%"></div>
      <div class="alloc-bar-cible" style="left:${cible/maxW*100}%"></div>
    </div>`;
    allocRows.appendChild(row);
  });
  allocCard.appendChild(allocRows);
  c.appendChild(allocCard);

  // Tables with tabs
  const card = document.createElement("div"); card.className = "card";
  const tabs = document.createElement("div"); tabs.className = "tabs";
  const tabDefs = [
    { label:"ETF",     positions:D.etfPositions,    totals:{market:etfMkt, pnl:etfPnl, perf:(etfMkt/etfCost-1)*100} },
    { label:"Actions", positions:D.stockPositions,  totals:{market:stkMkt, pnl:stkPnl, perf:(stkMkt/stkCost-1)*100} },
    { label:"Crypto",  positions:D.cryptoPositions, totals:{market:cryMkt, pnl:cryPnl, perf:(cryMkt/cryCost-1)*100} },
  ];

  let activeTab = 0;
  const body = document.createElement("div"); body.className = "invest-table-wrap";

  const renderTable = (idx) => {
    const { positions, totals } = tabDefs[idx];
    body.innerHTML = `<table>
      <thead><tr>
        <th>Compte</th><th>Nom</th>
        <th>Valeur mkt</th><th>P&L</th><th>Perf.</th><th>Poids</th>
      </tr></thead>
      <tbody>
        ${positions.map(p=>`<tr>
          <td>${p.account}</td>
          <td>${p.name} <span style="color:var(--text3);font-size:11px">${p.ticker}</span></td>
          <td>${eur(p.market)}</td>
          <td class="${p.pnl>=0?'text-gain':'text-loss'}">${eur(p.pnl)}</td>
          <td><span class="pnl-badge ${p.perf>=0?'up':'down'}">${pct(p.perf)}</span></td>
          <td>${p.weight.toFixed(1)}%</td>
        </tr>`).join("")}
      </tbody>
      <tfoot><tr>
        <td colspan="2" style="text-align:left;font-family:var(--font-body)">Total</td>
        <td style="color:var(--amber)">${eur(totals.market)}</td>
        <td class="${totals.pnl>=0?'text-gain':'text-loss'}">${eur(totals.pnl)}</td>
        <td><span class="pnl-badge ${totals.perf>=0?'up':'down'}">${pct(totals.perf)}</span></td>
        <td>100%</td>
      </tr></tfoot>
    </table>`;
  };

  tabDefs.forEach((t,i) => {
    const tab = document.createElement("button"); tab.className = "tab" + (i===0?" active":"");
    tab.textContent = t.label;
    tab.addEventListener("click", () => {
      activeTab = i;
      tabs.querySelectorAll(".tab").forEach((el,j) => el.classList.toggle("active", j===i));
      renderTable(i);
    });
    tabs.appendChild(tab);
  });
  renderTable(0);
  card.appendChild(tabs); card.appendChild(body);
  c.appendChild(card);
}

// ─── CREDITS ──────────────────────────────────────────────────────────────────

// ── Calculs crédit ──────────────────────────────────────────────────────────

