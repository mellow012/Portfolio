'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  collection, addDoc, getDoc, getDocs, doc,
  setDoc, serverTimestamp, orderBy, query, limit
} from 'firebase/firestore'
import { auth, db } from '../../lib/firebaseConfig'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import {
  LayoutDashboard, Plus, Upload, X, Loader2, Github,
  Globe, Code, Star, User, Eye, Folder, Mail, QrCode,
  Edit, TrendingUp, ArrowUpRight, CheckCircle2, AlertCircle,
  BarChart2, FileText, Zap, Clock, ExternalLink
} from 'lucide-react'

/* ─── Constants ──────────────────────────────────── */
// Never throw at module level — that crashes SSR
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID ?? 'uQxNQHVIbNhm7hNHl8bnwH2Xc322'
const EASE = [0.4, 0, 0.2, 1] as [number, number, number, number]

/* ─── Types ──────────────────────────────────────── */
interface Project {
  id: string
  title?: string
  description?: string
  summary?: string
  image?: string
  imageUrl?: string
  views?: number
  likes?: number
  featured?: boolean
  status?: string
  category?: string
  createdAt?: { toDate: () => Date }
  updatedAt?: { toDate: () => Date }
}

interface Contact {
  email: string
  twitter: string
  github: string
  whatsapp: string
}

