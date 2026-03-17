'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection, getDocs, updateDoc, doc,
  increment, setDoc, deleteDoc, getDoc
} from 'firebase/firestore'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { db } from '../../lib/firebaseConfig'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, Eye, Search, Star, Globe, Code,
  Smartphone, Zap, Database, Trash2, Edit,
  MessageSquare, TrendingUp, Users, ArrowRight,
  X, CheckCircle2, AlertCircle, SlidersHorizontal
} from 'lucide-react'
import Link from 'next/link'
import ProjectCard, { ProjectCardSkeleton } from '../../components/project-card'

/* ─── Types ──────────────────────────────────────── */
type Project = {
  id: string
  title?: string
  description?: string
  summary?: string
  image?: string
  imageUrl?: string
  status?: string
  views?: number
  likes?: number
  technologies?: string[]
  tags?: string[]
  githubUrl?: string
  liveUrl?: string
  createdAt?: { toDate: () => Date }
  featured?: boolean
  category?: string
}

type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' }

/* ─── Constants ──────────────────────────────────── */
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID ?? 'uQxNQHVIbNhm7hNHl8bnwH2Xc322'
const PER_PAGE  = 9
const EASE      = [0.4, 0, 0.2, 1] as [number, number, number, number]

const CATEGORIES = [
  { id: 'all',       label: 'All',        icon: Globe      },
  { id: 'web',       label: 'Web',        icon: Code       },
  { id: 'mobile',    label: 'Mobile',     icon: Smartphone },
  { id: 'fullstack', label: 'Full Stack', icon: Database   },
  { id: 'ai',        label: 'AI & ML',    icon: Zap        },
]

