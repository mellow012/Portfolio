'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../../lib/firebaseConfig'
import { motion } from 'framer-motion'
import {
  Award, Heart, Target, Users, Code, Server, Cloud,
  User, Download, Briefcase, GraduationCap, Coffee,
  MapPin, Sparkles, CheckCircle2
} from 'lucide-react'
import Image from 'next/image'

/* ────────────────────────────────────────────
   Animation presets
─────────────────────────────────────────── */
const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number]

/** Returns inline initial/animate/transition props — avoids Variants function limitation */
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: EASE, delay },
  }
}

/* ────────────────────────────────────────────
   Static data
─────────────────────────────────────────── */
const stats = [
  { icon: Users, label: 'Happy Clients', value: '15+' },
  { icon: Award, label: 'Years Experience', value: '5+' },
  { icon: Code, label: 'Projects Shipped', value: '10+' },
  { icon: Heart, label: 'Technologies', value: '5+' },
]

const values = [
  {
    icon: Target,
    title: 'Results First',
    description: 'Pretty code means nothing if it doesn\'t work. I build systems that handle real transactions, real users, real business needs.',
  },
  {
    icon: Heart,
    title: 'Clear Communication',
    description: 'No jargon. No disappearing acts. Regular updates, async-friendly workflow, and direct answers to direct questions.',
  },
  {
    icon: Users,
    title: 'Remote-Ready',
    description: 'GMT+2 timezone, Git-based workflow, Slack/Discord friendly. I know how to make remote work actually work.',
  },
  {
    icon: Award,
    title: 'Full Ownership',
    description: 'From design to deployment. Frontend, backend, mobile, database — one person who understands the whole system.',
  },
]

const competencies = [
  {
    icon: Code,
    title: 'Frontend Development',
    description: 'Crafting responsive, accessible, and performant UIs with modern frameworks.',
    tags: ['React', 'Next.js', 'TypeScript'],
  },
  {
    icon: Server,
    title: 'Backend Development',
    description: 'Building scalable APIs and server-side apps with security and performance in mind.',
    tags: ['Node.js', 'Firebase', 'REST/GraphQL'],
  },
  {
    icon: Cloud,
    title: 'DevOps & Deployment',
    description: 'Implementing CI/CD pipelines and cloud infrastructure for reliable deployments.',
    tags: ['Vercel', 'Docker', 'CI/CD'],
  },
]

/* ────────────────────────────────────────────
   Types
─────────────────────────────────────────── */
interface Qualification {
  id: string
  title: string
  institution: string
  year: string
  type?: 'education' | 'certification' | 'award'
}

interface Experience {
  id: string
  title: string
  company: string
  period: string
  description?: string
}

interface Skill {
  id: string
  name: string
  category: string
  proficiency: number
}

interface FunFact {
  id: string
  text: string
  icon?: string
}

interface ProfileData {
  profileImage: string | null
  bio: string
  name: string
  title: string
  location: string
  resumeUrl?: string
}

