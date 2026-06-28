import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { currentFocus } from "./data/portfolio";
import { supabase, loadState, saveState } from "./lib/supabase";
import FlowingMenu from "./components/FlowingMenu";
import Masonry from "./components/Masonry";
import {
  db,
  defaultBlockContent,
  type KDB,
  type KBlockType,
  type KPage,
  type KBlock,
} from "./lib/knowledge";
import { idb } from "./lib/interview";

/* ─────────────────────── Product types ─────────────── */
type PBlockType =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "image"
  | "link"
  | "mermaid";
type PSectionType = "architecture" | "decisions" | "mistakes";
interface PBlock {
  id: string;
  type: PBlockType;
  content: Record<string, unknown>;
}
interface PSection {
  type: PSectionType;
  blocks: PBlock[];
}
interface Product {
  id: string;
  text: string;
  link: string;
  image: string;
  description: string;
  sections: PSection[];
}

const todayKey = () => new Date().toISOString().split("T")[0];
type ActivityMap = Record<string, number>;

type Experiment = Product & { height: number };

/* ─────────────────────── Auth context ──────────────── */
const AuthCtx = createContext(false);
const useAuthor = () => useContext(AuthCtx);
const RecordCtx = createContext<() => void>(() => {});
const useRecord = () => useContext(RecordCtx);
// Set this to the email you'll create in Supabase Auth → Users
const AUTHOR_EMAIL = "praveen.kalaboina@gmail.com";

/* ─────────────────────── Types ─────────────────────── */
type AccentKey = "none" | "blue" | "amber" | "green" | "violet";

interface NavItem {
  id: string;
  title: string;
  code: string;
  section: string;
  kind: string;
  purpose: string;
}
interface NavGroup {
  sep: boolean;
  label: string;
  items: NavItem[];
}

interface AppSettings {
  accent: AccentKey;
  showCodes: boolean;
  showProperties: boolean;
}

/* ─────────────────────── Constants ─────────────────── */
const ACCENT: Record<AccentKey, string> = {
  none: "#ededee",
  blue: "#6e9bff",
  amber: "#f3c34e",
  green: "#5cd089",
  violet: "#9b8cff",
};

const T = {
  bg: "#0a0a0b",
  sidebar: "#090909",
  border: "#161619",
  t1: "#ededee",
  t2: "#9a9aa1",
  t3: "#b6b6bb",
  t4: "#7d7d85",
  t5: "#5d5d63",
  t6: "#3a3a3e",
  t7: "#46464c",
  m4: "#26262a",
  m5: "#1c1c1f",
  m6: "#141416",
  accent: "#6e56cf",
  font: "'Geist Variable', ui-sans-serif, system-ui, sans-serif",
  mono: "ui-monospace, 'SF Mono', 'Fira Code', monospace",
};

const NAV: NavGroup[] = [
  {
    sep: false,
    label: "",
    items: [
      {
        id: "home",
        title: "Home",
        code: "PK-000",
        section: "Overview",
        kind: "home",
        purpose: "",
      },
      {
        id: "mission",
        title: "Mission",
        code: "PK-001",
        section: "Overview",
        kind: "doc",
        purpose: `This journey is about much more than changing job titles or learning the latest AI framework.

          Over the next two years, I want to become the kind of engineer who can take an idea from a simple problem statement all the way to a production-ready AI application that people genuinely enjoy using. More importantly, I want to build products that solve real problems and create real value.

          I’m approaching this journey with intention. Instead of jumping from one trending technology to another or building projects just to fill a portfolio, I want every project to teach me something meaningful. Every challenge, every mistake, every architectural decision, and every product will be another step toward becoming a better engineer.

          My focus is on building strong software engineering fundamentals first. That means mastering Python, deepening my understanding of computer science, learning backend engineering, becoming comfortable with frontend development, studying system design, and understanding how modern AI systems are built and deployed. I don’t want to learn these topics in isolation—I want to apply them while building real products.

          This website is where I’ll document that journey. It’s a place to record what I’m learning, what I’m building, the problems I’m trying to solve, the decisions I make, the mistakes I encounter, and the lessons I learn along the way. Rather than simply saying I know something, I want to show the evidence through my work and my progress.

          My goal isn’t just to become an AI Applications Engineer. I want to become a strong software engineer who uses AI as a force multiplier to build thoughtful, reliable, production-quality products. If one of those products grows into something people love and are willing to pay for, that’s even better. But regardless of the outcome, I want every product to leave me with deeper knowledge, better engineering instincts, and a stronger understanding of how great software is built.

          This is my commitment to learning with purpose, building with intention, solving meaningful problems, and sharing the entire journey openly—one lesson, one product, and one decision at a time.`,
      },
    ],
  },
  {
    sep: true,
    label: "Notes",
    items: [
      {
        id: "journey",
        title: "Journey",
        code: "PK-010",
        section: "Notes",
        kind: "timeline",
        purpose:
          "A living record of what I’m learning, building, and becoming.",
      },
      {
        id: "learning",
        title: "Learning",
        code: "PK-011",
        section: "Notes",
        kind: "list",
        purpose: "What I'm actively learning right now.",
      },
      {
        id: "knowledge",
        title: "Knowledge",
        code: "PK-012",
        section: "Notes",
        kind: "grid",
        purpose: "Notes and references I keep coming back to.",
      },
      {
        id: "journal",
        title: "Journal",
        code: "PK-013",
        section: "Notes",
        kind: "list",
        purpose: "Short logs — thinking out loud, over time.",
      },
    ],
  },
  {
    sep: true,
    label: "Building",
    items: [
      {
        id: "products",
        title: "Products",
        code: "PK-020",
        section: "Building",
        kind: "grid",
        purpose: "Things I've shipped and things I'm building.",
      },
      {
        id: "experiments",
        title: "Experiments",
        code: "PK-024",
        section: "Building",
        kind: "grid",
        purpose: "Rough ideas and prototypes in progress.",
      },
    ],
  },
  {
    sep: true,
    label: "Growth",
    items: [
      {
        id: "progress",
        title: "Progress",
        code: "PK-030",
        section: "Growth",
        kind: "metrics",
        purpose: "Metrics and momentum over time.",
      },
      {
        id: "interview",
        title: "Interview Prep",
        code: "PK-031",
        section: "Growth",
        kind: "list",
        purpose: "Drills, questions, and patterns I'm practicing.",
      },
      {
        id: "resume",
        title: "Resume",
        code: "PK-032",
        section: "Growth",
        kind: "doc",
        purpose: "The formal summary — experience and skills.",
      },
    ],
  },
  {
    sep: true,
    label: "",
    items: [
      {
        id: "settings",
        title: "Settings",
        code: "PK-040",
        section: "System",
        kind: "settings",
        purpose: "Preferences for this space.",
      },
    ],
  },
];

const FLAT = NAV.flatMap((g) => g.items);

/* ─────────────────────── Journey data ──────────────── */
const JOURNEY_LAYERS: {
  id: string;
  num: number;
  label: string;
  sub: string;
  desc: string;
  items: { id: string; label: string; isGroup?: boolean }[];
}[] = [
  {
    id: "l1",
    num: 1,
    label: "Programming",
    sub: "Foundation",
    desc: "Everything starts here. Becoming comfortable with Python lets me focus on solving problems instead of thinking about syntax.",
    items: [
      { id: "l1-g", label: "Python", isGroup: true },
      { id: "l1-1", label: "OOP" },
      { id: "l1-2", label: "Functional programming" },
      { id: "l1-3", label: "Async" },
      { id: "l1-4", label: "Generators" },
      { id: "l1-5", label: "Decorators" },
      { id: "l1-6", label: "Typing" },
      { id: "l1-7", label: "Context managers" },
      { id: "l1-8", label: "Packaging" },
      { id: "l1-9", label: "Testing" },
    ],
  },
  {
    id: "l2",
    num: 2,
    label: "Computer Science",
    sub: "Foundation",
    desc: "The concepts behind every piece of software. Understanding how computers work helps me write better code and make better engineering decisions.",
    items: [
      { id: "l2-1", label: "Time Complexity" },
      { id: "l2-2", label: "Space Complexity" },
      { id: "l2-3", label: "Memory" },
      { id: "l2-4", label: "CPU" },
      { id: "l2-5", label: "Networking" },
      { id: "l2-6", label: "Operating Systems" },
      { id: "l2-7", label: "Processes vs Threads" },
      { id: "l2-8", label: "Concurrency" },
      { id: "l2-9", label: "File Systems" },
      { id: "l2-10", label: "Databases" },
      { id: "l2-11", label: "Caching" },
    ],
  },
  {
    id: "l3",
    num: 3,
    label: "Data Structures & Algorithms",
    sub: "Foundation",
    desc: "Building problem-solving skills while preparing for technical interviews. The goal isn't memorization—it's learning to think through problems efficiently.",
    items: [
      { id: "l3-1", label: "Arrays" },
      { id: "l3-2", label: "Strings" },
      { id: "l3-3", label: "HashMaps" },
      { id: "l3-4", label: "Stacks" },
      { id: "l3-5", label: "Queues" },
      { id: "l3-6", label: "Linked Lists" },
      { id: "l3-7", label: "Trees" },
      { id: "l3-8", label: "BST" },
      { id: "l3-9", label: "Heap" },
      { id: "l3-10", label: "Graphs" },
      { id: "l3-11", label: "Recursion" },
      { id: "l3-12", label: "Backtracking" },
      { id: "l3-13", label: "Dynamic Programming" },
      { id: "l3-14", label: "Greedy" },
    ],
  },
  {
    id: "l4",
    num: 4,
    label: "Backend Engineering",
    sub: "Core",
    desc: "Learning how production applications are designed, built, and deployed. This is where most of the business logic behind modern AI products lives.",
    items: [
      { id: "l4-1", label: "FastAPI" },
      { id: "l4-2", label: "REST" },
      { id: "l4-3", label: "GraphQL (Basics)" },
      { id: "l4-4", label: "Authentication" },
      { id: "l4-5", label: "JWT" },
      { id: "l4-6", label: "OAuth" },
      { id: "l4-7", label: "Databases" },
      { id: "l4-8", label: "SQL" },
      { id: "l4-9", label: "PostgreSQL" },
      { id: "l4-10", label: "Redis" },
      { id: "l4-11", label: "Queues" },
      { id: "l4-12", label: "WebSockets" },
      { id: "l4-13", label: "Docker" },
      { id: "l4-14", label: "Deployment" },
    ],
  },
  {
    id: "l5",
    num: 5,
    label: "Frontend",
    sub: "Enough to ship",
    desc: "Learning enough frontend development to build polished products without relying on someone else to bring ideas to life.",
    items: [
      { id: "l5-1", label: "React" },
      { id: "l5-2", label: "Next.js" },
      { id: "l5-3", label: "Tailwind" },
      { id: "l5-4", label: "State Management" },
      { id: "l5-5", label: "API Integration" },
      { id: "l5-6", label: "Basic UX" },
    ],
  },
  {
    id: "l6",
    num: 6,
    label: "AI Engineering",
    sub: "Differentiator",
    desc: "Understanding how modern AI applications work—from LLMs and RAG to agents and evaluation—so I can build reliable AI-powered products.",
    items: [
      { id: "l6-g1", label: "LLMs", isGroup: true },
      { id: "l6-1", label: "Tokens" },
      { id: "l6-2", label: "Context Window" },
      { id: "l6-3", label: "Temperature" },
      { id: "l6-4", label: "Top P" },
      { id: "l6-5", label: "Prompt Engineering" },
      { id: "l6-6", label: "Structured Outputs" },
      { id: "l6-7", label: "Tool Calling" },
      { id: "l6-8", label: "Function Calling" },
      { id: "l6-g2", label: "RAG", isGroup: true },
      { id: "l6-9", label: "Embeddings" },
      { id: "l6-10", label: "Chunking" },
      { id: "l6-11", label: "Vector DB" },
      { id: "l6-12", label: "Hybrid Search" },
      { id: "l6-13", label: "Reranking" },
      { id: "l6-g3", label: "Agents", isGroup: true },
      { id: "l6-14", label: "LangGraph" },
      { id: "l6-15", label: "MCP" },
      { id: "l6-16", label: "Memory" },
      { id: "l6-17", label: "Planning" },
      { id: "l6-18", label: "Reflection" },
      { id: "l6-19", label: "Multi-agent Systems" },
      { id: "l6-g4", label: "Evaluation", isGroup: true },
      { id: "l6-20", label: "Hallucination" },
      { id: "l6-21", label: "Grounding" },
      { id: "l6-22", label: "Prompt Evaluation" },
      { id: "l6-23", label: "Latency" },
      { id: "l6-24", label: "Cost" },
      { id: "l6-25", label: "Reliability" },
      { id: "l6-26", label: "AI Observability" },
    ],
  },
  {
    id: "l7",
    num: 7,
    label: "System Design",
    sub: "Scale",
    desc: "Learning how software evolves from side projects into systems that are reliable, scalable, and capable of serving real users.",
    items: [
      { id: "l7-g1", label: "Traditional", isGroup: true },
      { id: "l7-1", label: "Load Balancers" },
      { id: "l7-2", label: "Databases" },
      { id: "l7-3", label: "Scaling" },
      { id: "l7-4", label: "Queues" },
      { id: "l7-5", label: "Caching" },
      { id: "l7-6", label: "CDN" },
      { id: "l7-g2", label: "AI", isGroup: true },
      { id: "l7-7", label: "Prompt Cache" },
      { id: "l7-8", label: "Embedding Cache" },
      { id: "l7-9", label: "Model Routing" },
      { id: "l7-10", label: "Vector Stores" },
      { id: "l7-11", label: "Agent Orchestration" },
      { id: "l7-12", label: "Tool Execution" },
      { id: "l7-13", label: "Streaming" },
      { id: "l7-14", label: "Guardrails" },
    ],
  },
  {
    id: "l8",
    num: 8,
    label: "Product Engineering",
    sub: "Ship it",
    desc: "Building doesn't end when the code works. This focuses on everything needed to deploy, monitor, improve, and maintain software in production.",
    items: [
      { id: "l8-1", label: "Git" },
      { id: "l8-2", label: "CI/CD" },
      { id: "l8-3", label: "Testing" },
      { id: "l8-4", label: "Monitoring" },
      { id: "l8-5", label: "Logging" },
      { id: "l8-6", label: "Analytics" },
      { id: "l8-7", label: "Feature Flags" },
      { id: "l8-8", label: "Billing" },
      { id: "l8-9", label: "Deployment" },
      { id: "l8-10", label: "Security" },
    ],
  },
  {
    id: "l9",
    num: 9,
    label: "Business",
    sub: "Growth",
    desc: "Learning how to identify real problems, validate ideas, and build products that people genuinely find valuable enough to use and pay for.",
    items: [
      { id: "l9-1", label: "Validation" },
      { id: "l9-2", label: "Pricing" },
      { id: "l9-3", label: "Landing Pages" },
      { id: "l9-4", label: "Marketing" },
      { id: "l9-5", label: "Sales" },
      { id: "l9-6", label: "Customer Interviews" },
      { id: "l9-7", label: "Product Metrics" },
    ],
  },
];

