# MonPatrimoine — Documentation de référence

> Application web de suivi patrimonial personnel.  
> Stack : HTML + CSS + JavaScript vanilla, sans framework, sans build tool.  
> Données : 100% locales via `localStorage`, aucun serveur requis.

---

## Lancer le projet

```bash
# Depuis le dossier monpatrimoine/
python3 -m http.server 8080
# Puis ouvrir : http://localhost:8080
```

> ⚠️ Un serveur local est nécessaire car les modules JS sont chargés via `<script src="...">`. L'ouverture directe du fichier `index.html` en `file://` ne fonctionnera pas.

---

## Architecture des fichiers

```
monpatrimoine/
├── index.html              ← Structure HTML, nav sidebar, imports scripts
├── style.css               ← Tout le CSS (variables, composants, pages)
├── data.js                 ← Données par défaut, persistance localStorage
├── utils.js                ← Router, fonctions utilitaires partagées
├── main.js                 ← Point d'entrée, init, event listeners nav
├── pages/
│   ├── dashboard.js        ← Vue d'ensemble patrimoine
│   ├── patrimoine.js       ← Actifs (comptes, livrets, immobilier, investissements)
│   ├── budget.js           ← Budget mensuel 50/30/20
│   ├── livret.js           ← Livret par enveloppes (Matelas, Économies, Factures, Projets)
│   ├── virements.js        ← Plan de virements mensuels
│   ├── investissements.js  ← Portefeuille ETF, Actions, Crypto
│   ├── credits.js          ← Crédits immobiliers + tableaux d'amortissement
│   ├── analyse.js          ← Analyse des dépenses par catégorie
│   └── parametres.js       ← Sauvegarde, taux de change, banques
└── README.md
```

### Ordre de chargement des scripts (dans `index.html`)

```html
<script src="data.js"></script>       <!-- 1. Données globales D -->
<script src="utils.js"></script>      <!-- 2. Router + utilitaires -->
<script src="pages/dashboard.js"></script>
<script src="pages/patrimoine.js"></script>
<script src="pages/budget.js"></script>
<script src="pages/livret.js"></script>
<script src="pages/virements.js"></script>
<script src="pages/investissements.js"></script>
<script src="pages/credits.js"></script>
<script src="pages/analyse.js"></script>
<script src="pages/parametres.js"></script>
<script src="main.js"></script>       <!-- 3. Init en dernier -->
```

**Règle importante :** `data.js` et `utils.js` doivent toujours être chargés avant les pages. `main.js` doit toujours être chargé en dernier.

---

## data.js — Données et persistance

### Variable globale `D`

Toute l'application lit et écrit dans l'objet global `D`. Il est initialisé depuis le `localStorage` au démarrage, ou depuis `DEFAULTS` si aucune donnée sauvegardée n'existe.

```js
let D = loadData(); // Charge depuis localStorage ou clone DEFAULTS
migrateData();      // Complète les clés manquantes pour la rétrocompatibilité
```

### Structure de `DEFAULTS` (et donc de `D`)

