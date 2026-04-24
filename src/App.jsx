import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import "./index.css";

const ACCOUNTS = [
  { key: "pea", name: "PEA", icon: "📈", objective: 150000, color: "#10b981" },
  { key: "livretA", name: "Livret A", icon: "🐷", objective: 22950, color: "#ef4444" },
  { key: "ldds", name: "LDDS", icon: "💳", objective: 12000, color: "#3b82f6" },
  { key: "lep", name: "LEP", icon: "🏛️", objective: 10000, color: "#f59e0b" },
  { key: "livretJeune", name: "Livret Jeune", icon: "🪙", objective: 1600, color: "#8b5cf6" },
  { key: "cto", name: "CTO", icon: "💼", objective: 50000, color: "#14b8a6" },
  { key: "assuranceVie", name: "Assurance vie", icon: "🛡️", objective: 100000, color: "#0ea5e9" },
  { key: "per", name: "PER", icon: "🌴", objective: 50000, color: "#7c3aed" },
  { key: "pee", name: "PEE", icon: "🏢", objective: 30000, color: "#64748b" },
];

const LEVELS = [
  { name: "Préhistoire", icon: "🔥", min: 0, next: 10000 },
  { name: "Antiquité", icon: "🏛️", min: 10000, next: 30000 },
  { name: "Moyen Âge", icon: "🏰", min: 30000, next: 75000 },
  { name: "Révolution industrielle", icon: "🚂", min: 75000, next: 150000 },
  { name: "Époque moderne", icon: "🏙️", min: 150000, next: 300000 },
  { name: "Futuriste", icon: "🚀", min: 300000, next: 500000 },
];

function money(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value || 0));
}

function parseAmount(value) {
  return Number(String(value || "0").replace(/\s/g, "").replace(",", ".")) || 0;
}

function emptyAccounts() {
  return ACCOUNTS.map((a) => ({ ...a, balance: 0 }));
}

function getLevel(total) {
  return [...LEVELS].reverse().find((level) => total >= level.min) || LEVELS[0];
}

