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
  onView: () => void
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
    <div className="bg-card border border-border rounded-2xl overflow-hidden animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-muted rounded-lg w-3/4" />
        <div className="h-3 bg-muted rounded-lg w-full" />
        <div className="h-3 bg-muted rounded-lg w-5/6" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-14 bg-muted rounded-lg" />
          <div className="h-5 w-16 bg-muted rounded-lg" />
          <div className="h-5 w-12 bg-muted rounded-lg" />
        </div>
        <div className="flex justify-between pt-2 border-t border-border/40">
          <div className="flex gap-3">
            <div className="h-3.5 w-10 bg-muted rounded" />
            <div className="h-3.5 w-10 bg-muted rounded" />
          </div>
          <div className="h-3.5 w-16 bg-muted rounded" />
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
        className="w-full h-full object-cover group-hover:scale-[1.04]
                   transition-transform duration-500 ease-out"
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
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
        />
      </AnimatePresence>

      {/* Prev / Next — only visible on group hover */}
      <button
        type="button"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20
                   w-6 h-6 bg-black/50 hover:bg-black/70 backdrop-blur-sm
                   rounded-full flex items-center justify-center text-white
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20
                   w-6 h-6 bg-black/50 hover:bg-black/70 backdrop-blur-sm
                   rounded-full flex items-center justify-center text-white
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        aria-label="Next image"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1 z-20">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => goTo(e, i)}
            className={`rounded-full transition-all duration-250 ${
              i === idx
                ? 'w-4 h-1.5 bg-white'
                : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>

      {/* Image count badge — top right */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1
                      px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full
                      text-[10px] text-white font-medium">
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
  onLike, onView,
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

  return (
    <Link href={`/projects/${id}`} onClick={onView} className="block">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="group relative bg-card border border-border rounded-2xl overflow-hidden
                   cursor-pointer hover:border-primary/40
                   hover:shadow-2xl hover:shadow-primary/10
                   transition-all duration-300"
      >
        {/* ══ Image / slider area ══ */}
        <div className="relative overflow-hidden h-48 bg-muted">
          <MiniSlider images={allImages} title={title} />

          {/* Gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent
                          opacity-70 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none" />

          {/* Category pill — top left */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="px-2.5 py-1 bg-background/90 backdrop-blur-sm text-foreground
                             text-[11px] font-medium rounded-full border border-border/60 shadow-sm">
              {category}
            </span>
          </div>

          {/* Arrow — bottom right, slides in on hover */}
          <div className="absolute bottom-3 right-3 z-10 w-8 h-8 bg-white dark:bg-foreground rounded-full
                          flex items-center justify-center shadow-lg
                          opacity-0 translate-y-2
                          group-hover:opacity-100 group-hover:translate-y-0
                          transition-all duration-300 pointer-events-none">
            <ArrowUpRight className="h-4 w-4 text-black dark:text-background" />
          </div>

          {/* External quick-links — bottom left */}
          {(githubUrl || liveUrl) && (
            <div className="absolute bottom-3 left-3 z-10 flex gap-1.5
                            opacity-0 translate-y-2
                            group-hover:opacity-100 group-hover:translate-y-0
                            transition-all duration-300 delay-75">
              {githubUrl && (
                <button type="button" onClick={(e) => openExternal(e, githubUrl)}
                  className="w-7 h-7 bg-black/40 hover:bg-black/60 backdrop-blur-sm
                             rounded-full flex items-center justify-center text-white transition-colors"
                  aria-label="GitHub" title="View source">
                  <Github className="h-3.5 w-3.5" />
                </button>
              )}
              {liveUrl && (
                <button type="button" onClick={(e) => openExternal(e, liveUrl)}
                  className="w-7 h-7 bg-primary/80 hover:bg-primary backdrop-blur-sm
                             rounded-full flex items-center justify-center text-white transition-colors"
                  aria-label="Live demo" title="View live">
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ══ Content ══ */}
        <div className="p-5">
          <h3 className="font-semibold text-[15px] text-foreground group-hover:text-primary
                         transition-colors duration-200 mb-1.5 line-clamp-1 tracking-tight">
            {title}
          </h3>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {summary || description}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] rounded-lg font-medium">
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="px-2.5 py-0.5 bg-accent text-muted-foreground text-[11px] rounded-lg">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
                <span className="flex items-center gap-1 text-primary/70">
                  <Images className="h-3 w-3" />{allImages.length} photos
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground/60 group-hover:text-primary
                             transition-colors flex items-center gap-0.5">
              Details <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}