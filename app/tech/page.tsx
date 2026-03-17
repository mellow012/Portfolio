'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  Code, Database, Globe, Smartphone, Cloud, Palette,
  FileCode, Layout, Layers, Zap, Server, Terminal,
  Coffee, HardDrive, Archive, Github, Upload, Figma,
  Paintbrush, Image, Monitor, ArrowRight, Mail,
  CheckCircle2, ChevronRight
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────── */
interface Tech {
  name: string
  level: number
  description: string
  icon: React.ElementType
  highlight?: boolean   // marks primary/core tools
}

interface Category {
  title: string
  subtitle: string
  icon: React.ElementType
  accent: string        // Tailwind text colour for the icon
  accentBg: string      // Tailwind bg colour for the icon container
  technologies: Tech[]
}

/* ─── Data ───────────────────────────────────────── */
const TECH_CATEGORIES: Category[] = [
  {
    title: 'Frontend',
    subtitle: 'What users see and touch',
    icon: Globe,
    accent: 'text-violet-500',
    accentBg: 'bg-violet-500/10',
    technologies: [
      { name: 'Next.js',      level: 95, highlight: true,  icon: FileCode,   description: 'Full-stack React framework — SSR, static gen, API routes, edge middleware.' },
      { name: 'React',        level: 90, highlight: true,  icon: Layers,     description: 'Component-based UI library powering every web project I ship.' },
      { name: 'TypeScript',   level: 85, highlight: true,  icon: Code,       description: 'Typed JavaScript — catches bugs before they hit production.' },
      { name: 'Tailwind CSS', level: 90, highlight: true,  icon: Palette,    description: 'Utility-first CSS for rapid, consistent, responsive design.' },
      { name: 'JavaScript',   level: 90,                   icon: Coffee,     description: 'The language the web runs on — async, DOM, event-driven.' },
      { name: 'HTML / CSS',   level: 92,                   icon: Layout,     description: 'Semantic HTML and CSS architecture — the real foundation.' },
    ],
  },
  {
    title: 'Mobile',
    subtitle: 'Native Android & cross-platform',
    icon: Smartphone,
    accent: 'text-rose-500',
    accentBg: 'bg-rose-500/10',
    technologies: [
      { name: 'Kotlin',           level: 80, highlight: true, icon: Code,       description: 'Primary language for Android — concise, null-safe, coroutine-native.' },
      { name: 'Jetpack Compose',  level: 85, highlight: true, icon: Zap,        description: 'Modern declarative Android UI — the future of the platform.' },
      { name: 'React Native',     level: 75,                  icon: Smartphone, description: 'Cross-platform mobile when one codebase makes sense.' },
    ],
  },
  {
    title: 'Backend',
    subtitle: 'APIs, logic, and server-side systems',
    icon: Server,
    accent: 'text-emerald-500',
    accentBg: 'bg-emerald-500/10',
    technologies: [
      { name: 'Node.js',    level: 85, highlight: true, icon: Server,   description: 'JavaScript runtime for building fast, scalable APIs.' },
      { name: 'Express.js', level: 80,                  icon: Zap,      description: 'Minimal Node framework — lightweight REST API scaffolding.' },
      { name: 'Python',     level: 75,                  icon: Terminal, description: 'Scripting, automation, and lightweight backend services.' },
      { name: 'Java',       level: 70,                  icon: Coffee,   description: 'Enterprise-grade apps and Android foundational knowledge.' },
      { name: 'Django',     level: 50,                  icon: Code,     description: 'Python framework for rapid full-stack prototyping.' },
    ],
  },
  {
    title: 'Database & Storage',
    subtitle: 'Where the data lives',
    icon: Database,
    accent: 'text-amber-500',
    accentBg: 'bg-amber-500/10',
    technologies: [
      { name: 'Firebase',   level: 95, highlight: true, icon: Database,  description: 'Auth, Firestore, Storage, Functions — the backbone of most my projects.' },
      { name: 'Firestore',  level: 90, highlight: true, icon: HardDrive, description: 'Real-time NoSQL — offline sync, subcollections, security rules.' },
      { name: 'MongoDB',    level: 78,                  icon: Archive,   description: 'Flexible document store for data-heavy applications.' },
      { name: 'MySQL',      level: 68,                  icon: Database,  description: 'Relational database for structured, transactional data.' },
    ],
  },
  {
    title: 'Cloud & DevOps',
    subtitle: 'Shipping and keeping it running',
    icon: Cloud,
    accent: 'text-sky-500',
    accentBg: 'bg-sky-500/10',
    technologies: [
      { name: 'Vercel',       level: 90, highlight: true, icon: Zap,    description: 'Primary deployment platform — Next.js, edge functions, CI/CD.' },
      { name: 'GitHub',       level: 85, highlight: true, icon: Github, description: 'Version control, code review, Actions for automated deployments.' },
      { name: 'Google Cloud', level: 72,                  icon: Cloud,  description: 'GCS, Cloud Functions, and Firebase\'s underlying infrastructure.' },
      { name: 'Render',       level: 65,                  icon: Upload, description: 'Simple hosting for Node APIs and background workers.' },
    ],
  },
  {
    title: 'Design & Tooling',
    subtitle: 'From wireframe to shipped pixel',
    icon: Palette,
    accent: 'text-pink-500',
    accentBg: 'bg-pink-500/10',
    technologies: [
      { name: 'Figma',              level: 82, highlight: true, icon: Figma,      description: 'End-to-end design — wireframes, components, handoff.' },
      { name: 'Git',                level: 92, highlight: true, icon: Github,     description: 'Branching strategies, rebasing, conventional commits.' },
      { name: 'VS Code',            level: 96,                  icon: Monitor,    description: 'Primary IDE — configured with LSPs, Copilot, and custom snippets.' },
      { name: 'Adobe XD',           level: 72,                  icon: Paintbrush, description: 'UI prototyping and interactive mockups.' },
      { name: 'Blender',            level: 65,                  icon: Image,      description: '3D modelling for product visuals and cover images.' },
      { name: 'Adobe Illustrator',  level: 60,                  icon: Paintbrush, description: 'Vector graphics, brand assets, and icon design.' },
    ],
  },
]

