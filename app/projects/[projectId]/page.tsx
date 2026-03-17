'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { doc, getDoc, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { db } from '../../../lib/firebaseConfig'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, Heart, Eye, Github, ExternalLink,
  ArrowLeft, X, ZoomIn, Calendar, Tag, Layers,
  CheckCircle2, AlertCircle, Images
} from 'lucide-react'

/* ─── Types ──────────────────────────────────────── */
interface Project {
  id: string
  title?: string
  description?: string
  summary?: string
  image?: string
  imageUrl?: string
  screenshots?: string[]
  category?: string
  status?: string
  tags?: string[]
  technologies?: string[]
  githubUrl?: string
  liveUrl?: string
  likes?: number
  views?: number
  featured?: boolean
  createdAt?: { toDate: () => Date }
}

const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number]
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID ?? 'uQxNQHVIbNhm7hNHl8bnwH2Xc322'

/* ─── Lightbox ───────────────────────────────────── */
function Lightbox({
  images, startIndex, onClose,
}: {
  images: string[]
  startIndex: number
  onClose: () => void
}) {
  const [idx, setIdx] = useState(startIndex)
  const [direction, setDirection] = useState(0)

  const go = useCallback((next: number) => {
    setDirection(next > idx ? 1 : -1)
    setIdx(next)
  }, [idx])

  const prev = () => go((idx - 1 + images.length) % images.length)
  const next = () => go((idx + 1) % images.length)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md
                 flex flex-col items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button type="button" onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20
                   rounded-full flex items-center justify-center text-white transition-colors z-10">
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2
                      px-3 py-1 bg-white/10 rounded-full text-xs text-white font-medium">
        {idx + 1} / {images.length}
      </div>

      {/* Main image */}
      <div className="relative w-full max-w-5xl px-16 flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={idx}
            src={images[idx]}
            alt={`Image ${idx + 1}`}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="max-h-[75vh] max-w-full object-contain rounded-xl shadow-2xl"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
          />
        </AnimatePresence>

        {images.length > 1 && (
          <>
            <button type="button" onClick={prev}
              className="absolute left-2 w-11 h-11 bg-white/10 hover:bg-white/25
                         rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button type="button" onClick={next}
              className="absolute right-2 w-11 h-11 bg-white/10 hover:bg-white/25
                         rounded-full flex items-center justify-center text-white transition-colors">
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-6 px-4 overflow-x-auto max-w-full pb-1"
          onClick={(e) => e.stopPropagation()}>
          {images.map((src, i) => (
            <button key={i} type="button" onClick={() => go(i)}
              className={`shrink-0 w-14 h-10 rounded-lg overflow-hidden border-2 transition-all
                          ${i === idx ? 'border-white scale-105' : 'border-white/20 hover:border-white/50 opacity-60 hover:opacity-90'}`}>
              <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }} />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ─── Main slider ────────────────────────────────── */
function HeroSlider({
  images, title, onOpenLightbox,
}: {
  images: string[]
  title: string
  onOpenLightbox: (i: number) => void
}) {
  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const go = useCallback((next: number) => {
    if (images.length <= 1) return
    setDirection(next > idx ? 1 : -1)
    setIdx(next)
  }, [idx, images.length])

  const prev = () => go((idx - 1 + images.length) % images.length)
  const next = () => go((idx + 1) % images.length)

  /* Keyboard */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx])

  /* Touch swipe */
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev()
    touchStartX.current = null
  }

  return (
    <div className="space-y-3">
      {/* Main frame */}
      <div
        className="relative w-full aspect-video bg-muted rounded-2xl overflow-hidden
                   cursor-pointer select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => onOpenLightbox(idx)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={idx}
            src={images[idx]}
            alt={`${title} — ${idx + 1}`}
            initial={{ opacity: 0, x: direction * 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -80 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
          />
        </AnimatePresence>

        {/* Dark scrim + zoom hint */}
        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200
                        flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 bg-white/0 hover:bg-white/20 rounded-full
                          flex items-center justify-center opacity-0 group-hover:opacity-100">
            <ZoomIn className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Zoom icon always visible */}
        <div className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm
                        rounded-full flex items-center justify-center pointer-events-none">
          <ZoomIn className="h-4 w-4 text-white" />
        </div>

        {/* Prev/Next */}
        {images.length > 1 && (
          <>
            <button type="button"
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-3 top-1/2 -translate-y-1/2
                         w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm
                         rounded-full flex items-center justify-center text-white
                         transition-colors z-10"
              aria-label="Previous image">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button"
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-3 top-1/2 -translate-y-1/2
                         w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-sm
                         rounded-full flex items-center justify-center text-white
                         transition-colors z-10"
              aria-label="Next image">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Counter badge */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1
                          px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full
                          text-[11px] text-white font-medium pointer-events-none">
            <Images className="h-3 w-3" />
            {idx + 1} / {images.length}
          </div>
        )}

        {/* Dot indicators */}
        {images.length > 1 && images.length <= 8 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
            {images.map((_, i) => (
              <div key={i}
                className={`rounded-full transition-all duration-250 ${
                  i === idx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                }`} />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail filmstrip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}>
          {images.map((src, i) => (
            <button key={i} type="button" onClick={() => go(i)}
              className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200
                          ${i === idx
                            ? 'border-primary scale-[1.03] shadow-md shadow-primary/20'
                            : 'border-transparent opacity-55 hover:opacity-80 hover:border-border'}`}
              aria-label={`View image ${i + 1}`}>
              <img src={src} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Status badge ───────────────────────────────── */
function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, string> = {
    'Live':           'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    'In Development': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    'Completed':      'bg-primary/10 text-primary border-primary/20',
  }
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${map[status ?? ''] ?? 'bg-muted text-muted-foreground border-border'}`}>
      {status ?? 'Project'}
    </span>
  )
}

/* ─── Page ───────────────────────────────────────── */
export default function ProjectDetailPage() {
  const params    = useParams()
  const router    = useRouter()
  const auth      = getAuth()
  const projectId = params?.projectId as string

  const [project,   setProject]   = useState<Project | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [notFound,  setNotFound]  = useState(false)
  const [liked,     setLiked]     = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeAnim,  setLikeAnim]  = useState(false)
  const [user,      setUser]      = useState<User | null>(null)
  const [lightbox,  setLightbox]  = useState<number | null>(null)

  /* Auth */
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u))
  }, [])

  /* Fetch project + check like */
  useEffect(() => {
    if (!projectId) return
    ;(async () => {
      setLoading(true)
      try {
        const snap = await getDoc(doc(db, 'projects', projectId))
        if (!snap.exists()) { setNotFound(true); return }
        const data = { id: snap.id, ...snap.data() } as Project
        setProject(data)
        setLikeCount(data.likes ?? 0)

        // Track view
        updateDoc(doc(db, 'projects', projectId), { views: increment(1) }).catch(() => {})
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    })()
  }, [projectId])

  /* Check if current user liked */
  useEffect(() => {
    if (!user || !projectId) return
    getDoc(doc(db, 'projects', projectId, 'likes', user.uid))
      .then((d) => setLiked(d.exists()))
      .catch(() => {})
  }, [user, projectId])

  const handleLike = async () => {
    if (!user) return
    const uid      = user.uid
    const likeRef  = doc(db, 'projects', projectId, 'likes', uid)
    const projRef  = doc(db, 'projects', projectId)
    const wasLiked = liked

    // Optimistic
    setLikeAnim(true)
    setLiked(!wasLiked)
    setLikeCount((c) => c + (wasLiked ? -1 : 1))
    setTimeout(() => setLikeAnim(false), 400)

    try {
      if (wasLiked) {
        await deleteDoc(likeRef)
        await updateDoc(projRef, { likes: increment(-1) })
      } else {
        await setDoc(likeRef, { uid, timestamp: new Date() })
        await updateDoc(projRef, { likes: increment(1) })
      }
    } catch {
      // Roll back
      setLiked(wasLiked)
      setLikeCount((c) => c + (wasLiked ? 1 : -1))
    }
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen animated-gradient pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-24 bg-muted rounded-lg" />
            <div className="aspect-video w-full bg-muted rounded-2xl" />
            <div className="flex gap-2">
              {[80, 64, 80, 64].map((w, i) => (
                <div key={i} className="h-14 rounded-xl bg-muted shrink-0" style={{ width: w }} />
              ))}
            </div>
            <div className="h-8 w-2/3 bg-muted rounded-xl" />
            <div className="h-4 w-full bg-muted rounded-lg" />
            <div className="h-4 w-5/6 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  /* ── Not found ── */
  if (notFound || !project) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Images className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Project not found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This project may have been removed or doesn't exist.
          </p>
          <Link href="/projects"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground
                       rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to projects
          </Link>
        </div>
      </div>
    )
  }

  /* Build full image list */
  const coverImage = project.imageUrl || project.image || '/placeholder.png'
  const extra      = (project.screenshots || []).filter((s) => s && s !== coverImage)
  const allImages  = [coverImage, ...extra]

  const tags = project.tags || project.technologies || []

  return (
    <>
      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox
            images={allImages}
            startIndex={lightbox}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen animated-gradient pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mb-8"
          >
            <Link href="/projects"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground
                         hover:text-foreground transition-colors group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              All projects
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ═══════════════════════════════
                LEFT — Gallery (2/3 width)
            ═══════════════════════════════ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="lg:col-span-2"
            >
              <HeroSlider
                images={allImages}
                title={project.title ?? ''}
                onOpenLightbox={(i) => setLightbox(i)}
              />

              {/* Full description — below gallery on mobile, same column on desktop */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
                className="mt-8"
              >
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  About this project
                </h2>
                <p className="text-foreground leading-relaxed whitespace-pre-line text-[15px]">
                  {project.description || project.summary || 'No description provided.'}
                </p>
              </motion.div>
            </motion.div>

            {/* ═══════════════════════════════
                RIGHT — Metadata sidebar (1/3)
            ═══════════════════════════════ */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
              className="space-y-6"
            >
              {/* Title + status */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <StatusBadge status={project.status} />
                  {project.featured && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full border
                                     bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                      Featured
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {project.title}
                </h1>
                {project.summary && project.description && (
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                    {project.summary}
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="glass rounded-2xl p-4 flex items-center gap-6">
                {/* Like */}
                <button type="button" onClick={handleLike}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors
                              ${liked ? 'text-rose-500' : 'text-muted-foreground hover:text-rose-500'}`}
                  aria-label={liked ? 'Unlike' : 'Like'}>
                  <motion.div animate={likeAnim ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                    transition={{ duration: 0.35 }}>
                    <Heart className={`h-5 w-5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </motion.div>
                  <span>{likeCount}</span>
                </button>

                <div className="h-5 w-px bg-border" />

                {/* Views */}
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {(project.views ?? 0).toLocaleString()} views
                </span>

                {allImages.length > 1 && (
                  <>
                    <div className="h-5 w-px bg-border" />
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Images className="h-4 w-4" />
                      {allImages.length} photos
                    </span>
                  </>
                )}
              </div>

              {/* Category + date */}
              <div className="glass rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    Category
                  </span>
                  <span className="font-medium text-foreground capitalize">{project.category}</span>
                </div>
                {project.createdAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Published
                    </span>
                    <span className="font-medium text-foreground">
                      {project.createdAt.toDate().toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Tech tags */}
              {tags.length > 0 && (
                <div className="glass rounded-2xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" />
                    Stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag}
                        className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-lg font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(project.githubUrl || project.liveUrl) && (
                <div className="space-y-2.5">
                  {project.liveUrl && (
                    <button type="button"
                      onClick={() => window.open(project.liveUrl, '_blank', 'noopener,noreferrer')}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3
                                 bg-primary text-primary-foreground rounded-xl text-sm font-medium
                                 hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25
                                 active:scale-[0.97]">
                      <ExternalLink className="h-4 w-4" />
                      View live project
                    </button>
                  )}
                  {project.githubUrl && (
                    <button type="button"
                      onClick={() => window.open(project.githubUrl, '_blank', 'noopener,noreferrer')}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3
                                 bg-card border border-border rounded-xl text-sm font-medium
                                 text-foreground hover:bg-accent hover:border-primary/30
                                 transition-all active:scale-[0.97]">
                      <Github className="h-4 w-4" />
                      View source code
                    </button>
                  )}
                </div>
              )}

              {/* Back + all projects CTA */}
              <div className="pt-2">
                <Link href="/projects"
                  className="inline-flex items-center gap-2 text-xs text-muted-foreground
                             hover:text-foreground transition-colors group">
                  <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  Browse all projects
                </Link>
              </div>
            </motion.aside>
          </div>
        </div>
      </div>
    </>
  )
}