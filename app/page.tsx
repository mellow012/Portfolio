'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  collection, getDocs, getDoc, doc, addDoc, updateDoc,
  increment, setDoc, serverTimestamp
} from 'firebase/firestore'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { db } from '../lib/firebaseConfig'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowRight, Code2, Server, Smartphone, ArrowUpRight,
  CheckCircle2, Zap, Shield, Globe, Heart, Eye, ExternalLink,
  Github, Sparkles, MapPin, Mail, Phone, MessageCircle,
  Linkedin, Twitter, Send, Loader2, X, AlertCircle, Award,
  Database, Figma, Terminal, Code, Cpu, ChevronLeft, ChevronRight, Download
} from 'lucide-react'
import Hero from '../components/Hero'

/* ─── Constants & Configurations ────────────────── */
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID ?? 'uQxNQHVIbNhm7hNHl8bnwH2Xc322'
const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number]

interface Project {
  id: string
  title: string
  description: string
  imageUrl?: string
  image?: string
  screenshots?: string[]
  category?: string
  tags?: string[]
  summary?: string
  featured?: boolean
  likes?: number
  views?: number
  githubUrl?: string
  liveUrl?: string
}

interface ProfileData {
  name: string
  title: string
  location: string
  bio: string
  resumeUrl?: string
  profileImage?: string
  contact?: {
    email?: string
    whatsapp?: string
    twitter?: string
    github?: string
    linkedin?: string
    phone?: string
  }
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

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const CATEGORIES = [
  { id: 'all',       label: 'All Projects', icon: Globe      },
  { id: 'web',       label: 'Web Platforms', icon: Code       },
  { id: 'mobile',    label: 'Mobile Apps',   icon: Smartphone },
  { id: 'fullstack', label: 'Full Stack',    icon: Database   },
]

const TECH_CATEGORIES = [
  {
    title: 'Frontend',
    icon: Globe,
    accent: 'text-violet-400 border-violet-400/20 bg-violet-400/5',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'JavaScript', 'HTML5/CSS3']
  },
  {
    title: 'Mobile',
    icon: Smartphone,
    accent: 'text-rose-400 border-rose-400/20 bg-rose-400/5',
    skills: ['Kotlin', 'Jetpack Compose', 'React Native', 'Android SDK']
  },
  {
    title: 'Backend',
    icon: Server,
    accent: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
    skills: ['Node.js', 'Express.js', 'Firebase Functions', 'Python', 'Java', 'REST APIs']
  },
  {
    title: 'Database & Cloud',
    icon: Database,
    accent: 'text-amber-400 border-amber-400/20 bg-amber-400/5',
    skills: ['Firestore', 'Firebase Auth/Storage', 'MongoDB', 'MySQL', 'Vercel', 'GCP']
  },
  {
    title: 'Design & Tooling',
    icon: Figma,
    accent: 'text-pink-400 border-pink-400/20 bg-pink-400/5',
    skills: ['Figma', 'Git / GitHub', 'VS Code', 'Adobe Illustrator', 'UI/UX Prototyping']
  }
]

/* ─── Hook: Toast Notification ───────────────────── */
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000)
  }, [])
  return { toasts, push }
}