| Clé | Type | Description |
|---|---|---|
| `compteCourants` | `Array` | Comptes courants `{ name, bank, amount }` |
| `livrets` | `Array` | Livrets d'épargne `{ name, bank, amount }` |
| `plansEpargne` | `Array` | PEA, PER, assurances vie `{ name, bank, amount }` |
| `immobilierPerso` | `Number` | Valeur du bien immobilier principal |
| `budgetEssentiel` | `Array` | Dépenses essentielles mensuelles `{ label, account, amount }` |
| `budgetAnnuel` | `Array` | Dépenses essentielles annuelles à mensualiser `{ label, amount }` |
| `budgetEnviesMensu` | `Array` | Envies/projets mensuels `{ label, account, amount }` |
| `budgetEnviesAnnuel` | `Array` | Envies/projets annuels `{ label, amount }` |
| `budgetInvestissement` | `Number` | Montant mensuel alloué aux investissements |
| `livretEnveloppes` | `Array` | Enveloppes du livret `{ id, name, color, solde, objectif, desc }` |
| `livretMouvements` | `Array` | Journal des mouvements `{ date, label, matelas_add, economies_ret, ... }` |
| `virements` | `Object` | Plan de virements (salaire, CC, livrets, investissements, DCA) |
| `etfPositions` | `Array` | Positions ETF `{ account, name, ticker, qty, pru, price, cost, market, pnl }` |
| `stockPositions` | `Array` | Positions actions (même structure) |
| `cryptoPositions` | `Array` | Positions crypto (même structure) |
| `loans` | `Array` | Crédits immobiliers (voir section Crédits) |
| `nextLoanId` | `Number` | Auto-incrément pour les IDs de crédit |
| `allocationReel` | `Array` | Allocation réelle en % `[immo, etf, actions, crypto, alternatif]` |
| `allocationCible` | `Array` | Allocation cible en % |
| `analyseCats` | `Array` | Liste des catégories de dépenses |
| `analyseTypes` | `Array` | Liste des types de dépenses |
| `analyseDepenses` | `Array` | Journal des dépenses `{ nom, montant, categorie, type, note }` |
| `banks` | `Array` | Liste des banques (éditable dans Paramètres) |

### Fonctions de persistance

```js
loadData()    // → Object  : lit localStorage, retourne DEFAULTS si vide
saveData()    // → void    : sérialise D dans localStorage (clé: "monpatrimoine_v2")
migrateData() // → void    : complète D avec les clés manquantes (rétrocompat)
```

**Clé localStorage :** `monpatrimoine_v2`

### Ajouter une nouvelle clé de données

1. L'ajouter dans `DEFAULTS` dans `data.js`
2. Ajouter la migration dans `migrateData()` :
   ```js
   if (!D.maCle) D.maCle = JSON.parse(JSON.stringify(def.maCle));
   ```
3. Appeler `saveData()` après chaque modification de `D`

---

## utils.js — Router et utilitaires partagés

### Router

```js
const PAGES = { dashboard, patrimoine, budget, livret, virements, ... }
let currentPage = "dashboard"

navigate(page)  // Change de page : met à jour le titre, la nav, appelle render()
render()        // Vide #content et appelle la fonction de page courante
```

**Ajouter un nouvel onglet :**
1. Créer `pages/mononglet.js` avec `function mononglet(c) { ... }`
2. Ajouter dans `PAGES` : `mononglet: { title:"...", sub:"..." }`
3. Ajouter dans `render()` : `const pages = { ..., mononglet, ... }`
4. Ajouter le `<script src="pages/mononglet.js">` dans `index.html` avant `main.js`
5. Ajouter l'entrée nav dans `index.html`

### Fonctions utilitaires

```js
// Formatage
eur(n)                          // → "1 234,56 €"  (Intl.NumberFormat fr-FR)
pct(n)                          // → "+1.23%"
sum(arr, key)                   // → somme de arr[i][key]

// UI
toast(msg)                      // Notification temporaire en bas d'écran (2.5s)
confirmModal(titleHtml, subtitle, onConfirm)  // Modale de confirmation styled
makeEditableAmount(value, onSave, largeFont)  // Span cliquable → input inline
toggleSidebar() / closeSidebar()             // Gestion sidebar mobile

// Computed
computePatrimoine()             // → { cash, livrets, plans, invest, total, cats }
computeBudget()                 // → { essentiel, envies, invest, salaire, resteAVivre }

// Composants
buildAccountTable(section, title)  // Table éditable de comptes (patrimoine)
drawEvoChart(container)            // Graphique SVG d'évolution du patrimoine
```

---

## index.html — Structure HTML

Fichier statique (~91 lignes). Contient uniquement :
- Les balises `<head>` avec les fonts Google et le lien `style.css`
- La sidebar avec les `nav-item` (chacun porte un attribut `data-page`)
- La structure `#main > #topbar + #content`
- La `<div id="toast">`
- Les balises `<script>` dans l'ordre de chargement

