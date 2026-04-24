import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

const STORAGE_KEY = "patrimieux_v2_complete";

const LEVEL_IMAGES = {
  prehistoire: "/levels/prehistoire.png",
  antiquite: "/levels/antiquite.png",
  moyenAge: "/levels/moyen-age.png",
  industrielle: "/levels/revolution-industrielle.png",
  moderne: "/levels/epoque-moderne.png",
  futuriste: "/levels/futuriste.png",
};

const LEVELS = [
  {
    id: "prehistoire",
    name: "Préhistoire",
    label: "Campement",
    emoji: "🔥",
    min: 0,
    accent: "#fb923c",
    image: LEVEL_IMAGES.prehistoire,
    description: "Les fondations de ton patrimoine. Chaque euro posé construit le départ de ton aventure.",
  },
  {
    id: "antiquite",
    name: "Antiquité",
    label: "Cité antique",
    emoji: "🏛️",
    min: 10000,
    accent: "#10b981",
    image: LEVEL_IMAGES.antiquite,
    description: "Tes bases deviennent solides. Ton patrimoine commence à prendre une vraie forme.",
  },
  {
    id: "moyenAge",
    name: "Moyen Âge",
    label: "Royaume fortifié",
    emoji: "🏰",
    min: 30000,
    accent: "#8b5cf6",
    image: LEVEL_IMAGES.moyenAge,
    description: "Tu consolides ton capital. Tes réserves et tes investissements forment une structure défensive.",
  },
  {
    id: "industrielle",
    name: "Révolution industrielle",
    label: "Usines & expansion",
    emoji: "🚂",
    min: 75000,
    accent: "#f97316",
    image: LEVEL_IMAGES.industrielle,
    description: "La machine patrimoniale accélère. L’épargne régulière et les intérêts composés prennent de la puissance.",
  },
  {
    id: "moderne",
    name: "Époque moderne",
    label: "Métropole",
    emoji: "🏙️",
    min: 150000,
    accent: "#06b6d4",
    image: LEVEL_IMAGES.moderne,
    description: "Tu atteins une dimension avancée. Ton patrimoine devient une base sérieuse pour tes grands projets.",
  },
  {
    id: "futuriste",
    name: "Futuriste",
    label: "Ville du futur",
    emoji: "🚀",
    min: 300000,
    accent: "#6366f1",
    image: LEVEL_IMAGES.futuriste,
    description: "Ton patrimoine entre dans une nouvelle ère. La vision long terme devient ton plus gros avantage.",
  },
];

const BASE_ACCOUNTS = [
  {
    id: "pea",
    name: "PEA",
    icon: "📈",
    amount: 0,
    objective: 150000,
    kind: "Investissement",
    color: "#10b981",
    gradient: "linear-gradient(135deg,#34d399,#10b981)",
  },
  {
    id: "livretA",
    name: "Livret A",
    icon: "🐷",
    amount: 0,
    objective: 22950,
    kind: "Épargne réglementée",
    color: "#ef4444",
    gradient: "linear-gradient(135deg,#fb7185,#ef4444)",
  },
  {
    id: "ldds",
    name: "LDDS",
    icon: "💳",
    amount: 0,
    objective: 12000,
    kind: "Épargne réglementée",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg,#60a5fa,#3b82f6)",
  },
  {
    id: "lep",
    name: "LEP",
    icon: "🏦",
    amount: 0,
    objective: 10000,
    kind: "Épargne réglementée",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg,#facc15,#f59e0b)",
  },
  {
    id: "livretJeune",
    name: "Livret Jeune",
    icon: "🪙",
    amount: 0,
    objective: 1600,
    kind: "Épargne réglementée",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg,#a78bfa,#8b5cf6)",
  },
  {
    id: "cto",
    name: "CTO",
    icon: "💼",
    amount: 0,
    objective: 50000,
    kind: "Investissement",
    color: "#14b8a6",
    gradient: "linear-gradient(135deg,#22d3ee,#14b8a6)",
  },
  {
    id: "assuranceVie",
    name: "Assurance vie",
    icon: "🛡️",
    amount: 0,
    objective: 100000,
    kind: "Investissement long terme",
    color: "#0ea5e9",
    gradient: "linear-gradient(135deg,#38bdf8,#0ea5e9)",
  },
  {
    id: "per",
    name: "PER",
    icon: "🌴",
    amount: 0,
    objective: 50000,
    kind: "Retraite",
    color: "#7c3aed",
    gradient: "linear-gradient(135deg,#a78bfa,#7c3aed)",
  },
  {
    id: "pee",
    name: "PEE",
    icon: "🏢",
    amount: 0,
    objective: 30000,
    kind: "Épargne salariale",
    color: "#64748b",
    gradient: "linear-gradient(135deg,#94a3b8,#64748b)",
  },
];

const DEFAULT_GOALS = [
  { id: "home", name: "Achat résidence principale", target: 120000 },
  { id: "security", name: "Fonds de sécurité", target: 20000 },
  { id: "pea-full", name: "PEA rempli", target: 150000 },
];

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function currency(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function signedCurrency(value) {
  const number = Number(value) || 0;
  const absolute = currency(Math.abs(number));
  if (number > 0) return `+${absolute}`;
  if (number < 0) return `-${absolute}`;
  return currency(0);
}

function signedPercent(value) {
  const number = Number(value) || 0;
  const formatted = `${Math.abs(number).toFixed(2).replace(".", ",")}%`;
  if (number > 0) return `+${formatted}`;
  if (number < 0) return `-${formatted}`;
  return "0,00%";
}

function parseMoney(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  return Number(String(value).replace(/\s/g, "").replace("€", "").replace(",", ".")) || 0;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getTotal(accounts) {
  return accounts.reduce((sum, account) => sum + (Number(account.amount) || 0), 0);
}

function getAccountPercent(account) {
  if (!account.objective || account.objective <= 0) return 0;
  return clamp(Math.round((account.amount / account.objective) * 100), 0, 100);
}

function getCurrentLevel(total) {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (total >= level.min) current = level;
  }
  return current;
}

function getLevelData(total) {
  const currentLevel = getCurrentLevel(total);
  const currentIndex = LEVELS.findIndex((level) => level.id === currentLevel.id);
  const nextLevel = LEVELS[currentIndex + 1] || null;

  if (!nextLevel) {
    return {
      currentLevel,
      currentIndex,
      nextLevel: null,
      progressToNext: 100,
      remainingToNext: 0,
      globalProgress: 100,
      currentTarget: currentLevel.min,
    };
  }

  const segmentStart = currentLevel.min;
  const segmentEnd = nextLevel.min;
  const segmentSize = Math.max(segmentEnd - segmentStart, 1);
  const progressInSegment = clamp(((total - segmentStart) / segmentSize) * 100, 0, 100);
  const globalProgress = ((currentIndex + progressInSegment / 100) / (LEVELS.length - 1)) * 100;

  return {
    currentLevel,
    currentIndex,
    nextLevel,
    progressToNext: Math.round(progressInSegment),
    remainingToNext: Math.max(nextLevel.min - total, 0),
    globalProgress: clamp(globalProgress, 0, 100),
    currentTarget: nextLevel.min,
  };
}

function getMarkerLeft(index) {
  const start = 5;
  const end = 95;
  const steps = LEVELS.length - 1;
  return `${start + ((end - start) * index) / steps}%`;
}

function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatSnapshotDate(dateValue) {
  if (!dateValue) return "Aucune date";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Date inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getSnapshotTimestamp(snapshot) {
  const date = new Date(snapshot?.date || `${snapshot?.month || getMonthKey()}-01T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function sortSnapshots(history = []) {
  return [...history].sort((a, b) => getSnapshotTimestamp(a) - getSnapshotTimestamp(b));
}

function getLatestSnapshot(history = []) {
  const sorted = sortSnapshots(history);
  return sorted[sorted.length - 1] || null;
}

function createSnapshot(data, options = {}) {
  const date = options.date || new Date().toISOString();
  const dateObject = new Date(date);
  const month = options.month || getMonthKey(Number.isNaN(dateObject.getTime()) ? new Date() : dateObject);
  const total = getTotal(data.accounts || []);

  return {
    id: options.id || uid(),
    month,
    date,
    type: options.type || "manual",
    label: options.type === "auto" ? "Snapshot automatique" : (options.label || "Snapshot manuel"),
    total,
    accounts: (data.accounts || []).map((account) => ({
      id: account.id,
      amount: Number(account.amount) || 0,
      objective: Number(account.objective) || 0,
    })),
  };
}

function normalizeHistory(history = [], accounts = []) {
  if (!Array.isArray(history)) return [];

  return sortSnapshots(history.map((entry, index) => {
    const fallbackMonth = entry?.month || getMonthKey();
    const date = entry?.date || `${fallbackMonth}-01T12:00:00.000Z`;
    const hasAccounts = Array.isArray(entry?.accounts) && entry.accounts.length > 0;

    return {
      id: entry?.id || `snapshot-${fallbackMonth}-${index}`,
      month: fallbackMonth,
      date,
      type: entry?.type || "auto",
      label: entry?.type === "auto" ? "Snapshot automatique" : (entry?.label || "Snapshot manuel"),
      total: parseMoney(entry?.total),
      accounts: hasAccounts
        ? entry.accounts.map((account) => ({
            id: account.id,
            amount: parseMoney(account.amount),
            objective: parseMoney(account.objective),
          }))
        : accounts.map((account) => ({
            id: account.id,
            amount: Number(account.amount) || 0,
            objective: Number(account.objective) || 0,
          })),
    };
  }));
}

function formatMonthKey(key) {
  const [year, month] = String(key).split("-");
  return `${MONTHS[Number(month) - 1] || "?"} ${year || ""}`.trim();
}

function getLastMonthKeys(count = 12) {
  const keys = [];
  const current = new Date();
  current.setDate(1);

  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(current.getFullYear(), current.getMonth() - i, 1);
    keys.push(getMonthKey(date));
  }

  return keys;
}

function normalizeAccounts(accounts = []) {
  return BASE_ACCOUNTS.map((base) => {
    const found = Array.isArray(accounts) ? accounts.find((account) => account.id === base.id) : null;
    return {
      ...base,
      amount: parseMoney(found?.amount ?? base.amount),
      objective: parseMoney(found?.objective ?? base.objective),
    };
  });
}

function createDefaultData() {
  return {
    userAccount: null,
    configured: false,
    userName: "Mathias",
    accounts: BASE_ACCOUNTS,
    transactions: [],
    history: [],
    goals: DEFAULT_GOALS,
    darkMode: false,
    monthlyPlan: 600,
    annualYield: 6,
    projectionYears: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function upsertMonthlySnapshot(data) {
  const month = getMonthKey();
  const existingHistory = normalizeHistory(data.history || [], data.accounts || []);
  const hasCurrentMonthAutoSnapshot = existingHistory.some((snapshot) => snapshot.month === month && snapshot.type === "auto");
  const history = hasCurrentMonthAutoSnapshot
    ? existingHistory
    : [...existingHistory, createSnapshot(data, { type: "auto", label: "Snapshot automatique" })];

  return {
    ...data,
    history: sortSnapshots(history),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeData(raw) {
  const defaults = createDefaultData();
  const data = raw && typeof raw === "object" ? raw : {};
  return upsertMonthlySnapshot({
    ...defaults,
    ...data,
    userName: data.userName || defaults.userName,
    accounts: normalizeAccounts(data.accounts),
    transactions: Array.isArray(data.transactions) ? data.transactions : [],
    history: normalizeHistory(data.history, normalizeAccounts(data.accounts)),
    goals: Array.isArray(data.goals) && data.goals.length ? data.goals : defaults.goals,
    configured: Boolean(data.configured),
    monthlyPlan: parseMoney(data.monthlyPlan ?? defaults.monthlyPlan),
    annualYield: parseMoney(data.annualYield ?? defaults.annualYield),
    projectionYears: parseMoney(data.projectionYears ?? defaults.projectionYears),
  });
}

function loadInitialData() {
  if (typeof window === "undefined") return createDefaultData();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return createDefaultData();
    return normalizeData(JSON.parse(saved));
  } catch (error) {
    console.warn("Sauvegarde PatriMieux illisible", error);
    return createDefaultData();
  }
}

function getHistoryValues(history, currentTotal) {
  const keys = getLastMonthKeys(12);
  const byMonth = new Map();

  sortSnapshots(history || []).forEach((entry) => {
    byMonth.set(entry.month, Number(entry.total) || 0);
  });

  return keys.map((key, index) => {
    if (byMonth.has(key)) return byMonth.get(key);
    if (index === keys.length - 1) return currentTotal;
    return Math.round(currentTotal * (0.68 + index * 0.028));
  });
}

function projectFuture(start, monthly, annualYield, years) {
  const duration = Math.max(Math.round((Number(years) || 0) * 12), 0);
  const monthlyRate = Math.pow(1 + (Number(annualYield) || 0) / 100, 1 / 12) - 1;
  let value = Number(start) || 0;
  const values = [];

  for (let month = 1; month <= duration; month += 1) {
    value = value * (1 + monthlyRate) + (Number(monthly) || 0);
    if (month % 12 === 0 || month === duration) values.push(Math.round(value));
  }

  return {
    final: Math.round(value),
    values: values.length ? values : [Math.round(start)],
  };
}

function getRepartition(accounts) {
  const activeAccounts = (accounts || []).filter((account) => Number(account.amount) > 0);
  const total = Math.max(getTotal(activeAccounts), 1);
  return activeAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    icon: account.icon,
    amount: account.amount,
    percent: Math.round((account.amount / total) * 1000) / 10,
    color: account.color,
  })).sort((a, b) => b.amount - a.amount);
}

function getSnapshotSeries(data, currentTotal) {
  const history = sortSnapshots(data.history || []);
  const points = history.map((snapshot, index) => ({
    id: snapshot.id || `snapshot-${index}`,
    label: formatSnapshotDate(snapshot.date).split(" ")[0],
    fullDate: formatSnapshotDate(snapshot.date),
    value: Number(snapshot.total) || 0,
    type: snapshot.type || "manual",
  }));

  const latest = points[points.length - 1];
  if (!latest || Math.abs((Number(latest.value) || 0) - currentTotal) > 0.01) {
    points.push({
      id: "current-live",
      label: "Actuel",
      fullDate: "État actuel non snapshoté",
      value: currentTotal,
      type: "live",
    });
  }

  return points.slice(-14);
}

function buildSnapshotChart(points, width = 760, height = 210, padding = 24) {
  if (!points || points.length === 0) {
    return { areaPath: "", linePath: "", coords: [], min: 0, max: 0 };
  }

  const values = points.map((point) => Number(point.value) || 0);
  let min = Math.min(...values);
  let max = Math.max(...values);

  if (min === max) {
    min -= 1;
    max += 1;
  }

  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const coords = points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : padding + (index / (points.length - 1)) * innerWidth;
    const ratio = ((Number(point.value) || 0) - min) / Math.max(max - min, 1);
    const y = height - padding - ratio * innerHeight;
    return { ...point, x, y };
  });

  const linePath = coords.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const areaPath = coords.length
    ? `${linePath} L${coords[coords.length - 1].x},${height - padding} L${coords[0].x},${height - padding} Z`
    : "";

  return { areaPath, linePath, coords, min, max };
}

function runTests() {
  console.assert(parseMoney("1 234,56 €") === 1234.56, "parseMoney format FR");
  console.assert(getCurrentLevel(0).name === "Préhistoire", "niveau 0");
  console.assert(getCurrentLevel(11179.5).name === "Antiquité", "niveau Antiquité");
  console.assert(getLevelData(11179.5).nextLevel.name === "Moyen Âge", "prochain niveau");
  console.assert(getLevelData(11179.5).progressToNext === 6, "progression palier");
  console.assert(getMarkerLeft(0) === "5%", "premier marqueur");
  console.assert(getMarkerLeft(5) === "95%", "dernier marqueur");
  console.assert(projectFuture(1000, 100, 0, 1).final === 2200, "projection sans rendement");
}

function WelcomePage({ setupValues, setSetupValues, userName, setUserName, onSubmit, onDemo }) {
  const setupTotal = BASE_ACCOUNTS.reduce((sum, account) => sum + parseMoney(setupValues[account.id]), 0);
  const level = getLevelData(setupTotal);

  return (
    <main className="welcomePage">
      <section className="welcomeShell">
        <div className="welcomeHeroCard">
          <div className="brand bigBrand"><span>✨</span><strong>PatriMieux</strong></div>
          <h1>Visualise ton patrimoine comme une aventure.</h1>
          <p>
            Renseigne ton PEA, tes livrets et ton CTO. PatriMieux adapte ton tableau de bord, ton niveau, tes objectifs et ton paysage automatiquement.
          </p>

          <div className="welcomePreview sceneFrame" style={{ backgroundImage: `url(${level.currentLevel.image})` }}>
            <div className="livingLayer" />
            <div className="lightSweep" />
            <div className="sceneShade" />
            <div className="welcomeLevelChip">{level.currentLevel.emoji} {level.currentLevel.name}</div>
          </div>
        </div>

        <form className="setupCard" onSubmit={onSubmit}>
          <div className="setupHeader">
            <div>
              <span className="eyebrow">Configuration initiale</span>
              <h2>État de ton patrimoine</h2>
              <p>Tout est sauvegardé automatiquement en local sur ton navigateur.</p>
            </div>
            <div className="setupTotal"><span>Total</span><strong>{currency(setupTotal)}</strong></div>
          </div>

          <label className="field wideField">
            <span>Ton prénom</span>
            <input value={userName} onChange={(event) => setUserName(event.target.value)} placeholder="Mathias" />
          </label>

          <div className="setupGrid">
            {BASE_ACCOUNTS.map((account) => (
              <label className="field" key={account.id}>
                <span>{account.icon} {account.name}</span>
                <input
                  inputMode="decimal"
                  value={setupValues[account.id] || ""}
                  onChange={(event) => setSetupValues((old) => ({ ...old, [account.id]: event.target.value }))}
                  placeholder="0"
                />
                <small>Objectif : {currency(account.objective)}</small>
              </label>
            ))}
          </div>

          <div className="setupLevel">
            <div><strong>{level.currentLevel.emoji} {level.currentLevel.name}</strong><span>{level.currentLevel.label}</span></div>
            {level.nextLevel ? <em>Prochain niveau à {currency(level.nextLevel.min)}</em> : <em>Dernier niveau atteint</em>}
          </div>

          <div className="setupActions">
            <button className="primaryBtn" type="submit">Créer mon tableau de bord</button>
            <button className="secondaryBtn" type="button" onClick={onDemo}>Remplir avec un exemple</button>
          </div>
        </form>
      </section>
      <Styles />
    </main>
  );
}

function LineChart({ values = [], labels = [], compact = false }) {
  const width = 760;
  const height = compact ? 120 : 300;
  const pad = compact ? 12 : 42;
  const safe = values.length ? values : [0];
  const maxValue = Math.max(...safe, 1);
  const minValue = compact ? 0 : Math.min(...safe) * 0.88;
  const max = maxValue * 1.08;
  const range = Math.max(max - minValue, 1);
  const points = safe.map((value, index) => {
    const x = pad + (index / Math.max(safe.length - 1, 1)) * (width - pad * 2);
    const y = height - pad - ((value - minValue) / range) * (height - pad * 2);
    return [x, y];
  });
  const path = points.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${path} L${points[points.length - 1][0]},${height - pad} L${points[0][0]},${height - pad} Z`;
  const gradientId = compact ? "miniChartGradient" : "mainChartGradient";

  return (
    <svg className="chartSvg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      {!compact && [0, 1, 2, 3].map((line) => {
        const y = pad + line * ((height - pad * 2) / 3);
        return <line key={line} x1={pad} x2={width - pad} y1={y} y2={y} stroke="var(--grid)" strokeDasharray="5 6" />;
      })}
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={path} fill="none" stroke="#10b981" strokeWidth={compact ? 5 : 4} strokeLinecap="round" strokeLinejoin="round" />
      {!compact && points.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="4.5" fill="#10b981" />)}
      {!compact && labels.map((label, index) => {
        const x = pad + (index / Math.max(labels.length - 1, 1)) * (width - pad * 2);
        return <text key={`${label}-${index}`} x={x} y={height - 9} textAnchor="middle" fontSize="11" fill="var(--muted)" fontWeight="800">{label}</text>;
      })}
    </svg>
  );
}