/* ─── Main HomePage Component ────────────────────── */
export default function HomePage() {
  const auth = getAuth()
  const searchParams = useSearchParams()
  const { toasts, push: toast } = useToast()

  // State Management
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Mellow',
    title: 'Full Stack & Mobile Developer',
    location: 'Malawi (GMT+2)',
    bio: 'Crafting responsive, secure, and production-ready web and Android applications. Specialising in booking engines, admin portals, and robust API integrations.',
    contact: {
      email: 'QuantumByteslab012@gmail.com',
      whatsapp: '+265991457495',
      phone: '+265991457495',
      github: 'https://github.com/mellow012',
      linkedin: 'https://linkedin.com/in/wisdomMlambia',
      twitter: 'https://twitter.com'
    }
  })
  
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: 'exp1',
      title: 'Senior Full Stack Developer',
      company: 'Quantum Bytes Lab',
      period: '2023 - Present',
      description: 'Architecting high-performance Next.js apps, headless booking engines, and serverless Node.js backend pipelines. Handling multi-tenant Firestore models.'
    },
    {
      id: 'exp2',
      title: 'Native Android Engineer',
      company: 'Freelance & Contract Work',
      period: '2021 - 2023',
      description: 'Shipped production Kotlin applications to Google Play. Integrated offline-first Room structures, Jetpack Compose UI patterns, and Retrofit network layers.'
    },
    {
      id: 'exp3',
      title: 'Software Developer',
      company: 'Local Transport Agency (Contract)',
      period: '2020 - 2021',
      description: 'Built a real-time fleet coordinates tracker using Android SDK maps integration and Firebase Realtime Database for live telemetry.'
    }
  ])
  
  const [skills, setSkills] = useState<Skill[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  // Refs
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({})

  // 1. Auth Listener & User Liked Projects
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (!u) {
        setLikedProjects(new Set())
        return
      }
      try {
        const snap = await getDocs(collection(db, 'projects'))
        const liked = new Set<string>()
        await Promise.all(snap.docs.map(async (d) => {
          const likeDoc = await getDoc(doc(db, 'projects', d.id, 'likes', u.uid))
          if (likeDoc.exists()) liked.add(d.id)
        }))
        setLikedProjects(liked)
      } catch { /* Suppress non-fatal authentication errors */ }
    })
    return () => unsubscribe()
  }, [])

  // 2. Fetch Portfolio Data (Profile, Experiences, Skills, Projects)
  useEffect(() => {
    const fetchData = async () => {
      // Fetch Profile Biography
      try {
        const profileDoc = await getDoc(doc(db, 'users', ADMIN_UID))
        if (profileDoc.exists()) {
          const data = profileDoc.data()
          setProfile(prev => ({
            ...prev,
            name: data.name || prev.name,
            title: data.title || prev.title,
            bio: data.bio || prev.bio,
            location: data.location || prev.location,
            resumeUrl: data.resumeUrl,
            profileImage: data.profileImage,
            contact: {
              ...prev.contact,
              ...data.contact
            }
          }))
        }
      } catch { /* Fallback to default state */ }

      // Fetch Experience Items
      try {
        const expSnap = await getDocs(collection(db, 'users', ADMIN_UID, 'experiences'))
        if (!expSnap.empty) {
          setExperiences(expSnap.docs.map(d => ({
            id: d.id,
            title: d.data().title || '',
            company: d.data().company || '',
            period: d.data().period || '',
            description: d.data().description || ''
          })))
        }
      } catch { /* Fallback to default state */ }

      // Fetch Projects
      setLoadingProjects(true)
      try {
        const projSnap = await getDocs(collection(db, 'projects'))
        const projList = projSnap.docs.map(d => ({ id: d.id, ...d.data() } as Project))
        setProjects(projList)

        // Parse query parameter to auto-open project
        const projectParam = searchParams.get('project')
        if (projectParam) {
          const matched = projList.find(p => p.id === projectParam)
          if (matched) {
            setSelectedProject(matched)
            // Increment view count when modal is opened on query param match
            updateDoc(doc(db, 'projects', matched.id), { views: increment(1) }).catch(() => {})
          }
        }
      } catch {
        toast('Failed to load project database. Displaying template projects.', 'error')
      } finally {
        setLoadingProjects(false)
      }
    }

    fetchData()
  }, [searchParams])

  // 3. Filtered Projects list
  const filteredProjects = projects.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const q = searchQuery.toLowerCase().trim()
    const matchSearch = !q ||
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.summary?.toLowerCase().includes(q) ||
      (p.tags || []).some((tag) => tag.toLowerCase().includes(q))
    return matchCat && matchSearch
  })

  // 4. Handlers
  const handleLike = async (e: React.MouseEvent, project: Project) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast('Please log in to like this project.', 'info')
      return
    }

    const projectId = project.id
    const already = likedProjects.has(projectId)
    const likeRef = doc(db, 'projects', projectId, 'likes', user.uid)
    const projectRef = doc(db, 'projects', projectId)

    // Optimistic UI Update
    setLikedProjects((prev) => {
      const next = new Set(prev)
      already ? next.delete(projectId) : next.add(projectId)
      return next
    })
    setProjects((prev) =>
      prev.map((p) => p.id === projectId
        ? { ...p, likes: (p.likes || 0) + (already ? -1 : 1) } : p))
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => prev ? { ...prev, likes: (prev.likes || 0) + (already ? -1 : 1) } : null)
    }

    try {
      if (already) {
        await setDoc(likeRef, {}) // delete or cleanup
        // In this implementation, toggle Firestore entry
        await setDoc(likeRef, { active: false }) // simple toggle
        await updateDoc(projectRef, { likes: increment(-1) })
      } else {
        await setDoc(likeRef, { userId: user.uid, timestamp: new Date(), active: true })
        await updateDoc(projectRef, { likes: increment(1) })
      }
    } catch {
      // Revert optimistic updates on error
      setLikedProjects((prev) => {
        const next = new Set(prev)
        already ? next.add(projectId) : next.delete(projectId)
        return next
      })
      setProjects((prev) =>
        prev.map((p) => p.id === projectId
          ? { ...p, likes: (p.likes || 0) + (already ? 1 : -1) } : p))
      toast('Failed to record like status. Try again.', 'error')
    }
  }

  const openProjectModal = async (project: Project) => {
    setSelectedProject(project)
    try {
      await updateDoc(doc(db, 'projects', project.id), { views: increment(1) })
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, views: (p.views || 0) + 1 } : p))
    } catch { /* Non-fatal view counter error */ }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      toast('Please fill in all required fields.', 'error')
      return
    }

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        timestamp: serverTimestamp(),
        read: false
      })
      toast('Message sent successfully! I will reply shortly.', 'success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast('Failed to deliver message. Please contact me directly via email.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#101415] text-[#e0e3e5] relative overflow-hidden select-none">
      
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#c0c1ff]/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[200px] pointer-events-none" />

      {/* Toast Stack */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.25, ease: EASE }}
              className={`flex items-center gap-2.5 px-4.5 py-3.5 rounded-2xl shadow-2xl border
                          text-sm font-semibold backdrop-blur-xl pointer-events-auto
                          ${t.type === 'success'
                            ? 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
                            : t.type === 'error'
                            ? 'bg-rose-500/15 border-rose-500/20 text-rose-400'
                            : 'bg-[#191c1e] border-[#464554]/60 text-[#c0c1ff]'}`}
            >
              {t.type === 'success' ? <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
               : t.type === 'error' ? <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                                    : <Sparkles className="h-4.5 w-4.5 shrink-0" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 1. Hero Section */}
      <section id="hero" className="relative">
        <Hero />
      </section>

      {/* 2. About Me Section */}
      <section id="about" className="py-28 relative border-t border-[#464554]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Bio Column */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#c0c1ff]/10 text-[#c0c1ff]
                              rounded-full text-xs font-semibold mb-6 border border-[#c0c1ff]/20">
                <Award className="h-3.5 w-3.5" />
                About Me
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
                Engineering with <br />
                <span className="gradient-text">Purpose</span> & Accuracy
              </h2>
              
              <div className="space-y-5 text-[#908fa0] leading-relaxed text-sm sm:text-base">
                <p>{profile.bio}</p>
                <div className="flex items-center gap-3.5 py-1 text-white">
                  <MapPin className="h-5 w-5 text-[#c0c1ff] shrink-0" />
                  <span className="font-medium text-sm">{profile.location}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    Active for contract & full-time roles
                  </span>
                </div>
              </div>

              {profile.resumeUrl && (
                <div className="mt-8">
                  <Link
                    href={profile.resumeUrl}
                    target="_blank"
                    className="inline-flex items-center gap-2.5 px-6 py-3 bg-[#272a2c] hover:bg-[#323537]
                               text-[#e0e3e5] border border-[#464554] rounded-xl text-sm font-semibold
                               transition-all active:scale-[0.98]"
                  >
                    <Download className="h-4.5 w-4.5" />
                    Get Resumé
                  </Link>
                </div>
              )}
            </motion.div>

            {/* Experience Timeline Column */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6 border-b border-[#464554]/20 pb-3">
                Experience Timeline
              </h3>
              
              <div className="relative border-l border-[#464554]/50 ml-3 pl-8 space-y-10">
                {experiences.map((exp, i) => (
                  <div key={exp.id} className="relative">
                    {/* Dot */}
                    <span className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-[#101415]
                                     border-2 border-[#c0c1ff] flex items-center justify-center">
                      <span className="w-1.5 h-1.5 bg-[#c0c1ff] rounded-full" />
                    </span>
                    <span className="text-xs font-semibold text-[#c0c1ff] bg-[#c0c1ff]/10
                                     px-2.5 py-1 rounded-md border border-[#c0c1ff]/10">
                      {exp.period}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-3.5 mb-1">
                      {exp.title}
                    </h4>
                    <p className="text-xs text-[#908fa0] font-medium mb-3">
                      {exp.company}
                    </p>
                    {exp.description && (
                      <p className="text-xs sm:text-sm text-[#908fa0] leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. Featured Projects Section */}
      <section id="projects" className="py-28 relative border-t border-[#464554]/30 bg-[#0d0f10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-500/10 text-rose-400
                              rounded-full text-xs font-semibold mb-6 border border-rose-500/20">
                <Code className="h-3.5 w-3.5" />
                Projects
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-white">
                Recent <span className="gradient-text">Shipped Code</span>
              </h2>
            </div>

            {/* Project Search */}
            <div className="relative w-full max-w-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stack, title..."
                className="w-full bg-[#191c1e] border border-[#464554]/70 rounded-xl px-4 py-2.5 text-sm
                           text-white placeholder-[#908fa0]/60 outline-none focus:border-[#c0c1ff]/60
                           transition-all focus:ring-1 focus:ring-[#c0c1ff]/20"
              />
            </div>
          </motion.div>

          {/* Categories Filter Tabs */}
          <div className="flex flex-wrap gap-2.5 mb-10 pb-2 border-b border-[#464554]/20">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const isSelected = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-semibold transition-all
                              ${isSelected 
                                ? 'bg-[#c0c1ff] text-[#1000a9] shadow-lg shadow-[#c0c1ff]/15'
                                : 'bg-[#191c1e] text-[#908fa0] hover:text-white border border-[#464554]/40 hover:bg-[#272a2c]'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Grid of Projects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loadingProjects ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#191c1e] border border-[#464554]/50 rounded-3xl h-[360px] animate-pulse" />
              ))
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  onClick={() => openProjectModal(project)}
                  whileHover={{ y: -6 }}
                  className="group bg-[#191c1e] border border-[#464554]/50 rounded-3xl overflow-hidden cursor-pointer
                             hover:border-[#c0c1ff]/30 hover:shadow-2xl hover:shadow-[#c0c1ff]/5 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Project Image */}
                  <div className="relative h-48 bg-[#101415] overflow-hidden">
                    {project.imageUrl || project.image ? (
                      <img
                        src={project.imageUrl || project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(el) => { (el.target as HTMLImageElement).src = '/placeholder.png' }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#c0c1ff]/10 to-rose-500/5 flex items-center justify-center">
                        <Code2 className="h-12 w-12 text-[#c0c1ff]/35" />
                      </div>
                    )}
                    <span className="absolute top-4 left-4 px-2.5 py-1 bg-[#101415]/90 backdrop-blur-md
                                     text-[10px] font-bold uppercase rounded-md border border-[#464554]/50 text-[#c0c1ff]">
                      {project.category}
                    </span>
                  </div>

                  {/* Body info */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-white group-hover:text-[#c0c1ff] transition-colors mb-2">
                      {project.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#908fa0] line-clamp-3 mb-5 leading-relaxed flex-1">
                      {project.summary || project.description}
                    </p>

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {project.tags.slice(0, 3).map((t) => (
                          <span key={t} className="px-2 py-0.5 bg-[#c0c1ff]/5 text-[#c0c1ff] border border-[#c0c1ff]/10 text-[10px] rounded-md font-medium">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#464554]/30 text-xs text-[#908fa0]">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => handleLike(e, project)}
                          className={`flex items-center gap-1.5 py-1 hover:text-[#c0c1ff] transition-all ${likedProjects.has(project.id) ? 'text-rose-400' : ''}`}
                        >
                          <Heart className={`h-4.5 w-4.5 ${likedProjects.has(project.id) ? 'fill-current text-rose-400' : ''}`} />
                          {project.likes || 0}
                        </button>
                        <span className="flex items-center gap-1.5">
                          <Eye className="h-4.5 w-4.5" />
                          {project.views || 0}
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[#c0c1ff] group-hover:translate-x-1.5 transition-transform text-[11px] font-semibold">
                        View Details
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>

                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center text-[#908fa0] text-sm">
                No matching projects found. Reset filters or update query.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 4. Tech Stack Section */}
      <section id="tech" className="py-28 relative border-t border-[#464554]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400
                            rounded-full text-xs font-semibold mb-6 border border-emerald-500/20">
              <Cpu className="h-3.5 w-3.5" />
              Technology Stack
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Core Skills & Tools
            </h2>
            <p className="text-[#908fa0] leading-relaxed text-sm sm:text-base">
              A carefully selected set of languages, frameworks, and database engines tailored to ship performant production systems.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
            {TECH_CATEGORIES.map((cat, idx) => {
              const Icon = cat.icon
              return (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="bg-[#191c1e] border border-[#464554]/40 rounded-3xl p-7 hover:border-[#c0c1ff]/20 transition-all duration-300"
                >
                  <div className="flex items-center gap-3.5 mb-6">
                    <div className={`p-2.5 rounded-xl border ${cat.accent}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-extrabold text-white text-base">
                      {cat.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {cat.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-[#101415] border border-[#464554]/40 hover:border-[#c0c1ff]/20
                                   rounded-xl text-xs font-semibold text-[#e0e3e5] transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

        </div>
      </section>

      {/* 5. Contact Section */}
      <section id="contact" className="py-28 relative border-t border-[#464554]/30 bg-[#0d0f10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Info Col */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 space-y-8"
            >
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-violet-500/10 text-violet-400
                                rounded-full text-xs font-semibold mb-6 border border-violet-500/20">
                  <Mail className="h-3.5 w-3.5" />
                  Get In Touch
                </div>
                <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
                  Let’s build <br />
                  something <span className="gradient-text">excellent</span>
                </h2>
                <p className="text-[#908fa0] leading-relaxed text-sm sm:text-base">
                  Whether you have an Android app spec ready, or a server application that needs architecture design — drop a message.
                </p>
              </div>

              {/* Direct channels */}
              <div className="space-y-4.5">
                <a
                  href={`mailto:${profile.contact?.email}`}
                  className="flex items-center gap-4 p-4.5 bg-[#191c1e] hover:bg-[#272a2c] border border-[#464554]/50 rounded-2xl transition-all"
                >
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-[#908fa0] tracking-wider mb-0.5">Email</p>
                    <p className="text-sm font-semibold text-white">{profile.contact?.email}</p>
                  </div>
                </a>

                {profile.contact?.whatsapp && (
                  <a
                    href={`https://wa.me/${profile.contact.whatsapp.replace('+', '')}`}
                    target="_blank"
                    className="flex items-center gap-4 p-4.5 bg-[#191c1e] hover:bg-[#272a2c] border border-[#464554]/50 rounded-2xl transition-all"
                  >
                    <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-[#908fa0] tracking-wider mb-0.5">WhatsApp / Phone</p>
                      <p className="text-sm font-semibold text-white">{profile.contact.whatsapp}</p>
                    </div>
                  </a>
                )}
              </div>

              {/* Social Handles */}
              <div className="flex items-center gap-3.5 pt-3">
                {profile.contact?.github && (
                  <a
                    href={profile.contact.github}
                    target="_blank"
                    className="p-3.5 bg-[#191c1e] hover:bg-[#c0c1ff]/10 hover:text-[#c0c1ff] border border-[#464554]/50 rounded-xl transition-all"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {profile.contact?.linkedin && (
                  <a
                    href={profile.contact.linkedin}
                    target="_blank"
                    className="p-3.5 bg-[#191c1e] hover:bg-[#c0c1ff]/10 hover:text-[#c0c1ff] border border-[#464554]/50 rounded-xl transition-all"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {profile.contact?.twitter && (
                  <a
                    href={profile.contact.twitter}
                    target="_blank"
                    className="p-3.5 bg-[#191c1e] hover:bg-[#c0c1ff]/10 hover:text-[#c0c1ff] border border-[#464554]/50 rounded-xl transition-all"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
              </div>
            </motion.div>

            {/* Form Col */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 bg-[#191c1e] border border-[#464554]/50 rounded-3xl p-7 sm:p-9 shadow-2xl"
            >
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[#908fa0] mb-2">Name *</label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-[#101415] border border-[#464554]/60 rounded-xl px-4 py-3 text-sm text-white placeholder-[#908fa0]/30 outline-none focus:border-[#c0c1ff]/50 transition-colors"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#908fa0] mb-2">Email *</label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full bg-[#101415] border border-[#464554]/60 rounded-xl px-4 py-3 text-sm text-white placeholder-[#908fa0]/30 outline-none focus:border-[#c0c1ff]/50 transition-colors"
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold uppercase tracking-wider text-[#908fa0] mb-2">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full bg-[#101415] border border-[#464554]/60 rounded-xl px-4 py-3 text-sm text-white placeholder-[#908fa0]/30 outline-none focus:border-[#c0c1ff]/50 transition-colors"
                    placeholder="Project Inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-[#908fa0] mb-2">Message *</label>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full bg-[#101415] border border-[#464554]/60 rounded-xl px-4 py-3 text-sm text-white placeholder-[#908fa0]/30 outline-none focus:border-[#c0c1ff]/50 transition-colors resize-none"
                    placeholder="Describe your goals, project details, and timeline..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5
                             bg-[#c0c1ff] text-[#1000a9] rounded-xl text-sm font-bold hover:bg-[#c0c1ff]/90
                             transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none
                             shadow-xl shadow-[#c0c1ff]/10 hover:shadow-[#c0c1ff]/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4.5 w-4.5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

        </div>
      </section>

      {/* 6. Dynamic Modal Details Overlay */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-md px-4 py-6"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="bg-[#191c1e] border border-[#464554]/70 rounded-3xl max-w-3xl w-full max-h-[85vh]
                         overflow-y-auto shadow-2xl relative scrollbar-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute top-5 right-5 z-20 p-2 rounded-xl bg-black/60 backdrop-blur-md hover:bg-black/80
                           text-[#e0e3e5] border border-[#464554]/50 transition-colors"
                aria-label="Close details"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Cover/Screenshots section */}
              <div className="relative h-64 sm:h-80 bg-[#101415]">
                {selectedProject.screenshots && selectedProject.screenshots.length > 0 ? (
                  <ProjectGallery images={selectedProject.screenshots} title={selectedProject.title} />
                ) : selectedProject.imageUrl || selectedProject.image ? (
                  <img
                    src={selectedProject.imageUrl || selectedProject.image}
                    alt={selectedProject.title}
                    className="w-full h-full object-cover"
                    onError={(el) => { (el.target as HTMLImageElement).src = '/placeholder.png' }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#c0c1ff]/15 to-rose-500/5 flex items-center justify-center">
                    <Code2 className="h-16 w-16 text-[#c0c1ff]/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#191c1e] via-[#191c1e]/20 to-transparent pointer-events-none" />
              </div>

              {/* Details Body */}
              <div className="p-6 sm:p-9 space-y-6">
                <div>
                  <span className="px-2.5 py-1 bg-[#c0c1ff]/10 text-[#c0c1ff] border border-[#c0c1ff]/20 text-[10px] font-bold uppercase rounded-md">
                    {selectedProject.category}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-2">
                    {selectedProject.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-[#908fa0]">
                    <button
                      type="button"
                      onClick={(e) => handleLike(e, selectedProject)}
                      className={`flex items-center gap-1.5 hover:text-[#c0c1ff] transition-all ${likedProjects.has(selectedProject.id) ? 'text-rose-400' : ''}`}
                    >
                      <Heart className={`h-4.5 w-4.5 ${likedProjects.has(selectedProject.id) ? 'fill-current text-rose-400' : ''}`} />
                      {selectedProject.likes || 0} Likes
                    </button>
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-4.5 w-4.5" />
                      {selectedProject.views || 0} Views
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white">Project Details</h4>
                  <p className="text-sm sm:text-base text-[#908fa0] leading-relaxed whitespace-pre-line">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Tags */}
                {selectedProject.tags && selectedProject.tags.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5">Built with</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tags.map((t) => (
                        <span key={t} className="px-3 py-1 bg-[#101415] border border-[#464554]/50 text-[#c0c1ff] text-xs rounded-lg font-semibold">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTAs */}
                <div className="flex flex-wrap gap-3.5 pt-4 border-t border-[#464554]/30">
                  {selectedProject.liveUrl && (
                    <a
                      href={selectedProject.liveUrl}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-5 py-3 bg-[#c0c1ff] text-[#1000a9]
                                 rounded-xl text-sm font-bold hover:bg-[#c0c1ff]/90 transition-all active:scale-[0.98]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Live Demo
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-5 py-3 bg-[#272a2c] hover:bg-[#323537]
                                 text-white border border-[#464554]/70 rounded-xl text-sm font-bold
                                 transition-all active:scale-[0.98]"
                    >
                      <Github className="h-4 w-4" />
                      Source Code
                    </a>
                  )}
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

/* ─── Secondary Component: Modal Gallery ──────────── */
interface ProjectGalleryProps {
  images: string[]
  title: string
}

function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(0)

  const go = (e: React.MouseEvent, targetIdx: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDirection(targetIdx > idx ? 1 : -1)
    setIdx(targetIdx)
  }

  const prev = (e: React.MouseEvent) => go(e, (idx - 1 + images.length) % images.length)
  const next = (e: React.MouseEvent) => go(e, (idx + 1) % images.length)

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={idx}
          src={images[idx]}
          alt={`${title} screenshot ${idx + 1}`}
          initial={{ opacity: 0, x: direction * 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -50 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(el) => { (el.target as HTMLImageElement).src = '/placeholder.png' }}
        />
      </AnimatePresence>

      {/* Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-md hover:bg-black/80
                       rounded-full text-white border border-[#464554]/50 transition-colors z-20"
            aria-label="Previous screenshot"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/60 backdrop-blur-md hover:bg-black/80
                       rounded-full text-white border border-[#464554]/50 transition-colors z-20"
            aria-label="Next screenshot"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dot indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => go(e, i)}
                className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'}`}
                aria-label={`Show screenshot ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}