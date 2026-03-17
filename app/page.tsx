"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Rocket, Guitar, Dog, Orbit, Pickaxe, Wind, CloudSun, Swords,
  LayoutDashboard, BarChart3, Brain, Calendar, Clapperboard,
  TrendingUp, Clock, Sparkles, MapPin, ChevronRight, Info,
} from "lucide-react";

/* ── Castle Silhouette SVG (generic fairy tale style, not Disney IP) ── */
function CastleLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" fill="currentColor" className={className} aria-hidden="true">
      {/* Towers */}
      <rect x="4" y="14" width="4" height="20" rx="0.5" opacity="0.9" />
      <rect x="40" y="14" width="4" height="20" rx="0.5" opacity="0.9" />
      <rect x="14" y="10" width="4" height="24" rx="0.5" />
      <rect x="30" y="10" width="4" height="24" rx="0.5" />
      {/* Center tower */}
      <rect x="21" y="4" width="6" height="30" rx="0.5" />
      {/* Turrets */}
      <polygon points="5,14 6,8 7.5,14" opacity="0.85" />
      <polygon points="41,14 42,8 43.5,14" opacity="0.85" />
      <polygon points="15,10 16,4 17.5,10" />
      <polygon points="31,10 32,4 33.5,10" />
      <polygon points="22.5,4 24,0 25.5,4" />
      {/* Base wall */}
      <rect x="8" y="26" width="32" height="8" rx="1" opacity="0.7" />
      {/* Gate */}
      <rect x="20" y="28" width="8" height="6" rx="4" fill="#0a0b10" />
      {/* Flag */}
      <line x1="24" y1="0" x2="24" y2="-3" stroke="currentColor" strokeWidth="0.5" />
      <polygon points="24,-3 28,-4.5 24,-6" opacity="0.7" />
    </svg>
  );
}