/* ─── Proficiency label ──────────────────────────── */
function levelLabel(n: number) {
  if (n >= 90) return 'Expert'
  if (n >= 75) return 'Advanced'
  if (n >= 60) return 'Proficient'
  return 'Familiar'
}

function levelColour(n: number) {
  if (n >= 90) return 'text-emerald-500'
  if (n >= 75) return 'text-primary'
  if (n >= 60) return 'text-amber-500'
  return 'text-muted-foreground'
}

/* ─── Skill bar ──────────────────────────────────── */
const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number]

function SkillBar({ level, delay }: { level: number; delay: number }) {
  return (
    <div className="skill-bar-track mt-3">
      <motion.div
        className="skill-bar-fill"
        initial={{ width: 0 }}
        whileInView={{ width: `${level}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: EASE, delay }}
      />
    </div>
  )
}

/* ─── Tech Card ──────────────────────────────────── */
function TechCard({ tech, delay }: { tech: Tech; delay: number }) {
  const [hovered, setHovered] = useState(false)
  const Icon = tech.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, ease: EASE, delay }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative glass rounded-2xl p-5 transition-all duration-300
                  hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5
                  ${tech.highlight ? 'ring-1 ring-primary/10' : ''}`}
    >
      {/* Highlight dot */}
      {tech.highlight && (
        <div className="absolute top-3.5 right-3.5 w-1.5 h-1.5 rounded-full bg-primary/60" />
      )}

      {/* Icon + name row */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
        <h3 className="font-semibold text-sm text-foreground leading-tight">{tech.name}</h3>
      </div>

      {/* Level label + number */}
      <div className="flex items-center justify-between mt-2 mb-1">
        <span className={`text-[11px] font-semibold ${levelColour(tech.level)}`}>
          {levelLabel(tech.level)}
        </span>
        <span className="text-[11px] text-muted-foreground tabular-nums">{tech.level}%</span>
      </div>

      {/* Animated bar */}
      <SkillBar level={tech.level} delay={delay + 0.1} />

      {/* Tooltip — proper overlay, not `hidden group-hover:block` */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-full mt-2 z-20
                       bg-card border border-border rounded-xl p-3 shadow-xl
                       text-[12px] text-muted-foreground leading-relaxed"
          >
            {tech.description}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ─── Page ───────────────────────────────────────── */
export default function TechPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const displayed = activeCategory
    ? TECH_CATEGORIES.filter((c) => c.title === activeCategory)
    : TECH_CATEGORIES

  /* Summary counts */
  const totalTech   = TECH_CATEGORIES.flatMap((c) => c.technologies).length
  const expertCount = TECH_CATEGORIES.flatMap((c) => c.technologies).filter((t) => t.level >= 90).length
  const coreCount   = TECH_CATEGORIES.flatMap((c) => c.technologies).filter((t) => t.highlight).length

  return (
    <div className="min-h-screen animated-gradient pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ══════════════════════════════
            HEADER
        ══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6
                          bg-primary/10 text-primary rounded-full text-xs font-medium
                          border border-primary/20">
            <Code className="h-3.5 w-3.5" />
            My toolkit
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground
                         leading-none mb-5">
            Tech{' '}
            <span className="gradient-text">Stack</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            The tools I reach for on every project — chosen for reliability,
            not hype. Hover any card for context.
          </p>
        </motion.div>

        {/* ══════════════════════════════
            SUMMARY STRIP
        ══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="grid grid-cols-3 gap-4 mb-16"
        >
          {[
            { value: totalTech,   label: 'Technologies'  },
            { value: expertCount, label: 'Expert level'  },
            { value: coreCount,   label: 'Core / primary'},
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.07, ease: EASE }}
              className="glass rounded-2xl p-5 text-center hover:border-primary/30 transition-colors"
            >
              <div className="text-3xl font-bold text-foreground mb-1">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* ══════════════════════════════
            CATEGORY FILTER PILLS
        ══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2, ease: EASE }}
          className="flex flex-wrap gap-2 mb-14"
        >
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200
                        ${!activeCategory
                          ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                          : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent'}`}
          >
            All
          </button>
          {TECH_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const active = activeCategory === cat.title
            return (
              <button
                key={cat.title}
                type="button"
                onClick={() => setActiveCategory(active ? null : cat.title)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm
                            font-medium border transition-all duration-200
                            ${active
                              ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                              : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent'}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.title}
              </button>
            )
          })}
        </motion.div>

        {/* ══════════════════════════════
            CATEGORIES
        ══════════════════════════════ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory ?? 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-20"
          >
            {displayed.map((cat, ci) => {
              const CatIcon = cat.icon
              const coreTools = cat.technologies.filter((t) => t.highlight)
              return (
                <motion.section
                  key={cat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: EASE, delay: ci * 0.06 }}
                >
                  {/* Section header */}
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${cat.accentBg} rounded-2xl flex items-center justify-center shrink-0`}>
                        <CatIcon className={`h-6 w-6 ${cat.accent}`} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground leading-tight section-line">
                          {cat.title}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-3.5">{cat.subtitle}</p>
                      </div>
                    </div>

                    {/* Core tools chip row */}
                    {coreTools.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {coreTools.map((t) => (
                          <span key={t.name}
                            className="inline-flex items-center gap-1 px-2.5 py-1
                                       bg-primary/10 text-primary text-[11px] font-medium
                                       rounded-lg border border-primary/15">
                            <CheckCircle2 className="h-3 w-3" />
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tech cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cat.technologies.map((tech, ti) => (
                      <TechCard
                        key={tech.name}
                        tech={tech}
                        delay={ti * 0.04}
                      />
                    ))}
                  </div>
                </motion.section>
              )
            })}
          </motion.div>
        </AnimatePresence>

        {/* ══════════════════════════════
            LEGEND
        ══════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 glass rounded-2xl p-6"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Proficiency scale
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { range: '90–100%', label: 'Expert',     colour: 'text-emerald-500', bar: 'w-full'   },
              { range: '75–89%',  label: 'Advanced',   colour: 'text-primary',     bar: 'w-4/5'    },
              { range: '60–74%',  label: 'Proficient', colour: 'text-amber-500',   bar: 'w-3/5'    },
              { range: '< 60%',   label: 'Familiar',   colour: 'text-muted-foreground', bar: 'w-2/5' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-3">
                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                  <div className={`h-full skill-bar-fill ${l.bar}`} />
                </div>
                <div>
                  <p className={`text-xs font-semibold ${l.colour}`}>{l.label}</p>
                  <p className="text-[10px] text-muted-foreground">{l.range}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/60 mt-4">
            The dot <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary/60 align-middle mx-0.5" />
            marks technologies I reach for first on new projects.
          </p>
        </motion.div>

        {/* ══════════════════════════════
            CTA
        ══════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: EASE }}
          className="mt-20"
        >
          <div className="relative overflow-hidden rounded-3xl bg-foreground dark:bg-card
                          border border-border p-12 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px]
                            bg-primary/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px
                            bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

            <div className="relative">
              <p className="text-xs font-semibold tracking-widest uppercase
                            text-background/50 dark:text-muted-foreground mb-4">
                Want to work together?
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-background dark:text-foreground
                             mb-4 leading-tight">
                Let's put this stack to work.
              </h2>
              <p className="text-background/70 dark:text-muted-foreground max-w-md mx-auto
                            text-sm leading-relaxed mb-8">
                Have a project that needs this toolkit? I'm available for freelance work
                and open to interesting problems.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/contact"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary
                             text-primary-foreground rounded-xl font-medium text-sm
                             hover:bg-primary/90 transition-all hover:shadow-xl
                             hover:shadow-primary/25 active:scale-[0.97]">
                  <Mail className="h-4 w-4" />
                  Get in touch
                </Link>
                <Link href="/projects"
                  className="inline-flex items-center gap-2 px-7 py-3.5
                             bg-background/10 dark:bg-accent
                             text-background dark:text-foreground
                             border border-background/20 dark:border-border
                             rounded-xl font-medium text-sm
                             hover:bg-background/20 dark:hover:bg-accent/80
                             transition-all active:scale-[0.97]">
                  See the projects
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  )
} 