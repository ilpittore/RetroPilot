// ─── CREDITS ──────────────────────────────────────────────────────────────────

// ── Calculs crédit ──────────────────────────────────────────────────────────

function calcMensualite(capital, tauxAnnuel, dureeM) {
  if (tauxAnnuel === 0) return capital / dureeM;
  const tm = tauxAnnuel / 100 / 12;
  return capital * tm / (1 - Math.pow(1 + tm, -dureeM));
}

function buildAmortTable(loan) {
  const tm = loan.rate / 100 / 12;
  const mensualite = calcMensualite(loan.loanAmount, loan.rate, loan.duration);
  const tauxAssuranceMensuel = (loan.insuranceRate || 0) / 100 / 12;

  const startParts = (loan.startDate || "2020-01").split("-");
  let year = parseInt(startParts[0]);
  let month = parseInt(startParts[1]);

  let capitalRestant = loan.loanAmount;
  let totalCapitalAmorti = 0;
  const rows = [];

  for (let i = 0; i < loan.duration; i++) {
    const partInteret = capitalRestant * tm;
    const capitalAmorti = mensualite - partInteret;
    const assurance = loan.loanAmount * tauxAssuranceMensuel;
    const totalEcheance = mensualite + assurance;
    totalCapitalAmorti += capitalAmorti;
    capitalRestant -= capitalAmorti;

    const mStr = String(month).padStart(2, "0");
    rows.push({
      echeance: i + 1,
      date: `${mStr}/${year}`,
      totalEcheance,
      capitalAmorti,
      partInteret,
      assurance,
      capitalRestant: Math.max(0, capitalRestant),
      totalCapitalAmorti,
    });

    month++;
    if (month > 12) { month = 1; year++; }
  }
  return { rows, mensualite };
}

function loanKPIs(loan) {
  const { rows, mensualite } = buildAmortTable(loan);
  const tauxAssuranceMensuel = (loan.insuranceRate || 0) / 100 / 12;
  const assuranceMensuelle = loan.loanAmount * tauxAssuranceMensuel;

  // Trouver l'échéance actuelle (mois courant)
  const now = new Date();
  const startParts = (loan.startDate || "2020-01").split("-");
  const startYear = parseInt(startParts[0]);
  const startMonth = parseInt(startParts[1]);
  const monthsElapsed = (now.getFullYear() - startYear) * 12 + (now.getMonth() + 1 - startMonth);
  const currentRow = Math.min(Math.max(monthsElapsed, 0), rows.length);

  const capitalAmortiADate = currentRow > 0 ? rows[currentRow - 1].totalCapitalAmorti : 0;
  const capitalRestantADate = loan.loanAmount - capitalAmortiADate;
  const pct = (capitalAmortiADate / loan.loanAmount) * 100;

  const totalInteret = rows.reduce((s, r) => s + r.partInteret, 0);
  const totalAssurance = rows.reduce((s, r) => s + r.assurance, 0);
  const coutTotal = totalInteret + totalAssurance;

  const endDate = rows.length > 0 ? rows[rows.length - 1].date : "—";
  const valeurNette = loan.purchasePrice - capitalRestantADate;

  return {
    mensualite, mensualiteTotal: mensualite + assuranceMensuelle,
    capitalAmortiADate, capitalRestantADate, pct,
    coutTotal, totalInteret, totalAssurance,
    endDate, valeurNette, currentRow, rows,
  };
}

// ── Modale de confirmation ───────────────────────────────────────────────────


// ── Formulaire crédit ────────────────────────────────────────────────────────