function AccountCard({ account, onEdit }) {
  const percent = getAccountPercent(account);
  return (
    <article className="accountCard">
      <div className="accountHeader">
        <div className="accountIdentity">
          <div className="accountIcon" style={{ background: account.gradient }}>
            <span>{account.icon}</span>
          </div>
          <div>
            <h3>{account.name}</h3>
            <p>{account.kind}</p>
          </div>
        </div>
        <div className="accountRing" style={{ background: `conic-gradient(${account.color} ${percent * 3.6}deg, var(--soft) 0deg)` }}>
          <span>{percent}%</span>
        </div>
      </div>

      <div className="accountAmount">{currency(account.amount)}</div>
      <div className="accountProgress"><div style={{ width: `${percent}%`, background: account.gradient }} /></div>
      <div className="accountFooter"><span>Objectif</span><strong>{currency(account.objective)}</strong></div>
      <button className="smallBtn" onClick={() => onEdit(account)}>Modifier</button>
    </article>
  );
}

function AddPlacementCard({ hiddenAccounts, onAdd }) {
  return (
    <article className="addPlacementCard">
      <button className="addPlacementButton" type="button" onClick={onAdd}>
        <span className="addPlacementIcon">＋</span>
        <strong>Ajouter un placement</strong>
      </button>
      <p>
        Les placements à 0 € sont masqués du tableau de bord. Tu peux les réactiver ici.
      </p>
      {hiddenAccounts.length > 0 ? (
        <div className="hiddenPlacementPreview">
          {hiddenAccounts.slice(0, 4).map((account) => (
            <span key={account.id}>{account.icon} {account.name}</span>
          ))}
          {hiddenAccounts.length > 4 && <span>+{hiddenAccounts.length - 4} autre(s)</span>}
        </div>
      ) : (
        <div className="hiddenPlacementPreview"><span>Tous les placements sont affichés</span></div>
      )}
    </article>
  );
}

