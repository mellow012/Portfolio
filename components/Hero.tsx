'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, Github, Linkedin, Mail,
  Code2, Sparkles, ExternalLink, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '../lib/firebaseConfig'

/* ─── Types ─────────────────────────────────────── */
interface FeaturedProject {
  id: string
  title: string
  summary: string
  image: string        // normalised — covers imageUrl + image fields
  category: string
  tags: string[]
  liveUrl?: string
  githubUrl?: string
}

/* ─── Fallback (shown while Firestore loads or if empty) ─────── */
const FALLBACK_PROJECTS: FeaturedProject[] = [
  {
    id: '1',
    title: 'Bus Booking Platform',
    summary: 'End-to-end seat reservation system for intercity travel with real-time availability.',
    image: '/placeholder.png',
    category: 'Web App',
    tags: ['Next.js', 'Firebase', 'Payments'],
  },
  {
    id: '2',
    title: 'Church Management System',
    summary: 'Member registry, attendance tracking, and tithing management for modern churches.',
    image: '/placeholder.png',
    category: 'Business Platform',
    tags: ['React', 'Node.js', 'PostgreSQL'],
  },
  {
    id: '3',
    title: 'Mellowverse Portfolio',
    summary: 'The portfolio you\'re viewing — built for performance, clarity, and real client conversion.',
    image: '/placeholder.png',
    category: 'Portfolio',
    tags: ['Next.js', 'Tailwind', 'Framer Motion'],
  },
]

/* ─── Typewriter hook ────────────────────────────── */
const ROLES = [
  'Full-Stack Developer',
  'Android Engineer',
  'Systems Architect',
  'Remote-Ready Builder',
]

function useTypewriter(strings: string[], speed = 65, pause = 2400) {
  const [displayed, setDisplayed] = useState('')
  const [roleIdx, setRoleIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = strings[roleIdx]
    let timeout: ReturnType<typeof setTimeout>
    if (!deleting && displayed === current) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && displayed === '') {
      setDeleting(false)
      setRoleIdx((i) => (i + 1) % strings.length)
    } else {
      timeout = setTimeout(
        () => setDisplayed((d) => deleting ? d.slice(0, -1) : current.slice(0, d.length + 1)),
        deleting ? speed / 2 : speed
      )
    }
    return () => clearTimeout(timeout)
  }, [displayed, deleting, roleIdx, strings, speed, pause])

  return displayed
}

/* ─── Counter ────────────────────────────────────── */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        let n = 0
        const step = Math.ceil(end / 40)
        const t = setInterval(() => {
          n = Math.min(n + step, end)
          setCount(n)
          if (n >= end) clearInterval(t)
        }, 35)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end])

  return <span ref={ref}>{count}{suffix}</span>
}

/* ─── Progress bar for auto-advance ─────────────── */
function ProgressBar({ duration, active }: { duration: number; active: boolean }) {
  return (
    <div className="h-0.5 bg-white/20 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-white rounded-full"
        initial={{ width: '0%' }}
        animate={active ? { width: '100%' } : { width: '0%' }}
        transition={active ? { duration: duration / 1000, ease: 'linear' } : { duration: 0 }}
      />
    </div>
  )
}

/* ─── Main Component ─────────────────────────────── */
const SLIDE_DURATION = 5000