/* ─────────────────────── Root ───────────────────────── */
export default function App() {
  const [active, setActive] = useState("home");
  const [activity, setActivity] = useState<ActivityMap>({});
  useEffect(() => {
    supabase.from("activity").select("date,count").then(({ data, error }) => {
      if (error) console.error("[activity] load failed:", error.message, error.code);
      if (data) setActivity(Object.fromEntries(data.map((r: { date: string; count: number }) => [r.date, r.count])));
    });
  }, []);
  const recordActivity = useCallback(() => {
    setActivity(a => {
      const t = todayKey();
      const newCount = (a[t] || 0) + 1;
      supabase.from("activity").upsert({ date: t, count: newCount }).then(({ error }) => {
        if (error) console.error("[activity] upsert failed:", error.message, error.code);
      });
      return { ...a, [t]: newCount };
    });
  }, []);
  const [settings, setSettings] = useState<AppSettings>({
    accent: "none",
    showCodes: true,
    showProperties: true,
  });

  const { accent, showCodes, showProperties } = settings;
  const accentColor = ACCENT[accent];
  const idx = Math.max(
    0,
    FLAT.findIndex((i) => i.id === active),
  );
  const current = FLAT[idx];
  const total = FLAT.length;
  const go = (d: number) => setActive(FLAT[(idx + d + total) % total].id);
  const upd = (patch: Partial<AppSettings>) =>
    setSettings((s) => ({ ...s, ...patch }));

  const [learningLayers, setLearningLayers] = useState<Set<string>>(new Set());
  const [journeyDone, setJourneyDone] = useState<Set<string>>(new Set());
  const [learningDone, setLearningDone] = useState<Set<string>>(new Set());
  const dbLoaded = useRef(false);

  // ── Author auth ──
  const [isAuthor, setIsAuthor] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const tapRef = useRef<{ n: number; t: ReturnType<typeof setTimeout> | null }>(
    { n: 0, t: null },
  );

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setIsAuthor(!!session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, s) => setIsAuthor(!!s));
    return () => subscription.unsubscribe();
  }, []);

  const handleSecretTap = () => {
    tapRef.current.n++;
    if (tapRef.current.t) clearTimeout(tapRef.current.t);
    if (tapRef.current.n >= 5) {
      tapRef.current.n = 0;
      if (!isAuthor) setAuthModal(true);
    } else {
      tapRef.current.t = setTimeout(() => {
        tapRef.current.n = 0;
      }, 2000);
    }
  };

  const signIn = async () => {
    setAuthBusy(true);
    setAuthErr("");
    const { error } = await supabase.auth.signInWithPassword({
      email: AUTHOR_EMAIL,
      password: phrase,
    });
    setAuthBusy(false);
    if (error) {
      setAuthErr("Wrong passphrase.");
      return;
    }
    setAuthModal(false);
    setPhrase("");
    setAuthErr("");
  };

  const signOut = () => supabase.auth.signOut();

  // ── Products ──
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    supabase.from("products").select("*").order("created_at")
      .then(({ data }) => { if (data) setProducts(data as Product[]); });
  }, []);
  const createProduct = async () => {
    const p: Product = { id: crypto.randomUUID(), text: "New Product", link: "#", image: "", description: "", sections: [] };
    const { data, error } = await supabase.from("products").insert(p).select().single();
    if (!error && data) { recordActivity(); setProducts(prev => [...prev, data as Product]); }
  };
  const updateProduct = (id: string, patch: Partial<Product>) => {
    setProducts(p => p.map(x => x.id === id ? { ...x, ...patch } : x));
    supabase.from("products").update(patch).eq("id", id);
  };
  const deleteProduct = async (id: string) => {
    setProducts(p => p.filter(x => x.id !== id));
    await supabase.from("products").delete().eq("id", id);
  };

  // ── Experiments ──
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  useEffect(() => {
    supabase.from("experiments").select("*").order("created_at")
      .then(({ data }) => { if (data) setExperiments(data as Experiment[]); });
  }, []);
  const createExperiment = async () => {
    const e: Experiment = { id: crypto.randomUUID(), text: "New Experiment", link: "#", image: "", description: "", sections: [], height: 300 };
    const { data, error } = await supabase.from("experiments").insert(e).select().single();
    if (!error && data) { recordActivity(); setExperiments(prev => [...prev, data as Experiment]); }
  };
  const updateExperiment = (id: string, patch: Partial<Experiment>) => {
    setExperiments(e => e.map(x => x.id === id ? { ...x, ...patch } : x));
    supabase.from("experiments").update(patch).eq("id", id);
  };
  const deleteExperiment = async (id: string) => {
    setExperiments(e => e.filter(x => x.id !== id));
    await supabase.from("experiments").delete().eq("id", id);
  };

  const toggleLearnLayer = (id: string) =>
    setLearningLayers((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const toggleJourneyDone = (id: string) =>
    setJourneyDone((p) => {
      const n = new Set(p);
      if (!n.has(id)) { n.add(id); recordActivity(); } else n.delete(id);
      return n;
    });
  const toggleLearningDone = (id: string) =>
    setLearningDone((p) => {
      const n = new Set(p);
      if (!n.has(id)) { n.add(id); recordActivity(); } else n.delete(id);
      return n;
    });

  // Load persisted state on mount
  useEffect(() => {
    loadState(["learning_layers", "journey_done", "learning_done"]).then(
      (s) => {
        setLearningLayers(new Set(s.learning_layers));
        setJourneyDone(new Set(s.journey_done));
        setLearningDone(new Set(s.learning_done));
        dbLoaded.current = true;
      },
    );
  }, []);

  // Persist on change (debounced, only after initial load)
  useEffect(() => {
    if (!dbLoaded.current) return;
    const t = setTimeout(
      () => saveState("learning_layers", [...learningLayers]),
      800,
    );
    return () => clearTimeout(t);
  }, [learningLayers]);

  useEffect(() => {
    if (!dbLoaded.current) return;
    const t = setTimeout(
      () => saveState("journey_done", [...journeyDone]),
      800,
    );
    return () => clearTimeout(t);
  }, [journeyDone]);

  useEffect(() => {
    if (!dbLoaded.current) return;
    const t = setTimeout(
      () => saveState("learning_done", [...learningDone]),
      800,
    );
    return () => clearTimeout(t);
  }, [learningDone]);

  return (
    <RecordCtx.Provider value={recordActivity}>
    <AuthCtx.Provider value={isAuthor}>
      {/* ── Auth modal ── */}
      {authModal && (
        <div
          onClick={() => {
            setAuthModal(false);
            setAuthErr("");
            setPhrase("");
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#111113",
              border: `1px solid #2a2a2e`,
              borderRadius: 14,
              padding: "32px 36px",
              width: 340,
              boxShadow: "0 32px 80px rgba(0,0,0,0.9)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: T.t5,
                marginBottom: 18,
              }}
            >
              Author mode
            </div>
            <input
              autoFocus
              type="password"
              value={phrase}
              onChange={(e) => {
                setPhrase(e.target.value);
                setAuthErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && signIn()}
              placeholder="Enter passphrase…"
              style={{
                width: "100%",
                background: "#0a0a0b",
                border: `1px solid ${authErr ? "#ff6b6b" : T.m4}`,
                borderRadius: 8,
                color: T.t1,
                fontFamily: T.font,
                fontSize: 14,
                padding: "10px 14px",
                outline: "none",
                marginBottom: authErr ? 8 : 16,
              }}
            />
            {authErr && (
              <div style={{ fontSize: 12, color: "#ff6b6b", marginBottom: 14 }}>
                {authErr}
              </div>
            )}
            <button
              onClick={signIn}
              disabled={authBusy || !phrase}
              style={{
                width: "100%",
                background: T.accent,
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontFamily: T.font,
                fontWeight: 600,
                fontSize: 14,
                padding: "10px",
                cursor: phrase && !authBusy ? "pointer" : "not-allowed",
                opacity: phrase && !authBusy ? 1 : 0.5,
              }}
            >
              {authBusy ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100%",
          background: T.bg,
          color: T.t1,
          fontFamily: T.font,
          fontSize: 14,
          WebkitFontSmoothing: "antialiased",
          overflow: "hidden",
          letterSpacing: "-0.01em",
        }}
      >
        {/* ═══ SIDEBAR ═══ */}
        <aside
          style={{
            width: 250,
            flexShrink: 0,
            borderRight: `1px solid ${T.border}`,
            display: "flex",
            flexDirection: "column",
            background: T.sidebar,
          }}
        >
          <div
            onClick={handleSecretTap}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "13px 12px 6px",
              cursor: "default",
              userSelect: "none",
            }}
          >
            <MonoAvatar size={26} radius={7} fontSize={11} />
            <div
              style={{
                flex: 1,
                fontSize: 13.5,
                fontWeight: 550,
                color: T.t1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              Praveen Kumar
            </div>
            {isAuthor && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  signOut();
                }}
                title="Exit author mode"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  lineHeight: 1,
                  fontSize: 0,
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#5cd089",
                  }}
                />
              </button>
            )}
          </div>

          <div
            style={{
              margin: "4px 10px 8px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 30,
              padding: "0 10px",
              border: `1px solid ${T.m5}`,
              borderRadius: 8,
              color: T.t5,
              fontSize: 12.5,
              cursor: "text",
            }}
          >
            <span style={{ flex: 1 }}>Search</span>
            <span
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                border: `1px solid ${T.m4}`,
                borderRadius: 5,
                padding: "2px 5px",
                color: T.t4,
              }}
            >
              ⌘K
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 18px" }}>
            {NAV.map((group, gi) => (
              <div key={gi}>
                {group.sep && (
                  <div
                    style={{
                      height: 1,
                      background: T.border,
                      margin: "9px 8px",
                    }}
                  />
                )}
                {group.label && (
                  <div
                    style={{
                      fontFamily: T.mono,
                      fontSize: 10,
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      color: "#5b5b61",
                      padding: "8px 10px 5px",
                    }}
                  >
                    {group.label}
                  </div>
                )}
                {group.items.map((item) => {
                  const on = item.id === active;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActive(item.id)}
                      className="pk-nav-btn"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 11,
                        width: "100%",
                        textAlign: "left",
                        border: 0,
                        borderRadius: 7,
                        padding: "7px 10px",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: 13.5,
                        letterSpacing: "-0.01em",
                        lineHeight: 1.1,
                        marginBottom: 1,
                        background: on
                          ? "rgba(255,255,255,0.06)"
                          : "transparent",
                        color: on ? accentColor : T.t2,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 2,
                          flexShrink: 0,
                          background: on ? accentColor : T.t7,
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.title}
                      </span>
                      {showCodes && (
                        <span
                          style={{
                            fontFamily: T.mono,
                            fontSize: 9.5,
                            color: T.t7,
                          }}
                        >
                          {item.code}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* ═══ MAIN ═══ */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            background: T.bg,
          }}
        >
          <div
            style={{
              height: 52,
              flexShrink: 0,
              borderBottom: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
              }}
            >
              <span style={{ fontFamily: T.mono, fontSize: 12, color: T.t5 }}>
                {current.section}
              </span>
              <span style={{ color: T.t6 }}>/</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 550,
                  color: T.t1,
                  whiteSpace: "nowrap",
                }}
              >
                {current.title}
              </span>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {current.id === "products" && isAuthor && (
                <button onClick={createProduct} style={{ background: T.accent, border: "none", borderRadius: 7, color: "#fff", fontFamily: T.font, fontWeight: 600, fontSize: 12, padding: "5px 13px", cursor: "pointer" }}>
                  + New Product
                </button>
              )}
              {current.id === "experiments" && isAuthor && (
                <button onClick={createExperiment} style={{ background: T.accent, border: "none", borderRadius: 7, color: "#fff", fontFamily: T.font, fontWeight: 600, fontSize: 12, padding: "5px 13px", cursor: "pointer" }}>
                  + New Experiment
                </button>
              )}
              {showCodes && (
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 12,
                    color: T.t4,
                    letterSpacing: "0.02em",
                  }}
                >
                  {String(idx + 1).padStart(2, "0")} /{" "}
                  {String(total).padStart(2, "0")}
                </span>
              )}
              <div style={{ display: "flex", gap: 2 }}>
                <ChevronBtn dir="up" onClick={() => go(-1)} />
                <ChevronBtn dir="down" onClick={() => go(1)} />
              </div>
              {showCodes && (
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 11,
                    color: T.t4,
                    border: `1px solid ${T.m5}`,
                    borderRadius: 6,
                    padding: "3px 7px",
                  }}
                >
                  {current.code}
                </span>
              )}
              <MonoAvatar size={24} radius={6} fontSize={9.5} />
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflow:
                current.id === "knowledge" || current.id === "interview" || current.id === "products" || current.id === "experiments"
                  ? "hidden"
                  : "auto",
            }}
          >
            {current.kind === "home" ? (
              <HomeSection
                accentColor={accentColor}
                showProperties={showProperties}
              />
            ) : current.kind === "settings" ? (
              <SettingsShell>
                <SettingsView settings={settings} upd={upd} />
              </SettingsShell>
            ) : current.id === "journey" ? (
              <JourneySection
                showCodes={showCodes}
                learningLayers={learningLayers}
                toggleLearnLayer={toggleLearnLayer}
                done={journeyDone}
                toggleDone={toggleJourneyDone}
              />
            ) : current.id === "learning" ? (
              <LearningSection
                showCodes={showCodes}
                learningLayers={learningLayers}
                toggleLearnLayer={toggleLearnLayer}
                goToJourney={() => setActive("journey")}
                done={learningDone}
                toggleDone={toggleLearningDone}
              />
            ) : current.id === "knowledge" ? (
              <KnowledgeSection kdb={db} />
            ) : current.id === "interview" ? (
              <KnowledgeSection kdb={idb} />
            ) : current.id === "journal" ? (
              <JournalSection />
            ) : current.id === "products" ? (
              <ProductsSection
                products={products}
                onUpdate={updateProduct}
                onDelete={deleteProduct}
              />
            ) : current.id === "experiments" ? (
              <ExperimentsSection
                experiments={experiments}
                onUpdate={updateExperiment}
                onDelete={deleteExperiment}
              />
            ) : current.id === "progress" ? (
              <ProgressSection activity={activity} />
            ) : current.id === "resume" ? (
              <ResumeSection />
            ) : (
              <SectionShell item={current} showCodes={showCodes} />
            )}
          </div>
        </div>
      </div>
    </AuthCtx.Provider>
    </RecordCtx.Provider>
  );
}

/* ─────────────────────── Atoms ─────────────────────── */
function MonoAvatar({
  size,
  radius,
  fontSize,
}: {
  size: number;
  radius: number;
  fontSize: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        background: "linear-gradient(145deg,#202024,#121214)",
        border: "1px solid #2a2a2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: T.mono,
        fontSize,
        color: "#cfcfd2",
      }}
    >
      PK
    </div>
  );
}

function ChevronBtn({
  dir,
  onClick,
}: {
  dir: "up" | "down";
  onClick: () => void;
}) {
  const up = dir === "up";
  return (
    <button
      onClick={onClick}
      className="pk-icon-btn"
      style={{
        width: 24,
        height: 24,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: 0,
        background: "transparent",
        color: "#6a6a70",
        borderRadius: 6,
        cursor: "pointer",
      }}
    >
      <span
        style={{
          display: "block",
          width: 6,
          height: 6,
          borderRight: "1.5px solid currentColor",
          borderBottom: "1.5px solid currentColor",
          transform: up ? "rotate(225deg)" : "rotate(45deg)",
          marginTop: up ? 2 : 0,
          marginBottom: up ? 0 : 2,
        }}
      />
    </button>
  );
}

