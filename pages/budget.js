// ─── BUDGET ──────────────────────────────────────────────────────────────────

function budget(c) {

  // ── Couleurs ──────────────────────────────────────────────────────────────
  const COLOR_ESS = "#e87830"; // orange  — essentielles
  const COLOR_ENV = "#c868a8"; // violet  — envies/projets
  const COLOR_INV = "#34c77b"; // vert    — investissements

  // ── Textes descriptifs ────────────────────────────────────────────────────
  const DESC_ESS = `La colonne orange est réservée pour les dépenses essentielles.<br>
  Si vous répondez OUI à au moins une de ces questions, alors il y a de fortes chances que la dépense soit à mettre dans cette colonne :<br>
  - Y a-t-il des conséquences si je ne paye pas cette facture ? (contrat, crédit…)<br>
  - Si demain je perdais mon emploi et que je n'avais plus de revenus, devrais-je maintenir obligatoirement cette dépense ?`;

  const DESC_ENV = `La colonne violette est réservée aux dépenses plaisirs et aux projets personnels à court terme. <br>
  Si vous répondez OUI à au moins une de ces questions, alors il y a de fortes chances que la dépense soit à mettre dans cette colonne : <br>
  - Si demain je perdais mon emploi et que je n'avais plus de revenus, est-ce que je pourrais supprimer cette dépense pour améliorer mes fins de mois ?`;

  const DESC_INV = `La colonne verte est réservée aux investissements.<br>
  C'est ici que vous allez déterminer quel montant allouer :<br>
  - Dans un 1er temps à l'élaboration de votre matelas de sécurité<br>
  - Dans un 2ème temps à vos investissements`;

  // ── Comptes courants (depuis Patrimoine) ──────────────────────────────────
  const comptesList = (D.compteCourants || []).map(cc => cc.name).filter(Boolean);

  // ── Camembert SVG ─────────────────────────────────────────────────────────
  function drawPie(svgId, segments) {
    const el = document.getElementById(svgId);
    if (!el) return;
    const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0);
    if (total === 0) { el.innerHTML = `<circle cx="80" cy="80" r="65" fill="var(--surface2)"/>`; return; }

    const cx = 80, cy = 80, r = 62, ri = 32;
    let angle = -Math.PI / 2;
    let paths = "";
    const labelData = [];

    segments.forEach(seg => {
      const v = Math.max(0, seg.value);
      if (v === 0) return;
      const slice = (v / total) * Math.PI * 2;
      const midAngle = angle + slice / 2;
      const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
      const x2 = cx + r * Math.cos(angle + slice), y2 = cy + r * Math.sin(angle + slice);
      const xi1 = cx + ri * Math.cos(angle), yi1 = cy + ri * Math.sin(angle);
      const xi2 = cx + ri * Math.cos(angle + slice), yi2 = cy + ri * Math.sin(angle + slice);
      const large = slice > Math.PI ? 1 : 0;
      paths += `<path d="M${xi1} ${yi1} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${xi2} ${yi2} A${ri} ${ri} 0 ${large} 0 ${xi1} ${yi1}" fill="${seg.color}" opacity="0.93"/>`;
      const lr = (r + ri) / 2;
      labelData.push({ x: cx + lr * Math.cos(midAngle), y: cy + lr * Math.sin(midAngle), pct: (v / total * 100).toFixed(0), slice });
      angle += slice;
    });

    // Cibles théoriques — arc extérieur bien visible
    const targets = [{ v: 0.50, c: COLOR_ESS }, { v: 0.30, c: COLOR_ENV }, { v: 0.20, c: COLOR_INV }];
    let ta = -Math.PI / 2;
    targets.forEach(t => {
      const slice = t.v * Math.PI * 2;
      const rr = 72;
      const x1 = cx + rr * Math.cos(ta), y1 = cy + rr * Math.sin(ta);
      const x2 = cx + rr * Math.cos(ta + slice), y2 = cy + rr * Math.sin(ta + slice);
      const large = slice > Math.PI ? 1 : 0;
      paths += `<path d="M${x1} ${y1} A${rr} ${rr} 0 ${large} 1 ${x2} ${y2}" fill="none" stroke="${t.c}" stroke-width="4" stroke-dasharray="6 3" opacity="0.75"/>`;
      ta += slice;
    });

    paths += `<circle cx="${cx}" cy="${cy}" r="${ri}" fill="var(--surface)"/>`;

    // Labels % sur les secteurs
    labelData.forEach(l => {
      if (l.slice > 0.2) {
        paths += `<text x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="11" font-weight="700" fill="#fff" opacity="0.95">${l.pct}%</text>`;
      }
    });

    el.innerHTML = paths;
  }

  // ── Modale d'ajout de dépense ─────────────────────────────────────────────
  function openAddModal(opts, onSaved) {
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;background:#00000088;z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px";

    const freq    = opts.defaultFreq || "mensuel";
    const isAnnuel = freq === "annuel";
    const freqLabel = isAnnuel ? "Annuelle" : "Mensuelle";
    const amtLabel  = isAnnuel ? "Montant annuel (€ / an)" : "Montant (€ / mois)";

    overlay.innerHTML = `
      <div style="background:var(--surface);border:1px solid ${opts.color}55;border-radius:var(--radius);padding:24px;width:100%;max-width:440px;animation:fadeUp .2s ease">
        <div style="font-family:var(--font-head);font-weight:700;font-size:15px;margin-bottom:18px;display:flex;align-items:center;gap:8px">
          <span style="width:10px;height:10px;border-radius:50%;background:${opts.color};display:inline-block;flex-shrink:0"></span>
          Ajouter — ${opts.title}
          <span style="margin-left:auto;font-size:11px;font-weight:500;padding:2px 8px;border-radius:20px;background:${opts.color}20;color:${opts.color};border:1px solid ${opts.color}44">${freqLabel}</span>
        </div>
        <div class="form-group" style="margin-bottom:12px">
          <label>Libellé</label>
          <input class="form-input" id="modal-lbl" placeholder="Ex: Loyer, EDF, Netflix…">
        </div>
        ${!isAnnuel ? `<div class="form-group" style="margin-bottom:12px">
          <label>Compte associé</label>
          <select class="dep-form-select" id="modal-acc">
            ${comptesList.length
              ? comptesList.map(n => `<option value="${n}">${n}</option>`).join("")
              : `<option value="">— Aucun compte défini dans Patrimoine —</option>`}
          </select>
        </div>` : ""}
        <div class="form-group" style="margin-bottom:20px">
          <label>${amtLabel}</label>
          <input class="form-input" type="number" step="0.01" id="modal-amt" placeholder="0.00"
            style="font-family:var(--font-mono);font-size:16px">
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost btn-sm" id="modal-cancel">Annuler</button>
          <button class="btn btn-primary btn-sm" id="modal-save"
            style="background:${opts.color};border-color:${opts.color};color:#fff">Valider</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    setTimeout(() => document.getElementById("modal-lbl")?.focus(), 50);

    overlay.addEventListener("keydown", e => {
      if (e.key === "Enter" && !["BUTTON","SELECT"].includes(e.target.tagName))
        document.getElementById("modal-save")?.click();
    });
    overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
    document.getElementById("modal-cancel").addEventListener("click", () => overlay.remove());
    document.getElementById("modal-save").addEventListener("click", () => {
      const lbl = document.getElementById("modal-lbl").value.trim();
      const amt = parseFloat(document.getElementById("modal-amt").value);
      const acc = isAnnuel ? "" : (document.getElementById("modal-acc")?.value || "");
      if (!lbl)                    return toast("Le libellé est requis");
      if (isNaN(amt) || amt === 0) return toast("Le montant est requis");
      if (isAnnuel) D[opts.dataKeyAnnuel].push({ label: lbl, account: acc, amount: amt });
      else          D[opts.dataKeyMensu].push({  label: lbl, account: acc, amount: amt });
      saveData();
      overlay.remove();
      onSaved();
      toast("Dépense ajoutée ✓");
    });
  }

  // ── Calcul total d'une colonne ────────────────────────────────────────────
  function computeColTotal(opts) {
    const m = (D[opts.dataKeyMensu]  || []).reduce((s, x) => s + x.amount, 0);
    const a = (D[opts.dataKeyAnnuel] || []).reduce((s, x) => s + x.amount, 0) / 12;
    return m + a;
  }

  // ── Construire une ligne de dépense ───────────────────────────────────────
  function buildItemRow(item, i, dataKey, isAnnuel, refreshCard) {
    const row = document.createElement("div"); row.className = "budget-item-row";

    const inlineInputStyle = "background:var(--surface2);border:1px solid var(--border2);border-radius:4px;padding:2px 6px;font-size:12px;color:var(--text);outline:none;font-family:var(--font-body)";

    // ── Bouton suppression ─────────────────────────────────────────────────
    const del = document.createElement("button"); del.className = "budget-del-btn";
    del.title = "Supprimer";
    del.innerHTML = `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>`;
    del.addEventListener("click", () => {
      confirmModal("Êtes-vous sûr de vouloir supprimer cette dépense ?", "", () => {
        D[dataKey].splice(i, 1);
        saveData(); refreshCard(); refreshAnalysis();
      });
    });

    // ── Libellé (éditable au clic) ─────────────────────────────────────────
    const nameEl = document.createElement("span"); nameEl.className = "budget-item-name";
    nameEl.textContent = item.label; nameEl.title = item.label;
    nameEl.style.cssText += ";cursor:pointer;padding:2px 4px;border-radius:4px;transition:background .12s";
    nameEl.addEventListener("mouseenter", () => { nameEl.style.background = "var(--amber-dim)"; nameEl.style.color = "var(--amber)"; });
    nameEl.addEventListener("mouseleave", () => { nameEl.style.background = ""; nameEl.style.color = ""; });
    nameEl.addEventListener("click", () => {
      nameEl.style.background = ""; nameEl.style.color = "";
      const inp = document.createElement("input"); inp.type = "text"; inp.value = item.label;
      inp.style.cssText = inlineInputStyle + ";width:100%;box-sizing:border-box";
      nameEl.textContent = ""; nameEl.appendChild(inp); inp.focus(); inp.select();
      const commit = () => {
        const v = inp.value.trim();
        if (v) { D[dataKey][i].label = v; saveData(); }
        refreshCard(); refreshAnalysis();
      };
      inp.addEventListener("blur", commit);
      inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); if (e.key === "Escape") refreshCard(); });
    });

    // ── Compte associé (liste déroulante au clic) ──────────────────────────
    const accColors = ["#5898d8","#f0a020","#c868a8","#34c77b","#e87830","#f5c842"];
    const accEl = document.createElement("span");
    const renderAccBadge = () => {
      accEl.innerHTML = "";
      if (item.account) {
        const idx = (item.account.charCodeAt(0) + item.account.length) % accColors.length;
        const bg = accColors[idx] + "28"; const col = accColors[idx];
        accEl.style.cssText = `display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;font-weight:500;white-space:nowrap;background:${bg};color:${col};border:1px solid ${col}44;flex-shrink:0;cursor:pointer`;
        accEl.textContent = item.account;
      } else {
        accEl.style.cssText = `display:inline-flex;align-items:center;padding:2px 8px;border-radius:20px;font-size:10px;white-space:nowrap;color:var(--text3);border:1px dashed var(--border2);flex-shrink:0;cursor:pointer`;
        accEl.textContent = "— compte";
      }
    };
    renderAccBadge();
    if (comptesList.length) {
      accEl.addEventListener("click", () => {
        const sel = document.createElement("select");
        sel.style.cssText = inlineInputStyle + ";max-width:140px;cursor:pointer";
        if (!item.account) {
          const opt = document.createElement("option"); opt.value = ""; opt.textContent = "— choisir"; sel.appendChild(opt);
        }
        comptesList.forEach(n => {
          const opt = document.createElement("option"); opt.value = n; opt.textContent = n;
          if (n === item.account) opt.selected = true;
          sel.appendChild(opt);
        });
        accEl.innerHTML = ""; accEl.style.cssText = "flex-shrink:0"; accEl.appendChild(sel);

        let committed = false;
        const commit = () => {
          if (committed) return; committed = true;
          D[dataKey][i].account = sel.value; saveData(); refreshCard(); refreshAnalysis();
        };
        const cancel = () => { if (committed) return; committed = true; refreshCard(); };

        sel.addEventListener("change", commit);
        sel.addEventListener("blur", () => setTimeout(cancel, 150));
        sel.addEventListener("keydown", e => { if (e.key === "Escape") { committed = true; refreshCard(); } });

        // Ouvrir le dropdown au 1er clic
        sel.focus();
        try { sel.showPicker(); } catch(e) {}
      });
    }

    // ── Montant (éditable au clic) ─────────────────────────────────────────
    const amtEl = document.createElement("span"); amtEl.className = "budget-item-amount";
    amtEl.textContent = isAnnuel ? eur(item.amount) + "/an" : eur(item.amount);
    amtEl.addEventListener("click", () => {
      const inp = document.createElement("input"); inp.type = "number"; inp.step = "0.01"; inp.value = item.amount;
      inp.style.cssText = inlineInputStyle + ";font-family:var(--font-mono);width:80px;text-align:right";
      amtEl.textContent = ""; amtEl.appendChild(inp); inp.focus(); inp.select();
      const commit = () => {
        const v = parseFloat(inp.value);
        if (!isNaN(v)) { D[dataKey][i].amount = v; saveData(); }
        refreshCard(); refreshAnalysis();
      };
      inp.addEventListener("blur", commit);
      inp.addEventListener("keydown", e => { if (e.key === "Enter") inp.blur(); if (e.key === "Escape") refreshCard(); });
    });

    // ── Assemblage ─────────────────────────────────────────────────────────
    if (isAnnuel) {
      row.appendChild(nameEl); row.appendChild(amtEl); row.appendChild(del);
    } else {
      row.appendChild(nameEl); row.appendChild(accEl); row.appendChild(amtEl); row.appendChild(del);
    }

    return row;
  }

  // ── Card description (au-dessus de chaque colonne) ───────────────────────
  function buildDescCard(color, desc) {
    const card = document.createElement("div");
    card.style.cssText = `background:${color}0a;border:1px solid ${color}30;border-radius:var(--radius);padding:12px 16px;box-sizing:border-box`;
    card.innerHTML = `<p style="font-size:11px;color:var(--text);line-height:1.7;margin:0">${desc}</p>`;
    return card;
  }

  // ── Construire une card (Essentielles ou Envies) ──────────────────────────
  function buildCard(opts) {
    const card = document.createElement("div");
    card.style.cssText = `background:${opts.color}12;border:1px solid ${opts.color}44;border-radius:var(--radius);overflow:hidden;animation:fadeUp .35s ${opts.delay} ease both`;

    // Header
    const header = document.createElement("div");
    header.style.cssText = `padding:14px 16px 12px;border-bottom:1px solid ${opts.color}30`;
    const titleEl = document.createElement("div");
    titleEl.innerHTML = `
      <div style="font-family:var(--font-head);font-weight:700;font-size:13px;display:flex;align-items:center;gap:7px">
        <span style="width:9px;height:9px;border-radius:50%;background:${opts.color};flex-shrink:0"></span>
        ${opts.title} — Cible ${opts.target}
      </div>
      <div style="font-family:var(--font-mono);font-size:18px;font-weight:500;color:${opts.color};margin-top:4px" id="total-${opts.id}">
        ${eur(computeColTotal(opts))} / mois
      </div>`;
    header.appendChild(titleEl);
    card.appendChild(header);

    // Body
    const body = document.createElement("div");
    card.appendChild(body);

    const refreshCard = () => {
      body.innerHTML = "";
      const dataMensu = D[opts.dataKeyMensu] || [];
      const dataAnn   = D[opts.dataKeyAnnuel] || [];

      if (dataMensu.length > 0) {
        const lbl = document.createElement("div"); lbl.className = "budget-section-label"; lbl.textContent = "Mensuel";
        body.appendChild(lbl);
        const listM = document.createElement("div");
        dataMensu.forEach((item, i) => listM.appendChild(buildItemRow(item, i, opts.dataKeyMensu, false, refreshCard)));
        body.appendChild(listM);
        const st = document.createElement("div"); st.className = "budget-subtotal-row";
        st.innerHTML = `<span>Sous-total mensuel</span><span class="val">${eur(dataMensu.reduce((s,x)=>s+x.amount,0))}</span>`;
        body.appendChild(st);
      }

      if (dataAnn.length > 0) {
        const lbl = document.createElement("div"); lbl.className = "budget-section-label"; lbl.textContent = "Annuel (÷12)";
        body.appendChild(lbl);
        const listA = document.createElement("div");
        dataAnn.forEach((item, i) => listA.appendChild(buildItemRow(item, i, opts.dataKeyAnnuel, true, refreshCard)));
        body.appendChild(listA);
        const st = document.createElement("div"); st.className = "budget-subtotal-row";
        st.innerHTML = `<span>Sous-total annuel ÷12</span><span class="val">${eur(dataAnn.reduce((s,x)=>s+x.amount,0)/12)}</span>`;
        body.appendChild(st);
      }

      const addBtn = document.createElement("button"); addBtn.className = "budget-add-btn";
      addBtn.style.cssText = `border-color:${opts.color}55;margin:10px 16px 14px`;
      addBtn.innerHTML = `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Ajouter une dépense`;
      addBtn.addEventListener("click", () => openAddModal(opts, () => { refreshCard(); refreshAnalysis(); }));
      body.appendChild(addBtn);

      // Màj total header
      const totalEl = document.getElementById(`total-${opts.id}`);
      if (totalEl) totalEl.textContent = eur(computeColTotal(opts)) + " / mois";
    };

    refreshCard();
    return { el: card, refresh: refreshCard };
  }

  // ── 3 cards Essentielles (résumé + mensuel + annuel) ─────────────────────
  function buildEssentielsCards(opts) {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-direction:column;gap:16px;min-width:0";

    // Card 1 — Résumé
    const card1 = document.createElement("div");
    card1.style.cssText = `background:${opts.color}12;border:1px solid ${opts.color}44;border-radius:var(--radius);padding:14px 16px;animation:fadeUp .35s 0s ease both`;
    const card1Head = document.createElement("div");
    card1Head.style.cssText = `font-family:var(--font-head);font-weight:700;font-size:13px;display:flex;align-items:center;gap:7px`;
    card1Head.innerHTML = `<span style="width:9px;height:9px;border-radius:50%;background:${opts.color};flex-shrink:0"></span>${opts.title} — Cible ${opts.target}`;
    const totalEl = document.createElement("div");
    totalEl.style.cssText = `font-family:var(--font-mono);font-size:18px;font-weight:500;color:${opts.color};margin-top:4px`;
    card1.appendChild(card1Head); card1.appendChild(totalEl);

    // Card 2 — Dépenses mensuelles
    const card2 = document.createElement("div");
    card2.style.cssText = `background:${opts.color}08;border:1px solid ${opts.color}30;border-radius:var(--radius);overflow:hidden;animation:fadeUp .35s .06s ease both`;
    const h2 = document.createElement("div");
    h2.style.cssText = `padding:10px 16px;border-bottom:1px solid ${opts.color}20;font-family:var(--font-head);font-weight:700;font-size:12px;color:${opts.color}`;
    h2.textContent = "Dépenses mensuelles";
    const body2 = document.createElement("div");
    card2.appendChild(h2); card2.appendChild(body2);

    // Card 3 — Dépenses annuelles
    const card3 = document.createElement("div");
    card3.style.cssText = `background:${opts.color}08;border:1px solid ${opts.color}30;border-radius:var(--radius);overflow:hidden;animation:fadeUp .35s .12s ease both`;
    const h3 = document.createElement("div");
    h3.style.cssText = `padding:10px 16px;border-bottom:1px solid ${opts.color}20;font-family:var(--font-head);font-weight:700;font-size:12px;color:${opts.color}`;
    h3.textContent = "Dépenses annuelles";
    const body3 = document.createElement("div");
    card3.appendChild(h3); card3.appendChild(body3);

    const mkAddBtn = (defaultFreq) => {
      const btn = document.createElement("button"); btn.className = "budget-add-btn";
      btn.style.cssText = `border-color:${opts.color}55;margin:10px 16px 14px`;
      btn.innerHTML = `<svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Ajouter une dépense`;
      btn.addEventListener("click", () => openAddModal({...opts, defaultFreq}, () => { refresh(); refreshAnalysis(); }));
      return btn;
    };

    const refresh = () => {
      const dataMensu = D[opts.dataKeyMensu] || [];
      const dataAnn   = D[opts.dataKeyAnnuel] || [];

      // Rebuild card 2
      body2.innerHTML = "";
      dataMensu.forEach((item, i) => body2.appendChild(buildItemRow(item, i, opts.dataKeyMensu, false, refresh)));
      const st2 = document.createElement("div"); st2.className = "budget-subtotal-row";
      st2.innerHTML = `<span>Sous-total mensuel</span><span class="val">${eur(dataMensu.reduce((s,x)=>s+x.amount,0))}</span>`;
      body2.appendChild(st2);
      body2.appendChild(mkAddBtn("mensuel"));

      // Rebuild card 3
      body3.innerHTML = "";
      dataAnn.forEach((item, i) => body3.appendChild(buildItemRow(item, i, opts.dataKeyAnnuel, true, refresh)));
      const st3 = document.createElement("div"); st3.className = "budget-subtotal-row";
      st3.innerHTML = `<span>Sous-total mensuel</span><span class="val">${eur(dataAnn.reduce((s,x)=>s+x.amount,0)/12)}</span>`;
      body3.appendChild(st3);
      body3.appendChild(mkAddBtn("annuel"));

      // Màj total card 1
      totalEl.textContent = eur(computeColTotal(opts)) + " / mois";
    };

    refresh();
    wrap.appendChild(card1); wrap.appendChild(card2); wrap.appendChild(card3);
    return { el: wrap, refresh };
  }

  // ── Card Investissements (résumé + montant alloué) ───────────────────────
  function buildInvestCard() {
    const wrap = document.createElement("div");
    wrap.style.cssText = "display:flex;flex-direction:column;gap:16px;min-width:0";

    // Card 1 — Résumé
    const card1 = document.createElement("div");
    card1.style.cssText = `background:${COLOR_INV}12;border:1px solid ${COLOR_INV}44;border-radius:var(--radius);padding:14px 16px;animation:fadeUp .35s .16s ease both`;
    card1.innerHTML = `
      <div style="font-family:var(--font-head);font-weight:700;font-size:13px;display:flex;align-items:center;gap:7px">
        <span style="width:9px;height:9px;border-radius:50%;background:${COLOR_INV};flex-shrink:0"></span>
        Investissements — Cible 20%
      </div>
      <div style="font-family:var(--font-mono);font-size:18px;font-weight:500;color:${COLOR_INV};margin-top:4px" id="budget-invest-total">
        ${eur(D.budgetInvestissement)} / mois
      </div>`;

    // Card 2 — Montant mensuel alloué
    const card2 = document.createElement("div");
    card2.style.cssText = `background:${COLOR_INV}08;border:1px solid ${COLOR_INV}30;border-radius:var(--radius);overflow:hidden;animation:fadeUp .35s .22s ease both`;
    const h2 = document.createElement("div");
    h2.style.cssText = `padding:10px 16px;border-bottom:1px solid ${COLOR_INV}20;font-family:var(--font-head);font-weight:700;font-size:12px;color:${COLOR_INV}`;
    h2.textContent = "Montant mensuel alloué";
    const body2 = document.createElement("div");
    body2.style.cssText = "padding:16px";
    body2.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px">
        <input class="form-input" type="number" step="10" id="budget-invest-val" value="${D.budgetInvestissement}"
          style="font-family:var(--font-mono);font-size:18px;color:${COLOR_INV};width:140px;border-color:${COLOR_INV}44">
        <span style="font-size:12px;color:var(--text3)">€ / mois</span>
      </div>`;
    card2.appendChild(h2); card2.appendChild(body2);

    wrap.appendChild(card1); wrap.appendChild(card2);

    setTimeout(() => {
      document.getElementById("budget-invest-val")?.addEventListener("input", e => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v) && v >= 0) {
          D.budgetInvestissement = v;
          const t = document.getElementById("budget-invest-total");
          if (t) t.textContent = eur(v) + " / mois";
          saveData(); refreshAnalysis();
        }
      });
    }, 0);

    return wrap;
  }

  // ── Card Reste à vivre ────────────────────────────────────────────────────
  function buildResteCard() {
    const card = document.createElement("div");
    card.id = "budget-reste-card";
    card.style.cssText = `background:${COLOR_ENV}12;border:1px solid ${COLOR_ENV}44;border-radius:var(--radius);padding:14px 16px;animation:fadeUp .35s .12s ease both`;
    card.innerHTML = `
      <div style="font-family:var(--font-head);font-weight:700;font-size:13px;display:flex;align-items:center;gap:7px;margin-bottom:8px">
        <span id="budget-reste-dot" style="width:9px;height:9px;border-radius:50%;background:${COLOR_ENV};flex-shrink:0"></span>
        Reste à vivre
        <span id="budget-reste-warn" style="display:none;color:#e05050;font-size:14px;line-height:1">⚠</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div style="font-size:11px;color:var(--text3);line-height:1.6">
          Budget qui servira pour les sorties, les loisirs, restos etc.
        </div>
        <div id="budget-reste-val" style="font-family:var(--font-mono);font-size:18px;font-weight:500;color:${COLOR_ENV}">—</div>
      </div>`;
    return card;
  }

  // ── Card Analyse ──────────────────────────────────────────────────────────
  const analysisCard = document.createElement("div"); analysisCard.className = "card"; analysisCard.id = "budget-analysis-card";
  analysisCard.innerHTML = `
    <div class="card-title">
      <span>Analyse — Répartition 50/30/20</span>
      <span id="budget-analysis-warn" style="display:none;color:#e05050;font-size:12px;font-weight:600;gap:6px;align-items:center">
        <span style="font-size:14px;line-height:1">⚠</span>
        Attention, reste à vivre négatif
      </span>
    </div>
    <div class="pie-wrap">
      <svg id="budget-pie" width="160" height="160" viewBox="0 0 160 160" style="flex-shrink:0">
        <circle cx="80" cy="80" r="65" fill="var(--surface2)"/>
      </svg>
      <div class="pie-legend" id="budget-pie-legend"></div>
    </div>`;

  // ── refreshAnalysis : met à jour camembert, légende, reste à vivre ────────
  const refreshAnalysis = () => {
    const B = computeBudget();
    // Envies dans le camembert = budget théorique restant après essentielles + invest
    const enviesPie = Math.max(0, B.salaire > 0 ? B.salaire - B.essentiel - B.invest : B.envies);
    const pieTotal  = B.essentiel + B.invest + enviesPie;
    // Reste à vivre = salaire - toutes les dépenses réelles
    const resteVal  = B.salaire - B.essentiel - B.envies - B.invest;
    const isNeg     = resteVal < 0;

    const segments = [
      { label: "Dépenses essentielles", value: B.essentiel, color: COLOR_ESS },
      { label: "Envies & Projets",      value: enviesPie,   color: COLOR_ENV },
      { label: "Investissements",       value: B.invest,    color: COLOR_INV },
    ];

    drawPie("budget-pie", segments);

    const legendEl = document.getElementById("budget-pie-legend");
    if (legendEl) {
      const targetPcts = [50, 30, 20]; // 50/30/20
      legendEl.innerHTML = segments.map((s, idx) => {
        const pct = pieTotal > 0 ? (s.value / pieTotal * 100) : 0;
        const targetPct = targetPcts[idx] || 0;
        return `<div class="pie-legend-item">
          <span class="pie-legend-dot" style="background:${s.color}"></span>
          <span class="pie-legend-label">${s.label}</span>
          <span class="pie-legend-val">${isNeg ? "-" : eur(s.value)}</span>
          <span class="pie-legend-pct">${isNeg ? "-" : (`${pct.toFixed(1)}%/${targetPct}%`)}</span>
        </div>`;
      }).join("") + `
        <div style="height:1px;background:var(--border);margin:6px 0"></div>
        <div class="pie-legend-item">
          <span class="pie-legend-dot" style="background:transparent;border:none"></span>
          <span class="pie-legend-label" style="color:var(--text2)">Total</span>
          <span class="pie-legend-val" style="color:var(--amber)">${eur(B.salaire)}</span>
          <span class="pie-legend-pct"></span>
        </div>`;
    }

    // Card camembert (warning + rouge si reste à vivre négatif)
    const analysisCardEl = document.getElementById("budget-analysis-card");
    const analysisWarnEl = document.getElementById("budget-analysis-warn");
    if (analysisWarnEl) {
      analysisWarnEl.style.display = isNeg ? "inline-flex" : "none";
    }
    if (analysisCardEl) {
      if (isNeg) {
        analysisCardEl.style.background  = "#e0505012";
        analysisCardEl.style.borderColor = "#e0505044";
      } else {
        analysisCardEl.style.background  = "";
        analysisCardEl.style.borderColor = "";
      }
    }

    // Reste à vivre
    const resteEl      = document.getElementById("budget-reste-val");
    const resteCardEl  = document.getElementById("budget-reste-card");
    const resteDotEl   = document.getElementById("budget-reste-dot");
    const resteWarnEl  = document.getElementById("budget-reste-warn");
    if (resteEl) {
      const color    = isNeg ? "#e05050" : COLOR_ENV;
      resteEl.textContent  = eur(resteVal) + " / mois";
      resteEl.style.color  = color;
      if (resteCardEl) {
        resteCardEl.style.background   = `${color}12`;
        resteCardEl.style.borderColor  = `${color}44`;
      }
      if (resteDotEl)  resteDotEl.style.background  = color;
      if (resteWarnEl) resteWarnEl.style.display     = isNeg ? "inline" : "none";
    }
  };

  // ── Assembler la page ─────────────────────────────────────────────────────

  // Card salaire
  const salCard = document.createElement("div"); salCard.className = "card"; salCard.style.padding = "14px 20px";
  salCard.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div style="font-family:var(--font-head);font-weight:700;font-size:13px">
        Salaire du mois
      </div>
      <div style="font-family:var(--font-mono);font-size:20px;font-weight:500;color:var(--amber)">
        ${eur((D.virements && D.virements.salaireMensuel) || 0)}
      </div>
    </div>`;
  c.appendChild(salCard);

  // Card analyse — juste en dessous du salaire
  c.appendChild(analysisCard);

  // Grille 3 colonnes
  const colGrid = document.createElement("div"); colGrid.className = "budget-cols";

  // Grille descriptions (même hauteur grâce au CSS grid)
  const descGrid = document.createElement("div"); descGrid.className = "budget-cols";
  descGrid.style.cssText = "align-items: stretch";
  descGrid.appendChild(buildDescCard(COLOR_ESS, DESC_ESS));
  descGrid.appendChild(buildDescCard(COLOR_ENV, DESC_ENV));
  descGrid.appendChild(buildDescCard(COLOR_INV, DESC_INV));
  c.appendChild(descGrid);

  // Col 1 — Essentielles
  const optsEss = { color: COLOR_ESS, id: "ess", title: "Dépenses essentielles", desc: DESC_ESS,
    target: "50%", delay: "0s", dataKeyMensu: "budgetEssentiel", dataKeyAnnuel: "budgetAnnuel" };
  const colEss = buildEssentielsCards(optsEss);

  // Col 2 — Envies + Reste
  const optsEnv = { color: COLOR_ENV, id: "env", title: "Envies & Projets courts termes", desc: DESC_ENV,
    target: "30%", delay: ".08s", dataKeyMensu: "budgetEnviesMensu", dataKeyAnnuel: "budgetEnviesAnnuel" };
  const colEnv = buildEssentielsCards(optsEnv);
  const resteCard = buildResteCard();
  colEnv.el.appendChild(resteCard);

  // Col 3 — Investissements
  const colInv = buildInvestCard();

  colGrid.appendChild(colEss.el);
  colGrid.appendChild(colEnv.el);
  colGrid.appendChild(colInv);
  c.appendChild(colGrid);

  // Premier rendu
  refreshAnalysis();
}