export default function Hero() {
  const role = useTypewriter(ROLES)
  const [projects, setProjects] = useState<FeaturedProject[]>([])
  const [activeProject, setActiveProject] = useState(0)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [isFallback,      setIsFallback]       = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const yParallax = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const opacity    = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  /* ── Fetch featured projects ── */
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'projects'), where('featured', '==', true), limit(5))
        )
        const toProject = (d: import('firebase/firestore').QueryDocumentSnapshot) => ({
          id:        d.id,
          title:     d.data().title    || '',
          summary:   d.data().summary  || d.data().description || '',
          image:     d.data().imageUrl || d.data().image || '/placeholder.png',
          category:  d.data().category || 'Project',
          tags:      d.data().tags     || [],
          liveUrl:   d.data().liveUrl,
          githubUrl: d.data().githubUrl,
        })

        if (!snap.empty) {
          // ✅ Real featured projects from Firestore
          setProjects(snap.docs.map(toProject))
          setIsFallback(false)
        } else {
          // No featured projects — try fetching any projects instead
          try {
            const allSnap = await getDocs(query(collection(db, 'projects'), limit(4)))
            if (!allSnap.empty) {
              setProjects(allSnap.docs.map(toProject))
              setIsFallback(false)
            } else {
              // Truly empty — show static placeholders but disable navigation
              setProjects(FALLBACK_PROJECTS)
              setIsFallback(true)
            }
          } catch {
            setProjects(FALLBACK_PROJECTS)
            setIsFallback(true)
          }
        }
      } catch {
        setProjects(FALLBACK_PROJECTS)
        setIsFallback(true)
      } finally {
        setLoadingProjects(false)
      }
    }
    fetchProjects()
  }, [])

  /* ── Auto-advance carousel ── */
  useEffect(() => {
    if (projects.length <= 1 || isPaused) return
    const id = setInterval(
      () => setActiveProject((i) => (i + 1) % projects.length),
      SLIDE_DURATION
    )
    return () => clearInterval(id)
  }, [projects.length, isPaused])

  const displayProjects = projects.length > 0 ? projects : FALLBACK_PROJECTS
  // isFallback === true means the IDs are fake — never navigate to them
  const current = displayProjects[activeProject]

  const goTo   = (i: number) => { setActiveProject(i); setIsPaused(true) }
  const goNext = () => goTo((activeProject + 1) % displayProjects.length)
  const goPrev = () => goTo((activeProject - 1 + displayProjects.length) % displayProjects.length)

  const socials = [
    { icon: Github,   href: 'https://github.com/mellow012',          label: 'GitHub'   },
    { icon: Linkedin, href: 'https://linkedin.com',                   label: 'LinkedIn' },
    { icon: Mail,     href: 'mailto:wiz116mlambia@gmail.com',         label: 'Email'    },
  ]

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 animated-gradient" />
      <motion.div style={{ y: yParallax }}
        className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl pointer-events-none" />
      <motion.div style={{ y: yParallax }}
        className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-rose-500/6 rounded-full blur-3xl pointer-events-none" />
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.022] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--foreground)) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <motion.div style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 xl:gap-20 items-center">

          {/* ══════════════════
              LEFT — copy
          ══════════════════ */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
          >
            {/* Availability badge */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-8
                         bg-emerald-500/10 border border-emerald-500/20 rounded-full
                         text-xs font-medium text-emerald-600 dark:text-emerald-400"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Available for new projects
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.02] mb-6"
            >
              I build{' '}
              <span className="gradient-text block">digital products</span>
              that ship.
            </motion.h1>

            {/* Typewriter */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="flex items-center gap-2.5 mb-6 h-7"
            >
              <Code2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-base text-muted-foreground font-medium">
                {role}
                <span className="ml-0.5 inline-block w-[2px] h-[1.1em] bg-primary animate-pulse align-middle rounded-full" />
              </span>
            </motion.div>

            {/* Bio */}
            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="text-[15px] text-muted-foreground leading-relaxed max-w-lg mb-10"
            >
              5+ years building booking systems, business platforms, and Android apps
              for real clients. Based in Malawi · working worldwide.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="flex flex-wrap gap-3 mb-12"
            >
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 px-6 py-3.5
                           bg-primary text-primary-foreground rounded-xl font-medium text-sm
                           hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/25 active:scale-[0.97]"
              >
                View my work
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3.5
                           bg-card border border-border rounded-xl font-medium text-sm
                           text-foreground hover:bg-accent transition-all active:scale-[0.97]"
              >
                Let's talk
              </Link>
            </motion.div>

            {/* Socials */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="flex items-center gap-3"
            >
              <span className="text-xs text-muted-foreground">Find me on</span>
              <div className="h-px w-6 bg-border" />
              {socials.map(({ icon: Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-xl bg-card border border-border
                             flex items-center justify-center text-muted-foreground
                             hover:text-primary hover:border-primary/30 transition-colors"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* ══════════════════
              RIGHT — carousel
          ══════════════════ */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] as [number,number,number,number], delay: 0.25 }}
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* ── Main card ── */}
            <div className="relative rounded-2xl overflow-hidden bg-card border border-border
                            shadow-2xl shadow-black/12 ring-1 ring-border/50">

              {/* Image with cross-fade */}
              <div className="relative h-56 sm:h-64 bg-muted overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeProject + '-img'}
                    src={displayProjects[activeProject]?.image}
                    alt={displayProjects[activeProject]?.title}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] as [number,number,number,number] }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Dark gradient for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Bottom overlay — category + project number */}
                <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={activeProject + '-cat'}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.3 }}
                      className="px-2.5 py-1 bg-white/15 backdrop-blur-md border border-white/20
                                 rounded-full text-[11px] font-medium text-white"
                    >
                      {displayProjects[activeProject]?.category}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-[11px] text-white/60 font-medium tabular-nums">
                    {String(activeProject + 1).padStart(2, '0')} / {String(displayProjects.length).padStart(2, '0')}
                  </span>
                </div>

                {/* Nav arrows — appear on hover */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrev() }}
                  className="absolute left-3 top-1/2 -translate-y-1/2
                             w-8 h-8 bg-black/30 hover:bg-black/50 backdrop-blur-sm
                             rounded-full flex items-center justify-center
                             text-white transition-all opacity-0 group-hover:opacity-100
                             [.group:hover_&]:opacity-100"
                  aria-label="Previous project"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNext() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                             w-8 h-8 bg-black/30 hover:bg-black/50 backdrop-blur-sm
                             rounded-full flex items-center justify-center
                             text-white transition-all"
                  aria-label="Next project"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Card body */}
              <div className="p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProject + '-body'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-base font-bold text-foreground leading-snug line-clamp-1">
                        {displayProjects[activeProject]?.title}
                      </h3>
                      {/* External link buttons — <button> not <a>, card is inside no outer Link */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {displayProjects[activeProject]?.githubUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(displayProjects[activeProject].githubUrl, '_blank', 'noopener,noreferrer')}
                            className="w-7 h-7 rounded-lg bg-accent hover:bg-primary/10 hover:text-primary
                                       text-muted-foreground flex items-center justify-center transition-colors"
                            aria-label="GitHub"
                          >
                            <Github className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {displayProjects[activeProject]?.liveUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(displayProjects[activeProject].liveUrl, '_blank', 'noopener,noreferrer')}
                            className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20
                                       text-primary flex items-center justify-center transition-colors"
                            aria-label="Live demo"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {displayProjects[activeProject]?.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {(displayProjects[activeProject]?.tags || []).slice(0, 4).map((tag) => (
                        <span key={tag}
                          className="px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] rounded-lg font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Footer: progress dots + view link */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                  {/* Dot indicators with progress bar */}
                  <div className="flex items-center gap-2">
                    {displayProjects.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goTo(i)}
                        className="group/dot relative"
                        aria-label={`Go to project ${i + 1}`}
                      >
                        {i === activeProject ? (
                          <div className="w-12 h-1.5 rounded-full overflow-hidden bg-primary/20">
                            <ProgressBar duration={SLIDE_DURATION} active={!isPaused} />
                          </div>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-border hover:bg-primary/40 transition-colors" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Only link to real Firestore documents */}
                  {!isFallback && current ? (
                    <Link
                      href={`/projects/${current.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold
                                 text-primary hover:underline underline-offset-2"
                    >
                      View project
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <Link
                      href="/projects"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold
                                 text-muted-foreground hover:text-primary transition-colors"
                    >
                      See all projects
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* ── Floating chip — Tech Stack ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="absolute -top-4 -right-4 glass rounded-2xl p-3.5 shadow-xl
                         hidden sm:block border border-border/60 z-10"
            >
              <p className="text-[10px] font-semibold text-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="h-3 w-3 text-primary" />
                Stack
              </p>
              <div className="flex flex-wrap gap-1 max-w-[148px]">
                {['Next.js', 'Firebase', 'Kotlin', 'TypeScript'].map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-md font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* ── Floating chip — Stats ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              className="absolute -bottom-4 -left-4 glass rounded-2xl p-3.5 shadow-xl
                         hidden sm:block border border-border/60 z-10"
            >
              <div className="flex items-center gap-5">
                {[{ n: 15, label: 'Clients' }, { n: 10, label: 'Projects' }, { n: 5, label: 'Years' }].map((s, i, arr) => (
                  <div key={s.label} className="flex items-center gap-5">
                    <div className="text-center">
                      <p className="text-lg font-bold text-foreground leading-none tabular-nums">
                        <Counter end={s.n} suffix="+" />
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                    {i < arr.length - 1 && <div className="h-7 w-px bg-border" />}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Scroll indicator ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="flex flex-col items-center gap-2 mt-16 text-muted-foreground"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}