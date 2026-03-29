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
  Sun,
  Moon,
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
  { id: "potc",   name: "Pirates of the Caribbean",  park: "Magic Kingdom",    avg: 29,  median: 25,  std: 18 },
  { id: "splsh",  name: "Splash Mountain",            park: "Magic Kingdom",    avg: 44,  median: 40,  std: 30 },
  { id: "fop",    name: "Flight of Passage",         park: "Animal Kingdom",   avg: 115, median: 115, std: 54 },
  { id: "navi",   name: "Na'vi River Journey",        park: "Animal Kingdom",   avg: 63,  median: 60,  std: 32 },
  { id: "ee",     name: "Expedition Everest",          park: "Animal Kingdom",   avg: 32,  median: 30,  std: 23 },
  { id: "ks",     name: "Kilimanjaro Safaris",         park: "Animal Kingdom",   avg: 40,  median: 35,  std: 29 },
  { id: "dino",   name: "DINOSAUR",                    park: "Animal Kingdom",   avg: 27,  median: 20,  std: 20 },
  { id: "soarin", name: "Soarin'",                   park: "EPCOT",            avg: 46,  median: 40,  std: 27 },
  { id: "se",     name: "Spaceship Earth",             park: "EPCOT",            avg: 19,  median: 15,  std: 15 },
] as const

const PARK_META: Record<string, { color: string; bg: string; border: string; abbrev: string }> = {
  "Hollywood Studios": { color: "#C8922A", bg: "rgba(200,146,42,0.08)",  border: "rgba(200,146,42,0.28)", abbrev: "DHS" },
  "Magic Kingdom":     { color: "#4A7FC1", bg: "rgba(74,127,193,0.08)",  border: "rgba(74,127,193,0.28)", abbrev: "MK"  },
  "Animal Kingdom":    { color: "#5A9E6F", bg: "rgba(90,158,111,0.08)",  border: "rgba(90,158,111,0.28)", abbrev: "DAK" },
  "EPCOT":             { color: "#8B6BB5", bg: "rgba(139,107,181,0.08)", border: "rgba(139,107,181,0.28)", abbrev: "EP" },
}

const DAYS = [
  { day: "Mon", avg: 51.4 },
  { day: "Tue", avg: 48.2 },
  { day: "Wed", avg: 46.6 },
  { day: "Thu", avg: 47.1 },
  { day: "Fri", avg: 48.0 },
  { day: "Sat", avg: 51.8 },
  { day: "Sun", avg: 48.8 },
]

const HOLIDAYS = [
  { name: "Spring Break",           impact: 17, period: "March – April"         },
  { name: "Christmas / New Year's", impact: 13, period: "Dec 20 – Jan 5"       },
  { name: "Summer Peak",            impact: 4,  period: "June – August"         },
  { name: "Thanksgiving",           impact: 2,  period: "Late November"         },
]

const SEASONS = [
  { name: "Winter", avg: 53.8, months: "Dec–Feb", best: false },
  { name: "Spring", avg: 51.0, months: "Mar–May", best: false },
  { name: "Summer", avg: 49.0, months: "Jun–Aug", best: false },
  { name: "Fall",   avg: 42.3, months: "Sep–Nov", best: true  },
]

const PARK_HOURLY: Record<string, Record<string, number[]>> = {
  "Hollywood Studios": {
    "Toy Story Mania":         [30,46,61,63,62,62,66,63,60,56,52,45,34,28],
    "Rock 'n' Roller Coaster": [24,42,66,73,65,65,66,66,66,60,59,56,49,39],
    "Slinky Dog Dash":         [59,79,81,84,82,81,81,79,74,70,67,61,52,47],
    "Alien Swirling Saucers":  [18,26,39,41,38,36,35,33,29,27,26,22,15,15],
  },
  "Magic Kingdom": {
    "Seven Dwarfs Mine Train":  [44,62,75,85,89,93,93,92,91,89,82,76,69,58],
    "Pirates of the Caribbean": [8,13,28,38,40,41,39,36,38,34,29,24,19,12],
    "Splash Mountain":          [10,16,36,50,58,63,61,58,61,56,49,41,33,20],
  },
  "Animal Kingdom": {
    "Flight of Passage":   [99,129,136,129,119,113,112,113,111,111,109,115,116,105],
    "Na'vi River Journey":  [27,51,70,77,77,74,72,71,68,67,64,59,55,39],
    "Expedition Everest":   [9,19,36,43,44,43,42,39,35,33,27,23,20,16],
    "Kilimanjaro Safaris":  [14,28,48,58,52,47,44,42,39,38,32,30,26,20],
    "DINOSAUR":             [8,13,26,35,38,37,38,34,30,27,23,20,18,12],
  },
  "EPCOT": {
    "Soarin'":         [16,32,57,59,56,53,51,51,49,46,42,40,32,25],
    "Spaceship Earth": [6,13,28,36,32,23,19,18,17,15,13,12,9,8],
  },
}

const HOURS_LABELS = ["8AM","9AM","10AM","11AM","12PM","1PM","2PM","3PM","4PM","5PM","6PM","7PM","8PM","9PM"]

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

const MONTH_FACTORS = [1.07,1.09,1.16,1.01,0.94,1.05,1.03,0.93,0.67,0.87,1.01,1.13]

const FEATURE_IMPORTANCE_RF = [
  { feature: "Attraction",     pct: 64.6 },
  { feature: "Hour of Day",    pct: 20.4 },
  { feature: "Month",          pct:  9.0 },
  { feature: "Day of Week",    pct:  4.6 },
  { feature: "Holiday Status", pct:  0.9 },
  { feature: "Weekend",        pct:  0.5 },
]

const FEATURE_IMPORTANCE_GB = [
  { feature: "Attraction",     pct: 70.7 },
  { feature: "Hour of Day",    pct: 18.9 },
  { feature: "Month",          pct:  7.6 },
  { feature: "Day of Week",    pct:  1.6 },
  { feature: "Holiday Status", pct:  0.9 },
  { feature: "Weekend",        pct:  0.3 },
]

const MODEL_COMPARISON = [
  { name: "Random Forest",     r2: 0.567, mae: 17.2, color: "#4A7FC1" },
  { name: "Gradient Boosting", r2: 0.573, mae: 17.2, color: "#C8922A" },
]

