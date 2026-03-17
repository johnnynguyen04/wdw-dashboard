"use client"

import { useState, useRef, useCallback, useEffect, memo } from "react"
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
  useScroll,
  useInView,
  animate,
} from "framer-motion"
import {
  Clock,
  TrendingDown,
  Brain,
  ArrowRight,
  Calendar,
  Star,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

// ================================================================
// DATA CONSTANTS
// ================================================================

const RIDES = [
  { id: "tsm",    name: "Toy Story Mania",          park: "Hollywood Studios", avg: 54,  median: 50,  std: 30 },
  { id: "rnr",    name: "Rock 'n' Roller Coaster",  park: "Hollywood Studios", avg: 59,  median: 55,  std: 32 },
  { id: "sdd",    name: "Slinky Dog Dash",           park: "Hollywood Studios", avg: 73,  median: 70,  std: 28 },
  { id: "ass",    name: "Alien Swirling Saucers",    park: "Hollywood Studios", avg: 30,  median: 30,  std: 16 },
  { id: "sdmt",   name: "Seven Dwarfs Mine Train",   park: "Magic Kingdom",    avg: 77,  median: 70,  std: 34 },
  { id: "fop",    name: "Flight of Passage",         park: "Animal Kingdom",   avg: 115, median: 115, std: 54 },
  { id: "soarin", name: "Soarin'",                   park: "EPCOT",            avg: 46,  median: 40,  std: 27 },
  { id: "potc",   name: "Pirates of the Caribbean",  park: "Magic Kingdom",    avg: 29,  median: 25,  std: 18 },
] as const

const PARK_META: Record<string, { color: string; bg: string; border: string; abbrev: string }> = {
  "Hollywood Studios": { color: "#C8922A", bg: "rgba(200,146,42,0.08)",  border: "rgba(200,146,42,0.28)", abbrev: "DHS" },
  "Magic Kingdom":     { color: "#4A7FC1", bg: "rgba(74,127,193,0.08)",  border: "rgba(74,127,193,0.28)", abbrev: "MK"  },
  "Animal Kingdom":    { color: "#5A9E6F", bg: "rgba(90,158,111,0.08)",  border: "rgba(90,158,111,0.28)", abbrev: "DAK" },
  "EPCOT":             { color: "#8B6BB5", bg: "rgba(139,107,181,0.08)", border: "rgba(139,107,181,0.28)", abbrev: "EP" },
}

const DAYS = [
  { day: "Mon", avg: 61.8 },
  { day: "Tue", avg: 59.3 },
  { day: "Wed", avg: 56.2 },
  { day: "Thu", avg: 60.1 },
  { day: "Fri", avg: 65.7 },
  { day: "Sat", avg: 72.4 },
  { day: "Sun", avg: 70.8 },
]

const HOLIDAYS = [
  { name: "Christmas / New Year's", impact: 43, period: "Dec 25 – Jan 1"       },
  { name: "Thanksgiving",           impact: 25, period: "Late November"         },
  { name: "Spring Break",           impact: 22, period: "March – April"         },
  { name: "Summer Peak",            impact: 12, period: "June – August"         },
  { name: "Columbus Day Weekend",   impact: 8,  period: "Second Mon in Oct"     },
]

const SEASONS = [
  { name: "Winter", avg: 65.2, months: "Dec–Feb", best: false },
  { name: "Spring", avg: 72.8, months: "Mar–May", best: false },
  { name: "Summer", avg: 74.1, months: "Jun–Aug", best: false },
  { name: "Fall",   avg: 58.9, months: "Sep–Nov", best: true  },
]

const HS_HOURLY: Record<string, number[]> = {
  "Toy Story Mania":         [45,50,60,68,72,75,70,65,58,50,40,35,30,28],
  "Rock 'n' Roller Coaster": [40,50,62,70,75,78,72,65,55,48,40,35,30,28],
  "Slinky Dog Dash":         [35,50,68,78,88,92,88,80,70,60,48,40,32,28],
  "Alien Swirling Saucers":  [18,22,28,32,36,38,35,30,26,22,18,15,12,10],
}

const HOURS_LABELS = ["8AM","9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM","5PM","6PM","7PM","8PM","9PM"]

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

const MONTH_FACTORS = [0.85,0.80,1.15,1.20,1.10,1.25,1.30,1.28,0.90,0.85,0.82,1.35]

const FEATURE_IMPORTANCE = [
  { feature: "Attraction",     pct: 80.3 },
  { feature: "Month",          pct: 10.0 },
  { feature: "Day of Week",    pct:  4.9 },
  { feature: "Holiday Status", pct:  4.2 },
  { feature: "Weekend",        pct:  0.7 },
]

const NAV_ITEMS = [
  { id: "overview", label: "Overview"   },
  { id: "rides",    label: "By Ride"    },
  { id: "predict",  label: "Predict"    },
  { id: "timing",   label: "When to Go" },
  { id: "studios",  label: "Studios"    },
]

// ================================================================
// UTILITIES
// ================================================================

function getHeatColor(value: number): string {
  const ratio = Math.max(0, Math.min(1, (value - 10) / 82))
  if (ratio < 0.4) {
    const t = ratio / 0.4
    return `rgba(${Math.round(42 + 138 * t)}, ${Math.round(150 - 10 * t)}, ${Math.round(68 - 20 * t)}, 0.88)`
  } else if (ratio < 0.7) {
    const t = (ratio - 0.4) / 0.3
    return `rgba(${Math.round(180 + 20 * t)}, ${Math.round(140 - 60 * t)}, ${Math.round(48 - 20 * t)}, 0.88)`
  } else {
    const t = (ratio - 0.7) / 0.3
    return `rgba(${Math.round(200 - 40 * t)}, ${Math.round(80 - 50 * t)}, ${Math.round(28 - 10 * t)}, 0.88)`
  }
}

function predictWait(
  rideName: string, month: number, dayOfWeek: number, isHoliday: boolean,
): { prediction: number; range: [number, number]; confidence: number } {
  const ride       = RIDES.find((r) => r.name === rideName) ?? RIDES[0]
  const dayFactors = [0.88,0.84,0.80,0.85,0.93,1.03,1.01]
  const prediction = Math.round(ride.avg * MONTH_FACTORS[month] * dayFactors[dayOfWeek] * (isHoliday ? 1.30 : 1.0))
  const margin     = Math.round(ride.std * 0.55)
  const confidence = Math.round(Math.max(55, Math.min(91, 72 - (ride.std / ride.avg) * 30)))
  return { prediction, range: [Math.max(5, prediction - margin), prediction + margin], confidence }
}

function getWaitCategory(min: number): { label: string; color: string; icon: React.ReactNode } {
  if (min < 30) return { label: "Short Wait",    color: "#5A9E6F", icon: <CheckCircle2 size={13} /> }
  if (min < 60) return { label: "Moderate Wait", color: "#C8922A", icon: <Clock size={13} /> }
  if (min < 90) return { label: "Long Wait",     color: "#C8602A", icon: <AlertTriangle size={13} /> }
  return              { label: "Very Long",      color: "#C83A2A", icon: <AlertTriangle size={13} /> }
}

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

// ================================================================
// MAGIC CANVAS  (canvas-based — stars, aurora, shooting stars, dust)
// ================================================================

const MagicCanvas = memo(function MagicCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf: number
    let W = 0, H = 0

    interface StarP  { x: number; y: number; r: number; phase: number; speed: number; maxOp: number }
    interface ShootP { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }
    interface DustP  { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; r: number; hue: number }

    let stars:  StarP[]  = []
    let shoots: ShootP[] = []
    let dust:   DustP[]  = []
    let t = 0
    let nextShoot = 100
    let nextDust  = 3

    const init = () => {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width  = W
      canvas.height = H
      stars = Array.from({ length: 300 }, () => ({
        x:     Math.random() * W,
        y:     Math.random() * H * 0.9,
        r:     Math.random() * 1.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.016 + 0.004,
        maxOp: Math.random() * 0.6 + 0.2,
      }))
    }

    const tick = () => {
      ctx.clearRect(0, 0, W, H)
      t++

      // ── Aurora ribbons ─────────────────────────────────────────
      const ap = t * 0.004
      const AURORA = [
        { r: 74,  g: 127, b: 193, yf: 0.10 },
        { r: 139, g: 107, b: 181, yf: 0.16 },
        { r: 200, g: 146, b: 42,  yf: 0.07 },
      ] as const
      for (const a of AURORA) {
        const yb = H * a.yf
        ctx.beginPath()
        ctx.moveTo(0, yb)
        for (let x = 0; x <= W; x += 8)
          ctx.lineTo(x, yb + Math.sin(ap + x * 0.0015 + a.yf * 10) * H * 0.035)
        ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.closePath()
        ctx.fillStyle = `rgba(${a.r},${a.g},${a.b},${0.032 + Math.sin(ap * 1.2 + a.yf * 8) * 0.016})`
        ctx.fill()
      }

      // ── Twinkling stars ────────────────────────────────────────
      for (const s of stars) {
        const raw = (Math.sin(t * s.speed + s.phase) + 1) / 2
        const op  = Math.pow(raw, 1.6) * s.maxOp        // sharper on/off twinkle
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(230,235,255,${op})`
        ctx.fill()
        // Soft halo on medium stars
        if (s.r > 1.0) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5)
          g.addColorStop(0, `rgba(210,225,255,${op * 0.28})`); g.addColorStop(1, "transparent")
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2); ctx.fill()
        }
        // 4-point cross spike on big bright stars
        if (s.r > 1.3 && op > 0.45) {
          const spike = s.r * 10
          const bri   = `rgba(235,240,255,${op * 0.65})`
          for (const [x1, y1, x2, y2] of [
            [s.x - spike, s.y, s.x + spike, s.y],
            [s.x, s.y - spike, s.x, s.y + spike],
          ]) {
            const sg = ctx.createLinearGradient(x1, y1, x2, y2)
            sg.addColorStop(0, "transparent"); sg.addColorStop(0.5, bri); sg.addColorStop(1, "transparent")
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2)
            ctx.strokeStyle = sg; ctx.lineWidth = 0.9; ctx.stroke()
          }
        }
      }

      // ── Shooting stars ─────────────────────────────────────────
      if (--nextShoot <= 0) {
        const ang = (18 + Math.random() * 28) * (Math.PI / 180)
        shoots.push({
          x: Math.random() * W * 0.75, y: Math.random() * H * 0.38,
          vx: Math.cos(ang) * (8 + Math.random() * 6),
          vy: Math.sin(ang) * (8 + Math.random() * 6),
          life: 0, maxLife: 30 + Math.random() * 20,
        })
        nextShoot = 120 + Math.random() * 230
      }
      shoots = shoots.filter(ss => {
        ss.x += ss.vx; ss.y += ss.vy; ss.life++
        const op   = Math.sin((ss.life / ss.maxLife) * Math.PI) * 0.9
        const tail = 10
        const g = ctx.createLinearGradient(ss.x - ss.vx * tail, ss.y - ss.vy * tail, ss.x, ss.y)
        g.addColorStop(0, "rgba(255,252,220,0)"); g.addColorStop(1, `rgba(255,252,220,${op})`)
        ctx.beginPath(); ctx.moveTo(ss.x - ss.vx * tail, ss.y - ss.vy * tail)
        ctx.lineTo(ss.x, ss.y); ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke()
        const hg = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 5)
        hg.addColorStop(0, `rgba(255,252,220,${op})`); hg.addColorStop(1, "transparent")
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(ss.x, ss.y, 5, 0, Math.PI * 2); ctx.fill()
        return ss.life < ss.maxLife
      })

      // ── Gold fairy dust ────────────────────────────────────────
      if (--nextDust <= 0) {
        dust.push({
          x: Math.random() * W, y: H + 8,
          vx: (Math.random() - 0.5) * 0.7,
          vy: -(0.35 + Math.random() * 0.75),
          life: 0, maxLife: 160 + Math.random() * 100,
          r: Math.random() * 2 + 0.5,
          hue: 32 + Math.random() * 18,
        })
        nextDust = 3 + Math.floor(Math.random() * 5)
      }
      dust = dust.filter(d => {
        d.x += d.vx; d.y += d.vy
        d.vx += (Math.random() - 0.5) * 0.035
        d.life++
        const op = Math.sin((d.life / d.maxLife) * Math.PI) * 0.48
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 2.5)
        g.addColorStop(0, `hsla(${d.hue},88%,68%,${op})`); g.addColorStop(1, "transparent")
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 2.5, 0, Math.PI * 2); ctx.fill()
        return d.life < d.maxLife && d.y > -15
      })

      raf = requestAnimationFrame(tick)
    }

    init(); tick()
    window.addEventListener("resize", init)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", init) }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  )
})

// ================================================================
// CURSOR SPOTLIGHT  (direct DOM — zero React re-renders)
// ================================================================

const CursorSpotlight = memo(function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (ref.current)
        ref.current.style.background =
          `radial-gradient(700px circle at ${e.clientX}px ${e.clientY}px, rgba(200,146,42,0.035), transparent 65%)`
    }
    window.addEventListener("mousemove", move, { passive: true })
    return () => window.removeEventListener("mousemove", move)
  }, [])
  return <div ref={ref} aria-hidden="true" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }} />
})

// ================================================================
// TILT CARD  (useMotionValue only — no useState)
// ================================================================

const TiltCard = memo(function TiltCard({
  children, className = "", intensity = 7,
}: { children: React.ReactNode; className?: string; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const mx  = useMotionValue(0)
  const my  = useMotionValue(0)
  const rx  = useSpring(useTransform(my, [-0.5, 0.5], [ intensity, -intensity]), { stiffness: 220, damping: 28 })
  const ry  = useSpring(useTransform(mx, [-0.5, 0.5], [-intensity,  intensity]), { stiffness: 220, damping: 28 })

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const r = ref.current.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width  - 0.5)
    my.set((e.clientY - r.top)  / r.height - 0.5)
  }, [mx, my])
  const onLeave = useCallback(() => { mx.set(0); my.set(0) }, [mx, my])

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
    >
      {children}
    </motion.div>
  )
})

// ================================================================
// ANIMATED COUNTER
// ================================================================

const AnimatedCounter = memo(function AnimatedCounter({
  value, format = (n: number) => n.toLocaleString(), className = "",
}: { value: number; format?: (n: number) => string; className?: string }) {
  const ref      = useRef<HTMLSpanElement>(null)
  const mv       = useMotionValue(0)
  const displayed = useTransform(mv, (v) => format(Math.round(v)))
  const inView   = useInView(ref, { once: true, margin: "-80px" })

  useEffect(() => {
    if (!inView) return
    const ctrl = animate(mv, value, { duration: 1.8, ease: [0.16, 1, 0.3, 1] })
    return ctrl.stop
  }, [inView, value, mv])

  return <motion.span ref={ref} className={className}>{displayed}</motion.span>
})

// ================================================================
// PARK BADGE
// ================================================================

function ParkBadge({ park }: { park: string }) {
  const m = PARK_META[park]
  return (
    <span
      className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm inline-block"
      style={{ color: m?.color, backgroundColor: m?.bg, border: `1px solid ${m?.border}` }}
    >
      {m?.abbrev ?? park}
    </span>
  )
}

// ================================================================
// SECTION HEADER
// ================================================================

function SectionHeader({ label, title, subtitle }: { label: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="mb-12"
    >
      <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#C8922A] mb-3 block">
        {label}
      </span>
      <h2 className="text-4xl md:text-5xl font-bold text-[#EDE9E3] tracking-tight leading-none mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[#7D93B2] text-lg max-w-[52ch] leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  )
}

// ================================================================
// FAIRY-TALE CASTLE SVG
// ================================================================

const CastleSilhouette = memo(function CastleSilhouette() {
  return (
    <div className="relative flex items-end justify-center select-none">

      <svg viewBox="0 0 280 460" width="280" height="460" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="bodyG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#0D2A5C" />
            <stop offset="100%" stopColor="#071626" />
          </linearGradient>
          <linearGradient id="spireG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1E58B8" />
            <stop offset="100%" stopColor="#0D2A5C" />
          </linearGradient>
          <linearGradient id="beamG" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%"   stopColor="#C8D8F8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#C8D8F8" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="winG" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#E5AB3A" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#C8922A" stopOpacity="0.08" />
          </radialGradient>
        </defs>


        {/* Far-left turret */}
        <polygon points="28,202 51,260 5,260"    fill="url(#spireG)" />
        <rect x="5"   y="260" width="46" height="140" fill="url(#bodyG)" />
        <rect x="5"  y="254" width="8" height="9" fill="url(#spireG)" />
        <rect x="15" y="254" width="8" height="9" fill="url(#spireG)" />
        <rect x="25" y="254" width="8" height="9" fill="url(#spireG)" />
        <rect x="35" y="254" width="8" height="9" fill="url(#spireG)" />
        <rect x="45" y="254" width="6" height="9" fill="url(#spireG)" />

        {/* Far-right turret */}
        <polygon points="252,202 275,260 229,260" fill="url(#spireG)" />
        <rect x="229" y="260" width="46" height="140" fill="url(#bodyG)" />
        <rect x="229" y="254" width="8" height="9" fill="url(#spireG)" />
        <rect x="239" y="254" width="8" height="9" fill="url(#spireG)" />
        <rect x="249" y="254" width="8" height="9" fill="url(#spireG)" />
        <rect x="259" y="254" width="8" height="9" fill="url(#spireG)" />
        <rect x="269" y="254" width="6" height="9" fill="url(#spireG)" />

        {/* Left wall */}
        <rect x="51"  y="338" width="59" height="62" fill="url(#bodyG)" />
        {/* Right wall */}
        <rect x="170" y="338" width="59" height="62" fill="url(#bodyG)" />

        {/* Left main tower */}
        <polygon points="80,112 111,195 49,195"  fill="url(#spireG)" />
        <rect x="49" y="195" width="62" height="205" fill="url(#bodyG)" />
        <rect x="49"  y="188" width="9" height="10" fill="url(#spireG)" />
        <rect x="61"  y="188" width="9" height="10" fill="url(#spireG)" />
        <rect x="73"  y="188" width="9" height="10" fill="url(#spireG)" />
        <rect x="85"  y="188" width="9" height="10" fill="url(#spireG)" />
        <rect x="97"  y="188" width="9" height="10" fill="url(#spireG)" />
        <rect x="103" y="188" width="8" height="10" fill="url(#spireG)" />
        <rect x="63" y="215" width="11" height="17" rx="5.5" fill="url(#winG)" />
        <rect x="79" y="215" width="11" height="17" rx="5.5" fill="url(#winG)" />
        <rect x="68" y="258" width="14" height="22" rx="7"   fill="rgba(200,146,42,0.18)" />

        {/* Right main tower */}
        <polygon points="200,112 231,195 169,195" fill="url(#spireG)" />
        <rect x="169" y="195" width="62" height="205" fill="url(#bodyG)" />
        <rect x="169" y="188" width="9" height="10" fill="url(#spireG)" />
        <rect x="181" y="188" width="9" height="10" fill="url(#spireG)" />
        <rect x="193" y="188" width="9" height="10" fill="url(#spireG)" />
        <rect x="205" y="188" width="9" height="10" fill="url(#spireG)" />
        <rect x="217" y="188" width="9" height="10" fill="url(#spireG)" />
        <rect x="222" y="188" width="8" height="10" fill="url(#spireG)" />
        <rect x="183" y="215" width="11" height="17" rx="5.5" fill="url(#winG)" />
        <rect x="199" y="215" width="11" height="17" rx="5.5" fill="url(#winG)" />
        <rect x="188" y="258" width="14" height="22" rx="7"   fill="rgba(200,146,42,0.18)" />

        {/* Central tower (tallest) */}
        <polygon points="140,22 178,150 102,150"  fill="url(#spireG)" />
        <rect x="102" y="150" width="76" height="250" fill="url(#bodyG)" />
        <rect x="102" y="143" width="10" height="11" fill="url(#spireG)" />
        <rect x="115" y="143" width="10" height="11" fill="url(#spireG)" />
        <rect x="128" y="143" width="10" height="11" fill="url(#spireG)" />
        <rect x="141" y="143" width="10" height="11" fill="url(#spireG)" />
        <rect x="154" y="143" width="10" height="11" fill="url(#spireG)" />
        <rect x="167" y="143" width="11" height="11" fill="url(#spireG)" />
        <rect x="121" y="172" width="14" height="22" rx="7"   fill="url(#winG)" />
        <rect x="145" y="172" width="14" height="22" rx="7"   fill="url(#winG)" />
        <rect x="127" y="225" width="26" height="36" rx="13"  fill="rgba(200,146,42,0.22)" />
        <rect x="126" y="290" width="13" height="20" rx="6.5" fill="rgba(200,146,42,0.18)" />
        <rect x="141" y="290" width="13" height="20" rx="6.5" fill="rgba(200,146,42,0.18)" />

        {/* Gate arch */}
        <path d="M 108,400 L 108,348 Q 140,316 172,348 L 172,400 Z" fill="#020B18" />

        {/* Ground base */}
        <rect x="0" y="398" width="280" height="12" fill="url(#bodyG)" />

        {/* Animated flag on main spire */}
        <line x1="140" y1="6" x2="140" y2="22" stroke="rgba(200,146,42,0.55)" strokeWidth="1.2" />
        <g style={{ transformBox: "fill-box", transformOrigin: "0% 50%", animation: "flag-wave 2.8s ease-in-out infinite" }}>
          <rect x="140" y="6" width="22" height="14" rx="2" fill="#C8922A" opacity="0.9" />
          <line x1="140" y1="6" x2="162" y2="13" stroke="rgba(200,146,42,0.3)" strokeWidth="0.5" />
        </g>

        {/* Star dots at spire tips */}
        <circle cx="140" cy="4"   r="3.5" fill="#E5AB3A" opacity="0.95" />
        <circle cx="80"  cy="110" r="3.5" fill="#E5AB3A" opacity="0.8"  />
        <circle cx="200" cy="110" r="3.5" fill="#E5AB3A" opacity="0.8"  />
        <circle cx="28"  cy="200" r="2.5" fill="#E5AB3A" opacity="0.7"  />
        <circle cx="252" cy="200" r="2.5" fill="#E5AB3A" opacity="0.7"  />

        {/* Gold trim on main spire */}
        <line x1="140" y1="22" x2="178" y2="150" stroke="rgba(200,146,42,0.22)" strokeWidth="0.5" />
        <line x1="140" y1="22" x2="102" y2="150" stroke="rgba(200,146,42,0.22)" strokeWidth="0.5" />
      </svg>

    </div>
  )
})

// ================================================================
// NAVIGATION
// ================================================================

function Navigation({ activeSection }: { activeSection: string }) {
  const { scrollY } = useScroll()
  const navBg     = useTransform(scrollY, [0, 80], ["rgba(2,11,24,0.15)", "rgba(2,11,24,0.94)"])
  const navBorder = useTransform(scrollY, [0, 80], ["rgba(200,146,42,0.0)", "rgba(200,146,42,0.13)"])

  return (
    <motion.header
      style={{ backgroundColor: navBg, borderBottomColor: navBorder }}
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => scrollTo("hero")} className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: "rgba(200,146,42,0.14)", border: "1px solid rgba(200,146,42,0.3)" }}>
            <Star size={13} style={{ color: "#C8922A" }} />
          </div>
          <span className="font-bold text-[15px] text-[#EDE9E3] tracking-tight hidden sm:block">
            WDW Analysis
          </span>
        </button>

        <nav className="flex items-center gap-0.5" aria-label="Sections">
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-200"
                style={{ color: active ? "#EDE9E3" : "#7D93B2" }}
              >
                {active && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "rgba(200,146,42,0.13)", border: "1px solid rgba(200,146,42,0.24)" }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-[#3A506B]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#5A9E6F] animate-pulse" />
          1,754,414 records
        </div>
      </div>
    </motion.header>
  )
}

// ================================================================
// HERO SECTION
// ================================================================

function HeroSection() {
  const { scrollY } = useScroll()
  const castleY     = useTransform(scrollY, [0, 600], [0, -70])
  const contentY    = useTransform(scrollY, [0, 400], [0, -28])
  const heroOpacity = useTransform(scrollY, [0, 380], [1, 0])

  const containerV = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
  const itemV = {
    hidden:  { opacity: 0, y: 28 },
    visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 80, damping: 22 } },
  }

  return (
    <section id="hero" className="relative min-h-[100dvh] flex items-center overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 70% 60% at 65% 45%, rgba(74,127,193,0.1) 0%, transparent 65%), radial-gradient(ellipse 50% 50% at 28% 60%, rgba(200,146,42,0.05) 0%, transparent 60%)",
      }} />

      <div className="max-w-7xl mx-auto px-6 w-full pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-12 items-center">

          {/* Content */}
          <motion.div style={{ y: contentY }} variants={containerV} initial="hidden" animate="visible" className="relative z-10">
            <motion.div variants={itemV} className="mb-8">
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase px-4 py-2 rounded-full"
                style={{ background: "rgba(200,146,42,0.1)", border: "1px solid rgba(200,146,42,0.25)", color: "#C8922A" }}>
                <Star size={11} />
                Data Science · Disney World · 2015 – 2021
                <Star size={11} />
              </span>
            </motion.div>

            <motion.div variants={itemV} className="mb-6">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.95] text-[#EDE9E3]">
                The Science<br />
                of{" "}
                <span className="shimmer-gold">Disney</span>
                <br />
                Magic.
              </h1>
            </motion.div>

            <motion.p variants={itemV} className="text-[#7D93B2] text-lg leading-relaxed max-w-[46ch] mb-10">
              A Random Forest machine learning analysis of{" "}
              <span style={{ color: "#EDE9E3", fontWeight: 600 }}>1,754,414 wait-time records</span>{" "}
              across 8 attractions and 4 parks — revealing exactly when to go, what to skip, and what to ride first.
            </motion.p>

            <motion.div variants={itemV} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {[
                { value: 1754414, label: "Records",    fmt: (n: number) => (n / 1e6).toFixed(2) + "M" },
                { value: 8,       label: "Attractions", fmt: (n: number) => n.toString() },
                { value: 7,       label: "Years",       fmt: (n: number) => n.toString() },
                { value: 57.9,    label: "R² × 100",   fmt: (n: number) => n.toFixed(1) + "%" },
              ].map((s) => (
                <div key={s.label} className="glass-card p-4 text-center" style={{ borderRadius: 12 }}>
                  <div className="text-2xl font-black font-mono text-[#EDE9E3] mb-0.5">
                    <AnimatedCounter value={s.value} format={s.fmt} />
                  </div>
                  <div className="text-[10px] font-semibold tracking-widest uppercase text-[#3A506B]">{s.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={itemV} className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => scrollTo("overview")}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97, y: 1 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm"
                style={{
                  background: "linear-gradient(135deg, #C8922A 0%, #E5AB3A 100%)",
                  color: "#020B18", boxShadow: "0 8px 32px -8px rgba(200,146,42,0.45)",
                }}
              >
                Explore the Data <ArrowRight size={15} />
              </motion.button>
              <motion.button
                onClick={() => scrollTo("predict")}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97, y: 1 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-[#EDE9E3]"
                style={{ border: "1px solid rgba(200,146,42,0.25)", background: "rgba(200,146,42,0.07)" }}
              >
                <Brain size={15} style={{ color: "#C8922A" }} /> Predict Wait Time
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Castle */}
          <motion.div
            style={{ y: castleY, opacity: heroOpacity }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="flex items-end justify-center"
          >
            <CastleSilhouette />
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }}
          className="flex flex-col items-center gap-2 mt-14 text-[#3A506B]"
        >
          <span className="text-[10px] tracking-widest uppercase font-medium">Scroll to explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
              <path d="M1 1l7 7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ================================================================
// OVERVIEW SECTION
// ================================================================

function OverviewSection() {
  const maxSeason = Math.max(...SEASONS.map((s) => s.avg))

  return (
    <section id="overview" className="relative py-28 px-6">
      <div className="section-divider mb-28" />
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="By the Numbers"
          title="7 Years. 1.75M Records."
          subtitle="Every wait-time data point from 2015 through 2021, distilled into actionable patterns."
        />

        {/* Row 1: 2fr + 1fr stacked */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <TiltCard className="md:col-span-2 glass-card glass-card-hover p-8 relative overflow-hidden">
            <div aria-hidden="true" className="absolute -right-8 -top-8 w-48 h-48 rounded-full opacity-10 pointer-events-none"
              style={{ background: "radial-gradient(circle, #C8922A, transparent)" }} />
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-4">Total Records Analyzed</div>
            <div className="text-7xl md:text-8xl font-black font-mono text-[#EDE9E3] leading-none mb-3">
              <AnimatedCounter value={1754414} format={(n) => n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n.toLocaleString()} />
            </div>
            <p className="text-[#7D93B2] text-sm max-w-[40ch]">
              Collected across 4 parks, 8 attractions, spanning January 2015 – December 2021.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {Object.entries(PARK_META).map(([park, m]) => (
                <span key={park} className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
                  {m.abbrev} · {park}
                </span>
              ))}
            </div>
          </TiltCard>

          <div className="flex flex-col gap-5">
            <TiltCard className="glass-card glass-card-hover p-6 flex-1">
              <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#7D93B2] mb-2">Overall Avg Wait</div>
              <div className="text-5xl font-black font-mono text-[#EDE9E3] leading-none">
                <AnimatedCounter value={56.2} format={(n) => n.toFixed(1)} />
              </div>
              <div className="text-[#C8922A] font-medium mt-1">minutes</div>
              <div className="flex items-center gap-1.5 text-xs text-[#5A9E6F] mt-3">
                <TrendingDown size={13} /> Best on Wednesdays
              </div>
            </TiltCard>
            <TiltCard className="glass-card glass-card-hover p-6 flex-1">
              <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#7D93B2] mb-2">ML Model R²</div>
              <div className="text-5xl font-black font-mono text-[#EDE9E3] leading-none">0.579</div>
              <div className="text-[#C8922A] font-medium mt-1">MAE ± 15 min</div>
              <div className="mt-3 h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: "57.9%" }} viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#4A7FC1,#C8922A)" }} />
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Row 2: seasonal + holiday */}
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-5">
          <TiltCard className="glass-card p-8" intensity={3}>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-1">Seasonal Avg Wait</div>
            <p className="text-[#3A506B] text-xs mb-8">Average across all 8 attractions by season</p>
            <div className="flex items-end gap-4 h-36">
              {SEASONS.map((s, i) => {
                const h = (s.avg / maxSeason) * 100
                return (
                  <motion.div key={s.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-mono text-[#7D93B2]">{s.avg}</span>
                    <div className="w-full relative rounded-t-sm overflow-hidden" style={{ height: `${h}%` }}>
                      <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
                        transition={{ delay: i * 0.08 + 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 rounded-t-sm"
                        style={{
                          originY: "bottom",
                          background: s.best
                            ? "linear-gradient(180deg,#5A9E6F,rgba(90,158,111,0.35))"
                            : "linear-gradient(180deg,rgba(200,146,42,0.8),rgba(200,146,42,0.25))",
                        }} />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-medium text-[#EDE9E3]">{s.name}</div>
                      <div className="text-[10px] text-[#3A506B]">{s.months}</div>
                      {s.best && <div className="text-[9px] text-[#5A9E6F] font-bold tracking-widest uppercase mt-0.5">Best</div>}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </TiltCard>

          <TiltCard className="glass-card p-8" intensity={3}>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-1">Holiday Impact</div>
            <p className="text-[#3A506B] text-xs mb-6">Avg wait increase during peak periods</p>
            <div className="space-y-4">
              {HOLIDAYS.map((h, i) => (
                <motion.div key={h.name} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-[#EDE9E3] font-medium truncate pr-2">{h.name}</span>
                    <span className="text-xs font-mono font-bold flex-shrink-0 text-[#C8922A]">+{h.impact}%</span>
                  </div>
                  <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${(h.impact / 43) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 + 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-[#C8922A]" />
                  </div>
                  <div className="text-[10px] text-[#3A506B] mt-1">{h.period}</div>
                </motion.div>
              ))}
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  )
}

// ================================================================
// RIDES SECTION
// ================================================================

function RidesSection() {
  const [filter, setFilter] = useState("All")
  const parks   = ["All", ...Array.from(new Set(RIDES.map((r) => r.park)))]
  const filtered = filter === "All" ? [...RIDES] : RIDES.filter((r) => r.park === filter)
  const maxAvg   = Math.max(...RIDES.map((r) => r.avg))

  return (
    <section id="rides" className="relative py-28 px-6">
      <div className="section-divider mb-28" />
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Attraction Analysis"
          title="Every Ride, Decoded."
          subtitle="Average, median, and standard deviation for all 8 attractions — so you know exactly what to expect before you step in line."
        />

        {/* Park filter */}
        <div className="flex flex-wrap gap-2 mb-10">
          {parks.map((p) => {
            const m = PARK_META[p]
            const active = filter === p
            return (
              <motion.button key={p} onClick={() => setFilter(p)}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                  background: active ? (m?.bg ?? "rgba(200,146,42,0.14)") : "rgba(255,255,255,0.04)",
                  color: active ? (m?.color ?? "#C8922A") : "#7D93B2",
                  border: `1px solid ${active ? (m?.border ?? "rgba(200,146,42,0.35)") : "rgba(255,255,255,0.08)"}`,
                }}>
                {p === "All" ? "All Parks" : PARK_META[p]?.abbrev + " · " + p}
              </motion.button>
            )
          })}
        </div>

        {/* Ride cards */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((ride, i) => {
              const m    = PARK_META[ride.park]
              const barW = (ride.avg / maxAvg) * 100
              return (
                <motion.div key={ride.id} layout
                  initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 120, damping: 20 }}>
                  <TiltCard className="glass-card glass-card-hover p-6 h-full flex flex-col gap-4 relative" intensity={6}>
                    {/* Park color top bar */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-[18px]" style={{ background: m?.color }} />
                    <div className="mt-1">
                      <ParkBadge park={ride.park} />
                    </div>
                    <h3 className="text-[#EDE9E3] font-bold text-base leading-tight">{ride.name}</h3>
                    <div>
                      <div className="flex justify-between text-[11px] mb-2">
                        <span className="text-[#3A506B] font-medium">Avg wait</span>
                        <span className="font-mono font-bold" style={{ color: m?.color }}>{ride.avg} min</span>
                      </div>
                      <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${barW}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 + 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg,${m?.color}88,${m?.color})` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mt-auto">
                      {[
                        { val: ride.avg.toString(),    label: "Avg"    },
                        { val: ride.median.toString(), label: "Median" },
                        { val: `±${ride.std}`,         label: "Std Dev"},
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="text-lg font-black font-mono" style={{ color: m?.color }}>{s.val}</div>
                          <div className="text-[9px] font-semibold tracking-widest uppercase text-[#3A506B]">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </TiltCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {/* Feature importance */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55 }}
          className="mt-8 glass-card p-8">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-2">ML Feature Importance</div>
              <p className="text-[#7D93B2] text-sm max-w-[26ch]">Which inputs drive the Random Forest predictions most.</p>
            </div>
            <div className="space-y-3">
              {FEATURE_IMPORTANCE.map((f, i) => (
                <div key={f.feature} className="flex items-center gap-3">
                  <span className="text-xs text-[#7D93B2] w-28 flex-shrink-0 text-right">{f.feature}</span>
                  <div className="flex-1 h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${f.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 + 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: i === 0 ? "linear-gradient(90deg,#4A7FC1,#C8922A)" : "rgba(200,146,42,0.5)" }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-[#EDE9E3] w-12 flex-shrink-0">{f.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ================================================================
// PREDICT SECTION
// ================================================================

function PredictSection() {
  const [form, setForm] = useState<{ ride: string; month: number; day: number; holiday: boolean }>(
    { ride: RIDES[2].name, month: 6, day: 5, holiday: false },
  )
  const [result, setResult] = useState<ReturnType<typeof predictWait> | null>(null)
  const [loading, setLoading] = useState(false)
  const [ran, setRan] = useState(false)

  const handlePredict = useCallback(async () => {
    setLoading(true); setResult(null)
    await new Promise((r) => setTimeout(r, 680))
    setResult(predictWait(form.ride, form.month, form.day, form.holiday))
    setLoading(false); setRan(true)
  }, [form])

  const category = result ? getWaitCategory(result.prediction) : null

  return (
    <section id="predict" className="relative py-28 px-6">
      <div className="section-divider mb-28" />
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Machine Learning Model"
          title="Predict Your Wait."
          subtitle="Random Forest model trained on 1.75M records. Select an attraction, day, and travel month for an instant prediction."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <TiltCard className="glass-card p-8 space-y-5" intensity={3}>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7D93B2] mb-2">Attraction</label>
              <select className="themed-select" value={form.ride}
                onChange={(e) => setForm((f) => ({ ...f, ride: e.target.value }))}>
                {RIDES.map((r) => (
                  <option key={r.id} value={r.name}>{r.name} ({PARK_META[r.park]?.abbrev})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7D93B2] mb-2">Month</label>
                <select className="themed-select" value={form.month}
                  onChange={(e) => setForm((f) => ({ ...f, month: +e.target.value }))}>
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7D93B2] mb-2">Day</label>
                <select className="themed-select" value={form.day}
                  onChange={(e) => setForm((f) => ({ ...f, day: +e.target.value }))}>
                  {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d, i) => (
                    <option key={d} value={i}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7D93B2] mb-3">Holiday Period</label>
              <div className="flex gap-3">
                {[{ val: false, label: "Not a Holiday" }, { val: true, label: "Holiday Period" }].map((opt) => (
                  <button key={String(opt.val)} onClick={() => setForm((f) => ({ ...f, holiday: opt.val }))}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
                    style={{
                      background: form.holiday === opt.val ? (opt.val ? "rgba(200,80,42,0.14)" : "rgba(200,146,42,0.11)") : "rgba(255,255,255,0.04)",
                      border: `1px solid ${form.holiday === opt.val ? (opt.val ? "rgba(200,80,42,0.4)" : "rgba(200,146,42,0.35)") : "rgba(255,255,255,0.08)"}`,
                      color: form.holiday === opt.val ? (opt.val ? "#C8602A" : "#C8922A") : "#7D93B2",
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <motion.button onClick={handlePredict}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97, y: 1 }}
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
              style={{
                background: loading ? "rgba(200,146,42,0.18)" : "linear-gradient(135deg,#C8922A 0%,#E5AB3A 100%)",
                color: loading ? "#C8922A" : "#020B18",
                boxShadow: loading ? "none" : "0 8px 32px -8px rgba(200,146,42,0.4)",
                transition: "all 0.3s",
              }}>
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="w-4 h-4 rounded-full border-2 border-[#C8922A] border-t-transparent" />
                  Calculating…
                </>
              ) : (
                <><Brain size={15} />{ran ? "Recalculate" : "Calculate Wait Time"}</>
              )}
            </motion.button>
          </TiltCard>

          {/* Result */}
          <div className="glass-card p-8 flex flex-col justify-center min-h-[380px]">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center h-full gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(200,146,42,0.08)", border: "1px solid rgba(200,146,42,0.15)" }}>
                    <Brain size={28} style={{ color: "#C8922A", opacity: 0.55 }} />
                  </div>
                  <p className="text-[#3A506B] text-sm max-w-[24ch]">
                    Configure your trip details and hit Calculate to get a prediction.
                  </p>
                </motion.div>
              )}
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-5 h-full">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="w-12 h-12 rounded-full border-2 border-[rgba(200,146,42,0.2)] border-t-[#C8922A]" />
                  <p className="text-[#3A506B] text-sm">Running Random Forest model…</p>
                  <div className="w-48 h-1 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                    <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-[#C8922A] to-transparent" />
                  </div>
                </motion.div>
              )}
              {result && !loading && (
                <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  className="space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#7D93B2] mb-1">Predicted Wait</div>
                      <div className="text-8xl font-black font-mono text-[#EDE9E3] leading-none">{result.prediction}</div>
                      <div className="text-xl font-medium text-[#C8922A] mt-1">minutes</div>
                    </div>
                    {category && (
                      <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg mt-2"
                        style={{ background: `${category.color}18`, color: category.color, border: `1px solid ${category.color}44` }}>
                        {category.icon} {category.label}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-[#3A506B] mb-2">
                      <span>Range: {result.range[0]}–{result.range[1]} min</span>
                      <span className="font-mono">{result.confidence}% confidence</span>
                    </div>
                    <div className="h-2 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#4A7FC1,#C8922A)" }} />
                    </div>
                  </div>
                  <div className="rounded-xl p-4 text-sm text-[#7D93B2]"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex gap-2">
                      <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#C8922A" }} />
                      <p>
                        On a <span className="text-[#EDE9E3]">
                          {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][form.day]}
                        </span> in <span className="text-[#EDE9E3]">{MONTHS[form.month]}</span>
                        {form.holiday ? <span className="text-[#C8602A]"> (holiday period)</span> : ""}, the model
                        estimates <span className="text-[#C8922A] font-semibold">{result.prediction} minutes</span> for {form.ride}.
                      </p>
                    </div>
                  </div>
                  {result.prediction > 60 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-start gap-2 text-xs text-[#5A9E6F]">
                      <Zap size={13} className="flex-shrink-0 mt-0.5" />
                      <span>Arrive at rope drop — waits are typically 40–60% lower in the first 90 minutes of operation.</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

// ================================================================
// TIMING SECTION
// ================================================================

function TimingSection() {
  const maxDay = Math.max(...DAYS.map((d) => d.avg))
  const minDay = Math.min(...DAYS.map((d) => d.avg))

  return (
    <section id="timing" className="relative py-28 px-6">
      <div className="section-divider mb-28" />
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Visit Planning"
          title="Timing is Everything."
          subtitle="Day-of-week patterns reveal a clear midweek advantage — up to 22% shorter waits than weekend peaks."
        />

        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 mb-6">
          {/* Day chart */}
          <TiltCard className="glass-card p-8" intensity={3}>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-1">Avg Wait by Day</div>
            <p className="text-[#3A506B] text-xs mb-8">Across all 8 attractions · minutes</p>
            <div className="flex items-end gap-3 h-44">
              {DAYS.map((d, i) => {
                const h    = (d.avg / maxDay) * 100
                const best = d.avg === minDay
                const worst= d.avg === maxDay
                return (
                  <motion.div key={d.day} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-[#7D93B2]">{d.avg}</span>
                    <div className="w-full relative" style={{ height: `${h}%` }}>
                      <motion.div initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }}
                        transition={{ delay: i * 0.07 + 0.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 rounded-t-md"
                        style={{
                          originY: "bottom",
                          background: best ? "linear-gradient(180deg,#5A9E6F,rgba(90,158,111,0.35))"
                            : worst ? "linear-gradient(180deg,#C84A2A,rgba(200,74,42,0.35))"
                            : "linear-gradient(180deg,rgba(200,146,42,0.75),rgba(200,146,42,0.2))",
                        }} />
                    </div>
                    <span className="text-xs font-medium"
                      style={{ color: best ? "#5A9E6F" : worst ? "#C84A2A" : "#7D93B2" }}>{d.day}</span>
                    {best  && <span className="text-[9px] text-[#5A9E6F] font-bold tracking-widest uppercase">Best</span>}
                    {worst && <span className="text-[9px] text-[#C84A2A] font-bold tracking-widest uppercase">Peak</span>}
                  </motion.div>
                )
              })}
            </div>
          </TiltCard>

          {/* Recommendations */}
          <div className="flex flex-col gap-4">
            {[
              { icon: <CheckCircle2 size={15} />, color: "#5A9E6F", title: "Best Days to Go",
                body: "Tue & Wed consistently lowest — 56–59 min average vs 72 min Saturday peak." },
              { icon: <Clock size={15} />,        color: "#C8922A", title: "Rope Drop Strategy",
                body: "First 90 minutes after open: 40–60% shorter waits. Hit the top rides immediately." },
              { icon: <Calendar size={15} />,     color: "#4A7FC1", title: "Fall Is Your Friend",
                body: "Sep–Nov averages 58.9 min — lowest of all seasons with no major holidays until Thanksgiving." },
              { icon: <AlertTriangle size={15} />,color: "#C84A2A", title: "Avoid Holiday Weeks",
                body: "Christmas (+43%) and Thanksgiving (+25%) are the biggest crowd spikes in the dataset." },
            ].map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.09 }}
                className="glass-card p-5 flex gap-4">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: `${card.color}18`, border: `1px solid ${card.color}44`, color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-[#EDE9E3] mb-1">{card.title}</div>
                  <p className="text-xs text-[#7D93B2] leading-relaxed">{card.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Month crowd heatmap */}
        <TiltCard className="glass-card p-8" intensity={2}>
          <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-1">Month-by-Month Crowd Level</div>
          <p className="text-[#3A506B] text-xs mb-6">Relative wait-time multiplier — green = low crowds, red = high</p>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {MONTH_FACTORS.map((factor, i) => {
              const intensity = Math.max(0, Math.min(1, (factor - 0.78) / 0.57))
              return (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                  className="heat-cell aspect-square flex flex-col items-center justify-center gap-0.5"
                  style={{ background: getHeatColor(10 + intensity * 82) }}
                  title={`${MONTHS[i]}: ${factor}× multiplier`}>
                  <span className="text-[9px] font-bold text-white/90">{MONTHS[i].slice(0,3)}</span>
                  <span className="text-[8px] font-mono text-white/70">{factor}×</span>
                </motion.div>
              )
            })}
          </div>
          <div className="flex items-center gap-4 mt-5 text-[10px] text-[#3A506B]">
            {[["rgba(42,150,68,0.88)","Low crowds"],["rgba(200,146,42,0.88)","Moderate"],["rgba(180,50,28,0.88)","High crowds"]].map(([bg,label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: bg }} />
                {label}
              </div>
            ))}
          </div>
        </TiltCard>
      </div>
    </section>
  )
}

// ================================================================
// STUDIOS SECTION
// ================================================================

function StudiosSection() {
  const [hovered, setHovered] = useState<{ ride: string; hour: string; val: number } | null>(null)
  const rides = Object.keys(HS_HOURLY)

  return (
    <section id="studios" className="relative py-28 px-6">
      <div className="section-divider mb-28" />
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Hollywood Studios Deep Dive"
          title="Hour by Hour."
          subtitle="Hourly wait-time heatmap for all 4 DHS attractions — 8 AM through 9 PM. Plan your visit down to the minute."
        />

        <TiltCard className="glass-card p-8 mb-6 overflow-x-auto" intensity={2}>
          <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-6">
            Avg Wait (min) · Hollywood Studios · Hourly
          </div>
          {/* Hour header */}
          <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `150px repeat(${HOURS_LABELS.length}, 1fr)` }}>
            <div />
            {HOURS_LABELS.map((h) => (
              <div key={h} className="text-[9px] font-mono text-[#3A506B] text-center">{h}</div>
            ))}
          </div>
          {/* Data rows */}
          {rides.map((ride, ri) => (
            <motion.div key={ride} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: ri * 0.08 }}
              className="grid gap-1 mb-1 items-center"
              style={{ gridTemplateColumns: `150px repeat(${HOURS_LABELS.length}, 1fr)` }}>
              <div className="text-[11px] text-[#7D93B2] font-medium pr-3 truncate text-right">{ride}</div>
              {HS_HOURLY[ride].map((val, hi) => (
                <motion.div key={hi} initial={{ opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: ri * 0.05 + hi * 0.02 }}
                  className="heat-cell aspect-square flex items-center justify-center"
                  style={{ background: getHeatColor(val) }}
                  onMouseEnter={() => setHovered({ ride, hour: HOURS_LABELS[hi], val })}
                  onMouseLeave={() => setHovered(null)}>
                  <span className="text-[9px] font-mono font-bold text-white/85">{val}</span>
                </motion.div>
              ))}
            </motion.div>
          ))}
          {/* Legend */}
          <div className="flex items-center gap-3 mt-5 text-[10px] text-[#3A506B]">
            <span>Wait:</span>
            <div className="flex-1 max-w-[180px] h-2 rounded-full"
              style={{ background: "linear-gradient(90deg,rgba(42,150,68,0.88),rgba(200,146,42,0.88),rgba(180,50,28,0.88))" }} />
            <span>10 min → 92 min</span>
          </div>
          <AnimatePresence>
            {hovered && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mt-3 text-sm text-[#EDE9E3]">
                <span className="text-[#C8922A] font-bold">{hovered.ride}</span>
                {" · "}{hovered.hour}{" → "}
                <span className="font-mono font-bold">{hovered.val} min</span>
              </motion.div>
            )}
          </AnimatePresence>
        </TiltCard>

        {/* Strategy cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { ride: "Slinky Dog Dash",         color: "#C8922A", best: "8–9 AM",  tip: "Rope drop essential. Waits exceed 88 min by noon. Hit this first or use Lightning Lane." },
            { ride: "Rock 'n' Roller Coaster", color: "#4A7FC1", best: "7–9 PM",  tip: "Peaks midday around 78 min. Evening 7–9 PM drops to ~30 min — the sweet spot." },
            { ride: "Toy Story Mania",          color: "#5A9E6F", best: "8–9 PM",  tip: "Busy but manageable through the day. Late evening window is best at ~29 min." },
            { ride: "Alien Swirling Saucers",   color: "#8B6BB5", best: "Anytime", tip: "Lowest waits in DHS. Never exceeds 38 min — flexible any time, best after 6 PM." },
          ].map((s, i) => (
            <motion.div key={s.ride} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.09 }}
              className="glass-card glass-card-hover p-6">
              <div className="text-[10px] font-bold tracking-widest uppercase mb-3 px-2 py-1 rounded-sm inline-block"
                style={{ background: `${s.color}14`, color: s.color, border: `1px solid ${s.color}30` }}>
                {s.ride}
              </div>
              <p className="text-xs text-[#7D93B2] leading-relaxed mb-4">{s.tip}</p>
              <div className="flex items-center gap-2">
                <Clock size={12} style={{ color: "#5A9E6F" }} />
                <span className="text-[11px] font-bold text-[#5A9E6F]">Best: {s.best}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ================================================================
// FOOTER
// ================================================================

function Footer() {
  return (
    <footer className="relative py-16 px-6 mt-8">
      <div className="section-divider mb-12" />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(200,146,42,0.12)", border: "1px solid rgba(200,146,42,0.25)" }}>
                <Star size={16} style={{ color: "#C8922A" }} />
              </div>
              <span className="font-bold text-[#EDE9E3]">WDW Analysis</span>
            </div>
            <p className="text-xs text-[#3A506B] leading-relaxed max-w-[28ch]">
              A data science portfolio project by Johnny Nguyen. Historical wait-time analysis and machine learning modeling.
            </p>
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-4">Dataset</div>
            <ul className="space-y-2 text-xs text-[#3A506B]">
              <li>Source: Touring Plans historical data</li>
              <li>Records: 1,754,414 wait-time entries</li>
              <li>Parks: MK · EPCOT · DHS · DAK</li>
              <li>Range: January 2015 – December 2021</li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-4">Model Details</div>
            <ul className="space-y-2 text-xs text-[#3A506B]">
              <li>Algorithm: Random Forest Regressor</li>
              <li>R² Score: 0.579</li>
              <li>Mean Absolute Error: ±15 min</li>
              <li>Top feature: Attraction identity (80.3%)</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[#3A506B]">
          <span>
            Walt Disney World® is a registered trademark of The Walt Disney Company. Independent academic analysis only.
          </span>
          <span className="font-mono">© 2024 Johnny Nguyen · Data Science Portfolio</span>
        </div>
      </div>
    </footer>
  )
}

// ================================================================
// MAIN PAGE
// ================================================================

export default function Page() {
  const [activeSection, setActiveSection] = useState("hero")

  useEffect(() => {
    const ids = ["hero", "overview", "rides", "predict", "timing", "studios"]
    const observers: IntersectionObserver[] = []
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { threshold: 0.3 },
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <main className="relative bg-[#020B18] min-h-screen">
      <div className="noise-overlay" aria-hidden="true" />
      <div className="ambient-bg"   aria-hidden="true" />
      <MagicCanvas />
      <CursorSpotlight />
      <Navigation activeSection={activeSection} />
      <HeroSection />
      <OverviewSection />
      <RidesSection />
      <PredictSection />
      <TimingSection />
      <StudiosSection />
      <Footer />
    </main>
  )
}