/* ─── Toast ──────────────────────────────────────── */
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])
  return { toasts, push }
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border
                        text-sm font-medium backdrop-blur-sm pointer-events-auto
                        ${t.type === 'success'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : t.type === 'error'
                          ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                          : 'bg-card border-border text-foreground'}`}
          >
            {t.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" />
           : t.type === 'error'   ? <AlertCircle  className="h-4 w-4 shrink-0" />
                                  : <Star         className="h-4 w-4 shrink-0" />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ─── Confirm Dialog ─────────────────────────────── */
function ConfirmDialog({
  open, onConfirm, onCancel
}: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2, ease: EASE }}
        className="bg-card border border-border rounded-2xl p-7 shadow-2xl max-w-sm w-full"
      >
        <div className="w-11 h-11 bg-rose-500/10 rounded-xl flex items-center justify-center mb-4">
          <Trash2 className="h-5 w-5 text-rose-500" />
        </div>
        <h3 className="font-bold text-foreground mb-2">Delete this project?</h3>
        <p className="text-sm text-muted-foreground mb-6">
          This action cannot be undone. The project will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium
                       text-foreground hover:bg-accent transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium
                       hover:bg-rose-600 transition-colors">
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────── */
export default function ProjectsPage() {
  const auth = getAuth()
  const { toasts, push: toast } = useToast()

  const [projects,       setProjects]       = useState<Project[]>([])
  const [loading,        setLoading]        = useState(true)
  const [user,           setUser]           = useState<User | null>(null)
  const [likedProjects,  setLikedProjects]  = useState<Set<string>>(new Set())
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [page,           setPage]           = useState(1)
  const [confirmDelete,  setConfirmDelete]  = useState<string | null>(null)

  const isAdmin = user?.uid === ADMIN_UID

  /* Auth + liked projects */
  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (!u) { setLikedProjects(new Set()); return }
      try {
        const snap = await getDocs(collection(db, 'projects'))
        const liked = new Set<string>()
        await Promise.all(snap.docs.map(async (d) => {
          const likeDoc = await getDoc(doc(db, 'projects', d.id, 'likes', u.uid))
          if (likeDoc.exists()) liked.add(d.id)
        }))
        setLikedProjects(liked)
      } catch { /* non-fatal */ }
    })
  }, [])

  /* Fetch projects */
  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const snap = await getDocs(collection(db, 'projects'))
        setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project)))
      } catch { toast('Failed to load projects', 'error') }
      finally { setLoading(false) }
    })()
  }, [])

  /* Derived */
  const filtered = projects.filter((p) => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const q = searchQuery.toLowerCase()
    const matchSearch = !q ||
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      (p.tags || p.technologies || []).some((t) => t.toLowerCase().includes(q))
    return matchCat && matchSearch
  })

  const paginated    = filtered.slice(0, page * PER_PAGE)
  const hasMore      = paginated.length < filtered.length
  const featuredList = projects.filter((p) => p.featured)

  const counts = CATEGORIES.reduce<Record<string, number>>((acc, c) => {
    acc[c.id] = c.id === 'all' ? projects.length
      : projects.filter((p) => p.category === c.id).length
    return acc
  }, {})

  /* Handlers */
  const handleLike = async (projectId: string) => {
    if (!user) { toast('Log in to like projects', 'info'); return }
    const already    = likedProjects.has(projectId)
    const likeRef    = doc(db, 'projects', projectId, 'likes', user.uid)
    const projectRef = doc(db, 'projects', projectId)

    // Optimistic
    setLikedProjects((prev) => {
      const next = new Set(prev)
      already ? next.delete(projectId) : next.add(projectId)
      return next
    })
    setProjects((prev) =>
      prev.map((p) => p.id === projectId
        ? { ...p, likes: (p.likes || 0) + (already ? -1 : 1) } : p))

    try {
      if (already) {
        await deleteDoc(likeRef)
        await updateDoc(projectRef, { likes: increment(-1) })
      } else {
        await setDoc(likeRef, { userId: user.uid, timestamp: new Date() })
        await updateDoc(projectRef, { likes: increment(1) })
      }
    } catch {
      // Roll back
      setLikedProjects((prev) => {
        const next = new Set(prev)
        already ? next.add(projectId) : next.delete(projectId)
        return next
      })
      setProjects((prev) =>
        prev.map((p) => p.id === projectId
          ? { ...p, likes: (p.likes || 0) + (already ? 1 : -1) } : p))
      toast('Could not update like', 'error')
    }
  }

  const handleView = async (projectId: string) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), { views: increment(1) })
      setProjects((prev) =>
        prev.map((p) => p.id === projectId ? { ...p, views: (p.views || 0) + 1 } : p))
    } catch { /* non-fatal */ }
  }

  const handleDelete = async (projectId: string) => {
    if (!isAdmin) { toast('Access denied', 'error'); return }
    try {
      await deleteDoc(doc(db, 'projects', projectId))
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
      toast('Project deleted', 'success')
    } catch { toast('Failed to delete', 'error') }
    finally { setConfirmDelete(null) }
  }

  /* ── Render ── */
  return (
    <>
      <ToastStack toasts={toasts} />
      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            open
            onConfirm={() => handleDelete(confirmDelete)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen animated-gradient pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6
                            bg-primary/10 text-primary rounded-full text-xs font-medium
                            border border-primary/20">
              <Star className="h-3.5 w-3.5" />
              Production systems · Real clients
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground
                           leading-none mb-5">
              The work that{' '}
              <span className="gradient-text">ships.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Bus booking systems. Church management platforms. Business tools built
              for real transactions, real users, real pressure.
            </p>
          </motion.div>

          {/* Stats strip */}
          {!loading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16"
            >
              {[
                { icon: TrendingUp, label: 'Total projects',  value: String(projects.length),                                                          color: 'text-primary'      },
                { icon: Eye,        label: 'Total views',     value: projects.reduce((s, p) => s + (p.views || 0), 0).toLocaleString(),                 color: 'text-emerald-500'  },
                { icon: Heart,      label: 'Total likes',     value: String(projects.reduce((s, p) => s + (p.likes || 0), 0)),                          color: 'text-rose-500'     },
                { icon: Users,      label: 'Featured',        value: String(featuredList.length),                                                       color: 'text-amber-500'    },
              ].map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.15 + i * 0.06, ease: EASE }}
                    className="glass rounded-2xl p-5 text-center hover:border-primary/30 transition-colors"
                  >
                    <Icon className={`h-5 w-5 ${s.color} mx-auto mb-2`} />
                    <div className="text-2xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Search + filter bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
            className="flex flex-col sm:flex-row gap-3 mb-5"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects, tags, tech…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-card
                           text-sm text-foreground placeholder:text-muted-foreground/60
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                           transition-all"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Mobile category select */}
            <div className="sm:hidden relative">
              <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select
                value={activeCategory}
                onChange={(e) => { setActiveCategory(e.target.value); setPage(1) }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card
                           text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.label} ({counts[c.id]})</option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Category pills */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25, ease: EASE }}
            className="hidden sm:flex flex-wrap gap-2 mb-12"
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const active = activeCategory === cat.id
              return (
                <button key={cat.id} type="button"
                  onClick={() => { setActiveCategory(cat.id); setPage(1) }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                              transition-all duration-200 border
                              ${active
                                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-primary/20'
                              }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-md
                    ${active ? 'bg-white/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {counts[cat.id]}
                  </span>
                </button>
              )
            })}
          </motion.div>

          {/* Featured divider */}
          {!loading && featuredList.length > 0 && activeCategory === 'all' && !searchQuery && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center gap-2 mb-6"
            >
              <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
              <span className="text-sm font-medium text-foreground">
                {featuredList.length} featured
              </span>
              <div className="h-px flex-1 bg-border/60" />
            </motion.div>
          )}

          {/* Grid */}
          <section className="mb-16">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06, ease: EASE }}>
                    <ProjectCardSkeleton />
                  </motion.div>
                ))}
              </div>
            ) : paginated.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-24">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground mb-2">No projects found</h3>
                <p className="text-sm text-muted-foreground mb-6">Try a different search or category.</p>
                <button type="button"
                  onClick={() => { setSearchQuery(''); setActiveCategory('all') }}
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium
                             hover:bg-primary/90 transition-colors">
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  key={activeCategory + searchQuery}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {paginated.map((project, i) => (
                    <motion.div key={project.id} className="relative group"
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.45, delay: i * 0.05, ease: EASE }}
                    >
                      {/* Featured star */}
                      {project.featured && (
                        <div className="absolute -top-2 -right-2 z-10 w-7 h-7 bg-amber-400
                                        rounded-full flex items-center justify-center shadow-lg pointer-events-none">
                          <Star className="h-3.5 w-3.5 text-white fill-white" />
                        </div>
                      )}

                      <ProjectCard
                        id={project.id}
                        title={project.title || 'Untitled'}
                        description={project.description || ''}
                        image={project.imageUrl || project.image || '/placeholder.png'}
                        category={project.category || 'Project'}
                        tags={project.tags || project.technologies || []}
                        summary={project.summary}
                        likes={project.likes || 0}
                        views={project.views || 0}
                        featured={project.featured}
                        isLiked={likedProjects.has(project.id)}
                        githubUrl={project.githubUrl}
                        liveUrl={project.liveUrl}
                        onLike={() => handleLike(project.id)}
                        onView={() => handleView(project.id)}
                      />

                      {/* Admin actions — float over card */}
                      {isAdmin && (
                        <div className="absolute top-12 left-3 flex gap-1.5 z-10
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toast('Edit coming soon — use the dashboard', 'info') }}
                            className="w-8 h-8 bg-card/90 backdrop-blur-sm border border-border rounded-lg
                                       flex items-center justify-center text-muted-foreground
                                       hover:text-primary hover:border-primary/40 transition-colors shadow-sm"
                            aria-label="Edit project">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setConfirmDelete(project.id) }}
                            className="w-8 h-8 bg-card/90 backdrop-blur-sm border border-border rounded-lg
                                       flex items-center justify-center text-muted-foreground
                                       hover:text-rose-500 hover:border-rose-500/40 transition-colors shadow-sm"
                            aria-label="Delete project">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Load more */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <button type="button" onClick={() => setPage((p) => p + 1)}
                      className="inline-flex items-center gap-2 px-7 py-3 bg-card border border-border
                                 rounded-xl text-sm font-medium text-foreground hover:bg-accent
                                 hover:border-primary/30 transition-all">
                      Load more
                      <span className="text-xs text-muted-foreground">
                        ({filtered.length - paginated.length} remaining)
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <div className="relative overflow-hidden rounded-3xl bg-foreground dark:bg-card
                            border border-border p-12 sm:p-16 text-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px]
                              bg-primary/8 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px
                              bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="relative">
                <p className="text-xs font-semibold tracking-widest uppercase
                              text-background/50 dark:text-muted-foreground mb-4">
                  Let's build something
                </p>
                <h2 className="text-4xl sm:text-5xl font-bold text-background dark:text-foreground
                               mb-5 leading-tight">
                  Need a platform that ships?
                </h2>
                <p className="text-background/70 dark:text-muted-foreground max-w-md mx-auto
                              leading-relaxed mb-10 text-sm">
                  Available for freelance. Clear comms. GMT+2. Typical reply within 24 hours.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/contact"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary
                               text-primary-foreground rounded-xl font-medium text-sm
                               hover:bg-primary/90 transition-all hover:shadow-xl
                               hover:shadow-primary/25 active:scale-[0.97]">
                    <MessageSquare className="h-4 w-4" />
                    Start a conversation
                  </Link>
                  <Link href="/about"
                    className="inline-flex items-center gap-2 px-7 py-3.5
                               bg-background/10 dark:bg-accent
                               text-background dark:text-foreground
                               border border-background/20 dark:border-border
                               rounded-xl font-medium text-sm
                               hover:bg-background/20 dark:hover:bg-accent/80
                               transition-all active:scale-[0.97]">
                    More about me
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.section>

        </div>
      </div>
    </>
  )
}