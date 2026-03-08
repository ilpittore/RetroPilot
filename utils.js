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
  const ccTotal    = sum(D.compteCourants, "amount");
  const liInvTotal = sum(D.liquiditesInvest || [], "amount");
  const cash       = ccTotal + liInvTotal;
  const livrets    = sum(D.livrets, "amount");
  const plans      = sum(D.plansEpargne, "amount");
  const etfMkt     = sum(D.etfPositions, "market");
  const stkMkt     = sum(D.stockPositions, "market");
  const cryMkt     = sum(D.cryptoPositions, "market");
  const investImmoTotal = sum(D.investImmo || [], "amount");
  const alternatif      = sum(D.investAlternatif || [], "amount");
  const invest     = etfMkt + stkMkt + cryMkt + investImmoTotal + alternatif;
  const immoTotal  = D.immobilierBiens ? sum(D.immobilierBiens, "amount") : (D.immobilierPerso || 0);
  const total      = cash + livrets + plans + immoTotal + invest;
  const cats = [
    { label:"Cash",           amount:cash,     color:"var(--chart4)" },
    { label:"Livrets",        amount:livrets,  color:"var(--chart2)" },
    { label:"Plans épargne",  amount:plans,    color:"var(--chart3)" },
    { label:"Immobilier",     amount:immoTotal,color:"var(--chart5)" },
    { label:"Investissements",amount:invest,   color:"var(--chart1)" },
  ].map(c => ({...c, pct: total>0?(c.amount/total*100):0}));
  return { cash, ccTotal, liInvTotal, livrets, plans, etfMkt, stkMkt, cryMkt, investImmoTotal, alternatif, invest, immoTotal, total, cats };
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
document.getElementById("menu-btn").addEventListener("click", toggleSidebar);
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
// ACCOUNT COLORS
// ═══════════════════════════════════════════════════════════════

const ACCT_PALETTE = ["#5898d8","#f0a020","#c868a8","#e87830","#34c77b","#f5c842","#e05050","#5ab4c8","#9b59b6","#1abc9c"];

function showColorPicker(anchor, currentColor, onSelect) {
  document.querySelectorAll(".acct-color-picker").forEach(el => el.remove());
  const picker = document.createElement("div");
  picker.className = "acct-color-picker";
  picker.style.cssText = "position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:8px;display:flex;flex-wrap:wrap;gap:6px;width:148px;box-shadow:0 4px 16px #0005";
  ACCT_PALETTE.forEach(color => {
    const s = document.createElement("div");
    const isActive = color === currentColor;
    s.style.cssText = `width:20px;height:20px;border-radius:50%;background:${color};cursor:pointer;flex-shrink:0;outline:${isActive ? `2px solid ${color}` : 'none'};outline-offset:2px;border:2px solid ${isActive ? '#fff' : 'transparent'};transition:transform .1s,outline .1s`;
    s.addEventListener("mouseenter", () => { s.style.transform = "scale(1.15)"; });
    s.addEventListener("mouseleave", () => { s.style.transform = ""; });
    s.addEventListener("click", e => { e.stopPropagation(); picker.remove(); onSelect(color); });
    picker.appendChild(s);
  });
  const rect = anchor.getBoundingClientRect();
  picker.style.top  = (rect.bottom + 4) + "px";
  picker.style.left = rect.left + "px";
  document.body.appendChild(picker);
  const close = e => { if (!picker.contains(e.target)) { picker.remove(); document.removeEventListener("click", close, true); } };
  setTimeout(() => document.addEventListener("click", close, true), 0);
}

function openAccountPicker(anchor, currentName, comptes, onSelect) {
  document.querySelectorAll(".acct-picker-popup").forEach(el => el.remove());
  const popup = document.createElement("div");
  popup.className = "acct-picker-popup";
  popup.style.cssText = "position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border2);border-radius:8px;padding:6px;min-width:220px;box-shadow:0 4px 16px #0005;display:flex;flex-direction:column;gap:2px";
  comptes.forEach(({ name, color }) => {
    const opt = document.createElement("button");
    const isActive = name === currentName;
    opt.style.cssText = `display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:6px;border:none;background:${isActive ? 'var(--surface2)' : 'transparent'};cursor:pointer;width:100%;text-align:left;font-size:12px;color:var(--text);transition:background .1s`;
    opt.innerHTML = `<span style="width:10px;height:10px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block"></span><span>${name}</span>`;
    opt.addEventListener("mouseenter", () => { opt.style.background = "var(--surface2)"; });
    opt.addEventListener("mouseleave", () => { opt.style.background = isActive ? "var(--surface2)" : "transparent"; });
    opt.addEventListener("click", e => { e.stopPropagation(); popup.remove(); onSelect(name); });
    popup.appendChild(opt);
  });
  const rect = anchor.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  if (spaceBelow < 200) {
    popup.style.bottom = (window.innerHeight - rect.top + 4) + "px";
    popup.style.top = "auto";
  } else {
    popup.style.top  = (rect.bottom + 4) + "px";
  }
  popup.style.left = rect.left + "px";
  document.body.appendChild(popup);
  const close = e => { if (!popup.contains(e.target)) { popup.remove(); document.removeEventListener("click", close, true); } };
  setTimeout(() => document.addEventListener("click", close, true), 0);
}

