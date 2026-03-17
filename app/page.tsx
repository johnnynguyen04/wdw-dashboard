"use client";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  motion, AnimatePresence,
  useMotionValue, useSpring,
  useScroll, useTransform,
} from "framer-motion";
import {
  Rocket, Guitar, Dog, Orbit, Pickaxe, Wind, CloudSun, Swords,
  LayoutDashboard, BarChart3, Brain, Calendar, Clapperboard,
  TrendingUp, Clock, Sparkles, MapPin, ChevronRight, Info,
} from "lucide-react";

/* ── Motion Variants ── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const cardVar = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: "spring" as const, stiffness: 100, damping: 18 },
  },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
};

/* ── Cursor Spotlight ── */
function CursorSpotlight() {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => { setPos({ x: e.clientX, y: e.clientY }); setActive(true); };
    const leave = () => setActive(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseleave", leave); };
  }, []);

  return (
    <div
      className="cursor-spotlight"
      style={{
        background: active
          ? `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(240,180,41,0.055) 0%, rgba(100,80,220,0.025) 40%, transparent 70%)`
          : "transparent",
      }}
    />
  );
}

/* ── Castle Logo ── */
function CastleLogo({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 48 40" fill="currentColor" className={className} style={style} aria-hidden="true">
      <rect x="4"  y="14" width="4" height="20" rx="0.5" opacity="0.9" />
      <rect x="40" y="14" width="4" height="20" rx="0.5" opacity="0.9" />
      <rect x="14" y="10" width="4" height="24" rx="0.5" />
      <rect x="30" y="10" width="4" height="24" rx="0.5" />
      <rect x="21" y="4"  width="6" height="30" rx="0.5" />
      <polygon points="5,14 6,8 7.5,14"     opacity="0.85" />
      <polygon points="41,14 42,8 43.5,14"  opacity="0.85" />
      <polygon points="15,10 16,4 17.5,10"  />
      <polygon points="31,10 32,4 33.5,10"  />
      <polygon points="22.5,4 24,0 25.5,4"  />
      <rect x="8"  y="26" width="32" height="8" rx="1" opacity="0.7" />
      <rect x="20" y="28" width="8"  height="6" rx="4" fill="#050812" />
      <polygon points="24,-3 28,-4.5 24,-6" opacity="0.7" />
    </svg>
  );
}