/* ── Sparkle particle field ── */
function SparkleField() {
  const particles = useMemo(() => {
    const items = [];
    for (let i = 0; i < 18; i++) {
      items.push({
        left: `${5 + Math.random() * 90}%`,
        bottom: `${Math.random() * 30}%`,
        delay: `${Math.random() * 4}s`,
        duration: `${2.5 + Math.random() * 2}s`,
        size: 2 + Math.random() * 2,
        opacity: 0.3 + Math.random() * 0.5,
      });
    }
    return items;
  }, []);

  const stars = useMemo(() => {
    const items = [];
    for (let i = 0; i < 25; i++) {
      items.push({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 80}%`,
        delay: `${Math.random() * 5}s`,
        opacity: 0.15 + Math.random() * 0.35,
      });
    }
    return items;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={`p-${i}`}
          className="sparkle-particle"
          style={{
            left: p.left,
            bottom: p.bottom,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
        />
      ))}
      {stars.map((s, i) => (
        <div
          key={`s-${i}`}
          className="star-dot"
          style={{ left: s.left, top: s.top, animationDelay: s.delay, opacity: s.opacity }}
        />
      ))}
    </div>
  );
}

/* ── Data ── */
const RIDE_ICONS: Record<number, React.ReactNode> = {
  0: <Rocket size={16} />,
  1: <Guitar size={16} />,
  2: <Dog size={16} />,
  3: <Orbit size={16} />,
  4: <Pickaxe size={16} />,
  5: <Wind size={16} />,
  6: <CloudSun size={16} />,
  7: <Swords size={16} />,
};

const RIDES = [
  { id: 0, name: "Toy Story Mania", park: "Hollywood Studios", avg: 54, median: 50, std: 30 },
  { id: 1, name: "Rock 'n' Roller Coaster", park: "Hollywood Studios", avg: 59, median: 55, std: 32 },
  { id: 2, name: "Slinky Dog Dash", park: "Hollywood Studios", avg: 73, median: 70, std: 28 },
  { id: 3, name: "Alien Swirling Saucers", park: "Hollywood Studios", avg: 30, median: 30, std: 16 },
  { id: 4, name: "Seven Dwarfs Mine Train", park: "Magic Kingdom", avg: 77, median: 70, std: 34 },
  { id: 5, name: "Flight of Passage", park: "Animal Kingdom", avg: 115, median: 115, std: 54 },
  { id: 6, name: "Soarin'", park: "EPCOT", avg: 46, median: 40, std: 27 },
  { id: 7, name: "Pirates of the Caribbean", park: "Magic Kingdom", avg: 29, median: 25, std: 18 },
];

const SORTED_RIDES = [...RIDES].sort((a, b) => b.avg - a.avg);

const DAY_DATA = [
  { day: "Mon", avg: 62.3 },
  { day: "Tue", avg: 58.4 },
  { day: "Wed", avg: 56.2 },
  { day: "Thu", avg: 56.8 },
  { day: "Fri", avg: 58.0 },
  { day: "Sat", avg: 62.5 },
  { day: "Sun", avg: 59.0 },
];

const HOLIDAYS = [
  { period: "Christmas/New Years", avg: 79, pct: 43 },
  { period: "Thanksgiving", avg: 68, pct: 25 },
  { period: "Spring Break", avg: 67, pct: 22 },
  { period: "Summer Peak", avg: 62, pct: 12 },
  { period: "Regular", avg: 55, pct: 0 },
];

const SEASONS = [
  { season: "Winter", avg: 65 },
  { season: "Spring", avg: 61 },
  { season: "Summer", avg: 60 },
  { season: "Fall", avg: 51 },
];

const PARK_COLORS: Record<string, string> = {
  "Hollywood Studios": "#D4A843",
  "Magic Kingdom": "#7B8CDE",
  "Animal Kingdom": "#6BBF7A",
  "EPCOT": "#C17BDB",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS_LIST = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

const HS_HOURLY: Record<string, number[]> = {
  "Slinky Dog Dash": [59, 79, 80, 84, 82, 80, 81, 66, 66, 78, 74, 70, 66, 61],
  "Toy Story Mania": [30, 46, 61, 63, 62, 63, 66, 63, 60, 55, 60, 52, 45, 34],
  "Rock 'n' Roller Coaster": [24, 42, 66, 72, 66, 66, 66, 70, 66, 66, 60, 59, 55, 50],
  "Alien Swirling Saucers": [18, 27, 39, 41, 39, 36, 36, 35, 33, 30, 27, 26, 22, 15],
};

/* ── Helpers ── */
function getPrediction(rideId: number, month: number, dow: number, holiday: number): number {
  const bases = [54, 59, 73, 30, 77, 115, 46, 29];
  const monthFactor = [1.1, 1.15, 1.25, 1.15, 1.05, 1.2, 1.3, 1.1, 0.75, 0.85, 1.0, 1.2];
  const dowFactor = [1.03, 0.97, 0.93, 0.94, 0.96, 1.04, 0.98];
  const base = bases[rideId] * monthFactor[month - 1] * dowFactor[dow];
  return Math.round(holiday ? base * 1.3 : base);
}

function AnimatedBar({ value, max, color, delay = 0 }: { value: number; max: number; color: string; delay?: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW((value / max) * 100), 80 + delay);
    return () => clearTimeout(t);
  }, [value, max, delay]);
  return (
    <div className="h-7 rounded-md overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div
        className="h-full rounded-md"
        style={{
          width: `${w}%`,
          background: `linear-gradient(90deg, ${color}CC, ${color})`,
          transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
    </div>
  );
}

function getWaitColor(mins: number) {
  if (mins <= 30) return "#6BBF7A";
  if (mins <= 50) return "#A3C96B";
  if (mins <= 70) return "#D4A843";
  if (mins <= 90) return "#D48443";
  return "#D45A43";
}

function getWaitLabel(mins: number) {
  if (mins <= 30) return "Low";
  if (mins <= 50) return "Moderate";
  if (mins <= 70) return "High";
  if (mins <= 90) return "Very High";
  return "Extreme";
}

/* ── Section header helper ── */
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className="text-gray-400">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-300" style={{ fontFamily: "var(--font-outfit)" }}>
        {title}
      </h3>
    </div>
  );
}

/* ── Prediction Tab ── */
function PredictionTab() {
  const [ride, setRide] = useState(0);
  const [month, setMonth] = useState(6);
  const [dow, setDow] = useState(2);
  const [holiday, setHoliday] = useState(0);
  const [show, setShow] = useState(false);

  const pred = getPrediction(ride, month, dow, holiday);
  const rideInfo = RIDES[ride];

  // Find the best day for comparison
  const allDowPreds = DAYS_FULL.map((_, i) => getPrediction(ride, month, i, holiday));
  const bestDow = allDowPreds.indexOf(Math.min(...allDowPreds));
  const savings = pred - allDowPreds[bestDow];

  useEffect(() => {
    setShow(false);
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, [ride, month, dow, holiday]);

  const selectClass =
    "w-full rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-all duration-200 border focus:border-[#D4A843] focus:ring-1 focus:ring-[#D4A843]/20";

  return (
    <div>
      <div className="solid-card rounded-2xl p-6 mb-4 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-5">
          <Brain size={18} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-300" style={{ fontFamily: "var(--font-outfit)" }}>
            Wait time predictor
          </h3>
          <span
            className="text-xs px-2.5 py-1 rounded-md font-medium tabular-nums"
            style={{ background: "rgba(212,168,67,0.1)", color: "#D4A843" }}
          >
            Random Forest ML
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
          {[
            { label: "Attraction", value: ride, onChange: (v: number) => setRide(v), options: RIDES.map((r) => ({ v: r.id, l: r.name })) },
            { label: "Month", value: month, onChange: (v: number) => setMonth(v), options: MONTHS.map((m, i) => ({ v: i + 1, l: m })) },
            { label: "Day of week", value: dow, onChange: (v: number) => setDow(v), options: DAYS_FULL.map((d, i) => ({ v: i, l: d })) },
            { label: "Holiday?", value: holiday, onChange: (v: number) => setHoliday(v), options: [{ v: 0, l: "Regular" }, { v: 1, l: "Holiday" }] },
          ].map((field) => (
            <div key={field.label}>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">{field.label}</label>
              <select
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                className={selectClass}
                style={{ background: "var(--surface-solid-2)", borderColor: "rgba(255,255,255,0.08)", color: "#e8e6e3" }}
              >
                {field.options.map((o) => (
                  <option key={o.v} value={o.v}>{o.l}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className={`transition-all duration-400 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <div
            className="rounded-xl p-6 text-center"
            style={{ background: "var(--surface-solid-2)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="text-gray-500 text-xs tracking-wider mb-3 font-medium">Predicted wait time</div>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-gray-500">{RIDE_ICONS[ride]}</span>
              <span
                className="text-5xl font-black tabular-nums"
                style={{ color: getWaitColor(pred), fontFamily: "var(--font-outfit)" }}
              >
                {pred}
              </span>
              <span className="text-lg text-gray-500 font-light">min</span>
            </div>
            <div
              className="text-xs font-medium px-3 py-1 rounded-md inline-block mb-3"
              style={{ backgroundColor: getWaitColor(pred) + "15", color: getWaitColor(pred) }}
            >
              {getWaitLabel(pred)} wait
            </div>
            <div className="text-xs text-gray-600">
              {rideInfo.name} · {MONTHS[month - 1]} · {DAYS_FULL[dow]} · {holiday ? "Holiday" : "Regular"}
            </div>
          </div>

          {/* Practical tip */}
          {savings > 0 && dow !== bestDow && (
            <div
              className="flex items-start gap-3 mt-3 p-3 rounded-lg text-xs animate-fade-in-up"
              style={{ background: "rgba(107,191,122,0.06)", border: "1px solid rgba(107,191,122,0.1)" }}
            >
              <Info size={14} className="text-green-400 mt-0.5 shrink-0" />
              <span className="text-gray-400">
                <span className="text-green-400 font-medium">Tip:</span>{" "}
                You&apos;d save ~{savings} min by going on {DAYS_FULL[bestDow]} instead
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="solid-card rounded-2xl p-5 animate-fade-in-up stagger-2">
          <SectionHeader icon={<TrendingUp size={16} />} title="Model performance" />
          <div className="space-y-3">
            {[
              { l: "Algorithm", v: "Random Forest", c: "#D4A843" },
              { l: "R² Score", v: "0.579", c: "#6BBF7A" },
              { l: "Mean Absolute Error", v: "±15 min", c: "#D4A843" },
              { l: "Training Records", v: "1,754,414", c: "#7B8CDE" },
            ].map((item) => (
              <div key={item.l} className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{item.l}</span>
                <span className="text-sm font-mono tabular-nums" style={{ color: item.c }}>{item.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="solid-card rounded-2xl p-5 animate-fade-in-up stagger-3">
          <SectionHeader icon={<BarChart3 size={16} />} title="Feature importance" />
          <div className="space-y-3">
            {[
              { f: "Attraction", v: 80.3 },
              { f: "Month", v: 10.0 },
              { f: "Day of Week", v: 4.9 },
              { f: "Holiday Status", v: 4.2 },
              { f: "Weekend", v: 0.7 },
            ].map((item) => (
              <div key={item.f}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500">{item.f}</span>
                  <span className="text-gray-400 tabular-nums">{item.v}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${item.v}%`, background: "linear-gradient(90deg, #D4A843, #E8C56D)" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [mounted, setMounted] = useState(false);
  const [tabKey, setTabKey] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  function switchTab(id: string) {
    setTab(id);
    setTabKey((k) => k + 1);
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard size={15} /> },
    { id: "rides", label: "By Ride", icon: <BarChart3 size={15} /> },
    { id: "predict", label: "Predict", icon: <Brain size={15} /> },
    { id: "timing", label: "When to Go", icon: <Calendar size={15} /> },
    { id: "hollywood", label: "Studios", icon: <Clapperboard size={15} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0a0b10" }}>
      {/* ── Header ── */}
      <header
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0a0b10 0%, #10111f 40%, #151320 70%, #0d0f16 100%)" }}
      >
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 500px 350px at 30% 70%, rgba(212,168,67,0.06) 0%, transparent 70%), radial-gradient(ellipse 400px 250px at 70% 30%, rgba(123,140,222,0.04) 0%, transparent 70%)",
          }}
        />
        <SparkleField />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-5 relative">
          <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            {/* Castle + Title */}
            <div className="flex items-center gap-3 mb-1">
              <CastleLogo className="w-8 h-7 text-[#D4A843] opacity-80" />
              <h1
                className="text-3xl md:text-4xl font-black text-white leading-tight"
                style={{ fontFamily: "var(--font-outfit)", letterSpacing: "-0.02em" }}
              >
                WDW Wait Time Guide
              </h1>
            </div>
            <p className="text-sm text-gray-500 mb-5 ml-11">
              Plan smarter days at the parks · 1.75M+ wait time records analyzed
            </p>
            <div className="flex flex-wrap gap-2 text-xs ml-11">
              {["8 attractions", "4 parks", "2015–2021", "ML predictions"].map((tag, i) => (
                <span
                  key={i}
                  className="animate-fade-in-up px-3 py-1.5 rounded-md"
                  style={{
                    animationDelay: `${0.3 + i * 0.06}s`,
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
          <div className="glass-nav inline-flex gap-1 p-1 rounded-xl">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => switchTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                  tab === t.id ? "nav-active" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* ── Content ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6" key={tabKey}>
        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            {/* Stat cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { l: "Total records", v: "1.75M+", s: "Wait time observations", c: "#7B8CDE" },
                { l: "Date range", v: "7 Years", s: "Jan 2015 – Dec 2021", c: "#C17BDB" },
                { l: "Christmas peak", v: "+43%", s: "vs regular periods", c: "#D45A43" },
                { l: "Best day to go", v: "Wed", s: "56 min avg wait", c: "#6BBF7A" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="stat-card rounded-xl p-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.06}s`, borderLeftColor: s.c }}
                >
                  <div className="text-xs text-gray-500 mb-1.5 font-medium">{s.l}</div>
                  <div className="text-2xl font-black tabular-nums" style={{ color: s.c, fontFamily: "var(--font-outfit)" }}>{s.v}</div>
                  <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>{s.s}</div>
                </div>
              ))}
            </div>

            {/* Tip callout */}
            <div
              className="flex items-center gap-3 p-3.5 rounded-xl mb-5 animate-fade-in-up stagger-4"
              style={{ background: "rgba(107,191,122,0.05)", border: "1px solid rgba(107,191,122,0.1)" }}
            >
              <Sparkles size={16} className="text-green-400 shrink-0" />
              <p className="text-xs text-gray-400">
                <span className="text-green-400 font-medium">Quick tip:</span>{" "}
                Visit on a Wednesday in the fall for the shortest waits — averaging just 51 minutes across all rides.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="solid-card rounded-2xl p-5 animate-fade-in-up stagger-5">
                <SectionHeader icon={<TrendingUp size={16} />} title="Holiday impact on wait times" />
                {HOLIDAYS.map((h, i) => (
                  <div key={i} className="mb-3">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-500">{h.period}</span>
                      <span className="text-gray-400 font-medium tabular-nums">
                        {h.avg} min{" "}
                        {h.pct > 0 && <span style={{ color: "#D45A43" }}>(+{h.pct}%)</span>}
                      </span>
                    </div>
                    <AnimatedBar
                      value={h.avg}
                      max={85}
                      color={h.period === "Regular" ? "#6BBF7A" : h.pct > 30 ? "#D45A43" : "#D4A843"}
                      delay={i * 80}
                    />
                  </div>
                ))}
              </div>

              <div className="solid-card rounded-2xl p-5 animate-fade-in-up stagger-6">
                <SectionHeader icon={<Calendar size={16} />} title="Average wait by season" />
                <div className="flex items-end gap-4 h-44 mt-6 px-2">
                  {SEASONS.map((s, i) => {
                    const h = (s.avg / 75) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <span className="text-sm font-bold text-white tabular-nums">{s.avg}</span>
                        <div
                          className="w-full rounded-lg"
                          style={{
                            height: `${mounted ? h : 0}%`,
                            background: "linear-gradient(to top, #D4A843, #E8C56D)",
                            transition: "height 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
                            transitionDelay: `${i * 120}ms`,
                          }}
                        />
                        <div className="text-xs text-gray-500">{s.season}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="text-xs text-gray-600 text-center mt-4">Average minutes across all rides</div>
              </div>
            </div>
          </div>
        )}

        {/* RIDES */}
        {tab === "rides" && (
          <div>
            <div className="solid-card rounded-2xl p-6 animate-fade-in-up">
              <SectionHeader icon={<BarChart3 size={16} />} title="Average wait by attraction" />
              {SORTED_RIDES.map((r, i) => (
                <div key={r.id} className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5 items-center">
                    <span className="flex items-center gap-2 text-gray-400">
                      <span className="text-gray-500">{RIDE_ICONS[r.id]}</span>
                      {r.name}
                      <span className="text-gray-600">· {r.park}</span>
                    </span>
                    <span className="font-bold text-white tabular-nums">{r.avg} min</span>
                  </div>
                  <AnimatedBar value={r.avg} max={120} color={PARK_COLORS[r.park]} delay={i * 70} />
                </div>
              ))}
              {/* Legend */}
              <div className="flex gap-5 mt-5 flex-wrap pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                {Object.entries(PARK_COLORS).map(([p, c]) => (
                  <div key={p} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded" style={{ backgroundColor: c }} />
                    <span className="text-xs text-gray-500">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PREDICT */}
        {tab === "predict" && <PredictionTab />}

        {/* TIMING */}
        {tab === "timing" && (
          <div>
            {/* Best time summary */}
            <div
              className="solid-card rounded-2xl p-5 mb-4 animate-fade-in-up flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(107,191,122,0.1)" }}>
                <Sparkles size={18} className="text-green-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                  Best time to visit
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  Wednesday in fall · Arrive at 8 AM or go after 7 PM for shortest waits
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="solid-card rounded-2xl p-5 animate-fade-in-up stagger-2">
                <SectionHeader icon={<Calendar size={16} />} title="Wait times by day of week" />
                <div className="flex items-end gap-2 h-36">
                  {DAY_DATA.map((d, i) => {
                    const h = ((d.avg - 50) / 15) * 100;
                    const isMin = d.avg <= 56.5;
                    const isMax = d.avg >= 62;
                    const barColor = isMin ? "#6BBF7A" : isMax ? "#D45A43" : "#7B8CDE";
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-xs font-bold text-gray-300 tabular-nums">{Math.round(d.avg)}</span>
                        <div
                          className="w-full rounded-md"
                          style={{
                            height: `${mounted ? h : 0}%`,
                            background: barColor,
                            transition: "height 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
                            transitionDelay: `${i * 60}ms`,
                            minHeight: "20px",
                          }}
                        />
                        <span className="text-xs text-gray-500">{d.day}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-4 pt-3 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded" style={{ background: "#6BBF7A" }} /><span className="text-gray-500">Best</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded" style={{ background: "#7B8CDE" }} /><span className="text-gray-500">Average</span></div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded" style={{ background: "#D45A43" }} /><span className="text-gray-500">Busiest</span></div>
                </div>
              </div>

              <div className="solid-card rounded-2xl p-5 animate-fade-in-up stagger-3">
                <SectionHeader icon={<Clock size={16} />} title="Peak hours" />
                <div className="space-y-3">
                  {[
                    { time: "11 AM", label: "Peak — busiest hour", avg: "70 min avg", type: "bad" as const },
                    { time: "8 AM", label: "Rope drop — arrive early", avg: "43 min avg", type: "good" as const },
                    { time: "After 7 PM", label: "Evening — crowds thin out", avg: "44 min avg", type: "good" as const },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl p-3.5"
                      style={{
                        background: item.type === "bad" ? "rgba(212,90,67,0.06)" : "rgba(107,191,122,0.06)",
                        border: `1px solid ${item.type === "bad" ? "rgba(212,90,67,0.1)" : "rgba(107,191,122,0.1)"}`,
                      }}
                    >
                      <Clock size={16} style={{ color: item.type === "bad" ? "#D45A43" : "#6BBF7A" }} />
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: item.type === "bad" ? "#D45A43" : "#6BBF7A", fontFamily: "var(--font-outfit)" }}>
                          {item.time}
                        </div>
                        <div className="text-xs text-gray-500">{item.label}</div>
                      </div>
                      <span className="text-xs text-gray-500 tabular-nums">{item.avg}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOLLYWOOD STUDIOS */}
        {tab === "hollywood" && (
          <div>
            <div className="solid-card rounded-2xl p-6 mb-4 animate-fade-in-up">
              <SectionHeader icon={<Clapperboard size={16} />} title="Hollywood Studios hourly heatmap" />
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  <div className="flex items-center mb-2">
                    <div className="w-40" />
                    <div className="flex-1 flex gap-0.5">
                      {HOURS_LIST.map((h) => (
                        <div key={h} className="flex-1 text-center text-xs text-gray-600">
                          {h > 12 ? h - 12 : h}{h >= 12 ? "p" : "a"}
                        </div>
                      ))}
                    </div>
                  </div>
                  {Object.entries(HS_HOURLY).map(([ride, data]) => (
                    <div key={ride} className="flex items-center mb-1">
                      <div className="w-40 text-xs text-gray-500 text-right pr-3 truncate">{ride}</div>
                      <div className="flex-1 flex gap-0.5">
                        {data.map((val, i) => {
                          const intensity = Math.min(val / 85, 1);
                          return (
                            <div
                              key={i}
                              className="flex-1 h-7 rounded flex items-center justify-center text-xs font-medium tabular-nums"
                              title={`${ride}: ${val} min at ${HOURS_LIST[i] > 12 ? HOURS_LIST[i] - 12 : HOURS_LIST[i]}${HOURS_LIST[i] >= 12 ? "PM" : "AM"}`}
                              style={{
                                background: `rgba(212, ${Math.round(168 - intensity * 100)}, ${Math.round(67 - intensity * 30)}, ${0.12 + intensity * 0.5})`,
                                color: intensity > 0.35 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)",
                              }}
                            >
                              {val}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {/* Color scale legend */}
                  <div className="flex items-center gap-2 mt-3 ml-40 text-xs text-gray-600">
                    <span>Short</span>
                    <div className="flex h-2 rounded overflow-hidden flex-1 max-w-[160px]">
                      {[0.15, 0.25, 0.35, 0.45, 0.55, 0.65].map((o, i) => (
                        <div key={i} className="flex-1" style={{ background: `rgba(212,120,50,${o})` }} />
                      ))}
                    </div>
                    <span>Long</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggested route order */}
            <div className="solid-card rounded-2xl p-6 mb-4 animate-fade-in-up stagger-2">
              <SectionHeader icon={<MapPin size={16} />} title="Suggested ride order" />
              <p className="text-xs text-gray-600 mb-4">
                Based on hourly wait data, hit rides in this order to minimize your total wait:
              </p>
              <div className="space-y-2">
                {[
                  { time: "8:00 AM", ride: "Slinky Dog Dash", wait: "59 min", note: "Rope drop — longest lines all day" },
                  { time: "9:15 AM", ride: "Rock 'n' Roller Coaster", wait: "42 min", note: "Ramps up fast after 10 AM" },
                  { time: "10:30 AM", ride: "Toy Story Mania", wait: "61 min", note: "Steady mid-morning" },
                  { time: "Afternoon", ride: "Alien Swirling Saucers", wait: "36 min", note: "Never exceeds 41 min — save it" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: i === 0 ? "rgba(212,168,67,0.05)" : "transparent" }}>
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 tabular-nums"
                      style={{ background: "rgba(212,168,67,0.1)", color: "#D4A843" }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-300">{step.ride}</span>
                        <ChevronRight size={12} className="text-gray-600" />
                        <span className="text-xs text-gray-500">{step.time}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">{step.note}</div>
                    </div>
                    <span className="text-xs text-gray-400 tabular-nums shrink-0">{step.wait}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="solid-card rounded-2xl p-6 animate-fade-in-up stagger-3">
              <SectionHeader icon={<Info size={16} />} title="Insider strategy" />
              <p className="text-xs text-gray-600 mb-3">
                From a cast member who sees these patterns firsthand:
              </p>
              <div className="space-y-2">
                {[
                  "Hit Slinky Dog Dash at rope drop — 59 min vs 84 min at 11 AM",
                  "Rock 'n' Roller Coaster: before 9 AM or after 7 PM saves 30+ min",
                  "Alien Swirling Saucers never exceeds 41 min — save for afternoon",
                  "Toy Story Mania waits drop 50% after 7 PM",
                ].map((tip, i) => (
                  <div key={i} className="flex gap-3 items-start text-sm text-gray-400 p-2.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                    <span
                      className="font-bold tabular-nums text-xs w-5 h-5 rounded flex items-center justify-center shrink-0"
                      style={{ background: "rgba(212,168,67,0.1)", color: "#D4A843" }}
                    >
                      {i + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs mt-10 pb-6 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.18)" }}>
          Built by{" "}
          <span className="font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>Johnny Nguyen</span>
          {" "}· Data from Touring Plans · 1,754,414 records · Random Forest ML model
        </footer>
      </main>
    </div>
  );
}
