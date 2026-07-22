'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Heart, Eye, ExternalLink, Github, ChevronLeft, ChevronRight,
  Code2, Maximize2, Layers, Cpu, CheckCircle2, Sparkles
} from 'lucide-react'

const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number]

export interface Project {
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

interface ProjectDetailModalProps {
  project: Project | null
  onClose: () => void
  likedProjects: Set<string>
  handleLike: (e: React.MouseEvent, project: Project) => void
}

export default function ProjectDetailModal({
  project,
  onClose,
  likedProjects,
  handleLike
}: ProjectDetailModalProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  // Clears the lightbox alongside the modal so it can never survive a close.
  const handleClose = () => {
    setLightboxImage(null)
    onClose()
  }

  // Body scroll lock + focus management + Escape-to-close.
  useEffect(() => {
    if (!project) return

    previouslyFocused.current = document.activeElement as HTMLElement
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImage) {
          setLightboxImage(null)
        } else {
          handleClose()
        }
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', onKeyDown)
      previouslyFocused.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, lightboxImage])

  const galleryImages = [
    ...(project?.screenshots && project.screenshots.length > 0
      ? project.screenshots
      : (project?.imageUrl || project?.image) ? [project.imageUrl || project.image!] : [])
  ]

  return (
    <>
      <AnimatePresence>
        {project && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md px-3 py-4 sm:p-6 md:p-8"
            onClick={handleClose}
          >
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="bg-[#191c1e] border border-[#464554]/70 rounded-3xl w-full max-w-5xl h-full max-h-[92vh]
                         flex flex-col overflow-hidden shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                ref={closeButtonRef}
                onClick={handleClose}
                className="absolute top-4 right-4 z-40 p-2.5 rounded-xl bg-black/70 backdrop-blur-md hover:bg-black
                           text-[#e0e3e5] border border-white/20 transition-all shadow-2xl hover:scale-105 active:scale-95"
                aria-label="Close details"
              >
                <X className="h-[18px] w-[18px]" />
              </button>

              {/* Scrollable Container (Centralized Details & Media Showcase) */}
              <div className="w-full h-full overflow-y-auto scrollbar-none flex flex-col">
                <div className="w-full p-6 sm:p-8 md:p-10 space-y-10">

                  {/* Header block */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-[#464554]/30">
                    <div className="space-y-3 max-w-2xl">
                      {project.category && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#c0c1ff]/10 text-[#c0c1ff] border border-[#c0c1ff]/20 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-sm">
                          <Layers className="h-3 w-3" />
                          {project.category}
                        </span>
                      )}
                      <h3 id="project-modal-title" className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
                        {project.title}
                      </h3>
                      {project.summary && (
                        <p className="text-sm sm:text-base text-[#908fa0] leading-relaxed">
                          {project.summary}
                        </p>
                      )}
                    </div>

                    {/* Stats & Action CTAs */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={(e) => handleLike(e, project)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-[#101415]
                                    text-xs font-semibold transition-all hover:scale-105 active:scale-95
                                    ${likedProjects.has(project.id)
                            ? 'text-rose-400 border-rose-500/40 bg-rose-500/10'
                            : 'text-[#908fa0] border-[#464554]/50 hover:border-[#c0c1ff]/30'}`}
                      >
                        <Heart className={`h-4 w-4 ${likedProjects.has(project.id) ? 'fill-current text-rose-400' : ''}`} />
                        <span>{project.likes || 0}</span>
                      </button>

                      {/* View Counter */}
                      <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#464554]/50 bg-[#101415] text-xs font-semibold text-[#908fa0]">
                        <Eye className="h-4 w-4" />
                        <span>{project.views || 0}</span>
                      </span>

                      {/* Live Demo CTA */}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#c0c1ff] to-[#a3a5ff] text-[#1000a9]
                                     rounded-xl text-xs font-extrabold hover:opacity-95 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#c0c1ff]/20"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Live Demo
                        </a>
                      )}

                      {/* GitHub Source CTA (Always available) */}
                      <a
                        href={project.githubUrl || 'https://github.com/mellow012'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#222527] hover:bg-[#2c2f32]
                                   text-white border border-[#464554]/70 hover:border-[#c0c1ff]/50 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                      >
                        <Github className="h-4 w-4 text-[#c0c1ff]" />
                        Source Code
                      </a>
                    </div>
                  </div>

                  {/* Gallery Showcase */}
                  <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] bg-[#0d0f11] rounded-2xl border border-[#464554]/50 overflow-hidden shadow-lg">
                    {galleryImages.length > 0 ? (
                      <ProjectGallery
                        images={galleryImages}
                        title={project.title}
                        onImageClick={(url) => setLightboxImage(url)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#c0c1ff]/15 to-rose-500/5 flex flex-col items-center justify-center gap-3">
                        <Code2 className="h-16 w-16 text-[#c0c1ff]/30" />
                        <span className="text-xs text-[#908fa0]">No screenshots available</span>
                      </div>
                    )}
                  </div>

                  {/* Project Overview / Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#908fa0]">
                      <Sparkles className="h-4 w-4 text-[#c0c1ff]" />
                      <h4 className="text-xs font-bold uppercase tracking-wider">Project Overview</h4>
                    </div>
                    <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line text-[#e0e3e5] opacity-90 pl-1">
                      {project.description}
                    </p>
                  </div>

                  {/* Built with Tech Pills */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#908fa0]">
                        <Cpu className="h-4 w-4 text-[#c0c1ff]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Built With</h4>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {project.tags.map((t) => (
                          <span
                            key={t}
                            className="px-4 py-1.5 bg-[#101415] border border-[#464554]/50 hover:border-[#c0c1ff]/40 text-[#c0c1ff] text-xs font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]" />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical breakdown */}
                  {project.stackBreakdown && project.stackBreakdown.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#908fa0]">
                        <Layers className="h-4 w-4 text-[#c0c1ff]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Technical Architecture</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {project.stackBreakdown.map((group) => (
                          <div key={group.label} className="bg-[#101415] border border-[#464554]/50 rounded-2xl p-5 hover:border-[#c0c1ff]/30 transition-all">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[#908fa0] mb-3">{group.label}</p>
                            <div className="flex flex-wrap gap-2">
                              {group.items.map((item) => (
                                <span key={item} className="px-3 py-1.5 bg-[#191c1e] border border-[#464554]/40 rounded-xl text-xs font-medium text-[#e0e3e5]">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Decisions */}
                  {project.decisions && project.decisions.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#908fa0]">
                        <CheckCircle2 className="h-4 w-4 text-[#c0c1ff]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Key Decisions & Insights</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {project.decisions.map((d) => (
                          <div key={d.title} className="bg-[#101415] border-l-4 border-[#c0c1ff] border-y border-r border-[#464554]/40 rounded-2xl p-5 shadow-sm">
                            <p className="text-sm font-bold text-white mb-1.5">{d.title}</p>
                            <p className="text-xs text-[#908fa0] leading-relaxed">{d.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            {/* Close Lightbox Button */}
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
    </>
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
    <div className="relative w-full h-full pb-14 bg-[#0a0c0d] overflow-hidden flex flex-col justify-between">
      {/* Zoom indicator pill */}
      <button
        onClick={() => onImageClick?.(images[idx])}
        className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[11px] font-medium text-white/90 border border-white/10 hover:bg-black/80 transition-colors"
      >
        <Maximize2 className="h-3.5 w-3.5" />
        Click to expand
      </button>

      {/* Main Image viewport with object-contain */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden p-3">
        <AnimatePresence initial={false}>
          <motion.img
            key={idx}
            src={images[idx]}
            alt={`${title} screenshot ${idx + 1}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="max-w-full max-h-full object-contain cursor-zoom-in rounded-xl shadow-2xl"
            onClick={() => onImageClick?.(images[idx])}
            onError={(el) => { (el.target as HTMLImageElement).src = '/placeholder.png' }}
          />
        </AnimatePresence>

        {/* Navigation Arrow Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 backdrop-blur-md hover:bg-black/80
                         rounded-full text-white border border-white/20 transition-colors z-20 shadow-xl"
              aria-label="Previous screenshot"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/60 backdrop-blur-md hover:bg-black/80
                         rounded-full text-white border border-white/20 transition-colors z-20 shadow-xl"
              aria-label="Next screenshot"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 px-4 flex justify-center gap-2.5 z-20 overflow-x-auto py-1 scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={(e) => go(e, i)}
              className={`relative w-16 h-11 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                i === idx
                  ? 'border-[#c0c1ff] scale-105 shadow-xl shadow-[#c0c1ff]/30'
                  : 'border-[#464554]/55 opacity-50 hover:opacity-100 hover:border-white/40'
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
