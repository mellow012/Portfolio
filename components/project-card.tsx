'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Heart, ArrowUpRight, Github, ExternalLink, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import Link from 'next/link'

/* ─── Types ──────────────────────────────────────── */
interface ProjectCardProps {
  id: string
  title: string
  description: string
  image: string
  screenshots?: string[]   // ← additional gallery images
  category: string
  tags?: string[]
  summary?: string
  likes?: number
  views?: number
  featured?: boolean
  isLiked?: boolean
  githubUrl?: string
  liveUrl?: string
  onLike: () => void
  onView: (e: React.MouseEvent) => void
  onSelect?: () => void
}

const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number]

/** Opens a URL in a new tab — never uses <a> inside <Link> */
function openExternal(e: React.MouseEvent, url: string) {
  e.preventDefault()
  e.stopPropagation()
  window.open(url, '_blank', 'noopener,noreferrer')
}

/* ─── Skeleton ───────────────────────────────────── */
export function ProjectCardSkeleton() {
  return (
    <div className="bg-[#181a1b] border border-[#3e3d4c] rounded-2xl overflow-hidden animate-pulse p-3 space-y-4">
      <div className="h-48 bg-[#1f2122] rounded-xl" />
      <div className="space-y-3 px-2">
        <div className="h-4 bg-[#1f2122] rounded-lg w-3/4" />
        <div className="h-3 bg-[#1f2122] rounded-lg w-full" />
        <div className="h-3 bg-[#1f2122] rounded-lg w-5/6" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-14 bg-[#1f2122] rounded-lg" />
          <div className="h-5 w-16 bg-[#1f2122] rounded-lg" />
        </div>
        <div className="flex justify-between pt-3 border-t border-[#3e3d4c]/40">
          <div className="flex gap-3">
            <div className="h-3.5 w-10 bg-[#1f2122] rounded" />
          </div>
          <div className="h-3.5 w-16 bg-[#1f2122] rounded" />
        </div>
      </div>
    </div>
  )
}

/* ─── Mini image slider (used inside the card) ───── */
interface MiniSliderProps {
  images: string[]
  title: string
}

function MiniSlider({ images, title }: MiniSliderProps) {
  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(0)

  const go = useCallback((e: React.MouseEvent, next: number) => {
    e.preventDefault()
    e.stopPropagation()
    setDirection(next > idx ? 1 : -1)
    setIdx(next)
  }, [idx])

  const prev = (e: React.MouseEvent) => go(e, (idx - 1 + images.length) % images.length)
  const next = (e: React.MouseEvent) => go(e, (idx + 1) % images.length)
  const goTo = (e: React.MouseEvent, i: number) => go(e, i)

  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105
                   transition-transform duration-700 ease-out"
        onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
      />
    )
  }

  return (
    <>
      {/* Slides */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.img
          key={idx}
          src={images[idx]}
          alt={`${title} — image ${idx + 1}`}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
        />
      </AnimatePresence>

      {/* Prev / Next — glassmorphic buttons */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20
                   w-7 h-7 bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10
                   rounded-full flex items-center justify-center text-white/80 hover:text-white
                   opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0
                   transition-all duration-300"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20
                   w-7 h-7 bg-black/40 hover:bg-black/70 backdrop-blur-md border border-white/10
                   rounded-full flex items-center justify-center text-white/80 hover:text-white
                   opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0
                   transition-all duration-300"
        aria-label="Next image"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dot indicators - thin glass lines */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => goTo(e, i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === idx
                ? 'w-6 bg-white shadow-sm'
                : 'w-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>

      {/* Image count badge — glassmorphic */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1
                      px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10
                      text-[10px] text-white/90 font-semibold shadow-sm">
        <Images className="h-3 w-3" />
        {idx + 1}/{images.length}
      </div>
    </>
  )
}

/* ─── Card ───────────────────────────────────────── */
export default function ProjectCard({
  id, title, description, image, screenshots = [],
  category, tags = [], summary, likes = 0, views = 0,
  isLiked = false, githubUrl, liveUrl,
  onLike, onView, onSelect,
}: ProjectCardProps) {
  const [liked,         setLiked]         = useState(isLiked)
  const [likeCount,     setLikeCount]     = useState(likes)
  const [likeAnimating, setLikeAnimating] = useState(false)

  // Build the full image list: cover image first, then any additional screenshots
  const allImages = [
    image || '/placeholder.png',
    ...screenshots.filter((s) => s && s !== image),
  ]

  function handleLike(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (likeAnimating) return
    setLikeAnimating(true)
    setLiked((v) => !v)
    setLikeCount((c) => liked ? c - 1 : c + 1)
    setTimeout(() => setLikeAnimating(false), 400)
    onLike()
  }

  const handleCardClick = (e: React.MouseEvent) => {
    onView(e)
    if (onSelect) {
      e.preventDefault()
      onSelect()
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: EASE }}
      onClick={handleCardClick}
      className="group relative bg-[#181a1b] border border-[#3e3d4c]/70 rounded-2xl overflow-hidden
                 cursor-pointer hover:border-[#c0c1ff]/50
                 hover:shadow-2xl hover:shadow-[#c0c1ff]/5
                 transition-all duration-300 flex flex-col justify-between"
    >
      <div>
        {/* ══ Image / slider area (Inset frame style) ══ */}
        <div className="relative overflow-hidden h-48 bg-[#121314] rounded-xl m-2 border border-[#3e3d4c]/30">
          <MiniSlider images={allImages} title={title} />

          {/* Gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent
                          opacity-80 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none" />

          {/* External quick-links & Category pill — top left */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
            <span className="px-2.5 py-1 bg-black/55 backdrop-blur-md text-[#c0c1ff]
                             text-[10px] font-bold uppercase tracking-wider rounded-lg border border-[#c0c1ff]/20 shadow-lg">
              {category}
            </span>
          </div>

          {/* Arrow — bottom right, slides in on hover */}
          <div className="absolute bottom-3 right-3 z-10 w-8 h-8 bg-white text-[#101415] rounded-full
                          flex items-center justify-center shadow-lg
                          opacity-0 scale-75 translate-y-2
                          group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0
                          transition-all duration-300 pointer-events-none">
            <ArrowUpRight className="h-4.5 w-4.5" />
          </div>

          {/* External quick-links — bottom left (Always visible with glassmorphism) */}
          <div className="absolute bottom-3 left-3 z-10 flex gap-2">
            <button type="button" onClick={(e) => openExternal(e, githubUrl || 'https://github.com/mellow012')}
              className="w-8 h-8 bg-black/60 hover:bg-[#c0c1ff] hover:text-[#1000a9] hover:scale-105 backdrop-blur-md
                         rounded-lg flex items-center justify-center text-white border border-white/20 transition-all shadow-md"
              aria-label="GitHub" title="View GitHub repository">
              <Github className="h-4 w-4" />
            </button>
            {liveUrl && (
              <button type="button" onClick={(e) => openExternal(e, liveUrl)}
                className="w-8 h-8 bg-[#c0c1ff]/90 hover:bg-white hover:scale-105 backdrop-blur-md
                           rounded-lg flex items-center justify-center text-[#1000a9] transition-all shadow-md"
                aria-label="Live demo" title="View live site">
                <ExternalLink className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* ══ Content ══ */}
        <div className="px-5 pt-3 pb-4">
          <h3 className="font-bold text-[15px] text-[#e0e3e5] group-hover:text-[#c0c1ff]
                         transition-colors duration-200 mb-1.5 line-clamp-1 tracking-tight">
            {title}
          </h3>

          <p className="text-sm text-[#908fa0] line-clamp-2 mb-4 leading-relaxed">
            {summary || description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-[#c0c1ff]/8 text-[#c0c1ff] text-[10px] font-bold rounded-md border border-[#c0c1ff]/10">
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2.5 py-0.5 bg-[#1f2122] text-[#908fa0] text-[10px] rounded-md border border-[#3e3d4c]/30">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 pt-3 border-t border-[#3e3d4c]/40 mt-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-[#908fa0]">
            <button type="button" onClick={handleLike}
              className="flex items-center gap-1.5 hover:text-rose-500 transition-colors active:scale-90"
              aria-label={liked ? 'Unlike' : 'Like'}>
              <motion.div animate={likeAnimating ? { scale: [1, 1.45, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}>
                <Heart className={`h-3.5 w-3.5 transition-all duration-200 ${
                  liked ? 'fill-rose-500 text-rose-500' : 'fill-transparent'}`} />
              </motion.div>
              <span className={liked ? 'text-rose-500' : ''}>{likeCount}</span>
            </button>
            <span className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />{views}
            </span>
            {allImages.length > 1 && (
              <span className="flex items-center gap-1 text-[#c0c1ff]/70">
                <Images className="h-3 w-3" />{allImages.length} photos
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#908fa0]/60 group-hover:text-[#c0c1ff]
                           transition-colors flex items-center gap-0.5 font-semibold">
            Details <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>
      </div>
    </motion.article>
  )
}