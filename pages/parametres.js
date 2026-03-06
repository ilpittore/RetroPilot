// ─── PARAMÈTRES ───────────────────────────────────────────────────────────────

function parametres(c) {
  // ── 1. Sauvegarde ────────────────────────────────────────────────────────
  const saveBlock = document.createElement("div"); saveBlock.className = "settings-block";
  saveBlock.innerHTML = `
    <div class="settings-block-header">
      <div class="settings-block-icon" style="background:#f0a02015">💾</div>
      <div>
        <div class="settings-block-title">Sauvegarde des données</div>
        <div class="settings-block-sub">Vos données sont sauvegardées automatiquement dans ce navigateur (localStorage)</div>
      </div>
    </div>
    <div class="settings-block-body">
      <div class="settings-alert">
        <div class="settings-alert-title">⚠ Important — À lire avant d'utiliser</div>
        <div class="settings-alert-body">
          La sauvegarde utilise le <strong>stockage local de votre navigateur</strong>.
          Vos données sont liées à <strong>ce navigateur sur cet ordinateur uniquement</strong>.<br><br>
          <strong>Vos données seront perdues si vous :</strong>
          <ul>
            <li>Videz le cache ou l'historique du navigateur</li>
            <li>Ouvrez ce fichier dans un autre navigateur ou un autre ordinateur</li>
            <li>Utilisez une navigation privée / incognito</li>
          </ul><br>
          👉 <strong>Pour ne jamais perdre vos données</strong>, exportez régulièrement une sauvegarde .json ci-dessous.
        </div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-primary" id="param-export">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:5px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exporter une sauvegarde (.json)
        </button>
        <label class="btn btn-ghost" style="cursor:pointer">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:5px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Importer une sauvegarde
          <input type="file" accept=".json" id="param-import-input" style="display:none">
        </label>
        <button class="btn btn-ghost" id="param-reset" style="color:var(--loss);border-color:var(--loss)">
          <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="margin-right:5px"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          Réinitialiser
        </button>
      </div>
    </div>`;
  c.appendChild(saveBlock);

  document.getElementById("param-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(D, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `monpatrimoine_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Sauvegarde exportée ✓");
  });

  document.getElementById("param-import-input").addEventListener("change", function() {
    const file = this.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const imported = JSON.parse(e.target.result);
        Object.assign(D, imported);
        saveData(); render(); toast("Données importées ✓");
      } catch { toast("❌ Fichier invalide"); }
    };
    reader.readAsText(file);
    this.value = "";
  });

  document.getElementById("param-reset").addEventListener("click", () => {
    confirmModal("Réinitialiser toutes les données ?", "Cette action supprimera toutes vos données et rechargera les valeurs par défaut.", () => {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    });
  });

  // ── 2. Banques ───────────────────────────────────────────────────────────
  if (!D.banks) D.banks = ["Fortuneo","La poste","Caisse d'épargne","Amundi","Trade Republic","Binance","Ledger","IBKR"];

  const bankBlock = document.createElement("div"); bankBlock.className = "settings-block";
  bankBlock.style.animationDelay = ".08s";
  bankBlock.innerHTML = `
    <div class="settings-block-header">
      <div class="settings-block-icon" style="background:#5898d820">🏦</div>
      <div>
        <div class="settings-block-title">Liste des banques</div>
        <div class="settings-block-sub">Banques disponibles dans les formulaires de l'application</div>
      </div>
    </div>
    <div class="settings-block-body">
      <div class="tag-cloud" id="param-bank-tags"></div>
      <div class="tag-add-row">
        <input class="tag-add-input" id="param-bank-input" placeholder="Nom de la banque…">
        <button class="btn btn-primary btn-sm" id="param-bank-add">+ Ajouter</button>
      </div>
    </div>`;
  c.appendChild(bankBlock);

  const renderBanks = () => {
    const el = document.getElementById("param-bank-tags");
    if (!el) return;
    el.innerHTML = D.banks.map((b,i) => `
      <div class="tag-pill">
        ${b}
        <button class="tag-del" onclick="D.banks.splice(${i},1);saveData();parametres(document.getElementById('content'))">×</button>
      </div>`).join("");
  };
  renderBanks();

  document.getElementById("param-bank-add").addEventListener("click", () => {
    const inp = document.getElementById("param-bank-input");
    const name = inp.value.trim();
    if (!name || D.banks.includes(name)) return;
    D.banks.push(name); D.banks.sort();
    saveData(); inp.value = ""; renderBanks();
    toast("Banque ajoutée ✓");
  });
  document.getElementById("param-bank-input").addEventListener("keydown", e => {
    if (e.key === "Enter") document.getElementById("param-bank-add").click();
  });

  // ── 3. Taux de change ────────────────────────────────────────────────────
  const fxBlock = document.createElement("div"); fxBlock.className = "settings-block";
  fxBlock.style.animationDelay = ".16s";
  fxBlock.innerHTML = `
    <div class="settings-block-header">
      <div class="settings-block-icon" style="background:#a0c87820">🌍</div>
      <div>
        <div class="settings-block-title">Taux de change</div>
        <div class="settings-block-sub">Taux EUR vs principales devises, mis à jour depuis open.er-api.com</div>
      </div>
    </div>
    <div class="settings-block-body">
      <div class="fx-status" id="fx-status">Non chargés</div>
      <div class="fx-pills" id="fx-pills">—</div>
      <button class="btn btn-ghost btn-sm" id="fx-refresh">
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" style="margin-right:4px"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
        Actualiser les taux
      </button>
    </div>`;
  c.appendChild(fxBlock);

  document.getElementById("fx-refresh").addEventListener("click", fetchFxRates);
  fetchFxRates();

  // ── 4. À propos ──────────────────────────────────────────────────────────
  const aboutBlock = document.createElement("div"); aboutBlock.className = "settings-block";
  aboutBlock.style.animationDelay = ".24s";
  aboutBlock.innerHTML = `
    <div class="settings-block-header">
      <div class="settings-block-icon" style="background:var(--amber-dim)">
        <span style="font-family:var(--font-head);font-weight:800;font-size:16px;color:var(--amber)">M</span>
      </div>
      <div>
        <div class="settings-block-title">MonPatrimoine</div>
        <div class="settings-block-sub">Application de suivi patrimonial · Version 1.0 · Données 100% locales</div>
      </div>
    </div>
    <div class="settings-block-body" style="font-size:12px;color:var(--text3);line-height:1.8">
      Application HTML single-file — aucune dépendance, aucun serveur, aucune connexion requise.<br>
      Toutes vos données restent sur votre appareil dans le localStorage de votre navigateur.
    </div>`;
  c.appendChild(aboutBlock);
}

// ─── ANALYSE DES DÉPENSES ─────────────────────────────────────────────────────
