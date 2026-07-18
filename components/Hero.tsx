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
      className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#101415]"
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 animated-gradient" />
      <motion.div style={{ y: yParallax }}
        className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-[#c0c1ff]/8 rounded-full blur-3xl pointer-events-none" />
      <motion.div style={{ y: yParallax }}
        className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-[#8083ff]/6 rounded-full blur-3xl pointer-events-none" />
      {/* Grid texture */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#e0e3e5 1px,transparent 1px),linear-gradient(90deg,#e0e3e5 1px,transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <motion.div style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 xl:gap-16 items-center">

          {/* ══════════════════
              LEFT — copy
          ══════════════════ */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
            className="order-2 lg:order-1 lg:col-span-5 flex flex-col justify-center"
          >
            {/* Availability badge */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-8
                         bg-emerald-500/10 border border-emerald-500/20 rounded-full
                         text-xs font-medium text-emerald-400 self-start"
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
              className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display text-foreground leading-[1.02] mb-6"
            >
              I build{' '}
              <span className="gradient-text block sm:inline">digital products</span>{' '}
              that ship.
            </motion.h1>

            {/* Typewriter */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="flex items-center gap-2.5 mb-6 h-8 select-none"
            >
              <div className="flex items-center gap-2 px-3 py-1 bg-black/35 backdrop-blur-md border border-[#464554]/50 rounded-xl text-[11px] font-mono text-[#c0c1ff] shadow-inner">
                <span className="text-emerald-400">~</span>
                <span className="text-[#908fa0]">via</span>
                <span className="text-amber-400">⚡ node</span>
                <span className="text-[#908fa0]">$</span>
                <span className="text-white font-medium">{role}</span>
                <span className="inline-block w-[1.5px] h-[1em] bg-[#c0c1ff] animate-pulse align-middle rounded-full" />
              </div>
            </motion.div>

            {/* Bio */}
            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="text-[15px] text-[#908fa0] leading-relaxed max-w-lg mb-10"
            >
              5+ years building{' '}
              <span className="text-foreground font-medium">booking systems</span>,{' '}
              <span className="text-foreground font-medium">business platforms</span>, and{' '}
              <span className="text-foreground font-medium">Android apps</span> for real clients. Based in{' '}
              <span className="text-foreground font-medium">Malawi</span> · working worldwide.
            </motion.p>

            {/* Socials & Tech Stack */}
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="flex flex-wrap items-center gap-6"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#908fa0]">Find me on</span>
                <div className="h-px w-6 bg-[#464554]" />
                <div className="flex items-center gap-2">
                  {socials.map(({ icon: Icon, href, label }) => (
                    <motion.a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.12, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-xl bg-[#272a2c] border border-[#464554]
                                 flex items-center justify-center text-[#908fa0]
                                 hover:text-[#c0c1ff] hover:border-[#c0c1ff]/30 transition-colors"
                      aria-label={label}
                    >
                      <Icon className="h-4 w-4" />
                    </motion.a>
                  ))}
                </div>
              </div>

              <div className="hidden sm:block h-6 w-px bg-[#464554]/60" />

              <div className="flex items-center gap-3">
                <span className="text-xs text-[#908fa0]">Tech stack</span>
                <div className="h-px w-6 bg-[#464554]" />
                <div className="flex items-center gap-2">
                  {[
                    {
                      name: 'Next.js',
                      icon: (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.665 21.662l-8.73-11.238v7.502h1.666v3.298H7.135v-3.298h1.667v-11.23h-1.667V3.398h4.466l7.865 10.128V6.696h-1.666V3.398h4.466v3.298h-1.667v14.966h-1.667z"/>
                        </svg>
                      )
                    },
                    {
                      name: 'React',
                      icon: (
                        <svg className="h-4.5 w-4.5 animate-[spin_10s_linear_infinite]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(30 12 12)"/>
                          <ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(90 12 12)"/>
                          <ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(150 12 12)"/>
                          <circle cx="12" cy="12" r="1.5"/>
                        </svg>
                      )
                    },
                    {
                      name: 'TypeScript',
                      icon: (
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M1.125 0h21.75c.621 0 1.125.504 1.125 1.125v21.75c0 .621-.504 1.125-1.125 1.125H1.125C.504 24 0 23.496 0 22.875V1.125C0 .504.504 0 1.125 0zm17.153 16.486c0-.962-.483-1.433-1.45-1.841-.968-.407-2.316-.761-3.663-1.009-.646-.124-1.157-.361-1.391-.652-.232-.289-.356-.639-.356-1.077 0-.497.199-.908.62-1.21.42-.303 1.054-.456 1.884-.456.846 0 1.484.188 1.9.562.416.375.642.868.679 1.484h2.909c-.048-1.417-.55-2.483-1.493-3.216-.948-.729-2.274-1.097-3.985-1.097-1.688 0-3.033.407-4.043 1.226-1.007.818-1.513 1.93-1.513 3.328 0 1.144.382 2.016 1.145 2.622.766.605 1.944 1.026 3.535 1.267.873.136 1.5.344 1.882.624.385.281.577.674.577 1.18 0 .543-.228.989-.684 1.341-.456.353-1.13.529-2.023.529-.982 0-1.745-.236-2.29-.714-.544-.476-.848-1.168-.909-2.08h-2.908c.073 1.68 1.05 3.128 2.874 3.916 1.121.488 2.378.729 3.774.729 2.052 0 3.655-.496 4.81-1.486 1.15-.992 1.728-2.32 1.728-3.992zm-8.835-9.845H6.26v2.531h2.226v8.438h3.188v-8.438h2.226V6.641z"/>
                        </svg>
                      )
                    },
                    {
                      name: 'Android',
                      icon: (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.523 15.3l1.816 3.146a.5.5 0 0 1-.866.5l-1.838-3.185a10.05 10.05 0 0 1-9.27 0l-1.838 3.185a.5.5 0 0 1-.866-.5L6.477 15.3A10.003 10.003 0 0 1 2 7.28a.5.5 0 0 1 1 0 9 9 0 0 0 18 0 .5.5 0 0 1 1 0 10.003 10.003 0 0 1-4.477 8.02zM7 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                        </svg>
                      )
                    },
                    {
                      name: 'Firebase',
                      icon: (
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3.89 15.672L6.124 1.458a.465.465 0 0 1 .865-.126l2.96 5.568zm14.394-.486l-2.072-3.957a.465.465 0 0 0-.82 0L12 17.57zM13.626 5.86l-2.316-4.44a.466.466 0 0 0-.825.006L3.109 17.15l8.986-5.048zM20.1 18.006l-1.996-12.8a.465.465 0 0 0-.79-.247L3.1 18.23l8.03 4.512a1.86 1.86 0 0 0 1.74 0z"/>
                        </svg>
                      )
                    }
                  ].map(({ name, icon }) => (
                    <motion.div
                      key={name}
                      whileHover={{ scale: 1.12, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-9 h-9 rounded-xl bg-[#272a2c] border border-[#464554]
                                 flex items-center justify-center text-[#908fa0]
                                 hover:text-[#c0c1ff] hover:border-[#c0c1ff]/30 transition-all cursor-default"
                      title={name}
                    >
                      {icon}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* CTA — View my work */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              className="mt-8 self-start"
            >
              <Link
                href="/#projects"
                className="group inline-flex items-center gap-2 px-6 py-3.5
                           bg-[#c0c1ff] text-[#1000a9] rounded-xl font-medium text-sm
                           hover:bg-[#c0c1ff]/90 transition-all hover:shadow-xl hover:shadow-[#c0c1ff]/25 active:scale-[0.97]"
              >
                View my work
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            {/* Profile Stats */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              className="grid grid-cols-3 gap-3.5 mt-10 pt-8 border-t border-[#464554]/30 w-full max-w-md"
            >
              {[{ n: 15, label: 'Clients' }, { n: 10, label: 'Projects' }, { n: 5, label: 'Years' }].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:border-[#c0c1ff]/20 hover:bg-white/[0.04] transition-all duration-300 group"
                >
                  <span className="text-2xl font-bold text-foreground font-display leading-none tracking-tight group-hover:text-[#c0c1ff] transition-colors">
                    <Counter end={s.n} suffix="+" />
                  </span>
                  <span className="text-[10px] text-[#908fa0] mt-1.5 uppercase tracking-wider font-semibold">{s.label}</span>
                </div>
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
            className="order-1 lg:order-2 relative lg:col-span-7 w-full"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* ── Main card (Browser Mockup) ── */}
            <div className="relative rounded-2xl overflow-hidden bg-[#1e2123] border border-[#464554]/55
                            shadow-2xl shadow-black/35 group transition-all duration-300 hover:border-[#c0c1ff]/30">

              {/* Browser Mockup Title Bar */}
              <div className="flex items-center justify-between px-4 py-3.5 bg-[#191b1d] border-b border-[#464554]/45">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/90 shadow-sm" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/90 shadow-sm" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/90 shadow-sm" />
                </div>
                <div className="flex-1 max-w-[260px] mx-auto">
                  <div className="px-3 py-1 bg-[#101213] rounded-md text-[10px] text-[#908fa0]/80 border border-[#464554]/30 truncate text-center select-none font-mono">
                    mellowverse.dev/{current ? current.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'project'}
                  </div>
                </div>
                <div className="w-12" /> {/* alignment balance */}
              </div>

              {/* Image window */}
              <div className="relative aspect-[16/10] bg-[#151718] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeProject + '-img'}
                    src={current?.image}
                    alt={current?.title}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] as [number,number,number,number] }}
                    className="absolute inset-0 w-full h-full object-cover select-none"
                  />
                </AnimatePresence>

                {/* Gradient vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

                {/* Nav arrows — hover state */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goPrev() }}
                  className="absolute left-4 top-1/2 -translate-y-1/2
                             w-9 h-9 bg-black/45 hover:bg-black/65 backdrop-blur-md
                             rounded-full flex items-center justify-center
                             text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Previous project"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); goNext() }}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                             w-9 h-9 bg-black/45 hover:bg-black/65 backdrop-blur-md
                             rounded-full flex items-center justify-center
                             text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Next project"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Card body */}
              <div className="p-6 sm:p-7 bg-[#1e2123]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeProject + '-body'}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        {/* Tag/Category & Slide Counter */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2.5 py-0.5 bg-[#c0c1ff]/10 text-[#c0c1ff] text-[10px] font-semibold uppercase tracking-wider rounded-md border border-[#c0c1ff]/15">
                            {current?.category}
                          </span>
                          <span className="text-[10px] text-[#908fa0] font-medium tabular-nums">
                            {String(activeProject + 1).padStart(2, '0')} / {String(displayProjects.length).padStart(2, '0')}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight leading-snug">
                          {current?.title}
                        </h3>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {current?.githubUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(current.githubUrl, '_blank', 'noopener,noreferrer')}
                            className="w-8 h-8 rounded-lg bg-[#2b2f31] hover:bg-[#c0c1ff]/10 hover:text-[#c0c1ff]
                                       text-[#908fa0] flex items-center justify-center transition-colors border border-[#464554]/45"
                            aria-label="GitHub repository"
                          >
                            <Github className="h-4 w-4" />
                          </button>
                        )}
                        {current?.liveUrl && (
                          <button
                            type="button"
                            onClick={() => window.open(current.liveUrl, '_blank', 'noopener,noreferrer')}
                            className="w-8 h-8 rounded-lg bg-[#c0c1ff]/10 hover:bg-[#c0c1ff]/20
                                       text-[#c0c1ff] flex items-center justify-center transition-colors border border-[#c0c1ff]/25"
                            aria-label="Live demo"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-[#908fa0] leading-relaxed mb-5 line-clamp-2">
                      {current?.summary}
                    </p>

                  </motion.div>
                </AnimatePresence>

                {/* Footer: progress dots + view link */}
                <div className="flex items-center justify-between pt-5 border-t border-[#464554]/45">
                  {/* Dot indicators with progress bar */}
                  <div className="flex items-center gap-2.5">
                    {displayProjects.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goTo(i)}
                        className="group/dot relative py-1"
                        aria-label={`Go to project ${i + 1}`}
                      >
                        {i === activeProject ? (
                          <div className="w-12 h-1.5 rounded-full overflow-hidden bg-[#c0c1ff]/20">
                            <ProgressBar duration={SLIDE_DURATION} active={!isPaused} />
                          </div>
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#464554] hover:bg-[#c0c1ff]/40 transition-colors" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Only link to real Firestore documents */}
                  {!isFallback && current ? (
                    <Link
                      href={`/?project=${current.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold
                                 text-[#c0c1ff] hover:text-white transition-colors"
                    >
                      View project
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href="/#projects"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold
                                 text-[#908fa0] hover:text-[#c0c1ff] transition-colors"
                    >
                      See all projects
                      <ArrowUpRight className="h-3.5 w-3.5" />
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
              className="absolute -top-6 -right-6 bg-[#1a1c1d]/90 backdrop-blur-md rounded-2xl p-4 shadow-2xl
                         hidden sm:block border border-white/10 z-10"
            >
              <p className="text-[10px] font-bold text-foreground mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-[#c0c1ff]" />
                Main Stack
              </p>
              <div className="flex flex-wrap gap-1.5 max-w-[148px]">
                {['Next.js', 'Firebase', 'Kotlin', 'TypeScript'].map((t) => (
                  <span key={t} className="px-2 py-0.5 bg-[#c0c1ff]/10 text-[#c0c1ff] text-[10px] rounded-md font-medium border border-[#c0c1ff]/15">
                    {t}
                  </span>
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
          className="flex flex-col items-center gap-2 mt-16 text-[#908fa0]"
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