type Tab = 'overview' | 'add-project'
type Toast = { id: number; message: string; type: 'success' | 'error' | 'info' }

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
          <motion.div key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: EASE }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border
                        text-sm font-medium backdrop-blur-sm pointer-events-auto
                        ${t.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : t.type === 'error'   ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                                               : 'bg-card border-border text-foreground'}`}
          >
            {t.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" />
           : t.type === 'error'   ? <AlertCircle  className="h-4 w-4 shrink-0" />
                                  : <Zap          className="h-4 w-4 shrink-0" />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ─── Shared input styles ────────────────────────── */
const inputCls = `w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm
                  text-foreground placeholder:text-muted-foreground/60
                  focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                  transition-all`

const labelCls = `block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5`

/* ─── Overview tab ───────────────────────────────── */
function OverviewTab({
  projects, userName, greeting, currentTime, contact, qrCode, onNavigate
}: {
  projects: Project[]
  userName: string
  greeting: string
  currentTime: string
  contact: Contact
  qrCode: string | null
  onNavigate: (tab: Tab) => void
}) {
  const totalViews    = projects.reduce((s, p) => s + (p.views || 0), 0)
  const totalLikes    = projects.reduce((s, p) => s + (p.likes || 0), 0)
  const featuredCount = projects.filter((p) => p.featured).length
  const liveCount     = projects.filter((p) => p.status === 'Live').length

  const recent = [...projects]
    .sort((a, b) => {
      const da = a.updatedAt?.toDate?.() ?? a.createdAt?.toDate?.() ?? new Date(0)
      const db = b.updatedAt?.toDate?.() ?? b.createdAt?.toDate?.() ?? new Date(0)
      return db.getTime() - da.getTime()
    })
    .slice(0, 4)

  const stats = [
    { icon: Folder,     label: 'Projects',    value: projects.length,             accent: 'text-primary',     bg: 'bg-primary/10'      },
    { icon: Eye,        label: 'Total views', value: totalViews.toLocaleString(), accent: 'text-emerald-500', bg: 'bg-emerald-500/10'  },
    { icon: Star,       label: 'Featured',    value: featuredCount,               accent: 'text-amber-500',   bg: 'bg-amber-500/10'    },
    { icon: TrendingUp, label: 'Live now',    value: liveCount,                   accent: 'text-rose-500',    bg: 'bg-rose-500/10'     },
  ]

  return (
    <div className="space-y-10">

      {/* Greeting row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold text-foreground">{greeting}</h2>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <Clock className="h-3.5 w-3.5" />
            {currentTime}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('add-project')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground
                     rounded-xl text-sm font-medium hover:bg-primary/90 transition-all
                     hover:shadow-lg hover:shadow-primary/25 active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" />
          Add project
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: EASE }}
              className="glass rounded-2xl p-5 hover:border-primary/30 transition-colors"
            >
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`h-4.5 w-4.5 ${s.accent}`} style={{ width: 18, height: 18 }} />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Quick actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Add project',     desc: 'Publish new work',          icon: Plus,    tab: 'add-project' as Tab, href: null          },
            { label: 'Edit profile',    desc: 'Update bio & info',          icon: User,    tab: null,                 href: '/profile'    },
            { label: 'View portfolio',  desc: 'See public-facing site',     icon: ExternalLink, tab: null,            href: '/'           },
          ].map((action) => {
            const Icon = action.icon
            const inner = (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0
                                         group-hover:text-primary transition-colors" />
              </div>
            )

            if (action.href) {
              return (
                <Link key={action.label} href={action.href}
                  className="group glass rounded-2xl p-4 hover:border-primary/30 transition-all
                             hover:shadow-lg hover:shadow-primary/5 block">
                  {inner}
                </Link>
              )
            }
            return (
              <button key={action.label} type="button" onClick={() => action.tab && onNavigate(action.tab)}
                className="group glass rounded-2xl p-4 hover:border-primary/30 transition-all
                           hover:shadow-lg hover:shadow-primary/5 text-left w-full">
                {inner}
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent projects + contact info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent projects — 2/3 width */}
        <div className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-foreground">Recent projects</h3>
            <Link href="/projects"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              See all <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-10">
              <Folder className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No projects yet.</p>
              <button type="button" onClick={() => onNavigate('add-project')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-medium
                           hover:bg-primary/90 transition-colors">
                Add your first project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, ease: EASE }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors group"
                >
                  {/* Thumbnail */}
                  <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden shrink-0">
                    {(p.imageUrl || p.image) ? (
                      <img
                        src={p.imageUrl || p.image}
                        alt={p.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Folder className="h-5 w-5 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.title || 'Untitled'}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {(p.views || 0).toLocaleString()}
                      </span>
                      {p.featured && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded-md font-medium">
                          Featured
                        </span>
                      )}
                      {p.status && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium
                          ${p.status === 'Live' ? 'bg-emerald-500/10 text-emerald-500'
                          : p.status === 'In Development' ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-primary/10 text-primary'}`}>
                          {p.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link href={`/projects/${p.id}`}
                    className="opacity-0 group-hover:opacity-100 transition-opacity
                               text-xs text-primary font-medium hover:underline shrink-0">
                    View
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Contact info — 1/3 width */}
        <div className="glass rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Contact
            </h3>
            <Link href="/profile"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Edit <Edit className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5 flex-1">
            {(['email', 'github', 'twitter', 'whatsapp'] as const).map((key) => (
              <div key={key} className="flex items-center justify-between gap-2
                                        py-2 px-3 rounded-xl bg-accent/60">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {key}
                </span>
                <span className="text-xs text-foreground truncate max-w-[140px] text-right">
                  {contact[key] || <span className="text-muted-foreground/50 italic">Not set</span>}
                </span>
              </div>
            ))}
          </div>

          {/* QR Code */}
          <div className="mt-5 pt-5 border-t border-border/50 text-center">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              QR Code
            </p>
            {qrCode ? (
              <img src={qrCode} alt="Contact QR" className="w-28 h-28 mx-auto rounded-xl object-contain" />
            ) : (
              <div className="w-28 h-28 mx-auto rounded-xl bg-muted flex items-center justify-center">
                <QrCode className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Add Project tab ────────────────────────────── */
function AddProjectTab({ onSuccess }: { onSuccess: () => void }) {
  const { toasts, push: toast } = useToast()

  const [title,        setTitle]        = useState('')
  const [summary,      setSummary]      = useState('')
  const [description,  setDescription]  = useState('')
  const [category,     setCategory]     = useState('web')
  const [status,       setStatus]       = useState('Live')
  const [featured,     setFeatured]     = useState(false)
  const [githubUrl,    setGithubUrl]    = useState('')
  const [liveUrl,      setLiveUrl]      = useState('')
  const [techInput,    setTechInput]    = useState('')
  const [tags,         setTags]         = useState<string[]>([])
  const [imageBase64,  setImageBase64]  = useState<string | null>(null)
  const [imageFile,    setImageFile]    = useState<File | null>(null)
  const [screenshots,    setScreenshots]    = useState<string[]>([])
  const [isSubmitting,   setIsSubmitting]   = useState(false)

  const fileInputRef       = useRef<HTMLInputElement>(null)
  const screenshotInputRef = useRef<HTMLInputElement>(null)

  /* Parse tech tags from input */
  const parsedTags = techInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast('Image must be under 2 MB', 'error')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImageBase64(reader.result as string)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageBase64(null)
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const MAX_SCREENSHOTS = 6

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = MAX_SCREENSHOTS - screenshots.length
    if (remaining <= 0) {
      toast(`Max ${MAX_SCREENSHOTS} screenshots allowed`, 'info')
      return
    }

    const toProcess = files.slice(0, remaining)
    const oversized = toProcess.filter((f) => f.size > 2 * 1024 * 1024)
    if (oversized.length) {
      toast(`${oversized.length} file(s) over 2 MB skipped`, 'error')
    }

    const valid = toProcess.filter((f) => f.size <= 2 * 1024 * 1024)
    let loaded = 0
    const results: string[] = []

    valid.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        results.push(reader.result as string)
        loaded++
        if (loaded === valid.length) {
          setScreenshots((prev) => [...prev, ...results])
        }
      }
      reader.readAsDataURL(file)
    })

    // Reset input so the same file can be re-added after removal
    if (screenshotInputRef.current) screenshotInputRef.current.value = ''
  }

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index))
  }

  const moveScreenshot = (from: number, to: number) => {
    if (to < 0 || to >= screenshots.length) return
    setScreenshots((prev) => {
      const next = [...prev]
      ;[next[from], next[to]] = [next[to], next[from]]
      return next
    })
  }

  const resetForm = () => {
    setTitle(''); setSummary(''); setDescription(''); setCategory('web')
    setStatus('Live'); setFeatured(false); setGithubUrl(''); setLiveUrl('')
    setTechInput(''); setScreenshots([]); removeImage()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) {
      toast('Access denied', 'error')
      return
    }

    setIsSubmitting(true)
    try {
      const technologies = techInput.split(',').map((t) => t.trim()).filter(Boolean)

      await addDoc(collection(db, 'projects'), {
        title,
        summary,
        description,
        category,
        status,
        featured,
        githubUrl:    githubUrl || null,
        liveUrl:      liveUrl   || null,
        technologies,
        tags:         technologies,   // store in both fields for compatibility
        // Store base64 in `image` for backward compat.
        // Also store as `imageUrl` so hero/cards pick it up consistently.
        image:        imageBase64 || null,
        imageUrl:     imageBase64 || null,
        screenshots:  screenshots.length > 0 ? screenshots : [],
        userId:       auth.currentUser.uid,
        likes:        0,
        views:        0,
        createdAt:    serverTimestamp(),
        updatedAt:    serverTimestamp(),
      })

      toast('Project published!', 'success')
      resetForm()
      setTimeout(() => onSuccess(), 1200)
    } catch (err: any) {
      toast('Failed to publish: ' + (err.message ?? 'Unknown error'), 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <ToastStack toasts={toasts} />

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">

        {/* ── Basic info ── */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Basic info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Title *</label>
              <input type="text" value={title} required
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bus Booking Platform"
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                <option value="web">Web Development</option>
                <option value="mobile">Mobile Development</option>
                <option value="fullstack">Full Stack</option>
                <option value="ai">AI & ML</option>
                <option value="design">Design</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
                <option value="Live">Live</option>
                <option value="In Development">In Development</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex items-end pb-0.5">
              {/* Featured toggle */}
              <button
                type="button"
                onClick={() => setFeatured((v) => !v)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium
                            transition-all w-full
                            ${featured
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                              : 'bg-card border-border text-muted-foreground hover:border-primary/30'}`}
              >
                <Star className={`h-4 w-4 ${featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                {featured ? 'Featured project ✓' : 'Mark as featured'}
              </button>
            </div>
          </div>
        </section>

        {/* ── Links & tech ── */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Links & tech stack
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className={labelCls}>
                <Github className="inline h-3.5 w-3.5 mr-1.5" />GitHub URL
              </label>
              <input type="url" value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>
                <Globe className="inline h-3.5 w-3.5 mr-1.5" />Live URL
              </label>
              <input type="url" value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>
              <Code className="inline h-3.5 w-3.5 mr-1.5" />Technologies (comma-separated)
            </label>
            <input type="text" value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              placeholder="React, Firebase, Tailwind, TypeScript"
              className={inputCls} />
            {parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {parsedTags.map((t) => (
                  <span key={t} className="px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] rounded-lg font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Content ── */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Content
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Short summary <span className="normal-case text-muted-foreground/60">(shown on cards)</span></label>
              <textarea value={summary} rows={2}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A one-liner for the project card…"
                className={inputCls + ' resize-none'} />
            </div>
            <div>
              <label className={labelCls}>Full description * <span className="normal-case text-muted-foreground/60">(shown on detail page)</span></label>
              <textarea value={description} rows={5} required
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what the project does, who it's for, and what makes it interesting…"
                className={inputCls + ' resize-none'} />
            </div>
          </div>
        </section>

        {/* ── Cover image ── */}
        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Cover image <span className="normal-case font-normal text-muted-foreground/60 ml-1">— max 2 MB, stored as base64</span>
          </h3>

          {!imageBase64 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/40 rounded-2xl
                         p-10 text-center cursor-pointer transition-colors group bg-accent/30"
            >
              <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center
                              mx-auto mb-3 group-hover:scale-105 transition-transform shadow-sm">
                <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-muted-foreground">
                Click to upload <span className="text-foreground font-medium">cover image</span>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WebP · Max 2 MB</p>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-border group">
              <img src={imageBase64} alt="Preview"
                className="w-full h-56 object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                              transition-opacity flex items-center justify-center">
                <button type="button" onClick={removeImage}
                  className="p-2.5 bg-rose-500/80 hover:bg-rose-500 text-white rounded-full transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          <input type="file" ref={fileInputRef} accept="image/*"
            onChange={handleImageChange} className="hidden" />
        </section>

        {/* ── Screenshots / Gallery ── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Screenshots
                <span className="normal-case font-normal text-muted-foreground/60 ml-1">
                  — up to {MAX_SCREENSHOTS}, shown in the project detail gallery
                </span>
              </h3>
            </div>
            {screenshots.length < MAX_SCREENSHOTS && (
              <button
                type="button"
                onClick={() => screenshotInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-card border border-border
                           rounded-xl text-xs font-medium text-muted-foreground
                           hover:text-foreground hover:border-primary/30 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                Add images
                <span className="text-muted-foreground/50">
                  ({screenshots.length}/{MAX_SCREENSHOTS})
                </span>
              </button>
            )}
          </div>

          {/* Empty state */}
          {screenshots.length === 0 && (
            <div
              onClick={() => screenshotInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/40 rounded-2xl
                         p-8 text-center cursor-pointer transition-colors group bg-accent/30"
            >
              <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center
                              mx-auto mb-3 group-hover:scale-105 transition-transform shadow-sm">
                <Upload className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm text-muted-foreground">
                Click to add <span className="text-foreground font-medium">project screenshots</span>
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                PNG, JPG, WebP · Max 2 MB each · Up to {MAX_SCREENSHOTS} images
              </p>
            </div>
          )}

          {/* Screenshot grid */}
          {screenshots.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {screenshots.map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  className="relative group rounded-xl overflow-hidden border border-border
                             aspect-video bg-muted"
                >
                  <img
                    src={src}
                    alt={`Screenshot ${i + 1}`}
                    className="w-full h-full object-cover"
                  />

                  {/* Index badge */}
                  <div className="absolute top-2 left-2 w-5 h-5 bg-black/50 backdrop-blur-sm
                                  rounded-full flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{i + 1}</span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100
                                  transition-opacity flex flex-col items-center justify-center gap-2">
                    {/* Reorder buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => moveScreenshot(i, i - 1)}
                        disabled={i === 0}
                        className="px-2 py-1 bg-white/20 hover:bg-white/30 disabled:opacity-30
                                   text-white text-[10px] font-bold rounded-lg transition-colors
                                   disabled:cursor-not-allowed"
                        title="Move left"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => removeScreenshot(i)}
                        className="p-1.5 bg-rose-500/80 hover:bg-rose-500 text-white
                                   rounded-lg transition-colors"
                        title="Remove"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveScreenshot(i, i + 1)}
                        disabled={i === screenshots.length - 1}
                        className="px-2 py-1 bg-white/20 hover:bg-white/30 disabled:opacity-30
                                   text-white text-[10px] font-bold rounded-lg transition-colors
                                   disabled:cursor-not-allowed"
                        title="Move right"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Add more tile — shown inline when slots remain */}
              {screenshots.length < MAX_SCREENSHOTS && (
                <button
                  type="button"
                  onClick={() => screenshotInputRef.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-border
                             hover:border-primary/40 bg-accent/30 flex flex-col items-center
                             justify-center gap-2 text-muted-foreground hover:text-foreground
                             transition-all group cursor-pointer"
                >
                  <Plus className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-medium">
                    {MAX_SCREENSHOTS - screenshots.length} left
                  </span>
                </button>
              )}
            </div>
          )}

          {/* Firestore size warning when many large images added */}
          {screenshots.length >= 3 && (
            <p className="text-[11px] text-amber-500 dark:text-amber-400 mt-3 flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {screenshots.length} images stored as base64 — keep each under 500 KB for
              best Firestore performance.
            </p>
          )}

          {/* Hidden multi-file input */}
          <input
            type="file"
            ref={screenshotInputRef}
            accept="image/*"
            multiple
            onChange={handleScreenshotsChange}
            className="hidden"
          />
        </section>

        {/* ── Submit ── */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-semibold
                       text-sm hover:bg-primary/90 transition-all hover:shadow-xl
                       hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-60
                       disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Publishing…</>
            ) : (
              <><Plus className="h-4 w-4" /> Publish project</>
            )}
          </button>
        </div>
      </form>
    </>
  )
}

/* ─── Main page ──────────────────────────────────── */
export default function AdminDashboard() {
  const router = useRouter()
  const { toasts, push: toast } = useToast()

  const [tab,         setTab]         = useState<Tab>('overview')
  const [pageLoading, setPageLoading] = useState(true)
  const [projects,    setProjects]    = useState<Project[]>([])
  const [userName,    setUserName]    = useState('Mellow')
  const [greeting,    setGreeting]    = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [contact,     setContact]     = useState<Contact>({ email: '', twitter: '', github: '', whatsapp: '' })
  const [qrCode,      setQrCode]      = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) { router.push('/login'); return }
      if (user.uid !== ADMIN_UID) { router.push('/'); return }

      try {
        // User profile
        const userDoc = await getDoc(doc(db, 'users', ADMIN_UID))
        let name = 'Mellow'
        if (userDoc.exists()) {
          const d = userDoc.data()
          name = d?.name || 'Mellow'
          setUserName(name)
          setContact({
            email:    d?.contact?.email    || user.email || '',
            twitter:  d?.contact?.twitter  || '',
            github:   d?.contact?.github   || '',
            whatsapp: d?.contact?.whatsapp || '',
          })
          setQrCode(d?.qrCode || null)
        }

        // Projects
        const snap = await getDocs(collection(db, 'projects'))
        setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project)))

        // Greeting + time
        const now  = new Date()
        const hour = now.getHours()
        setGreeting(`${hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'}, ${name}`)
        setCurrentTime(now.toLocaleString('en-GB', {
          timeZone: 'Africa/Blantyre',
          weekday: 'short', day: '2-digit', month: 'short',
          year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
        }))

        // Log visit (non-blocking)
        setDoc(doc(db, 'admin_logs', `${user.uid}_${Date.now()}`),
          { action: 'view_dashboard', timestamp: new Date() }, { merge: true }
        ).catch(() => {})

      } catch (err: any) {
        toast('Failed to load dashboard data', 'error')
      } finally {
        setPageLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  /* After a project is added, refresh and switch back to overview */
  const handleProjectAdded = async () => {
    const snap = await getDocs(collection(db, 'projects'))
    setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project)))
    setTab('overview')
  }

  /* ── Loading ── */
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent
                          animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    )
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
    { id: 'add-project', label: 'Add project', icon: Plus            },
  ]

  return (
    <>
      <ToastStack toasts={toasts} />

      <div className="min-h-screen animated-gradient pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Page header ── */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4
                            bg-primary/10 text-primary rounded-full text-xs font-medium
                            border border-primary/20">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Admin dashboard
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
              {tab === 'overview' ? 'Overview' : 'Add project'}
            </h1>
          </div>

          {/* ── Tab bar ── */}
          <div className="flex gap-1 p-1 bg-card border border-border rounded-2xl
                          w-fit mb-10 shadow-sm">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                            text-sm font-medium transition-all duration-200
                            ${tab === id
                              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                              : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              {tab === 'overview' ? (
                <OverviewTab
                  projects={projects}
                  userName={userName}
                  greeting={greeting}
                  currentTime={currentTime}
                  contact={contact}
                  qrCode={qrCode}
                  onNavigate={setTab}
                />
              ) : (
                <AddProjectTab onSuccess={handleProjectAdded} />
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </>
  )
}