/* ── Sparkle / Star Field ── */
function SparkleField() {
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 28; i++) {
      arr.push({
        left: `${5 + Math.random() * 90}%`,
        bottom: `${Math.random() * 42}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${2 + Math.random() * 3}s`,
        size: 1.5 + Math.random() * 2.5,
        opacity: 0.25 + Math.random() * 0.5,
      });
    }
    return arr;
  }, []);

  const stars = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 65; i++) {
      arr.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 90}%`,
        delay: `${Math.random() * 6}s`,
        duration: `${2 + Math.random() * 4}s`,
        size: Math.random() < 0.15 ? 2.5 : Math.random() < 0.4 ? 1.5 : 1,
        opacity: 0.1 + Math.random() * 0.55,
      });
    }
    return arr;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={`p-${i}`}
          className="sparkle-particle"
          style={{
            left: p.left, bottom: p.bottom,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size, height: p.size,
            opacity: p.opacity,
          }}
        />
      ))}
      {stars.map((s, i) => (
        <div
          key={`s-${i}`}
          className="star-dot"
          style={{
            left: s.left, top: s.top,
            animationDelay: s.delay,
            animationDuration: s.duration,
            width: s.size, height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  );
}

/* ── 3D Tilt Card ── */
function TiltCard({
  children, className, style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotY, { stiffness: 200, damping: 20 });

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top)  / r.height;
    rotX.set((ny - 0.5) * -12);
    rotY.set((nx - 0.5) *  12);
    if (sheenRef.current) {
      sheenRef.current.style.setProperty("--mx", `${nx * 100}%`);
      sheenRef.current.style.setProperty("--my", `${ny * 100}%`);
      sheenRef.current.classList.add("tilt-sheen-visible");
    }
  }, [rotX, rotY]);

  const onLeave = useCallback(() => {
    rotX.set(0); rotY.set(0);
    sheenRef.current?.classList.remove("tilt-sheen-visible");
  }, [rotX, rotY]);

  return (
    <motion.div
      ref={ref}
      variants={cardVar}
      whileInView="show"
      initial="hidden"
      viewport={{ once: true, margin: "-40px" }}
      style={{ rotateX: springX, rotateY: springY, transformStyle: "preserve-3d", position: "relative", ...style }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.007, z: 8 }}
      className={className}
    >
      <div ref={sheenRef} className="tilt-sheen" />
      {children}
    </motion.div>
  );
}

/* ── Animated Counter ── */
function AnimatedCounter({ to }: { to: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const dur = 1500;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setVal(Math.round(ease * to));
      if (t < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [to]);
  return <>{val.toLocaleString()}</>;
}

/* ── Data ── */
const RIDE_ICONS: Record<number, React.ReactNode> = {
  0: <Rocket   size={15} />,
  1: <Guitar   size={15} />,
  2: <Dog      size={15} />,
  3: <Orbit    size={15} />,
  4: <Pickaxe  size={15} />,
  5: <Wind     size={15} />,
  6: <CloudSun size={15} />,
  7: <Swords   size={15} />,
};

const RIDES = [
  { id: 0, name: "Toy Story Mania",          park: "Hollywood Studios", avg: 54,  median: 50,  std: 30 },
  { id: 1, name: "Rock 'n' Roller Coaster",  park: "Hollywood Studios", avg: 59,  median: 55,  std: 32 },
  { id: 2, name: "Slinky Dog Dash",          park: "Hollywood Studios", avg: 73,  median: 70,  std: 28 },
  { id: 3, name: "Alien Swirling Saucers",   park: "Hollywood Studios", avg: 30,  median: 30,  std: 16 },
  { id: 4, name: "Seven Dwarfs Mine Train",  park: "Magic Kingdom",    avg: 77,  median: 70,  std: 34 },
  { id: 5, name: "Flight of Passage",        park: "Animal Kingdom",   avg: 115, median: 115, std: 54 },
  { id: 6, name: "Soarin'",                  park: "EPCOT",            avg: 46,  median: 40,  std: 27 },
  { id: 7, name: "Pirates of the Caribbean", park: "Magic Kingdom",    avg: 29,  median: 25,  std: 18 },
];
const SORTED_RIDES = [...RIDES].sort((a, b) => b.avg - a.avg);

const DAY_DATA = [
  { day: "Mon", avg: 62.3 }, { day: "Tue", avg: 58.4 }, { day: "Wed", avg: 56.2 },
  { day: "Thu", avg: 56.8 }, { day: "Fri", avg: 58.0 }, { day: "Sat", avg: 62.5 },
  { day: "Sun", avg: 59.0 },
];
const HOLIDAYS = [
  { period: "Christmas/New Years", avg: 79, pct: 43 },
  { period: "Thanksgiving",        avg: 68, pct: 25 },
  { period: "Spring Break",        avg: 67, pct: 22 },
  { period: "Summer Peak",         avg: 62, pct: 12 },
  { period: "Regular",             avg: 55, pct: 0  },
];
const SEASONS = [
  { season: "Winter", avg: 65 }, { season: "Spring", avg: 61 },
  { season: "Summer", avg: 60 }, { season: "Fall",   avg: 51 },
];
const PARK_COLORS: Record<string, string> = {
  "Hollywood Studios": "#D4A843",
  "Magic Kingdom":     "#7B8CDE",
  "Animal Kingdom":    "#6BBF7A",
  "EPCOT":             "#C17BDB",
};
const MONTHS    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_FULL = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const HOURS_LIST = [8,9,10,11,12,13,14,15,16,17,18,19,20,21];
const HS_HOURLY: Record<string, number[]> = {
  "Slinky Dog Dash":        [59,79,80,84,82,80,81,66,66,78,74,70,66,61],
  "Toy Story Mania":        [30,46,61,63,62,63,66,63,60,55,60,52,45,34],
  "Rock 'n' Roller Coaster":[24,42,66,72,66,66,66,70,66,66,60,59,55,50],
  "Alien Swirling Saucers": [18,27,39,41,39,36,36,35,33,30,27,26,22,15],
};

/* ── Helpers ── */
function getPrediction(rideId: number, month: number, dow: number, holiday: number): number {
  const bases       = [54,59,73,30,77,115,46,29];
  const monthFactor = [1.1,1.15,1.25,1.15,1.05,1.2,1.3,1.1,0.75,0.85,1.0,1.2];
  const dowFactor   = [1.03,0.97,0.93,0.94,0.96,1.04,0.98];
  const base = bases[rideId] * monthFactor[month - 1] * dowFactor[dow];
  return Math.round(holiday ? base * 1.3 : base);
}
function getWaitColor(m: number) {
  if (m <= 30) return "#6BBF7A";
  if (m <= 50) return "#A3C96B";
  if (m <= 70) return "#D4A843";
  if (m <= 90) return "#D48443";
  return "#D45A43";
}
function getWaitLabel(m: number) {
  if (m <= 30) return "Low";
  if (m <= 50) return "Moderate";
  if (m <= 70) return "High";
  if (m <= 90) return "Very High";
  return "Extreme";
}

/* ── Animated Bar ── */
function AnimatedBar({ value, max, color, delay = 0 }: {
  value: number; max: number; color: string; delay?: number;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW((value / max) * 100), 80 + delay);
    return () => clearTimeout(t);
  }, [value, max, delay]);

  return (
    <div className="h-7 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div
        className="h-full rounded-lg relative overflow-hidden"
        style={{
          width: `${w}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 0 14px ${color}35`,
        }}
      >
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: w > 0 ? "shimmer 2.5s ease infinite" : "none",
            opacity: 0.4,
          }}
        />
      </div>
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ icon, title, subtitle }: {
  icon: React.ReactNode; title: string; subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: "rgba(240,180,41,0.1)", color: "#F0B429" }}
      >
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
          {title}
        </h3>
        {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

/* ── Prediction Tab ── */
function PredictionTab() {
  const [ride, setRide]       = useState(0);
  const [month, setMonth]     = useState(6);
  const [dow, setDow]         = useState(2);
  const [holiday, setHoliday] = useState(0);
  const [show, setShow]       = useState(false);

  const pred     = getPrediction(ride, month, dow, holiday);
  const rideInfo = RIDES[ride];
  const allDow   = DAYS_FULL.map((_, i) => getPrediction(ride, month, i, holiday));
  const bestDow  = allDow.indexOf(Math.min(...allDow));
  const savings  = pred - allDow[bestDow];

  useEffect(() => {
    setShow(false);
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, [ride, month, dow, holiday]);

  const selStyle = { background: "var(--bg-card)", borderColor: "rgba(255,255,255,0.08)", color: "#e8e6f0" };
  const selClass = "w-full rounded-xl px-3 py-2.5 text-sm border focus:outline-none focus:border-[#F0B429] focus:ring-1 focus:ring-[#F0B429]/20 transition-all duration-200";

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <TiltCard className="glass-card rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(240,180,41,0.1)" }}>
            <Brain size={15} style={{ color: "#F0B429" }} />
          </div>
          <h3 className="text-sm font-semibold text-white flex-1" style={{ fontFamily: "var(--font-outfit)" }}>
            Wait time predictor
          </h3>
          <span
            className="text-xs px-3 py-1 rounded-full font-medium"
            style={{ background: "rgba(240,180,41,0.1)", color: "#F0B429", border: "1px solid rgba(240,180,41,0.22)" }}
          >
            Random Forest · R² = 0.58
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Attraction",   value: ride,    onChange: (v: number) => setRide(v),    options: RIDES.map(r => ({ v: r.id, l: r.name })) },
            { label: "Month",        value: month,   onChange: (v: number) => setMonth(v),   options: MONTHS.map((m,i) => ({ v: i+1, l: m })) },
            { label: "Day of week",  value: dow,     onChange: (v: number) => setDow(v),     options: DAYS_FULL.map((d,i) => ({ v: i, l: d })) },
            { label: "Holiday?",     value: holiday, onChange: (v: number) => setHoliday(v), options: [{ v:0, l:"Regular" }, { v:1, l:"Holiday period" }] },
          ].map(field => (
            <div key={field.label}>
              <label className="block mb-1.5 font-semibold tracking-widest uppercase" style={{ fontSize:"9px", color:"rgba(255,255,255,0.35)" }}>
                {field.label}
              </label>
              <select
                value={field.value}
                onChange={e => field.onChange(Number(e.target.value))}
                className={selClass}
                style={selStyle}
              >
                {field.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          ))}
        </div>

        <div className={`transition-all duration-400 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <div
            className="rounded-2xl p-6 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(15,20,48,0.95), rgba(10,14,36,0.95))",
              border: `1px solid ${getWaitColor(pred)}28`,
              boxShadow: `0 0 50px ${getWaitColor(pred)}12, inset 0 1px 0 rgba(255,255,255,0.05)`,
            }}
          >
            <div className="text-xs tracking-widest mb-3 font-semibold uppercase" style={{ color:"rgba(255,255,255,0.3)" }}>
              Predicted wait time
            </div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span style={{ color: getWaitColor(pred), opacity: 0.8 }}>{RIDE_ICONS[ride]}</span>
              <span
                className="text-7xl font-black tabular-nums leading-none"
                style={{
                  color: getWaitColor(pred),
                  fontFamily: "var(--font-outfit)",
                  textShadow: `0 0 40px ${getWaitColor(pred)}55`,
                }}
              >
                <AnimatedCounter to={pred} />
              </span>
              <span className="text-xl text-gray-500 font-light self-end pb-1">min</span>
            </div>
            <div
              className="text-xs font-semibold px-4 py-1.5 rounded-full inline-block mb-3"
              style={{ backgroundColor: getWaitColor(pred)+"18", color: getWaitColor(pred), border:`1px solid ${getWaitColor(pred)}30` }}
            >
              {getWaitLabel(pred)} wait
            </div>
            <div className="text-xs" style={{ color:"rgba(255,255,255,0.25)" }}>
              {rideInfo.name} · {MONTHS[month-1]} · {DAYS_FULL[dow]} · {holiday ? "Holiday" : "Regular"}
            </div>
          </div>

          {savings > 0 && dow !== bestDow && (
            <div
              className="flex items-start gap-3 mt-3 p-3.5 rounded-xl text-xs"
              style={{ background:"rgba(107,191,122,0.06)", border:"1px solid rgba(107,191,122,0.14)" }}
            >
              <Info size={14} className="text-green-400 mt-0.5 shrink-0" />
              <span className="text-gray-400">
                <span className="text-green-400 font-semibold">Tip: </span>
                Save ~{savings} min by visiting on {DAYS_FULL[bestDow]} instead
              </span>
            </div>
          )}
        </div>
      </TiltCard>

      <motion.div variants={stagger} className="grid md:grid-cols-2 gap-4">
        <TiltCard className="glass-card rounded-2xl p-5">
          <SectionHeader icon={<TrendingUp size={13} />} title="Model performance" />
          <div className="space-y-0">
            {[
              { l: "Algorithm",         v: "Random Forest",  c: "#D4A843" },
              { l: "R² Score",          v: "0.579",          c: "#6BBF7A" },
              { l: "Mean Abs. Error",   v: "±15 min",        c: "#D4A843" },
              { l: "Training Records",  v: "1,754,414",      c: "#7B8CDE" },
            ].map(item => (
              <div key={item.l} className="flex justify-between items-center py-2.5" style={{ borderBottom:"1px solid rgba(255,255,255,0.04)" }}>
                <span className="text-xs text-gray-500">{item.l}</span>
                <span className="text-sm font-mono font-bold tabular-nums" style={{ color:item.c }}>{item.v}</span>
              </div>
            ))}
          </div>
        </TiltCard>

        <TiltCard className="glass-card rounded-2xl p-5">
          <SectionHeader icon={<BarChart3 size={13} />} title="Feature importance" />
          <div className="space-y-3.5">
            {[
              { f:"Attraction",    v:80.3, c:"#F0B429" },
              { f:"Month",         v:10.0, c:"#7B8CDE" },
              { f:"Day of Week",   v:4.9,  c:"#6BBF7A" },
              { f:"Holiday Status",v:4.2,  c:"#C17BDB" },
              { f:"Weekend",       v:0.7,  c:"#D45A43" },
            ].map(item => (
              <div key={item.f}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">{item.f}</span>
                  <span className="font-bold tabular-nums" style={{ color:item.c }}>{item.v}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.05)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width:`${item.v}%` }}
                    transition={{ duration:1.1, delay:0.3, ease:[0.16,1,0.3,1] as const }}
                    style={{ background:`linear-gradient(90deg, ${item.c}70, ${item.c})`, boxShadow:`0 0 8px ${item.c}40` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </TiltCard>
      </motion.div>
    </motion.div>
  );
}