function LivingScene({ levelData, total }) {
  const { currentLevel, nextLevel, progressToNext, remainingToNext, globalProgress, currentTarget } = levelData;
  return (
    <section className="livingScene">
      <div className="sceneFrame mainScene" style={{ backgroundImage: `url(${currentLevel.image})` }}>
        <div className="livingLayer" />
        <div className="animatedMist" />
        <div className="lightSweep" />
        <div className="sceneShade" />

        <div className="sceneInfoCard glassCard">
          <span className="eyebrow">Niveau actuel</span>
          <h2>{currentLevel.emoji} {currentLevel.name}</h2>
          <p>{currentLevel.description}</p>
        </div>

        <div className="sceneProgressCard glassCard">
          <div className="sceneProgressTop">
            <div>
              <span className="eyebrow">Progression vers le niveau suivant</span>
              <h3>{progressToNext}%</h3>
            </div>
            <div className="levelOrb" style={{ background: `conic-gradient(${currentLevel.accent} ${progressToNext * 3.6}deg, rgba(255,255,255,.42) 0deg)` }}>
              <span>{currentLevel.emoji}</span>
            </div>
          </div>
          <div className="bigBar"><div style={{ width: `${progressToNext}%`, background: `linear-gradient(90deg, ${currentLevel.accent}, #22c55e)` }} /></div>
          <div className="sceneMeta">
            {nextLevel ? (
              <>
                <span>{currency(total)} / {currency(currentTarget)}</span>
                <strong>Reste {currency(remainingToNext)}</strong>
              </>
            ) : (
              <strong>Palier final atteint</strong>
            )}
          </div>
        </div>

        <div className="timelineOverlay">
          <div className="timelineLine"><div style={{ width: `${globalProgress}%` }} /></div>
          {LEVELS.map((level, index) => {
            const active = level.id === currentLevel.id;
            const passed = index < levelData.currentIndex;
            return (
              <div className={`levelMarker ${active ? "active" : ""} ${passed ? "passed" : ""}`} key={level.id} style={{ left: getMarkerLeft(index) }}>
                {active && <span className="currentBadge">Niveau actuel</span>}
                <div className="markerIcon">{level.emoji}</div>
                <strong>{level.name}</strong>
                <small>{level.label}</small>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LevelGallery({ currentId }) {
  return (
    <section className="panel levelGalleryPanel">
      <div className="panelHeader">
        <div>
          <span className="eyebrow">Univers visuels</span>
          <h2>Images de niveaux vivantes</h2>
        </div>
        <p>Chaque image a un léger mouvement de ciel, de lumière et de profondeur.</p>
      </div>
      <div className="levelGallery">
        {LEVELS.map((level) => (
          <article className={`levelCard ${currentId === level.id ? "selected" : ""}`} key={level.id}>
            <div className="levelImage sceneFrame" style={{ backgroundImage: `url(${level.image})` }}>
              <div className="livingLayer" />
              <div className="sceneShade small" />
              <span>{level.emoji} {level.name}</span>
            </div>
            <div className="levelBody">
              <strong>{level.label}</strong>
              <p>À partir de {currency(level.min)}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SnapshotEvolutionCard({ data, currentTotal }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const points = getSnapshotSeries(data, currentTotal);
  const hasEnoughSnapshots = points.length > 1;
  const chart = buildSnapshotChart(points);
  const firstValue = points[0]?.value || 0;
  const lastValue = points[points.length - 1]?.value || 0;
  const previousValue = points[points.length - 2]?.value || 0;
  const delta = hasEnoughSnapshots ? lastValue - firstValue : 0;
  const lastDelta = hasEnoughSnapshots ? lastValue - previousValue : 0;
  const globalPercent = hasEnoughSnapshots && firstValue > 0 ? (delta / firstValue) * 100 : 0;
  const lastPercent = hasEnoughSnapshots && previousValue > 0 ? (lastDelta / previousValue) * 100 : 0;
  const deltaClass = delta > 0 ? "gain" : delta < 0 ? "loss" : "neutral";
  const lastDeltaClass = lastDelta > 0 ? "gain" : lastDelta < 0 ? "loss" : "neutral";

  const pointsWithDelta = chart.coords.map((point, index) => {
    const previousPoint = chart.coords[index - 1];
    const pointDelta = previousPoint ? point.value - previousPoint.value : 0;
    const pointPercent = previousPoint?.value > 0 ? (pointDelta / previousPoint.value) * 100 : 0;
    return {
      ...point,
      pointDelta,
      pointPercent,
      pointDeltaClass: pointDelta > 0 ? "gain" : pointDelta < 0 ? "loss" : "neutral",
      isFirst: index === 0,
      leftPercent: (point.x / 760) * 100 < 50
        ? Math.min((point.x / 760) * 100 + 4, 62)
        : Math.max((point.x / 760) * 100 - 4, 38),
      topPercent: Math.min(Math.max((point.y / 210) * 100, 34), 66),
      tooltipAlign: (point.x / 760) * 100 < 50 ? "toRight" : "toLeft",
    };
  });

  return (
    <section className={`statCard snapshotCurveCard ${!hasEnoughSnapshots ? "emptyState" : ""}`}>
      <div className="snapshotCurveHeader">
        <div>
          <span className="eyebrow">Évolution des snapshots</span>
          <strong>Patrimoine dans le temps</strong>
        </div>
        <div className="snapshotCurveDelta">
          <b className={deltaClass}>{signedCurrency(delta)}</b>
          <small>{hasEnoughSnapshots ? "sur les points affichés" : "pas assez d’historique"}</small>
        </div>
      </div>

      <div className="snapshotCurveMetrics">
        <div>
          <span>Depuis le dernier snapshot</span>
          <strong className={lastDeltaClass}>{signedPercent(lastPercent)}</strong>
          <small>{signedCurrency(lastDelta)}</small>
        </div>
        <div>
          <span>Depuis le premier snapshot</span>
          <strong className={deltaClass}>{signedPercent(globalPercent)}</strong>
          <small>{signedCurrency(delta)}</small>
        </div>
      </div>

      <div className="snapshotCurveChart" onMouseLeave={() => setHoveredPoint(null)}>
        {!hasEnoughSnapshots ? (
          <div className="snapshotEmpty">
            <strong>Pas assez de snapshots</strong>
            <span>Ajoute un versement, un retrait ou crée un snapshot manuel pour voir l’évolution.</span>
          </div>
        ) : (
          <>
            <svg viewBox="0 0 760 210" preserveAspectRatio="none">
              <defs>
                <linearGradient id="snapshotCurveFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={chart.areaPath} fill="url(#snapshotCurveFill)" />
              <path className="snapshotCurveLine" d={chart.linePath} fill="none" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              {pointsWithDelta.map((point, index) => (
                <g
                  key={point.id || index}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onFocus={() => setHoveredPoint(point)}
                  tabIndex="0"
                >
                  <circle
                    className={`snapshotCurvePoint ${point.type === "live" ? "live" : ""}`}
                    cx={point.x}
                    cy={point.y}
                    r={index === pointsWithDelta.length - 1 ? 6 : 4.5}
                  />
                  <circle
                    className="snapshotHoverTarget"
                    cx={point.x}
                    cy={point.y}
                    r="18"
                  />
                </g>
              ))}
            </svg>

            {hoveredPoint && (
              <div
                className={`snapshotTooltip ${hoveredPoint.tooltipAlign}`}
                style={{
                  left: `${hoveredPoint.leftPercent}%`,
                  top: `${hoveredPoint.topPercent}%`,
                }}
              >
                <span>{hoveredPoint.fullDate}</span>
                <strong>{currency(hoveredPoint.value)}</strong>
                <em className={hoveredPoint.pointDeltaClass}>
                  {hoveredPoint.isFirst
                    ? "Premier point"
                    : `${signedCurrency(hoveredPoint.pointDelta)} (${signedPercent(hoveredPoint.pointPercent)}) vs point précédent`}
                </em>
              </div>
            )}

            <div className="snapshotCurveLabels">
              {points.map((point, index) => (
                <span key={point.id || index} className={index === points.length - 1 ? "current" : ""} title={`${point.fullDate} — ${currency(point.value)}`}>
                  {point.label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function getPeriodKey(date, mode) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  if (mode === "day") return `${year}-${month}-${day}`;
  if (mode === "month") return `${year}-${month}`;
  return `${year}`;
}

function getPeriodLabel(date, mode) {
  if (mode === "day") return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  if (mode === "month") return date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
  return date.toLocaleDateString("fr-FR", { year: "numeric" });
}

function getSnapshotTotal(snapshot) {
  if (!snapshot) return 0;
  if (typeof snapshot.total === "number") return snapshot.total;
  if (typeof snapshot.total === "string") return parseMoney(snapshot.total);
  if (Array.isArray(snapshot.accounts)) return snapshot.accounts.reduce((sum, account) => sum + parseMoney(account.amount), 0);
  return 0;
}

function aggregateSnapshotsByMode(history, mode, currentTotal) {
  const normalized = sortSnapshots(history || [])
    .map((snapshot) => {
      const date = new Date(snapshot.date || `${snapshot.month || getMonthKey()}-01T12:00:00.000Z`);
      return {
        id: snapshot.id,
        dateObj: Number.isNaN(date.getTime()) ? new Date() : date,
        total: getSnapshotTotal(snapshot),
        type: snapshot.type || "auto",
      };
    })
    .filter((snapshot) => Number.isFinite(snapshot.total));

  const buckets = new Map();
  normalized.forEach((snapshot) => {
    const key = getPeriodKey(snapshot.dateObj, mode);
    const existing = buckets.get(key);
    if (!existing || snapshot.dateObj > existing.dateObj) {
      buckets.set(key, {
        ...snapshot,
        key,
        label: getPeriodLabel(snapshot.dateObj, mode),
      });
    }
  });

  const points = Array.from(buckets.values()).sort((a, b) => a.dateObj - b.dateObj);
  const latest = points[points.length - 1];
  if (!latest || Math.abs(latest.total - currentTotal) > 0.01) {
    const now = new Date();
    points.push({
      id: "current-live",
      key: `current-${now.getTime()}`,
      label: "Actuel",
      dateObj: now,
      total: currentTotal,
      type: "live",
    });
  }
  return points.slice(-24);
}

function buildAdaptiveChart(points, width = 760, height = 300) {
  const padding = { top: 30, right: 24, bottom: 52, left: 24 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  if (!points.length) return { coords: [], linePath: "", areaPath: "", padding, plotHeight };

  const values = points.map((point) => Number(point.total) || 0);
  const minRaw = Math.min(...values);
  const maxRaw = Math.max(...values);
  const extra = Math.max((maxRaw - minRaw) * 0.12, 150);
  const minY = Math.max(0, minRaw - extra);
  const maxY = Math.max(maxRaw + extra, 1);
  const rangeY = Math.max(maxY - minY, 1);

  const coords = points.map((point, index) => {
    const x = points.length === 1 ? padding.left + plotWidth / 2 : padding.left + (index / (points.length - 1)) * plotWidth;
    const y = padding.top + ((maxY - point.total) / rangeY) * plotHeight;
    return { ...point, x, y };
  });

  const linePath = coords.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const areaPath = coords.length
    ? `${linePath} L${coords[coords.length - 1].x},${height - padding.bottom} L${coords[0].x},${height - padding.bottom} Z`
    : "";

  return { coords, linePath, areaPath, padding, plotHeight };
}

function polarToCartesian(cx, cy, radius, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(angleRad), y: cy + radius * Math.sin(angleRad) };
}

function describeArc(cx, cy, radius, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [`M`, start.x, start.y, `A`, radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

function DonutChart({ items, total }) {
  const size = 230;
  const center = size / 2;
  const radius = 80;
  const stroke = 28;
  let currentAngle = 0;

  return (
    <div className="structureDonutWrap">
      <svg viewBox={`0 0 ${size} ${size}`} className="structureDonut">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--soft)" strokeWidth={stroke} />
        {items.map((item) => {
          const angle = Math.max((item.percent / 100) * 360, item.amount > 0 ? 2 : 0);
          const path = describeArc(center, center, radius, currentAngle, currentAngle + angle);
          currentAngle += angle;
          return <path key={item.id} d={path} fill="none" stroke={item.color} strokeWidth={stroke} strokeLinecap="round" />;
        })}
      </svg>
      <div className="structureDonutCenter">
        <span>Total</span>
        <strong>{currency(total)}</strong>
        <small>{items.length} placement{items.length > 1 ? "s" : ""}</small>
      </div>
    </div>
  );
}

function EvolutionAdaptivePanel({ history, currentTotal }) {
  const [mode, setMode] = useState("month");
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const points = useMemo(() => aggregateSnapshotsByMode(history, mode, currentTotal), [history, mode, currentTotal]);
  const hasEnoughData = points.length >= 2;
  const width = 760;
  const height = 300;
  const chart = buildAdaptiveChart(points, width, height);
  const firstValue = points[0]?.total || 0;
  const lastValue = points[points.length - 1]?.total || 0;
  const totalVariation = hasEnoughData ? lastValue - firstValue : 0;
  const totalPercent = hasEnoughData && firstValue > 0 ? (totalVariation / firstValue) * 100 : 0;
  const variationClass = totalVariation > 0 ? "positive" : totalVariation < 0 ? "negative" : "neutral";
  const hoveredPoint = hoveredIndex !== null ? chart.coords[hoveredIndex] : null;
  const previousHoveredPoint = hoveredIndex !== null && hoveredIndex > 0 ? chart.coords[hoveredIndex - 1] : null;
  const hoverDelta = hoveredPoint && previousHoveredPoint ? hoveredPoint.total - previousHoveredPoint.total : 0;
  const hoverPercent = previousHoveredPoint?.total > 0 ? (hoverDelta / previousHoveredPoint.total) * 100 : 0;
  const hoverClass = hoverDelta > 0 ? "positive" : hoverDelta < 0 ? "negative" : "neutral";

  return (
    <section className="panel adaptiveHistoryPanel">
      <div className="insightHeader">
        <div>
          <span className="eyebrow">Évolution du patrimoine</span>
          <h2>Basée sur tes snapshots</h2>
          <p>Choisis une vue par jour, mois ou année. La courbe utilise le dernier snapshot de chaque période.</p>
        </div>
        <div className="historyControls">
          <div className="periodSwitch">
            <button className={mode === "day" ? "active" : ""} onClick={() => setMode("day")}>Jour</button>
            <button className={mode === "month" ? "active" : ""} onClick={() => setMode("month")}>Mois</button>
            <button className={mode === "year" ? "active" : ""} onClick={() => setMode("year")}>Année</button>
          </div>
          <div className={`evolutionBadge ${variationClass}`}>
            <strong>{signedCurrency(totalVariation)}</strong>
            <span>{signedPercent(totalPercent)} sur la période</span>
          </div>
        </div>
      </div>

      {!hasEnoughData ? (
        <div className="emptyInsightState compact">
          <strong>Pas assez de snapshots</strong>
          <span>Ajoute un versement, un retrait ou crée un snapshot manuel pour voir l’évolution.</span>
        </div>
      ) : (
        <div className="evolutionChartBox" onMouseLeave={() => setHoveredIndex(null)}>
          <svg viewBox={`0 0 ${width} ${height}`} className="evolutionChartSvg">
            <defs>
              <linearGradient id="adaptiveChartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.34" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3].map((line) => {
              const y = chart.padding.top + (line / 3) * chart.plotHeight;
              return <line key={line} x1={chart.padding.left} x2={width - chart.padding.right} y1={y} y2={y} className="chartGridLine" />;
            })}
            <path d={chart.areaPath} className="adaptiveChartArea" />
            <path d={chart.linePath} className="adaptiveChartLine" />
            {chart.coords.map((point, index) => (
              <g key={point.id || point.key || index}>
                <circle cx={point.x} cy={point.y} r={hoveredIndex === index ? 7 : 5} className="adaptiveChartPoint" />
                <circle cx={point.x} cy={point.y} r="18" fill="transparent" onMouseEnter={() => setHoveredIndex(index)} />
                <text x={point.x} y={height - 17} textAnchor="middle" className={`adaptiveChartLabel ${hoveredIndex === index ? "active" : ""}`}>{point.label}</text>
              </g>
            ))}
          </svg>
          {hoveredPoint && (
            <div className="adaptiveTooltip" style={{ left: `${clamp((hoveredPoint.x / width) * 100, 15, 85)}%`, top: `${clamp((hoveredPoint.y / height) * 100, 24, 70)}%` }}>
              <span>{hoveredPoint.dateObj.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              <strong>{currency(hoveredPoint.total)}</strong>
              <em className={hoverClass}>{previousHoveredPoint ? `${signedCurrency(hoverDelta)} (${signedPercent(hoverPercent)}) vs point précédent` : "Premier point affiché"}</em>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function StructurePatrimoinePanel({ accounts }) {
  const items = getRepartition(accounts);
  const total = getTotal((accounts || []).filter((account) => Number(account.amount) > 0));

  return (
    <section className="panel structurePanel">
      <div className="insightHeader simple">
        <div>
          <span className="eyebrow">Répartition</span>
          <h2>Structure du patrimoine</h2>
          <p>Camembert et détail de la part de chaque placement dans le total.</p>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="emptyInsightState compact">
          <strong>Aucun placement actif</strong>
          <span>Ajoute au moins un placement supérieur à 0 €.</span>
        </div>
      ) : (
        <div className="structureLayout">
          <DonutChart items={items} total={total} />
          <div className="structureLegend">
            {items.map((item) => (
              <div className="structureLegendItem" key={item.id}>
                <div className="structureLegendTop">
                  <div className="structureLegendName">
                    <span className="structureLegendDot" style={{ background: item.color }} />
                    <strong>{item.icon} {item.name}</strong>
                  </div>
                  <span>{currency(item.amount)}</span>
                </div>
                <div className="structureLegendBar"><div style={{ width: `${Math.max(item.percent, 2)}%`, background: item.color }} /></div>
                <small>{String(item.percent).replace(".", ",")}% du total</small>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PatrimoineInsightsSection({ history, accounts, total }) {
  return (
    <section className="patrimoineInsightsGrid">
      <EvolutionAdaptivePanel history={history} currentTotal={total} />
      <StructurePatrimoinePanel accounts={accounts} />
    </section>
  );
}

function ProjectionPanel({ data, setData, total }) {
  const result = projectFuture(total, data.monthlyPlan, data.annualYield, data.projectionYears);
  return (
    <section className="panel projectionPanel">
      <div className="panelHeader"><div><span className="eyebrow">Projection</span><h2>Vision long terme</h2></div></div>
      <div className="projectionGrid">
        <label><span>Versement mensuel</span><input inputMode="decimal" value={data.monthlyPlan} onChange={(event) => setData((old) => upsertMonthlySnapshot({ ...old, monthlyPlan: parseMoney(event.target.value) }))} /></label>
        <label><span>Rendement annuel estimé</span><input inputMode="decimal" value={data.annualYield} onChange={(event) => setData((old) => upsertMonthlySnapshot({ ...old, annualYield: parseMoney(event.target.value) }))} /></label>
        <label><span>Durée en années</span><input inputMode="decimal" value={data.projectionYears} onChange={(event) => setData((old) => upsertMonthlySnapshot({ ...old, projectionYears: parseMoney(event.target.value) }))} /></label>
      </div>
      <div className="projectionResult">
        <span>Capital projeté</span>
        <strong>{currency(result.final)}</strong>
      </div>
      <div className="miniChartBox"><LineChart values={result.values} compact /></div>
    </section>
  );
}

function GoalsPanel({ goals, total, onAdd, onDelete }) {
  return (
    <section className="panel goalsPanel">
      <div className="panelHeader">
        <div><span className="eyebrow">Objectifs</span><h2>Objectifs personnalisés</h2></div>
        <button className="secondaryBtn compact" onClick={onAdd}>+ Ajouter</button>
      </div>
      <div className="goalsList">
        {goals.map((goal) => {
          const percent = clamp(Math.round((total / Math.max(goal.target, 1)) * 100), 0, 100);
          return (
            <div className="goalItem" key={goal.id}>
              <button onClick={() => onDelete(goal.id)}>×</button>
              <strong>{goal.name}</strong>
              <span>{currency(Math.min(total, goal.target))} / {currency(goal.target)}</span>
              <div className="goalBar"><div style={{ width: `${percent}%` }} /></div>
              <em>{percent}%</em>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function TransactionsPanel({ transactions, accounts, onDeposit }) {
  return (
    <section className="panel transactionsPanel">
      <div className="panelHeader">
        <div><span className="eyebrow">Versements</span><h2>Historique récent</h2></div>
        <button className="secondaryBtn compact" onClick={onDeposit}>+ Versement</button>
      </div>
      <div className="transactionsList">
        {transactions.length === 0 && <p className="emptyState">Aucun versement enregistré pour le moment.</p>}
        {transactions.slice(0, 8).map((tx) => {
          const account = accounts.find((item) => item.id === tx.accountId);
          return (
            <div className="transactionItem" key={tx.id}>
              <div><strong>{account?.icon} {account?.name || "Compte"}</strong><span>{tx.note || "Versement"}</span></div>
              <em className={Number(tx.amount) >= 0 ? "gain" : "loss"}>{Number(tx.amount) >= 0 ? "+" : "−"}{currency(Math.abs(Number(tx.amount) || 0))}</em>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modalBackdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modalClose" onClick={onClose}>×</button>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

function DepositModal({ accounts, onClose, onSubmit }) {
  const selectableAccounts = accounts || [];
  const [accountId, setAccountId] = useState(selectableAccounts[0]?.id || "pea");
  const [amount, setAmount] = useState("600");
  const [note, setNote] = useState("Versement mensuel");
  return (
    <Modal title="Ajouter un versement" onClose={onClose}>
      <div className="modalGrid">
        <label><span>Compte</span><select value={accountId} onChange={(event) => setAccountId(event.target.value)}>{selectableAccounts.map((account) => <option value={account.id} key={account.id}>{account.icon} {account.name}</option>)}</select></label>
        <label><span>Montant</span><input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
        <label className="wide"><span>Note</span><input value={note} onChange={(event) => setNote(event.target.value)} /></label>
      </div>
      <button className="primaryBtn full" onClick={() => onSubmit({ accountId, amount: parseMoney(amount), note })}>Valider le versement</button>
    </Modal>
  );
}

function WithdrawalModal({ accounts, onClose, onSubmit }) {
  const selectableAccounts = (accounts || []).filter((account) => Number(account.amount) > 0);
  const [accountId, setAccountId] = useState(selectableAccounts[0]?.id || "pea");
  const selectedAccount = selectableAccounts.find((account) => account.id === accountId) || selectableAccounts[0];
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("Retrait");

  return (
    <Modal title="Effectuer un retrait" onClose={onClose}>
      <div className="withdrawInfo">
        <span>Solde disponible</span>
        <strong>{currency(selectedAccount?.amount || 0)}</strong>
      </div>
      <div className="modalGrid">
        <label>
          <span>Compte</span>
          <select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
            {selectableAccounts.map((account) => (
              <option value={account.id} key={account.id}>{account.icon} {account.name} — {currency(account.amount)}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Montant à retirer</span>
          <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Ex : 250" />
        </label>
        <label className="wide">
          <span>Note</span>
          <input value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
      </div>
      <button className="withdrawBtn full" onClick={() => onSubmit({ accountId, amount: parseMoney(amount), note })}>
        Valider le retrait
      </button>
    </Modal>
  );
}

function EditAccountModal({ account, onClose, onSubmit }) {
  const [amount, setAmount] = useState(String(account.amount).replace(".", ","));
  const [objective, setObjective] = useState(String(account.objective).replace(".", ","));
  return (
    <Modal title={`Modifier ${account.name}`} onClose={onClose}>
      <div className="modalGrid">
        <label><span>Montant actuel</span><input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
        <label><span>Objectif</span><input inputMode="decimal" value={objective} onChange={(event) => setObjective(event.target.value)} /></label>
      </div>
      <button className="primaryBtn full" onClick={() => onSubmit(account.id, parseMoney(amount), parseMoney(objective))}>Enregistrer</button>
    </Modal>
  );
}

function GoalModal({ onClose, onSubmit }) {
  const [name, setName] = useState("Nouvel objectif");
  const [target, setTarget] = useState("50000");
  return (
    <Modal title="Nouvel objectif" onClose={onClose}>
      <div className="modalGrid">
        <label><span>Nom</span><input value={name} onChange={(event) => setName(event.target.value)} /></label>
        <label><span>Montant cible</span><input inputMode="decimal" value={target} onChange={(event) => setTarget(event.target.value)} /></label>
      </div>
      <button className="primaryBtn full" onClick={() => onSubmit({ id: uid(), name, target: parseMoney(target) })}>Ajouter</button>
    </Modal>
  );
}

function AddPlacementModal({ accounts, onClose, onSubmit }) {
  const hiddenAccounts = accounts.filter((account) => Number(account.amount) <= 0);
  const [accountId, setAccountId] = useState(hiddenAccounts[0]?.id || "");
  const selectedAccount = hiddenAccounts.find((account) => account.id === accountId) || hiddenAccounts[0];
  const [amount, setAmount] = useState("");
  const [objective, setObjective] = useState(selectedAccount?.objective || 0);

  useEffect(() => {
    if (selectedAccount) setObjective(selectedAccount.objective || 0);
  }, [selectedAccount?.id]);

  return (
    <Modal title="Ajouter un placement" onClose={onClose}>
      {hiddenAccounts.length === 0 ? (
        <div className="emptyAddPlacement">
          <strong>Tous les placements sont déjà affichés</strong>
          <span>Pour masquer un placement, mets son montant à 0 €.</span>
        </div>
      ) : (
        <>
          <div className="modalGrid">
            <label>
              <span>Placement</span>
              <select value={accountId} onChange={(event) => setAccountId(event.target.value)}>
                {hiddenAccounts.map((account) => (
                  <option value={account.id} key={account.id}>{account.icon} {account.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Montant actuel</span>
              <input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Ex : 1000" />
            </label>
            <label className="wide">
              <span>Objectif</span>
              <input inputMode="decimal" value={objective} onChange={(event) => setObjective(event.target.value)} />
            </label>
          </div>
          <button className="primaryBtn full" onClick={() => onSubmit({ accountId, amount: parseMoney(amount), objective: parseMoney(objective) })}>
            Ajouter au tableau de bord
          </button>
        </>
      )}
    </Modal>
  );
}

function ImportModal({ onClose, onImport }) {
  const [text, setText] = useState("");
  return (
    <Modal title="Importer mes données" onClose={onClose}>
      <textarea className="importBox" placeholder="Colle ici ton fichier JSON exporté..." value={text} onChange={(event) => setText(event.target.value)} />
      <button className="primaryBtn full" onClick={() => onImport(text)}>Importer</button>
    </Modal>
  );
}

function Dashboard({ data, setData, onReset, onModifySetup, onLogout }) {
  const [modal, setModal] = useState(null);
  const [authPage, setAuthPage] = useState("landing");
  const [editingAccount, setEditingAccount] = useState(null);
  const [toast, setToast] = useState("");

  function createLocalAccount(account) {
    setData((current) => ({
      ...current,
      userAccount: {
        pseudo: account.pseudo,
        email: account.email,
        password: account.password,
        createdAt: new Date().toISOString(),
      },
      ownerName: account.pseudo,
      configured: false,
      updatedAt: new Date().toISOString(),
    }));
    setToast("Compte créé, configure maintenant ton patrimoine initial");
  }
  const [snapshotMenuOpen, setSnapshotMenuOpen] = useState(false);
  const total = getTotal(data.accounts);
  const levelData = getLevelData(total);
  const visibleAccounts = data.accounts.filter((account) => Number(account.amount) > 0);
  const hiddenAccounts = data.accounts.filter((account) => Number(account.amount) <= 0);
  const chartValues = getHistoryValues(data.history, total);
  const sortedSnapshots = sortSnapshots(data.history || []);
  const latestSnapshot = getLatestSnapshot(sortedSnapshots);
  const previousSnapshot = sortedSnapshots.length >= 2 ? sortedSnapshots[sortedSnapshots.length - 2] : null;
  const latestSnapshotTotal = latestSnapshot ? Number(latestSnapshot.total) || 0 : total;
  const previousSnapshotTotal = previousSnapshot ? Number(previousSnapshot.total) || 0 : latestSnapshotTotal;
  const currentDiffFromLatest = latestSnapshot ? total - latestSnapshotTotal : 0;
  const snapshotDelta = previousSnapshot
    ? latestSnapshotTotal - previousSnapshotTotal
    : currentDiffFromLatest;
  const snapshotDeltaPercent = previousSnapshotTotal > 0 ? (snapshotDelta / previousSnapshotTotal) * 100 : 0;
  const snapshotDeltaClass = snapshotDelta > 0 ? "gain" : snapshotDelta < 0 ? "loss" : "neutral";

  function updateData(updater) {
    setData((current) => upsertMonthlySnapshot(typeof updater === "function" ? updater(current) : updater));
  }

  function addDeposit({ accountId, amount, note }) {
    if (!amount || amount <= 0) return;

    setData((current) => {
      const nextAccounts = current.accounts.map((account) =>
        account.id === accountId
          ? { ...account, amount: account.amount + amount }
          : account
      );

      const nextData = {
        ...current,
        accounts: nextAccounts,
        transactions: [
          { id: uid(), date: new Date().toISOString(), accountId, amount, note },
          ...(current.transactions || []),
        ].slice(0, 80),
      };

      return {
        ...nextData,
        history: sortSnapshots([
          ...(nextData.history || []),
          createSnapshot(nextData, {
            type: "auto",
            label: "Snapshot automatique",
          }),
        ]),
        updatedAt: new Date().toISOString(),
      };
    });

    setModal(null);
    setToast("Versement ajouté + snapshot automatique créé");
  }

  function addWithdrawal({ accountId, amount, note }) {
    if (!amount || amount <= 0) return;

    const selectedAccount = data.accounts.find((account) => account.id === accountId);
    if (!selectedAccount) return;

    if (amount > selectedAccount.amount) {
      setToast("Retrait impossible : montant supérieur au solde du compte");
      return;
    }

    setData((current) => {
      const nextAccounts = current.accounts.map((account) =>
        account.id === accountId
          ? { ...account, amount: Math.max(0, account.amount - amount) }
          : account
      );

      const nextData = {
        ...current,
        accounts: nextAccounts,
        transactions: [
          { id: uid(), date: new Date().toISOString(), accountId, amount: -amount, note: note || "Retrait" },
          ...(current.transactions || []),
        ].slice(0, 80),
      };

      return {
        ...nextData,
        history: sortSnapshots([
          ...(nextData.history || []),
          createSnapshot(nextData, {
            type: "auto",
            label: "Snapshot automatique",
          }),
        ]),
        updatedAt: new Date().toISOString(),
      };
    });

    setModal(null);
    setToast("Retrait ajouté + snapshot automatique créé");
  }

  function editAccount(id, amount, objective) {
    updateData((current) => ({
      ...current,
      accounts: current.accounts.map((account) => account.id === id ? { ...account, amount, objective } : account),
    }));
    setEditingAccount(null);
    setToast("Compte modifié et sauvegardé");
  }

  function addGoal(goal) {
    if (!goal.name || !goal.target) return;
    updateData((current) => ({ ...current, goals: [...current.goals, goal] }));
    setModal(null);
  }

  function addPlacement({ accountId, amount, objective }) {
    if (!accountId) return;
    if (!amount || amount <= 0) {
      setToast("Indique un montant supérieur à 0 € pour afficher ce placement");
      return;
    }

    setData((current) => {
      const nextAccounts = current.accounts.map((account) =>
        account.id === accountId
          ? { ...account, amount, objective: objective > 0 ? objective : account.objective }
          : account
      );

      const nextData = {
        ...current,
        accounts: nextAccounts,
        transactions: [
          { id: uid(), date: new Date().toISOString(), accountId, amount, note: "Ajout de placement" },
          ...(current.transactions || []),
        ].slice(0, 80),
      };

      return {
        ...nextData,
        history: sortSnapshots([
          ...(nextData.history || []),
          createSnapshot(nextData, { type: "auto", label: "Snapshot automatique" }),
        ]),
        updatedAt: new Date().toISOString(),
      };
    });

    setModal(null);
    setToast("Placement ajouté + snapshot automatique créé");
  }

  function deleteGoal(id) {
    updateData((current) => ({ ...current, goals: current.goals.filter((goal) => goal.id !== id) }));
  }

  function exportData() {
    const json = JSON.stringify(upsertMonthlySnapshot(data), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "patrimieux-sauvegarde.json";
    link.click();
    URL.revokeObjectURL(url);
    if (navigator.clipboard) navigator.clipboard.writeText(json).catch(() => {});
    setToast("Export JSON téléchargé");
  }

  function importData(raw) {
    try {
      const imported = normalizeData({ ...JSON.parse(raw), configured: true });
      setData(imported);
      setModal(null);
      setToast("Import réussi");
    } catch {
      setToast("Import impossible : JSON invalide");
    }
  }

  function createManualSnapshot() {
    setData((current) => ({
      ...current,
      history: sortSnapshots([
        ...(current.history || []),
        createSnapshot(current, { type: "manual", label: "Snapshot manuel" }),
      ]),
      updatedAt: new Date().toISOString(),
    }));
    setToast("Snapshot actualisé manuellement");
  }

  function restoreSnapshot(snapshotId) {
    const snapshot = (data.history || []).find((item) => item.id === snapshotId);
    if (!snapshot || !Array.isArray(snapshot.accounts)) return;
    if (!window.confirm("Revenir à ce snapshot ? Les montants actuels des comptes seront remplacés.")) return;

    updateData((current) => ({
      ...current,
      accounts: current.accounts.map((account) => {
        const saved = snapshot.accounts.find((item) => item.id === account.id);
        return saved
          ? { ...account, amount: parseMoney(saved.amount), objective: parseMoney(saved.objective || account.objective) }
          : account;
      }),
    }));
    setToast("Montants restaurés depuis le snapshot");
  }

  function overwriteSnapshot(snapshotId) {
    const snapshot = (data.history || []).find((item) => item.id === snapshotId);
    if (!snapshot) return;
    if (!window.confirm("Écraser ce snapshot avec les montants actuels ?")) return;

    setData((current) => ({
      ...current,
      history: sortSnapshots((current.history || []).map((item) => (
        item.id === snapshotId
          ? createSnapshot(current, {
              id: item.id,
              type: item.type || "manual",
              label: item.label || "Snapshot écrasé",
            })
          : item
      ))),
      updatedAt: new Date().toISOString(),
    }));
    setToast("Snapshot écrasé avec l’état actuel");
  }

  function deleteSnapshot(snapshotId) {
    if (!window.confirm("Supprimer définitivement ce snapshot ?")) return;
    setData((current) => ({
      ...current,
      history: (current.history || []).filter((item) => item.id !== snapshotId),
      updatedAt: new Date().toISOString(),
    }));
    setToast("Snapshot supprimé");
  }

  return (
    <div className={`app ${data.darkMode ? "dark" : ""}`}>
      {toast && <div className="toast" onAnimationEnd={() => setToast("")}>{toast}</div>}

      <aside className="sidebar">
        <div className="brand"><span>✨</span><strong>PatriMieux</strong></div>
        
          <button className={"navItem active"} type="button">
            <span>🏠</span>
            <strong>Tableau de bord</strong>
          </button>
          <button className={"navItem"} type="button" onClick={() => setModal("settings")}>
            <span>⚙️</span>
            <strong>Paramètres</strong>
          </button>
        
        <div className="sideLevel sceneFrame" style={{ backgroundImage: `url(${levelData.currentLevel.image})` }}>
          <div className="livingLayer" />
          <div className="sceneShade" />
          <div>
            <span>Niveau actuel</span>
            <h3>{levelData.currentLevel.emoji} {levelData.currentLevel.name}</h3>
            <p>{levelData.currentLevel.label}</p>
            <button onClick={() => setModal("deposit")}>Ajouter un versement</button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>Bonjour {data.userName || data.userAccount?.pseudo || "Mathias"} 👋</h1>
            <p>Ton patrimoine évolue comme un monde vivant, niveau après niveau.</p>
          </div>

          <div className="topActions">
            <button className="iconBtn themeToggle" onClick={() => updateData((current) => ({ ...current, darkMode: !current.darkMode }))} title="Changer de thème">
              <span className="themeToggleEmoji">{data.darkMode ? "☀️" : "🌙"}</span>
            </button>
            <button className="secondaryBtn" onClick={exportData}>Exporter</button>
            <button className="secondaryBtn" onClick={() => setModal("import")}>Importer</button>
            <button className="secondaryBtn" onClick={() => setModal("welcome")}>Modifier accueil</button>
            <div className="moneyActions">
              <button className="primaryBtn" onClick={() => setModal("deposit")}>+ Versement</button>
              <button className="withdrawBtn" onClick={() => setModal("withdrawal")}>− Retrait</button>
            </div>
            <button
              className="secondaryBtn logoutBtn"
              onClick={() => {
                if (window.confirm("Te déconnecter ?")) {
                  onLogout?.();
                }
              }}
            >
              🚪 Déconnexion
            </button>
          </div>
        </header>

        <section className="heroStatsGrid">
          <div className="statCard primaryStat">
            <span className="eyebrow">Patrimoine total</span>
            <strong>{currency(total)}</strong>
            <p>{levelData.currentLevel.emoji} Niveau : {levelData.currentLevel.name}</p>
            <small>{data.syncing ? "Synchronisation cloud..." : "Sauvegarde cloud active"}</small>
          </div>
          <div className="statCard variationCard">
            <span className="eyebrow">Variation estimée</span>
            <strong className={snapshotDeltaClass}>{signedCurrency(snapshotDelta)}</strong>
            <p>{previousSnapshot ? `vs snapshot précédent (${signedPercent(snapshotDeltaPercent)})` : "vs dernier snapshot enregistré"}</p>

            <div className="snapshotSummary">
              <div>
                <span>{previousSnapshot ? "Dernier snapshot comparé" : "Dernier snapshot"}</span>
                <b>{latestSnapshot ? formatSnapshotDate(latestSnapshot.date) : "Aucun snapshot"}</b>
                {previousSnapshot && <small className="snapshotCompareDate">Précédent : {formatSnapshotDate(previousSnapshot.date)}</small>}
              </div>
              <div className="snapshotActions">
                <button type="button" onClick={createManualSnapshot}>Actualiser</button>
                <button type="button" onClick={() => setSnapshotMenuOpen((open) => !open)}>
                  {snapshotMenuOpen ? "Fermer" : "Snapshots"}
                </button>
              </div>
            </div>

            {snapshotMenuOpen && (
              <div className="snapshotMenu">
                {sortedSnapshots.length === 0 && <p>Aucun snapshot enregistré.</p>}
                {[...sortedSnapshots].reverse().map((snapshot) => (
                  <div className="snapshotItem" key={snapshot.id}>
                    <div className="snapshotItemMain">
                      <strong>{snapshot.label || "Snapshot"}</strong>
                      <span>{formatSnapshotDate(snapshot.date)}</span>
                      <em>{currency(snapshot.total)}</em>
                    </div>
                    <div className="snapshotItemActions">
                      <button type="button" onClick={() => restoreSnapshot(snapshot.id)}>Revenir</button>
                      <button type="button" onClick={() => overwriteSnapshot(snapshot.id)}>Écraser</button>
                      <button type="button" className="dangerMini" onClick={() => deleteSnapshot(snapshot.id)}>Suppr.</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <SnapshotEvolutionCard data={data} currentTotal={total} />
        </section>

        <LivingScene levelData={levelData} total={total} />

        <section className="accountsGrid">
          {visibleAccounts.map((account) => (
            <AccountCard key={account.id} account={account} onEdit={setEditingAccount} />
          ))}
          <AddPlacementCard hiddenAccounts={hiddenAccounts} onAdd={() => setModal("addPlacement")} />
        </section>

        <section className="dashboardGrid">
          <PatrimoineInsightsSection history={data.history} accounts={data.accounts} total={total} />
          <ProjectionPanel data={data} setData={setData} total={total} />
          <GoalsPanel goals={data.goals} total={total} onAdd={() => setModal("goal")} onDelete={deleteGoal} />
          <TransactionsPanel transactions={data.transactions} accounts={data.accounts} onDeposit={() => setModal("deposit")} />
        </section>

        <LevelGallery currentId={levelData.currentLevel.id} />

        <section className="dangerZone">
          <div>
            <h2>Zone de sécurité</h2>
            <p>Exporte tes données avant un reset pour garder une sauvegarde externe.</p>
          </div>
          <button className="dangerBtn" onClick={onReset}>Reset complet</button>
        </section>
      </main>

      {modal === "deposit" && <DepositModal accounts={data.accounts} onClose={() => setModal(null)} onSubmit={addDeposit} />}
      {modal === "withdrawal" && <WithdrawalModal accounts={data.accounts} onClose={() => setModal(null)} onSubmit={addWithdrawal} />}
      {modal === "goal" && <GoalModal onClose={() => setModal(null)} onSubmit={addGoal} />}
      {modal === "addPlacement" && <AddPlacementModal accounts={data.accounts} onClose={() => setModal(null)} onSubmit={addPlacement} />}
      {modal === "import" && <ImportModal onClose={() => setModal(null)} onImport={importData} />}
      {editingAccount && <EditAccountModal account={editingAccount} onClose={() => setEditingAccount(null)} onSubmit={editAccount} />}
      <Styles />
    </div>
  );
}

function LandingPage({ onStart, onLogin }) {
  const css = `
    html, body, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; min-height: 100% !important; max-width: none !important; background: #ecfdf5 !important; overflow-x: hidden !important; }
    .pmHomeV4, .pmHomeV4 * { box-sizing: border-box; }
    .pmHomeV4 {
      min-height: 100vh;
      width: 100%;
      max-width: 100%;
      margin: 0;
      padding: 28px clamp(28px, 5vw, 72px);
      overflow-x: hidden;
      position: relative;
      overflow: hidden;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #071033;
      background:
        radial-gradient(circle at 9% 18%, rgba(16,185,129,.28), transparent 30%),
        radial-gradient(circle at 88% 14%, rgba(59,130,246,.24), transparent 32%),
        radial-gradient(circle at 62% 94%, rgba(168,85,247,.18), transparent 30%),
        linear-gradient(135deg, #f8fafc 0%, #ecfdf5 38%, #eff6ff 70%, #faf5ff 100%);
    }
    .pmHomeV4::before {
      content: "";
      position: absolute;
      inset: -20%;
      background-image:
        linear-gradient(rgba(15,23,42,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(15,23,42,.04) 1px, transparent 1px);
      background-size: 46px 46px;
      mask-image: radial-gradient(circle at 50% 30%, black, transparent 70%);
      pointer-events: none;
    }
    .pmHomeBlob {
      position: absolute;
      border-radius: 999px;
      filter: blur(6px);
      opacity: .75;
      pointer-events: none;
      animation: pmHomeFloat 8s ease-in-out infinite;
    }
    .pmHomeBlob.one { width: 180px; height: 180px; left: -60px; top: 150px; background: rgba(16,185,129,.22); }
    .pmHomeBlob.two { width: 260px; height: 260px; right: -90px; top: 110px; background: rgba(59,130,246,.20); animation-delay: -2s; }
    .pmHomeBlob.three { width: 190px; height: 190px; left: 52%; bottom: -70px; background: rgba(168,85,247,.16); animation-delay: -4s; }
    @keyframes pmHomeFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-18px); } }
    .pmHomeShell { position: relative; z-index: 2; width: 100%; max-width: 1680px; margin: 0 auto; overflow: hidden; }
    .pmHomeNav {
      height: 72px;
      border-radius: 26px;
      background: rgba(255,255,255,.82);
      border: 1px solid rgba(255,255,255,.95);
      box-shadow: 0 18px 45px rgba(15,23,42,.08);
      backdrop-filter: blur(18px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 11px 12px 11px 18px;
      margin-bottom: 34px;
    }
    .pmHomeLogo { display: flex; align-items: center; gap: 12px; font-size: 25px; font-weight: 950; color: #071033; }
    .pmHomeLogoIcon { width: 50px; height: 50px; border-radius: 17px; background: #dcfce7; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 26px rgba(16,185,129,.18); }
    .pmHomePills { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
    .pmHomePills span { border-radius: 999px; background: #f8fafc; color: #64748b; padding: 10px 12px; font-size: 13px; font-weight: 900; }
    .pmHomeLogin { border: 0; border-radius: 16px; background: #071033; color: white; padding: 13px 16px; font-weight: 950; cursor: pointer; }
    .pmHomeHero { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(420px, .82fr); gap: clamp(28px, 4vw, 58px); align-items: center; min-height: calc(100vh - 260px); }
    .pmHomeText { padding: 28px 0 18px; text-align: left; }
    .pmHomeBadge { display: inline-flex; align-items: center; gap: 8px; width: max-content; border-radius: 999px; background: #dcfce7; color: #047857; padding: 11px 15px; font-weight: 950; margin-bottom: 20px; box-shadow: 0 12px 24px rgba(16,185,129,.12); }
    .pmHomeText h1 { margin: 0 0 22px; max-width: 860px; color: #061333; font-size: clamp(48px, 5.5vw, 86px); line-height: .9; letter-spacing: -4px; text-align: left; }
    .pmHomeText p { margin: 0; max-width: 760px; color: #475569; font-size: 20px; line-height: 1.68; font-weight: 700; text-align: left; }
    .pmHomeActions { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 28px; justify-content: flex-start; }
    .pmHomePrimary, .pmHomeSecondary { border: 0; border-radius: 20px; padding: 17px 22px; font-size: 16px; font-weight: 950; cursor: pointer; transition: .18s ease; }
    .pmHomePrimary { color: white; background: linear-gradient(135deg,#10b981,#22c55e); box-shadow: 0 20px 38px rgba(16,185,129,.28); }
    .pmHomeSecondary { color: #071033; background: white; box-shadow: 0 16px 34px rgba(15,23,42,.08); }
    .pmHomePrimary:hover, .pmHomeSecondary:hover { transform: translateY(-2px); }
    .pmHomeTrust { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
    .pmHomeTrust span { border-radius: 999px; background: rgba(255,255,255,.78); color: #475569; padding: 10px 13px; font-size: 13px; font-weight: 900; box-shadow: 0 10px 24px rgba(15,23,42,.06); }
    .pmHomeMock {
      transform: none;
      border-radius: 36px;
      background: rgba(255,255,255,.88);
      border: 1px solid rgba(255,255,255,.95);
      box-shadow: 0 28px 70px rgba(15,23,42,.15);
      padding: 22px;
      backdrop-filter: blur(18px);
    }
    .pmHomeMockTop { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 16px; }
    .pmHomeMockTop span { display: block; color: #64748b; font-size: 12px; font-weight: 950; letter-spacing: .08em; text-transform: uppercase; }
    .pmHomeMockTop strong { display: block; margin-top: 3px; color: #071033; font-size: 38px; line-height: 1; letter-spacing: -1px; }
    .pmHomeLevel { border-radius: 999px; background: #ecfdf5; color: #047857; padding: 10px 12px; font-size: 13px; font-weight: 950; white-space: nowrap; }
    .pmHomeWorld { height: 280px; border-radius: 30px; position: relative; overflow: hidden; background: linear-gradient(180deg,#7dd3fc 0%,#bfdbfe 34%,#fde68a 56%,#86efac 100%); }
    .pmHomeSun { position: absolute; width: 78px; height: 78px; border-radius: 999px; background: #fbbf24; right: 36px; top: 34px; box-shadow: 0 0 60px rgba(251,191,36,.85); }
    .pmHomeCloud { position: absolute; width: 120px; height: 34px; border-radius: 999px; background: rgba(255,255,255,.72); left: 28px; top: 42px; box-shadow: 50px 12px 0 rgba(255,255,255,.55); animation: pmCloudMove 9s ease-in-out infinite; }
    @keyframes pmCloudMove { 0%,100% { transform: translateX(0); } 50% { transform: translateX(24px); } }
    .pmHomeHill { position: absolute; bottom: -52px; border-radius: 50% 50% 0 0; }
    .pmHomeHill.one { width: 360px; height: 160px; background: #22c55e; left: -80px; }
    .pmHomeHill.two { width: 450px; height: 210px; background: #16a34a; right: -130px; }
    .pmHomeCastle { position: absolute; left: 50%; top: 48%; transform: translate(-50%,-50%); font-size: 82px; filter: drop-shadow(0 18px 18px rgba(15,23,42,.25)); }
    .pmHomeRocket { position: absolute; right: 34px; bottom: 44px; font-size: 46px; animation: pmRocketFloat 3s ease-in-out infinite; }
    @keyframes pmRocketFloat { 0%,100% { transform: translateY(0) rotate(-8deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
    .pmHomeStats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }
    .pmHomeStats div { border-radius: 20px; background: #f8fafc; padding: 15px 12px; text-align: center; }
    .pmHomeStats b { display: block; color: #047857; font-size: 19px; line-height: 1; }
    .pmHomeStats small { display: block; color: #64748b; font-weight: 900; margin-top: 6px; }
    .pmHomeFeatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 30px; padding-bottom: 28px; }
    .pmHomeFeature { background: rgba(255,255,255,.82); border: 1px solid rgba(255,255,255,.95); border-radius: 30px; padding: 24px; box-shadow: 0 18px 42px rgba(15,23,42,.09); backdrop-filter: blur(14px); text-align: left; }
    .pmHomeFeatureIcon { width: 58px; height: 58px; border-radius: 20px; background: #ecfdf5; display: flex; align-items: center; justify-content: center; font-size: 29px; margin-bottom: 16px; }
    .pmHomeFeature h3 { margin: 0 0 9px; color: #071033; font-size: 23px; letter-spacing: -.4px; }
    .pmHomeFeature p { margin: 0; color: #64748b; font-weight: 700; line-height: 1.52; }
    @media(max-width: 980px) { .pmHomeHero, .pmHomeFeatures { grid-template-columns: 1fr; } .pmHomeMock { transform: none; } .pmHomeNav { height: auto; align-items: flex-start; flex-direction: column; } .pmHomePills { justify-content: flex-start; } }
    @media(max-width: 640px) { .pmHomeV4 { padding: 18px; width: 100%; overflow-x: hidden; } .pmHomeText h1 { font-size: 46px; letter-spacing: -2.4px; } .pmHomeText p { font-size: 17px; } .pmHomeActions button { width: 100%; } .pmHomeStats { grid-template-columns: 1fr; } .pmHomeWorld { height: 230px; } .pmHomeFeatures { gap: 14px; } }
  `;

  return (
    <div className="pmHomeV4">
      <style>{css}</style>
      <div className="pmHomeBlob one" />
      <div className="pmHomeBlob two" />
      <div className="pmHomeBlob three" />

      <div className="pmHomeShell">
        <nav className="pmHomeNav">
          <div className="pmHomeLogo"><span className="pmHomeLogoIcon">✨</span><strong>PatriMieux</strong></div>
          <div className="pmHomePills">
            <span>🔒 Données locales</span>
            <span>📸 Snapshots auto</span>
            <span>📊 Vision long terme</span>
            <button className="pmHomeLogin" onClick={onLogin}>J’ai déjà un compte</button>
          </div>
        </nav>

        <main className="pmHomeHero">
          <section className="pmHomeText">
            <div className="pmHomeBadge">🌱 Patrimoine vivant</div>
            <h1>Transforme ton épargne en aventure visuelle.</h1>
            <p>
              Suis tes livrets, ton PEA, ton CTO et tes placements long terme avec une interface claire,
              colorée et motivante. Chaque versement fait progresser ton monde financier.
            </p>
            <div className="pmHomeActions">
              <button className="pmHomePrimary" onClick={onStart}>Créer mon compte gratuit</button>
              <button className="pmHomeSecondary" onClick={onLogin}>Voir la démo</button>
            </div>
            <div className="pmHomeTrust">
              <span>✅ Simple à suivre</span>
              <span>🎯 Objectifs visibles</span>
              <span>🧭 Progression par niveaux</span>
            </div>
          </section>

          <aside className="pmHomeMock">
            <div className="pmHomeMockTop">
              <div><span>Patrimoine total</span><strong>42 850 €</strong></div>
              <div className="pmHomeLevel">🏰 Moyen Âge</div>
            </div>
            <div className="pmHomeWorld">
              <div className="pmHomeSun" />
              <div className="pmHomeCloud" />
              <div className="pmHomeHill one" />
              <div className="pmHomeHill two" />
              <div className="pmHomeCastle">🏰</div>
              <div className="pmHomeRocket">🚀</div>
            </div>
            <div className="pmHomeStats">
              <div><b>+12,4%</b><small>progression</small></div>
              <div><b>6</b><small>placements</small></div>
              <div><b>Auto</b><small>snapshots</small></div>
            </div>
          </aside>
        </main>

        <section className="pmHomeFeatures">
          <article className="pmHomeFeature">
            <div className="pmHomeFeatureIcon">📈</div>
            <h3>Suis ton évolution réelle</h3>
            <p>Observe ton patrimoine par jour, mois ou année avec une courbe basée sur tes snapshots.</p>
          </article>
          <article className="pmHomeFeature">
            <div className="pmHomeFeatureIcon">🎯</div>
            <h3>Garde tes objectifs en vue</h3>
            <p>Vois où tu en es sur chaque enveloppe : PEA, livrets, assurance vie, PER, PEE.</p>
          </article>
          <article className="pmHomeFeature">
            <div className="pmHomeFeatureIcon">🌍</div>
            <h3>Rends l’épargne motivante</h3>
            <p>Ton patrimoine débloque des niveaux visuels, de la Préhistoire au monde futuriste.</p>
          </article>
        </section>
      </div>
    </div>
  );
}

function LoginPage({ onBack, onSubmit }) {
  const css = `
    html, body, #root { margin:0!important; padding:0!important; width:100%!important; min-height:100%!important; overflow-x:hidden!important; }
    .pmLoginFull,.pmLoginFull *{box-sizing:border-box}
    .pmLoginFull{min-height:100vh;width:100%;display:grid;grid-template-columns:minmax(420px,.82fr) minmax(0,1.08fr);background:radial-gradient(circle at 16% 18%,rgba(59,130,246,.24),transparent 34%),radial-gradient(circle at 86% 70%,rgba(16,185,129,.24),transparent 34%),linear-gradient(135deg,#eff6ff,#ecfdf5,#f8fafc);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#071033;position:relative;overflow:hidden}
    .pmLoginSide{position:relative;z-index:2;padding:clamp(24px,4vw,70px);display:flex;align-items:center;justify-content:center;min-height:100vh}.pmLoginInfo{position:relative;z-index:2;padding:clamp(36px,6vw,86px);display:flex;flex-direction:column;justify-content:center;min-height:100vh}.pmLoginCard{width:min(520px,100%);background:rgba(255,255,255,.9);border:1px solid rgba(255,255,255,.95);backdrop-filter:blur(22px);border-radius:34px;padding:clamp(28px,4vw,42px);box-shadow:0 30px 75px rgba(15,23,42,.14)}
    .pmLoginBrand{width:max-content;display:inline-flex;align-items:center;gap:10px;border-radius:999px;background:#dbeafe;color:#1d4ed8;padding:11px 16px;font-weight:950;margin-bottom:24px}.pmLoginInfo h1{margin:0 0 22px;max-width:760px;font-size:clamp(52px,6.5vw,90px);line-height:.9;letter-spacing:-4px;color:#061333}.pmLoginInfo p{margin:0;max-width:650px;color:#475569;font-size:20px;line-height:1.65;font-weight:750}.pmLoginCard h2{margin:0;color:#061333;font-size:42px;line-height:1;letter-spacing:-1.6px}.pmLoginCard p{margin:12px 0 24px;color:#64748b;font-weight:750;line-height:1.45}.pmLoginForm{display:grid;gap:16px}.pmLoginInput{display:grid;gap:7px}.pmLoginInput label{color:#475569;font-size:13px;font-weight:950}.pmLoginInput input{width:100%;border:1px solid #e2e8f0;background:white;color:#071033;border-radius:17px;padding:15px 16px;font-size:15px;font-weight:750;outline:none;transition:.18s ease}.pmLoginInput input:focus{border-color:#3b82f6;box-shadow:0 0 0 4px rgba(59,130,246,.16)}.pmLoginActions{display:grid;gap:12px;margin-top:10px}.pmLoginPrimary,.pmLoginSecondary{border:0;border-radius:17px;padding:15px 17px;font-weight:950;cursor:pointer;font-size:15px;transition:.18s ease}.pmLoginPrimary{background:linear-gradient(135deg,#2563eb,#10b981);color:white;box-shadow:0 18px 34px rgba(37,99,235,.22)}.pmLoginSecondary{background:#f1f5f9;color:#071033}.pmLoginPrimary:hover,.pmLoginSecondary:hover{transform:translateY(-2px)}.pmLoginError{border-radius:16px;background:#fee2e2;color:#991b1b;padding:12px 14px;font-weight:900;font-size:13px}.pmLoginNote{margin-top:18px;border-radius:18px;background:#f8fafc;color:#64748b;padding:13px 14px;font-size:13px;font-weight:800;line-height:1.4}.pmLoginBenefits{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}.pmLoginBenefits span{border-radius:999px;background:rgba(255,255,255,.82);color:#475569;padding:10px 13px;font-size:13px;font-weight:900;box-shadow:0 10px 24px rgba(15,23,42,.06)}
    @media(max-width:980px){.pmLoginFull{grid-template-columns:1fr}.pmLoginSide,.pmLoginInfo{min-height:auto}.pmLoginInfo{order:-1;padding-bottom:20px}.pmLoginInfo h1{font-size:48px;letter-spacing:-2.5px}}@media(max-width:620px){.pmLoginSide,.pmLoginInfo{padding:22px}.pmLoginInfo h1{font-size:40px}.pmLoginInfo p{font-size:16px}.pmLoginCard h2{font-size:34px}}
  `;
  const [error, setError] = useState("");
  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const ok = onSubmit({ email, password });
    if (ok === false) setError("Adresse mail ou mot de passe incorrect.");
  }
  return (
    <div className="pmLoginFull">
      <style>{css}</style>
      <section className="pmLoginSide">
        <div className="pmLoginCard">
          <h2>Connexion</h2>
          <p>Retrouve ton espace Patrimieux et continue ton suivi long terme.</p>
          <form className="pmLoginForm" onSubmit={handleSubmit}>
            <div className="pmLoginInput"><label>Adresse mail</label><input name="email" type="email" placeholder="exemple@mail.com" required /></div>
            <div className="pmLoginInput"><label>Mot de passe</label><input name="password" type="password" placeholder="Ton mot de passe" required /></div>
            {error && <div className="pmLoginError">{error}</div>}
            <div className="pmLoginActions">
              <button className="pmLoginPrimary" type="submit">Me connecter</button>
              <button className="pmLoginSecondary" type="button" onClick={onBack}>← Retour à l’accueil</button>
            </div>
          </form>
          <div className="pmLoginNote">Connexion sécurisée avec ton compte Supabase.</div>
        </div>
      </section>
      <section className="pmLoginInfo">
        <div className="pmLoginBrand">🔐 PatriMieux</div>
        <h1>Reprends ton évolution là où tu l’as laissée.</h1>
        <p>Accède à ton tableau de bord, tes snapshots, ta progression par niveaux et la structure de ton patrimoine.</p>
        <div className="pmLoginBenefits"><span>📊 Dashboard vivant</span><span>📸 Historique conservé</span><span>🎯 Objectifs visibles</span></div>
      </section>
    </div>
  );
}

function CreateAccountPage({ onBack, onSubmit }) {
  const css = `
    html, body, #root {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-height: 100% !important;
      overflow-x: hidden !important;
    }

    .pmCreateFull,
    .pmCreateFull * {
      box-sizing: border-box;
    }

    .pmCreateFull {
      width: 100%;
      min-height: 100vh;
      display: grid;
      grid-template-columns: minmax(0, 1.08fr) minmax(420px, 0.82fr);
      background:
        radial-gradient(circle at 14% 18%, rgba(16, 185, 129, 0.28), transparent 32%),
        radial-gradient(circle at 86% 12%, rgba(59, 130, 246, 0.24), transparent 34%),
        radial-gradient(circle at 58% 94%, rgba(168, 85, 247, 0.16), transparent 30%),
        linear-gradient(135deg, #f8fafc 0%, #ecfdf5 40%, #eff6ff 74%, #faf5ff 100%);
      color: #071033;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      position: relative;
      overflow: hidden;
    }

    .pmCreateFull::before {
      content: "";
      position: absolute;
      inset: -20%;
      background-image:
        linear-gradient(rgba(15, 23, 42, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(15, 23, 42, 0.035) 1px, transparent 1px);
      background-size: 46px 46px;
      mask-image: radial-gradient(circle at 45% 40%, black, transparent 72%);
      pointer-events: none;
    }

    .pmCreateBlob {
      position: absolute;
      border-radius: 999px;
      filter: blur(8px);
      opacity: 0.72;
      pointer-events: none;
      animation: pmCreateFloat 8s ease-in-out infinite;
    }

    .pmCreateBlob.one {
      width: 240px;
      height: 240px;
      left: -90px;
      top: 120px;
      background: rgba(16, 185, 129, 0.22);
    }

    .pmCreateBlob.two {
      width: 280px;
      height: 280px;
      right: -120px;
      top: 90px;
      background: rgba(59, 130, 246, 0.2);
      animation-delay: -2s;
    }

    .pmCreateBlob.three {
      width: 220px;
      height: 220px;
      left: 48%;
      bottom: -90px;
      background: rgba(168, 85, 247, 0.16);
      animation-delay: -4s;
    }

    @keyframes pmCreateFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-18px); }
    }

    .pmCreateLeft {
      position: relative;
      z-index: 2;
      padding: clamp(36px, 6vw, 86px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 100vh;
    }

    .pmCreateBrand {
      width: max-content;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      border-radius: 999px;
      background: rgba(220, 252, 231, 0.95);
      color: #047857;
      padding: 11px 16px;
      font-weight: 950;
      box-shadow: 0 12px 26px rgba(16, 185, 129, 0.14);
      margin-bottom: 24px;
    }

    .pmCreateLeft h1 {
      margin: 0 0 22px;
      max-width: 820px;
      font-size: clamp(54px, 7vw, 94px);
      line-height: 0.9;
      letter-spacing: -4px;
      color: #061333;
    }

    .pmCreateLeft p {
      margin: 0;
      max-width: 680px;
      color: #475569;
      font-size: 20px;
      line-height: 1.65;
      font-weight: 750;
    }

    .pmCreateBenefits {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 28px;
    }

    .pmCreateBenefits span {
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.82);
      color: #475569;
      padding: 10px 13px;
      font-size: 13px;
      font-weight: 900;
      box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
    }

    .pmCreateMiniWorld {
      margin-top: 34px;
      width: min(560px, 100%);
      border-radius: 30px;
      background: rgba(255, 255, 255, 0.78);
      border: 1px solid rgba(255, 255, 255, 0.95);
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.1);
      padding: 18px;
      backdrop-filter: blur(18px);
    }

    .pmCreateWorldScene {
      height: 190px;
      border-radius: 24px;
      position: relative;
      overflow: hidden;
      background: linear-gradient(180deg, #7dd3fc 0%, #bfdbfe 35%, #fde68a 58%, #86efac 100%);
    }

    .pmCreateSun {
      position: absolute;
      width: 62px;
      height: 62px;
      border-radius: 999px;
      background: #fbbf24;
      right: 34px;
      top: 28px;
      box-shadow: 0 0 55px rgba(251, 191, 36, 0.8);
    }

    .pmCreateHill {
      position: absolute;
      bottom: -48px;
      border-radius: 50% 50% 0 0;
    }

    .pmCreateHill.one {
      width: 320px;
      height: 135px;
      background: #22c55e;
      left: -70px;
    }

    .pmCreateHill.two {
      width: 390px;
      height: 175px;
      background: #16a34a;
      right: -110px;
    }

    .pmCreateCastle {
      position: absolute;
      left: 50%;
      top: 52%;
      transform: translate(-50%, -50%);
      font-size: 62px;
      filter: drop-shadow(0 16px 16px rgba(15, 23, 42, 0.24));
    }

    .pmCreateRocket {
      position: absolute;
      right: 38px;
      bottom: 34px;
      font-size: 34px;
      animation: pmCreateRocket 3s ease-in-out infinite;
    }

    @keyframes pmCreateRocket {
      0%, 100% { transform: translateY(0) rotate(-8deg); }
      50% { transform: translateY(-10px) rotate(3deg); }
    }

    .pmCreateRight {
      position: relative;
      z-index: 2;
      min-height: 100vh;
      padding: clamp(24px, 4vw, 70px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pmCreateCard {
      width: min(520px, 100%);
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(22px);
      border-radius: 34px;
      padding: clamp(28px, 4vw, 42px);
      box-shadow: 0 30px 75px rgba(15, 23, 42, 0.14);
    }

    .pmCreateCardTop {
      margin-bottom: 24px;
    }

    .pmCreateCardTop h2 {
      margin: 0;
      color: #061333;
      font-size: 42px;
      line-height: 1;
      letter-spacing: -1.6px;
    }

    .pmCreateCardTop p {
      margin: 12px 0 0;
      color: #64748b;
      font-weight: 750;
      line-height: 1.45;
    }

    .pmCreateForm {
      display: grid;
      gap: 16px;
    }

    .pmCreateInput {
      display: grid;
      gap: 7px;
    }

    .pmCreateInput label {
      color: #475569;
      font-size: 13px;
      font-weight: 950;
    }

    .pmCreateInput input {
      width: 100%;
      border: 1px solid #e2e8f0;
      background: white;
      color: #071033;
      border-radius: 17px;
      padding: 15px 16px;
      font-size: 15px;
      font-weight: 750;
      outline: none;
      transition: 0.18s ease;
    }

    .pmCreateInput input:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.16);
    }

    .pmCreateActions {
      display: grid;
      gap: 12px;
      margin-top: 10px;
    }

    .pmCreatePrimary,
    .pmCreateSecondary {
      border: 0;
      border-radius: 17px;
      padding: 15px 17px;
      font-weight: 950;
      cursor: pointer;
      font-size: 15px;
      transition: 0.18s ease;
    }

    .pmCreatePrimary {
      background: linear-gradient(135deg, #10b981, #22c55e);
      color: white;
      box-shadow: 0 18px 34px rgba(16, 185, 129, 0.26);
    }

    .pmCreateSecondary {
      background: #f1f5f9;
      color: #071033;
    }

    .pmCreatePrimary:hover,
    .pmCreateSecondary:hover {
      transform: translateY(-2px);
    }

    .pmCreateNotice {
      margin-top: 18px;
      border-radius: 18px;
      background: #f8fafc;
      color: #64748b;
      padding: 13px 14px;
      font-size: 13px;
      font-weight: 800;
      line-height: 1.4;
    }

    @media (max-width: 980px) {
      .pmCreateFull {
        grid-template-columns: 1fr;
      }
      .pmCreateLeft,
      .pmCreateRight {
        min-height: auto;
      }
      .pmCreateLeft {
        padding-bottom: 20px;
      }
      .pmCreateRight {
        padding-top: 10px;
      }
      .pmCreateLeft h1 {
        font-size: 52px;
        letter-spacing: -2.5px;
      }
    }

    @media (max-width: 620px) {
      .pmCreateFull {
        display: block;
      }
      .pmCreateLeft,
      .pmCreateRight {
        padding: 22px;
      }
      .pmCreateLeft h1 {
        font-size: 42px;
      }
      .pmCreateLeft p {
        font-size: 16px;
      }
      .pmCreateMiniWorld {
        display: none;
      }
      .pmCreateCardTop h2 {
        font-size: 34px;
      }
    }
  `;

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      pseudo: String(form.get("pseudo") || "").trim(),
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
    });
  }

  return (
    <div className="pmCreateFull">
      <style>{css}</style>
      <div className="pmCreateBlob one" />
      <div className="pmCreateBlob two" />
      <div className="pmCreateBlob three" />

      <section className="pmCreateLeft">
        <div className="pmCreateBrand">✨ PatriMieux</div>
        <h1>Crée ton espace patrimoine.</h1>
        <p>
          Configure ton point de départ, suis tes placements et regarde ton monde financier évoluer à chaque versement.
        </p>
        <div className="pmCreateBenefits">
          <span>🔒 Sauvegarde cloud sécurisée</span>
          <span>📸 Snapshots automatiques</span>
          <span>🎯 Objectifs visuels</span>
        </div>

        <div className="pmCreateMiniWorld">
          <div className="pmCreateWorldScene">
            <div className="pmCreateSun" />
            <div className="pmCreateHill one" />
            <div className="pmCreateHill two" />
            <div className="pmCreateCastle">🏰</div>
            <div className="pmCreateRocket">🚀</div>
          </div>
        </div>
      </section>

      <section className="pmCreateRight">
        <div className="pmCreateCard">
          <div className="pmCreateCardTop">
            <h2>Créer ton compte</h2>
            <p>Une fois créé, tu passeras à la configuration initiale de ton patrimoine.</p>
          </div>

          <form className="pmCreateForm" onSubmit={handleSubmit}>
            <div className="pmCreateInput">
              <label>Pseudo</label>
              <input name="pseudo" placeholder="Ex : Mathias" required />
            </div>
            <div className="pmCreateInput">
              <label>Adresse mail</label>
              <input name="email" type="email" placeholder="exemple@mail.com" required />
            </div>
            <div className="pmCreateInput">
              <label>Mot de passe</label>
              <input name="password" type="password" placeholder="Minimum 6 caractères" minLength="6" required />
            </div>

            <div className="pmCreateActions">
              <button className="pmCreatePrimary" type="submit">Créer mon compte</button>
              <button className="pmCreateSecondary" type="button" onClick={onBack}>← Retour</button>
            </div>
          </form>

          <div className="pmCreateNotice">
            Ces données servent à créer ton espace cloud personnel.
          </div>
        </div>
      </section>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(createDefaultData);
  const [authPage, setAuthPage] = useState("landing");
  const [setupValues, setSetupValues] = useState(() => Object.fromEntries(BASE_ACCOUNTS.map((account) => [account.id, "0"])));
  const [userName, setUserName] = useState("Mathias");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => { runTests(); }, []);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (mounted && user) await loadCloudData(user);
      if (mounted) setLoading(false);
    }

    initSession();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadCloudData(session.user);
      } else {
        setData(createDefaultData());
        setAuthPage("landing");
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  async function loadCloudData(user) {
    setLoading(true);

    try {
      if (!user?.id) {
        setData(createDefaultData());
        setAuthPage("landing");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("pseudo")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) console.warn("Erreur profile Supabase", profileError);

      const { data: cloudAccounts = [], error: accountsError } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (accountsError) console.warn("Erreur accounts Supabase", accountsError);

      const { data: cloudSnapshots = [], error: snapshotsError } = await supabase
        .from("snapshots")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (snapshotsError) console.warn("Erreur snapshots Supabase", snapshotsError);

      const { data: cloudTransactions = [], error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (transactionsError) console.warn("Erreur transactions Supabase", transactionsError);

      const mappedAccounts = BASE_ACCOUNTS.map((base) => {
        const found = (cloudAccounts || []).find((account) => account.account_key === base.id || account.name === base.name);
        return {
          ...base,
          amount: parseMoney(found?.balance ?? base.amount),
          objective: parseMoney(found?.objective ?? base.objective),
        };
      });

      const mappedSnapshots = (cloudSnapshots || []).map((snapshot) => ({
        id: snapshot.id,
        month: getMonthKey(new Date(snapshot.created_at)),
        date: snapshot.created_at,
        type: snapshot.type === "manuel" ? "manual" : "auto",
        label: snapshot.label || (snapshot.type === "manuel" ? "Snapshot manuel" : "Snapshot automatique"),
        total: parseMoney(snapshot.total),
        accounts: Array.isArray(snapshot.accounts)
          ? snapshot.accounts
          : mappedAccounts.map((account) => ({ id: account.id, amount: account.amount, objective: account.objective })),
      }));

      const mappedTransactions = (cloudTransactions || []).map((transaction) => ({
        id: transaction.id,
        date: transaction.created_at,
        accountId: transaction.account_key || "pea",
        amount: parseMoney(transaction.amount),
        note: transaction.note || (transaction.type === "withdrawal" ? "Retrait" : "Versement"),
      }));

      const pseudo = profile?.pseudo || user.user_metadata?.pseudo || user.email?.split("@")[0] || "Utilisateur";

      const nextData = normalizeData({
        ...createDefaultData(),
        userAccount: {
          id: user.id,
          pseudo,
          email: user.email,
        },
        userName: pseudo,
        configured: (cloudAccounts || []).length > 0,
        accounts: mappedAccounts,
        history: mappedSnapshots,
        transactions: mappedTransactions,
      });

      setUserName(pseudo);
      setData(nextData);
    } catch (error) {
      console.error("Erreur chargement PatriMieux", error);
      alert("Erreur de chargement Supabase. Regarde la console pour le détail.");
      setData(createDefaultData());
      setAuthPage("landing");
    } finally {
      setLoading(false);
    }
  }

  async function getCurrentUser() {
    const { data: authData } = await supabase.auth.getUser();
    return authData?.user || null;
  }

  async function syncDataToCloud(nextData) {
    const user = await getCurrentUser();
    if (!user || !nextData?.configured) return;

    setSyncing(true);

    const accountsPayload = (nextData.accounts || []).map((account) => ({
      user_id: user.id,
      account_key: account.id,
      name: account.name,
      icon: account.icon,
      kind: account.kind,
      balance: Number(account.amount) || 0,
      objective: Number(account.objective) || 0,
      color: account.color,
      gradient: account.gradient,
      updated_at: new Date().toISOString(),
    }));

    if (accountsPayload.length) {
      await supabase.from("accounts").upsert(accountsPayload, { onConflict: "user_id,account_key" });
    }

    const snapshotsPayload = (nextData.history || []).map((snapshot) => ({
      id: snapshot.id,
      user_id: user.id,
      total: Number(snapshot.total) || 0,
      type: snapshot.type === "manual" ? "manuel" : "automatique",
      label: snapshot.label || (snapshot.type === "manual" ? "Snapshot manuel" : "Snapshot automatique"),
      accounts: snapshot.accounts || [],
      created_at: snapshot.date || new Date().toISOString(),
    }));

    if (snapshotsPayload.length) {
      await supabase.from("snapshots").upsert(snapshotsPayload, { onConflict: "id" });
    }

    const transactionsPayload = (nextData.transactions || []).map((transaction) => ({
      id: transaction.id,
      user_id: user.id,
      account_key: transaction.accountId,
      amount: Number(transaction.amount) || 0,
      type: Number(transaction.amount) < 0 ? "withdrawal" : "deposit",
      note: transaction.note || null,
      created_at: transaction.date || new Date().toISOString(),
    }));

    if (transactionsPayload.length) {
      await supabase.from("transactions").upsert(transactionsPayload, { onConflict: "id" });
    }

    setSyncing(false);
  }

  function setDataAndSync(updater) {
    setData((current) => {
      const rawNext = typeof updater === "function" ? updater(current) : updater;
      const next = rawNext?.configured ? upsertMonthlySnapshot(rawNext) : rawNext;
      syncDataToCloud(next);
      return next;
    });
  }

  async function createAccount(account) {
    const pseudo = account.pseudo || "Utilisateur";
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
      options: { data: { pseudo } },
    });

    if (error) {
      alert(error.message);
      return false;
    }

    const user = signUpData?.user;
    if (user) {
      await supabase.from("profiles").upsert({ id: user.id, pseudo, updated_at: new Date().toISOString() });
      setUserName(pseudo);
      setData({
        ...createDefaultData(),
        userAccount: { id: user.id, pseudo, email: account.email },
        userName: pseudo,
        configured: false,
        updatedAt: new Date().toISOString(),
      });
    }

    return true;
  }

  async function loginLocalAccount(credentials) {
    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error || !loginData?.user) return false;
    await loadCloudData(loginData.user);
    return true;
  }

  async function submitSetup(event) {
    event.preventDefault();
    const user = await getCurrentUser();
    if (!user) {
      alert("Connecte-toi avant de configurer ton patrimoine.");
      return;
    }

    const accounts = BASE_ACCOUNTS.map((account) => ({ ...account, amount: parseMoney(setupValues[account.id]) }));
    const nextData = upsertMonthlySnapshot({
      ...createDefaultData(),
      userAccount: data.userAccount || { id: user.id, pseudo: userName, email: user.email },
      configured: true,
      userName: userName || data.userAccount?.pseudo || "Mathias",
      accounts,
    });

    setData(nextData);
    await supabase.from("profiles").upsert({ id: user.id, pseudo: nextData.userName, updated_at: new Date().toISOString() });
    await syncDataToCloud(nextData);
  }

  function demoSetup() {
    setUserName(data.userAccount?.pseudo || "Mathias");
    setSetupValues({
      pea: "2311,50",
      livretA: "0",
      ldds: "0",
      lep: "8850",
      livretJeune: "0",
      cto: "18",
      assuranceVie: "0",
      per: "0",
      pee: "0",
    });
  }

  function modifySetup() {
    setUserName(data.userName || data.userAccount?.pseudo || "Mathias");
    setSetupValues(Object.fromEntries((data.accounts || BASE_ACCOUNTS).map((account) => [account.id, String(account.amount).replace(".", ",")])));
    setData((current) => ({ ...current, configured: false }));
  }

  async function resetAll() {
    if (!window.confirm("Supprimer toutes les données PatriMieux de ce compte ?")) return;
    const user = await getCurrentUser();
    if (user) {
      await supabase.from("transactions").delete().eq("user_id", user.id);
      await supabase.from("snapshots").delete().eq("user_id", user.id);
      await supabase.from("accounts").delete().eq("user_id", user.id);
    }
    setData({
      ...createDefaultData(),
      userAccount: data.userAccount,
      userName: data.userName,
      configured: false,
    });
    setSetupValues(Object.fromEntries(BASE_ACCOUNTS.map((account) => [account.id, "0"])));
  }

  async function logout() {
    await supabase.auth.signOut();
    setData(createDefaultData());
    setAuthPage("landing");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#ecfdf5", color: "#071033", fontFamily: "Inter, system-ui" }}>
        <strong>Chargement de PatriMieux...</strong>
      </div>
    );
  }

  if (!data.userAccount) {
    if (authPage === "create") {
      return <CreateAccountPage onBack={() => setAuthPage("landing")} onSubmit={createAccount} />;
    }
    if (authPage === "login") {
      return <LoginPage onBack={() => setAuthPage("landing")} onSubmit={loginLocalAccount} />;
    }
    return <LandingPage onStart={() => setAuthPage("create")} onLogin={() => setAuthPage("login")} />;
  }

  if (!data.configured) {
    return (
      <WelcomePage
        setupValues={setupValues}
        setSetupValues={setSetupValues}
        userName={userName}
        setUserName={setUserName}
        onSubmit={submitSetup}
        onDemo={demoSetup}
      />
    );
  }

  return <Dashboard data={{ ...data, syncing }} setData={setDataAndSync} onReset={resetAll} onModifySetup={modifySetup} onLogout={logout} />;
}

function Styles() {
  return <style>{`
    :root{--bg:#f4f7fb;--card:#ffffff;--text:#071033;--muted:#64748b;--soft:#e5e7eb;--grid:#e2e8f0;--green:#10b981;--shadow:0 18px 55px rgba(15,23,42,.10);--radius:28px}
    *{box-sizing:border-box}html,body,#root{width:100%;min-width:100%;min-height:100%;margin:0;padding:0}body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;overflow-x:hidden}button,input,select,textarea{font:inherit}button{border:0;cursor:pointer}input,select,textarea{border:1px solid var(--soft);border-radius:15px;background:var(--card);color:var(--text);padding:13px 14px;outline:none;width:100%}input:focus,select:focus,textarea:focus{border-color:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.12)}
    .dark{--bg:#020617;--card:#0f172a;--text:#e5e7eb;--muted:#94a3b8;--soft:#243244;--grid:#1f2937;background:var(--bg);color:var(--text)}
    .landingPage{min-height:100vh;padding:28px;position:relative;overflow:hidden;background:linear-gradient(135deg,#f8fafc 0%,#eefcf5 38%,#eef7ff 72%,#f5f3ff 100%);color:#071033}.premiumLanding:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 14% 18%,rgba(16,185,129,.18),transparent 28%),radial-gradient(circle at 86% 12%,rgba(59,130,246,.18),transparent 30%),radial-gradient(circle at 60% 92%,rgba(168,85,247,.12),transparent 28%);pointer-events:none}.landingGlow{position:absolute;border-radius:999px;filter:blur(18px);opacity:.55}.glowOne{width:260px;height:260px;background:#86efac;left:-90px;top:120px}.glowTwo{width:310px;height:310px;background:#93c5fd;right:-120px;bottom:120px}.landingTopbar{position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:18px;max-width:1220px;margin:0 auto 46px}.landingLogo{display:flex;align-items:center;gap:12px;font-size:24px;font-weight:950}.landingLogo span{width:48px;height:48px;border-radius:16px;background:#dcfce7;display:flex;align-items:center;justify-content:center}.landingLoginBtn{border:0;border-radius:999px;background:rgba(255,255,255,.72);color:#0f172a;padding:13px 18px;font-weight:950;box-shadow:0 14px 34px rgba(15,23,42,.08);backdrop-filter:blur(14px)}.landingMain{position:relative;z-index:2;max-width:1220px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.05fr) minmax(380px,.8fr);gap:34px;align-items:center}.landingHeroNew{padding:34px 0}.landingBadge{display:inline-flex;align-items:center;gap:8px;width:max-content;border-radius:999px;background:#dcfce7;color:#047857;padding:10px 15px;font-weight:950;margin-bottom:18px}.landingHeroNew h1{margin:0 0 20px;font-size:clamp(48px,6vw,86px);line-height:.92;letter-spacing:-3.5px;color:#061333;max-width:820px}.landingHeroNew p{margin:0;color:#475569;font-size:20px;line-height:1.65;font-weight:700;max-width:780px}.landingActions{display:flex;gap:13px;flex-wrap:wrap;margin-top:26px}.landingPrimary,.landingSecondary{border:0;border-radius:18px;padding:16px 22px;font-weight:950;font-size:16px;transition:.18s ease}.landingPrimary{background:linear-gradient(135deg,#10b981,#22c55e);color:white;box-shadow:0 18px 36px rgba(16,185,129,.25)}.landingSecondary{background:white;color:#071033;box-shadow:0 14px 34px rgba(15,23,42,.08)}.landingPrimary:hover,.landingSecondary:hover{transform:translateY(-2px)}.landingTrustRow{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}.landingTrustRow span{border-radius:999px;background:rgba(255,255,255,.72);padding:10px 13px;color:#475569;font-size:13px;font-weight:900;box-shadow:0 10px 24px rgba(15,23,42,.06)}.landingPreviewCard{border-radius:34px;background:rgba(255,255,255,.82);border:1px solid rgba(255,255,255,.92);box-shadow:0 24px 60px rgba(15,23,42,.12);padding:24px;backdrop-filter:blur(18px);transform:rotate(1deg)}.previewHeader{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.previewHeader span{color:#64748b;font-weight:950;text-transform:uppercase;font-size:12px;letter-spacing:.08em}.previewHeader strong{font-size:34px;color:#071033}.previewLandscape{height:260px;border-radius:28px;position:relative;overflow:hidden;background:linear-gradient(180deg,#7dd3fc 0%,#fde68a 55%,#86efac 100%)}.sun{position:absolute;width:74px;height:74px;border-radius:999px;background:#fbbf24;right:38px;top:34px;box-shadow:0 0 50px rgba(251,191,36,.75)}.hill{position:absolute;bottom:-44px;border-radius:50% 50% 0 0}.h1{width:360px;height:150px;background:#22c55e;left:-70px}.h2{width:420px;height:190px;background:#16a34a;right:-110px}.castle{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);font-size:74px;filter:drop-shadow(0 16px 18px rgba(15,23,42,.25))}.rocket{position:absolute;right:34px;bottom:42px;font-size:42px;animation:floatRocket 3s ease-in-out infinite}@keyframes floatRocket{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}.previewStats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:16px}.previewStats div{border-radius:18px;background:#f8fafc;padding:14px;text-align:center}.previewStats b{display:block;color:#047857;font-size:18px}.previewStats span{display:block;color:#64748b;font-size:12px;font-weight:900;margin-top:4px}.landingFeatureGrid{position:relative;z-index:2;max-width:1220px;margin:38px auto 0;display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.landingFeatureGrid article{background:rgba(255,255,255,.78);border:1px solid rgba(255,255,255,.9);border-radius:28px;padding:24px;box-shadow:0 16px 38px rgba(15,23,42,.08);backdrop-filter:blur(14px)}.featureIcon{width:54px;height:54px;border-radius:18px;background:#ecfdf5;display:flex;align-items:center;justify-content:center;font-size:27px;margin-bottom:14px}.landingFeatureGrid h3{margin:0 0 8px;font-size:22px;color:#071033}.landingFeatureGrid p{margin:0;color:#64748b;font-weight:700;line-height:1.5}@media(max-width:980px){.landingMain,.landingFeatureGrid{grid-template-columns:1fr}.landingPreviewCard{transform:none}.landingTopbar{margin-bottom:20px}}@media(max-width:640px){.landingPage{padding:18px}.landingHeroNew h1{font-size:44px;letter-spacing:-2px}.landingHeroNew p{font-size:17px}.previewStats{grid-template-columns:1fr}.landingActions button{width:100%}}
.authPage{min-height:100vh;padding:24px;display:grid;place-items:center;background:radial-gradient(circle at 12% 10%,rgba(16,185,129,.22),transparent 28%),linear-gradient(135deg,#f8fafc,#eef7ff 50%,#ecfdf5)}.authCard{width:min(520px,100%);padding:34px;display:grid;gap:14px}.authCard h1{font-size:42px;line-height:1;margin:0;color:#071033}.authCard p{margin:0 0 8px;color:#64748b;font-weight:700;line-height:1.45}.authCard label{display:grid;gap:7px}.authCard label span{font-weight:900;color:#071033}.backBtn{width:max-content;border-radius:999px;background:#f1f5f9;color:#0f172a;padding:10px 14px;font-weight:900}.authError{border-radius:14px;background:#fee2e2;color:#991b1b;padding:12px 14px;font-weight:900}.welcomePage{min-height:100vh;padding:34px;display:grid;place-items:center;background:radial-gradient(circle at 10% 10%,rgba(16,185,129,.20),transparent 28%),radial-gradient(circle at 90% 0%,rgba(99,102,241,.18),transparent 30%),linear-gradient(135deg,#f8fafc,#eef7ff 50%,#ecfdf5)}.welcomeShell{width:min(1300px,100%);display:grid;grid-template-columns:1fr 1.05fr;gap:28px}.welcomeHeroCard,.setupCard{background:rgba(255,255,255,.88);border:1px solid rgba(255,255,255,.95);border-radius:34px;box-shadow:var(--shadow);backdrop-filter:blur(18px)}.welcomeHeroCard{padding:34px;display:flex;flex-direction:column;gap:26px}.brand{display:flex;align-items:center;gap:13px;font-size:28px;font-weight:950}.brand span{width:48px;height:48px;border-radius:16px;display:grid;place-items:center;background:#dcfce7}.bigBrand{margin-bottom:22px}.welcomeHeroCard h1{font-size:clamp(42px,5vw,68px);line-height:.97;letter-spacing:-2.4px;margin:0}.welcomeHeroCard p{font-size:19px;line-height:1.6;color:#475569;font-weight:650;max-width:660px}.welcomePreview{height:310px;border-radius:28px}.welcomeLevelChip{position:absolute;left:20px;bottom:20px;z-index:5;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.35);backdrop-filter:blur(12px);color:white;border-radius:999px;padding:12px 16px;font-weight:950}.setupCard{padding:30px}.setupHeader{display:flex;justify-content:space-between;gap:20px;margin-bottom:22px}.setupHeader h2{font-size:34px;margin:5px 0 6px;letter-spacing:-1px}.setupHeader p{color:#64748b;font-weight:650}.setupTotal{text-align:right;background:#ecfdf5;color:#047857;border-radius:22px;padding:16px;min-width:190px}.setupTotal span{display:block;font-size:13px;font-weight:850}.setupTotal strong{font-size:26px}.setupGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.field{display:grid;gap:8px}.field span{font-weight:900;color:var(--text)}.field small{color:var(--muted);font-weight:750}.wideField{margin-bottom:14px}.setupLevel{margin-top:18px;border-radius:22px;padding:17px;background:linear-gradient(135deg,#0f172a,#1d4ed8);color:white;display:flex;justify-content:space-between;gap:18px}.setupLevel span{display:block;color:#bfdbfe;margin-top:4px}.setupLevel em{font-style:normal;color:#dcfce7;font-weight:850;text-align:right}.setupActions{margin-top:20px;display:flex;gap:12px;flex-wrap:wrap}.primaryBtn,.secondaryBtn,.dangerBtn,.iconBtn,.smallBtn,.withdrawBtn{border-radius:16px;padding:13px 16px;font-weight:950;transition:.18s ease}.primaryBtn{background:#10b981;color:white;box-shadow:0 12px 28px rgba(16,185,129,.22)}.secondaryBtn,.smallBtn{background:color-mix(in srgb,var(--soft) 46%,transparent);color:var(--text)}.withdrawBtn{background:#fee2e2;color:#991b1b;box-shadow:0 12px 28px rgba(220,38,38,.12)}.withdrawBtn:hover{background:#fecaca}.moneyActions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.topActions .moneyActions{display:flex}.sideLevel .moneyActions{margin-top:14px}.sideLevel .moneyActions button{margin-top:0}.withdrawInfo{margin-bottom:14px;border-radius:18px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px}.withdrawInfo span{font-size:12px;text-transform:uppercase;letter-spacing:.4px;font-weight:950}.withdrawInfo strong{font-size:22px;color:#9a3412}.dangerBtn{background:#fee2e2;color:#991b1b}.compact{padding:10px 13px}.full{width:100%;margin-top:18px}.primaryBtn:hover,.secondaryBtn:hover,.dangerBtn:hover,.smallBtn:hover,.iconBtn:hover,.withdrawBtn:hover{transform:translateY(-1px);filter:brightness(1.02)}
    .app{display:grid;grid-template-columns:285px minmax(0,1fr);min-height:100vh;width:100%;max-width:none;margin:0;background:var(--bg)}.sidebar{position:sticky;top:0;height:100vh;overflow:auto;background:color-mix(in srgb,var(--card) 92%,transparent);border-right:1px solid color-mix(in srgb,var(--soft) 70%,transparent);padding:24px}.nav{display:grid;gap:8px;margin:36px 0}.nav button{text-align:left;border-radius:16px;background:transparent;color:var(--muted);padding:13px 14px;font-weight:850}.nav button.active,.nav button:hover{background:#ecfdf5;color:#047857}.sideLevel{min-height:280px;border-radius:28px;display:flex;align-items:end;padding:20px;color:white}.sideLevel h3{font-size:26px;line-height:1.05;margin:8px 0 4px}.sideLevel p{color:rgba(255,255,255,.82);font-weight:750}.sideLevel button{margin-top:14px;background:#10b981;color:white;border-radius:14px;padding:11px 13px;font-weight:950}.main{min-width:0;width:100%;max-width:none;padding:28px 34px 44px}.topbar{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:24px}.topbar h1{font-size:clamp(32px,4vw,52px);letter-spacing:-1.8px;line-height:1;margin:0 0 10px;color:#071033!important;text-shadow:none!important}.dark .topbar h1{color:#e5e7eb!important}.topbar p{color:#475569!important;font-size:17px;font-weight:650}.dark .topbar p{color:#94a3b8!important}.topActions{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end}.iconBtn{width:46px;height:46px;display:inline-flex;align-items:center;justify-content:center;padding:0;background:var(--card);color:var(--text);box-shadow:var(--shadow);line-height:1;flex-shrink:0}.themeToggle{border-radius:16px;overflow:hidden}.themeToggleEmoji{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:21px;line-height:1;transform:translateY(-1px);user-select:none;pointer-events:none}.dark .themeToggle{background:rgba(15,23,42,.82);color:#f8fafc;box-shadow:0 12px 28px rgba(0,0,0,.28)}
    .heroStatsGrid{display:grid;grid-template-columns:minmax(320px,1fr) minmax(320px,1fr) minmax(420px,1fr);gap:18px;margin-bottom:22px;align-items:stretch}.statCard{background:var(--card);border:1px solid color-mix(in srgb,var(--soft) 75%,transparent);border-radius:26px;padding:22px;box-shadow:var(--shadow);min-height:auto}.heroStatsGrid>.statCard{height:330px;min-height:330px}.primaryStat,.variationCard{display:flex;flex-direction:column;justify-content:center}.variationCard{justify-content:center}.variationCard .snapshotSummary{margin-top:16px}.primaryStat{align-items:center;text-align:center}.primaryStat strong{font-size:clamp(36px,4vw,56px)}.primaryStat{background:linear-gradient(180deg,var(--card),color-mix(in srgb,#ecfdf5 50%,var(--card)))}.eyebrow{display:block;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);font-size:12px;font-weight:950}.statCard strong{display:block;font-size:clamp(28px,4vw,46px);letter-spacing:-1.4px;line-height:1.05;margin:10px 0;color:#071033!important}.dark .statCard strong{color:#e5e7eb!important}.statCard p{color:#475569!important;font-weight:750}.dark .statCard p{color:#94a3b8!important}.statCard small{display:block;margin-top:6px;color:#059669;font-weight:850}.gain{color:#059669}.loss{color:#dc2626}.neutral{color:#64748b}.statCard strong.gain{color:#059669!important}.statCard strong.loss{color:#dc2626!important}.statCard strong.neutral{color:#64748b!important}.variationCard{position:relative;overflow:visible}.variationCard strong{font-size:clamp(32px,3.6vw,52px)!important}.variationCard>p{max-width:280px}.snapshotSummary{align-items:center}.snapshotActions button{min-height:40px}.snapshotMenu{top:calc(100% + 10px)}.variationCard>p{font-weight:850!important}.variationCard strong.gain + p{color:#059669!important}.variationCard strong.loss + p{color:#dc2626!important}.variationCard strong.neutral + p{color:#64748b!important}.snapshotSummary{margin-top:14px;padding-top:14px;border-top:1px solid var(--soft);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.snapshotSummary span{display:block;color:var(--muted);font-size:12px;font-weight:950;text-transform:uppercase;letter-spacing:.4px}.snapshotSummary b{display:block;margin-top:4px;color:var(--text);font-size:14px}.snapshotCompareDate{display:block!important;margin-top:3px!important;color:var(--muted)!important;font-size:11px!important;font-weight:800!important}.snapshotActions{display:flex;gap:8px;flex-wrap:wrap}.snapshotActions button,.snapshotItemActions button{border-radius:12px;background:color-mix(in srgb,var(--soft) 55%,transparent);color:var(--text);padding:9px 11px;font-weight:950;font-size:12px}.snapshotActions button:first-child{background:#ecfdf5;color:#047857}.snapshotMenu{position:absolute;left:18px;right:18px;top:calc(100% - 8px);z-index:40;background:var(--card);border:1px solid var(--soft);border-radius:18px;box-shadow:0 22px 50px rgba(15,23,42,.18);padding:12px;display:grid;gap:10px;max-height:360px;overflow:auto}.snapshotMenu p{margin:0;color:var(--muted);font-weight:800}.snapshotItem{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border-radius:15px;background:color-mix(in srgb,var(--soft) 35%,transparent);padding:12px}.snapshotItem:hover{background:color-mix(in srgb,var(--soft) 55%,transparent)}.snapshotItemMain strong{display:block!important;margin:0 0 3px!important;font-size:14px!important;letter-spacing:0!important;color:var(--text)!important}.snapshotItemMain span{display:block;color:var(--muted);font-size:12px;font-weight:800}.snapshotItemMain em{display:block;margin-top:4px;color:#059669;font-style:normal;font-weight:950}.snapshotItemActions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.snapshotItemActions button:hover{transform:translateY(-1px)}.snapshotItemActions .dangerMini{background:#fee2e2;color:#991b1b}.miniLine{height:170px}.snapshotCurveCard{height:330px;min-height:330px;display:flex;flex-direction:column;gap:12px;overflow:visible}.snapshotCurveCard.emptyState{height:330px;min-height:330px}.snapshotCurveHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap}.snapshotCurveHeader strong{display:block;margin-top:5px;color:var(--text);font-size:20px;line-height:1.1;font-weight:950}.snapshotCurveDelta{text-align:right}.snapshotCurveDelta b{display:block;font-size:22px;line-height:1;font-weight:950}.snapshotCurveDelta small{display:block;margin-top:5px;color:var(--muted);font-size:12px;font-weight:850}.snapshotCurveMetrics{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:0}.snapshotCurveMetrics div{border-radius:16px;background:color-mix(in srgb,var(--soft) 34%,transparent);border:1px solid color-mix(in srgb,var(--soft) 55%,transparent);padding:10px}.snapshotCurveMetrics span{display:block;color:var(--muted);font-size:11px;font-weight:950;text-transform:uppercase;letter-spacing:.35px}.snapshotCurveMetrics strong{display:block;margin-top:4px;font-size:20px;line-height:1;font-weight:950}.snapshotCurveMetrics small{display:block;margin-top:5px;color:var(--muted);font-size:11px;font-weight:850}.snapshotCurveChart{position:relative;min-height:118px;flex:1;display:flex;flex-direction:column;justify-content:flex-end;padding-top:4px}.snapshotCurveChart svg{width:100%;height:112px;display:block;overflow:visible}.snapshotCurveChart:has(.snapshotTooltip){z-index:15}.snapshotCurveLine{filter:drop-shadow(0 7px 10px rgba(16,185,129,.16))}.snapshotCurvePoint{fill:#10b981;stroke:var(--card);stroke-width:4}.snapshotCurvePoint.live{fill:#0f766e}.snapshotHoverTarget{fill:transparent;stroke:transparent;cursor:pointer}.snapshotTooltip{position:absolute;z-index:30;width:205px;background:rgba(255,255,255,.98);color:#071033;border:1px solid rgba(16,185,129,.18);border-radius:16px;padding:10px 12px;box-shadow:0 18px 45px rgba(15,23,42,.20),0 0 0 1px rgba(255,255,255,.70) inset;pointer-events:none}.snapshotTooltip.toRight{transform:translate(14px,-50%)}.snapshotTooltip.toLeft{transform:translate(calc(-100% - 14px),-50%)}.snapshotTooltip:after{content:"";position:absolute;top:50%;width:12px;height:12px;background:rgba(255,255,255,.98);border-right:1px solid rgba(16,185,129,.18);border-bottom:1px solid rgba(16,185,129,.18)}.snapshotTooltip.toRight:after{left:-7px;transform:translateY(-50%) rotate(135deg)}.snapshotTooltip.toLeft:after{right:-7px;transform:translateY(-50%) rotate(-45deg)}.snapshotTooltip span{display:block;color:#64748b;font-size:12px;font-weight:900;margin-bottom:5px}.snapshotTooltip strong{display:block;color:#071033;font-size:18px;line-height:1.1;font-weight:950;margin-bottom:6px}.snapshotTooltip em{display:block;font-style:normal;font-size:12px;font-weight:950;line-height:1.25}.snapshotTooltip em.gain{color:#059669!important}.snapshotTooltip em.loss{color:#dc2626!important}.snapshotTooltip em.neutral{color:#64748b!important}.dark .snapshotTooltip{background:rgba(15,23,42,.96);color:white;border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 45px rgba(0,0,0,.35)}.dark .snapshotTooltip:after{background:rgba(15,23,42,.96);border-right:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12)}.dark .snapshotTooltip span{color:#cbd5e1}.dark .snapshotTooltip strong{color:white}.dark .snapshotTooltip em.gain{color:#34d399!important}.dark .snapshotTooltip em.loss{color:#f87171!important}.dark .snapshotTooltip em.neutral{color:#cbd5e1!important}.snapshotCurveLabels{display:grid;grid-template-columns:repeat(auto-fit,minmax(42px,1fr));gap:6px;margin-top:4px}.snapshotCurveLabels span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:center;color:var(--muted);font-size:11px;font-weight:850}.snapshotCurveLabels span.current{color:#059669}.snapshotEmpty{flex:1;border-radius:20px;background:color-mix(in srgb,var(--soft) 35%,transparent);border:1px dashed color-mix(in srgb,var(--soft) 75%,transparent);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px 18px;min-height:110px;overflow:hidden}.snapshotEmpty strong{display:block;color:var(--text);font-size:16px;line-height:1.2;font-weight:900;margin-bottom:6px}.snapshotEmpty span{display:block;color:var(--muted);font-size:13px;line-height:1.35;max-width:100%;white-space:normal;overflow-wrap:anywhere}.chartSvg{width:100%;height:100%;overflow:visible}.chartWrap{height:300px}.miniChartBox{height:120px;margin-top:12px}
    .livingScene{margin-bottom:24px}.sceneFrame{position:relative;overflow:hidden;background-size:cover;background-position:center;isolation:isolate}.sceneFrame:before{content:"";position:absolute;inset:-6%;background-image:inherit;background-size:cover;background-position:center;z-index:-4;transform:scale(1.08);animation:slowPan 28s ease-in-out infinite alternate}.livingLayer{position:absolute;inset:0;background:radial-gradient(circle at 20% 18%,rgba(255,255,255,.18),transparent 19%),radial-gradient(circle at 68% 14%,rgba(255,255,255,.13),transparent 22%),linear-gradient(115deg,transparent 0 38%,rgba(255,255,255,.08) 50%,transparent 62%);z-index:-3;animation:cloudDrift 22s linear infinite alternate}.animatedMist{position:absolute;left:-20%;right:-20%;bottom:-10%;height:42%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.16),transparent);filter:blur(18px);z-index:-2;animation:mistMove 18s linear infinite alternate}.lightSweep{position:absolute;inset:0;background:linear-gradient(105deg,transparent 0 35%,rgba(255,255,255,.18) 45%,transparent 58%);mix-blend-mode:screen;z-index:-2;animation:lightSweep 12s ease-in-out infinite}.sceneShade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,6,23,.04),rgba(2,6,23,.12) 40%,rgba(2,6,23,.76));z-index:-1}.sceneShade.small{background:linear-gradient(180deg,rgba(2,6,23,.02),rgba(2,6,23,.72))}.mainScene{height:clamp(520px,48vw,720px);border-radius:32px;box-shadow:var(--shadow);border:1px solid rgba(255,255,255,.5)}.glassCard{position:absolute;z-index:4;background:rgba(255,255,255,.94);border:1px solid rgba(255,255,255,.92);backdrop-filter:blur(16px);box-shadow:0 18px 45px rgba(2,6,23,.18);border-radius:24px;color:#0f172a!important}.sceneInfoCard{left:24px;top:24px;width:min(420px,calc(100% - 48px));padding:20px}.sceneInfoCard h2{margin:7px 0 10px;font-size:34px;letter-spacing:-1px;color:#0f172a!important;text-shadow:none!important}.sceneInfoCard .eyebrow{color:#64748b!important}.sceneInfoCard p{color:#334155!important;text-shadow:none!important}.sceneInfoCard p{color:#334155!important;line-height:1.55;font-weight:750}.sceneProgressCard{right:24px;top:24px;width:min(410px,calc(100% - 48px));padding:18px}.sceneProgressTop{display:flex;justify-content:space-between;gap:16px}.sceneProgressTop h3{font-size:44px;line-height:1;margin:5px 0;color:#0f172a!important;text-shadow:none!important}.sceneProgressCard .eyebrow{color:#64748b!important}.levelOrb{width:76px;height:76px;border-radius:999px;display:grid;place-items:center;position:relative;flex-shrink:0}.levelOrb:after{content:"";position:absolute;inset:8px;border-radius:999px;background:white}.levelOrb span{position:relative;z-index:2;font-size:28px}.bigBar{height:13px;background:#e5e7eb;border-radius:999px;overflow:hidden;margin:14px 0 10px}.bigBar div{height:100%;border-radius:inherit}.sceneMeta{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;color:#64748b!important;font-weight:850}.sceneMeta span{color:#64748b!important}.sceneMeta strong{color:#047857}.timelineOverlay{position:absolute;left:0;right:0;bottom:0;height:150px;z-index:5;background:linear-gradient(0deg,rgba(2,6,23,.74),transparent)}.timelineLine{position:absolute;left:5%;right:5%;bottom:68px;height:8px;border-radius:999px;background:rgba(255,255,255,.65);overflow:hidden}.timelineLine div{height:100%;border-radius:inherit;background:linear-gradient(90deg,#fb923c,#10b981,#8b5cf6,#f97316,#06b6d4,#6366f1)}.levelMarker{position:absolute;bottom:14px;width:128px;text-align:center;color:white;transform:translateX(-50%);opacity:.82}.markerIcon{width:48px;height:48px;border-radius:999px;margin:0 auto 7px;display:grid;place-items:center;background:rgba(255,255,255,.22);border:3px solid rgba(255,255,255,.88);backdrop-filter:blur(10px);box-shadow:0 10px 20px rgba(0,0,0,.18)}.levelMarker strong{display:block;font-size:11px;text-transform:uppercase;line-height:1.1}.levelMarker small{display:block;color:rgba(255,255,255,.84);font-weight:750;margin-top:3px}.levelMarker.active{opacity:1;transform:translateX(-50%) translateY(-10px)}.levelMarker.active .markerIcon{width:62px;height:62px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);color:#064e3b;border:4px solid white;box-shadow:0 0 0 7px rgba(16,185,129,.20),0 18px 28px rgba(16,185,129,.25)}.currentBadge{display:inline-flex;margin-bottom:8px;border-radius:999px;background:#10b981;padding:6px 10px;font-size:11px;font-weight:950;box-shadow:0 8px 18px rgba(16,185,129,.35)}
    .accountsGrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-bottom:24px}.accountCard{background:var(--card);border:1px solid color-mix(in srgb,var(--soft) 75%,transparent);border-radius:26px;box-shadow:var(--shadow);padding:20px;display:grid;gap:16px;overflow:hidden;min-height:275px}.accountHeader{display:grid;grid-template-columns:minmax(0,1fr) 68px;align-items:start;gap:12px}.accountIdentity{display:flex;gap:13px;min-width:0;align-items:flex-start}.accountIcon{width:54px;height:54px;border-radius:17px;display:flex;align-items:center;justify-content:center;color:white;font-size:23px;line-height:1;box-shadow:0 12px 24px rgba(15,23,42,.14);flex-shrink:0;overflow:hidden}.accountIcon span{display:flex;align-items:center;justify-content:center;width:100%;height:100%;line-height:1;transform:translateY(-1px)}.accountIdentity h3{margin:0 0 5px;font-size:22px;line-height:1.08}.accountIdentity p{margin:0;color:var(--muted);font-weight:750;line-height:1.35}.accountRing{width:66px;height:66px;border-radius:999px;position:relative;display:grid;place-items:center;flex-shrink:0;justify-self:end}.accountRing:after{content:"";position:absolute;inset:7px;border-radius:inherit;background:var(--card)}.accountRing span{position:relative;z-index:2;font-weight:950;font-size:14px}.accountAmount{font-size:30px;font-weight:950;letter-spacing:-.8px;overflow-wrap:anywhere}.accountProgress{height:10px;border-radius:999px;background:var(--soft);overflow:hidden;max-width:100%}.accountProgress div{height:100%;border-radius:inherit;max-width:100%}.accountFooter{display:flex;justify-content:space-between;gap:10px;flex-wrap:nowrap;color:var(--muted);font-weight:850}.accountFooter strong{color:var(--muted);white-space:nowrap;text-align:right}.smallBtn{justify-self:start;padding:10px 14px}.addPlacementCard{background:linear-gradient(180deg,var(--card),color-mix(in srgb,var(--soft) 25%,var(--card)));border:2px dashed color-mix(in srgb,var(--soft) 88%,transparent);border-radius:26px;box-shadow:var(--shadow);padding:20px;min-height:275px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:14px}.addPlacementButton{border:0;border-radius:18px;background:#ecfdf5;color:#047857;padding:15px 18px;font-weight:950;display:flex;align-items:center;justify-content:center;gap:10px;width:100%;transition:.18s ease}.addPlacementButton:hover{transform:translateY(-1px);background:#dff8ec}.addPlacementIcon{font-size:24px;line-height:1}.addPlacementCard p{margin:0;color:var(--muted);font-weight:750;line-height:1.45;font-size:14px}.hiddenPlacementPreview{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}.hiddenPlacementPreview span{border-radius:999px;background:color-mix(in srgb,var(--soft) 45%,transparent);color:var(--muted);font-size:12px;font-weight:850;padding:7px 10px}.emptyAddPlacement{border-radius:18px;background:color-mix(in srgb,var(--soft) 35%,transparent);padding:18px;display:grid;gap:6px;text-align:center}.emptyAddPlacement strong{color:var(--text)}.emptyAddPlacement span{color:var(--muted);font-weight:750}
    .dashboardGrid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:20px;width:100%}.patrimoineInsightsGrid{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(360px,.9fr);gap:20px;align-items:stretch}.adaptiveHistoryPanel,.structurePanel{min-height:520px;display:flex;flex-direction:column;overflow:hidden}.insightHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:18px}.insightHeader.simple{display:block}.insightHeader h2{margin:4px 0 6px;font-size:28px;letter-spacing:-.8px}.insightHeader p{margin:0;color:var(--muted);font-weight:750;line-height:1.45}.historyControls{display:grid;gap:10px;justify-items:end}.periodSwitch{display:inline-flex;gap:7px;padding:6px;border-radius:15px;background:color-mix(in srgb,var(--soft) 38%,transparent);border:1px solid color-mix(in srgb,var(--soft) 65%,transparent)}.periodSwitch button{border-radius:11px;background:transparent;color:var(--muted);padding:9px 12px;font-weight:950}.periodSwitch button.active{background:#10b981;color:white;box-shadow:0 10px 22px rgba(16,185,129,.20)}.evolutionBadge{border-radius:17px;padding:11px 14px;text-align:right;min-width:190px}.evolutionBadge strong{display:block;font-size:18px;line-height:1;font-weight:950}.evolutionBadge span{display:block;margin-top:5px;font-size:12px;font-weight:850}.evolutionBadge.positive{background:#ecfdf5;color:#047857}.evolutionBadge.negative{background:#fef2f2;color:#dc2626}.evolutionBadge.neutral{background:color-mix(in srgb,var(--soft) 38%,transparent);color:var(--muted)}.evolutionChartBox{position:relative;flex:1;min-height:310px;overflow:visible}.evolutionChartSvg{width:100%;height:100%;min-height:300px;display:block}.chartGridLine{stroke:var(--grid);stroke-dasharray:5 8}.adaptiveChartArea{fill:url(#adaptiveChartGradient)}.adaptiveChartLine{fill:none;stroke:#10b981;stroke-width:4;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 8px 10px rgba(16,185,129,.16))}.adaptiveChartPoint{fill:#10b981;stroke:var(--card);stroke-width:3;cursor:pointer}.adaptiveChartLabel{fill:var(--muted);font-size:12px;font-weight:900}.adaptiveChartLabel.active{fill:#059669}.adaptiveTooltip{position:absolute;z-index:20;width:245px;transform:translate(-50%,-115%);background:var(--card);border:1px solid color-mix(in srgb,var(--soft) 75%,transparent);border-radius:17px;padding:12px 14px;box-shadow:0 22px 48px rgba(15,23,42,.18);pointer-events:none}.adaptiveTooltip:after{content:"";position:absolute;left:50%;bottom:-7px;width:14px;height:14px;transform:translateX(-50%) rotate(45deg);background:var(--card);border-right:1px solid color-mix(in srgb,var(--soft) 75%,transparent);border-bottom:1px solid color-mix(in srgb,var(--soft) 75%,transparent)}.adaptiveTooltip span{display:block;color:var(--muted);font-size:12px;font-weight:900;margin-bottom:5px}.adaptiveTooltip strong{display:block!important;font-size:22px!important;line-height:1.05!important;margin:0 0 7px!important;color:var(--text)!important}.adaptiveTooltip em{display:block;font-style:normal;font-size:13px;font-weight:950;line-height:1.28}.adaptiveTooltip em.positive{color:#059669}.adaptiveTooltip em.negative{color:#dc2626}.adaptiveTooltip em.neutral{color:var(--muted)}.emptyInsightState{width:100%;min-height:180px;border-radius:22px;background:color-mix(in srgb,var(--soft) 35%,transparent);border:1px dashed color-mix(in srgb,var(--soft) 75%,transparent);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:22px;box-sizing:border-box}.emptyInsightState.compact{min-height:140px;padding:18px}.emptyInsightState strong{font-size:21px;line-height:1.2;color:var(--text);margin-bottom:8px}.emptyInsightState span{color:var(--muted);font-weight:750;line-height:1.45;max-width:420px}.structureLayout{display:grid;grid-template-columns:250px minmax(0,1fr);gap:20px;align-items:center;flex:1}.structureDonutWrap{position:relative;width:230px;height:230px;margin:auto}.structureDonut{width:230px;height:230px;display:block}.structureDonutCenter{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none}.structureDonutCenter span{font-size:12px;font-weight:950;color:var(--muted);text-transform:uppercase;letter-spacing:.08em}.structureDonutCenter strong{font-size:22px;line-height:1.1;margin:6px 0;color:var(--text);font-weight:950}.structureDonutCenter small{color:var(--muted);font-weight:850}.structureLegend{display:grid;gap:11px;max-height:410px;overflow:auto;padding-right:4px}.structureLegendItem{border-radius:16px;background:color-mix(in srgb,var(--soft) 32%,transparent);border:1px solid color-mix(in srgb,var(--soft) 62%,transparent);padding:12px}.structureLegendTop{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:9px}.structureLegendName{display:flex;align-items:center;gap:9px;min-width:0}.structureLegendName strong{font-size:15px;line-height:1.15;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.structureLegendTop>span{font-weight:950;color:var(--text);white-space:nowrap}.structureLegendDot{width:10px;height:10px;border-radius:999px;flex-shrink:0}.structureLegendBar{height:9px;border-radius:999px;background:var(--soft);overflow:hidden}.structureLegendBar div{height:100%;border-radius:inherit}.structureLegendItem small{display:block;margin-top:7px;color:var(--muted);font-weight:850}.panel{background:var(--card);border:1px solid color-mix(in srgb,var(--soft) 75%,transparent);border-radius:26px;box-shadow:var(--shadow);padding:22px}.chartPanel{grid-column:span 7}.dashboardGrid>.panel:nth-child(2){grid-column:span 5}.projectionPanel{grid-column:span 4}.goalsPanel{grid-column:span 4}.transactionsPanel{grid-column:span 4}.panelHeader{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:18px}.panelHeader h2{margin:4px 0 0;font-size:24px;letter-spacing:-.5px}.panelHeader p{color:var(--muted);max-width:520px}.pill{display:inline-flex;border-radius:999px;background:#ecfdf5;color:#047857;padding:9px 12px;font-weight:900;font-size:13px}.allocationList,.goalsList,.transactionsList{display:grid;gap:12px}.allocationItem{display:grid;gap:8px}.allocationItem>div:first-child{display:flex;justify-content:space-between;gap:12px;font-weight:850}.allocationBar,.goalBar{height:10px;border-radius:999px;background:var(--soft);overflow:hidden}.allocationBar div,.goalBar div{height:100%;border-radius:inherit}.allocationItem small{color:var(--muted);font-weight:750}.projectionGrid{display:grid;gap:10px}.projectionGrid label,.modalGrid label{display:grid;gap:7px}.projectionGrid span,.modalGrid span{font-weight:850;color:var(--muted);font-size:13px}.projectionResult{margin-top:16px;border-radius:20px;background:#ecfdf5;color:#065f46;padding:16px}.projectionResult span{display:block;font-weight:900}.projectionResult strong{display:block;font-size:32px;letter-spacing:-1px}.goalItem{position:relative;border-radius:18px;background:color-mix(in srgb,var(--soft) 42%,transparent);padding:16px;display:grid;gap:8px}.goalItem button{position:absolute;right:12px;top:12px;width:28px;height:28px;border-radius:999px;background:var(--card);color:var(--text);font-weight:950}.goalItem span{color:var(--muted);font-weight:750}.goalItem em{font-style:normal;color:#059669;font-weight:950}.transactionItem{display:flex;justify-content:space-between;gap:12px;align-items:center;border-radius:18px;background:color-mix(in srgb,var(--soft) 42%,transparent);padding:14px}.transactionItem strong{display:block}.transactionItem span{display:block;color:var(--muted);font-size:13px;margin-top:3px}.transactionItem em{font-style:normal;color:#059669;font-weight:950}.transactionItem em.gain{color:#059669!important}.transactionItem em.loss{color:#dc2626!important}.transactionItem em.neutral{color:#64748b!important}.emptyState{color:var(--muted)}
    .levelGalleryPanel{margin-top:24px}.levelGallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}.levelCard{border:1px solid color-mix(in srgb,var(--soft) 75%,transparent);border-radius:24px;overflow:hidden;background:var(--card);box-shadow:0 10px 28px rgba(15,23,42,.06)}.levelCard.selected{border-color:#10b981;box-shadow:0 18px 38px rgba(16,185,129,.18);transform:translateY(-2px)}.levelImage{height:180px}.levelImage span{position:absolute;left:14px;top:14px;z-index:4;border-radius:999px;padding:9px 12px;background:rgba(255,255,255,.16);backdrop-filter:blur(10px);color:white;font-weight:950}.levelBody{padding:15px}.levelBody strong{font-size:18px}.levelBody p{margin:5px 0 0;color:var(--muted);font-weight:750}.dangerZone{margin-top:24px;background:var(--card);border:1px solid color-mix(in srgb,#fecaca 75%,transparent);border-radius:26px;padding:22px;display:flex;justify-content:space-between;gap:16px;align-items:center}.dangerZone h2{margin:0 0 6px}.dangerZone p{color:var(--muted)}
    .modalBackdrop{position:fixed;inset:0;z-index:60;background:rgba(2,6,23,.62);display:grid;place-items:center;padding:20px}.modal{width:min(580px,100%);background:var(--card);color:var(--text);border-radius:28px;box-shadow:0 35px 90px rgba(0,0,0,.35);padding:28px;position:relative}.modal h2{margin:0 0 20px;font-size:28px}.modalClose{position:absolute;right:16px;top:14px;border-radius:999px;width:38px;height:38px;background:var(--soft);color:var(--text);font-size:24px}.modalGrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.modalGrid .wide{grid-column:1/-1}.importBox{min-height:220px;resize:vertical}.toast{position:fixed;right:24px;bottom:24px;z-index:90;background:#064e3b;color:white;padding:14px 18px;border-radius:16px;font-weight:950;animation:toast 3s both}@keyframes toast{0%{opacity:0;transform:translateY(20px)}15%,80%{opacity:1;transform:none}100%{opacity:0;transform:translateY(20px)}}
    @keyframes slowPan{0%{transform:scale(1.08) translate3d(-1.2%,0,0)}50%{transform:scale(1.12) translate3d(1%,-.8%,0)}100%{transform:scale(1.09) translate3d(-.8%,1%,0)}}@keyframes cloudDrift{0%{transform:translateX(-2%);opacity:.75}100%{transform:translateX(2%);opacity:1}}@keyframes mistMove{0%{transform:translateX(-5%);opacity:.35}100%{transform:translateX(5%);opacity:.65}}@keyframes lightSweep{0%,100%{opacity:.18;transform:translateX(-8%)}50%{opacity:.42;transform:translateX(8%)}}
    .sidebar{width:285px;min-width:285px;padding:24px 22px;display:flex;flex-direction:column;gap:22px;background:var(--side);border-right:1px solid var(--soft);overflow:hidden}.brand{display:flex;align-items:center;gap:13px;margin-bottom:8px}.brandIcon{width:50px;height:50px;border-radius:17px;display:flex;align-items:center;justify-content:center;font-size:24px;line-height:1;background:#dcfce7;flex-shrink:0}.brand h1{margin:0;font-size:30px;letter-spacing:-1px;line-height:1;color:var(--text)}.sideNav{display:grid;gap:12px;width:100%;margin-top:8px;margin-bottom:20px}.navItem{width:100%;border:0;border-radius:18px;padding:15px 17px;background:transparent;color:var(--muted);display:flex;align-items:center;gap:13px;text-align:left;font-weight:950;font-size:16px;line-height:1.1;box-shadow:none!important;transition:.18s ease}.navItem span{width:22px;height:22px;display:flex;align-items:center;justify-content:center;line-height:1;flex-shrink:0}.navItem strong{font-size:16px;line-height:1.1;white-space:nowrap}.navItem.active{background:linear-gradient(135deg,#dcfce7,#ecfdf5);color:#047857;box-shadow:0 12px 26px rgba(16,185,129,.12)!important}.navItem:hover{background:color-mix(in srgb,var(--soft) 45%,transparent);transform:none}.sideLevel{margin-top:18px;border-radius:28px;overflow:hidden;min-height:285px;padding:22px;display:flex;flex-direction:column;justify-content:flex-end;gap:12px;position:relative;background-size:cover;background-position:center;box-shadow:0 18px 42px rgba(15,23,42,.16)}.sideLevel:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,6,23,.08),rgba(2,6,23,.38) 42%,rgba(2,6,23,.78));z-index:0}.sideLevel>*{position:relative;z-index:1}.sideLevel h3,.sideLevel p{color:white;text-shadow:0 2px 10px rgba(0,0,0,.28)}.sideLevel h3{font-size:24px;line-height:1.05;margin:0;letter-spacing:-.4px}.sideLevel p{margin:0;font-size:14px;font-weight:800;line-height:1.35}.sideLevel .moneyActions{display:grid;gap:10px;margin-top:10px}.sideLevel .primaryBtn{width:100%;justify-content:center;text-align:center;border-radius:18px;padding:15px 16px}.dark .navItem.active{background:rgba(16,185,129,.18);color:#86efac}.dark .sideLevel{box-shadow:0 18px 42px rgba(0,0,0,.36)}
/* LANDING FINAL — page d'accueil fraîche et cohérente avec le dashboard */
.landingPage.premiumLanding{min-height:100vh!important;padding:28px!important;position:relative!important;overflow:hidden!important;background:linear-gradient(135deg,#f8fafc 0%,#ecfdf5 36%,#eff6ff 70%,#faf5ff 100%)!important;color:#071033!important}.landingPage.premiumLanding:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 12% 18%,rgba(16,185,129,.22),transparent 30%),radial-gradient(circle at 86% 10%,rgba(59,130,246,.20),transparent 30%),radial-gradient(circle at 62% 96%,rgba(168,85,247,.13),transparent 32%)!important;pointer-events:none}.landingPage .landingGlow{position:absolute;border-radius:999px;filter:blur(28px);opacity:.7}.landingPage .glowOne{width:300px;height:300px;background:#86efac;left:-110px;top:120px}.landingPage .glowTwo{width:340px;height:340px;background:#93c5fd;right:-130px;bottom:120px}.landingTopbar{position:relative!important;z-index:2!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:18px!important;max-width:1240px!important;margin:0 auto 34px!important}.landingLogo{display:flex!important;align-items:center!important;gap:12px!important;font-size:25px!important;font-weight:950!important;color:#071033!important}.landingLogo span{width:50px!important;height:50px!important;border-radius:17px!important;background:#dcfce7!important;display:flex!important;align-items:center!important;justify-content:center!important;box-shadow:0 12px 30px rgba(16,185,129,.16)!important}.landingLoginBtn{border:0!important;border-radius:999px!important;background:rgba(255,255,255,.86)!important;color:#071033!important;padding:13px 18px!important;font-weight:950!important;box-shadow:0 14px 34px rgba(15,23,42,.08)!important;backdrop-filter:blur(14px)!important}.landingMain{position:relative!important;z-index:2!important;max-width:1240px!important;margin:0 auto!important;display:grid!important;grid-template-columns:minmax(0,1.05fr) minmax(380px,.82fr)!important;gap:34px!important;align-items:center!important;text-align:left!important}.landingHeroNew{padding:38px 0!important}.landingBadge{display:inline-flex!important;align-items:center!important;gap:8px!important;width:max-content!important;border-radius:999px!important;background:#dcfce7!important;color:#047857!important;padding:10px 15px!important;font-weight:950!important;margin:0 0 18px!important;box-shadow:0 10px 24px rgba(16,185,129,.12)!important}.landingHeroNew h1{margin:0 0 20px!important;font-size:clamp(48px,6vw,84px)!important;line-height:.92!important;letter-spacing:-3.5px!important;color:#061333!important;max-width:820px!important;text-align:left!important}.landingHeroNew p{margin:0!important;color:#475569!important;font-size:20px!important;line-height:1.65!important;font-weight:700!important;max-width:780px!important;text-align:left!important}.landingActions{display:flex!important;gap:13px!important;flex-wrap:wrap!important;margin-top:26px!important;justify-content:flex-start!important}.landingPrimary,.landingSecondary{border:0!important;border-radius:18px!important;padding:16px 22px!important;font-weight:950!important;font-size:16px!important;transition:.18s ease!important}.landingPrimary{background:linear-gradient(135deg,#10b981,#22c55e)!important;color:white!important;box-shadow:0 18px 36px rgba(16,185,129,.25)!important}.landingSecondary{background:white!important;color:#071033!important;box-shadow:0 14px 34px rgba(15,23,42,.08)!important}.landingPrimary:hover,.landingSecondary:hover{transform:translateY(-2px)!important}.landingTrustRow{display:flex!important;gap:10px!important;flex-wrap:wrap!important;margin-top:22px!important;justify-content:flex-start!important}.landingTrustRow span{border-radius:999px!important;background:rgba(255,255,255,.78)!important;padding:10px 13px!important;color:#475569!important;font-size:13px!important;font-weight:900!important;box-shadow:0 10px 24px rgba(15,23,42,.06)!important}.landingPreviewCard{border-radius:34px!important;background:rgba(255,255,255,.88)!important;border:1px solid rgba(255,255,255,.96)!important;box-shadow:0 24px 60px rgba(15,23,42,.12)!important;padding:24px!important;backdrop-filter:blur(18px)!important;transform:rotate(1deg)!important}.previewHeader{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:16px!important;margin-bottom:18px!important}.previewHeader span{color:#64748b!important;font-weight:950!important;text-transform:uppercase!important;font-size:12px!important;letter-spacing:.08em!important}.previewHeader strong{font-size:34px!important;color:#071033!important}.previewLandscape{height:260px!important;border-radius:28px!important;position:relative!important;overflow:hidden!important;background:linear-gradient(180deg,#7dd3fc 0%,#fde68a 55%,#86efac 100%)!important}.sun{position:absolute!important;width:74px!important;height:74px!important;border-radius:999px!important;background:#fbbf24!important;right:38px!important;top:34px!important;box-shadow:0 0 50px rgba(251,191,36,.75)!important}.hill{position:absolute!important;bottom:-44px!important;border-radius:50% 50% 0 0!important}.h1{width:360px!important;height:150px!important;background:#22c55e!important;left:-70px!important}.h2{width:420px!important;height:190px!important;background:#16a34a!important;right:-110px!important}.castle{position:absolute!important;left:50%!important;top:46%!important;transform:translate(-50%,-50%)!important;font-size:74px!important;filter:drop-shadow(0 16px 18px rgba(15,23,42,.25))!important}.rocket{position:absolute!important;right:34px!important;bottom:42px!important;font-size:42px!important;animation:floatRocket 3s ease-in-out infinite!important}.previewStats{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:12px!important;margin-top:16px!important}.previewStats div{border-radius:18px!important;background:#f8fafc!important;padding:14px!important;text-align:center!important}.previewStats b{display:block!important;color:#047857!important;font-size:18px!important}.previewStats span{display:block!important;color:#64748b!important;font-size:12px!important;font-weight:900!important;margin-top:4px!important}.landingFeatureGrid{position:relative!important;z-index:2!important;max-width:1240px!important;margin:38px auto 0!important;display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:18px!important;text-align:left!important}.landingFeatureGrid article{background:rgba(255,255,255,.80)!important;border:1px solid rgba(255,255,255,.92)!important;border-radius:28px!important;padding:24px!important;box-shadow:0 16px 38px rgba(15,23,42,.08)!important;backdrop-filter:blur(14px)!important}.featureIcon{width:54px!important;height:54px!important;border-radius:18px!important;background:#ecfdf5!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:27px!important;margin-bottom:14px!important}.landingFeatureGrid h3{margin:0 0 8px!important;font-size:22px!important;color:#071033!important}.landingFeatureGrid p{margin:0!important;color:#64748b!important;font-weight:700!important;line-height:1.5!important}@media(max-width:980px){.landingMain,.landingFeatureGrid{grid-template-columns:1fr!important}.landingPreviewCard{transform:none!important}.landingTopbar{margin-bottom:20px!important}}@media(max-width:640px){.landingPage.premiumLanding{padding:18px!important}.landingHeroNew h1{font-size:44px!important;letter-spacing:-2px!important}.landingHeroNew p{font-size:17px!important}.previewStats{grid-template-columns:1fr!important}.landingActions button{width:100%!important}}
@media(max-width:1450px){.heroStatsGrid{grid-template-columns:1fr 1fr;align-items:stretch}.miniLine,.snapshotCurveCard{grid-column:1/-1}.chartPanel,.dashboardGrid>.panel:nth-child(2),.projectionPanel,.goalsPanel,.transactionsPanel{grid-column:span 12}.projectionGrid{grid-template-columns:repeat(3,1fr)}}@media(max-width:1100px){.app{grid-template-columns:1fr}.heroStatsGrid{grid-template-columns:1fr}.heroStatsGrid>.statCard{height:auto;min-height:auto}.primaryStat,.variationCard{min-height:auto}.snapshotCurveCard,.snapshotCurveCard.emptyState{height:auto;min-height:auto}.snapshotCurveMetrics{grid-template-columns:1fr}.snapshotCurveChart{min-height:auto}.snapshotEmpty{min-height:120px}.sidebar{position:relative;height:auto;border-right:0;border-bottom:1px solid var(--soft)}.nav{grid-template-columns:repeat(3,1fr);margin:22px 0}.sideLevel{min-height:220px}.main{padding:22px}.mainScene{height:620px}.sceneInfoCard,.sceneProgressCard{position:relative;left:auto;right:auto;top:auto;margin:18px;width:calc(100% - 36px)}.timelineOverlay{height:145px}.projectionGrid{grid-template-columns:1fr}}@media(max-width:760px){.welcomePage{padding:16px}.welcomeShell{grid-template-columns:1fr}.welcomeHeroCard,.setupCard{padding:22px;border-radius:24px}.setupGrid,.modalGrid{grid-template-columns:1fr}.setupHeader,.setupLevel,.topbar,.dangerZone{flex-direction:column}.setupTotal{text-align:left}.app{display:block}.sidebar{padding:18px}.nav{grid-template-columns:1fr}.main{padding:18px}.topbar{display:flex}.topActions{justify-content:flex-start}.mainScene{height:700px;border-radius:24px}.sceneInfoCard h2{font-size:26px}.timelineOverlay{overflow-x:auto}.levelMarker{width:96px}.levelMarker strong{font-size:9px}.levelMarker small{display:none}.markerIcon{width:42px;height:42px}.levelMarker.active .markerIcon{width:52px;height:52px}.currentBadge{font-size:10px;padding:5px 8px}.accountsGrid{grid-template-columns:1fr}.panel{padding:18px}.chartWrap{height:240px}.modal{padding:22px}.welcomeHeroCard h1{font-size:40px}.welcomePreview{height:240px}}
  `}</style>;
}
