// ═══════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════

const PAGES = {
  dashboard:       { title:"Dashboard",            sub:"Vue d'ensemble de votre patrimoine" },
  patrimoine:      { title:"Patrimoine",            sub:"Détail de vos actifs" },
  budget:          { title:"Budget mensuel",        sub:"Répartition du budget selon la méthode 50/30/20" },
  livret:          { title:"Livret",                sub:"Gestion par enveloppes" },
  virements:       { title:"Virements",             sub:"Plan de virements mensuels" },
  investissements: { title:"Investissements",       sub:"Portefeuille ETF · Actions · Crypto" },
  credits:         { title:"Crédits",               sub:"Crédits immobiliers" },
  analyse:         { title:"Analyse des dépenses",  sub:"Saisie · Catégories · Répartition" },
  parametres:      { title:"Paramètres",            sub:"Sauvegarde · Données · Application" },
};

let currentPage = "dashboard";

function navigate(page) {
  if (!PAGES[page]) return;
  currentPage = page;
  document.getElementById("page-title").textContent = PAGES[page].title;
  document.getElementById("page-sub").textContent   = PAGES[page].sub;
  document.querySelectorAll(".nav-item").forEach(el => {
    el.classList.toggle("active", el.dataset.page === page);
  });
  render();
  closeSidebar();
}

// render() est dans main.js (chargé en dernier)

// ═══════════════════════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════════════════════

const eur = (n) => new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",minimumFractionDigits:2}).format(n);
const pct = (n) => (n>=0?"+":"")+n.toFixed(2)+"%";
const sum = (arr, key) => arr.reduce((s,x) => s + (x[key]||0), 0);

// ═══════════════════════════════════════════════════════════════
// COMPUTED
// ═══════════════════════════════════════════════════════════════

function computePatrimoine() {
  const cash    = sum(D.compteCourants, "amount");
  const livrets = sum(D.livrets, "amount");
  const plans   = sum(D.plansEpargne, "amount");
  const etfMkt  = sum(D.etfPositions, "market");
  const stkMkt  = sum(D.stockPositions, "market");
  const cryMkt  = sum(D.cryptoPositions, "market");
  const invest  = etfMkt + stkMkt + cryMkt;
  const total   = cash + livrets + plans + D.immobilierPerso + invest;
  const cats = [
    { label:"Cash",          amount:cash,             color:"var(--chart4)" },
    { label:"Livrets",       amount:livrets,           color:"var(--chart2)" },
    { label:"Plans épargne", amount:plans,             color:"var(--chart3)" },
    { label:"Immobilier",    amount:D.immobilierPerso, color:"var(--chart5)" },
    { label:"Investissements",amount:invest,           color:"var(--chart1)" },
  ].map(c => ({...c, pct: total>0?(c.amount/total*100):0}));
  return { cash, livrets, plans, invest, total, cats };
}

function computeBudget() {
  const essentielMensu  = D.budgetEssentiel.reduce((s,x) => s + x.amount, 0);
  const essentielAnnuel = D.budgetAnnuel.reduce((s,x) => s + x.amount, 0) / 12;
  const essentiel = essentielMensu + essentielAnnuel;
  const enviesMensu  = (D.budgetEnviesMensu  || []).reduce((s,x) => s + x.amount, 0);
  const enviesAnnuel = (D.budgetEnviesAnnuel || []).reduce((s,x) => s + x.amount, 0) / 12;
  const envies = enviesMensu + enviesAnnuel;
  const invest = D.budgetInvestissement || 0;
  const salaire = (D.virements && D.virements.salaireMensuel) || 0;
  const resteAVivre = salaire - essentiel - envies - invest;
  return { essentielMensu, essentielAnnuel, essentiel, enviesMensu, enviesAnnuel, envies, invest, salaire, resteAVivre };
}

// ═══════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════


function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("sidebar-overlay").classList.toggle("show");
}
function closeSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sidebar-overlay").classList.remove("show");
}
document.getElementById("sidebar-overlay").addEventListener("click", closeSidebar);

// ═══════════════════════════════════════════════════════════════
// TOAST
// ═══════════════════════════════════════════════════════════════

let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