function openCreditForm(existingLoan = null) {
  // Remove any existing modal
  document.getElementById("credit-form-overlay")?.remove();

  const overlay = document.createElement("div");
  overlay.className = "credit-form-overlay open";
  overlay.id = "credit-form-overlay";

  const isEdit = !!existingLoan;
  const d = existingLoan || {};

  overlay.innerHTML = `
    <div class="credit-form-modal">
      <h3>${isEdit ? "Modifier le crédit" : "Ajouter un crédit"}</h3>

      <div class="form-section-title" style="color:var(--amber);border-color:#f0a02030">Identification</div>
      <div class="form-grid">
        <div class="form-group full">
          <label>Nom du crédit</label>
          <input id="cf-name" type="text" placeholder="Ex: Résidence principale" value="${d.name||""}">
        </div>
        <div class="form-group">
          <label>Date de début</label>
          <input id="cf-start" type="month" value="${d.startDate||""}">
        </div>
      </div>

      <div class="form-section-title" style="color:var(--amber);border-color:#f0a02030">Montants</div>
      <div class="form-grid">
        <div class="form-group">
          <label>Prix d'achat (€)</label>
          <input id="cf-purchase" type="number" step="100" placeholder="300 000" value="${d.purchasePrice||""}">
        </div>
        <div class="form-group">
          <label>Frais de notaire (€)</label>
          <input id="cf-notary" type="number" step="100" placeholder="15 000" value="${d.notaryFees||0}">
        </div>
        <div class="form-group">
          <label>Frais de garantie (€)</label>
          <input id="cf-guarantee" type="number" step="100" placeholder="3 000" value="${d.guaranteeFees||0}">
        </div>
        <div class="form-group">
          <label>Frais de dossier (€)</label>
          <input id="cf-dossier" type="number" step="100" placeholder="1 000" value="${d.dossierFees||0}">
        </div>
        <div class="form-group">
          <label>Apport personnel (€)</label>
          <input id="cf-apport" type="number" step="100" placeholder="50 000" value="${d.apport||0}">
        </div>
        <div class="form-group">
          <label>Montant total du crédit</label>
          <span class="form-result" id="cf-loan-display">—</span>
          <span class="form-hint">= Prix + Frais − Apport</span>
        </div>
      </div>

      <div class="form-section-title" style="color:var(--amber);border-color:#f0a02030">Paramètres du crédit</div>
      <div class="form-grid">
        <div class="form-group">
          <label>Taux d'intérêt nominal (%)</label>
          <input id="cf-rate" type="number" step="0.01" placeholder="2.00" value="${d.rate||""}">
        </div>
        <div class="form-group">
          <label>Durée totale (mois)</label>
          <input id="cf-duration" type="number" step="1" placeholder="240" value="${d.duration||""}">
        </div>
        <div class="form-group">
          <label>Taux assurance (%/an)</label>
          <input id="cf-insurance" type="number" step="0.01" placeholder="0.36" value="${d.insuranceRate||0.36}">
        </div>
        <div class="form-group">
          <label>Mensualité hors assurance</label>
          <span class="form-result" id="cf-monthly-display">—</span>
          <span class="form-hint">Capital + intérêts uniquement</span>
        </div>
        <div class="form-group full" style="background:var(--surface2);border-radius:var(--radius-sm);padding:12px 14px;border:1px solid #f0a02030;margin-top:4px">
          <label style="color:var(--amber);font-size:12px;font-weight:600;margin-bottom:6px;display:block">Mensualité totale assurance comprise</label>
          <span class="form-result" id="cf-total-monthly-display" style="font-size:17px">—</span>
          <span class="form-hint">Capital + Intérêts + Assurance / mois</span>
        </div>
      </div>

      <div class="form-footer">
        <button class="btn btn-ghost" id="cf-cancel">Annuler</button>
        <button class="btn btn-primary" id="cf-save">${isEdit ? "Enregistrer" : "Créer le crédit"}</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // ── Valeur calculée stockée en mémoire (utilisée à la sauvegarde)
  let _loanAmount = d.loanAmount || 0;

  // Auto-calc loan amount
  const calcLoan = () => {
    const purchase  = parseFloat(document.getElementById("cf-purchase").value) || 0;
    const notary    = parseFloat(document.getElementById("cf-notary").value)   || 0;
    const guarantee = parseFloat(document.getElementById("cf-guarantee").value)|| 0;
    const dossier   = parseFloat(document.getElementById("cf-dossier").value)  || 0;
    const apport    = parseFloat(document.getElementById("cf-apport").value)   || 0;
    _loanAmount = purchase + notary + guarantee + dossier - apport;
    const el = document.getElementById("cf-loan-display");
    if (el) el.textContent = _loanAmount > 0 ? eur(_loanAmount) : "—";
    calcMonthly();
  };

  const calcMonthly = () => {
    const loan      = _loanAmount;
    const rate      = parseFloat(document.getElementById("cf-rate").value)     || 0;
    const duration  = parseInt(document.getElementById("cf-duration").value)   || 0;
    const insurance = parseFloat(document.getElementById("cf-insurance").value)|| 0;
    const elM  = document.getElementById("cf-monthly-display");
    const elT  = document.getElementById("cf-total-monthly-display");
    if (loan > 0 && duration > 0) {
      const m = calcMensualite(loan, rate, duration);
      const assurMensuelle = loan * (insurance / 100 / 12);
      const total = m + assurMensuelle;
      if (elM) elM.textContent = eur(m);
      if (elT) elT.textContent = eur(total);
    } else {
      if (elM) elM.textContent = "—";
      if (elT) elT.textContent = "—";
    }
  };

  ["cf-purchase","cf-notary","cf-guarantee","cf-dossier","cf-apport"].forEach(id =>
    document.getElementById(id).addEventListener("input", calcLoan)
  );
  ["cf-rate","cf-duration","cf-insurance"].forEach(id =>
    document.getElementById(id).addEventListener("input", calcMonthly)
  );

  // Init calculated fields
  if (isEdit) { calcMonthly(); } else { calcLoan(); }

  document.getElementById("cf-cancel").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });

  document.getElementById("cf-save").addEventListener("click", () => {
    const name      = document.getElementById("cf-name").value.trim();
    const startDate = document.getElementById("cf-start").value;
    const purchase  = parseFloat(document.getElementById("cf-purchase").value) || 0;
    const notary    = parseFloat(document.getElementById("cf-notary").value)   || 0;
    const guarantee = parseFloat(document.getElementById("cf-guarantee").value)|| 0;
    const dossier   = parseFloat(document.getElementById("cf-dossier").value)  || 0;
    const apport    = parseFloat(document.getElementById("cf-apport").value)   || 0;
    const loanAmount= _loanAmount;
    const rate      = parseFloat(document.getElementById("cf-rate").value)     || 0;
    const duration  = parseInt(document.getElementById("cf-duration").value)   || 0;
    const insurance = parseFloat(document.getElementById("cf-insurance").value)|| 0;

    if (!name || loanAmount <= 0 || duration <= 0) {
      toast("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const loan = {
      id: isEdit ? existingLoan.id : (D.nextLoanId || Date.now()),
      name, startDate, purchasePrice: purchase, notaryFees: notary,
      guaranteeFees: guarantee, dossierFees: dossier, apport,
      loanAmount, rate, duration, insuranceRate: insurance,
    };

    if (isEdit) {
      const idx = D.loans.findIndex(l => l.id === existingLoan.id);
      if (idx >= 0) D.loans[idx] = loan;
    } else {
      D.loans.push(loan);
      D.nextLoanId = (D.nextLoanId || Date.now()) + 1;
    }

    saveData();
    overlay.remove();
    render();
    toast(isEdit ? "Crédit mis à jour ✓" : "Crédit ajouté ✓");
  });
}

// ── Rendu page Crédits ───────────────────────────────────────────────────────

function credits(c) {
  // ── En-tête + bouton ajouter ──
  const header = document.createElement("div");
  header.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:12px";

  const totalDebt = D.loans.reduce((s, l) => {
    const k = loanKPIs(l);
    return s + k.capitalRestantADate;
  }, 0);

  header.innerHTML = `
    <div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:3px">Capital restant total (à date)</div>
      <div style="font-family:var(--font-mono);font-size:22px;font-weight:500;color:var(--text)">${eur(totalDebt)}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:2px">${D.loans.length} crédit${D.loans.length>1?"s":""} immobilier${D.loans.length>1?"s":""}</div>
    </div>`;

  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-primary";
  addBtn.style.cssText = "display:flex;align-items:center;gap:7px;flex-shrink:0";
  addBtn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Ajouter un crédit`;
  addBtn.addEventListener("click", () => openCreditForm());
  header.appendChild(addBtn);
  c.appendChild(header);

  if (D.loans.length === 0) {
    const empty = document.createElement("div");
    empty.className = "card";
    empty.style.textAlign = "center";
    empty.innerHTML = `<p style="color:var(--text3);font-size:13px;padding:20px 0">Aucun crédit. Cliquez sur "Ajouter un crédit" pour commencer.</p>`;
    c.appendChild(empty);
    return;
  }

  // ── Une carte par crédit ──
  D.loans.forEach((loan, loanIdx) => {
    const kpi = loanKPIs(loan);
    const card = document.createElement("div");
    card.className = "credit-card";
    card.style.animationDelay = (loanIdx * 0.08) + "s";

    // ── Header carte ──
    const cardHeader = document.createElement("div");
    cardHeader.className = "credit-card-header";
    cardHeader.innerHTML = `
      <div style="flex:1;min-width:0">
        <div class="credit-name">${loan.name}</div>
        <div class="credit-meta">
          ${loan.startDate||""} → ${kpi.endDate} · ${loan.duration} mois · ${loan.rate}% · Assurance ${loan.insuranceRate}%
        </div>
      </div>`;

    // Boutons edit/delete
    const actions = document.createElement("div");
    actions.className = "credit-actions";
    actions.innerHTML = `
      <button class="credit-action-btn" title="Modifier">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z"/></svg>
        Modifier
      </button>
      <button class="credit-action-btn danger" title="Supprimer">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
        Supprimer
      </button>`;
    actions.querySelector(".credit-action-btn:first-child").addEventListener("click", (e) => {
      e.stopPropagation();
      openCreditForm(loan);
    });
    actions.querySelector(".credit-action-btn.danger").addEventListener("click", (e) => {
      e.stopPropagation();
      confirmModal(`Supprimer le crédit "<strong>${loan.name}</strong>" ?`, "Cette action est irréversible.", () => {
        D.loans.splice(loanIdx, 1);
        saveData(); render(); toast("Crédit supprimé");
      });
    });
    cardHeader.appendChild(actions);
    card.appendChild(cardHeader);

    // ── Barre de progression ──
    const progWrap = document.createElement("div");
    progWrap.className = "credit-progress-wrap";
    progWrap.innerHTML = `
      <div class="credit-progress-labels">
        <span>Capital amorti : <strong style="color:var(--text);font-family:var(--font-mono)">${eur(kpi.capitalAmortiADate)}</strong></span>
        <span class="pct">${kpi.pct.toFixed(1)}% remboursé</span>
        <span>Restant : <strong style="color:var(--text);font-family:var(--font-mono)">${eur(kpi.capitalRestantADate)}</strong></span>
      </div>
      <div class="credit-progress-bg">
        <div class="credit-progress-fg" style="width:${Math.min(100,kpi.pct).toFixed(2)}%"></div>
      </div>`;
    card.appendChild(progWrap);

    // ── KPI strip ──
    const kpis = document.createElement("div");
    kpis.className = "credit-kpis";
    const kpiData = [
      { label:"Mensualité tout compris", val:eur(kpi.mensualiteTotal),       cls:"amber" },
      { label:"Prix d'achat",            val:eur(loan.purchasePrice),         cls:"" },
      { label:"Montant du crédit",       val:eur(loan.loanAmount),            cls:"" },
      { label:"Coût total intérêts",     val:eur(kpi.totalInteret),           cls:"loss" },
      { label:"Coût total assurance",    val:eur(kpi.totalAssurance),         cls:"loss" },
      { label:"Valeur nette à date",     val:eur(kpi.valeurNette),            cls:"gain" },
    ];
    kpiData.forEach(k => {
      const el = document.createElement("div");
      el.className = "credit-kpi";
      el.innerHTML = `<div class="credit-kpi-label">${k.label}</div><div class="credit-kpi-val ${k.cls}">${k.val}</div>`;
      kpis.appendChild(el);
    });
    card.appendChild(kpis);

    // ── Tableau d'amortissement (collapsible) ──
    const amortSection = document.createElement("div");
    amortSection.className = "amort-section";

    const toggle = document.createElement("div");
    toggle.className = "amort-toggle";
    toggle.innerHTML = `
      <span>Tableau d'amortissement (${loan.duration} échéances)</span>
      <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>`;

    const tableWrap = document.createElement("div");
    tableWrap.className = "amort-table-wrap";

    // Remplir tableau au clic pour éviter de générer 300 lignes inutilement
    let tableBuilt = false;
    toggle.addEventListener("click", () => {
      const isOpen = toggle.classList.toggle("open");
      tableWrap.classList.toggle("open", isOpen);

      if (isOpen && !tableBuilt) {
        tableBuilt = true;
        const { rows } = kpi;
        const currentRow = kpi.currentRow;

        let tbody = "";
        rows.forEach((r, i) => {
          const isCurrent = (i + 1) === currentRow;
          tbody += `<tr class="${isCurrent ? "current-row" : ""}">
            <td>${r.date}${isCurrent ? " ◀" : ""}</td>
            <td>${eur(r.totalEcheance)}</td>
            <td>${eur(r.capitalAmorti)}</td>
            <td style="color:var(--loss)">${eur(r.partInteret)}</td>
            <td style="color:var(--text3)">${eur(r.assurance)}</td>
            <td style="color:var(--amber)">${eur(r.capitalRestant)}</td>
            <td>${eur(r.totalCapitalAmorti)}</td>
          </tr>`;
        });

        const totalMontant  = rows.reduce((s,r) => s + r.totalEcheance, 0);
        const totalCapital  = rows.reduce((s,r) => s + r.capitalAmorti, 0);
        const totalInteret  = rows.reduce((s,r) => s + r.partInteret, 0);
        const totalAssur    = rows.reduce((s,r) => s + r.assurance, 0);

        tableWrap.innerHTML = `
          <table class="amort-table">
            <thead>
              <tr>
                <th>Échéance</th>
                <th>Mensualité totale</th>
                <th>Capital amorti</th>
                <th>Intérêts</th>
                <th>Assurance</th>
                <th>Capital restant dû</th>
                <th>Capital amorti cumulé</th>
              </tr>
            </thead>
            <tbody>${tbody}</tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td>${eur(totalMontant)}</td>
                <td>${eur(totalCapital)}</td>
                <td style="color:var(--loss)">${eur(totalInteret)}</td>
                <td style="color:var(--text3)">${eur(totalAssur)}</td>
                <td>—</td>
                <td>${eur(totalCapital)}</td>
              </tr>
            </tfoot>
          </table>`;

        // Scroll to current row
        setTimeout(() => {
          const currentTr = tableWrap.querySelector(".current-row");
          if (currentTr) currentTr.scrollIntoView({ block: "center", behavior: "smooth" });
        }, 100);
      }
    });

    amortSection.appendChild(toggle);
    amortSection.appendChild(tableWrap);
    card.appendChild(amortSection);
    c.appendChild(card);
  });
}

// ─── VIREMENTS ────────────────────────────────────────────────────────────────