function Mono({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <span style={{ fontFamily: T.mono, ...style }}>{children}</span>;
}

/* ─────────────────────── Home ───────────────────────── */
function HomeSection({
  accentColor,
  showProperties,
}: {
  accentColor: string;
  showProperties: boolean;
}) {
  const dot = accentColor !== "#ededee" ? accentColor : "#7d7d85";
  return (
    <div style={{ display: "flex", minHeight: "100%" }}>
      <div style={{ flex: 1, padding: "48px 56px 80px", maxWidth: 740 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: T.mono,
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#5b5b61",
            marginBottom: 20,
          }}
        >
          <span>About</span>
        </div>

        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 33,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              color: "#f2f2f3",
              lineHeight: 1.05,
            }}
          >
            Praveen Kumar Kalaboina
          </h1>
          <div style={{ marginTop: 7, fontSize: 16, color: T.t2 }}>
            AI Applications Developer
          </div>
        </div>

        <p
          style={{
            margin: "30px 0 0",
            fontSize: 15.5,
            lineHeight: 1.75,
            color: T.t3,
            maxWidth: 560,
          }}
        >
          The best tools shouldn’t require expertise. I build AI applications
          that lower the barrier between ideas and execution.
        </p>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 15.5,
            lineHeight: 1.75,
            color: T.t3,
            maxWidth: 560,
          }}
        >
          Software engineer focused on building thoughtful, reliable AI products
          from the ground up.
        </p>

        <div
          style={{
            height: 1,
            background: T.border,
            margin: "36px 0",
            maxWidth: 560,
          }}
        />

        <Mono
          style={{
            fontSize: 10.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#5b5b61",
            display: "block",
            marginBottom: 12,
          }}
        >
          Currently
        </Mono>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            color: T.t3,
            fontSize: 14.5,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              flexShrink: 0,
              background: dot,
              boxShadow: "0 0 0 3px rgba(255,255,255,0.03)",
            }}
          />
          Currently transitioning into an AI Applications Engineer, starting
          with mastering Python and building production-ready AI systems.
        </div>

        <div
          style={{
            height: 1,
            background: T.border,
            margin: "36px 0",
            maxWidth: 560,
          }}
        />

        <Mono
          style={{
            fontSize: 10.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#5b5b61",
            display: "block",
            marginBottom: 14,
          }}
        >
          Focus areas
        </Mono>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 8, maxWidth: 560 }}
        >
          {currentFocus.map((f) => (
            <span
              key={f}
              style={{
                fontFamily: T.mono,
                fontSize: 11.5,
                color: T.t4,
                border: `1px solid ${T.m4}`,
                borderRadius: 6,
                padding: "4px 10px",
                background: "#0f0f11",
              }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {showProperties && (
        <aside
          style={{
            width: 268,
            flexShrink: 0,
            borderLeft: `1px solid ${T.border}`,
            padding: "48px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <Mono
            style={{
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#5b5b61",
              display: "block",
            }}
          >
            Profile
          </Mono>
          {[
            { label: "Role", value: "SDET2" },
            { label: "Company", value: "HighLevel" },
            { label: "Status", value: "Building", dot: dot },
            {
              label: "Stack",
              value:
                "TypeScript · Python · Flutter · LLMs · LangChain · LangGraph",
            },
            { label: "Location", value: "India" },
          ].map((row) => (
            <div
              key={row.label}
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <Mono
                style={{
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#5b5b61",
                  display: "block",
                }}
              >
                {row.label}
              </Mono>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13.5,
                  color: "#cfcfd2",
                }}
              >
                {"dot" in row && row.dot && (
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: row.dot,
                    }}
                  />
                )}
                {row.value}
              </div>
            </div>
          ))}
          <div>
            <Mono
              style={{
                fontSize: 10,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#5b5b61",
                display: "block",
                marginBottom: 10,
              }}
            >
              Links
            </Mono>
            {[
              {
                label: "github.com/Prav3in",
                href: "https://github.com/Prav3in",
              },
              {
                label: "linkedin/praveenkumarkalaboina",
                href: "https://www.linkedin.com/in/praveenkumarkalaboina/",
              },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="pk-link"
                style={{
                  display: "block",
                  fontSize: 12.5,
                  color: T.t4,
                  textDecoration: "none",
                  marginBottom: 6,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

/* ─────────────────────── Empty section shell ────────── */
function SectionShell({
  item,
  showCodes,
}: {
  item: NavItem;
  showCodes: boolean;
}) {
  const purposeParas = item.purpose
    ? item.purpose
        .split(/\n\n+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  return (
    <div style={{ padding: "46px 56px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: T.mono,
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#5b5b61",
            marginBottom: 16,
          }}
        >
          {showCodes && (
            <>
              <span style={{ color: "#6a6a70" }}>{item.code}</span>
              <span style={{ color: T.t6 }}>·</span>
            </>
          )}
          <span>{item.section}</span>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 27,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: T.t1,
          }}
        >
          {item.title}
        </h1>
        {purposeParas.length > 0 && (
          <div style={{ marginTop: 13, maxWidth: 760 }}>
            {purposeParas.map((para, i) => (
              <p
                key={i}
                style={{
                  margin: i > 0 ? "14px 0 0" : 0,
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: T.t2,
                }}
              >
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── Journey ───────────────────── */
function CheckBox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      style={{
        width: 14,
        height: 14,
        borderRadius: 3,
        border: checked ? "none" : "1.5px solid #484850",
        background: checked ? "#4a9eff" : "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
          <path
            d="M1 3L3 5L7 1"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function JourneySection({
  showCodes,
  learningLayers,
  toggleLearnLayer,
  done,
  toggleDone,
}: {
  showCodes: boolean;
  learningLayers: Set<string>;
  toggleLearnLayer: (id: string) => void;
  done: Set<string>;
  toggleDone: (id: string) => void;
}) {
  const isAuthor = useAuthor();
  const item = FLAT.find((i) => i.id === "journey")!;
  const [open, setOpen] = useState<Set<string>>(() => new Set(["l1"]));

  const toggleOpen = (id: string) =>
    setOpen((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div style={{ padding: "46px 56px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: T.mono,
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#5b5b61",
            marginBottom: 16,
          }}
        >
          {showCodes && (
            <>
              <span style={{ color: "#6a6a70" }}>{item.code}</span>
              <span style={{ color: T.t6 }}>·</span>
            </>
          )}
          <span>{item.section}</span>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 27,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: T.t1,
          }}
        >
          {item.title}
        </h1>
        {item.purpose && (
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 14,
              lineHeight: 1.6,
              color: T.t3,
            }}
          >
            {item.purpose}
          </p>
        )}
      </div>

      <div style={{ maxWidth: 680 }}>
        {JOURNEY_LAYERS.map((layer) => {
          const isOpen = open.has(layer.id);
          const isDone = done.has(layer.id);
          const isLearning = learningLayers.has(layer.id);
          return (
            <div
              key={layer.id}
              style={{ borderBottom: `1px solid ${T.border}` }}
            >
              <div
                className="pk-layer-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "13px 0",
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={() => toggleOpen(layer.id)}
              >
                {isAuthor && (
                  <CheckBox
                    checked={isDone}
                    onChange={() => toggleDone(layer.id)}
                  />
                )}
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: 11,
                    color: isDone ? T.t6 : "#5b5b61",
                    minWidth: 22,
                  }}
                >
                  {String(layer.num).padStart(2, "0")}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 500,
                    color: isDone ? T.t5 : T.t2,
                    fontStyle: isDone ? "italic" : "normal",
                    textDecoration: isDone ? "line-through" : "none",
                  }}
                >
                  {layer.label}
                </span>
                <span style={{ fontSize: 11, color: T.t5 }}>— {layer.sub}</span>
                {isAuthor && (
                  <button
                    className={`pk-learn-btn${isLearning ? " pk-learn-active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLearnLayer(layer.id);
                    }}
                    style={{
                      border: `1px solid ${isLearning ? "#2a4a2a" : T.m4}`,
                      background: isLearning ? "#152015" : "transparent",
                      color: isLearning ? "#5cd089" : T.t5,
                      borderRadius: 5,
                      padding: "2px 7px",
                      fontSize: 11,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontFamily: T.font,
                    }}
                  >
                    {isLearning ? "✓ Learning" : "+ Learn"}
                  </button>
                )}
                <span
                  style={{
                    color: T.t5,
                    fontSize: 11,
                    width: 12,
                    textAlign: "center",
                  }}
                >
                  {isOpen ? "▾" : "▸"}
                </span>
              </div>

              {isOpen && (
                <div style={{ paddingBottom: 16, paddingLeft: 24 }}>
                  {layer.desc && (
                    <p
                      style={{
                        fontSize: 13,
                        color: T.t4,
                        margin: "0 0 12px",
                        lineHeight: 1.55,
                      }}
                    >
                      {layer.desc}
                    </p>
                  )}
                  {layer.items.map((topic) =>
                    topic.isGroup ? (
                      <div
                        key={topic.id}
                        style={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          letterSpacing: "0.07em",
                          textTransform: "uppercase",
                          color: T.t5,
                          marginTop: 14,
                          marginBottom: 6,
                          paddingBottom: 5,
                          borderBottom: `1px solid ${T.m5}`,
                        }}
                      >
                        {topic.label}
                      </div>
                    ) : (
                      <div
                        key={topic.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "5px 0",
                        }}
                      >
                        {isAuthor && (
                          <CheckBox
                            checked={done.has(topic.id)}
                            onChange={() => toggleDone(topic.id)}
                          />
                        )}
                        <span
                          style={{
                            fontSize: 13.5,
                            color: done.has(topic.id) ? T.t5 : T.t2,
                            fontStyle: done.has(topic.id) ? "italic" : "normal",
                            textDecoration: done.has(topic.id)
                              ? "line-through"
                              : "none",
                          }}
                        >
                          {topic.label}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────── Learning section ───────────── */
function LearningSection({
  showCodes,
  learningLayers,
  toggleLearnLayer,
  goToJourney,
  done,
  toggleDone,
}: {
  showCodes: boolean;
  learningLayers: Set<string>;
  toggleLearnLayer: (id: string) => void;
  goToJourney: () => void;
  done: Set<string>;
  toggleDone: (id: string) => void;
}) {
  const isAuthor = useAuthor();
  const item = FLAT.find((i) => i.id === "learning")!;
  const [open, setOpen] = useState<Set<string>>(() => new Set(learningLayers));

  const toggleOpen = (id: string) =>
    setOpen((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const layers = JOURNEY_LAYERS.filter((l) => learningLayers.has(l.id));

  return (
    <div style={{ padding: "46px 56px 80px" }}>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: T.mono,
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#5b5b61",
            marginBottom: 16,
          }}
        >
          {showCodes && (
            <>
              <span style={{ color: "#6a6a70" }}>{item.code}</span>
              <span style={{ color: T.t6 }}>·</span>
            </>
          )}
          <span>{item.section}</span>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 27,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: T.t1,
          }}
        >
          {item.title}
        </h1>
      </div>

      {layers.length === 0 ? (
        <div
          style={{
            maxWidth: 480,
            padding: "32px 36px",
            border: `1px dashed ${T.m4}`,
            borderRadius: 10,
            color: T.t4,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          <p style={{ margin: "0 0 10px", color: T.t3 }}>Nothing here yet.</p>
          <p style={{ margin: 0 }}>
            Go to{" "}
            <button
              onClick={goToJourney}
              style={{
                background: "none",
                border: "none",
                color: "#6e9bff",
                cursor: "pointer",
                fontSize: 14,
                padding: 0,
                fontFamily: T.font,
              }}
            >
              Journey
            </button>{" "}
            and click <span style={{ color: T.t2 }}>+ Learn</span> on any layer
            to track it here.
          </p>
        </div>
      ) : (
        <div style={{ maxWidth: 680 }}>
          {layers.map((layer) => {
            const isOpen = open.has(layer.id);
            return (
              <div
                key={layer.id}
                style={{ borderBottom: `1px solid ${T.border}` }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "13px 0",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                  onClick={() => toggleOpen(layer.id)}
                >
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: 11,
                      color: "#5b5b61",
                      minWidth: 22,
                    }}
                  >
                    {String(layer.num).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      fontWeight: 500,
                      color: T.t2,
                    }}
                  >
                    {layer.label}
                  </span>
                  <span style={{ fontSize: 11, color: T.t5 }}>
                    — {layer.sub}
                  </span>
                  {isAuthor && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLearnLayer(layer.id);
                      }}
                      style={{
                        border: `1px solid ${T.m4}`,
                        background: "transparent",
                        color: T.t5,
                        borderRadius: 5,
                        padding: "2px 7px",
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: T.font,
                      }}
                    >
                      Remove
                    </button>
                  )}
                  <span
                    style={{
                      color: T.t5,
                      fontSize: 11,
                      width: 12,
                      textAlign: "center",
                    }}
                  >
                    {isOpen ? "▾" : "▸"}
                  </span>
                </div>

                {isOpen && (
                  <div style={{ paddingBottom: 16, paddingLeft: 24 }}>
                    {layer.desc && (
                      <p
                        style={{
                          fontSize: 13,
                          color: T.t4,
                          margin: "0 0 12px",
                          lineHeight: 1.55,
                        }}
                      >
                        {layer.desc}
                      </p>
                    )}
                    {layer.items.map((topic) =>
                      topic.isGroup ? (
                        <div
                          key={topic.id}
                          style={{
                            fontSize: 10.5,
                            fontWeight: 600,
                            letterSpacing: "0.07em",
                            textTransform: "uppercase",
                            color: T.t5,
                            marginTop: 14,
                            marginBottom: 6,
                            paddingBottom: 5,
                            borderBottom: `1px solid ${T.m5}`,
                          }}
                        >
                          {topic.label}
                        </div>
                      ) : (
                        <div
                          key={topic.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "5px 0",
                          }}
                        >
                          {isAuthor && (
                            <CheckBox
                              checked={done.has(topic.id)}
                              onChange={() => toggleDone(topic.id)}
                            />
                          )}
                          <span
                            style={{
                              fontSize: 13.5,
                              color: done.has(topic.id) ? T.t5 : T.t2,
                              fontStyle: done.has(topic.id)
                                ? "italic"
                                : "normal",
                              textDecoration: done.has(topic.id)
                                ? "line-through"
                                : "none",
                            }}
                          >
                            {topic.label}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Settings shell ─────────────── */
function SettingsShell({ children }: { children: React.ReactNode }) {
  const item = FLAT.find((i) => i.id === "settings")!;
  return (
    <div style={{ padding: "46px 56px 80px", maxWidth: 960 }}>
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: T.mono,
            fontSize: 11,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#5b5b61",
            marginBottom: 16,
          }}
        >
          <span style={{ color: "#6a6a70" }}>{item.code}</span>
          <span style={{ color: T.t6 }}>·</span>
          <span>{item.section}</span>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 27,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: T.t1,
          }}
        >
          {item.title}
        </h1>
        <p
          style={{
            margin: "13px 0 0",
            fontSize: 16,
            lineHeight: 1.6,
            color: T.t2,
            maxWidth: 580,
          }}
        >
          {item.purpose}
        </p>
      </div>
      {children}
    </div>
  );
}

/* ─────────────────────── Settings ──────────────────── */
const ACCENT_OPTIONS: { key: AccentKey; color: string; label: string }[] = [
  { key: "none", color: "#5d5d63", label: "None" },
  { key: "blue", color: "#6e9bff", label: "Blue" },
  { key: "amber", color: "#f3c34e", label: "Amber" },
  { key: "green", color: "#5cd089", label: "Green" },
  { key: "violet", color: "#9b8cff", label: "Violet" },
];

function SettingsView({
  settings,
  upd,
}: {
  settings: AppSettings;
  upd: (p: Partial<AppSettings>) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 32,
        maxWidth: 520,
      }}
    >
      <div>
        <Mono
          style={{
            fontSize: 10.5,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#5b5b61",
            display: "block",
            marginBottom: 14,
          }}
        >
          Accent color
        </Mono>
        <div style={{ display: "flex", gap: 8 }}>
          {ACCENT_OPTIONS.map((opt) => {
            const on = settings.accent === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => upd({ accent: opt.key })}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 7,
                  border: `1px solid ${on ? opt.color : T.m4}`,
                  borderRadius: 9,
                  padding: "10px 14px",
                  cursor: "pointer",
                  background: on ? `${opt.color}12` : "#0d0d0f",
                  fontFamily: "inherit",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: opt.color,
                  }}
                />
                <Mono style={{ fontSize: 10, color: T.t5 }}>{opt.label}</Mono>
              </button>
            );
          })}
        </div>
      </div>

      <div
        style={{
          border: `1px solid ${T.m5}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {(
          [
            {
              label: "Show section codes",
              sub: "Display PK-XXX identifiers in the sidebar and header.",
              key: "showCodes" as const,
            },
            {
              label: "Show properties panel",
              sub: "Show the properties sidebar on the home screen.",
              key: "showProperties" as const,
            },
          ] as const
        ).map((row, i) => (
          <div
            key={row.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 18px",
              borderBottom: i === 0 ? `1px solid ${T.border}` : undefined,
            }}
          >
            <div>
              <div style={{ fontSize: 13.5, color: T.t1, marginBottom: 3 }}>
                {row.label}
              </div>
              <div style={{ fontSize: 12, color: T.t5 }}>{row.sub}</div>
            </div>
            <button
              onClick={() => upd({ [row.key]: !settings[row.key] })}
              style={{
                width: 42,
                height: 24,
                borderRadius: 12,
                border: 0,
                cursor: "pointer",
                flexShrink: 0,
                marginLeft: 20,
                background: settings[row.key] ? "#3a7afd" : T.m4,
                position: "relative",
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: settings[row.key] ? 21 : 3,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PRODUCTS  — FlowingMenu
   ══════════════════════════════════════════════════════ */

/* ── Section / block helpers ── */
const SECTION_ORDER: PSectionType[] = ["architecture", "decisions", "mistakes"];
const SECTION_META: Record<
  PSectionType,
  { label: string; icon: string; hasMermaid: boolean }
> = {
  architecture: { label: "Architecture", icon: "", hasMermaid: true },
  decisions: { label: "Decisions", icon: "", hasMermaid: false },
  mistakes: { label: "Mistakes", icon: "", hasMermaid: false },
};

function pDefaultContent(type: PBlockType): Record<string, unknown> {
  if (type === "image") return { url: "", caption: "" };
  if (type === "link") return { href: "", label: "" };
  if (type === "mermaid") return { code: "" };
  return { text: "" };
}

const P_BASE_ITEMS = [
  { type: "paragraph" as PBlockType, icon: "T", label: "Text", hint: "" },
  { type: "h1" as PBlockType, icon: "H₁", label: "Heading 1", hint: "#" },
  { type: "h2" as PBlockType, icon: "H₂", label: "Heading 2", hint: "##" },
  { type: "h3" as PBlockType, icon: "H₃", label: "Heading 3", hint: "###" },
  { type: "image" as PBlockType, icon: "⬜", label: "Image", hint: "" },
  { type: "link" as PBlockType, icon: "↗", label: "Link", hint: "" },
];
const P_MERMAID_ITEM = {
  type: "mermaid" as PBlockType,
  icon: "⬡",
  label: "Mermaid",
  hint: "diagram",
};

/* ── Mermaid renderer ── */
let _mermaidReady = false;
async function getMermaid() {
  const m = (await import("mermaid")).default;
  if (!_mermaidReady) {
    m.initialize({ startOnLoad: false, theme: "dark" });
    _mermaidReady = true;
  }
  return m;
}

function MermaidBlock({
  code,
  onChange,
  readOnly,
}: {
  code: string;
  onChange: (c: string) => void;
  readOnly: boolean;
}) {
  const [editing, setEditing] = useState(!code);
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState("");
  const uid = useRef(`mmd-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (!code || editing) {
      setSvg("");
      return;
    }
    getMermaid().then(async (m) => {
      try {
        const r = await m.render(uid.current, code);
        setSvg(r.svg);
        setErr("");
      } catch {
        setErr("Invalid Mermaid syntax");
        setSvg("");
      }
    });
  }, [code, editing]);

  if (editing || !code)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          placeholder={"graph TD\n  A[Start] --> B[End]"}
          style={{
            width: "100%",
            minHeight: 120,
            background: "#111113",
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            color: T.t2,
            fontFamily: T.mono,
            fontSize: 13,
            padding: "12px",
            outline: "none",
            resize: "vertical",
            lineHeight: 1.6,
          }}
        />
        {code && (
          <button
            onClick={() => setEditing(false)}
            style={{
              alignSelf: "flex-start",
              background: T.m5,
              border: `1px solid ${T.m4}`,
              borderRadius: 6,
              color: T.t3,
              fontFamily: T.font,
              fontSize: 12,
              padding: "5px 12px",
              cursor: "pointer",
            }}
          >
            Render diagram
          </button>
        )}
      </div>
    );

  if (err)
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ color: "#ff6b6b", fontSize: 13 }}>{err}</div>
        {!readOnly && (
          <button
            onClick={() => setEditing(true)}
            style={{
              alignSelf: "flex-start",
              background: "none",
              border: `1px solid ${T.m4}`,
              borderRadius: 6,
              color: T.t4,
              fontFamily: T.font,
              fontSize: 12,
              padding: "5px 12px",
              cursor: "pointer",
            }}
          >
            Edit code
          </button>
        )}
      </div>
    );

  return (
    <div
      onClick={() => !readOnly && setEditing(true)}
      title={readOnly ? "" : "Click to edit"}
      style={{
        cursor: readOnly ? "default" : "pointer",
        padding: "8px 0",
        overflowX: "auto",
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/* ── PSlashPicker ── */
function PSlashPicker({
  search,
  anchorRect,
  hasMermaid,
  onSelect,
  onClose,
}: {
  search: string;
  anchorRect: DOMRect | null;
  hasMermaid: boolean;
  onSelect: (t: PBlockType, cleaned: string) => void;
  onClose: () => void;
}) {
  const [cursor, setCursor] = useState(0);
  const items = hasMermaid ? [...P_BASE_ITEMS, P_MERMAID_ITEM] : P_BASE_ITEMS;
  const filtered = search
    ? items.filter((i) => i.label.toLowerCase().includes(search.toLowerCase()))
    : items;

  useEffect(() => {
    setCursor(0);
  }, [search]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[cursor]) onSelect(filtered[cursor].type, "");
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", h, true);
    return () => window.removeEventListener("keydown", h, true);
  }, [filtered, cursor, onSelect, onClose]);

  const top = anchorRect
    ? Math.min(anchorRect.bottom + 6, window.innerHeight - 300)
    : 200;
  const left = anchorRect ? anchorRect.left : 200;
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 299 }}
      />
      <div
        style={{
          position: "fixed",
          top,
          left,
          zIndex: 300,
          background: "#18181b",
          border: "1px solid #2a2a2e",
          borderRadius: 10,
          width: 240,
          maxHeight: 320,
          overflowY: "auto",
          boxShadow: "0 16px 48px rgba(0,0,0,0.75)",
          padding: 6,
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: "10px 12px", color: T.t5, fontSize: 13 }}>
            No results
          </div>
        ) : (
          filtered.map((item, i) => (
            <button
              key={item.type}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(item.type, "")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                background:
                  cursor === i ? "rgba(255,255,255,0.07)" : "transparent",
                border: "none",
                borderRadius: 7,
                padding: "7px 10px",
                cursor: "pointer",
                fontFamily: T.font,
                textAlign: "left" as const,
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#252528",
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.t3,
                  flexShrink: 0,
                  fontFamily: T.mono,
                }}
              >
                {item.icon}
              </span>
              <span style={{ flex: 1, fontSize: 13.5, color: T.t2 }}>
                {item.label}
              </span>
              {item.hint && (
                <span style={{ fontSize: 10, color: T.t5, fontFamily: T.mono }}>
                  {item.hint}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </>
  );
}

/* ── PTextArea ── */
function PTextArea({
  value,
  placeholder,
  style,
  hasMermaid,
  onSave,
  onSlashSelect,
}: {
  value: string;
  placeholder?: string;
  style?: React.CSSProperties;
  hasMermaid: boolean;
  onSave: (v: string) => void;
  onSlashSelect: (type: PBlockType, cleaned: string) => void;
}) {
  const [val, setVal] = useState(value);
  const [picker, setPicker] = useState<{
    search: string;
    rect: DOMRect | null;
  } | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [val]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setVal(v);
    const si = v.lastIndexOf("/");
    if (si !== -1 && (si === 0 || v[si - 1] === "\n"))
      setPicker({
        search: v.slice(si + 1),
        rect: ref.current?.getBoundingClientRect() ?? null,
      });
    else setPicker(null);
  };

  return (
    <>
      <textarea
        ref={ref}
        value={val}
        onChange={handleChange}
        onBlur={() => {
          onSave(val);
          setPicker(null);
        }}
        placeholder={placeholder}
        rows={1}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          outline: "none",
          resize: "none",
          overflow: "hidden",
          fontFamily: T.font,
          ...style,
        }}
      />
      {picker && (
        <PSlashPicker
          search={picker.search}
          anchorRect={picker.rect}
          hasMermaid={hasMermaid}
          onSelect={(type, _) => {
            const si = val.lastIndexOf("/");
            const cleaned = si !== -1 ? val.slice(0, si) : val;
            setPicker(null);
            onSlashSelect(type, cleaned);
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </>
  );
}

/* ── PBlockEditor ── */
function PBlockEditor({
  block,
  isFirst,
  isLast,
  hasMermaid,
  readOnly,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddAfter,
}: {
  block: PBlock;
  isFirst: boolean;
  isLast: boolean;
  hasMermaid: boolean;
  readOnly: boolean;
  onChange: (
    id: string,
    patch: { type?: PBlockType; content?: Record<string, unknown> },
  ) => void;
  onDelete: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddAfter: (type: PBlockType) => void;
}) {
  const str = (k: string) => (block.content[k] as string) ?? "";
  const set = (k: string, v: unknown) =>
    onChange(block.id, { content: { ...block.content, [k]: v } });

  const handleSlash = (type: PBlockType, cleaned: string) => {
    if (cleaned.trim() === "")
      onChange(block.id, { type, content: pDefaultContent(type) });
    else {
      onChange(block.id, { content: { ...block.content, text: cleaned } });
      onAddAfter(type);
    }
  };

  const isText = ["paragraph", "h1", "h2", "h3"].includes(block.type);
  const textStyle: React.CSSProperties =
    block.type === "h1"
      ? {
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: T.t1,
          lineHeight: 1.2,
        }
      : block.type === "h2"
        ? { fontSize: 20, fontWeight: 650, color: T.t1, lineHeight: 1.3 }
        : block.type === "h3"
          ? { fontSize: 16, fontWeight: 600, color: T.t1, lineHeight: 1.4 }
          : { fontSize: 15, lineHeight: 1.75, color: T.t2 };

  const ctrl = !readOnly ? (
    <div
      className="pk-block-ctrl"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        paddingTop: 4,
        opacity: 0,
        transition: "opacity 0.1s",
        flexShrink: 0,
      }}
    >
      <button onClick={onMoveUp} disabled={isFirst} style={KS.ctrlBtn}>
        ↑
      </button>
      <button onClick={onMoveDown} disabled={isLast} style={KS.ctrlBtn}>
        ↓
      </button>
      <button
        onClick={() => onDelete(block.id)}
        style={{ ...KS.ctrlBtn, color: "#ff6b6b" }}
      >
        ×
      </button>
    </div>
  ) : null;

  return (
    <div
      className="pk-block"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "2px 0",
      }}
    >
      {ctrl}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isText && (
          <PTextArea
            value={str("text")}
            placeholder={
              block.type === "paragraph"
                ? "Type '/' for commands…"
                : block.type.toUpperCase()
            }
            style={textStyle}
            hasMermaid={hasMermaid}
            onSave={(v) => set("text", v)}
            onSlashSelect={handleSlash}
          />
        )}
        {block.type === "mermaid" && (
          <MermaidBlock
            code={str("code")}
            onChange={(c) => set("code", c)}
            readOnly={readOnly}
          />
        )}
        {block.type === "image" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {!readOnly && (
              <input
                defaultValue={str("url")}
                placeholder="Image URL…"
                style={KS.fieldInput}
                onBlur={(e) => set("url", e.target.value)}
              />
            )}
            {str("url") && (
              <img
                src={str("url")}
                alt={str("caption")}
                style={{
                  maxWidth: "100%",
                  maxHeight: 400,
                  borderRadius: 8,
                  objectFit: "cover",
                }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            {str("url") && !readOnly && (
              <input
                defaultValue={str("caption")}
                placeholder="Caption…"
                style={{ ...KS.fieldInput, fontSize: 12, color: T.t4 }}
                onBlur={(e) => set("caption", e.target.value)}
              />
            )}
          </div>
        )}
        {block.type === "link" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {!readOnly && (
              <>
                <input
                  defaultValue={str("label")}
                  placeholder="Link title…"
                  style={KS.fieldInput}
                  onBlur={(e) => set("label", e.target.value)}
                />
                <input
                  defaultValue={str("href")}
                  placeholder="https://…"
                  style={{ ...KS.fieldInput, fontFamily: T.mono, fontSize: 12 }}
                  onBlur={(e) => set("href", e.target.value)}
                />
              </>
            )}
            {str("href") && (
              <a
                href={str("href")}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13,
                  color: "#6e9bff",
                  textDecoration: "none",
                }}
              >
                {str("label") || str("href")} ↗
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── ProductSectionEditor ── one section with its blocks */
function ProductSectionEditor({
  section,
  onChange,
  readOnly,
}: {
  section: PSection;
  onChange: (s: PSection) => void;
  readOnly: boolean;
}) {
  const meta = SECTION_META[section.type];
  const [collapsed, setCollapsed] = useState(false);

  const seed: PBlock = { id: "seed", type: "paragraph", content: { text: "" } };
  const blocks = section.blocks.length > 0 ? section.blocks : [seed];

  const upd = (
    id: string,
    patch: { type?: PBlockType; content?: Record<string, unknown> },
  ) =>
    onChange({
      ...section,
      blocks: blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    });

  const del = (id: string) => {
    const rem = blocks.filter((b) => b.id !== id);
    onChange({
      ...section,
      blocks:
        rem.length > 0
          ? rem
          : [
              {
                id: crypto.randomUUID(),
                type: "paragraph",
                content: { text: "" },
              },
            ],
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    const i = blocks.findIndex((b) => b.id === id);
    if (i + dir < 0 || i + dir >= blocks.length) return;
    const n = [...blocks];
    [n[i], n[i + dir]] = [n[i + dir], n[i]];
    onChange({ ...section, blocks: n });
  };

  const addAfter = (afterId: string, type: PBlockType) => {
    const i = blocks.findIndex((b) => b.id === afterId);
    const nb: PBlock = {
      id: crypto.randomUUID(),
      type,
      content: pDefaultContent(type),
    };
    onChange({
      ...section,
      blocks: [...blocks.slice(0, i + 1), nb, ...blocks.slice(i + 1)],
    });
  };

  return (
    <div
      style={{
        borderTop: `1px solid ${T.border}`,
        marginTop: 32,
        paddingTop: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: collapsed ? 0 : 20,
          cursor: "pointer",
          userSelect: "none" as const,
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span style={{ fontSize: 16 }}>{meta.icon}</span>
        <span
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: T.t1,
            letterSpacing: "-0.01em",
          }}
        >
          {meta.label}
        </span>
        <span style={{ fontSize: 11, color: T.t5, marginLeft: "auto" }}>
          {collapsed ? "▸" : "▾"}
        </span>
      </div>
      {!collapsed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {blocks.map((block, i) => (
            <PBlockEditor
              key={block.id}
              block={block}
              isFirst={i === 0}
              isLast={i === blocks.length - 1}
              hasMermaid={meta.hasMermaid}
              readOnly={readOnly}
              onChange={upd}
              onDelete={del}
              onMoveUp={() => move(block.id, -1)}
              onMoveDown={() => move(block.id, 1)}
              onAddAfter={(type) => addAfter(block.id, type)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── ProductPage ── full detail view */
function ProductPage({
  product,
  onUpdate,
  onClose,
  onDelete,
}: {
  product: Product;
  onUpdate: (patch: Partial<Product>) => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const isAuthor = useAuthor();
  const sections = (product.sections || [])
    .slice()
    .sort(
      (a, b) => SECTION_ORDER.indexOf(a.type) - SECTION_ORDER.indexOf(b.type),
    );
  const existingTypes = new Set(sections.map((s) => s.type));
  const available = SECTION_ORDER.filter((t) => !existingTypes.has(t));
  const [showPicker, setShowPicker] = useState(false);
  const [desc, setDesc] = useState(product.description || "");

  const addSection = (type: PSectionType) => {
    const ns: PSection = {
      type,
      blocks: [
        { id: crypto.randomUUID(), type: "paragraph", content: { text: "" } },
      ],
    };
    const all = [...sections.filter((s) => s.type !== type), ns].sort(
      (a, b) => SECTION_ORDER.indexOf(a.type) - SECTION_ORDER.indexOf(b.type),
    );
    onUpdate({ sections: all });
    setShowPicker(false);
  };

  const removeSection = (type: PSectionType) =>
    onUpdate({ sections: sections.filter((s) => s.type !== type) });

  const updateSection = (updated: PSection) =>
    onUpdate({
      sections: sections.map((s) => (s.type === updated.type ? updated : s)),
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: T.t4,
            cursor: "pointer",
            fontFamily: T.font,
            fontSize: 13,
          }}
        >
          ← Products
        </button>
        {isAuthor && (
          <button
            onClick={onDelete}
            style={{
              background: "none",
              border: "none",
              color: "#ff6b6b",
              cursor: "pointer",
              fontFamily: T.font,
              fontSize: 13,
            }}
          >
            Delete
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "48px 72px 100px" }}>
        <div style={{ maxWidth: 720 }}>
          {/* Cover */}
          {product.image && (
            <div
              style={{
                marginBottom: 32,
                borderRadius: 12,
                overflow: "hidden",
                height: 200,
              }}
            >
              <img
                src={product.image}
                alt={product.text}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          {/* Title */}
          {isAuthor ? (
            <input
              defaultValue={product.text}
              onBlur={(e) => onUpdate({ text: e.target.value || "Untitled" })}
              style={{
                ...KS.inputBase,
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: T.t1,
                marginBottom: 16,
                display: "block",
              }}
            />
          ) : (
            <h1
              style={{
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: T.t1,
                marginBottom: 16,
                fontFamily: T.font,
              }}
            >
              {product.text}
            </h1>
          )}

          {/* Description */}
          {isAuthor ? (
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onBlur={() => onUpdate({ description: desc })}
              placeholder="Add a description…"
              rows={1}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = t.scrollHeight + "px";
              }}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                overflow: "hidden",
                color: T.t3,
                fontFamily: T.font,
                fontSize: 15,
                lineHeight: 1.75,
                marginBottom: 20,
              }}
            />
          ) : (
            product.description && (
              <p
                style={{
                  fontSize: 15,
                  lineHeight: 1.75,
                  color: T.t3,
                  marginBottom: 20,
                  fontFamily: T.font,
                }}
              >
                {product.description}
              </p>
            )
          )}

          {/* Link */}
          {isAuthor ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 36,
              }}
            >
              <input
                defaultValue={product.link}
                placeholder="https://…"
                style={{
                  ...KS.fieldInput,
                  flex: 1,
                  fontFamily: T.mono,
                  fontSize: 12,
                }}
                onBlur={(e) => onUpdate({ link: e.target.value })}
              />
              {product.link && product.link !== "#" && (
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13,
                    color: "#6e9bff",
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Open ↗
                </a>
              )}
            </div>
          ) : (
            product.link &&
            product.link !== "#" && (
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: T.accent,
                  color: "#fff",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                  marginBottom: 36,
                }}
              >
                Visit product ↗
              </a>
            )
          )}

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.type} style={{ position: "relative" }}>
              {isAuthor && (
                <button
                  onClick={() => removeSection(section.type)}
                  title="Remove section"
                  style={{
                    position: "absolute",
                    top: 28,
                    right: 0,
                    background: "none",
                    border: "none",
                    color: "#ff6b6b",
                    cursor: "pointer",
                    fontSize: 13,
                    opacity: 0,
                    transition: "opacity 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                >
                  × Remove
                </button>
              )}
              <ProductSectionEditor
                section={section}
                onChange={updateSection}
                readOnly={!isAuthor}
              />
            </div>
          ))}

          {/* Add section */}
          {isAuthor && available.length > 0 && (
            <div style={{ marginTop: 32, position: "relative" }}>
              <button
                onClick={() => setShowPicker((p) => !p)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: `1px dashed ${T.m4}`,
                  borderRadius: 8,
                  color: T.t4,
                  fontFamily: T.font,
                  fontSize: 13,
                  padding: "10px 18px",
                  cursor: "pointer",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                + Add section
              </button>
              {showPicker && (
                <>
                  <div
                    onClick={() => setShowPicker(false)}
                    style={{ position: "fixed", inset: 0, zIndex: 99 }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "100%",
                      left: 0,
                      marginBottom: 6,
                      zIndex: 100,
                      background: "#18181b",
                      border: "1px solid #2a2a2e",
                      borderRadius: 10,
                      padding: 6,
                      minWidth: 200,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                    }}
                  >
                    {available.map((type) => (
                      <button
                        key={type}
                        onClick={() => addSection(type)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          borderRadius: 7,
                          padding: "8px 12px",
                          color: T.t2,
                          fontFamily: T.font,
                          fontSize: 13,
                          cursor: "pointer",
                          textAlign: "left" as const,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(255,255,255,0.05)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <span style={{ fontSize: 16 }}>
                          {SECTION_META[type].icon}
                        </span>
                        {SECTION_META[type].label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Cover / image edit for author */}
          {isAuthor && (
            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop: `1px solid ${T.m5}`,
              }}
            >
              <div style={{ fontSize: 11, color: T.t5, marginBottom: 6 }}>
                Cover image URL
              </div>
              <input
                defaultValue={product.image}
                placeholder="https://…"
                style={KS.fieldInput}
                onBlur={(e) => onUpdate({ image: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── ProductsSection ── */
function ProductsSection({
  products,
  onUpdate,
  onDelete,
}: {
  products: Product[];
  onUpdate: (id: string, patch: Partial<Product>) => void;
  onDelete: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = products.find((p) => p.id === selectedId);

  if (selected)
    return (
      <ProductPage
        product={selected}
        onUpdate={(patch) => onUpdate(selected.id, patch)}
        onClose={() => setSelectedId(null)}
        onDelete={() => {
          onDelete(selected.id);
          setSelectedId(null);
        }}
      />
    );

  return (
    <div style={{ height: "100%", position: "relative" }}>
      <FlowingMenu
        items={products}
        speed={15}
        textColor="#ededee"
        bgColor="#0a0a0b"
        marqueeBgColor="#ededee"
        marqueeTextColor="#0a0a0b"
        borderColor="#1e1e22"
        onItemClick={(idx: number) => setSelectedId(products[idx].id)}
      />
    </div>
  );
}

/* ── ExperimentsSection ── */
function ExperimentsSection({ experiments, onUpdate, onDelete }: {
  experiments: Experiment[];
  onUpdate: (id: string, patch: Partial<Experiment>) => void;
  onDelete: (id: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = experiments.find(e => e.id === selectedId);

  if (selected) return (
    <ProductPage
      product={selected}
      onUpdate={patch => onUpdate(selected.id, patch as Partial<Experiment>)}
      onClose={() => setSelectedId(null)}
      onDelete={() => { onDelete(selected.id); setSelectedId(null); }}
    />
  );

  const masonryItems = experiments.map(e => ({ id: e.id, img: e.image || `https://picsum.photos/600/400?random=${e.id}`, url: e.link || '#', height: e.height }));

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px 28px 80px' }}>
      <Masonry
        items={masonryItems}
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        animateFrom="bottom"
        scaleOnHover
        hoverScale={0.95}
        blurToFocus
        colorShiftOnHover={false}
        onItemClick={(idx: number) => setSelectedId(experiments[idx].id)}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   KNOWLEDGE  — Notion-style slash-command editor
   ══════════════════════════════════════════════════════ */

/* ── Style helpers ── */
const KS = {
  inputBase: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: T.t2,
    fontFamily: T.font,
    width: "100%",
  } as React.CSSProperties,
  cell: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: T.t2,
    fontFamily: T.font,
    fontSize: 13,
    padding: "6px 10px",
    width: "100%",
  } as React.CSSProperties,
  fieldInput: {
    width: "100%",
    background: "#111113",
    border: `1px solid ${T.border}`,
    borderRadius: 6,
    color: T.t2,
    fontFamily: T.font,
    fontSize: 13,
    padding: "7px 10px",
    outline: "none",
  } as React.CSSProperties,
  ctrlBtn: {
    background: "none",
    border: "none",
    color: T.t5,
    cursor: "pointer",
    fontSize: 12,
    padding: "2px 5px",
    borderRadius: 4,
    lineHeight: 1,
    fontFamily: T.font,
  } as React.CSSProperties,
  menuItem: {
    display: "block",
    width: "100%",
    background: "none",
    border: "none",
    color: T.t2,
    cursor: "pointer",
    padding: "7px 10px",
    borderRadius: 6,
    fontSize: 13,
    textAlign: "left",
    fontFamily: T.font,
  } as React.CSSProperties,
};

const textBlockStyle = (type: KBlockType): React.CSSProperties => {
  if (type === "h1")
    return {
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: "-0.02em",
      color: T.t1,
      lineHeight: 1.2,
    };
  if (type === "h2")
    return {
      fontSize: 22,
      fontWeight: 650,
      letterSpacing: "-0.015em",
      color: T.t1,
      lineHeight: 1.3,
    };
  if (type === "h3")
    return { fontSize: 17, fontWeight: 600, color: T.t1, lineHeight: 1.4 };
  return { fontSize: 15, lineHeight: 1.75, color: T.t2 };
};

/* ── Block registry ── */
const BLOCK_GROUPS: {
  label: string;
  items: { type: KBlockType; icon: string; label: string; hint: string }[];
}[] = [
  {
    label: "Basic blocks",
    items: [
      { type: "paragraph", icon: "T", label: "Text", hint: "" },
      { type: "h1", icon: "H₁", label: "Heading 1", hint: "#" },
      { type: "h2", icon: "H₂", label: "Heading 2", hint: "##" },
      { type: "h3", icon: "H₃", label: "Heading 3", hint: "###" },
    ],
  },
  {
    label: "Media",
    items: [
      { type: "image", icon: "⬜", label: "Image", hint: "" },
      { type: "link", icon: "↗", label: "Link", hint: "" },
    ],
  },
  {
    label: "Layout",
    items: [
      { type: "table", icon: "⊞", label: "Table", hint: "" },
      { type: "divider", icon: "—", label: "Divider", hint: "---" },
    ],
  },
  {
    label: "Pages",
    items: [
      {
        type: "page" as KBlockType,
        icon: "📄",
        label: "Page",
        hint: "sub-page",
      },
    ],
  },
];

const ALL_BLOCK_ITEMS = BLOCK_GROUPS.flatMap((g) => g.items);

/* ── Slash command picker ── */
function KSlashPicker({
  search,
  anchorRect,
  onSelect,
  onClose,
}: {
  search: string;
  anchorRect: DOMRect | null;
  onSelect: (t: KBlockType, cleanedText: string) => void;
  onClose: () => void;
}) {
  const [cursor, setCursor] = useState(0);

  const filtered = search
    ? ALL_BLOCK_ITEMS.filter((i) =>
        i.label.toLowerCase().includes(search.toLowerCase()),
      )
    : ALL_BLOCK_ITEMS;

  useEffect(() => {
    setCursor(0);
  }, [search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[cursor]) onSelect(filtered[cursor].type, "");
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [filtered, cursor, onSelect, onClose]);

  const top = anchorRect
    ? Math.min(anchorRect.bottom + 6, window.innerHeight - 360)
    : 200;
  const left = anchorRect ? anchorRect.left : 200;

  // Build display groups preserving global cursor index
  const displayGroups = (
    search ? [{ label: "Results", items: filtered }] : BLOCK_GROUPS
  ).map((group, gi, arr) => ({
    ...group,
    startIdx: arr.slice(0, gi).reduce((s, g) => s + g.items.length, 0),
  }));

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 299 }}
      />
      <div
        style={{
          position: "fixed",
          top,
          left,
          zIndex: 300,
          background: "#18181b",
          border: `1px solid #2a2a2e`,
          borderRadius: 10,
          width: 270,
          maxHeight: 380,
          overflowY: "auto",
          boxShadow: "0 16px 48px rgba(0,0,0,0.75)",
          padding: 6,
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: "10px 12px", color: T.t5, fontSize: 13 }}>
            No results for "{search}"
          </div>
        ) : (
          displayGroups.map((group) => (
            <div key={group.label}>
              <div
                style={{
                  padding: "6px 10px 3px",
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase" as const,
                  color: T.t5,
                }}
              >
                {group.label}
              </div>
              {group.items.map((item, i) => {
                const gi = group.startIdx + i;
                return (
                  <button
                    key={item.type}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onSelect(item.type, "")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      background:
                        cursor === gi
                          ? "rgba(255,255,255,0.07)"
                          : "transparent",
                      border: "none",
                      borderRadius: 7,
                      padding: "7px 10px",
                      cursor: "pointer",
                      fontFamily: T.font,
                      textAlign: "left" as const,
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#252528",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        color: T.t3,
                        flexShrink: 0,
                        fontFamily: T.mono,
                      }}
                    >
                      {item.icon}
                    </span>
                    <span style={{ flex: 1, fontSize: 13.5, color: T.t2 }}>
                      {item.label}
                    </span>
                    {item.hint && (
                      <span
                        style={{
                          fontSize: 10,
                          color: T.t5,
                          fontFamily: T.mono,
                        }}
                      >
                        {item.hint}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))
        )}
        <div
          style={{
            borderTop: `1px solid ${T.m5}`,
            marginTop: 4,
            padding: "5px 10px",
          }}
        >
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: T.t5,
              cursor: "pointer",
              fontSize: 12,
              fontFamily: T.font,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Close menu
            <span
              style={{
                padding: "1px 5px",
                background: T.m5,
                borderRadius: 4,
                fontSize: 10,
                fontFamily: T.mono,
                color: T.t4,
              }}
            >
              esc
            </span>
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Auto-resize textarea with slash command detection ── */
function KTextArea({
  value,
  placeholder,
  style,
  onSave,
  onSlashSelect,
}: {
  value: string;
  placeholder: string;
  style?: React.CSSProperties;
  onSave: (v: string) => void;
  onSlashSelect: (type: KBlockType, cleanedText: string) => void;
}) {
  const [local, setLocal] = useState(value);
  const [slashState, setSlashState] = useState<{
    search: string;
    anchor: DOMRect;
  } | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const resize = () => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  };
  useEffect(() => {
    resize();
  }, [local]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocal(val);

    // Detect `/` at start of line or start of block
    const cursor = e.target.selectionStart ?? 0;
    const before = val.slice(0, cursor);
    const slashPos = before.lastIndexOf("/");
    if (slashPos !== -1 && (slashPos === 0 || before[slashPos - 1] === "\n")) {
      const after = before.slice(slashPos + 1);
      if (!after.includes(" ") && !after.includes("\n")) {
        const rect = ref.current?.getBoundingClientRect() ?? null;
        if (rect) {
          setSlashState({ search: after, anchor: rect });
          return;
        }
      }
    }
    setSlashState(null);
  };

  const handleSlashSelect = (type: KBlockType) => {
    // Strip /search from the text
    const cursor = ref.current?.selectionStart ?? local.length;
    const before = local.slice(0, cursor);
    const slashPos = before.lastIndexOf("/");
    const cleaned =
      slashPos !== -1 ? local.slice(0, slashPos) + local.slice(cursor) : local;
    setLocal(cleaned);
    setSlashState(null);
    onSave(cleaned);
    onSlashSelect(type, cleaned);
  };

  return (
    <div style={{ position: "relative" }}>
      <textarea
        ref={ref}
        rows={1}
        value={local}
        placeholder={placeholder}
        onChange={handleChange}
        onBlur={() => {
          if (local !== value) onSave(local);
        }}
        style={{
          ...KS.inputBase,
          resize: "none",
          overflow: "hidden",
          display: "block",
          padding: 0,
          ...style,
        }}
      />
      {slashState && (
        <KSlashPicker
          search={slashState.search}
          anchorRect={slashState.anchor}
          onSelect={handleSlashSelect}
          onClose={() => setSlashState(null)}
        />
      )}
    </div>
  );
}

/* ── Table block ── */
function KTableBlock({
  headers,
  rows,
  onChange,
}: {
  headers: string[];
  rows: string[][];
  onChange: (h: string[], r: string[][]) => void;
}) {
  const [h, setH] = useState(headers);
  const [r, setR] = useState(rows);
  const commit = (nh: string[], nr: string[][]) => {
    setH(nh);
    setR(nr);
    onChange(nh, nr);
  };
  const setHeader = (i: number, v: string) => {
    const nh = [...h];
    nh[i] = v;
    setH(nh);
  };
  const setCell = (ri: number, ci: number, v: string) => {
    const nr = r.map((row) => [...row]);
    nr[ri][ci] = v;
    setR(nr);
  };

  const th: React.CSSProperties = {
    textAlign: "left",
    borderBottom: `1px solid ${T.border}`,
    background: T.m5,
    padding: 0,
  };
  const td: React.CSSProperties = {
    borderBottom: `1px solid ${T.m5}`,
    padding: 0,
  };

  return (
    <div
      style={{
        overflowX: "auto",
        border: `1px solid ${T.border}`,
        borderRadius: 8,
      }}
    >
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            {h.map((col, i) => (
              <th key={i} style={th}>
                <input
                  value={col}
                  onChange={(e) => setHeader(i, e.target.value)}
                  onBlur={() => onChange(h, r)}
                  style={{ ...KS.cell, fontWeight: 600, color: T.t3 }}
                />
              </th>
            ))}
            <th style={{ ...th, width: 32 }}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  commit(
                    [...h, `Col ${h.length + 1}`],
                    r.map((row) => [...row, ""]),
                  )
                }
                style={{ ...KS.ctrlBtn, padding: "6px 10px" }}
              >
                +
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {r.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={td}>
                  <input
                    value={cell}
                    onChange={(e) => setCell(ri, ci, e.target.value)}
                    onBlur={() => onChange(h, r)}
                    style={KS.cell}
                  />
                </td>
              ))}
              <td style={{ ...td, width: 32 }}>
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() =>
                    commit(
                      h,
                      r.filter((_, i) => i !== ri),
                    )
                  }
                  style={{
                    ...KS.ctrlBtn,
                    color: "#ff6b6b",
                    padding: "6px 10px",
                  }}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={h.length + 1}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(h, [...r, Array(h.length).fill("")])}
                style={{ ...KS.ctrlBtn, padding: "7px 10px", fontSize: 12 }}
              >
                + Add row
              </button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ── Single block editor ── */
function KBlockEditor({
  block,
  isFirst,
  isLast,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddAfter,
  onCreateSubPage,
}: {
  block: KBlock;
  isFirst: boolean;
  isLast: boolean;
  onChange: (
    id: string,
    patch: { type?: KBlockType; content?: Record<string, unknown> },
  ) => void;
  onDelete: (id: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddAfter: (type: KBlockType) => void;
  onCreateSubPage?: () => void;
}) {
  const isAuthor = useAuthor();
  const str = (k: string) => (block.content[k] as string) ?? "";
  const set = (k: string, v: unknown) =>
    onChange(block.id, { content: { ...block.content, [k]: v } });

  const handleSlashSelect = (type: KBlockType, cleanedText: string) => {
    if ((type as string) === "page") {
      onCreateSubPage?.();
      return;
    }
    if (cleanedText.trim() === "") {
      onChange(block.id, { type, content: defaultBlockContent(type) });
    } else {
      onChange(block.id, { content: { ...block.content, text: cleanedText } });
      onAddAfter(type);
    }
  };

  const controls = isAuthor ? (
    <div
      className="pk-block-ctrl"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        paddingTop: 4,
        opacity: 0,
        transition: "opacity 0.1s",
        flexShrink: 0,
      }}
    >
      <button onClick={onMoveUp} disabled={isFirst} style={KS.ctrlBtn}>
        ↑
      </button>
      <button onClick={onMoveDown} disabled={isLast} style={KS.ctrlBtn}>
        ↓
      </button>
      <button
        onClick={() => onDelete(block.id)}
        style={{ ...KS.ctrlBtn, color: "#ff6b6b" }}
      >
        ×
      </button>
    </div>
  ) : null;

  if (block.type === "divider") {
    return (
      <div
        className="pk-block"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 0",
        }}
      >
        {controls}
        <hr
          style={{
            flex: 1,
            border: "none",
            borderTop: `1px solid ${T.border}`,
          }}
        />
      </div>
    );
  }

  const isText = ["paragraph", "h1", "h2", "h3"].includes(block.type);

  return (
    <div
      className="pk-block"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        padding: "2px 0",
      }}
    >
      {controls}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isText && (
          <KTextArea
            value={str("text")}
            placeholder={
              block.type === "paragraph"
                ? "Type '/' for commands…"
                : block.type.toUpperCase()
            }
            style={textBlockStyle(block.type)}
            onSave={(v) => set("text", v)}
            onSlashSelect={handleSlashSelect}
          />
        )}
        {block.type === "image" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <input
              defaultValue={str("url")}
              placeholder="Paste image URL…"
              style={KS.fieldInput}
              onBlur={(e) => set("url", e.target.value)}
            />
            {str("url") && (
              <>
                <img
                  src={str("url")}
                  alt={str("caption")}
                  style={{
                    maxWidth: "100%",
                    maxHeight: 420,
                    borderRadius: 8,
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
                <input
                  defaultValue={str("caption")}
                  placeholder="Caption…"
                  style={{ ...KS.fieldInput, fontSize: 12, color: T.t4 }}
                  onBlur={(e) => set("caption", e.target.value)}
                />
              </>
            )}
          </div>
        )}
        {block.type === "link" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <input
              defaultValue={str("label")}
              placeholder="Link title…"
              style={KS.fieldInput}
              onBlur={(e) => set("label", e.target.value)}
            />
            <input
              defaultValue={str("href")}
              placeholder="https://…"
              style={{ ...KS.fieldInput, fontFamily: T.mono, fontSize: 12 }}
              onBlur={(e) => set("href", e.target.value)}
            />
            {str("href") && (
              <a
                href={str("href")}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13,
                  color: "#6e9bff",
                  textDecoration: "none",
                }}
              >
                {str("label") || str("href")} ↗
              </a>
            )}
          </div>
        )}
        {block.type === "table" && (
          <KTableBlock
            headers={
              (block.content.headers as string[]) ?? ["Column 1", "Column 2"]
            }
            rows={(block.content.rows as string[][]) ?? [["", ""]]}
            onChange={(headers, rows) =>
              onChange(block.id, { content: { headers, rows } })
            }
          />
        )}
      </div>
    </div>
  );
}

/* ── Page tree item ── */
function KPageItem({
  page,
  depth,
  selected,
  onSelect,
  onDelete,
  onAddSub,
}: {
  page: KPage;
  depth: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSub: (parentId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="pk-tree-item"
      style={{ position: "relative" }}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        onClick={() => onSelect(page.id)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: `5px 8px 5px ${8 + depth * 14}px`,
          background: selected ? "rgba(255,255,255,0.06)" : "transparent",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          color: selected ? T.t1 : T.t3,
          fontSize: 13,
          textAlign: "left",
          fontFamily: T.font,
        }}
      >
        <span style={{ fontSize: 14, flexShrink: 0 }}>{page.icon}</span>
        <span
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {page.title || "Untitled"}
        </span>
        <span
          className="pk-page-menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          style={{
            opacity: 0,
            color: T.t5,
            fontSize: 14,
            padding: "0 3px",
            flexShrink: 0,
          }}
        >
          ···
        </span>
      </button>
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 199 }}
          />
          <div
            style={{
              position: "absolute",
              right: 8,
              top: "100%",
              zIndex: 200,
              background: "#161618",
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 4,
              minWidth: 150,
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            }}
          >
            {depth === 0 && (
              <button
                className="pk-kmenu-item"
                style={KS.menuItem}
                onClick={() => {
                  onAddSub(page.id);
                  setOpen(false);
                }}
              >
                + Sub-page
              </button>
            )}
            <button
              className="pk-kmenu-item"
              style={{ ...KS.menuItem, color: "#ff6b6b" }}
              onClick={() => {
                onDelete(page.id);
                setOpen(false);
              }}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main Knowledge section ── */
const PAGE_SLASH_ITEMS = [
  { key: "root", icon: "📄", label: "New page", hint: "root" },
  { key: "sub", icon: "📁", label: "New sub-page", hint: "nested" },
];

function KNewPageInput({
  onCreate,
  hasSelected,
}: {
  onCreate: (type: "root" | "sub", title: string) => void;
  hasSelected: boolean;
}) {
  const [val, setVal] = useState("");
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const slashIdx = val.indexOf("/");
  const search = slashIdx !== -1 ? val.slice(slashIdx + 1) : "";
  const filtered = search
    ? PAGE_SLASH_ITEMS.filter((i) =>
        i.label.toLowerCase().includes(search.toLowerCase()),
      )
    : PAGE_SLASH_ITEMS;

  const commit = (type: "root" | "sub") => {
    const title =
      (slashIdx !== -1 ? val.slice(0, slashIdx) : val).trim() || "Untitled";
    onCreate(type, title);
    setVal("");
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setVal(v);
    if (v.includes("/")) {
      setAnchorRect(ref.current?.getBoundingClientRect() ?? null);
      setOpen(true);
      setCursor(0);
    } else {
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (open) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[cursor]) commit(filtered[cursor].key as "root" | "sub");
      } else if (e.key === "Escape") {
        setOpen(false);
        setVal(val.replace("/", ""));
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      const title = val.trim();
      if (title) commit("root");
    }
  };

  const top = anchorRect ? anchorRect.top - (filtered.length * 44 + 16) : 0;
  const left = anchorRect ? anchorRect.left : 0;

  return (
    <div style={{ padding: "6px 8px 10px", borderTop: `1px solid ${T.m5}` }}>
      <input
        ref={ref}
        value={val}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        placeholder="Type name or / for options…"
        style={{
          ...KS.inputBase,
          width: "100%",
          fontSize: 12.5,
          padding: "6px 9px",
          borderRadius: 7,
          border: `1px solid ${T.m5}`,
          background: T.m6,
          color: T.t3,
        }}
      />
      {open && anchorRect && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 299 }}
          />
          <div
            style={{
              position: "fixed",
              top,
              left,
              zIndex: 300,
              background: "#18181b",
              border: `1px solid #2a2a2e`,
              borderRadius: 10,
              width: 220,
              boxShadow: "0 16px 48px rgba(0,0,0,0.75)",
              padding: 6,
            }}
          >
            {!hasSelected && (
              <div
                style={{ padding: "4px 10px 6px", fontSize: 11, color: T.t5 }}
              >
                Select a page to nest sub-pages
              </div>
            )}
            {filtered.map((item, i) => (
              <button
                key={item.key}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(item.key as "root" | "sub")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  background:
                    cursor === i ? "rgba(255,255,255,0.07)" : "transparent",
                  border: "none",
                  borderRadius: 7,
                  padding: "7px 10px",
                  cursor:
                    item.key === "sub" && !hasSelected
                      ? "not-allowed"
                      : "pointer",
                  fontFamily: T.font,
                  opacity: item.key === "sub" && !hasSelected ? 0.4 : 1,
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: T.t2,
                    textAlign: "left",
                  }}
                >
                  {item.label}
                </span>
                <span style={{ fontSize: 10, color: T.t5, fontFamily: T.mono }}>
                  {item.hint}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function KnowledgeSection({ kdb }: { kdb: KDB }) {
  const isAuthor = useAuthor();
  const record = useRecord();
  const [pages, setPages] = useState<KPage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<KBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState("");

  useEffect(() => {
    kdb.pages
      .list()
      .then((p) => { setPages(p); setLoading(false); })
      .catch((e: Error) => {
        setDbError(e.message?.includes("does not exist")
          ? "Supabase tables not found. Run the SQL setup in your Supabase dashboard."
          : "Database error: " + e.message);
        setLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedId) { setBlocks([]); return; }
    const page = pages.find((p) => p.id === selectedId);
    setPageTitle(page?.title ?? "");
    let cancelled = false;
    kdb.blocks.list(selectedId).then(async (b) => {
      if (cancelled) return;
      if (b.length === 0) {
        try { const first = await kdb.blocks.create(selectedId, "paragraph", 0); if (!cancelled) setBlocks([first]); }
        catch { if (!cancelled) setBlocks([]); }
      } else { setBlocks(b); }
    }).catch(() => { if (!cancelled) setBlocks([]); });
    return () => { cancelled = true; };
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const createPage = async (parent_id: string | null = null, title = "Untitled") => {
    try {
      const p = await kdb.pages.create(title, parent_id);
      setPages((prev) => [...prev, p]); setSelectedId(p.id); setBlocks([]); setDbError(null); record();
    } catch (e: unknown) {
      setDbError((e as Error).message?.includes("does not exist")
        ? "Supabase tables not found. Run the SQL setup in your Supabase dashboard."
        : "Failed to create page: " + (e as Error).message);
    }
  };

  const updatePage = (id: string, patch: Partial<Pick<KPage, "title" | "icon">>) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    kdb.pages.update(id, patch);
  };

  const deletePage = async (id: string) => {
    await kdb.pages.delete(id);
    setPages((prev) => prev.filter((p) => p.id !== id && p.parent_id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateBlock = (id: string, patch: { type?: KBlockType; content?: Record<string, unknown> }) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
    kdb.blocks.update(id, patch);
  };

  const deleteBlock = async (id: string) => {
    await kdb.blocks.delete(id);
    setBlocks((prev) => {
      const remaining = prev.filter((b) => b.id !== id);
      if (remaining.length === 0 && selectedId)
        kdb.blocks.create(selectedId, "paragraph", 0).then((b) => setBlocks([b])).catch(() => {});
      return remaining;
    });
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx + dir < 0 || idx + dir >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    const updated = next.map((b, i) => ({ ...b, position: i }));
    setBlocks(updated);
    kdb.blocks.update(updated[idx].id, { position: updated[idx].position });
    kdb.blocks.update(updated[idx + dir].id, { position: updated[idx + dir].position });
  };

  const addBlockAfter = async (afterId: string, type: KBlockType) => {
    if (!selectedId) return;
    const afterIdx = blocks.findIndex((b) => b.id === afterId);
    const position = afterIdx + 1;
    try {
      const newBlock = await kdb.blocks.create(selectedId, type, position);
      const tail = blocks.slice(position);
      for (const b of tail) kdb.blocks.update(b.id, { position: b.position + 1 });
      setBlocks([...blocks.slice(0, position), newBlock, ...tail.map((b) => ({ ...b, position: b.position + 1 }))]);
    } catch (e) { console.error("Failed to create block:", e); }
  };

  const rootPages = pages.filter((p) => !p.parent_id);
  const childrenOf = (id: string) => pages.filter((p) => p.parent_id === id);
  const selectedPage = pages.find((p) => p.id === selectedId);

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* ── Page tree ── */}
      <div
        style={{
          width: 224,
          flexShrink: 0,
          borderRight: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            padding: "20px 14px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: T.t5,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Pages
          </span>
          {isAuthor && (
            <button
              onClick={() => createPage()}
              style={{ ...KS.ctrlBtn, fontSize: 18, padding: "0 4px" }}
              title="New page"
            >
              +
            </button>
          )}
        </div>

        {/* DB error banner */}
        {dbError && (
          <div
            style={{
              margin: "0 10px 10px",
              padding: "8px 10px",
              background: "#2a1a10",
              border: "1px solid #5a3020",
              borderRadius: 7,
              fontSize: 12,
              color: "#f5a623",
              lineHeight: 1.5,
            }}
          >
            {dbError}
          </div>
        )}

        <div style={{ flex: 1, padding: "0 6px 8px", overflowY: "auto" }}>
          {loading && (
            <div style={{ padding: "8px 10px", color: T.t5, fontSize: 13 }}>
              Loading…
            </div>
          )}
          {!loading && !dbError && rootPages.length === 0 && (
            <div style={{ padding: "8px 10px", color: T.t5, fontSize: 12 }}>
              {isAuthor
                ? "Type a name below and press Enter, or type / for options."
                : "No pages yet."}
            </div>
          )}
          {rootPages.map((page) => (
            <div key={page.id}>
              <KPageItem
                page={page}
                depth={0}
                selected={selectedId === page.id}
                onSelect={setSelectedId}
                onDelete={deletePage}
                onAddSub={createPage}
              />
              {childrenOf(page.id).map((child) => (
                <KPageItem
                  key={child.id}
                  page={child}
                  depth={1}
                  selected={selectedId === child.id}
                  onSelect={setSelectedId}
                  onDelete={deletePage}
                  onAddSub={() => {}}
                />
              ))}
            </div>
          ))}
        </div>
        {isAuthor && (
          <KNewPageInput
            hasSelected={!!selectedId}
            onCreate={(type, title) =>
              createPage(type === "sub" ? selectedId : null, title)
            }
          />
        )}
      </div>

      {/* ── Page content ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {!selectedPage ? (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              color: T.t5,
            }}
          >
            <span style={{ fontSize: 32 }}>📄</span>
            <span style={{ fontSize: 14 }}>
              {pages.length === 0
                ? isAuthor
                  ? "Create your first page"
                  : "No pages yet"
                : "Select a page"}
            </span>
            {pages.length === 0 && isAuthor && (
              <button
                onClick={() => createPage()}
                style={{
                  border: `1px solid ${T.m4}`,
                  background: "transparent",
                  color: T.t3,
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: T.font,
                }}
              >
                + New page
              </button>
            )}
          </div>
        ) : (
          <div
            key={selectedPage.id}
            style={{ padding: "56px 72px 100px", maxWidth: 900 }}
          >
            {/* Icon */}
            <input
              defaultValue={selectedPage.icon}
              readOnly={!isAuthor}
              style={{
                ...KS.inputBase,
                fontSize: 42,
                width: "auto",
                marginBottom: 10,
              }}
              onBlur={(e) =>
                isAuthor &&
                updatePage(selectedPage.id, { icon: e.target.value || "📄" })
              }
            />
            {/* Title */}
            <input
              value={pageTitle}
              readOnly={!isAuthor}
              onChange={(e) => isAuthor && setPageTitle(e.target.value)}
              onBlur={() =>
                isAuthor &&
                updatePage(selectedPage.id, { title: pageTitle || "Untitled" })
              }
              placeholder="Untitled"
              style={{
                ...KS.inputBase,
                display: "block",
                fontSize: 38,
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: T.t1,
                marginBottom: 40,
              }}
            />

            {/* Blocks — always has at least one paragraph (auto-seeded) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {blocks.map((block, i) => (
                <KBlockEditor
                  key={block.id}
                  block={block}
                  isFirst={i === 0}
                  isLast={i === blocks.length - 1}
                  onChange={updateBlock}
                  onDelete={deleteBlock}
                  onMoveUp={() => moveBlock(block.id, -1)}
                  onMoveDown={() => moveBlock(block.id, 1)}
                  onAddAfter={(type) => addBlockAfter(block.id, type)}
                  onCreateSubPage={() => createPage(selectedId)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   JOURNAL  — dated entries with text / image / link
   ══════════════════════════════════════════════════════ */

type JBlockType = "text" | "image" | "link";
interface JBlock {
  id: string;
  type: JBlockType;
  value: string;
  extra: string;
}
interface JEntry {
  id: string;
  created_at: string;
  content: JBlock[];
}

function makeJBlock(type: JBlockType): JBlock {
  return { id: crypto.randomUUID(), type, value: "", extra: "" };
}

const jdb = {
  list: async (): Promise<JEntry[]> => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, created_at, content")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as JEntry[];
  },
  create: async (): Promise<JEntry> => {
    const { data, error } = await supabase
      .from("journal_entries")
      .insert({ content: [] })
      .select("id, created_at, content")
      .single();
    if (error) throw error;
    return data as JEntry;
  },
  save: (id: string, content: JBlock[]) =>
    supabase.from("journal_entries").update({ content }).eq("id", id),
  delete: (id: string) =>
    supabase.from("journal_entries").delete().eq("id", id),
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function JEntryEditor({
  entry,
  onBack,
  onSave,
  onDelete,
  readOnly = false,
}: {
  entry: JEntry;
  onBack: () => void;
  onSave: (content: JBlock[]) => void;
  onDelete: () => void;
  readOnly?: boolean;
}) {
  const [blocks, setBlocks] = useState<JBlock[]>(
    entry.content.length > 0 ? entry.content : [makeJBlock("text")],
  );
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = (next: JBlock[]) => {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => onSave(next), 700);
  };

  const upd = (id: string, patch: Partial<JBlock>) => {
    const next = blocks.map((b) => (b.id === id ? { ...b, ...patch } : b));
    setBlocks(next);
    flush(next);
  };

  const add = (type: JBlockType) => {
    const next = [...blocks, makeJBlock(type)];
    setBlocks(next);
    flush(next);
  };

  const remove = (id: string) => {
    const next = blocks.filter((b) => b.id !== id);
    const final = next.length > 0 ? next : [makeJBlock("text")];
    setBlocks(final);
    flush(final);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          borderBottom: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: T.t4,
            cursor: "pointer",
            fontFamily: T.font,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Back
        </button>
        <span style={{ fontSize: 12, color: T.t5, fontFamily: T.mono }}>
          {fmtDate(entry.created_at)}
        </span>
        {!readOnly && (
          <button
            onClick={onDelete}
            style={{
              background: "none",
              border: "none",
              color: "#ff6b6b",
              cursor: "pointer",
              fontFamily: T.font,
              fontSize: 13,
            }}
          >
            Delete
          </button>
        )}
        {readOnly && (
          <span style={{ fontSize: 11, color: T.t5, fontFamily: T.mono }}>
            read-only
          </span>
        )}
      </div>

      {/* blocks */}
      <div style={{ flex: 1, overflowY: "auto", padding: "48px 72px 80px" }}>
        <div
          style={{
            maxWidth: 680,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              style={{ position: "relative" }}
              className="jblock"
            >
              {block.type === "text" && (
                <textarea
                  value={block.value}
                  onChange={(e) => upd(block.id, { value: e.target.value })}
                  placeholder="Write something…"
                  rows={1}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = t.scrollHeight + "px";
                  }}
                  readOnly={readOnly}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: T.t2,
                    fontFamily: T.font,
                    fontSize: 15,
                    lineHeight: 1.75,
                    resize: "none",
                    overflow: "hidden",
                    minHeight: 28,
                  }}
                />
              )}
              {block.type === "image" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <input
                    defaultValue={block.value}
                    placeholder="Paste image URL…"
                    style={KS.fieldInput}
                    onBlur={(e) => upd(block.id, { value: e.target.value })}
                  />
                  {block.value && (
                    <>
                      <img
                        src={block.value}
                        alt={block.extra}
                        style={{
                          maxWidth: "100%",
                          maxHeight: 400,
                          borderRadius: 8,
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                      <input
                        defaultValue={block.extra}
                        placeholder="Caption…"
                        style={{ ...KS.fieldInput, fontSize: 12, color: T.t4 }}
                        onBlur={(e) => upd(block.id, { extra: e.target.value })}
                      />
                    </>
                  )}
                </div>
              )}
              {block.type === "link" && (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <input
                    defaultValue={block.value}
                    placeholder="https://…"
                    style={{
                      ...KS.fieldInput,
                      fontFamily: T.mono,
                      fontSize: 12,
                    }}
                    onBlur={(e) => upd(block.id, { value: e.target.value })}
                  />
                  <input
                    defaultValue={block.extra}
                    placeholder="Link label…"
                    style={KS.fieldInput}
                    onBlur={(e) => upd(block.id, { extra: e.target.value })}
                  />
                  {block.value && (
                    <a
                      href={block.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 13,
                        color: "#6e9bff",
                        textDecoration: "none",
                      }}
                    >
                      {block.extra || block.value} ↗
                    </a>
                  )}
                </div>
              )}
              {/* hover delete (author only) */}
              {!readOnly && (
                <button
                  onClick={() => remove(block.id)}
                  className="jblock-del"
                  style={{
                    position: "absolute",
                    top: 0,
                    right: -28,
                    background: "none",
                    border: "none",
                    color: "#ff6b6b",
                    cursor: "pointer",
                    fontSize: 15,
                    opacity: 0,
                    transition: "opacity 0.1s",
                    padding: "2px 4px",
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {/* add block row (author only) */}
          {!readOnly && (
            <div
              style={{
                display: "flex",
                gap: 8,
                paddingTop: 20,
                borderTop: `1px solid ${T.m5}`,
              }}
            >
              {(["text", "image", "link"] as JBlockType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => add(type)}
                  style={{
                    border: `1px solid ${T.m5}`,
                    background: "transparent",
                    color: T.t4,
                    borderRadius: 7,
                    padding: "5px 14px",
                    fontSize: 12,
                    cursor: "pointer",
                    fontFamily: T.font,
                  }}
                >
                  + {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function JournalSection() {
  const isAuthor = useAuthor();
  const record = useRecord();
  const [entries, setEntries] = useState<JEntry[]>([]);
  const [selected, setSelected] = useState<JEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    jdb
      .list()
      .then((e) => {
        setEntries(e);
        setLoading(false);
      })
      .catch((e: Error) => {
        setDbError(
          e.message?.includes("does not exist")
            ? "Run the SQL setup in Supabase to enable Journal."
            : "Database error: " + e.message,
        );
        setLoading(false);
      });
  }, []);

  const newEntry = async () => {
    try {
      const e = await jdb.create();
      setEntries((prev) => [e, ...prev]);
      setSelected(e);
      setDbError(null);
      record();
    } catch (err: unknown) {
      setDbError("Failed to create entry: " + (err as Error).message);
    }
  };

  const saveEntry = (id: string, content: JBlock[]) => {
    jdb.save(id, content);
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, content } : e)),
    );
  };

  const deleteEntry = async (id: string) => {
    await jdb.delete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setSelected(null);
  };

  const preview = (e: JEntry) => {
    const first = e.content.find((b) => b.type === "text" && b.value.trim());
    return first?.value.trim().split("\n")[0].slice(0, 100) || "Empty entry";
  };

  if (selected)
    return (
      <JEntryEditor
        entry={selected}
        onBack={() => setSelected(null)}
        onSave={
          isAuthor ? (content) => saveEntry(selected.id, content) : () => {}
        }
        onDelete={isAuthor ? () => deleteEntry(selected.id) : () => {}}
        readOnly={!isAuthor}
      />
    );

  return (
    <div style={{ padding: "40px 48px", maxWidth: 760 }}>
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: T.t1,
            letterSpacing: "-0.02em",
          }}
        >
          Journal
        </h2>
        {isAuthor && (
          <button
            onClick={newEntry}
            style={{
              background: T.accent,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 13,
              cursor: "pointer",
              fontFamily: T.font,
              fontWeight: 600,
            }}
          >
            + New Entry
          </button>
        )}
      </div>

      {dbError && (
        <div
          style={{
            padding: "10px 14px",
            background: "#2a1a10",
            border: "1px solid #5a3020",
            borderRadius: 8,
            fontSize: 13,
            color: "#f5a623",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          {dbError}
        </div>
      )}

      {loading && <div style={{ color: T.t5, fontSize: 14 }}>Loading…</div>}
      {!loading && !dbError && entries.length === 0 && (
        <div style={{ color: T.t5, fontSize: 14 }}>
          {isAuthor ? (
            <>
              No entries yet — hit{" "}
              <strong style={{ color: T.t3 }}>+ New Entry</strong> to start.
            </>
          ) : (
            "No entries yet."
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => setSelected(entry)}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 5,
              width: "100%",
              background: "transparent",
              border: `1px solid transparent`,
              borderRadius: 10,
              padding: "14px 18px",
              cursor: "pointer",
              fontFamily: T.font,
              textAlign: "left",
              transition: "border-color 0.12s, background 0.12s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget;
              el.style.background = T.m6;
              el.style.borderColor = T.m5;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget;
              el.style.background = "transparent";
              el.style.borderColor = "transparent";
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: T.t5,
                fontFamily: T.mono,
                letterSpacing: "0.04em",
              }}
            >
              {fmtDate(entry.created_at)}
            </span>
            <span
              style={{
                fontSize: 14,
                color: T.t3,
                lineHeight: 1.5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {preview(entry)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Activity Heatmap ── */
const HEAT_COLORS = ["#1a1a1e", "#0e4429", "#006d32", "#26a641", "#39d353"];
const heatColor = (n: number) => HEAT_COLORS[Math.min(n, 4)];
const CELL = 13;
const GAP = 3;
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function ActivityHeatmap({ activity }: { activity: ActivityMap }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  // Build grid: start from Sunday of the week 52 weeks ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // back to Sunday

  const weeks: Date[][] = [];
  const cur = new Date(startDate);
  while (cur <= today) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) { week.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
    weeks.push(week);
  }

  // Month labels
  const monthLabels: Map<number, string> = new Map();
  weeks.forEach((week, i) => {
    week.forEach(day => {
      if (day.getDate() === 1 && day <= today)
        monthLabels.set(i, day.toLocaleString("default", { month: "short" }));
    });
  });

  const total = Object.values(activity).reduce((s, v) => s + v, 0);
  const todayStr = fmt(today);

  return (
    <div style={{ fontFamily: T.font }}>
      <div style={{ display: "flex" }}>
        {/* Day label gutter */}
        <div style={{ display: "flex", flexDirection: "column", marginRight: 8, paddingTop: 24, gap: GAP }}>
          {DAY_LABELS.map((label, i) => (
            <div key={i} style={{ height: CELL, fontSize: 10, color: T.t5, display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
              {label}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div style={{ overflowX: "auto" }}>
          {/* Month row */}
          <div style={{ display: "flex", marginBottom: 6, height: 18, gap: GAP }}>
            {weeks.map((_, i) => (
              <div key={i} style={{ width: CELL, fontSize: 10, color: T.t4, flexShrink: 0, overflow: "visible", whiteSpace: "nowrap" }}>
                {monthLabels.get(i) ?? ""}
              </div>
            ))}
          </div>
          {/* Cell grid */}
          <div style={{ display: "flex", gap: GAP }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: "flex", flexDirection: "column", gap: GAP }}>
                {week.map((day, di) => {
                  const dayStr = fmt(day);
                  const isFuture = day > today;
                  const count = isFuture ? 0 : (activity[dayStr] || 0);
                  const isToday = dayStr === todayStr;
                  return (
                    <div key={di}
                      title={isFuture ? "" : `${dayStr}: ${count} activit${count === 1 ? "y" : "ies"}`}
                      style={{
                        width: CELL, height: CELL, borderRadius: 3, flexShrink: 0,
                        background: isFuture ? "transparent" : heatColor(count),
                        outline: isToday ? "1px solid rgba(255,255,255,0.35)" : "none",
                        outlineOffset: 1,
                      }}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
        <span style={{ fontSize: 12, color: T.t4 }}>{total} activit{total === 1 ? "y" : "ies"} in this period</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: T.t5 }}>
          Less
          {HEAT_COLORS.map((c, i) => (
            <div key={i} style={{ width: CELL, height: CELL, borderRadius: 3, background: c }} />
          ))}
          More
        </div>
      </div>
    </div>
  );
}

function ProgressSection({ activity }: { activity: ActivityMap }) {
  const total = Object.values(activity).reduce((s, v) => s + v, 0);
  const streak = (() => {
    let s = 0;
    const d = new Date(); d.setHours(0, 0, 0, 0);
    const fmt = (x: Date) => x.toISOString().split("T")[0];
    while (activity[fmt(d)]) { s++; d.setDate(d.getDate() - 1); }
    return s;
  })();

  return (
    <div style={{ padding: "48px 56px", maxWidth: 900 }}>
      {/* Stats row */}
      <div style={{ display: "flex", gap: 24, marginBottom: 40 }}>
        {[
          { label: "Total activities", value: total },
          { label: "Current streak", value: `${streak}d` },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "#111113", border: `1px solid ${T.border}`, borderRadius: 10, padding: "16px 24px", minWidth: 120 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: T.t1, fontFamily: T.mono }}>{value}</div>
            <div style={{ fontSize: 12, color: T.t5, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Heatmap */}
      <div style={{ marginBottom: 12, fontSize: 13, fontWeight: 600, color: T.t3, letterSpacing: "0.04em", textTransform: "uppercase" as const }}>Activity</div>
      <div style={{ background: "#111113", border: `1px solid ${T.border}`, borderRadius: 12, padding: "24px 20px 20px" }}>
        <ActivityHeatmap activity={activity} />
      </div>

      {/* Legend for what counts */}
      <div style={{ marginTop: 20, fontSize: 12, color: T.t5, lineHeight: 1.9 }}>
        Activity recorded when: ticking a learning item · writing a journal entry · creating a knowledge page · shipping a product or experiment
      </div>
    </div>
  );
}

/* ── ResumeSection ── */
const RESUME_FILE = "resume.pdf";
const RESUME_BUCKET = "Resume";
const RESUME_URL_KEY = "resume_pdf_url";

interface RLine { text: string; size: number; bold: boolean; }

async function parsePdfLines(url: string): Promise<RLine[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
  const pdf = await pdfjs.getDocument({ url, withCredentials: false }).promise;
  const result: RLine[] = [];

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const vp = page.getViewport({ scale: 1 });
    const content = await page.getTextContent();

    type Item = { str: string; x: number; y: number; w: number; size: number; bold: boolean };
    const items: Item[] = [];

    for (const raw of content.items) {
      const it = raw as { str: string; transform: number[]; width?: number; fontName?: string };
      if (!it.str) continue;
      const x = it.transform[4];
      // Flip y: PDF is bottom-up, we want top-down
      const y = vp.height - it.transform[5];
      const size = Math.abs(it.transform[3]) || Math.abs(it.transform[0]) || 10;
      const bold = /bold|heavy|black/i.test(it.fontName ?? "");
      const w = it.width ?? it.str.length * size * 0.55;
      items.push({ str: it.str, x, y, w, size, bold });
    }

    // Sort top-to-bottom then left-to-right
    items.sort((a, b) => Math.abs(a.y - b.y) < 2 ? a.x - b.x : a.y - b.y);

    // Group into visual lines (2px y tolerance)
    const lineGroups: Item[][] = [];
    for (const item of items) {
      const last = lineGroups[lineGroups.length - 1];
      if (!last || Math.abs(item.y - last[0].y) > 2) lineGroups.push([item]);
      else last.push(item);
    }

    for (const group of lineGroups) {
      group.sort((a, b) => a.x - b.x);
      let text = "";
      for (let i = 0; i < group.length; i++) {
        const it = group[i];
        if (i === 0) { text = it.str; continue; }
        const prev = group[i - 1];
        const gap = it.x - (prev.x + prev.w);
        // Large X gap = column separator, small gap = same word, negative = overlap
        if (gap > 8) text += "  ";
        else if (gap > 1 && !text.endsWith(" ") && !it.str.startsWith(" ")) text += " ";
        text += it.str;
      }
      text = text.trim();
      if (!text) continue;
      result.push({
        text,
        size: Math.max(...group.map(i => i.size)),
        bold: group.some(i => i.bold),
      });
    }

    if (p < pdf.numPages) result.push({ text: "__PAGE_BREAK__", size: 0, bold: false });
  }
  return result;
}

const SECTION_KEYWORDS = new Set([
  "experience", "education", "skills", "projects", "summary", "objective",
  "certifications", "awards", "publications", "languages", "interests",
  "achievements", "work experience", "professional experience", "technical skills",
  "contact", "about", "profile", "volunteering", "leadership",
  "professional summary", "core competencies", "competencies", "expertise",
  "qualifications", "work history", "employment", "employment history",
  "key skills", "areas of expertise", "career objective", "references",
  "additional information", "honors", "activities", "affiliations",
]);

type RKind = "name" | "contact" | "section" | "company" | "role" | "para" | "bullet" | "chips" | "gap";
interface RBlock { kind: RKind; text: string; date?: string; items?: string[]; }

function buildBlocks(lines: RLine[]): RBlock[] {
  const out: RBlock[] = [];
  let sectionCtx = "";

  const last = () => out[out.length - 1];
  const appendLast = (text: string) => { const l = last(); if (l) l.text = l.text + " " + text; };

  const firstIdx = lines.findIndex(l => l.text !== "__PAGE_BREAK__" && l.text.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.text.trim() || line.text === "__PAGE_BREAK__") continue;

    const lower = line.text.toLowerCase().trim().replace(/[:\-–—]+$/, "").trim();
    const isAllCaps = line.text === line.text.toUpperCase() && /[A-Z]/.test(line.text) && !/\d/.test(line.text);

    // Name — first large line
    if (i === firstIdx && line.size >= 13) { out.push({ kind: "name", text: line.text }); continue; }

    // Contact — right after name, has | or @ or phone
    if (last()?.kind === "name" && (line.text.includes("|") || line.text.includes("@") || /\+?\d[\d\s\-()]{5,}/.test(line.text))) {
      out.push({ kind: "contact", text: line.text }); continue;
    }

    // Section header
    if ((SECTION_KEYWORDS.has(lower) || (isAllCaps && line.text.length > 3 && line.text.length < 55)) && line.text.length < 60) {
      sectionCtx = lower;
      out.push({ kind: "section", text: line.text }); continue;
    }

    // Summary / Objective / About → reflow into one paragraph
    if (/summar|objective|profile|about/.test(sectionCtx)) {
      const l = last();
      if (l?.kind === "para") appendLast(line.text);
      else out.push({ kind: "para", text: line.text });
      continue;
    }

    // Skills / Competencies → chips (split on double-space column gaps)
    if (/skill|competenc|expertise|core/.test(sectionCtx)) {
      const items = line.text.split(/\s{2,}/).map(s => s.trim()).filter(Boolean);
      const l = last();
      if (l?.kind === "chips") l.items = [...(l.items ?? []), ...items];
      else out.push({ kind: "chips", text: "", items });
      continue;
    }

    // Company+date: "WaveMaker India Pvt. Ltd.  2024 - Present"
    const dateM = line.text.match(/^(.*?)\s{1,4}(\d{4}\s*[-–—]\s*(?:\d{4}|Present|Current|Now))$/i);
    if (dateM) {
      out.push({ kind: "company", text: dateM[1].trim(), date: dateM[2].trim() }); continue;
    }

    // Role — line right after company, or bold short line following a company/role
    if (last()?.kind === "company") {
      out.push({ kind: "role", text: line.text }); continue;
    }

    // Explicit bullet character
    const isBullet = /^[•·▪▸\-–—*]\s/.test(line.text);
    if (isBullet) {
      out.push({ kind: "bullet", text: line.text.replace(/^[•·▪▸\-–—*]\s+/, "") }); continue;
    }

    // After role/bullet → treat as achievement bullet with reflow
    const lk = last()?.kind;
    if (lk === "role" || lk === "bullet") {
      const l = last()!;
      // Reflow wrapped line (previous didn't end sentence)
      if (l.kind === "bullet" && !/[.;!?]$/.test(l.text)) appendLast(line.text);
      else out.push({ kind: "bullet", text: line.text });
      continue;
    }

    // Default: paragraph with reflow
    const l = last();
    if (l?.kind === "para" && !/[.;!?]$/.test(l.text)) appendLast(line.text);
    else out.push({ kind: "para", text: line.text });
  }

  return out;
}

function ResumeSection() {
  const isAuthor = useAuthor();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [lines, setLines] = useState<RLine[] | null>(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("portfolio_state").select("value").eq("key", RESUME_URL_KEY).maybeSingle()
      .then(({ data }) => { if (data?.value?.[0]) setPdfUrl(data.value[0] as string); });
  }, []);

  useEffect(() => {
    if (!pdfUrl) return;
    setParsing(true);
    setLines(null);
    parsePdfLines(pdfUrl)
      .then(l => { setLines(l); setParsing(false); })
      .catch((e: unknown) => { setErr("Failed to parse PDF: " + (e as Error).message); setParsing(false); });
  }, [pdfUrl]);

  const upload = async (file: File) => {
    if (!file.type.includes("pdf")) { setErr("Please upload a PDF file."); return; }
    setUploading(true); setErr(null);
    try {
      const { error: upErr } = await supabase.storage.from(RESUME_BUCKET)
        .upload(RESUME_FILE, file, { upsert: true, contentType: "application/pdf" });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(RESUME_BUCKET).getPublicUrl(RESUME_FILE);
      const url = data.publicUrl + "?v=" + Date.now();
      await supabase.from("portfolio_state").upsert({ key: RESUME_URL_KEY, value: [url], updated_at: new Date().toISOString() });
      setPdfUrl(url);
    } catch (e: unknown) {
      setErr("Upload failed: " + (e as Error).message);
    } finally { setUploading(false); }
  };

  const download = async () => {
    if (!pdfUrl) return;
    try {
      const res = await fetch(pdfUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "resume.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { window.open(pdfUrl, "_blank"); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 24px", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        <span style={{ flex: 1 }} />
        {pdfUrl && (
          <button onClick={download} style={{ display: "flex", alignItems: "center", gap: 6, background: T.m5, border: `1px solid ${T.m4}`, borderRadius: 7, color: T.t2, fontFamily: T.font, fontSize: 12, fontWeight: 600, padding: "6px 14px", cursor: "pointer" }}>
            ↓ Download PDF
          </button>
        )}
        {isAuthor && (
          <>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              style={{ background: T.accent, border: "none", borderRadius: 7, color: "#fff", fontFamily: T.font, fontSize: 12, fontWeight: 600, padding: "6px 14px", cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>
              {uploading ? "Uploading…" : pdfUrl ? "Replace PDF" : "Upload PDF"}
            </button>
            <input ref={fileRef} type="file" accept="application/pdf" style={{ display: "none" }}
              onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
          </>
        )}
      </div>

      {err && <div style={{ padding: "10px 24px", background: "#2a1010", color: "#ff6b6b", fontSize: 13 }}>{err}</div>}

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {!pdfUrl ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, color: T.t5 }}>
            <span style={{ fontSize: 36 }}>📄</span>
            <span style={{ fontSize: 14, color: T.t4 }}>{isAuthor ? "Upload your resume PDF above." : "No resume uploaded yet."}</span>
          </div>
        ) : parsing ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: T.t5, fontSize: 13 }}>Parsing resume…</div>
        ) : lines ? (
          <div style={{ maxWidth: 740, margin: "0 auto", padding: "52px 40px 100px" }}>
            {buildBlocks(lines).map((block, i) => {
              if (block.kind === "name") return (
                <h1 key={i} style={{ fontSize: 34, fontWeight: 800, color: T.t1, letterSpacing: "-0.03em", fontFamily: T.font, margin: "0 0 4px" }}>
                  {block.text}
                </h1>
              );
              if (block.kind === "contact") return (
                <div key={i} style={{ fontSize: 12, color: T.t5, fontFamily: T.mono, marginBottom: 6, lineHeight: 1.8 }}>
                  {block.text.split("|").map((p, j) => (
                    <span key={j}>{j > 0 && <span style={{ color: T.m4, margin: "0 6px" }}>·</span>}{p.trim()}</span>
                  ))}
                </div>
              );
              if (block.kind === "section") return (
                <div key={i} style={{ marginTop: 36, marginBottom: 14, paddingBottom: 6, borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: T.t4, fontFamily: T.font }}>
                    {block.text}
                  </span>
                </div>
              );
              if (block.kind === "para") return (
                <p key={i} style={{ fontSize: 14, color: T.t3, lineHeight: 1.8, fontFamily: T.font, margin: "0 0 10px" }}>
                  {block.text}
                </p>
              );
              if (block.kind === "chips") return (
                <div key={i} style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                  {(block.items ?? []).map((chip, j) => (
                    <span key={j} style={{ background: T.m5, border: `1px solid ${T.m4}`, borderRadius: 20, padding: "4px 12px", fontSize: 12, color: T.t2, fontFamily: T.font, lineHeight: 1.5 }}>
                      {chip}
                    </span>
                  ))}
                </div>
              );
              if (block.kind === "company") return (
                <div key={i} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 28, marginBottom: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.t1, fontFamily: T.font }}>{block.text}</span>
                  {block.date && <span style={{ fontSize: 11, color: T.t5, fontFamily: T.mono, flexShrink: 0, marginLeft: 16 }}>{block.date}</span>}
                </div>
              );
              if (block.kind === "role") return (
                <div key={i} style={{ fontSize: 13, color: T.t4, fontFamily: T.font, marginBottom: 10, fontStyle: "italic" }}>
                  {block.text}
                </div>
              );
              if (block.kind === "bullet") return (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 5, paddingLeft: 2 }}>
                  <span style={{ color: T.accent, flexShrink: 0, marginTop: "0.45em", fontSize: 7, lineHeight: 1 }}>●</span>
                  <span style={{ fontSize: 13.5, color: T.t2, lineHeight: 1.7, fontFamily: T.font }}>{block.text}</span>
                </div>
              );
              return null;
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