const PER_RIDE_MODELS = [
  { ride: "Splash Mountain",          r2: 0.500, mae: 15.8, topFeature: "Hour of Day",  topPct: 66.8 },
  { ride: "Pirates of the Caribbean", r2: 0.490, mae:  9.8, topFeature: "Hour of Day",  topPct: 76.8 },
  { ride: "Spaceship Earth",          r2: 0.430, mae:  7.7, topFeature: "Hour of Day",  topPct: 77.7 },
  { ride: "Na'vi River Journey",      r2: 0.347, mae: 20.2, topFeature: "Hour of Day",  topPct: 66.7 },
  { ride: "Expedition Everest",       r2: 0.343, mae: 13.5, topFeature: "Hour of Day",  topPct: 65.6 },
  { ride: "DINOSAUR",                 r2: 0.342, mae: 11.7, topFeature: "Hour of Day",  topPct: 71.4 },
  { ride: "Seven Dwarfs Mine Train",  r2: 0.341, mae: 21.3, topFeature: "Hour of Day",  topPct: 64.1 },
  { ride: "Alien Swirling Saucers",   r2: 0.333, mae:  9.5, topFeature: "Hour of Day",  topPct: 73.1 },
  { ride: "Slinky Dog Dash",          r2: 0.314, mae: 16.9, topFeature: "Hour of Day",  topPct: 56.2 },
  { ride: "Kilimanjaro Safaris",      r2: 0.287, mae: 18.7, topFeature: "Hour of Day",  topPct: 57.8 },
  { ride: "Soarin'",                  r2: 0.264, mae: 17.2, topFeature: "Hour of Day",  topPct: 55.3 },
  { ride: "Toy Story Mania",          r2: 0.243, mae: 19.9, topFeature: "Hour of Day",  topPct: 60.8 },
  { ride: "Rock 'n' Roller Coaster",  r2: 0.238, mae: 21.1, topFeature: "Hour of Day",  topPct: 56.5 },
  { ride: "Flight of Passage",        r2: 0.199, mae: 37.6, topFeature: "Month",        topPct: 40.1 },
]