/* ── Park Photos (used as card backdrops) ── */
const PARK_PHOTOS: Record<string, string> = {
  "Hollywood Studios": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=60&fit=crop&auto=format",
  "Magic Kingdom":     "https://images.unsplash.com/photo-1563728991033-dc78f6e4fdb5?w=800&q=60&fit=crop&auto=format",
  "Animal Kingdom":    "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=60&fit=crop&auto=format",
  "EPCOT":             "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=60&fit=crop&auto=format",
};

/* ── Main Dashboard ── */
export default function Dashboard() {
  const [tab, setTab]       = useState("overview");
  const [mounted, setMounted] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroImgY  = useTransform(scrollY, [0, 400], [0, 80]);
  const heroTextY = useTransform(scrollY, [0, 400], [0, 30]);
  const heroOpacity = useTransform(scrollY, [0, 280], [1, 0.3]);

  useEffect(() => { setMounted(true); }, []);

  const tabs = [
    { id:"overview",  label:"Overview",    icon:<LayoutDashboard size={13} /> },
    { id:"rides",     label:"By Ride",     icon:<BarChart3 size={13} />       },
    { id:"predict",   label:"Predict",     icon:<Brain size={13} />            },
    { id:"timing",    label:"When to Go",  icon:<Calendar size={13} />         },
    { id:"hollywood", label:"Studios",     icon:<Clapperboard size={13} />     },
  ];

  return (
    <div className="min-h-screen" style={{ background:"var(--bg-deep)" }}>
      {/* Global overlays */}
      <CursorSpotlight />
      <div className="noise-overlay" />
      <div className="ambient-grid fixed inset-0 pointer-events-none" style={{ zIndex:0 }} />

      {/* ══════════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════════ */}
      <header ref={heroRef} className="relative overflow-hidden" style={{ minHeight:300, zIndex: 2 }}>

        {/* Background photo — fireworks night sky (parallax) */}
        <motion.div
          className="absolute inset-0 pointer-events-none select-none"
          style={{ y: heroImgY }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920&q=40&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            style={{ opacity: 0.18, filter: "blur(0.5px) saturate(1.3)", transform: "scale(1.1)" }}
          />
        </motion.div>

        {/* Layered atmospheric background */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              "radial-gradient(ellipse 800px 600px at 15% 120%, rgba(110,60,10,0.22) 0%, transparent 65%)",
              "radial-gradient(ellipse 600px 500px at 85% -20%, rgba(55,35,110,0.14) 0%, transparent 65%)",
              "radial-gradient(ellipse 500px 400px at 50% 130%, rgba(240,180,41,0.09) 0%, transparent 60%)",
              "radial-gradient(ellipse 300px 200px at 30% 80%,  rgba(107,70,200,0.07) 0%, transparent 60%)",
              "linear-gradient(180deg, #060919 0%, #08091c 55%, #0a0d22 100%)",
            ].join(", "),
          }}
        />

        {/* Breathing glow orb */}
        <div
          className="absolute pointer-events-none"
          style={{
            width:500, height:500, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(240,180,41,0.065) 0%, transparent 70%)",
            bottom:-160, left:"50%", transform:"translateX(-50%)",
            animation:"pulseGlow 5s ease-in-out infinite",
          }}
        />

        {/* Second subtle orb — purple/blue */}
        <div
          className="absolute pointer-events-none"
          style={{
            width:350, height:350, borderRadius:"50%",
            background:"radial-gradient(circle, rgba(100,80,220,0.07) 0%, transparent 70%)",
            top:-80, right:"10%",
            animation:"pulseGlow 7s ease-in-out infinite",
            animationDelay:"2s",
          }}
        />

        <SparkleField />

        <motion.div
          className="max-w-5xl mx-auto px-4 sm:px-6 pt-14 pb-6 relative"
          style={{ y: heroTextY, opacity: heroOpacity }}
        >
          <motion.div initial="hidden" animate={mounted ? "show" : "hidden"} variants={stagger}>

            {/* Castle + Title */}
            <motion.div variants={fadeUp} className="flex items-start gap-4 mb-3">
              <div className="shrink-0 mt-1">
                <CastleLogo
                  className="w-14 h-12 animate-castle-glow"
                  style={{ color:"#F0B429" }}
                />
              </div>
              <div>
                <h1
                  className="text-4xl md:text-5xl lg:text-6xl font-black leading-none gradient-text"
                  style={{ fontFamily:"var(--font-outfit)", letterSpacing:"-0.028em" }}
                >
                  WDW Wait Time Guide
                </h1>
                <p className="text-sm md:text-base mt-2" style={{ color:"rgba(255,255,255,0.35)" }}>
                  Plan smarter days at the parks · 1.75M+ wait time records analyzed
                </p>
              </div>
            </motion.div>

            {/* Stat badges */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-2 mb-5 ml-18">
              {[
                { tag:"8 attractions", color:"rgba(212,168,67,0.7)"  },
                { tag:"4 parks",       color:"rgba(107,191,122,0.7)" },
                { tag:"2015 – 2021",   color:"rgba(123,140,222,0.7)" },
                { tag:"ML predictions",color:"rgba(193,123,219,0.7)" },
              ].map(({ tag, color }, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{
                    background:"rgba(255,255,255,0.04)",
                    color,
                    border:"1px solid rgba(255,255,255,0.07)",
                    backdropFilter:"blur(8px)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </motion.div>

            {/* Navigation */}
            <motion.nav variants={fadeUp}>
              <div className="glass-nav inline-flex gap-0.5 p-1 rounded-xl">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 md:px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
                      tab === t.id ? "nav-active" : "text-gray-500 hover:text-gray-300"
                    }`}
                    style={{ fontFamily:"var(--font-outfit)" }}
                  >
                    {t.icon}
                    <span className="hidden sm:inline">{t.label}</span>
                  </button>
                ))}
              </div>
            </motion.nav>

          </motion.div>
        </motion.div>
      </header>

      {/* ══════════════════════════════════════════
          CONTENT
      ══════════════════════════════════════════ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-7 relative" style={{ zIndex: 2 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity:0, y:12 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-10 }}
            transition={{ duration:0.28, ease:[0.16,1,0.3,1] as const }}
          >

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <motion.div variants={stagger} initial="hidden" animate="show">

                {/* Stat cards */}
                <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    { l:"Total records",   counter:1754414, display:"1.75M+", s:"wait time observations", c:"#7B8CDE" },
                    { l:"Date range",      counter:null,    display:"7 Years", s:"Jan 2015 – Dec 2021",    c:"#C17BDB" },
                    { l:"Christmas peak",  counter:null,    display:"+43%",    s:"vs regular periods",     c:"#D45A43" },
                    { l:"Best day to go",  counter:null,    display:"Wed",     s:"56 min avg wait",        c:"#6BBF7A" },
                  ].map((s, i) => (
                    <TiltCard
                      key={i}
                      className="stat-card rounded-xl p-4"
                      style={{ borderLeftColor: s.c }}
                    >
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">{s.l}</div>
                      <div
                        className="text-2xl font-black tabular-nums"
                        style={{ color:s.c, fontFamily:"var(--font-outfit)", textShadow:`0 0 22px ${s.c}40` }}
                      >
                        {s.counter ? <AnimatedCounter to={s.counter} /> : s.display}
                      </div>
                      <div className="text-xs mt-1" style={{ color:"rgba(255,255,255,0.22)" }}>{s.s}</div>
                    </TiltCard>
                  ))}
                </motion.div>

                {/* Tip banner */}
                <motion.div
                  variants={cardVar}
                  className="flex items-center gap-3.5 p-4 rounded-xl mb-5"
                  style={{ background:"rgba(107,191,122,0.05)", border:"1px solid rgba(107,191,122,0.13)" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background:"rgba(107,191,122,0.12)" }}>
                    <Sparkles size={16} className="text-green-400" />
                  </div>
                  <p className="text-xs text-gray-400">
                    <span className="text-green-400 font-semibold">Quick tip: </span>
                    Visit on a Wednesday in the fall for the shortest waits — averaging just 51 minutes across all rides.
                  </p>
                </motion.div>

                {/* Charts grid */}
                <motion.div variants={stagger} className="grid md:grid-cols-2 gap-4">
                  <TiltCard className="glass-card rounded-2xl p-5">
                    <SectionHeader icon={<TrendingUp size={13} />} title="Holiday impact on wait times" />
                    <div className="space-y-3.5">
                      {HOLIDAYS.map((h, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-gray-500">{h.period}</span>
                            <span className="font-semibold tabular-nums" style={{ color:"rgba(255,255,255,0.7)" }}>
                              {h.avg} min
                              {h.pct > 0 && <span className="ml-1" style={{ color:"#D45A43" }}>+{h.pct}%</span>}
                            </span>
                          </div>
                          <AnimatedBar
                            value={h.avg} max={85}
                            color={h.period==="Regular" ? "#6BBF7A" : h.pct>30 ? "#D45A43" : "#D4A843"}
                            delay={i*80}
                          />
                        </div>
                      ))}
                    </div>
                  </TiltCard>

                  <TiltCard className="glass-card rounded-2xl p-5">
                    <SectionHeader icon={<Calendar size={13} />} title="Average wait by season" />
                    <div className="flex items-end gap-4 h-44 mt-6 px-2">
                      {SEASONS.map((s, i) => {
                        const h = (s.avg / 75) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <span className="text-sm font-bold text-white tabular-nums">{s.avg}</span>
                            <div
                              className="w-full rounded-lg relative overflow-hidden"
                              style={{
                                height: `${mounted ? h : 0}%`,
                                background: "linear-gradient(to top, #C89924, #F0B429, #FFE070)",
                                transition: "height 1s cubic-bezier(0.16,1,0.3,1)",
                                transitionDelay: `${i*130}ms`,
                                boxShadow: mounted ? "0 0 18px rgba(240,180,41,0.32)" : "none",
                                minHeight: 0,
                              }}
                            >
                              <div
                                style={{
                                  position:"absolute", inset:0,
                                  background:"linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                                  backgroundSize:"200% 100%",
                                  animation: mounted ? "shimmer 3s ease infinite" : "none",
                                  animationDelay: `${i*0.4}s`,
                                }}
                              />
                            </div>
                            <div className="text-xs text-gray-500">{s.season}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-600 text-center mt-4">Average minutes across all rides</div>
                  </TiltCard>
                </motion.div>
              </motion.div>
            )}

            {/* ── BY RIDE ── */}
            {tab === "rides" && (
              <motion.div variants={stagger} initial="hidden" animate="show">
                <TiltCard className="glass-card rounded-2xl p-6">
                  <SectionHeader
                    icon={<BarChart3 size={13} />}
                    title="Average wait by attraction"
                    subtitle="Sorted by average across all recorded periods"
                  />
                  <div className="space-y-4">
                    {SORTED_RIDES.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity:0, x:-14 }}
                        animate={{ opacity:1, x:0 }}
                        transition={{ delay:i*0.06, type:"spring", stiffness:120, damping:20 }}
                      >
                        <div className="flex justify-between text-xs mb-1.5 items-center gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-gray-200 font-medium truncate">{r.name}</span>
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] whitespace-nowrap hidden sm:inline-block"
                              style={{
                                background:`${PARK_COLORS[r.park]}14`,
                                color:PARK_COLORS[r.park],
                                border:`1px solid ${PARK_COLORS[r.park]}28`,
                              }}
                            >
                              {r.park}
                            </span>
                          </div>
                          <span className="font-bold text-white tabular-nums shrink-0">{r.avg} min</span>
                        </div>
                        <AnimatedBar value={r.avg} max={120} color={PARK_COLORS[r.park]} delay={i*70} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex gap-5 mt-5 pt-4 flex-wrap" style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                    {Object.entries(PARK_COLORS).map(([p, c]) => (
                      <div key={p} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor:c, boxShadow:`0 0 6px ${c}55` }} />
                        <span className="text-xs text-gray-500">{p}</span>
                      </div>
                    ))}
                  </div>
                </TiltCard>
              </motion.div>
            )}

            {/* ── PREDICT ── */}
            {tab === "predict" && <PredictionTab />}

            {/* ── WHEN TO GO ── */}
            {tab === "timing" && (
              <motion.div variants={stagger} initial="hidden" animate="show">

                {/* Best time banner */}
                <TiltCard className="glass-card rounded-2xl p-5 mb-4 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background:"linear-gradient(135deg, rgba(107,191,122,0.18), rgba(107,191,122,0.06))", border:"1px solid rgba(107,191,122,0.22)" }}
                  >
                    <Sparkles size={20} className="text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white mb-1" style={{ fontFamily:"var(--font-outfit)" }}>
                      Best time to visit
                    </div>
                    <div className="text-xs text-gray-500">
                      Wednesday in fall · Arrive at 8 AM or after 7 PM for the shortest waits
                    </div>
                  </div>
                </TiltCard>

                <motion.div variants={stagger} className="grid md:grid-cols-2 gap-4">
                  <TiltCard className="glass-card rounded-2xl p-5">
                    <SectionHeader icon={<Calendar size={13} />} title="Wait times by day of week" />
                    <div className="flex items-end gap-2 h-36">
                      {DAY_DATA.map((d, i) => {
                        const h   = ((d.avg - 50) / 15) * 100;
                        const isMin = d.avg <= 56.5;
                        const isMax = d.avg >= 62;
                        const col   = isMin ? "#6BBF7A" : isMax ? "#D45A43" : "#7B8CDE";
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                            <span className="text-xs font-bold text-white tabular-nums">{Math.round(d.avg)}</span>
                            <div
                              className="w-full rounded-md"
                              style={{
                                height: `${mounted ? h : 0}%`,
                                background: `linear-gradient(to top, ${col}80, ${col})`,
                                transition: "height 0.8s cubic-bezier(0.16,1,0.3,1)",
                                transitionDelay: `${i*60}ms`,
                                minHeight: 20,
                                boxShadow: mounted ? `0 0 10px ${col}30` : "none",
                              }}
                            />
                            <span className="text-xs text-gray-500">{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-4 mt-4 pt-3 text-xs" style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                      {[{ c:"#6BBF7A",l:"Best" },{ c:"#7B8CDE",l:"Average" },{ c:"#D45A43",l:"Busiest" }].map(({ c, l }) => (
                        <div key={l} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background:c, boxShadow:`0 0 6px ${c}60` }} />
                          <span className="text-gray-500">{l}</span>
                        </div>
                      ))}
                    </div>
                  </TiltCard>

                  <TiltCard className="glass-card rounded-2xl p-5">
                    <SectionHeader icon={<Clock size={13} />} title="Peak hours at the parks" />
                    <div className="space-y-3">
                      {[
                        { time:"11 AM",      label:"Peak — busiest hour",          avg:"70 min avg", type:"bad"  as const },
                        { time:"8 AM",       label:"Rope drop — arrive early",     avg:"43 min avg", type:"good" as const },
                        { time:"After 7 PM", label:"Evening — crowds thin out",    avg:"44 min avg", type:"good" as const },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-xl p-3.5"
                          style={{
                            background: item.type==="bad" ? "rgba(212,90,67,0.07)" : "rgba(107,191,122,0.07)",
                            border:`1px solid ${item.type==="bad" ? "rgba(212,90,67,0.14)" : "rgba(107,191,122,0.14)"}`,
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: item.type==="bad" ? "rgba(212,90,67,0.12)" : "rgba(107,191,122,0.12)" }}
                          >
                            <Clock size={14} style={{ color: item.type==="bad" ? "#D45A43" : "#6BBF7A" }} />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-bold" style={{ color: item.type==="bad" ? "#D45A43" : "#6BBF7A", fontFamily:"var(--font-outfit)" }}>
                              {item.time}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">{item.label}</div>
                          </div>
                          <span className="text-xs text-gray-500 tabular-nums font-medium">{item.avg}</span>
                        </div>
                      ))}
                    </div>
                  </TiltCard>
                </motion.div>
              </motion.div>
            )}

            {/* ── HOLLYWOOD STUDIOS ── */}
            {tab === "hollywood" && (
              <motion.div variants={stagger} initial="hidden" animate="show">

                {/* Heatmap */}
                <TiltCard className="glass-card rounded-2xl p-6 mb-4 relative overflow-hidden">
                  {/* Cinematic backdrop */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={PARK_PHOTOS["Hollywood Studios"]}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                    style={{ opacity: 0.07, filter: "blur(2px) saturate(1.4)" }}
                  />
                  <div className="relative z-10">
                  <SectionHeader
                    icon={<Clapperboard size={13} />}
                    title="Hollywood Studios hourly heatmap"
                    subtitle="Typical wait times by hour — hover cells for details"
                  />
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                      <div className="flex items-center mb-2">
                        <div className="w-44" />
                        <div className="flex-1 flex gap-0.5">
                          {HOURS_LIST.map(h => (
                            <div key={h} className="flex-1 text-center text-xs text-gray-600">
                              {h>12 ? h-12 : h}{h>=12?"p":"a"}
                            </div>
                          ))}
                        </div>
                      </div>
                      {Object.entries(HS_HOURLY).map(([ride, data]) => (
                        <div key={ride} className="flex items-center mb-1">
                          <div className="w-44 text-xs text-gray-300 text-right pr-4 truncate font-medium">{ride}</div>
                          <div className="flex-1 flex gap-0.5">
                            {data.map((val, i) => {
                              const intensity = Math.min(val / 85, 1);
                              return (
                                <div
                                  key={i}
                                  className="flex-1 h-8 rounded flex items-center justify-center text-xs font-semibold tabular-nums cursor-default transition-all duration-150 hover:scale-110 hover:z-10"
                                  title={`${ride}: ${val} min at ${HOURS_LIST[i]>12 ? HOURS_LIST[i]-12 : HOURS_LIST[i]}${HOURS_LIST[i]>=12?"PM":"AM"}`}
                                  style={{
                                    background:`rgba(240,${Math.round(180-intensity*138)},${Math.round(41-intensity*22)},${0.1+intensity*0.58})`,
                                    color: intensity>0.42 ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.32)",
                                    boxShadow: intensity>0.6 ? `0 0 8px rgba(240,${Math.round(60+(1-intensity)*100)},41,0.25)` : "none",
                                  }}
                                >
                                  {val}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      {/* Legend */}
                      <div className="flex items-center gap-2 mt-4 ml-44 text-xs text-gray-600">
                        <span>Short</span>
                        <div className="flex h-2.5 rounded overflow-hidden flex-1 max-w-[180px]">
                          {[0.1,0.18,0.28,0.38,0.48,0.56,0.65].map((o,i) => (
                            <div key={i} className="flex-1" style={{ background:`rgba(240,${Math.round(180-i*20)},41,${o})` }} />
                          ))}
                        </div>
                        <span>Long</span>
                      </div>
                    </div>
                  </div>
                  </div>{/* end z-10 wrapper */}
                </TiltCard>

                {/* Suggested order */}
                <TiltCard className="glass-card rounded-2xl p-6 mb-4">
                  <SectionHeader
                    icon={<MapPin size={13} />}
                    title="Suggested ride order"
                    subtitle="Minimize total wait time with this sequence"
                  />
                  <div className="space-y-2.5">
                    {[
                      { time:"8:00 AM",  ride:"Slinky Dog Dash",        wait:"59 min", note:"Rope drop — lines explode after 10 AM", hot:true  },
                      { time:"9:15 AM",  ride:"Rock 'n' Roller Coaster",wait:"42 min", note:"Ramps up fast — go early",             hot:false },
                      { time:"10:30 AM", ride:"Toy Story Mania",        wait:"61 min", note:"Steady mid-morning",                   hot:false },
                      { time:"Afternoon",ride:"Alien Swirling Saucers", wait:"36 min", note:"Never exceeds 41 min — save for last", hot:false },
                    ].map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity:0, x:-14 }}
                        animate={{ opacity:1, x:0 }}
                        transition={{ delay:i*0.07, type:"spring", stiffness:120, damping:20 }}
                        className="flex items-center gap-3.5 p-3.5 rounded-xl"
                        style={{
                          background: step.hot ? "rgba(240,180,41,0.06)" : "rgba(255,255,255,0.025)",
                          border:`1px solid ${step.hot ? "rgba(240,180,41,0.16)" : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 tabular-nums"
                          style={{ background:"rgba(240,180,41,0.12)", color:"#F0B429" }}
                        >
                          {i+1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-200">{step.ride}</span>
                            <ChevronRight size={10} className="text-gray-600 shrink-0" />
                            <span className="text-xs text-gray-500 truncate">{step.time}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">{step.note}</div>
                        </div>
                        <span
                          className="text-xs font-semibold tabular-nums shrink-0 px-2.5 py-1 rounded-lg"
                          style={{ background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.55)" }}
                        >
                          {step.wait}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </TiltCard>

                {/* Insider tips */}
                <TiltCard className="glass-card rounded-2xl p-6">
                  <SectionHeader
                    icon={<Info size={13} />}
                    title="Insider strategy"
                    subtitle="From crowd pattern analysis across 1.75M+ records"
                  />
                  <div className="space-y-2">
                    {[
                      "Hit Slinky Dog Dash at rope drop — 59 min vs 84 min at 11 AM",
                      "Rock 'n' Roller Coaster: before 9 AM or after 7 PM saves 30+ min",
                      "Alien Swirling Saucers never exceeds 41 min — save for the afternoon",
                      "Toy Story Mania waits drop nearly 50% after 7 PM",
                    ].map((tip, i) => (
                      <div key={i} className="flex gap-3 items-start p-2.5 rounded-lg hover:bg-white/[0.025] transition-colors">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                          style={{ background:"rgba(240,180,41,0.1)", color:"#F0B429" }}
                        >
                          {i+1}
                        </div>
                        <span className="text-sm text-gray-400">{tip}</span>
                      </div>
                    ))}
                  </div>
                </TiltCard>

              </motion.div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <footer
          className="text-center text-xs mt-12 pb-6 pt-6"
          style={{ borderTop:"1px solid rgba(255,255,255,0.05)", color:"rgba(255,255,255,0.16)" }}
        >
          Built by{" "}
          <span className="font-semibold" style={{ color:"rgba(255,255,255,0.32)" }}>Johnny Nguyen</span>
          {" "}· Data from Touring Plans · 1,754,414 records · Random Forest ML model
        </footer>
      </main>
    </div>
  );
}