// ═══════════════════════════════════════════════════════════════
// ACCOUNT TABLE
// ═══════════════════════════════════════════════════════════════

function openAccountModal(section, title, onSaved) {
  let selectedColor = ACCT_PALETTE[(D[section]?.length || 0) % ACCT_PALETTE.length];

  const overlay = document.createElement("div");
  overlay.style.cssText = "position:fixed;inset:0;background:#00000088;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px";
  overlay.innerHTML = `
    <div style="background:var(--surface);border:1px solid #f0a02055;border-radius:var(--radius);padding:24px;width:100%;max-width:440px;animation:fadeUp .2s ease">
      <div style="font-family:var(--font-head);font-weight:700;font-size:15px;margin-bottom:18px;display:flex;align-items:center;gap:8px">
        <span id="acc-color-preview" style="width:10px;height:10px;border-radius:50%;background:${selectedColor};display:inline-block;flex-shrink:0"></span>
        Ajouter — ${title}
      </div>
      <div class="form-group" style="margin-bottom:12px">
        <label>Intitulé du compte</label>
        <input class="form-input" id="acc-name" placeholder="Ex: Compte courant 1 (salaire)">
      </div>
      <div class="form-group" style="margin-bottom:12px">
        <label>Banque</label>
        <input class="form-input" id="acc-bank" placeholder="Ex: Fortuneo, Boursorama…">
      </div>
      <div class="form-group" style="margin-bottom:12px">
        <label>Montant</label>
        <input class="form-input" type="number" step="0.01" id="acc-amount" placeholder="0.00"
          style="font-family:var(--font-mono);font-size:16px">
      </div>
      <div class="form-group" style="margin-bottom:20px">
        <label>Couleur</label>
        <div id="acc-swatches" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px"></div>
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost btn-sm" id="acc-cancel">Annuler</button>
        <button class="btn btn-primary btn-sm" id="acc-save">Valider</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // Build color swatches
  const swatchContainer = document.getElementById("acc-swatches");
  const renderSwatches = () => {
    swatchContainer.innerHTML = "";
    ACCT_PALETTE.forEach(color => {
      const s = document.createElement("div");
      const isActive = color === selectedColor;
      s.style.cssText = `width:20px;height:20px;border-radius:50%;background:${color};cursor:pointer;outline:${isActive ? `2px solid ${color}` : 'none'};outline-offset:2px;border:2px solid ${isActive ? '#fff' : 'transparent'};transition:transform .1s`;
      s.addEventListener("mouseenter", () => { s.style.transform = "scale(1.15)"; });
      s.addEventListener("mouseleave", () => { s.style.transform = ""; });
      s.addEventListener("click", () => {
        selectedColor = color;
        document.getElementById("acc-color-preview").style.background = color;
        renderSwatches();
      });
      swatchContainer.appendChild(s);
    });
  };
  renderSwatches();

  setTimeout(() => document.getElementById("acc-name")?.focus(), 50);

  const close = () => overlay.remove();

  overlay.addEventListener("keydown", e => {
    if (e.key === "Escape") close();
    if (e.key === "Enter" && !["BUTTON","SELECT"].includes(e.target.tagName)) {
      document.getElementById("acc-save")?.click();
    }
  });
  overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
  document.getElementById("acc-cancel").addEventListener("click", close);
  document.getElementById("acc-save").addEventListener("click", () => {
    const name = document.getElementById("acc-name").value.trim();
    const bank = document.getElementById("acc-bank").value.trim();
    const amt  = parseFloat(document.getElementById("acc-amount").value.replace(",", "."));
    if (!name) { toast("L'intitulé du compte est requis"); return; }
    if (isNaN(amt)) { toast("Le montant est requis"); return; }
    if (!Array.isArray(D[section])) D[section] = [];
    D[section].push({ name, bank: bank || "—", amount: amt, color: selectedColor });
    saveData();
    close();
    if (onSaved) onSaved();
    toast("Compte ajouté ✓");
  });
}

function buildAccountTable(section, title) {
  const inlineInputStyle = "background:var(--surface2);border:1px solid var(--border2);border-radius:4px;padding:2px 6px;font-size:12px;color:var(--text);outline:none;font-family:var(--font-body)";

  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `<div class="card-title"><span>${title}</span></div>`;

  const rows = document.createElement("div");
  card.appendChild(rows);

  const totalRow = document.createElement("div");
  totalRow.className = "budget-subtotal-row";
  totalRow.innerHTML = `<span>Total</span><span class="val"></span>`;
  card.appendChild(totalRow);

  // Bouton Ajouter (style budget-add-btn) — ouvre une modale
  const addBtn = document.createElement("button");
  addBtn.className = "budget-add-btn";
  addBtn.innerHTML = `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Ajouter`;
  card.appendChild(addBtn);

  addBtn.addEventListener("click", () => openAccountModal(section, title, refresh));

  const refresh = () => {
    rows.innerHTML = "";
    D[section].forEach((acc, i) => {
      const row = document.createElement("div");
      row.className = "budget-item-row";

      // Color dot — click to open swatch picker
      const colorDot = document.createElement("span");
      colorDot.style.cssText = `width:10px;height:10px;border-radius:50%;background:${acc.color || "#888"};flex-shrink:0;cursor:pointer;border:2px solid transparent;transition:outline .12s;display:inline-block;outline:2px solid transparent;outline-offset:1px`;
      colorDot.title = "Changer la couleur";
      colorDot.addEventListener("mouseenter", () => { colorDot.style.outline = `2px solid ${acc.color || "#888"}`; });
      colorDot.addEventListener("mouseleave", () => { colorDot.style.outline = "2px solid transparent"; });
      colorDot.addEventListener("click", e => {
        e.stopPropagation();
        showColorPicker(colorDot, acc.color || "#888", color => {
          D[section][i].color = color;
          saveData(); refresh();
        });
      });

      // Delete
      const del = document.createElement("button");
      del.className = "budget-del-btn";
      del.title = "Supprimer";
      del.innerHTML = `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>`;
      del.addEventListener("click", () => {
        D[section].splice(i, 1);
        saveData(); refresh(); toast("Supprimé");
      });

      // Name — inline edit
      const nameEl = document.createElement("span");
      nameEl.className = "budget-item-name";
      nameEl.textContent = acc.name; nameEl.title = acc.name;
      nameEl.addEventListener("click", () => {
        const inp = document.createElement("input"); inp.type = "text"; inp.value = acc.name;
        inp.style.cssText = inlineInputStyle + ";width:100%;box-sizing:border-box";
        nameEl.textContent = ""; nameEl.appendChild(inp); inp.focus(); inp.select();
        const commit = () => { const v = inp.value.trim(); if (v) { D[section][i].name = v; saveData(); } refresh(); };
        inp.addEventListener("blur", commit);
        inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); if (e.key === "Escape") refresh(); });
      });

      // Bank badge — inline edit
      const bankEl = document.createElement("span");
      bankEl.style.cssText = "font-size:10px;color:var(--text3);flex-shrink:0;padding:1px 7px;border-radius:20px;border:1px solid var(--border2);white-space:nowrap;cursor:pointer;transition:border-color .12s,color .12s";
      bankEl.textContent = acc.bank || "—";
      bankEl.addEventListener("mouseenter", () => { bankEl.style.borderColor = "var(--amber)"; bankEl.style.color = "var(--amber)"; });
      bankEl.addEventListener("mouseleave", () => { bankEl.style.borderColor = ""; bankEl.style.color = ""; });
      bankEl.addEventListener("click", () => {
        const inp = document.createElement("input"); inp.type = "text"; inp.value = acc.bank || "";
        inp.style.cssText = inlineInputStyle + ";width:75px";
        bankEl.textContent = ""; bankEl.style.cssText = "flex-shrink:0"; bankEl.appendChild(inp); inp.focus(); inp.select();
        const commit = () => { D[section][i].bank = inp.value.trim() || "—"; saveData(); refresh(); };
        inp.addEventListener("blur", commit);
        inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); if (e.key === "Escape") refresh(); });
      });

      // Amount — inline edit
      const amtEl = document.createElement("span");
      amtEl.className = "budget-item-amount";
      amtEl.textContent = eur(acc.amount);
      amtEl.addEventListener("click", () => {
        const inp = document.createElement("input"); inp.type = "number"; inp.step = "0.01"; inp.value = acc.amount;
        inp.style.cssText = inlineInputStyle + ";font-family:var(--font-mono);width:90px;text-align:right";
        amtEl.textContent = ""; amtEl.appendChild(inp); inp.focus(); inp.select();
        const commit = () => { const v = parseFloat(inp.value); if (!isNaN(v)) { D[section][i].amount = v; saveData(); } refresh(); };
        inp.addEventListener("blur", commit);
        inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); if (e.key === "Escape") refresh(); });
      });

      row.appendChild(colorDot); row.appendChild(del); row.appendChild(nameEl); row.appendChild(bankEl); row.appendChild(amtEl);
      rows.appendChild(row);
    });

    const total = (D[section] || []).reduce((s, a) => s + a.amount, 0);
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

