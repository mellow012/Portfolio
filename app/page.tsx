'use client'

import { useState, useEffect, useRef } from 'react'
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebaseConfig'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight, Code2, Server, Smartphone, ArrowUpRight,
  CheckCircle2, Zap, Shield, Globe, ChevronDown,
  Heart, Eye, ExternalLink, Github, Sparkles, MapPin,
} from 'lucide-react'
import Hero from '../components/Hero'

/* ─── Types ──────────────────────────────────────── */
interface Project {
  id: string
  title: string
  description: string
  imageUrl?: string
  image?: string
  category?: string
  tags?: string[]
  summary?: string
  featured?: boolean
  likes?: number
  views?: number
  githubUrl?: string
  liveUrl?: string
}

/* ─── Static data ────────────────────────────────── */
const SERVICES = [
  {
    icon: Code2,
    label: 'Web Platforms',
    headline: 'Full-stack web apps that handle real load',
    description:
      'Booking systems, management dashboards, payment flows. Built with Next.js and Firebase — fast, secure, and maintainable.',
    tags: ['Next.js', 'TypeScript', 'Firebase', 'Tailwind'],
    accent: 'from-violet-500/20 to-violet-500/5',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
  },
  {
    icon: Smartphone,
    label: 'Android Apps',
    headline: 'Native Android built in Kotlin',
    description:
      'Offline-capable, Play Store–ready apps. Clients in transport, church management, and retail have shipped with my Android work.',
    tags: ['Kotlin', 'Jetpack Compose', 'Room', 'Retrofit'],
    accent: 'from-rose-500/20 to-rose-500/5',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
  {
    icon: Server,
    label: 'Backend & APIs',
    headline: 'APIs that don\'t break under pressure',
    description:
      'REST APIs, Firebase Cloud Functions, real-time data, auth flows. I handle the plumbing so you can focus on the product.',
    tags: ['Node.js', 'Firebase Functions', 'REST', 'Auth'],
    accent: 'from-emerald-500/20 to-emerald-500/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
]

const PROCESS = [
  {
    step: '01',
    title: 'Discovery',
    description: 'We map out exactly what you need — no assumptions, no scope creep surprises.',
  },
  {
    step: '02',
    title: 'Design & Spec',
    description: 'A clear plan before a single line of code. Architecture, UI, data model — agreed upfront.',
  },
  {
    step: '03',
    title: 'Build & Iterate',
    description: 'Regular demos, async updates, Git-based workflow. You\'re never in the dark.',
  },
  {
    step: '04',
    title: 'Deploy & Hand Off',
    description: 'Production deployment, documentation, and post-launch support included.',
  },
]

const DIFFERENTIATORS = [
  { icon: Zap, text: 'Ships on time — or I tell you early' },
  { icon: Globe, text: 'Remote-ready · GMT+2 · async-friendly' },
  { icon: Shield, text: 'Full ownership from design to deployment' },
  { icon: CheckCircle2, text: 'Clear comms — no jargon, no disappearing acts' },
]

const STATS = [
  { value: '15+', label: 'Clients served' },
  { value: '5+', label: 'Years experience' },
  { value: '10+', label: 'Projects shipped' },
  { value: '3', label: 'Platforms mastered' },
]

/* ─── Animated counter ───────────────────────────── */
function Counter({ value }: { value: string }) {
  const num = parseInt(value)
  const suffix = value.replace(/[0-9]/g, '')
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (isNaN(num)) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          let c = 0
          const step = Math.ceil(num / 40)
          const t = setInterval(() => {
            c = Math.min(c + step, num)
            setCount(c)
            if (c >= num) clearInterval(t)
          }, 35)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [num])

  return (
    <span ref={ref}>
      {isNaN(num) ? value : count}
      {suffix}
    </span>
  )
}

/* ─── Project strip card ─────────────────────────── */
function ProjectStripCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.25 }}
        className="group w-72 shrink-0 bg-card border border-border rounded-2xl overflow-hidden
                   hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300"
      >
        {/* Image */}
        <div className="relative h-40 bg-muted overflow-hidden">
          {project.imageUrl || project.image ? (
            <img
              src={project.imageUrl || project.image}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-rose-500/10 flex items-center justify-center">
              <Code2 className="h-10 w-10 text-primary/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          {project.category && (
            <span className="absolute top-3 left-3 px-2.5 py-1 bg-background/90 backdrop-blur-sm
                             text-xs font-medium rounded-full border border-border/60">
              {project.category}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="font-semibold text-sm text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {project.summary || project.description}
          </p>

          {/* Tags */}
          {(project.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {(project.tags || []).slice(0, 3).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-md font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" />{project.likes ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />{project.views ?? 0}
              </span>
            </div>
            <div className="flex gap-1">
              {project.githubUrl && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(project.githubUrl, '_blank', 'noopener,noreferrer') }}
                  className="p-1.5 rounded-lg bg-accent hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="h-3 w-3" />
                </button>
              )}
              {project.liveUrl && (
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(project.liveUrl, '_blank', 'noopener,noreferrer') }}
                  className="p-1.5 rounded-lg bg-accent hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                  aria-label="Live demo"
                >
                  <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

/* ─── Main page ──────────────────────────────────── */
export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const snap = await getDocs(
          query(collection(db, 'projects'), limit(10))
        )
        setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)))
      } catch {
        setProjects([])
      } finally {
        setLoadingProjects(false)
      }
    }
    fetchProjects()
  }, [])

  /* Horizontal scroll on wheel for the project strip */
  useEffect(() => {
    const el = stripRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return
      e.preventDefault()
      el.scrollLeft += e.deltaY
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  return (
    <div className="min-h-screen">

      {/* ════════════════════════════════════════
          1. HERO — full-screen, handles carousel
      ════════════════════════════════════════ */}
      <Hero />

      {/* ════════════════════════════════════════
          2. SERVICES — what I actually build
      ════════════════════════════════════════ */}
      <section className="py-28 bg-background relative overflow-hidden">
        {/* Subtle top separator */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="max-w-xl mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary
                            rounded-full text-xs font-medium mb-5 border border-primary/20">
              <Sparkles className="h-3.5 w-3.5" />
              What I build
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-4">
              Software that solves{' '}
              <span className="gradient-text">real problems</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Not just pretty interfaces — systems that handle real transactions,
              real users, and real business pressure.
            </p>
          </motion.div>

          {/* Service cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICES.map((svc, i) => {
              const Icon = svc.icon
              return (
                <motion.div
                  key={svc.label}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative rounded-3xl bg-gradient-to-br ${svc.accent} border border-border
                              p-7 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5
                              transition-all duration-300 group overflow-hidden`}
                >
                  {/* Icon */}
                  <div className={`w-12 h-12 ${svc.iconBg} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className={`h-6 w-6 ${svc.iconColor}`} />
                  </div>

                  {/* Label */}
                  <p className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-2">
                    {svc.label}
                  </p>

                  <h3 className="text-xl font-bold text-foreground mb-3 leading-snug">
                    {svc.headline}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {svc.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {svc.tags.map(t => (
                      <span key={t} className="px-2.5 py-1 bg-background/60 backdrop-blur-sm
                                               border border-border/60 rounded-lg text-xs text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100
                                  translate-x-1 group-hover:translate-x-0 transition-all duration-300">
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          3. STATS BAND — dark, full-width
      ════════════════════════════════════════ */}
      <section className="py-20 bg-foreground dark:bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-border/30">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="text-center md:px-10"
              >
                <div className="text-4xl sm:text-5xl font-bold text-background dark:text-foreground mb-2">
                  <Counter value={stat.value} />
                </div>
                <div className="text-sm text-background/60 dark:text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          4. PROJECT STRIP — horizontal scroll
      ════════════════════════════════════════ */}
      <section className="py-28 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex items-end justify-between"
          >
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-3 section-line">
                Recent work
              </h2>
              <p className="text-muted-foreground mt-5">
                Scroll to explore — or{' '}
                <Link href="/projects" className="text-primary hover:underline">
                  see everything
                </Link>
                .
              </p>
            </div>
            <Link
              href="/projects"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-card border border-border
                         rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-all"
            >
              All projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {/* Scrollable strip — full bleed */}
        <div
          ref={stripRef}
          className="flex gap-5 overflow-x-auto scroll-smooth pb-4
                     px-4 sm:px-6 lg:px-8
                     scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loadingProjects
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-72 shrink-0 h-64 bg-muted rounded-2xl animate-pulse" />
              ))
            : projects.length > 0
            ? projects.map((p) => <ProjectStripCard key={p.id} project={p} />)
            : (
              <div className="flex items-center justify-center w-full py-16 text-muted-foreground text-sm">
                No projects yet — add some from the dashboard.
              </div>
            )
          }
        </div>
      </section>

      {/* ════════════════════════════════════════
          5. PROCESS — numbered steps
      ════════════════════════════════════════ */}
      <section className="py-28 animated-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              How a project goes
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              No surprises. No scope creep. Just a clear process from kick-off to launch.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass rounded-2xl p-6 hover:border-primary/30 transition-all relative group"
              >
                {/* Step number */}
                <div className="text-6xl font-bold text-primary/10 absolute top-4 right-5
                                group-hover:text-primary/20 transition-colors select-none">
                  {step.step}
                </div>

                {/* Connector line (desktop only) */}
                {i < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-3 w-6 h-px bg-border z-10" />
                )}

                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                    <span className="text-xs font-bold text-primary">{step.step}</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          6. WHY ME — differentiators
      ════════════════════════════════════════ */}
      <section className="py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left text */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
                Why clients come back{' '}
                <span className="gradient-text">a second time</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-10 max-w-md">
                I'm not the cheapest option. I'm the one who answers messages, ships on time,
                and hands you something you can actually maintain.
              </p>

              <div className="space-y-4">
                {DIFFERENTIATORS.map((d, i) => {
                  const Icon = d.icon
                  return (
                    <motion.div
                      key={d.text}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: i * 0.07 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">{d.text}</span>
                    </motion.div>
                  )
                })}
              </div>

              <div className="flex items-center gap-3 mt-10">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-card border border-border
                             rounded-xl text-sm font-medium text-foreground hover:bg-accent transition-all"
                >
                  More about me
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground
                             rounded-xl text-sm font-medium hover:bg-primary/90 transition-all
                             hover:shadow-lg hover:shadow-primary/25"
                >
                  Start a project
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right — location + availability card */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative"
            >
              {/* Glow */}
              <div className="absolute -inset-8 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative glass rounded-3xl p-8 border border-border/60">
                {/* Availability dot */}
                <div className="flex items-center gap-2.5 mb-8">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    Available for new projects
                  </span>
                </div>

                {/* Quote */}
                <blockquote className="text-2xl font-bold text-foreground leading-snug mb-8">
                  "Pretty code means nothing if it doesn't work."
                </blockquote>

                {/* Location row */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                  <MapPin className="h-4 w-4 text-primary" />
                  Malawi · GMT+2 · Works with clients globally
                </div>

                {/* Tech badges */}
                <div className="pt-6 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest font-semibold">
                    Primary stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Next.js', 'TypeScript', 'Firebase', 'Kotlin', 'Tailwind CSS', 'Node.js'].map(t => (
                      <span key={t}
                        className="px-3 py-1.5 bg-accent border border-border rounded-xl text-xs font-medium text-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          7. CTA BAND — full-width gradient
      ════════════════════════════════════════ */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-foreground dark:bg-card
                       border border-border p-12 sm:p-16 text-center"
          >
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                            bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px
                            bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="relative">
              <p className="text-xs font-semibold tracking-widest uppercase
                            text-background/50 dark:text-muted-foreground mb-4">
                Let's build something
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-background dark:text-foreground mb-5 leading-tight">
                Got a project in mind?
              </h2>
              <p className="text-background/70 dark:text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
                Whether it's a brand new product or an existing system that needs rescuing —
                I want to hear about it.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5
                             bg-primary text-primary-foreground rounded-xl font-medium
                             hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-95"
                >
                  Start the conversation
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-7 py-3.5
                             bg-background/10 dark:bg-accent text-background dark:text-foreground
                             border border-background/20 dark:border-border
                             rounded-xl font-medium hover:bg-background/20 transition-all active:scale-95"
                >
                  See my work first
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}