const NAV_ITEMS = [
  { id: "overview", label: "Overview"   },
  { id: "rides",    label: "By Ride"    },
  { id: "predict",  label: "Predict"    },
  { id: "timing",   label: "When to Go" },
  { id: "models",   label: "Models"     },
  { id: "parks",    label: "Parks"      },
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

const MagicCanvas = memo(function MagicCanvas({ theme }: { theme: "dark" | "light" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const themeRef = useRef(theme)
  themeRef.current = theme

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
    interface CloudP { x: number; y: number; scale: number; speed: number; opacity: number }

    let stars:  StarP[]  = []
    let shoots: ShootP[] = []
    let dust:   DustP[]  = []
    let clouds: CloudP[] = []
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
      clouds = Array.from({ length: 8 }, () => ({
        x: Math.random() * W * 1.5 - W * 0.25,
        y: Math.random() * H * 0.45 + H * 0.04,
        scale: 0.7 + Math.random() * 1.4,
        speed: 0.12 + Math.random() * 0.18,
        opacity: 0.4 + Math.random() * 0.25,
      }))
    }

    const tick = () => {
      ctx.clearRect(0, 0, W, H)
      t++
      const isDark = themeRef.current === "dark"

      // ── Aurora ribbons (dark only) ─────────────────────────────
      if (isDark) {
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
      } // end dark aurora

      // ── Twinkling stars / sun sparkles ────────────────────────
      for (const s of stars) {
        const raw = (Math.sin(t * s.speed * (isDark ? 1 : 1.2) + s.phase) + 1) / 2
        const op  = isDark ? Math.pow(raw, 1.6) * s.maxOp : Math.pow(raw, 2.5) * s.maxOp * 0.35
        if (!isDark && op < 0.02) continue
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * (isDark ? 1 : 0.5), 0, Math.PI * 2)
        ctx.fillStyle = isDark ? `rgba(230,235,255,${op})` : `rgba(255,215,120,${op})`
        ctx.fill()
        // Soft halo on medium stars
        if (s.r > 1.0 && isDark) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5)
          g.addColorStop(0, `rgba(210,225,255,${op * 0.28})`); g.addColorStop(1, "transparent")
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2); ctx.fill()
        }
        // 4-point cross spike on big bright stars
        if (s.r > 1.3 && op > (isDark ? 0.45 : 0.15)) {
          const spike = s.r * (isDark ? 10 : 5)
          const bri   = isDark ? `rgba(235,240,255,${op * 0.65})` : `rgba(255,210,100,${op * 0.4})`
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

      // ── Shooting stars (dark only) ──────────────────────────────
      if (isDark && --nextShoot <= 0) {
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

      // ── Clouds (light only) ───────────────────────────────────
      if (!isDark) {
        for (const c of clouds) {
          c.x += c.speed
          if (c.x > W + 200) { c.x = -250; c.y = Math.random() * H * 0.45 + H * 0.04 }
          const puffs = [
            { dx: 0, dy: 0, r: 30 }, { dx: 28, dy: -13, r: 38 },
            { dx: 60, dy: -7, r: 28 }, { dx: 25, dy: -27, r: 22 },
            { dx: -14, dy: 5, r: 20 }, { dx: 50, dy: -20, r: 18 },
          ]
          for (const p of puffs) {
            const px = c.x + p.dx * c.scale, py = c.y + p.dy * c.scale, pr = p.r * c.scale
            const g = ctx.createRadialGradient(px, py, 0, px, py, pr)
            g.addColorStop(0, `rgba(255,255,255,${c.opacity})`)
            g.addColorStop(1, "rgba(255,255,255,0)")
            ctx.fillStyle = g
            ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill()
          }
        }
      }

      // ── Gold fairy dust (dark only) ─────────────────────────────
      if (isDark && --nextDust <= 0) {
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
        const op = Math.sin((d.life / d.maxLife) * Math.PI) * (isDark ? 0.48 : 0.28)
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 2.5)
        g.addColorStop(0, `hsla(${d.hue},${isDark ? 88 : 65}%,${isDark ? 68 : 52}%,${op})`); g.addColorStop(1, "transparent")
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

const CursorSpotlight = memo(function CursorSpotlight({ theme }: { theme: "dark" | "light" }) {
  const ref = useRef<HTMLDivElement>(null)
  const themeRef = useRef(theme)
  themeRef.current = theme
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.background = themeRef.current === "dark"
          ? `radial-gradient(700px circle at ${e.clientX}px ${e.clientY}px, rgba(200,146,42,0.035), transparent 65%)`
          : "none"
      }
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
      initial={{ opacity: 0, y: 28, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
      className="mb-12"
    >
      <span className="text-[11px] font-semibold tracking-[0.22em] uppercase text-[#C8922A] mb-3 block">
        {label}
      </span>
      <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight leading-none mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[var(--text-secondary)] text-lg max-w-[52ch] leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  )
}

// ================================================================
// CELESTIAL BODY  (sun/moon that rises and sets with theme)
// ================================================================

const CelestialBody = memo(function CelestialBody({ theme }: { theme: "dark" | "light" }) {
  return (
    <div className="fixed pointer-events-none z-[3]" style={{ top: "12%", right: "8%" }}>
      <AnimatePresence mode="wait">
        {theme === "light" ? (
          <motion.div
            key="sun"
            initial={{ y: 300, opacity: 0, scale: 0.4 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 300, opacity: 0, scale: 0.4 }}
            transition={{ type: "spring", stiffness: 45, damping: 18 }}
          >
            <div className="relative" style={{ width: 70, height: 70 }}>
              {/* Outer warm glow */}
              <div className="absolute -inset-8 rounded-full" style={{
                background: "radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(255,165,0,0.06) 50%, transparent 70%)",
              }} />
              {/* Sun rays — rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                className="absolute -inset-3"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="absolute left-1/2 top-1/2" style={{
                    width: 2, height: i % 2 === 0 ? 14 : 8,
                    marginLeft: -1,
                    marginTop: -(i % 2 === 0 ? 48 : 44),
                    background: `rgba(255,200,60,${i % 2 === 0 ? 0.5 : 0.3})`,
                    borderRadius: 1,
                    transform: `rotate(${i * 30}deg)`,
                    transformOrigin: `center ${i % 2 === 0 ? 48 : 44}px`,
                  }} />
                ))}
              </motion.div>
              {/* Sun disc */}
              <div className="absolute inset-0 rounded-full" style={{
                background: "radial-gradient(circle at 35% 35%, #FFF3C4 0%, #FFD700 40%, #F0A500 100%)",
                boxShadow: "0 0 40px 8px rgba(255,215,0,0.25), 0 0 80px 20px rgba(255,165,0,0.1)",
              }} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ y: 300, opacity: 0, scale: 0.4 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 300, opacity: 0, scale: 0.4 }}
            transition={{ type: "spring", stiffness: 45, damping: 18 }}
          >
            <div className="relative" style={{ width: 56, height: 56 }}>
              {/* Moonlight glow */}
              <div className="absolute -inset-6 rounded-full" style={{
                background: "radial-gradient(circle, rgba(200,200,215,0.1) 0%, transparent 65%)",
              }} />
              {/* Moon disc */}
              <div className="absolute inset-0 rounded-full" style={{
                background: "radial-gradient(circle at 65% 35%, #F0EDE4 0%, #D8D4C8 50%, #B8B4A8 100%)",
                boxShadow: "0 0 30px 6px rgba(200,198,185,0.12), 0 0 60px 15px rgba(200,198,185,0.06)",
              }} />
              {/* Crescent shadow */}
              <div className="absolute rounded-full" style={{
                width: 44, height: 44, top: -2, left: 10,
                background: "var(--bg-base)",
                transition: "background 0.7s cubic-bezier(0.32,0.72,0,1)",
              }} />
              {/* Surface craters (subtle) */}
              <div className="absolute rounded-full" style={{
                width: 6, height: 6, top: 28, left: 8, background: "rgba(180,175,165,0.2)",
              }} />
              <div className="absolute rounded-full" style={{
                width: 4, height: 4, top: 18, left: 14, background: "rgba(180,175,165,0.15)",
              }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ================================================================
// NAVIGATION
// ================================================================

function Navigation({ activeSection, theme, setTheme }: { activeSection: string; theme: "dark" | "light"; setTheme: (t: "dark" | "light") => void }) {
  const { scrollY } = useScroll()
  const isDark = theme === "dark"
  const navBg = useTransform(scrollY, (v: number) => {
    const p = Math.min(1, Math.max(0, v / 80))
    return isDark
      ? `rgba(2,11,24,${0.15 + p * 0.79})`
      : `rgba(255,255,255,${0.15 + p * 0.77})`
  })
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
          <span className="font-bold text-[15px] text-[var(--text-primary)] tracking-tight hidden sm:block">
            WDW Analysis
          </span>
        </button>

        <nav className="flex items-center gap-0.5 overflow-x-auto max-w-[60vw] md:max-w-none scrollbar-hide" aria-label="Sections">
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id
            return (
              <motion.button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                whileHover={{ scale: 1.08, y: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative px-2.5 sm:px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg flex-shrink-0"
                style={{ color: active ? "var(--text-primary)" : "var(--text-secondary)" }}
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
              </motion.button>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#5A9E6F] breathe" />
            3,146,086 records
          </div>
          <motion.button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: 15 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(200,146,42,0.12)",
              border: "1px solid rgba(200,146,42,0.25)",
              color: "#C8922A",
            }}
            aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.25 }}>
                  <Sun size={14} />
                </motion.div>
              ) : (
                <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.25 }}>
                  <Moon size={14} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
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
  const contentY    = useTransform(scrollY, [0, 400], [0, -28])

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
        <div className="max-w-3xl">

          {/* Content */}
          <motion.div style={{ y: contentY }} variants={containerV} initial="hidden" animate="visible" className="relative z-10">
            <motion.div variants={itemV} className="mb-8">
              <span
                className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] uppercase px-4 py-2 rounded-full"
                style={{ background: "rgba(200,146,42,0.1)", border: "1px solid rgba(200,146,42,0.25)", color: "#C8922A" }}>
                <Star size={11} />
                Data Science · Disney World · 2015 – 2021
                <Star size={11} />
              </span>
            </motion.div>

            <motion.div variants={itemV} className="mb-6">
              <h1 className="text-5xl md:text-7xl tracking-tight leading-[0.95] text-[var(--text-primary)]">
                <span className="font-light">The science</span><br />
                <span className="font-light">of</span>{" "}
                <span className="shimmer-gold font-black">Disney</span>
                <br />
                <span className="font-black">magic.</span>
              </h1>
            </motion.div>

            <motion.p variants={itemV} className="text-[var(--text-secondary)] text-lg leading-relaxed max-w-[46ch] mb-10">
              A Gradient Boosting machine learning analysis of{" "}
              <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>3,146,086 wait-time records</span>{" "}
              across 14 attractions and 4 parks — figuring out when lines are shortest and which rides are worth the wait.
            </motion.p>

            <motion.div variants={itemV} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {[
                { value: 3146086, label: "Records",    fmt: (n: number) => (n / 1e6).toFixed(2) + "M" },
                { value: 14,      label: "Attractions", fmt: (n: number) => n.toString() },
                { value: 7,       label: "Years",       fmt: (n: number) => n.toString() },
                { value: 57.3,    label: "R² × 100",   fmt: (n: number) => n.toFixed(1) + "%" },
              ].map((s) => (
                <div key={s.label} className="glass-card glass-card-hover p-4 text-center" style={{ borderRadius: 12 }}>
                  <div className="text-2xl font-black font-mono tabular-nums text-[var(--text-primary)] mb-0.5">
                    <AnimatedCounter value={s.value} format={s.fmt} />
                  </div>
                  <div className="text-[10px] font-semibold tracking-widest uppercase text-[var(--text-muted)]">{s.label}</div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={itemV} className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => scrollTo("overview")}
                whileHover={{ scale: 1.03, y: -1 }}                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm"
                style={{
                  background: "linear-gradient(135deg, #C8922A 0%, #E5AB3A 100%)",
                  color: "#020B18", boxShadow: "0 8px 32px -8px rgba(200,146,42,0.45)",
                }}
              >
                Explore the Data
                <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center">
                  <ArrowRight size={13} />
                </span>
              </motion.button>
              <motion.button
                onClick={() => scrollTo("predict")}
                whileHover={{ scale: 1.03, y: -1 }}                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-[var(--text-primary)]"
                style={{ border: "1px solid rgba(200,146,42,0.25)", background: "rgba(200,146,42,0.07)" }}
              >
                <Brain size={15} style={{ color: "#C8922A" }} /> Predict wait time
              </motion.button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 0.8 }}
          className="flex flex-col items-center gap-2 mt-14 text-[var(--text-muted)]"
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
    <section id="overview" className="relative py-36 px-6">
      <div className="section-divider mb-32" />
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="By the Numbers"
          title="7 years. 3.15M records."
          subtitle="All posted wait-time data from 2015 through 2021 for 14 attractions, broken down by hour, day, month, and season."
        />

        {/* Row 1: 2fr + 1fr stacked */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          <TiltCard className="md:col-span-2 glass-card glass-card-hover p-8 relative overflow-hidden">
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-4">Total Records Analyzed</div>
            <div className="text-7xl md:text-8xl font-black font-mono tabular-nums text-[var(--text-primary)] leading-none mb-3">
              <AnimatedCounter value={3146086} format={(n) => n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n.toLocaleString()} />
            </div>
            <p className="text-[var(--text-secondary)] text-sm max-w-[40ch]">
              Collected across 4 parks, 14 attractions, spanning January 2015 – December 2021.
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
              <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-2">Overall Avg Wait</div>
              <div className="text-5xl font-black font-mono tabular-nums text-[var(--text-primary)] leading-none">
                <AnimatedCounter value={48.9} format={(n) => n.toFixed(1)} />
              </div>
              <div className="text-[#C8922A] font-medium mt-1">minutes</div>
              <div className="flex items-center gap-1.5 text-xs text-[#5A9E6F] mt-3">
                <TrendingDown size={13} /> Best on Wednesdays
              </div>
            </TiltCard>
            <TiltCard className="glass-card glass-card-hover p-6 flex-1">
              <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--text-secondary)] mb-2">ML Model R²</div>
              <div className="text-5xl font-black font-mono tabular-nums text-[var(--text-primary)] leading-none">0.573</div>
              <div className="text-[#C8922A] font-medium mt-1">MAE ± 17 min</div>
              <div className="mt-3 h-1.5 rounded-full bg-[var(--bar-track)] overflow-hidden">
                <motion.div initial={{ width: 0 }} whileInView={{ width: "57.3%" }} viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#4A7FC1,#C8922A)" }} />
              </div>
            </TiltCard>
          </div>
        </div>

        {/* Row 2: seasonal + holiday */}
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-5">
          <TiltCard className="glass-card glass-card-hover p-8" intensity={3}>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-1">Seasonal Avg Wait</div>
            <p className="text-[var(--text-muted)] text-xs mb-8">Average across all 14 attractions by season</p>
            <div className="flex items-end gap-4" style={{ height: 144 }}>
              {SEASONS.map((s, i) => {
                const barH = Math.round((s.avg / maxSeason) * 120)
                return (
                  <motion.div key={s.name} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[11px] font-mono text-[var(--text-secondary)]">{s.avg}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: barH }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 + 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full rounded-t-sm"
                      style={{
                        background: s.best
                          ? "linear-gradient(180deg,#5A9E6F,rgba(90,158,111,0.55))"
                          : "linear-gradient(180deg,#C8922A,rgba(200,146,42,0.5))",
                      }}
                    />
                    <div className="text-center">
                      <div className="text-xs font-medium text-[var(--text-primary)]">{s.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{s.months}</div>
                      {s.best && <div className="text-[9px] text-[#5A9E6F] font-bold tracking-widest uppercase mt-0.5">Best</div>}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </TiltCard>

          <TiltCard className="glass-card glass-card-hover p-8" intensity={3}>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-1">Holiday Impact</div>
            <p className="text-[var(--text-muted)] text-xs mb-6">Avg wait increase during peak periods</p>
            <div className="space-y-4">
              {HOLIDAYS.map((h, i) => (
                <motion.div key={h.name} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-[var(--text-primary)] font-medium truncate pr-2">{h.name}</span>
                    <span className="text-xs font-mono font-bold flex-shrink-0 text-[#C8922A]">+{h.impact}%</span>
                  </div>
                  <div className="h-1 bg-[var(--bar-track)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${(h.impact / 17) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 + 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-[#C8922A]" />
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-1">{h.period}</div>
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
    <section id="rides" className="relative py-36 px-6">
      <div className="section-divider mb-32" />
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Attraction Analysis"
          title="Every ride, compared."
          subtitle="Average, median, and standard deviation for all 14 attractions — the full spread of what you're likely waiting."
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
                  color: active ? (m?.color ?? "#C8922A") : "var(--text-secondary)",
                  border: `1px solid ${active ? (m?.border ?? "rgba(200,146,42,0.35)") : "rgba(255,255,255,0.08)"}`,
                }}>
                {p === "All" ? "All Parks" : PARK_META[p]?.abbrev + " · " + p}
              </motion.button>
            )
          })}
        </div>

        {/* Ride cards — asymmetric 2-col layout */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((ride, i) => {
              const m    = PARK_META[ride.park]
              const barW = (ride.avg / maxAvg) * 100
              const isHigh = ride.avg >= 70
              return (
                <motion.div key={ride.id} layout
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 100, damping: 20 }}>
                  <TiltCard className="glass-card glass-card-hover p-7 h-full relative" intensity={5}>
                    {/* Park color accent line */}
                    <div className="absolute top-0 left-6 right-6 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${m?.color}, transparent)` }} />
                    <div className="flex items-start justify-between mt-2 mb-4">
                      <div>
                        <ParkBadge park={ride.park} />
                        <h3 className="text-[var(--text-primary)] font-bold text-lg leading-tight mt-3">{ride.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black font-mono tabular-nums" style={{ color: m?.color }}>{ride.avg}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-medium tracking-wide uppercase">avg min</div>
                      </div>
                    </div>
                    <div className="mb-5">
                      <div className="h-1.5 bg-[var(--bar-track)] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${barW}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: [0.32, 0.72, 0, 1], delay: i * 0.06 + 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg,${m?.color}55,${m?.color})` }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-5">
                        {[
                          { val: ride.median.toString(), label: "Median" },
                          { val: `±${ride.std}`,         label: "Std Dev"},
                        ].map((s) => (
                          <div key={s.label}>
                            <div className="text-sm font-bold font-mono tabular-nums text-[var(--text-primary)]">{s.val}</div>
                            <div className="text-[9px] font-medium tracking-widest uppercase text-[var(--text-muted)]">{s.label}</div>
                          </div>
                        ))}
                      </div>
                      {isHigh && (
                        <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-md"
                          style={{ background: "rgba(200,74,42,0.12)", color: "#C84A2A", border: "1px solid rgba(200,74,42,0.25)" }}>
                          High demand
                        </span>
                      )}
                    </div>
                  </TiltCard>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {/* Feature importance */}
        <motion.div initial={{ opacity: 0, y: 24, filter: "blur(4px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          className="mt-8 glass-card glass-card-hover p-8">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-2">ML Feature Importance</div>
              <p className="text-[var(--text-secondary)] text-sm max-w-[26ch]">Which inputs drive the Gradient Boosting predictions most.</p>
            </div>
            <div className="space-y-3">
              {FEATURE_IMPORTANCE_GB.map((f, i) => (
                <div key={f.feature} className="flex items-center gap-3">
                  <span className="text-xs text-[var(--text-secondary)] w-28 flex-shrink-0 text-right">{f.feature}</span>
                  <div className="flex-1 h-1.5 bg-[var(--bar-track)] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${f.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 + 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: i === 0 ? "linear-gradient(90deg,#4A7FC1,#C8922A)" : "rgba(200,146,42,0.5)" }} />
                  </div>
                  <span className="text-xs font-mono font-bold text-[var(--text-primary)] w-12 flex-shrink-0">{f.pct}%</span>
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
    <section id="predict" className="relative py-36 px-6">
      <div className="section-divider mb-32" />
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Machine Learning Model"
          title="Predict your wait."
          subtitle="Gradient Boosting model trained on 3.15M records. Pick a ride, day, and month to see what the model thinks."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <TiltCard className="glass-card p-8 space-y-5" intensity={3}>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-secondary)] mb-2">Attraction</label>
              <select className="themed-select" value={form.ride}
                onChange={(e) => setForm((f) => ({ ...f, ride: e.target.value }))}>
                {RIDES.map((r) => (
                  <option key={r.id} value={r.name}>{r.name} ({PARK_META[r.park]?.abbrev})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-secondary)] mb-2">Month</label>
                <select className="themed-select" value={form.month}
                  onChange={(e) => setForm((f) => ({ ...f, month: +e.target.value }))}>
                  {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-secondary)] mb-2">Day</label>
                <select className="themed-select" value={form.day}
                  onChange={(e) => setForm((f) => ({ ...f, day: +e.target.value }))}>
                  {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d, i) => (
                    <option key={d} value={i}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-secondary)] mb-3">Holiday Period</label>
              <div className="flex gap-3">
                {[{ val: false, label: "Not a Holiday" }, { val: true, label: "Holiday Period" }].map((opt) => (
                  <motion.button key={String(opt.val)} onClick={() => setForm((f) => ({ ...f, holiday: opt.val }))}
                    whileHover={{ scale: 1.03, y: -1 }}                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold"
                    style={{
                      background: form.holiday === opt.val ? (opt.val ? "rgba(200,80,42,0.14)" : "rgba(200,146,42,0.11)") : "rgba(255,255,255,0.04)",
                      border: `1px solid ${form.holiday === opt.val ? (opt.val ? "rgba(200,80,42,0.4)" : "rgba(200,146,42,0.35)") : "rgba(255,255,255,0.08)"}`,
                      color: form.holiday === opt.val ? (opt.val ? "#C8602A" : "#C8922A") : "var(--text-secondary)",
                    }}>
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>
            <motion.button onClick={handlePredict}
              whileHover={{ scale: 1.02, y: -1 }}              transition={{ type: "spring", stiffness: 400, damping: 25 }}
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
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: [0.32, 0.72, 0, 1] }}
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
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: "rgba(200,146,42,0.08)", border: "1px solid rgba(200,146,42,0.15)" }}>
                    <Brain size={28} style={{ color: "#C8922A", opacity: 0.55 }} />
                  </motion.div>
                  <p className="text-[var(--text-muted)] text-sm max-w-[24ch]">
                    Configure your trip details and hit Calculate to get a prediction.
                  </p>
                </motion.div>
              )}
              {loading && (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center gap-5 h-full">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: [0.32, 0.72, 0, 1] }}
                    className="w-12 h-12 rounded-full border-2 border-[rgba(200,146,42,0.2)] border-t-[#C8922A]" />
                  <p className="text-[var(--text-muted)] text-sm">Running Gradient Boosting model…</p>
                  <div className="w-48 h-1 rounded-full bg-[var(--bar-track)] overflow-hidden">
                    <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: [0.32, 0.72, 0, 1] }}
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
                      <div className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--text-secondary)] mb-1">Predicted Wait</div>
                      <div className="text-8xl font-black font-mono tabular-nums text-[var(--text-primary)] leading-none">{result.prediction}</div>
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
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mb-2">
                      <span>Range: {result.range[0]}–{result.range[1]} min</span>
                      <span className="font-mono">{result.confidence}% confidence</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--bar-track)] overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#4A7FC1,#C8922A)" }} />
                    </div>
                  </div>
                  <div className="rounded-xl p-4 text-sm text-[var(--text-secondary)]"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex gap-2">
                      <Info size={14} className="flex-shrink-0 mt-0.5" style={{ color: "#C8922A" }} />
                      <p>
                        On a <span className="text-[var(--text-primary)]">
                          {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"][form.day]}
                        </span> in <span className="text-[var(--text-primary)]">{MONTHS[form.month]}</span>
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
    <section id="timing" className="relative py-36 px-6">
      <div className="section-divider mb-32" />
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Visit Planning"
          title="When to go."
          subtitle="Midweek visits consistently have shorter waits — about 10% less than Saturday peaks."
        />

        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6 mb-6">
          {/* Day chart */}
          <TiltCard className="glass-card glass-card-hover p-8" intensity={3}>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-1">Avg Wait by Day</div>
            <p className="text-[var(--text-muted)] text-xs mb-8">Across all 14 attractions · minutes</p>
            <div className="flex items-end gap-3" style={{ height: 176 }}>
              {DAYS.map((d, i) => {
                const barH = Math.round((d.avg / maxDay) * 140)
                const best = d.avg === minDay
                const worst= d.avg === maxDay
                return (
                  <motion.div key={d.day} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">{d.avg}</span>
                    <motion.div
                      initial={{ height: 0 }}
                      whileInView={{ height: barH }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 + 0.15, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full rounded-t-md"
                      style={{
                        background: best ? "linear-gradient(180deg,#5A9E6F,rgba(90,158,111,0.55))"
                          : worst ? "linear-gradient(180deg,#C84A2A,rgba(200,74,42,0.55))"
                          : "linear-gradient(180deg,#C8922A,rgba(200,146,42,0.45))",
                      }}
                    />
                    <span className="text-xs font-medium"
                      style={{ color: best ? "#5A9E6F" : worst ? "#C84A2A" : "var(--text-secondary)" }}>{d.day}</span>
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
              { icon: <CheckCircle2 size={15} />, color: "#5A9E6F", title: "Tue & Wed win",
                body: "47–48 min average on Tuesday/Wednesday vs 52 min on Saturday. Consistent across all rides." },
              { icon: <Clock size={15} />,        color: "#C8922A", title: "Rope drop matters",
                body: "Waits in the first 90 minutes after open are 40–60% shorter than midday." },
              { icon: <Calendar size={15} />,     color: "#4A7FC1", title: "Go in the fall",
                body: "Sep–Nov averages 42.3 min, the lowest of any season. September alone is 32.9 min." },
              { icon: <AlertTriangle size={15} />,color: "#C84A2A", title: "Skip holiday weeks",
                body: "Spring Break (+17%) and Christmas (+13%) have the biggest crowd spikes in the data." },
            ].map((card, i) => (
              <motion.div key={card.title} initial={{ opacity: 0, x: 16, filter: "blur(3px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true }} transition={{ delay: i * 0.09, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                className="glass-card glass-card-hover p-5 flex gap-4">
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                  style={{ background: `${card.color}18`, border: `1px solid ${card.color}44`, color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <div className="text-sm font-bold text-[var(--text-primary)] mb-1">{card.title}</div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{card.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Month crowd heatmap */}
        <TiltCard className="glass-card glass-card-hover p-8" intensity={2}>
          <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-1">Month-by-Month Crowd Level</div>
          <p className="text-[var(--text-muted)] text-xs mb-6">Relative wait-time multiplier — green = low crowds, red = high</p>
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
          <div className="flex items-center gap-4 mt-5 text-[10px] text-[var(--text-muted)]">
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
// MODELS SECTION
// ================================================================

function ModelsSection() {
  const [showPerRide, setShowPerRide] = useState(false)
  const maxR2 = Math.max(...MODEL_COMPARISON.map((m) => m.r2))

  return (
    <section id="models" className="relative py-36 px-6">
      <div className="section-divider mb-32" />
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Model Iteration"
          title="RF vs Gradient Boosting."
          subtitle="Both models trained on 3.15M records. Gradient Boosting edges out Random Forest, and per-ride models show what matters once you control for attraction identity."
        />

        {/* Model comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {MODEL_COMPARISON.map((model, i) => {
            const isWinner = model.r2 === Math.max(...MODEL_COMPARISON.map((m) => m.r2))
            return (
              <motion.div key={model.name} initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}>
                <TiltCard className="glass-card glass-card-hover p-8 h-full relative" intensity={5}>
                  {isWinner && (
                    <div className="absolute top-0 left-6 right-6 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${model.color}, transparent)` }} />
                  )}
                  <div className="flex items-start justify-between mt-1 mb-6">
                    <div>
                      <div className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: model.color }}>
                        {model.name}
                      </div>
                      {isWinner && (
                        <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-md"
                          style={{ background: "rgba(90,158,111,0.12)", color: "#5A9E6F", border: "1px solid rgba(90,158,111,0.25)" }}>
                          Winner
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-black font-mono tabular-nums text-[var(--text-primary)] leading-none">{model.r2.toFixed(3)}</div>
                      <div className="text-[10px] text-[var(--text-muted)] font-medium tracking-wide uppercase mt-1">R² score</div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="h-2 bg-[var(--bar-track)] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${(model.r2 / maxR2) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.32, 0.72, 0, 1], delay: i * 0.1 + 0.2 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${model.color}55, ${model.color})` }} />
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <div className="text-lg font-bold font-mono tabular-nums text-[var(--text-primary)]">±{model.mae}</div>
                      <div className="text-[9px] font-medium tracking-widest uppercase text-[var(--text-muted)]">MAE (min)</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold font-mono tabular-nums text-[var(--text-primary)]">{(model.r2 * 100).toFixed(1)}%</div>
                      <div className="text-[9px] font-medium tracking-widest uppercase text-[var(--text-muted)]">Variance Explained</div>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>
            )
          })}
        </div>

        {/* Feature importance comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {[
            { title: "Random Forest", data: FEATURE_IMPORTANCE_RF, color: "#4A7FC1" },
            { title: "Gradient Boosting", data: FEATURE_IMPORTANCE_GB, color: "#C8922A" },
          ].map((model, mi) => (
            <motion.div key={model.title} initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }} transition={{ delay: mi * 0.1, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
              className="glass-card glass-card-hover p-7">
              <div className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-1" style={{ color: model.color }}>
                {model.title}
              </div>
              <p className="text-[var(--text-muted)] text-xs mb-5">Feature importance</p>
              <div className="space-y-3">
                {model.data.map((f, i) => (
                  <div key={f.feature} className="flex items-center gap-3">
                    <span className="text-[11px] text-[var(--text-secondary)] w-24 flex-shrink-0 text-right">{f.feature}</span>
                    <div className="flex-1 h-1.5 bg-[var(--bar-track)] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${f.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: mi * 0.1 + i * 0.06 + 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="h-full rounded-full"
                        style={{ background: i === 0 ? `linear-gradient(90deg,${model.color}88,${model.color})` : `${model.color}66` }} />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[var(--text-primary)] w-10 flex-shrink-0">{f.pct}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Insight callout */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="glass-card glass-card-hover p-7 mb-8">
          <div className="flex gap-4 items-start">
            <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center"
              style={{ background: "rgba(200,146,42,0.12)", border: "1px solid rgba(200,146,42,0.25)" }}>
              <Brain size={16} style={{ color: "#C8922A" }} />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--text-primary)] mb-1.5">Why per-ride models?</div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-[64ch]">
                Attraction identity accounts for 65–71% of feature importance in the combined model — it's basically
                saying "some rides are busier than others." Training per-ride models removes that and lets the temporal
                features do the work. Result: <span className="text-[var(--text-primary)] font-semibold">Hour of Day</span> is
                the top predictor for 13 of 14 rides.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Per-ride model toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-1">Per-Ride Gradient Boosting</div>
            <p className="text-[var(--text-muted)] text-xs">Individual models trained without the Attraction feature</p>
          </div>
          <motion.button onClick={() => setShowPerRide(!showPerRide)}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="text-xs font-semibold px-4 py-2 rounded-lg"
            style={{
              background: showPerRide ? "rgba(200,146,42,0.14)" : "rgba(255,255,255,0.04)",
              color: showPerRide ? "#C8922A" : "var(--text-secondary)",
              border: `1px solid ${showPerRide ? "rgba(200,146,42,0.35)" : "rgba(255,255,255,0.08)"}`,
            }}>
            {showPerRide ? "Hide Details" : "Show All 14 Rides"}
          </motion.button>
        </div>

        <AnimatePresence>
          {showPerRide && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PER_RIDE_MODELS.map((m, i) => {
                  const parkName = RIDES.find((r) => r.name === m.ride)?.park ?? ""
                  const pm = PARK_META[parkName]
                  return (
                    <motion.div key={m.ride} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                      className="glass-card glass-card-hover p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <ParkBadge park={parkName} />
                          <div className="text-sm font-bold text-[var(--text-primary)] mt-2">{m.ride}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black font-mono tabular-nums" style={{ color: pm?.color ?? "#C8922A" }}>
                            {m.r2.toFixed(3)}
                          </div>
                          <div className="text-[9px] text-[var(--text-muted)] tracking-wide uppercase">R²</div>
                        </div>
                      </div>
                      <div className="h-1 bg-[var(--bar-track)] rounded-full overflow-hidden mb-3">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${m.r2 * 100}%` }}
                          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: i * 0.04 + 0.2 }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${pm?.color ?? "#C8922A"}55, ${pm?.color ?? "#C8922A"})` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[var(--text-muted)]">MAE: <span className="font-mono font-bold text-[var(--text-secondary)]">±{m.mae} min</span></span>
                        <span className="text-[var(--text-muted)]">Top: <span className="font-semibold text-[var(--text-secondary)]">{m.topFeature}</span> <span className="font-mono">({m.topPct}%)</span></span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

// ================================================================
// PARK STRATEGIES
// ================================================================

const PARK_STRATEGIES: Record<string, { ride: string; color: string; best: string; tip: string }[]> = {
  "Hollywood Studios": [
    { ride: "Slinky Dog Dash",         color: "#C8922A", best: "9 PM",     tip: "High all day (59–84 min). Peaks at 84 min by 11 AM, lowest at 47 min by 9 PM. Lightning Lane recommended." },
    { ride: "Rock 'n' Roller Coaster", color: "#4A7FC1", best: "8 AM",     tip: "24 min at rope drop, surges to 73 min by 11 AM. Evening after 8 PM drops to ~39 min." },
    { ride: "Toy Story Mania",          color: "#5A9E6F", best: "9 PM",     tip: "30 min at rope drop, peaks at 66 min by 2 PM. Late evening (28 min at 9 PM) is best." },
    { ride: "Alien Swirling Saucers",   color: "#8B6BB5", best: "8 AM",     tip: "18 min at rope drop, peaks at 41 min by 11 AM. Lowest waits in DHS — drops to 15 min by close." },
  ],
  "Magic Kingdom": [
    { ride: "Seven Dwarfs Mine Train",   color: "#4A7FC1", best: "8 AM",     tip: "44 min at rope drop, climbs to 93 min by 1 PM and stays high all day. Rope drop is critical." },
    { ride: "Splash Mountain",            color: "#5A9E6F", best: "8–9 AM",  tip: "10–16 min early morning, peaks at 63 min by 1 PM. Huge morning advantage — ride first." },
    { ride: "Pirates of the Caribbean",   color: "#8B6BB5", best: "8–9 AM",  tip: "8–13 min early morning. Peaks at 41 min by 1 PM. High capacity keeps waits manageable." },
  ],
  "Animal Kingdom": [
    { ride: "Flight of Passage",   color: "#C8922A", best: "8 AM",     tip: "The longest waits in all of WDW — 99–136 min all day. Lowest at rope drop (99 min). Lightning Lane essential." },
    { ride: "Na'vi River Journey",  color: "#5A9E6F", best: "8 AM",     tip: "27 min at rope drop, surges to 77 min by 11 AM. Morning Pandora visit is critical." },
    { ride: "Kilimanjaro Safaris",  color: "#4A7FC1", best: "8 AM",     tip: "14 min at rope drop, peaks at 58 min by 11 AM. Animals are also most active in morning." },
    { ride: "Expedition Everest",   color: "#8B6BB5", best: "8 AM",     tip: "9 min at rope drop, peaks at 44 min by noon. Drops to 16 min by 9 PM — great bookend option." },
    { ride: "DINOSAUR",             color: "#C84A2A", best: "8 AM",     tip: "8 min at rope drop, peaks at 38 min midday. Low waits all day — ride whenever convenient." },
  ],
  "EPCOT": [
    { ride: "Soarin'",         color: "#8B6BB5", best: "8 AM",     tip: "16 min at rope drop, peaks at 59 min by 11 AM. Evening (25 min at 9 PM) is also good." },
    { ride: "Spaceship Earth",  color: "#4A7FC1", best: "8–9 PM",  tip: "6 min at rope drop, peaks at 36 min by 11 AM. Drops to single digits by evening — walk-on after 7 PM." },
  ],
}

// ================================================================
// PARKS SECTION
// ================================================================

function ParksSection() {
  const parkNames = Object.keys(PARK_HOURLY)
  const [activePark, setActivePark] = useState(parkNames[0])
  const [hovered, setHovered] = useState<{ ride: string; hour: string; val: number } | null>(null)

  const hourlyData = PARK_HOURLY[activePark]
  const rides = Object.keys(hourlyData)
  const allVals = rides.flatMap((r) => hourlyData[r])
  const maxVal = Math.max(...allVals)
  const minVal = Math.min(...allVals)
  const parkMeta = PARK_META[activePark]
  const strategies = PARK_STRATEGIES[activePark] ?? []

  return (
    <section id="parks" className="relative py-36 px-6">
      <div className="section-divider mb-32" />
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          label="Park Deep Dive"
          title="Hour by hour."
          subtitle="Hourly wait-time heatmaps for every attraction across all 4 parks. Where the lines are, and when they aren't."
        />

        {/* Park tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {parkNames.map((park) => {
            const m = PARK_META[park]
            const active = activePark === park
            return (
              <motion.button key={park} onClick={() => { setActivePark(park); setHovered(null) }}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="text-xs font-semibold px-4 py-2 rounded-lg transition-all duration-200"
                style={{
                  background: active ? (m?.bg ?? "rgba(200,146,42,0.14)") : "rgba(255,255,255,0.04)",
                  color: active ? (m?.color ?? "#C8922A") : "var(--text-secondary)",
                  border: `1px solid ${active ? (m?.border ?? "rgba(200,146,42,0.35)") : "rgba(255,255,255,0.08)"}`,
                }}>
                {m?.abbrev + " · " + park}
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activePark}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}>

            <TiltCard className="glass-card p-4 sm:p-8 mb-6 overflow-x-auto" intensity={2}>
              <div className="text-[11px] font-semibold tracking-[0.2em] uppercase mb-6" style={{ color: parkMeta?.color ?? "#C8922A" }}>
                Avg Wait (min) · {activePark} · Hourly
              </div>
              {/* Hour header */}
              <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `150px repeat(${HOURS_LABELS.length}, 1fr)` }}>
                <div />
                {HOURS_LABELS.map((h) => (
                  <div key={h} className="text-[9px] font-mono text-[var(--text-muted)] text-center">{h}</div>
                ))}
              </div>
              {/* Data rows */}
              {rides.map((ride, ri) => (
                <motion.div key={ride} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: ri * 0.08 }}
                  className="grid gap-1 mb-1 items-center"
                  style={{ gridTemplateColumns: `150px repeat(${HOURS_LABELS.length}, 1fr)` }}>
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium pr-3 truncate text-right">{ride}</div>
                  {hourlyData[ride].map((val, hi) => (
                    <motion.div key={hi} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: ri * 0.05 + hi * 0.02 }}
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
              <div className="flex items-center gap-3 mt-5 text-[10px] text-[var(--text-muted)]">
                <span>Wait:</span>
                <div className="flex-1 max-w-[180px] h-2 rounded-full"
                  style={{ background: "linear-gradient(90deg,rgba(42,150,68,0.88),rgba(200,146,42,0.88),rgba(180,50,28,0.88))" }} />
                <span>{minVal} min → {maxVal} min</span>
              </div>
              <AnimatePresence>
                {hovered && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-3 text-sm text-[var(--text-primary)]">
                    <span style={{ color: parkMeta?.color ?? "#C8922A" }} className="font-bold">{hovered.ride}</span>
                    {" · "}{hovered.hour}{" → "}
                    <span className="font-mono font-bold">{hovered.val} min</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </TiltCard>

            {/* Strategy cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {strategies.map((s, i) => (
                <motion.div key={s.ride} initial={{ opacity: 0, y: 20, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: i * 0.09, duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  className="glass-card glass-card-hover p-6 flex gap-5 items-start">
                  <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: `${s.color}14`, border: `1px solid ${s.color}30` }}>
                    <Clock size={16} style={{ color: s.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-[var(--text-primary)]">{s.ride}</span>
                      <span className="text-[10px] font-bold font-mono tabular-nums px-2 py-0.5 rounded-md"
                        style={{ background: "rgba(90,158,111,0.12)", color: "#5A9E6F", border: "1px solid rgba(90,158,111,0.25)" }}>
                        {s.best}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{s.tip}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
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
              <span className="font-bold text-[var(--text-primary)]">WDW Analysis</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[28ch]">
              Built by Johnny Nguyen. Wait-time analysis and ML modeling using the TouringPlans dataset.
            </p>
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-4">Dataset</div>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>Source: Touring Plans historical data</li>
              <li>Records: 3,146,086 wait-time entries</li>
              <li>Parks: MK · EPCOT · DHS · DAK</li>
              <li>Range: January 2015 – December 2021</li>
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C8922A] mb-4">Model Details</div>
            <ul className="space-y-2 text-xs text-[var(--text-muted)]">
              <li>Algorithm: Gradient Boosting Regressor</li>
              <li>R² Score: 0.573</li>
              <li>Mean Absolute Error: ±17 min</li>
              <li>Top feature: Attraction identity (70.7%)</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-[var(--text-muted)]">
          <span>
            Walt Disney World® is a registered trademark of The Walt Disney Company. Independent academic analysis only.
          </span>
          <span className="font-mono">© 2026 <span style={{ color: "#C8922A" }}>Johnny Nguyen</span> · Data science portfolio</span>
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
  const [theme, setTheme] = useState<"dark" | "light">("dark")

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  useEffect(() => {
    const ids = ["hero", "overview", "rides", "predict", "timing", "models", "parks"]
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
    <main className="relative min-h-screen" style={{ backgroundColor: "var(--bg-base)", transition: "background-color 0.7s cubic-bezier(0.32,0.72,0,1)" }}>
      <div className="noise-overlay" aria-hidden="true" />
      <div className="ambient-bg-dark" aria-hidden="true" style={{ opacity: theme === "dark" ? 1 : 0 }} />
      <div className="ambient-bg-light" aria-hidden="true" style={{ opacity: theme === "light" ? 1 : 0 }} />
      <MagicCanvas theme={theme} />
      <CursorSpotlight theme={theme} />
      <Navigation activeSection={activeSection} theme={theme} setTheme={setTheme} />
      <HeroSection />
      <OverviewSection />
      <RidesSection />
      <PredictSection />
      <TimingSection />
      <ModelsSection />
      <ParksSection />
      <Footer />
    </main>
  )
}