/* ────────────────────────────────────────────
   Component
─────────────────────────────────────────── */
export default function AboutMePage() {
  const [profile, setProfile] = useState<ProfileData>({
    profileImage: null,
    bio: 'Full-stack developer specialising in booking systems and business platforms. 5+ years shipping web and Android apps for real clients.',
    name: 'Mellow',
    title: 'Full Stack Developer',
    location: 'Malawi (GMT+2)',
  })
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [funFacts, setFunFacts] = useState<FunFact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const ADMIN_UID = 'uQxNQHVIbNhm7hNHl8bnwH2Xc322'

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError('')
      try {
        const userDoc = await getDoc(doc(db, 'users', ADMIN_UID))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setProfile({
            profileImage: data.profileImage || null,
            bio: data.bio || 'Passionate full-stack developer crafting digital experiences.',
            name: data.name || 'Mellow',
            title: data.title || 'Full Stack Developer',
            location: data.location || 'Malawi',
            resumeUrl: data.resumeUrl || undefined,
          })
        }
        try {
          const snap = await getDocs(collection(db, 'users', ADMIN_UID, 'qualifications'))
          setQualifications(snap.docs.map(d => ({
            id: d.id,
            title: d.data().title || '',
            institution: d.data().institution || '',
            year: d.data().year || '',
            type: d.data().type || 'education',
          })))
        } catch { setQualifications([]) }

        try {
          const snap = await getDocs(collection(db, 'users', ADMIN_UID, 'experiences'))
          setExperiences(snap.docs.map(d => ({
            id: d.id,
            title: d.data().title || '',
            company: d.data().company || '',
            period: d.data().period || '',
            description: d.data().description || '',
          })))
        } catch { setExperiences([]) }

        try {
          const snap = await getDocs(collection(db, 'users', ADMIN_UID, 'skills'))
          setSkills(snap.docs.map(d => ({
            id: d.id,
            name: d.data().name || '',
            category: d.data().category || 'Other',
            proficiency: d.data().proficiency || 50,
          })))
        } catch { setSkills([]) }

        try {
          const snap = await getDocs(collection(db, 'users', ADMIN_UID, 'funFacts'))
          setFunFacts(snap.docs.map(d => ({
            id: d.id,
            text: d.data().text || '',
            icon: d.data().icon || 'coffee',
          })))
        } catch { setFunFacts([]) }

      } catch (err) {
        console.error('AboutMePage: Fetch error:', err)
        setError('Failed to load profile data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  /* ── Skill categories ── */
  const skillsByCategory = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = []
    acc[skill.category].push(skill)
    return acc
  }, {})

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading profile…</p>
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="h-7 w-7 text-rose-500" />
          </div>
          <p className="text-muted-foreground mb-6 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  /* ── Main render ── */
  return (
    <div className="min-h-screen animated-gradient pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ════════════════════════════════
            HERO
        ════════════════════════════════ */}
        <section className="mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text side */}
            <div className="order-2 lg:order-1">
              {/* Badge */}
              <motion.div
                {...fadeUp(0)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium mb-6 border border-primary/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Full-Stack Developer · Open to Work
              </motion.div>

              <motion.h1
                {...fadeUp(0.05)}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-none"
              >
                Hi, I'm{' '}
                <span className="gradient-text">{profile.name}</span>
              </motion.h1>

              <motion.p
                {...fadeUp(0.1)}
                className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg"
              >
                {profile.bio}
              </motion.p>

              <motion.div
                {...fadeUp(0.15)}
                className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
              >
                <MapPin className="h-4 w-4 text-primary" />
                {profile.location}
              </motion.div>

              {/* CTA row */}
              <motion.div {...fadeUp(0.2)} className="flex flex-wrap gap-3">
                {profile.resumeUrl && (
                  <a
                    href={profile.resumeUrl}
                    download
                    className="inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-95"
                  >
                    <Download className="h-4 w-4" />
                    Download Resume
                  </a>
                )}
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-card border border-border rounded-xl font-medium text-sm text-foreground hover:bg-accent transition-all active:scale-95"
                >
                  Let's Talk
                </a>
              </motion.div>
            </div>

            {/* Avatar side */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="order-1 lg:order-2 flex justify-center"
            >
              <div className="relative">
                {/* Decorative ring */}
                <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-primary/20 via-rose-500/10 to-transparent blur-2xl" />
                <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                  {profile.profileImage ? (
                    <Image
                      src={profile.profileImage}
                      alt={profile.name}
                      fill
                      className="rounded-3xl object-cover border-4 border-background shadow-2xl"
                      sizes="288px"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full rounded-3xl bg-gradient-to-br from-primary/30 via-rose-500/20 to-primary/10 flex items-center justify-center border-4 border-background shadow-2xl">
                      <User className="h-24 w-24 text-primary/60" />
                    </div>
                  )}
                  {/* Role pill */}
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 bg-background border border-border rounded-full shadow-lg text-sm font-medium text-foreground">
                    {profile.title}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ════════════════════════════════
            STATS STRIP
        ════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-24"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="glass rounded-2xl p-6 text-center hover:border-primary/30 transition-colors glow-violet"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* ════════════════════════════════
            WORK EXPERIENCE (TIMELINE)
        ════════════════════════════════ */}
        {experiences.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-24"
          >
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground section-line">
                Work Experience
              </h2>
              <p className="text-muted-foreground mt-5">My professional journey so far.</p>
            </div>

            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent hidden sm:block" />

              <div className="space-y-8">
                {experiences.map((exp, i) => (
                  <motion.div
                    key={exp.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    className="relative sm:pl-14"
                  >
                    {/* Timeline dot */}
                    <div className="hidden sm:block absolute left-0 top-5 timeline-dot" />

                    <div className="glass rounded-2xl p-6 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{exp.title}</h3>
                          <p className="text-primary font-medium text-sm mt-0.5">{exp.company}</p>
                        </div>
                        <span className="px-3 py-1 bg-accent rounded-full text-xs text-muted-foreground shrink-0">
                          {exp.period}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}

        {/* ════════════════════════════════
            QUALIFICATIONS
        ════════════════════════════════ */}
        {qualifications.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-24"
          >
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground section-line">
                Education & Certifications
              </h2>
              <p className="text-muted-foreground mt-5">Credentials that back the craft.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {qualifications.map((qual, i) => (
                <motion.div
                  key={qual.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.07 }}
                  className="glass rounded-2xl p-6 flex items-start gap-4 hover:border-primary/30 transition-all"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                    qual.type === 'certification'
                      ? 'bg-amber-500/10'
                      : qual.type === 'award'
                      ? 'bg-rose-500/10'
                      : 'bg-primary/10'
                  }`}>
                    {qual.type === 'certification' ? (
                      <Award className="h-5 w-5 text-amber-500" />
                    ) : qual.type === 'award' ? (
                      <Award className="h-5 w-5 text-rose-500" />
                    ) : (
                      <GraduationCap className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground leading-snug">{qual.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{qual.institution}</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">{qual.year}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ════════════════════════════════
            SKILLS
        ════════════════════════════════ */}
        {skills.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-24"
          >
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground section-line">
                Technical Skills
              </h2>
              <p className="text-muted-foreground mt-5">My stack and where I shine.</p>
            </div>

            <div className="space-y-10">
              {Object.entries(skillsByCategory).map(([category, categorySkills], ci) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: ci * 0.06 }}
                >
                  <h3 className="text-xs font-semibold text-muted-foreground tracking-widest uppercase mb-5">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {categorySkills.map((skill, si) => (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: si * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">{skill.name}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">{skill.proficiency}%</span>
                        </div>
                        <div className="skill-bar-track">
                          <motion.div
                            className="skill-bar-fill"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.proficiency}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: si * 0.05 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ════════════════════════════════
            CORE COMPETENCIES
        ════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-24"
        >
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground section-line">
              Core Competencies
            </h2>
            <p className="text-muted-foreground mt-5">Areas where I consistently deliver.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {competencies.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass rounded-2xl p-7 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                >
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-0.5 bg-accent rounded-lg text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* ════════════════════════════════
            VALUES
        ════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mb-24"
        >
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground section-line">
              How I Work
            </h2>
            <p className="text-muted-foreground mt-5">Principles that guide every project I take on.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {values.map((value, i) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex gap-5 glass rounded-2xl p-6 hover:border-primary/30 transition-all"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* ════════════════════════════════
            FUN FACTS
        ════════════════════════════════ */}
        {funFacts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="mb-24"
          >
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground section-line">
                Beyond the Code
              </h2>
              <p className="text-muted-foreground mt-5">A few things you might not expect.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {funFacts.map((fact, i) => (
                <motion.div
                  key={fact.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  className="glass rounded-2xl p-6 hover:border-primary/30 transition-all"
                >
                  <Coffee className="h-6 w-6 text-primary mb-4 opacity-70" />
                  <p className="text-sm text-foreground leading-relaxed">{fact.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ════════════════════════════════
            CTA STRIP
        ════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-rose-500/10 border border-primary/20 p-10 sm:p-14 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Ready to build something great?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-sm leading-relaxed">
                Whether it's a new product, an existing system that needs work, or just an idea — let's talk.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/25 active:scale-95"
                >
                  Get in touch
                </a>
                <a
                  href="/projects"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-background/60 backdrop-blur-sm border border-border text-foreground rounded-xl font-medium text-sm hover:bg-background/80 transition-all active:scale-95"
                >
                  See my work
                </a>
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  )
}