function getProgress(total) {
  const level = getLevel(total);
  const span = Math.max(level.next - level.min, 1);
  return Math.min(100, Math.max(0, Math.round(((total - level.min) / span) * 100)));
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [pseudo, setPseudo] = useState("");
  const [accounts, setAccounts] = useState(emptyAccounts());
  const [snapshots, setSnapshots] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dark, setDark] = useState(false);

  const total = useMemo(
    () => accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0),
    [accounts]
  );

  const activeAccounts = useMemo(
    () => accounts.filter((a) => Number(a.balance || 0) > 0),
    [accounts]
  );

  const currentLevel = getLevel(total);
  const progress = getProgress(total);

  useEffect(() => {
    async function init() {
      try {
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          setUser(data.session.user);
          await loadData(data.session.user);
          setPage("dashboard");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadData(session.user);
        setPage("dashboard");
      } else {
        setUser(null);
        setPseudo("");
        setAccounts(emptyAccounts());
        setSnapshots([]);
        setTransactions([]);
        setPage("home");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadData(currentUser) {
    const [{ data: profile }, { data: dbAccounts }, { data: dbSnapshots }, { data: dbTransactions }] =
      await Promise.all([
        supabase.from("profiles").select("*").eq("id", currentUser.id).maybeSingle(),
        supabase.from("accounts").select("*").eq("user_id", currentUser.id),
        supabase.from("snapshots").select("*").eq("user_id", currentUser.id).order("created_at"),
        supabase.from("transactions").select("*").eq("user_id", currentUser.id).order("created_at", { ascending: false }),
      ]);

    setPseudo(profile?.pseudo || currentUser.email?.split("@")[0] || "Utilisateur");

    setAccounts(
      ACCOUNTS.map((base) => {
        const found = dbAccounts?.find((a) => a.account_key === base.key);
        return {
          ...base,
          balance: Number(found?.balance || 0),
          objective: Number(found?.objective || base.objective),
        };
      })
    );

    setSnapshots(dbSnapshots || []);
    setTransactions(dbTransactions || []);
  }

 async function signup(form) {
  setLoading(true);

  try {
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { pseudo: form.pseudo },
      },
    });

    if (signUpError) throw signUpError;

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (loginError) throw loginError;

    await supabase.from("profiles").upsert({
      id: loginData.user.id,
      pseudo: form.pseudo,
      email: form.email,
    });

    setUser(loginData.user);
    setPseudo(form.pseudo);
    setPage("setup");
  } catch (error) {
    alert(error.message);
  } finally {
    setLoading(false);
  }
}

  async function login(form) {
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;

      await loadData(data.user);
      setUser(data.user);
      setPage("dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  async function saveInitial(values) {
    if (!user) return alert("Connecte-toi avant de créer ton tableau de bord.");

    setLoading(true);

    try {
      const payload = ACCOUNTS.map((a) => ({
        user_id: user.id,
        account_key: a.key,
        name: a.name,
        icon: a.icon,
        balance: parseAmount(values[a.key]),
        objective: a.objective,
        color: a.color,
        updated_at: new Date().toISOString(),
      }));

      await supabase.from("accounts").upsert(payload, {
        onConflict: "user_id,account_key",
      });

      const newTotal = payload.reduce((sum, a) => sum + Number(a.balance || 0), 0);

      await supabase.from("snapshots").insert({
        user_id: user.id,
        total: newTotal,
        type: "automatique",
        label: "Snapshot initial",
        accounts: payload,
      });

      await loadData(user);
      setPage("dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function addMovement(accountKey, amount, type) {
    if (!user) return;

    const selected = accounts.find((a) => a.key === accountKey);
    if (!selected) return;

    const value = Math.abs(parseAmount(amount));
    if (!value) return;

    const nextBalance =
      type === "withdrawal"
        ? Math.max(0, selected.balance - value)
        : selected.balance + value;

    try {
      await supabase.from("accounts").upsert(
        {
          user_id: user.id,
          account_key: selected.key,
          name: selected.name,
          icon: selected.icon,
          balance: nextBalance,
          objective: selected.objective,
          color: selected.color,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,account_key" }
      );

      const nextAccounts = accounts.map((a) =>
        a.key === accountKey ? { ...a, balance: nextBalance } : a
      );

      const nextTotal = nextAccounts.reduce((sum, a) => sum + Number(a.balance || 0), 0);

      await supabase.from("transactions").insert({
        user_id: user.id,
        account_key: accountKey,
        amount: type === "withdrawal" ? -value : value,
        type,
        note: type === "withdrawal" ? "Retrait" : "Versement",
      });

      await supabase.from("snapshots").insert({
        user_id: user.id,
        total: nextTotal,
        type: "automatique",
        label: "Snapshot automatique",
        accounts: nextAccounts,
      });

      await loadData(user);
    } catch (error) {
      alert(error.message);
    }
  }

  async function manualSnapshot() {
    if (!user) return;

    await supabase.from("snapshots").insert({
      user_id: user.id,
      total,
      type: "manuel",
      label: "Snapshot manuel",
      accounts,
    });

    await loadData(user);
  }

  if (loading) return <div className="loading">Chargement de PatriMieux...</div>;

  if (page === "home") {
    return <Home onCreate={() => setPage("signup")} onLogin={() => setPage("login")} />;
  }

  if (page === "signup") {
    return <Auth title="Créer ton compte" onSubmit={signup} onBack={() => setPage("home")} create />;
  }

  if (page === "login") {
    return <Auth title="Connexion" onSubmit={login} onBack={() => setPage("home")} />;
  }

  if (page === "setup") {
    return <Setup onSubmit={saveInitial} onLogout={logout} />;
  }

  return (
    <Dashboard
      dark={dark}
      setDark={setDark}
      pseudo={pseudo}
      accounts={accounts}
      activeAccounts={activeAccounts}
      snapshots={snapshots}
      transactions={transactions}
      total={total}
      level={currentLevel}
      progress={progress}
      onLogout={logout}
      onMovement={addMovement}
      onSnapshot={manualSnapshot}
      onSetup={() => setPage("setup")}
    />
  );
}

function Home({ onCreate, onLogin }) {
  return (
    <main className="home">
      <nav className="nav">
        <div className="logo">✨ PatriMieux</div>
        <button onClick={onLogin}>J’ai déjà un compte</button>
      </nav>

      <section className="hero">
        <div>
          <span className="pill">🌱 Patrimoine vivant</span>
          <h1>Transforme ton épargne en aventure visuelle.</h1>
          <p>
            Suis tes livrets, ton PEA, ton CTO et tes placements long terme avec
            une interface claire, colorée et motivante.
          </p>
          <div className="actions">
            <button className="primary" onClick={onCreate}>Créer mon compte gratuit</button>
            <button className="secondary" onClick={onLogin}>Me connecter</button>
          </div>
          <div className="trust">
            <span>✅ Simple à suivre</span>
            <span>📸 Snapshots auto</span>
            <span>🎯 Objectifs visibles</span>
          </div>
        </div>

        <div className="preview">
          <div className="previewTop">
            <div>
              <span>Patrimoine total</span>
              <strong>42 850 €</strong>
            </div>
            <b>🏰 Moyen Âge</b>
          </div>

          <div className="world">
            <div className="sun" />
            <div className="hill one" />
            <div className="hill two" />
            <div className="castle">🏰</div>
            <div className="rocket">🚀</div>
          </div>

          <div className="stats">
            <span>+12,4%<small>progression</small></span>
            <span>6<small>placements</small></span>
            <span>Auto<small>snapshots</small></span>
          </div>
        </div>
      </section>

      <section className="features">
        <Feature icon="📈" title="Suis ton évolution réelle" text="Observe ton patrimoine grâce aux snapshots automatiques." />
        <Feature icon="🎯" title="Garde tes objectifs en vue" text="Vois où tu en es sur chaque enveloppe." />
        <Feature icon="🌍" title="Rends l’épargne motivante" text="Ton patrimoine débloque des niveaux visuels." />
      </section>
    </main>
  );
}

function Feature({ icon, title, text }) {
  return (
    <article className="feature">
      <div>{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Auth({ title, onSubmit, onBack, create }) {
  const [form, setForm] = useState({ pseudo: "", email: "", password: "" });

  return (
    <main className="auth">
      <form
        className="card authCard"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(form);
        }}
      >
        <h1>{title}</h1>
        <p>{create ? "Une fois créé, tu passeras à la configuration initiale." : "Connecte-toi à ton espace PatriMieux."}</p>

        {create && (
          <label>
            <span>Pseudo</span>
            <input
              placeholder="Ex : Mathias"
              value={form.pseudo}
              onChange={(e) => setForm({ ...form, pseudo: e.target.value })}
              required
            />
          </label>
        )}

        <label>
          <span>Adresse mail</span>
          <input
            type="email"
            placeholder="exemple@mail.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </label>

        <label>
          <span>Mot de passe</span>
          <input
            type="password"
            placeholder="Minimum 6 caractères"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            minLength={6}
            required
          />
        </label>

        <button className="primary">{title}</button>
        <button type="button" className="secondary" onClick={onBack}>← Retour</button>
      </form>
    </main>
  );
}

function Setup({ onSubmit, onLogout }) {
  const [values, setValues] = useState(
    Object.fromEntries(ACCOUNTS.map((a) => [a.key, "0"]))
  );

  function fillExample() {
    setValues({
      pea: "2300",
      livretA: "0",
      ldds: "0",
      lep: "8850",
      livretJeune: "1000",
      cto: "18",
      assuranceVie: "100",
      per: "1000",
      pee: "10000",
    });
  }

  return (
    <main className="setup">
      <form
        className="card setupCard"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(values);
        }}
      >
        <div className="setupHeader">
          <div>
            <h1>État de ton patrimoine</h1>
            <p>Renseigne tes montants actuels pour créer ton tableau de bord.</p>
          </div>
          <button type="button" className="secondary" onClick={onLogout}>Déconnexion</button>
        </div>

        <div className="setupGrid">
          {ACCOUNTS.map((a) => (
            <label key={a.key}>
              <span>{a.icon} {a.name}</span>
              <input
                value={values[a.key]}
                onChange={(e) => setValues({ ...values, [a.key]: e.target.value })}
              />
              <small>Objectif : {money(a.objective)}</small>
            </label>
          ))}
        </div>

        <div className="actions">
          <button className="primary">Créer mon tableau de bord</button>
          <button type="button" className="secondary" onClick={fillExample}>Remplir avec un exemple</button>
        </div>
      </form>
    </main>
  );
}

function Dashboard({
  dark,
  setDark,
  pseudo,
  accounts,
  activeAccounts,
  snapshots,
  transactions,
  total,
  level,
  progress,
  onLogout,
  onMovement,
  onSnapshot,
  onSetup,
}) {
  const [movementModal, setMovementModal] = useState(false);
  const lastSnapshot = snapshots[snapshots.length - 1];
  const previousSnapshot = snapshots[snapshots.length - 2];
  const variation = lastSnapshot && previousSnapshot
    ? Number(lastSnapshot.total || 0) - Number(previousSnapshot.total || 0)
    : 0;

  return (
    <main className={dark ? "dashboard dark" : "dashboard"}>
      <aside className="sidebar">
        <div className="logo">✨ PatriMieux</div>
        <button className="active">🏠 Tableau de bord</button>
        <button>⚙️ Paramètres</button>

        <div className="sideLevel">
          <span>{level.icon}</span>
          <small>Niveau actuel</small>
          <h3>{level.name}</h3>
          <button onClick={() => setMovementModal(true)}>Ajouter un mouvement</button>
        </div>
      </aside>

      <section className="content">
        <header className="top">
          <div>
            <h1>Bonjour {pseudo} 👋</h1>
            <p>Ton patrimoine évolue comme un monde vivant.</p>
          </div>
          <div className="actions">
            <button className="secondary" onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
            <button className="secondary" onClick={onSetup}>Modifier accueil</button>
            <button className="primary" onClick={() => setMovementModal(true)}>+ Mouvement</button>
            <button className="danger" onClick={onLogout}>Déconnexion</button>
          </div>
        </header>

        <section className="cards">
          <div className="card">
            <span>Patrimoine total</span>
            <strong>{money(total)}</strong>
            <p>{level.icon} Niveau : {level.name}</p>
          </div>

          <div className="card">
            <span>Variation estimée</span>
            <strong className={variation >= 0 ? "green" : "red"}>{money(variation)}</strong>
            <p>vs dernier snapshot</p>
          </div>

          <div className="card">
            <span>Progression</span>
            <strong>{progress}%</strong>
            <div className="bar">
              <div style={{ width: `${progress}%` }} />
            </div>
            <p>vers le niveau suivant</p>
          </div>
        </section>

        <section className="levelHero">
          <div>
            <span>Niveau actuel</span>
            <h2>{level.icon} {level.name}</h2>
            <p>Ton patrimoine continue de progresser étape par étape.</p>
          </div>
          <div>
            <span>Prochain palier</span>
            <h2>{progress}%</h2>
            <div className="bar">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>
        </section>

        <section className="insights">
          <Evolution snapshots={snapshots} total={total} />
          <Structure accounts={activeAccounts} total={total} />
        </section>

        <section className="accounts">
          {activeAccounts.map((a) => {
            const percent = Math.min(100, Math.round((a.balance / a.objective) * 100));
            return (
              <div className="account" key={a.key}>
                <h3>{a.icon} {a.name}</h3>
                <strong>{money(a.balance)}</strong>
                <div className="bar">
                  <div style={{ width: `${percent}%`, background: a.color }} />
                </div>
                <p>{percent}% de l’objectif</p>
              </div>
            );
          })}

          <button className="addPlacement" onClick={onSetup}>+ Ajouter un placement</button>
        </section>

        <section className="history card">
          <div className="historyHead">
            <h2>Historique récent</h2>
            <button className="secondary" onClick={onSnapshot}>Snapshot manuel</button>
          </div>

          {transactions.length === 0 && <p>Aucun mouvement pour le moment.</p>}

          {transactions.slice(0, 8).map((tx) => (
            <div className="tx" key={tx.id}>
              <span>{tx.type === "withdrawal" ? "Retrait" : "Versement"}</span>
              <strong className={Number(tx.amount) < 0 ? "red" : "green"}>
                {money(tx.amount)}
              </strong>
            </div>
          ))}
        </section>
      </section>

      {movementModal && (
        <MovementModal
          accounts={accounts}
          onClose={() => setMovementModal(false)}
          onSubmit={(accountKey, amount, type) => {
            onMovement(accountKey, amount, type);
            setMovementModal(false);
          }}
        />
      )}
    </main>
  );
}

function Evolution({ snapshots, total }) {
  const points = snapshots.length ? snapshots : [{ id: "current", total }];
  const max = Math.max(...points.map((p) => Number(p.total || 0)), 1);

  return (
    <div className="card panel">
      <div className="panelHead">
        <div>
          <span>Évolution</span>
          <h2>Patrimoine dans le temps</h2>
        </div>
      </div>

      <div className="chart">
        {points.length < 2 ? (
          <p>Pas assez de snapshots</p>
        ) : (
          points.slice(-10).map((p) => (
            <div
              key={p.id}
              className="chartBar"
              style={{ height: `${20 + (Number(p.total || 0) / max) * 80}%` }}
              title={money(p.total)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function Structure({ accounts, total }) {
  return (
    <div className="card panel">
      <span>Répartition</span>
      <h2>Structure du patrimoine</h2>

      {accounts.length === 0 && <p>Aucun placement actif.</p>}

      {accounts.map((a) => {
        const percent = total ? Math.round((a.balance / total) * 1000) / 10 : 0;
        return (
          <div className="share" key={a.key}>
            <div>
              <strong>{a.icon} {a.name}</strong>
              <span>{money(a.balance)}</span>
            </div>
            <div className="bar">
              <div style={{ width: `${percent}%`, background: a.color }} />
            </div>
            <small>{String(percent).replace(".", ",")}% du total</small>
          </div>
        );
      })}
    </div>
  );
}

function MovementModal({ accounts, onClose, onSubmit }) {
  const [accountKey, setAccountKey] = useState(accounts[0]?.key || "pea");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("deposit");

  return (
    <div className="modal">
      <form
        className="card modalCard"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(accountKey, amount, type);
        }}
      >
        <h2>{type === "deposit" ? "+ Versement" : "- Retrait"}</h2>

        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="deposit">Versement</option>
          <option value="withdrawal">Retrait</option>
        </select>

        <select value={accountKey} onChange={(e) => setAccountKey(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.key} value={a.key}>{a.icon} {a.name}</option>
          ))}
        </select>

        <input
          placeholder="Montant"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />

        <button className="primary">Valider</button>
        <button type="button" className="secondary" onClick={onClose}>Fermer</button>
      </form>
    </div>
  );
}