**Modifier la navigation :** ajouter un `<div class="nav-item" data-page="monpage">` dans le `<nav>` de la sidebar.

---

## style.css — Design system

### Variables CSS (`:root`)

#### Palette de couleurs

| Variable | Valeur | Usage |
|---|---|---|
| `--bg` | `#0f0e0c` | Fond principal |
| `--bg2` | `#161410` | Fond sidebar |
| `--surface` | `#1c1a16` | Cartes, panneaux |
| `--surface2` | `#242118` | Hover, alternances |
| `--border` | `#2e2b22` | Bordures légères |
| `--border2` | `#3a3628` | Bordures marquées |
| `--text` | `#f0ead8` | Texte principal |
| `--text2` | `#a09880` | Texte secondaire |
| `--text3` | `#6a6250` | Texte tertiaire, labels |
| `--amber` | `#f0a020` | Accent principal, valeurs clés |
| `--amber-dim` | `#f0a02022` | Fond amber translucide |
| `--gain` | `#34c77b` | Valeurs positives, gains |
| `--loss` | `#e05050` | Valeurs négatives, pertes |

#### Palette graphiques

| Variable | Valeur | Usage conventionnel |
|---|---|---|
| `--chart1` | `#f0a020` | Amber / ETF |
| `--chart2` | `#f5c842` | Jaune / Livrets |
| `--chart3` | `#e87830` | Orange / Annuel |
| `--chart4` | `#a0c878` | Vert clair / Cash |
| `--chart5` | `#5898d8` | Bleu / Envies, CC |
| `--chart6` | `#c868a8` | Violet / Projets |

#### Couleurs codifiées par onglet Budget

| Couleur | Hex | Colonne |
|---|---|---|
| Orange | `#e87830` | Essentielles (50%) |
| Bleu | `#5898d8` | Envies & Projets (30%) |
| Vert | `#34c77b` | Investissements (20%) |

#### Typographie

| Variable | Valeur | Usage |
|---|---|---|
| `--font-body` | `Instrument Sans` | Corps de texte, labels |
| `--font-mono` | `DM Mono` | **Tous les montants et données numériques** |
| `--font-head` | `Syne` | Titres, noms de sections |

> **Règle stricte :** tout montant, date, pourcentage, ou donnée chiffrée utilise `var(--font-mono)`.

#### Espacements et formes

```css
--radius:    12px   /* Rayon des cartes */
--radius-sm:  8px   /* Rayon des boutons, inputs */
--sidebar-w: 220px
--header-h:   56px
```

### Composants CSS principaux

| Classe | Description |
|---|---|
| `.card` | Carte de base (surface + bordure + padding + animation fadeUp) |
| `.card-title` | Titre de carte (Syne, bold) |
| `.stats-grid` | Grille de KPIs responsive |
| `.stat-card` | Carte KPI individuelle |
| `.btn` | Bouton de base |
| `.btn-primary` | Bouton amber (action principale) |
| `.btn-ghost` | Bouton transparent (action secondaire) |
| `.btn-sm` | Modificateur taille réduite |
| `.form-input` | Input stylé dark |
| `.form-group` | Wrapper label + input |
| `.form-actions` | Ligne de boutons de formulaire |
| `.account-row` | Ligne de compte éditable |
| `.budget-col` | Colonne budget (3-colonnes) |
| `.env-card` | Carte enveloppe livret |
| `.mvt-table` | Table mouvements livret |
| `.dep-table` | Table dépenses analyse |
| `.credit-card` | Carte de crédit avec KPIs |
| `.amort-table` | Table d'amortissement |
| `.settings-block` | Bloc paramètres |
| `.vir-row` | Ligne de virement |
| `.filter-chip` | Chip de filtre actif/inactif |

---

## Pages — Référence par fichier

### `pages/dashboard.js`
**Fonction :** `dashboard(c)`  
Vue d'ensemble : KPIs patrimoine total, répartition graphique SVG, derniers crédits, allocation.

