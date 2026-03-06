// ─── VIREMENTS ────────────────────────────────────────────────────────────────

function virements(c) {
  const V = D.virements;
  const essentiel = D.budgetEssentiel.reduce((s,x) => s + x.amount, 0);
  const matelasObjectif = essentiel * (V.moisMatelas || 6);
  const matelasActuel   = D.enveloppes.matelas || 0;
  const matelasAtteint  = matelasActuel >= matelasObjectif;

  // ── Intro + salaire ──────────────────────────────────────────────────────
  const introCard = document.createElement("div"); introCard.className = "card";
  introCard.innerHTML = `
    <div class="card-title">Salaire mensuel net</div>
    <div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:6px">
      <input class="vir-salaire-input" id="vir-salaire" type="number" step="50"
        value="${V.salaireMensuel}" placeholder="2500">
      <span style="font-size:13px;color:var(--text3);padding-bottom:6px">€ / mois</span>
    </div>
    <p style="font-size:11px;color:var(--text3)">Montant reçu sur le compte courant principal avant virements.</p>`;
  c.appendChild(introCard);

  document.getElementById("vir-salaire").addEventListener("input", e => {
    D.virements.salaireMensuel = parseFloat(e.target.value) || 0;
    saveData();
  });

  // ── Résumé flux ──────────────────────────────────────────────────────────
  const totalCC   = V.comptesCourants.filter(r => r.actif).reduce((s,r) => s+r.montant, 0);
  const totalLiv  = V.livrets.filter(r => r.actif).reduce((s,r) => s+r.montant, 0);
  const totalInv  = V.investissements.filter(r => r.actif).reduce((s,r) => s+r.montant, 0);
  const totalSort = totalCC + totalLiv + totalInv;
  const reste     = V.salaireMensuel - totalSort;

  const resumeCard = document.createElement("div"); resumeCard.className = "card";
  resumeCard.innerHTML = `
    <div class="card-title">Récapitulatif des flux</div>
    <div class="vir-summary-bar">
      <div style="flex:${totalCC};background:var(--chart5)" title="Comptes courants"></div>
      <div style="flex:${totalLiv};background:var(--chart2)" title="Livrets"></div>
      <div style="flex:${totalInv};background:var(--chart1)" title="Investissements"></div>
      <div style="flex:${Math.max(0,reste)};background:var(--surface2)" title="Reste"></div>
    </div>
    <div class="stats-grid" style="margin-top:8px">
      ${[
        { label:"Salaire",           val:V.salaireMensuel, cls:"" },
        { label:"→ Comptes courants",val:totalCC,          cls:"" },
        { label:"→ Livrets",         val:totalLiv,         cls:"" },
        { label:"→ Investissements", val:totalInv,         cls:"" },
        { label:"Reste (non alloué)",val:reste, cls: reste < 0 ? "loss" : reste > 0 ? "gain" : "" },
      ].map(k => `<div class="stat-card" style="padding:12px 14px">
        <div class="stat-label">${k.label}</div>
        <div class="stat-value" style="font-size:15px" class="${k.cls}">${eur(k.val)}</div>
      </div>`).join("")}
    </div>`;
  c.appendChild(resumeCard);

  // ── Fonction helper : table de virements ─────────────────────────────────
  const buildVirTable = (title, key, color, stepBadge) => {
    const card = document.createElement("div"); card.className = "card";
    card.innerHTML = `
      <div class="card-title" style="margin-bottom:10px">
        ${stepBadge ? `<span class="vir-step-badge">${stepBadge}</span>` : ""}
        ${title}
      </div>`;

    const section = document.createElement("div"); section.className = "vir-section";

    // header row
    const hdr = document.createElement("div"); hdr.className = "vir-row header";
    hdr.innerHTML = `<div>Destination</div><div style="text-align:right">Montant (€)</div><div style="text-align:center">Arrondir</div><div style="text-align:center">Actif</div>`;
    section.appendChild(hdr);

    const refresh = () => {
      // Remove all rows except header
      while (section.children.length > 1) section.removeChild(section.lastChild);

      D.virements[key].forEach((row, i) => {
        const r = document.createElement("div"); r.className = "vir-row";
        r.innerHTML = `
          <div>
            <div class="vir-name">${row.name}</div>
            <div class="vir-bank">${row.bank}</div>
          </div>
          <div>
            <input class="vir-input" type="number" step="1" value="${row.montant}"
              ${!row.actif ? "disabled" : ""} id="vi-${key}-${i}">
          </div>
          <div style="display:flex;justify-content:center">
            <input type="checkbox" style="accent-color:var(--amber);width:14px;height:14px" ${row.arrondi ? "checked" : ""}>
          </div>
          <div style="display:flex;justify-content:center">
            <button class="vir-toggle ${row.actif ? "on" : ""}" data-idx="${i}" title="${row.actif ? "Actif" : "Inactif"}"></button>
          </div>`;

        r.querySelector("input[type=number]").addEventListener("change", e => {
          D.virements[key][i].montant = parseFloat(e.target.value) || 0;
          saveData(); toast("Virement mis à jour ✓");
        });
        r.querySelector("input[type=checkbox]").addEventListener("change", e => {
          D.virements[key][i].arrondi = e.target.checked;
          saveData();
        });
        r.querySelector(".vir-toggle").addEventListener("click", () => {
          D.virements[key][i].actif = !D.virements[key][i].actif;
          saveData(); render();
        });
        section.appendChild(r);
      });

      // Total
      const total = D.virements[key].filter(r => r.actif).reduce((s,r) => s+r.montant, 0);
      const tot = document.createElement("div"); tot.className = "vir-total-row";
      tot.innerHTML = `<span class="label">Total virements actifs</span><span class="val" style="color:${color}">${eur(total)}</span>`;
      section.appendChild(tot);
    };

    refresh();
    card.appendChild(section);
    return card;
  };

  // ── Étape 1 — remboursement dettes ───────────────────────────────────────
  const detteCard = document.createElement("div"); detteCard.className = "card";
  detteCard.innerHTML = `
    <div class="vir-step-badge" style="margin-bottom:10px">Étape 1 — Remboursement des dettes</div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text2);cursor:pointer">
        <input type="checkbox" id="vir-hasdettes" style="accent-color:var(--amber);width:14px;height:14px" ${V.hasDettes?"checked":""}>
        J'ai des dettes à la consommation
      </label>
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;color:var(--text3)">Budget remboursement :</span>
        <input class="vir-input" style="width:100px" type="number" id="vir-dettes" value="${V.dettesMontant}" step="50" ${!V.hasDettes?"disabled":""}>
        <span style="font-size:12px;color:var(--text3)">€/mois</span>
      </div>
    </div>`;
  c.appendChild(detteCard);

  document.getElementById("vir-hasdettes").addEventListener("change", e => {
    D.virements.hasDettes = e.target.checked;
    document.getElementById("vir-dettes").disabled = !e.target.checked;
    saveData();
  });
  document.getElementById("vir-dettes").addEventListener("change", e => {
    D.virements.dettesMontant = parseFloat(e.target.value) || 0;
    saveData();
  });

  // ── Étape 2 — Matelas de sécurité ────────────────────────────────────────
  const matelasCard = document.createElement("div"); matelasCard.className = "card";
  const matelasProgress = Math.min(100, matelasActuel / matelasObjectif * 100);
  matelasCard.innerHTML = `
    <div class="vir-step-badge" style="margin-bottom:10px">Étape 2 — Matelas de sécurité</div>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:12px;color:var(--text3)">Nombre de mois cible :</span>
        <input class="vir-input" style="width:70px" type="number" min="1" max="12" id="vir-mois" value="${V.moisMatelas}">
      </div>
      <div style="font-size:12px;color:var(--text3)">
        Objectif : <strong style="color:var(--text);font-family:var(--font-mono)">${eur(matelasObjectif)}</strong>
      </div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-bottom:5px">
      <span>Actuel : <strong style="color:var(--text);font-family:var(--font-mono)">${eur(matelasActuel)}</strong></span>
      <span class="${matelasAtteint?"":""}">
        ${matelasAtteint
          ? `<span style="color:var(--gain);font-weight:600">✓ Matelas constitué</span>`
          : `Manque : <strong style="color:var(--loss);font-family:var(--font-mono)">${eur(matelasObjectif - matelasActuel)}</strong>`}
      </span>
    </div>
    <div style="height:8px;background:var(--surface2);border-radius:4px;overflow:hidden">
      <div style="height:100%;border-radius:4px;width:${matelasProgress.toFixed(1)}%;background:${matelasAtteint?"var(--gain)":"var(--amber)"}"></div>
    </div>`;
  c.appendChild(matelasCard);

  document.getElementById("vir-mois").addEventListener("change", e => {
    D.virements.moisMatelas = parseFloat(e.target.value) || 6;
    saveData();
  });

  // ── Tables virements CC / Livrets / Investissements ──────────────────────
  c.appendChild(buildVirTable("Virements vers comptes courants", "comptesCourants", "var(--chart5)"));
  c.appendChild(buildVirTable("Virements vers livrets", "livrets", "var(--chart2)"));
  c.appendChild(buildVirTable("Virements vers investissements", "investissements", "var(--chart1)"));

  // ── Étape 3 — DCA ────────────────────────────────────────────────────────
  const dcaCard = document.createElement("div"); dcaCard.className = "card";
  const dcaTotal = (V.dcaETF||0) + (V.dcaActions||0) + (V.dcaCrypto||0) + (V.dcaImmo||0);
  dcaCard.innerHTML = `
    <div class="vir-step-badge" style="margin-bottom:12px">Étape 3 — Répartition DCA investissements</div>
    <div class="grid-2">
      ${[
        { label:"ETF (%)",            id:"dca-etf",     val:V.dcaETF },
        { label:"Actions (%)",        id:"dca-actions", val:V.dcaActions },
        { label:"Cryptomonnaies (%)", id:"dca-crypto",  val:V.dcaCrypto },
        { label:"Immobilier (%)",     id:"dca-immo",    val:V.dcaImmo },
      ].map(f => `<div class="form-group">
        <label>${f.label}</label>
        <input class="form-input" type="number" min="0" max="100" step="5" id="${f.id}" value="${f.val}">
      </div>`).join("")}
    </div>
    <div id="dca-total-line" style="margin-top:12px;font-size:12px;color:var(--text3)">
      Total : <span id="dca-total" style="font-family:var(--font-mono);color:${dcaTotal===100?"var(--gain)":"var(--loss)"}">${dcaTotal}%</span>
      ${dcaTotal !== 100 ? `<span style="color:var(--loss);margin-left:6px">⚠ Doit être égal à 100%</span>` : ""}
    </div>`;
  c.appendChild(dcaCard);

  ["dca-etf","dca-actions","dca-crypto","dca-immo"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", () => {
      D.virements.dcaETF     = parseInt(document.getElementById("dca-etf").value)     || 0;
      D.virements.dcaActions = parseInt(document.getElementById("dca-actions").value) || 0;
      D.virements.dcaCrypto  = parseInt(document.getElementById("dca-crypto").value)  || 0;
      D.virements.dcaImmo    = parseInt(document.getElementById("dca-immo").value)    || 0;
      const t = D.virements.dcaETF + D.virements.dcaActions + D.virements.dcaCrypto + D.virements.dcaImmo;
      const el = document.getElementById("dca-total");
      if (el) { el.textContent = t + "%"; el.style.color = t === 100 ? "var(--gain)" : "var(--loss)"; }
      saveData();
    });
  });
}

// ─── PARAMÈTRES ───────────────────────────────────────────────────────────────

