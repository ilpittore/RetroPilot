// ─── ANALYSE DES DÉPENSES ─────────────────────────────────────────────────────

// Palette de couleurs pour les catégories
const CAT_COLORS = [
  "#f0a020","#f5c842","#e87830","#a0c878","#5898d8",
  "#c868a8","#78c8a0","#e87878","#8878d8","#78b8c8",
  "#d8a878","#88c850","#c89868","#a8a8a8",
];

function getCatColor(cat) {
  const idx = (D.analyseCats || []).indexOf(cat);
  return CAT_COLORS[idx >= 0 ? idx % CAT_COLORS.length : 0];
}

function getTypeColor(type) {
  const types = D.analyseTypes || [];
  const colors = ["var(--chart5)","var(--chart1)","var(--chart4)","var(--chart3)","var(--chart6)","var(--loss)"];
  const idx = types.indexOf(type);
  return colors[idx >= 0 ? idx % colors.length : 0];
}

function analyse(c) {
  const deps = D.analyseDepenses || [];
  const total = deps.reduce((s,d) => s + d.montant, 0);

  // ── Filtre actif ─────────────────────────────────────────────────────────
  let filterCat  = null; // null = tous
  let filterType = null;
  let sortCol    = "montant"; // nom | montant | categorie | type
  let sortAsc    = false;

  // ── Vue globale ──────────────────────────────────────────────────────────
  const statsRow = document.createElement("div"); statsRow.className = "stats-grid";
  const byType = {};
  D.analyseTypes.forEach(t => byType[t] = 0);
  deps.forEach(d => { if (byType[d.type] !== undefined) byType[d.type] += d.montant; });

  const statItems = [
    { label:"Total dépenses",          val:eur(total),                         sub:deps.length+" transactions" },
    { label:"Prélevées crédit/immo",   val:eur(byType[D.analyseTypes[0]]||0),  sub:"Logement & crédit" },
    { label:"Fixes mensuelles",        val:eur(byType[D.analyseTypes[1]]||0),  sub:"Prélèvements auto" },
    { label:"Essentielles CB",         val:eur(byType[D.analyseTypes[2]]||0),  sub:"Dépenses courantes" },
    { label:"Grosses factures",        val:eur(byType[D.analyseTypes[3]]||0),  sub:"À mensualiser" },
    { label:"Envies",                  val:eur(byType[D.analyseTypes[4]]||0),  sub:"Loisirs & plaisirs" },
  ];
  statItems.forEach((s,i) => {
    const el = document.createElement("div"); el.className = "stat-card";
    el.style.animationDelay = (i*.05)+"s";
    el.innerHTML = `<div class="stat-label">${s.label}</div>
      <div class="stat-value" style="font-size:15px">${s.val}</div>
      <div class="stat-sub">${s.sub}</div>`;
    statsRow.appendChild(el);
  });
  c.appendChild(statsRow);

  // ── Répartition par catégorie (barres) ───────────────────────────────────
  const catTotals = {};
  deps.forEach(d => { catTotals[d.categorie] = (catTotals[d.categorie] || 0) + d.montant; });
  const catSorted = Object.entries(catTotals).sort((a,b) => b[1]-a[1]);
  const maxCat = catSorted[0]?.[1] || 1;

  const catCard = document.createElement("div"); catCard.className = "card";
  catCard.innerHTML = `<div class="card-title">Répartition par catégorie</div>`;
  catSorted.forEach(([cat, montant]) => {
    const row = document.createElement("div"); row.className = "analyse-bar-row";
    const color = getCatColor(cat);
    row.innerHTML = `
      <div class="analyse-bar-label" title="${cat}">${cat}</div>
      <div class="analyse-bar-bg"><div class="analyse-bar-fg" style="width:${(montant/maxCat*100).toFixed(1)}%;background:${color}"></div></div>
      <div class="analyse-bar-val">${eur(montant)}</div>
      <div class="analyse-bar-pct">${total>0?(montant/total*100).toFixed(1):"0"}%</div>`;
    catCard.appendChild(row);
  });
  c.appendChild(catCard);

  // ── Répartition par type (barres) ────────────────────────────────────────
  const typeCard = document.createElement("div"); typeCard.className = "card";
  typeCard.innerHTML = `<div class="card-title">Répartition par type de dépense</div>`;
  const typeSorted = Object.entries(byType).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  const maxType = typeSorted[0]?.[1] || 1;
  typeSorted.forEach(([type, montant]) => {
    const row = document.createElement("div"); row.className = "analyse-bar-row";
    const color = getTypeColor(type);
    row.innerHTML = `
      <div class="analyse-bar-label" style="width:230px" title="${type}">${type}</div>
      <div class="analyse-bar-bg"><div class="analyse-bar-fg" style="width:${(montant/maxType*100).toFixed(1)}%;background:${color}"></div></div>
      <div class="analyse-bar-val">${eur(montant)}</div>
      <div class="analyse-bar-pct">${total>0?(montant/total*100).toFixed(1):"0"}%</div>`;
    typeCard.appendChild(row);
  });
  c.appendChild(typeCard);

  // ── Tableau des dépenses ─────────────────────────────────────────────────
  const tableCard = document.createElement("div"); tableCard.className = "card";
  const tableHeader = document.createElement("div"); tableHeader.className = "card-title";
  tableHeader.style.marginBottom = "10px";

  const addBtn = document.createElement("button"); addBtn.className = "btn-icon";
  addBtn.innerHTML = `<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Ajouter`;
  tableHeader.innerHTML = `<span id="dep-table-title">Toutes les dépenses (${deps.length})</span>`;
  tableHeader.appendChild(addBtn);
  tableCard.appendChild(tableHeader);

  // Filtres chips
  const filterRow = document.createElement("div"); filterRow.className = "analyse-filter-row";
  filterRow.innerHTML = `<span style="font-size:11px;color:var(--text3);flex-shrink:0">Filtrer :</span>`;
  const allChip = document.createElement("button"); allChip.className = "filter-chip active"; allChip.textContent = "Tout";
  filterRow.appendChild(allChip);

  const catChips = {}; const typeChips = {};
  catSorted.forEach(([cat]) => {
    const chip = document.createElement("button"); chip.className = "filter-chip";
    chip.style.cssText = `border-color:${getCatColor(cat)}44;`;
    chip.textContent = cat; filterRow.appendChild(chip); catChips[cat] = chip;
  });
  tableCard.appendChild(filterRow);

  // Formulaire ajout
  const addForm = document.createElement("div"); addForm.className = "dep-add-form";
  addForm.innerHTML = `
    <div class="dep-form-grid">
      <div class="form-group"><label>Nom</label><input class="form-input" id="dep-nom" placeholder="Ex: Supermarché"></div>
      <div class="form-group"><label>Montant (€)</label><input class="form-input" type="number" step="0.01" id="dep-montant" placeholder="0.00"></div>
      <div class="form-group"><label>Catégorie</label>
        <select class="dep-form-select" id="dep-cat">
          ${D.analyseCats.map(c=>`<option>${c}</option>`).join("")}
        </select>
      </div>
      <div class="form-group"><label>Type</label>
        <select class="dep-form-select" id="dep-type">
          ${D.analyseTypes.map(t=>`<option>${t}</option>`).join("")}
        </select>
      </div>
      <div class="form-group full"><label>Note (optionnel)</label><input class="form-input" id="dep-note" placeholder="Note libre..."></div>
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost btn-sm" id="dep-form-cancel">Annuler</button>
      <button class="btn btn-primary btn-sm" id="dep-form-save">Ajouter la dépense</button>
    </div>`;
  tableCard.appendChild(addForm);

  addBtn.addEventListener("click", () => addForm.classList.toggle("open"));
  addForm.querySelector("#dep-form-cancel").addEventListener("click", () => addForm.classList.remove("open"));
  addForm.querySelector("#dep-form-save").addEventListener("click", () => {
    const nom = document.getElementById("dep-nom").value.trim();
    const montant = parseFloat(document.getElementById("dep-montant").value);
    const categorie = document.getElementById("dep-cat").value;
    const type = document.getElementById("dep-type").value;
    const note = document.getElementById("dep-note").value.trim();
    if (!nom || isNaN(montant) || montant <= 0) return toast("Nom et montant requis");
    D.analyseDepenses.push({ nom, montant, categorie, type, note });
    saveData(); addForm.classList.remove("open");
    ["dep-nom","dep-montant","dep-note"].forEach(id => { const el=document.getElementById(id); if(el) el.value=""; });
    analyse(c); toast("Dépense ajoutée ✓");
  });

  // Table wrap + rendu
  const tableWrap = document.createElement("div"); tableWrap.className = "dep-table-wrap";
  tableCard.appendChild(tableWrap);
  c.appendChild(tableCard);

  const renderTable = () => {
    let filtered = D.analyseDepenses.filter(d =>
      (!filterCat  || d.categorie === filterCat) &&
      (!filterType || d.type === filterType)
    );
    const filtTotal = filtered.reduce((s,d) => s+d.montant, 0);
    const titleEl = document.getElementById("dep-table-title");
    if (titleEl) titleEl.textContent = `${filterCat||filterType ? "Filtré" : "Toutes les dépenses"} (${filtered.length} · ${eur(filtTotal)})`;

    // Sort
    filtered = [...filtered].sort((a,b) => {
      let va = a[sortCol], vb = b[sortCol];
      if (typeof va === "string") return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortAsc ? va - vb : vb - va;
    });

    const sortIcon = (col) => sortCol === col
      ? (sortAsc ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="18 15 12 9 6 15"/></svg>`
                 : `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>`)
      : "";

    tableWrap.innerHTML = `
      <table class="dep-table">
        <thead><tr>
          <th style="cursor:pointer" data-sort="nom">Nom ${sortIcon("nom")}</th>
          <th style="cursor:pointer" data-sort="montant">Montant ${sortIcon("montant")}</th>
          <th style="cursor:pointer" data-sort="categorie">Catégorie ${sortIcon("categorie")}</th>
          <th style="cursor:pointer" data-sort="type">Type ${sortIcon("type")}</th>
          <th>Note</th>
          <th></th>
        </tr></thead>
        <tbody>
          ${filtered.map((d,i) => {
            const realIdx = D.analyseDepenses.indexOf(d);
            return `<tr>
              <td>${d.nom}</td>
              <td>${eur(d.montant)}</td>
              <td><span class="dep-cat-badge" style="background:${getCatColor(d.categorie)}22;color:${getCatColor(d.categorie)}">${d.categorie}</span></td>
              <td><span class="dep-type-badge">${d.type}</span></td>
              <td style="color:var(--text3);font-size:11px">${d.note||""}</td>
              <td>
                <div class="dep-actions-row">
                  <button class="dep-inline-btn del" data-idx="${realIdx}" title="Supprimer">
                    <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>
              </td>
            </tr>`;
          }).join("")}
        </tbody>
        <tfoot><tr>
          <td>Total (${filtered.length})</td>
          <td>${eur(filtTotal)}</td>
          <td colspan="4"></td>
        </tr></tfoot>
      </table>`;

    // Tri au clic sur les headers
    tableWrap.querySelectorAll("th[data-sort]").forEach(th => {
      th.addEventListener("click", () => {
        const col = th.dataset.sort;
        if (sortCol === col) sortAsc = !sortAsc; else { sortCol = col; sortAsc = false; }
        renderTable();
      });
    });

    // Suppression
    tableWrap.querySelectorAll(".dep-inline-btn.del").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.idx);
        confirmModal(`Supprimer "<strong>${D.analyseDepenses[idx]?.nom}</strong>" ?`, "Cette dépense sera supprimée.", () => {
          D.analyseDepenses.splice(idx, 1);
          saveData();
          // Re-render la page entière pour mettre à jour les graphes aussi
          c.innerHTML = "";
          analyse(c);
          toast("Dépense supprimée");
        });
      });
    });
  };

  // Gestion des filtres chips
  const setFilter = (cat, type) => {
    filterCat = cat; filterType = type;
    allChip.classList.toggle("active", !cat && !type);
    Object.entries(catChips).forEach(([k,chip]) => chip.classList.toggle("active", k === cat));
    renderTable();
  };
  allChip.addEventListener("click", () => setFilter(null, null));
  Object.entries(catChips).forEach(([cat, chip]) => {
    chip.addEventListener("click", () => setFilter(filterCat === cat ? null : cat, null));
  });

  renderTable();
}



let fxRates = {};
let fxLoading = false;

async function fetchFxRates() {
  if (fxLoading) return;
  fxLoading = true;
  const statusEl = document.getElementById("fx-status");
  const pillsEl  = document.getElementById("fx-pills");
  if (statusEl) statusEl.textContent = "🔄 Mise à jour…";
  try {
    const res  = await fetch("https://open.er-api.com/v6/latest/EUR");
    const data = await res.json();
    if (data.result !== "success") throw new Error();
    const symbols = ["USD","GBP","CHF","CAD"];
    symbols.forEach(k => { if (data.rates[k]) fxRates[k] = 1 / data.rates[k]; });
    if (statusEl) statusEl.textContent = `✓ Mis à jour le ${new Date().toLocaleDateString("fr-FR")}`;
    if (pillsEl)  pillsEl.innerHTML = symbols
      .map(k => data.rates[k] ? `<span class="fx-pill">1 ${k} = ${(1/data.rates[k]).toFixed(4)} €</span>` : "")
      .join("");
  } catch {
    try {
      const res2  = await fetch("https://api.frankfurter.app/latest?base=EUR");
      const data2 = await res2.json();
      Object.keys(data2.rates).forEach(k => { fxRates[k] = 1 / data2.rates[k]; });
      if (statusEl) statusEl.textContent = `✓ Mis à jour (Frankfurter) le ${new Date().toLocaleDateString("fr-FR")}`;
      if (pillsEl)  pillsEl.innerHTML = ["USD","GBP","CHF","CAD"]
        .filter(k => data2.rates[k])
        .map(k => `<span class="fx-pill">1 ${k} = ${(1/data2.rates[k]).toFixed(4)} €</span>`)
        .join("");
    } catch {
      if (statusEl) statusEl.textContent = "⚠ Impossible de charger les taux (mode hors-ligne ?)";
    }
  }
  fxLoading = false;
}