### `pages/patrimoine.js`
**Fonction :** `patrimoine(c)`  
Tableaux éditables par catégorie : comptes courants, livrets, plans d'épargne, immobilier, investissements.  
Utilise `buildAccountTable()` de `utils.js`.

### `pages/budget.js`
**Fonction :** `budget(c)`  
Trois colonnes (Essentielles / Envies / Investissements) + camembert SVG 50/30/20.

Fonctions internes :
```js
drawPie(canvasId, segments)   // Dessine le camembert dans un <svg id="...">
buildCol(opts)                // Construit une colonne éditable (mensuel + annuel)
buildInvestCol()              // Colonne investissement (champ unique)
refreshAnalysis()             // Met à jour camembert + bannière reste à vivre
```

**Logique :**
```
Reste à vivre = D.virements.salaireMensuel − essentielTotal − D.budgetInvestissement
essentielTotal = Σ(budgetEssentiel) + Σ(budgetAnnuel)/12
```

Le salaire est **toujours lu depuis `D.virements.salaireMensuel`** — il se configure dans l'onglet Virements.

### `pages/livret.js`
**Fonctions :**
```js
livretComputeSoldes()    // Recalcule les soldes depuis les mouvements (source of truth)
livretTotalLivret()      // Somme totale de toutes les enveloppes
livret(c)                // Page principale
livretEditEnv(idx)       // Modale d'édition objectif/description d'une enveloppe
```

**Structure des données :**

```js
// D.livretEnveloppes
{ id: "matelas", name: "Matelas de sécurité", color: "#f0a020", objectif: 10000, desc: "..." }

// D.livretMouvements — les montants sont nommés {id_enveloppe}_{add|ret}
{ date: "2025-06-01", label: "Virements juin", matelas_add: 0, economies_add: 200, factures_add: 217.5 }
```

> Les soldes ne sont **jamais stockés directement** — ils sont toujours recalculés depuis les mouvements par `livretComputeSoldes()`. C'est la source de vérité.

**Les 4 enveloppes par défaut :**

| id | Nom | Couleur |
|---|---|---|
| `matelas` | Matelas de sécurité | `#f0a020` (amber) |
| `economies` | Économies & Projets | `#5898d8` (bleu) |
| `factures` | Factures annuelles | `#a0c878` (vert) |
| `projets` | Projets long terme | `#c868a8` (violet) |

### `pages/virements.js`
**Fonction :** `virements(c)`  
Plan de virements mensuel en 3 étapes (dettes → matelas → investissements).  
Le champ salaire ici est la **source** lue par `budget.js`.

**Structure `D.virements` :**
```js
{
  salaireMensuel: 2500,
  comptesCourants: [{ name, bank, actif, montant }],
  livrets:         [{ name, bank, actif, montant }],
  investissements: [{ name, bank, actif, montant }],
  hasDettes: false,
  dettesMontant: 0,
  moisMatelas: 6,
  dcaETF: 50, dcaActions: 40, dcaCrypto: 10, dcaImmo: 0,
}
```

### `pages/investissements.js`
**Fonction :** `investissements(c)`  
Portefeuille ETF, actions, crypto. Affiche positions, P&L, performances.

### `pages/credits.js`
**Fonctions :**
```js
calcMensualite(capital, tauxAnnuel, dureeM)  // Formule amortissement standard
buildAmortTable(loan)                         // Génère le tableau complet (N lignes)
loanKPIs(loan)                                // KPIs à date (capital restant, coût, etc.)
openCreditForm(existingLoan)                  // Modale CRUD crédit
credits(c)                                    // Page principale
```

**Structure d'un crédit `D.loans[i]` :**
```js
{
  id, name, startDate,           // Identité
  purchasePrice, notaryFees, guaranteeFees, dossierFees, apport,
  loanAmount,                    // = purchasePrice + fees - apport (calculé)
  rate,                          // Taux annuel en %
  duration,                      // Durée en mois
  insuranceRate,                 // Taux assurance annuel en %
}
```

