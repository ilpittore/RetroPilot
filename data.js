// ═══════════════════════════════════════════════════════════════
// DATA — defaults (from Excel)
// ═══════════════════════════════════════════════════════════════

const DEFAULTS = {
  compteCourants: [
    { name: "Compte courant 1 (salaire)", bank: "Fortuneo", amount: 311.34 },
    { name: "Compte courant 2 (Appart)", bank: "La poste", amount: 88.75 },
    { name: "Compte courant 3 (PINEL)", bank: "Caisse d'épargne", amount: 229.23 },
    { name: "Compte courant 4 (auto)", bank: "Fortuneo", amount: 257.63 },
    { name: "Compte courant 5 (pro)", bank: "Fortuneo", amount: 1628.27 },
  ],
  livrets: [
    { name: "Livret A", bank: "Fortuneo", amount: 11846.95 },
    { name: "LDDS", bank: "Fortuneo", amount: 10000.00 },
    { name: "Livret de banque 1", bank: "Fortuneo", amount: 18316.08 },
  ],
  plansEpargne: [
    { name: "PERCOL", bank: "Amundi", amount: 9933.73 },
  ],
  enveloppes: { matelas: 10000, economies: 8370.53, factures: 1792.50, projets: 20000 },
  immobilierPerso: 117033.21,
  evolutionCapital: [
    { date: "27/08/2025", patrimoine: 260658.13 },
    { date: "15/09/2025", patrimoine: 264925.26 },
    { date: "05/10/2025", patrimoine: 266514.00 },
    { date: "05/11/2025", patrimoine: 264507.90 },
    { date: "01/01/2026", patrimoine: 328504.57 },
    { date: "01/02/2026", patrimoine: 324606.69 },
  ],
  budgetEssentiel: [
    { label: "Échéance crédit (hors assurance)", account: "Compte courant 2 (Appart)", amount: 657.93 },
    { label: "Charges de copro", account: "Compte courant 2 (Appart)", amount: 90.00 },
    { label: "Fond de travaux", account: "Compte courant 2 (Appart)", amount: 3.99 },
    { label: "Frais tenue de compte", account: "Compte courant 2 (Appart)", amount: 1.90 },
    { label: "Assurance habitation", account: "Compte courant 2 (Appart)", amount: 21.18 },
    { label: "Virement Pinel charges", account: "Compte courant 3 (PINEL)", amount: 52.00 },
    { label: "Virement Pinel loyer", account: "Compte courant 3 (PINEL)", amount: 161.00 },
    { label: "Assurance ADI CARDIFF CE", account: "Compte courant 4 (auto)", amount: 4.04 },
    { label: "Assurance ADI CARDIFF BP", account: "Compte courant 4 (auto)", amount: 9.70 },
    { label: "Assurances MACIF", account: "Compte courant 4 (auto)", amount: 62.24 },
    { label: "Essence", account: "Compte courant 1 (salaire)", amount: 20.00 },
    { label: "Téléphone Free", account: "Compte courant 4 (auto)", amount: 10.00 },
    { label: "Electricité EDF", account: "Compte courant 4 (auto)", amount: 61.00 },
    { label: "Internet Free", account: "Compte courant 4 (auto)", amount: 39.99 },
    { label: "Impôts foncier", account: "Compte courant 4 (auto)", amount: 79.00 },
    { label: "Complémentaire santé", account: "Compte courant 4 (auto)", amount: 7.00 },
    { label: "Courses alimentaires", account: "Compte courant 1 (salaire)", amount: 250.00 },
    { label: "Paiement Morgane", account: "Compte courant 1 (salaire)", amount: -482.00 },
    { label: "Abonnement Real Debrid", account: "Compte courant 1 (salaire)", amount: 4.00 },
    { label: "Abonnement GeForceNow", account: "Compte courant 1 (salaire)", amount: 10.99 },
  ],
  budgetAnnuel: [
    { label: "Entretien véhicule (Septembre)", amount: 200 },
    { label: "Impôts sur le revenu (Septembre)", amount: 960 },
    { label: "Sport (Septembre)", amount: 500 },
    { label: "Taxe foncière (Septembre)", amount: 971 },
  ],
  budgetEnviesMensu: [
    { label: "...", account: "Compte courant 1 (salaire)", amount: 0 },
  ],
  budgetEnviesAnnuel: [
    { label: "...", amount: 0 },
  ],
  budgetInvestissement: 500,
  etfPositions: [
    { account:"PEA", name:"BNP Easy SP500", ticker:"ESE", qty:808, pru:26.653, price:29.58, cost:21535.62, market:23904.52, pnl:2368.89, perf:11.00, weight:26.6 },
    { account:"PEA", name:"Amundi PEA S&P500", ticker:"PE500", qty:287, pru:28.14, price:31.05, cost:8076.18, market:8911.35, pnl:835.17, perf:10.34, weight:9.9 },
    { account:"PEA", name:"Lyxor MSCI World", ticker:"EWLD", qty:344, pru:35.62, price:38.44, cost:12253.28, market:13223.36, pnl:970.08, perf:7.92, weight:14.7 },
    { account:"CTO", name:"Amundi MSCI EM", ticker:"AEEM", qty:215, pru:22.18, price:24.30, cost:4768.70, market:5224.50, pnl:455.80, perf:9.56, weight:5.8 },
    { account:"PEA", name:"BNP Easy Nasdaq", ticker:"NASD", qty:120, pru:48.20, price:53.10, cost:5784.00, market:6372.00, pnl:588.00, perf:10.17, weight:7.1 },
  ],
  stockPositions: [
    { account:"CTO", name:"LVMH", ticker:"MC", qty:12, pru:680.00, price:720.50, cost:8160.00, market:8646.00, pnl:486.00, perf:5.96, weight:9.6 },
    { account:"CTO", name:"Air Liquide", ticker:"AI", qty:35, pru:154.20, price:162.80, cost:5397.00, market:5698.00, pnl:301.00, perf:5.58, weight:6.3 },
    { account:"CTO", name:"TotalEnergies", ticker:"TTE", qty:55, pru:58.40, price:61.20, cost:3212.00, market:3366.00, pnl:154.00, perf:4.79, weight:3.7 },
    { account:"PEA", name:"Hermès", ticker:"RMS", qty:4, pru:1920.00, price:2050.00, cost:7680.00, market:8200.00, pnl:520.00, perf:6.77, weight:9.1 },
  ],
  cryptoPositions: [
    { account:"Trade Republic", name:"Ethereum", ticker:"ETH", qty:4.82, pru:1820.00, price:1940.50, cost:8772.40, market:9353.21, pnl:580.81, perf:6.62, weight:15.3 },
    { account:"Trade Republic", name:"USDC", ticker:"USDC", qty:1078, pru:0.85, price:0.86, cost:916.30, market:929.15, pnl:12.85, perf:1.40, weight:12.3 },
    { account:"Trade Republic", name:"Bitcoin", ticker:"BTC", qty:0.0581, pru:60912.66, price:60928.68, cost:3536.28, market:3537.21, pnl:0.93, perf:0.03, weight:46.8 },
    { account:"Ledger", name:"Bitcoin", ticker:"BTC", qty:0.0023, pru:56612.00, price:60928.68, cost:128.99, market:138.83, pnl:9.84, perf:7.63, weight:1.8 },
    { account:"Ledger", name:"Solana", ticker:"SOL", qty:2.0755, pru:69.00, price:76.45, cost:143.21, market:158.68, pnl:15.47, perf:10.80, weight:2.1 },
  ],
  loans: [
    {
      id: 1, name:"Résidence principale",
      purchasePrice:160792, notaryFees:8000, guaranteeFees:1500, dossierFees:500, apport:3547.46,
      loanAmount:167244.54, rate:1.67, duration:300, insuranceRate:0.36,
      startDate:"2021-03",
    },
    {
      id: 2, name:"Investissement locatif (PINEL)",
      purchasePrice:260000, notaryFees:15000, guaranteeFees:3000, dossierFees:1000, apport:117166,
      loanAmount:161834, rate:1.64, duration:300, insuranceRate:0.36,
      startDate:"2022-09",
    },
  ],
  nextLoanId: 3,
  allocationReel:  [8.84, 62.84, 23.06, 5.27, 0],
  allocationCible: [5.00, 60.00, 30.00, 5.00, 0],
  allocationCats:  ["IMMO","ETF","ACTIONS","CRYPTO","ALTERNATIF"],
  analyseCats: ["Logement","Transports","Alimentation","Abonnements","Santé","Loisirs et divertissements","Frais professionnels","Investissements","Impots","Frais divers","Shopping","Scolarité","Perso","Crédits à la consommation"],

  livretEnveloppes: [
    { id:"matelas",  name:"Matelas de sécurité", color:"#f0a020", solde:10000,  objectif:10000, desc:"Fonds d'urgence — accessible à tout moment" },
    { id:"economies",name:"Économies & Projets",  color:"#5898d8", solde:8370.53,objectif:0,     desc:"Voyages, gros achats, projets à court terme" },
    { id:"factures", name:"Factures annuelles",   color:"#a0c878", solde:1792.5, objectif:2610,  desc:"Anticiper les grosses factures de l'année" },
    { id:"projets",  name:"Projets long terme",   color:"#c868a8", solde:20000,  objectif:0,     desc:"Projets long terme ou réserve exceptionnelle" },
  ],
  livretMouvements: [
    { date:"2025-01-01", label:"Reste au 1er janvier",           matelas_add:4848.55, economies_add:4674.32, factures_add:1540   },
    { date:"2025-01-01", label:"Avance impôts",                                        economies_add:1280                         },
    { date:"2025-06-01", label:"Mise matelas chômage",            matelas_add:10000,   economies_ret:10000                        },
    { date:"2025-07-05", label:"Matériel vélo",                                        economies_ret:2300                         },
    { date:"2025-07-23", label:"Remboursement MacBook Pro",                            economies_add:968                          },
    { date:"2025-07-24", label:"Indem licenciement + CSE",                             economies_add:17425                        },
    { date:"2025-07-30", label:"Billets avion",                                        economies_ret:705                          },
    { date:"2025-08-05", label:"Vente PEE",                                            economies_add:45300                        },
    { date:"2025-08-21", label:"Achat formation SPAQ",                                 economies_ret:3000                         },
    { date:"2025-09-01", label:"Vidange factures → matelas",      matelas_add:4671.55, economies_add:5496.55, factures_ret:825    },
    { date:"2025-09-10", label:"Virements septembre",                                                          factures_add:217.5  },
    { date:"2025-10-10", label:"Balance octobre",                                      economies_add:2345,    projets_add:2345    },
    { date:"2025-10-21", label:"Achat ETF 2/5",                                        economies_ret:4224                         },
    { date:"2025-10-30", label:"Achat ETF 3/5",                                        economies_ret:5160                         },
    { date:"2025-11-05", label:"Achat ETF 4/5",                                        economies_ret:5160                         },
    { date:"2025-11-13", label:"Achat ETF 5/5",                                        economies_ret:5160                         },
    { date:"2025-11-06", label:"Invest actions",                                        economies_ret:6000                         },
    { date:"2025-12-01", label:"Décembre — virements",            matelas_add:0,       economies_ret:2500,    factures_add:217.5  },
    { date:"2025-12-18", label:"Chômage (1/2)",                                        economies_add:10870.65                     },
    { date:"2025-12-25", label:"Héritage",                                             economies_add:50000                        },
    { date:"2025-12-31", label:"Intérêts 2025",                                        economies_add:395.23                       },
    { date:"2026-01-06", label:"Janvier — virements",             matelas_add:0,       economies_ret:2500,    factures_add:217.5  },
    { date:"2026-01-15", label:"Avance PINEL",                                         economies_add:1280                         },
    { date:"2026-01-15", label:"Cadeaux de Noël",                                      economies_ret:500                          },
    { date:"2026-01-15", label:"Vente vélo",                                           economies_add:950                          },
    { date:"2026-02-01", label:"Virement CC salaire",                                  economies_ret:2500                         },
    { date:"2026-02-01", label:"Février — virements",             matelas_add:0,       economies_add:0,       factures_add:220    },
    { date:"2026-02-12", label:"Achat AMAZON",                                         economies_ret:3700                         },
    { date:"2026-02-15", label:"Achat BTC",                                            economies_ret:3500                         },
    { date:"2026-02-16", label:"Achat voiture",                                        economies_ret:20000,   projets_ret:20000   },
    { date:"2026-02-16", label:"Virement IBKR (1)",                                    economies_ret:10000                        },
    { date:"2026-02-21", label:"Virement IBKR (2)",                                    economies_ret:5000                         },
    { date:"2026-03-01", label:"Mars — virements",                matelas_add:0,       economies_ret:2000,    factures_add:220    },
    { date:"2026-03-01", label:"Virement IBKR (3)",                                    economies_ret:5000                         },
  ],
  analyseTypes: ["Prélévée sur compte bancaire crédit (si proprio)","Dépenses mensu. fixes prélevées sur compte courant","Dépenses essentielles payées par CB","Grosses factures payée en une fois à mensualiser","Dépenses de type envies","Dépenses imprévues"],
  analyseDepenses: [
    {nom:"Loyer",montant:400,categorie:"Logement",type:"Prélévée sur compte bancaire crédit (si proprio)",note:""},
    {nom:"Glaces",montant:11.6,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Invest Binance",montant:100,categorie:"Investissements",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Essence",montant:10.48,categorie:"Transports",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Bar",montant:25,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Bar",montant:7,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Essence",montant:13.99,categorie:"Transports",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Leroy Merlin",montant:8.68,categorie:"Frais divers",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Investissement PEA",montant:400,categorie:"Investissements",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Intermarché",montant:4.13,categorie:"Alimentation",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Peage tunnel",montant:1.3,categorie:"Transports",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Leroy Merlin",montant:15.48,categorie:"Frais divers",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"PEA",montant:100,categorie:"Investissements",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Capcut",montant:11.99,categorie:"Frais professionnels",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Kebab",montant:11,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Velov",montant:2,categorie:"Transports",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Club",montant:59,categorie:"Frais professionnels",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Essence",montant:28,categorie:"Transports",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Chaise de bureau",montant:279.99,categorie:"Frais professionnels",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Bus",montant:2.1,categorie:"Transports",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Retrait liquide voyage",montant:40,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Mariage",montant:50,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Mariage",montant:2,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Pharmacie",montant:9.98,categorie:"Santé",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Bar",montant:9,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Resto",montant:23,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Loc voiture",montant:54.32,categorie:"Transports",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Resto",montant:9.6,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Bus",montant:2.1,categorie:"Transports",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Intermarché",montant:3.47,categorie:"Alimentation",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Disque dur",montant:102.68,categorie:"Frais professionnels",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Intermarché",montant:1.2,categorie:"Alimentation",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Resto",montant:6.8,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Auchan",montant:4.46,categorie:"Alimentation",type:"Dépenses essentielles payées par CB",note:""},
    {nom:"Abonnement salle de sport",montant:550,categorie:"Santé",type:"Grosses factures payée en une fois à mensualiser",note:""},
    {nom:"Resto",montant:10,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Bar",montant:12,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Glaces",montant:11.6,categorie:"Loisirs et divertissements",type:"Dépenses de type envies",note:""},
    {nom:"Charges de copro",montant:45.5,categorie:"Logement",type:"Prélévée sur compte bancaire crédit (si proprio)",note:""},
    {nom:"Abonnement bus",montant:37,categorie:"Transports",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Revision de la voiture",montant:400,categorie:"Transports",type:"Grosses factures payée en une fois à mensualiser",note:""},
    {nom:"Échéance crédit (Hors assurance)",montant:657.93,categorie:"Logement",type:"Prélévée sur compte bancaire crédit (si proprio)",note:""},
    {nom:"Charges de copro",montant:85,categorie:"Logement",type:"Prélévée sur compte bancaire crédit (si proprio)",note:""},
    {nom:"Fond de travaux",montant:15,categorie:"Logement",type:"Prélévée sur compte bancaire crédit (si proprio)",note:""},
    {nom:"Frais de tenue de compte",montant:5,categorie:"Logement",type:"Prélévée sur compte bancaire crédit (si proprio)",note:""},
    {nom:"Assurance habitation",montant:20,categorie:"Transports",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Assurances voiture",montant:26.45,categorie:"Transports",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Assurance moto",montant:31.56,categorie:"Transports",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Telephone portable",montant:10,categorie:"Abonnements",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Electricité EDF",montant:35.92,categorie:"Abonnements",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Internet fixe + Amazon prime",montant:29.99,categorie:"Abonnements",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Impots foncier",montant:74,categorie:"Impots",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Complémentaire santé",montant:7,categorie:"Santé",type:"Dépenses mensu. fixes prélevées sur compte courant",note:""},
    {nom:"Plombier",montant:250,categorie:"Logement",type:"Dépenses imprévues",note:""},
  ],
  virements: {
    salaireMensuel: 2500,
    comptesCourants: [
      { name:"Compte courant 1 (salaire)", bank:"Fortuneo",        actif:true,  montant:0,   note:"Reste sur ce compte" },
      { name:"Compte courant 2 (Appart)",  bank:"La poste",        actif:true,  montant:776  },
      { name:"Compte courant 3 (PINEL)",   bank:"Caisse d'épargne",actif:true,  montant:213  },
      { name:"Compte courant 4 (auto)",    bank:"Fortuneo",        actif:true,  montant:273  },
      { name:"Compte courant 5 (pro)",     bank:"Fortuneo",        actif:false, montant:0    },
    ],
    livrets: [
      { name:"LDDS (matelas)",  bank:"Fortuneo", actif:false, montant:0   },
      { name:"Livret A (éco.)", bank:"Fortuneo", actif:true,  montant:0   },
      { name:"Livret A (fact.)",bank:"Fortuneo", actif:true,  montant:220 },
    ],
    investissements: [
      { name:"PEA",          bank:"Trade Republic", actif:true,  montant:0  },
      { name:"CTO 1",        bank:"Trade Republic", actif:false, montant:75 },
      { name:"CTO 2",        bank:"IBKR",           actif:true,  montant:0  },
      { name:"Assurance vie",bank:"Fortuneo",       actif:false, montant:0  },
      { name:"Binance",      bank:"Binance",        actif:false, montant:50 },
    ],
    hasDettes: false,
    dettesMontant: 0,
    moisMatelas: 6,
    dcaETF: 50, dcaActions: 40, dcaCrypto: 10, dcaImmo: 0,
  },
  lastUpdated: null,
};

// ═══════════════════════════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = "monpatrimoine_v2";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return JSON.parse(JSON.stringify(DEFAULTS));
}

function saveData() {
  D.lastUpdated = new Date().toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(D));
  const el = document.getElementById("sidebar-footer");
  if (el) el.textContent = "Dernière MAJ : " + D.lastUpdated;
}

let D = loadData();

// Migration : garantit que toutes les clés existent même sur des données anciennes
function migrateData() {
  const def = DEFAULTS;
  // Clés de premier niveau manquantes
  if (!D.virements)           D.virements           = JSON.parse(JSON.stringify(def.virements));
  if (!D.livretEnveloppes)   D.livretEnveloppes   = JSON.parse(JSON.stringify(def.livretEnveloppes));
  if (!D.livretMouvements)   D.livretMouvements   = JSON.parse(JSON.stringify(def.livretMouvements));
  if (!D.analyseDepenses)  D.analyseDepenses  = JSON.parse(JSON.stringify(def.analyseDepenses));
  if (!D.analyseCats)      D.analyseCats      = [...def.analyseCats];
  if (!D.analyseTypes)     D.analyseTypes     = [...def.analyseTypes];
  if (!D.budgetEnviesMensu)  D.budgetEnviesMensu  = JSON.parse(JSON.stringify(def.budgetEnviesMensu));
  if (!D.budgetEnviesAnnuel) D.budgetEnviesAnnuel = JSON.parse(JSON.stringify(def.budgetEnviesAnnuel));
  // Migrer l'ancien budgetEnvies (scalaire) vers le nouveau format si besoin
  if (D.budgetEnvies != null) { delete D.budgetEnvies; }
  if (D.nextLoanId == null)   D.nextLoanId           = def.nextLoanId;
  // Sous-clés virements manquantes (si virements existait mais était incomplet)
  const vdef = def.virements;
  const v = D.virements;
  if (!v.comptesCourants)    v.comptesCourants    = JSON.parse(JSON.stringify(vdef.comptesCourants));
  if (!v.livrets)            v.livrets            = JSON.parse(JSON.stringify(vdef.livrets));
  if (!v.investissements)    v.investissements    = JSON.parse(JSON.stringify(vdef.investissements));
  if (v.salaireMensuel == null) v.salaireMensuel  = vdef.salaireMensuel;
  if (v.moisMatelas    == null) v.moisMatelas     = vdef.moisMatelas;
  if (v.hasDettes      == null) v.hasDettes       = vdef.hasDettes;
  if (v.dettesMontant  == null) v.dettesMontant   = vdef.dettesMontant;
  if (v.dcaETF         == null) v.dcaETF          = vdef.dcaETF;
  if (v.dcaActions     == null) v.dcaActions      = vdef.dcaActions;
  if (v.dcaCrypto      == null) v.dcaCrypto       = vdef.dcaCrypto;
  if (v.dcaImmo        == null) v.dcaImmo         = vdef.dcaImmo;
}
migrateData();