function confirmModal(titleHtml, subtitle, onConfirm) {
  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:#00000088;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px";
  overlay.innerHTML = `
    <div style="background:var(--surface);border:1px solid #e0505055;border-radius:var(--radius);padding:24px;width:100%;max-width:400px;animation:fadeUp .2s ease">
      <div style="font-family:var(--font-head);font-weight:700;font-size:13px;display:flex;align-items:center;gap:7px;margin-bottom:20px">
        <span style="width:9px;height:9px;border-radius:50%;background:#e05050;flex-shrink:0"></span>
        ${titleHtml}
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost btn-sm" id="confirm-cancel">Annuler</button>
        <button class="btn btn-sm" id="confirm-ok" style="background:#e05050;border-color:#e05050;color:#fff">Supprimer</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  const keyHandler = (e) => {
    if (!overlay.isConnected) { document.removeEventListener("keydown", keyHandler); return; }
    if (e.key === "Enter") { close(); onConfirm(); }
    if (e.key === "Escape") close();
  };
  setTimeout(() => document.addEventListener("keydown", keyHandler), 100);
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  document.getElementById("confirm-cancel").addEventListener("click", close);
  document.getElementById("confirm-ok").addEventListener("click", () => { close(); onConfirm(); });
}


// ═══════════════════════════════════════════════════════════════
// EDITABLE AMOUNT
// ═══════════════════════════════════════════════════════════════

function makeEditableAmount(value, onSave, largeFont=false) {
  const wrap = document.createElement("div");
  wrap.style.display = "flex"; wrap.style.alignItems = "center"; wrap.style.gap = "4px";

  const showMode = () => {
    wrap.innerHTML = "";
    const btn = document.createElement("button");
    btn.className = "amount-display";
    if (largeFont) btn.style.fontSize = "18px";
    btn.innerHTML = `${eur(value)} <svg class="edit-icon" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
    btn.addEventListener("click", editMode);
    wrap.appendChild(btn);
  };

  const editMode = () => {
    wrap.innerHTML = "";
    const inp = document.createElement("input");
    inp.className = "amount-input";
    inp.type = "number"; inp.step = "0.01";
    inp.value = value;
    setTimeout(() => { inp.focus(); inp.select(); }, 0);

    const ok = document.createElement("button");
    ok.className = "edit-ok";
    ok.innerHTML = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;

    const cancel = document.createElement("button");
    cancel.className = "edit-cancel";
    cancel.innerHTML = `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    const commit = () => {
      const v = parseFloat(inp.value.replace(",","."));
      if (!isNaN(v)) { value = v; onSave(v); }
      showMode();
    };
    ok.addEventListener("click", commit);
    cancel.addEventListener("click", showMode);
    inp.addEventListener("keydown", e => { if(e.key==="Enter") commit(); if(e.key==="Escape") showMode(); });

    const actions = document.createElement("div");
    actions.className = "edit-actions";
    actions.appendChild(ok); actions.appendChild(cancel);
    wrap.appendChild(inp); wrap.appendChild(actions);
  };

  showMode();
  return wrap;
}

// ═══════════════════════════════════════════════════════════════
// ACCOUNT TABLE
// ═══════════════════════════════════════════════════════════════

function buildAccountTable(section, title) {
  const card = document.createElement("div");
  card.className = "card";

  const header = document.createElement("div");
  header.className = "card-title";
  header.innerHTML = `<span>${title}</span>`;
  const addBtn = document.createElement("button");
  addBtn.className = "btn-icon";
  addBtn.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Ajouter`;
  header.appendChild(addBtn);
  card.appendChild(header);

  const rows = document.createElement("div");
  rows.className = "account-rows";
  card.appendChild(rows);

  const totalRow = document.createElement("div");
  totalRow.className = "row-total";
  totalRow.innerHTML = `<span class="label">Total</span><span class="val"></span>`;
  card.appendChild(totalRow);

  // Add form
  const form = document.createElement("div");
  form.className = "add-form";
  form.innerHTML = `
    <div class="form-row">
      <input class="form-input full" placeholder="Nom du compte" data-field="name">
      <input class="form-input" placeholder="Banque" data-field="bank">
      <input class="form-input" type="number" placeholder="Montant (€)" data-field="amount" step="0.01">
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost btn-sm" data-cancel>Annuler</button>
      <button class="btn btn-primary btn-sm" data-save>Ajouter</button>
    </div>`;
  card.appendChild(form);

  addBtn.addEventListener("click", () => form.classList.toggle("open"));
  form.querySelector("[data-cancel]").addEventListener("click", () => form.classList.remove("open"));
  form.querySelector("[data-save]").addEventListener("click", () => {
    const name = form.querySelector("[data-field='name']").value.trim();
    const bank = form.querySelector("[data-field='bank']").value.trim();
    const amount = parseFloat(form.querySelector("[data-field='amount']").value.replace(",","."));
    if (!name || isNaN(amount)) return;
    D[section].push({ name, bank: bank||"—", amount });
    saveData(); refresh();
    form.querySelectorAll("input").forEach(i => i.value = "");
    form.classList.remove("open");
    toast("Compte ajouté ✓");
  });

  const refresh = () => {
    rows.innerHTML = "";
    D[section].forEach((acc, i) => {
      const row = document.createElement("div");
      row.className = "account-row";

      const delBtn = document.createElement("button");
      delBtn.className = "del-btn";
      delBtn.title = "Supprimer";
      delBtn.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>`;
      delBtn.addEventListener("click", () => {
        if (D[section].length <= 1) return toast("Impossible de supprimer le dernier compte");
        D[section].splice(i, 1);
        saveData(); refresh(); toast("Compte supprimé");
      });

      const left = document.createElement("div");
      left.className = "row-left";
      left.appendChild(delBtn);
      const nameSpan = document.createElement("span"); nameSpan.className = "row-name"; nameSpan.textContent = acc.name;
      const bankSpan = document.createElement("span"); bankSpan.className = "row-bank"; bankSpan.textContent = `(${acc.bank})`;
      left.appendChild(nameSpan); left.appendChild(bankSpan);

      const amtWrap = makeEditableAmount(acc.amount, (v) => {
        D[section][i].amount = v; saveData(); refresh(); toast("Montant mis à jour ✓");
      });

      row.appendChild(left); row.appendChild(amtWrap);
      rows.appendChild(row);
    });

    const total = D[section].reduce((s,a)=>s+a.amount,0);
    totalRow.querySelector(".val").textContent = eur(total);
  };

  refresh();
  return card;
}

// ═══════════════════════════════════════════════════════════════
// SVG CHART — Evolution
// ═══════════════════════════════════════════════════════════════

function drawEvoChart(container) {
  const pts = D.evolutionCapital;
  if (pts.length < 2) { container.innerHTML = `<p style="color:var(--text3);font-size:12px;text-align:center;padding:30px 0">Ajoutez au moins 2 points</p>`; return; }

  const W = container.clientWidth || 600;
  const H = 180;
  const PAD = { top:20, right:20, bottom:30, left:70 };
  const w = W - PAD.left - PAD.right;
  const h = H - PAD.top - PAD.bottom;

  const vals = pts.map(p=>p.patrimoine);
  const minV = Math.min(...vals) * 0.98;
  const maxV = Math.max(...vals) * 1.02;

  const xScale = (i) => PAD.left + (i / (pts.length-1)) * w;
  const yScale = (v) => PAD.top + h - ((v-minV)/(maxV-minV)) * h;

  const pathD = pts.map((p,i) => `${i===0?"M":"L"}${xScale(i).toFixed(1)},${yScale(p.patrimoine).toFixed(1)}`).join(" ");
  const areaD = pathD + ` L${xScale(pts.length-1).toFixed(1)},${(PAD.top+h).toFixed(1)} L${PAD.left.toFixed(1)},${(PAD.top+h).toFixed(1)} Z`;

  // Y axis labels
  const ticks = 4;
  let yLabels = "";
  for (let i=0; i<=ticks; i++) {
    const v = minV + (maxV-minV)*(i/ticks);
    const y = yScale(v);
    yLabels += `<text x="${PAD.left-8}" y="${y+4}" text-anchor="end" fill="var(--text3)" font-size="10" font-family="DM Mono,monospace">${(v/1000).toFixed(0)}k</text>
    <line x1="${PAD.left}" y1="${y}" x2="${PAD.left+w}" y2="${y}" stroke="var(--border)" stroke-width="1"/>`;
  }

  // X labels
  let xLabels = "";
  const step = Math.max(1, Math.floor(pts.length/5));
  pts.forEach((p,i) => {
    if (i % step !== 0 && i !== pts.length-1) return;
    xLabels += `<text x="${xScale(i)}" y="${H-6}" text-anchor="middle" fill="var(--text3)" font-size="10" font-family="DM Mono,monospace">${p.date.slice(3)}</text>`;
  });

  // Dots
  let dots = pts.map((p,i) => `<circle cx="${xScale(i)}" cy="${yScale(p.patrimoine)}" r="4" fill="var(--amber)" stroke="var(--bg2)" stroke-width="2"/>`).join("");

  container.innerHTML = `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--amber)" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="var(--amber)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${yLabels}
    <path d="${areaD}" fill="url(#areaGrad)"/>
    <path d="${pathD}" fill="none" stroke="var(--amber)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    ${xLabels}
  </svg>`;
}

// ═══════════════════════════════════════════════════════════════
// RENDER PAGES
// ═══════════════════════════════════════════════════════════════

// render() est défini dans main.js (chargé en dernier, après toutes les pages)

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