### `pages/analyse.js`
**Fonctions :**
```js
getCatColor(cat)    // Couleur d'une catégorie (palette CAT_COLORS)
getTypeColor(type)  // Couleur d'un type de dépense
analyse(c)          // Page principale
```

**Structure `D.analyseDepenses[i]` :**
```js
{ nom, montant, categorie, type, note }
```

### `pages/parametres.js`
**Fonctions :**
```js
parametres(c)   // Page principale (sauvegarde, banques, taux de change, à propos)
fetchFxRates()  // Fetch depuis open.er-api.com avec fallback frankfurter.app
```

---

## main.js — Initialisation

Fichier minimal (~18 lignes). Chargé en **dernier**.

```js
// Attache les clicks de navigation sur les .nav-item
document.querySelectorAll(".nav-item[data-page]").forEach(el => {
  el.addEventListener("click", () => navigate(el.dataset.page));
});

// Premier rendu
render();
```

---

## Conventions de code

### Pattern de page

Chaque page suit le même pattern :

```js
function maPage(c) {
  // c = #content (div vide à remplir)
  
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `...`;
  c.appendChild(card);
  
  // Event listeners
  document.getElementById("mon-btn")?.addEventListener("click", () => {
    // Modifier D
    D.macle = nouvelleValeur;
    saveData();
    toast("Mis à jour ✓");
    // Re-render si besoin
    maPage(c); // ou render() pour re-render la page entière
  });
}
```

### Modifier une donnée

```js
// 1. Modifier D
D.budgetEssentiel.push({ label: "Loyer", account: "CC1", amount: 800 });

// 2. Sauvegarder
saveData();

// 3. Notifier (optionnel)
toast("Dépense ajoutée ✓");

// 4. Mettre à jour l'UI (re-render local ou complet)
render();
```

### Modale de confirmation

```js
confirmModal(
  `Supprimer "<strong>${item.label}</strong>" ?`,  // HTML autorisé
  "Cette action est irréversible.",                 // Sous-titre
  () => {                                           // Callback si confirmé
    D.tableau.splice(idx, 1);
    saveData();
    render();
  }
);
```

### Montant éditable inline

```js
const amtEl = makeEditableAmount(item.amount, (nouvelleValeur) => {
  item.amount = nouvelleValeur;
  saveData();
  toast("Mis à jour ✓");
});
row.appendChild(amtEl);
```

---

## Sauvegarde et migration

### Export / Import

Disponibles dans l'onglet **Paramètres** :
- **Exporter** : télécharge `monpatrimoine_YYYY-MM-DD.json` (sérialisation complète de `D`)
- **Importer** : charge un fichier `.json`, écrase `D`, appelle `saveData()` + `render()`
- **Réinitialiser** : supprime la clé `localStorage` et recharge la page

### Ajouter une clé et maintenir la rétrocompatibilité

Quand une nouvelle clé est ajoutée à `DEFAULTS`, l'ajouter dans `migrateData()` pour que les utilisateurs avec des données existantes ne cassent pas :

```js
// Dans migrateData() — data.js
if (!D.maNouvelleClé) D.maNouvelleClé = JSON.parse(JSON.stringify(def.maNouvelleClé));
// Pour les scalaires :
if (D.monScalaire == null) D.monScalaire = def.monScalaire;
```

---

## Checklist — Ajouter un onglet complet

- [ ] Créer `pages/mononglet.js` avec `function mononglet(c) { ... }`
- [ ] Ajouter les données dans `DEFAULTS` (`data.js`)
- [ ] Ajouter la migration dans `migrateData()` (`data.js`)
- [ ] Ajouter dans `const PAGES` (`utils.js`)
- [ ] Ajouter dans `render()` → `const pages = { ..., mononglet }` (`utils.js`)
- [ ] Ajouter le CSS si nécessaire (`style.css`)
- [ ] Ajouter `<div class="nav-item" data-page="mononglet">` dans `index.html`
- [ ] Ajouter `<script src="pages/mononglet.js">` avant `main.js` dans `index.html`
