'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { db } from '../../../lib/firebaseConfig'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { 
  X, Heart, Eye, ExternalLink, Github, 
  ChevronLeft, ChevronRight, Code2, Loader2 
} from 'lucide-react'

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
  stackBreakdown?: { label: string; items: string[] }[]
  decisions?: { title: string; detail: string }[]
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const auth = getAuth()
  
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [likeAnimating, setLikeAnimating] = useState(false)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
    })
    return () => unsubscribe()
  }, [auth])

  // Fetch Project details
  useEffect(() => {
    const fetchProject = async () => {
      const projectId = params?.projectId as string
      if (!projectId) {
        router.replace('/#projects')
        return
      }

      try {
        const projectRef = doc(db, 'projects', projectId)
        const docSnap = await getDoc(projectRef)
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Project
          setProject(data)
          setLikeCount(data.likes || 0)

          // Safely attempt to increment view count (non-fatal if permissions block writes)
          try {
            await updateDoc(projectRef, { views: increment(1) })
            setProject(prev => prev ? { ...prev, views: (prev.views || 0) + 1 } : null)
          } catch (viewErr) {
            console.warn('Could not update view count (permissions or offline):', viewErr)
          }

          // Safely check if liked by current user
          if (auth.currentUser) {
            try {
              const likeDoc = await getDoc(doc(db, 'projects', projectId, 'likes', auth.currentUser.uid))
              if (likeDoc.exists() && likeDoc.data()?.active !== false) {
                setIsLiked(true)
              }
            } catch (likeErr) {
              console.warn('Could not check user like status:', likeErr)
            }
          }
        } else {
          router.replace('/#projects')
        }
      } catch (err) {
        console.error('Failed to load project:', err)
        router.replace('/#projects')
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [params, router, auth.currentUser])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || !project) {
      alert('Please log in to like this project.')
      return
    }

    if (likeAnimating) return
    setLikeAnimating(true)

    const projectId = project.id
    const already = isLiked
    const likeRef = doc(db, 'projects', projectId, 'likes', user.uid)
    const projectRef = doc(db, 'projects', projectId)

    // Optimistic Update
    setIsLiked(!already)
    setLikeCount(prev => prev + (already ? -1 : 1))
    setTimeout(() => setLikeAnimating(false), 450)

    try {
      if (already) {
        await setDoc(likeRef, { active: false })
        await updateDoc(projectRef, { likes: increment(-1) })
      } else {
        await setDoc(likeRef, { userId: user.uid, timestamp: new Date(), active: true })
        await updateDoc(projectRef, { likes: increment(1) })
      }
    } catch (err) {
      setIsLiked(already)
      setLikeCount(prev => prev + (already ? 1 : -1))
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-[#908fa0] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#c0c1ff]" />
        <span className="text-sm font-medium">Loading project details...</span>
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4 py-6 md:p-10 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="bg-[#191c1e] border border-[#464554]/70 rounded-3xl w-full max-w-6xl h-full max-h-[90vh] md:max-h-[85vh]
                   flex flex-col md:flex-row overflow-hidden shadow-2xl relative"
      >
        {/* Cover/Screenshots Left Panel */}
        <div className="relative w-full md:w-1/2 h-64 sm:h-80 md:h-full bg-[#101415] shrink-0 border-r border-[#464554]/30">
          {project.screenshots && project.screenshots.length > 0 ? (
            <ProjectGallery
              images={project.screenshots}
              title={project.title}
              onImageClick={(url) => setLightboxImage(url)}
            />
          ) : project.imageUrl || project.image ? (
            <img
              src={project.imageUrl || project.image}
              alt={project.title}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => setLightboxImage(project.imageUrl || project.image || null)}
              onError={(el) => { (el.target as HTMLImageElement).src = '/placeholder.png' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#c0c1ff]/15 to-rose-500/5 flex items-center justify-center">
              <Code2 className="h-16 w-16 text-[#c0c1ff]/30" />
            </div>
          )}
        </div>

        {/* Details Right Panel */}
        <div className="w-full md:w-1/2 h-full overflow-y-auto p-6 sm:p-9 md:p-10 space-y-8 scrollbar-none relative">
          <Link
            href="/#projects"
            className="absolute top-5 right-5 z-20 p-2 rounded-xl bg-black/45 backdrop-blur-md hover:bg-black/65
                       text-[#e0e3e5] border border-[#464554]/50 transition-colors"
            aria-label="Close details"
          >
            <X className="h-4.5 w-4.5" />
          </Link>

          {/* Header block */}
          <div>
            <span className="px-2.5 py-1 bg-[#c0c1ff]/10 text-[#c0c1ff] border border-[#c0c1ff]/20 text-[10px] font-bold uppercase rounded-md">
              {project.category}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3 mb-2">
              {project.title}
            </h3>

            {/* Stats + CTAs row */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#464554]/50 bg-[#101415]
                            text-xs font-semibold hover:border-[#c0c1ff]/30 transition-all
                            ${isLiked ? 'text-rose-400' : 'text-[#908fa0]'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current text-rose-400' : ''}`} />
                {likeCount}
              </button>
              <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#464554]/50 bg-[#101415] text-xs font-semibold text-[#908fa0]">
                <Eye className="h-4 w-4" />
                {project.views || 0}
              </span>

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#c0c1ff] text-[#1000a9]
                             rounded-xl text-xs font-bold hover:bg-[#c0c1ff]/90 transition-all active:scale-[0.98]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Live Demo
                </a>
              )}
              <a
                href={project.githubUrl || 'https://github.com/mellow012'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#272a2c] hover:bg-[#323537]
                           text-white border border-[#464554]/70 hover:border-[#c0c1ff]/50 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
              >
                <Github className="h-3.5 w-3.5 text-[#c0c1ff]" />
                Source Code
              </a>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#908fa0]">Project Details</h4>
            <p className="text-sm leading-relaxed whitespace-pre-line text-[#e0e3e5] opacity-85">
              {project.description}
            </p>
          </div>

          {/* Built with tags */}
          {project.tags && project.tags.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#908fa0] mb-2.5">Built with</h4>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((t) => (
                  <span key={t} className="px-3 py-0.5 bg-[#c0c1ff]/10 border border-[#c0c1ff]/15 text-[#c0c1ff] text-xs rounded-xl font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Technical breakdown */}
          {project.stackBreakdown && project.stackBreakdown.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#908fa0] mb-3">Technical Breakdown</h4>
              <div className="grid grid-cols-2 gap-3">
                {project.stackBreakdown.map((group) => (
                  <div key={group.label} className="bg-[#101415] border border-[#464554]/40 rounded-2xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#908fa0] mb-2.5">{group.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((item) => (
                        <span key={item} className="px-2.5 py-1 bg-[#191c1e] border border-[#464554]/40 rounded-lg text-[11px] font-semibold text-[#e0e3e5]">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key decisions */}
          {project.decisions && project.decisions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#908fa0] mb-3">Key Decisions</h4>
              <div className="space-y-3">
                {project.decisions.map((d) => (
                  <div key={d.title} className="bg-[#101415] border-l-2 border-[#c0c1ff] border-y border-r border-[#464554]/30 rounded-2xl p-4">
                    <p className="text-sm font-bold text-white mb-1.5">{d.title}</p>
                    <p className="text-xs text-[#908fa0] leading-relaxed">{d.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.div>

      {/* Fullscreen Lightbox Overlay */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 z-[130] p-3 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage}
                alt="Fullscreen screenshot"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Inner Gallery Component ───────────────────── */
interface ProjectGalleryProps {
  images: string[]
  title: string
  onImageClick?: (url: string) => void
}

function ProjectGallery({ images, title, onImageClick }: ProjectGalleryProps) {
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
    <div className="relative w-full h-full pb-16 bg-black/20">
      <div className="relative w-full h-[calc(100%-64px)] overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={idx}
            src={images[idx]}
            alt={`${title} screenshot ${idx + 1}`}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
            onClick={() => onImageClick?.(images[idx])}
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
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 0 && (
        <div className="absolute bottom-2 left-0 right-0 px-4 flex justify-center gap-2.5 z-20 overflow-x-auto py-1 scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => go(e, i)}
              className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                i === idx
                  ? 'border-[#c0c1ff] scale-105 shadow-md shadow-[#c0c1ff]/20'
                  : 'border-[#464554]/55 opacity-55 hover:opacity-100 hover:border-white/40'
              }`}
              aria-label={`Show screenshot ${i + 1}`}
            >
              <img src={img} alt="thumb" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}