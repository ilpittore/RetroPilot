// ─── PATRIMOINE ──────────────────────────────────────────────────────────────

function patrimoine(c) {
  const P = computePatrimoine();

  // Header summary card
  const sumCard = document.createElement("div"); sumCard.className = "card";
  sumCard.innerHTML = `<div class="card-title">Répartition du patrimoine <span class="hint">Cliquez un montant pour le modifier</span></div>`;

  const bar = document.createElement("div"); bar.className = "repartition-bar";
  P.cats.forEach(cat => {
    const seg = document.createElement("div");
    seg.className = "seg";
    seg.style.cssText = `width:${cat.pct}%;background:${cat.color}`;
    seg.title = `${cat.label}: ${eur(cat.amount)} (${cat.pct.toFixed(1)}%)`;
    bar.appendChild(seg);
  });
  sumCard.appendChild(bar);

  const leg = document.createElement("div"); leg.className = "legend-grid";
  P.cats.forEach(cat => {
    const li = document.createElement("div"); li.className = "legend-item";
    li.innerHTML = `<div class="legend-dot" style="background:${cat.color}"></div>
      <div><div class="lg-label">${cat.label} <span class="lg-pct">(${cat.pct.toFixed(1)}%)</span></div>
      <div class="lg-val">${eur(cat.amount)}</div></div>`;
    leg.appendChild(li);
  });
  sumCard.appendChild(leg);
  c.appendChild(sumCard);

  // Enveloppes
  const envCard = document.createElement("div"); envCard.className = "card";
  envCard.innerHTML = `<div class="card-title">Enveloppes budgétaires</div>`;
  const envGrid = document.createElement("div"); envGrid.className = "enveloppe-grid";
  const envDefs = [
    { key:"matelas",   label:"Matelas sécurité", target:10000,  color:"var(--chart2)" },
    { key:"economies", label:"Économies",         target:null,   color:"var(--chart1)" },
    { key:"factures",  label:"Factures",           target:null,   color:"var(--chart4)" },
    { key:"projets",   label:"Projets",            target:null,   color:"var(--chart3)" },
  ];
  const refreshEnvTotals = () => {
    const sumEnv = Object.values(D.enveloppes).reduce((s,v)=>s+v,0);
  };
  envDefs.forEach(env => {
    const ec = document.createElement("div"); ec.className = "env-card";
    const lbl = document.createElement("div"); lbl.className = "env-label"; lbl.textContent = env.label;
    const amtWrap = document.createElement("div"); amtWrap.className = "env-amount";
    const amtEl = makeEditableAmount(D.enveloppes[env.key], (v) => {
      D.enveloppes[env.key] = v; saveData();
      toast("Enveloppe mise à jour ✓");
      // re-render bar
      if (env.target) fg.style.width = Math.min(100,(D.enveloppes[env.key]/env.target*100)).toFixed(1)+"%";
    }, true);
    amtWrap.appendChild(amtEl); ec.appendChild(lbl); ec.appendChild(amtWrap);
    let fg;
    if (env.target) {
      const bg = document.createElement("div"); bg.className = "env-bar-bg";
      fg = document.createElement("div"); fg.className = "env-bar-fg";
      fg.style.cssText = `width:${Math.min(100,D.enveloppes[env.key]/env.target*100).toFixed(1)}%;background:${env.color}`;
      bg.appendChild(fg); ec.appendChild(bg);
      const tgt = document.createElement("div"); tgt.className = "env-target"; tgt.textContent = `Objectif : ${eur(env.target)}`;
      ec.appendChild(tgt);
    }
    envGrid.appendChild(ec);
  });
  envCard.appendChild(envGrid);
  c.appendChild(envCard);

  // Accounts grid
  const ag = document.createElement("div"); ag.className = "grid-2";
  ag.appendChild(buildAccountTable("compteCourants", "Comptes courants"));
  ag.appendChild(buildAccountTable("livrets", "Livrets d'épargne"));
  c.appendChild(ag);

  const ag2 = document.createElement("div"); ag2.className = "grid-2";
  ag2.appendChild(buildAccountTable("plansEpargne", "Plans d'épargne"));

  // Immobilier
  const immoCard = document.createElement("div"); immoCard.className = "card";
  immoCard.innerHTML = `<div class="card-title">Immobilier (valeur nette)</div>`;
  const immoRow = document.createElement("div"); immoRow.className = "account-row";
  const immoLeft = document.createElement("div"); immoLeft.className = "row-left";
  immoLeft.innerHTML = `<span class="row-name">Patrimoine immobilier net</span>`;
  const immoAmt = makeEditableAmount(D.immobilierPerso, (v) => {
    D.immobilierPerso = v; saveData(); toast("Valeur immobilier mise à jour ✓");
  });
  immoRow.appendChild(immoLeft); immoRow.appendChild(immoAmt);
  immoCard.appendChild(immoRow);
  const immoNote = document.createElement("p"); immoNote.style.cssText="font-size:11px;color:var(--text3);margin-top:10px";
  immoNote.textContent = "Valeur de marché estimée moins le capital restant dû.";
  immoCard.appendChild(immoNote);
  ag2.appendChild(immoCard);
  c.appendChild(ag2);

  // Evolution historique (collapsible)
  const evoCard = document.createElement("div"); evoCard.className = "card";
  const evoHead = document.createElement("div"); evoHead.className = "collapsible-header";
  evoHead.innerHTML = `<div class="card-title" style="margin:0">Historique de valorisation</div>
    <svg id="evo-chevron" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`;
  const evoBody = document.createElement("div"); evoBody.className = "collapsible-body";
  evoHead.addEventListener("click", () => {
    evoBody.classList.toggle("open");
    const ch = document.getElementById("evo-chevron");
    ch.style.transform = evoBody.classList.contains("open") ? "rotate(180deg)" : "";
  });

  const renderEvoList = () => {
    const list = document.getElementById("evo-list");
    if (!list) return;
    list.innerHTML = "";
    [...D.evolutionCapital].reverse().forEach((p,ri) => {
      const idx = D.evolutionCapital.length-1-ri;
      const row = document.createElement("div"); row.className = "evo-row";
      row.innerHTML = `
        <div class="row-left" style="gap:8px">
          <button class="del-btn" style="opacity:1" onclick="D.evolutionCapital.splice(${idx},1);saveData();renderEvoList_();toast('Point supprimé')">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <span class="evo-date">${p.date}</span>
        </div>
        <span class="evo-val">${eur(p.patrimoine)}</span>`;
      list.appendChild(row);
    });
  };
  window.renderEvoList_ = renderEvoList;

  const today = new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"});
  evoBody.innerHTML = `
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
  evoCard.appendChild(evoHead);
  evoCard.appendChild(evoBody);
  c.appendChild(evoCard);
  renderEvoList();
}

// ─── BUDGET ──────────────────────────────────────────────────────────────────

