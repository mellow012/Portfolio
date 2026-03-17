'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation' // Added useRouter
import { getFirestore, doc, getDoc, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth' // Added User import
import { motion } from 'framer-motion'
import { Heart, Eye, ArrowRight, Edit, Trash2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

// Define Project type locally to avoid import issues (match your Firestore schema)
type Project = {
  id: string
  title?: string
  description?: string
  summary?: string
  image?: string
  status?: string
  views?: number
  likes?: number
  technologies?: string[]
  tags?: string[]
  githubUrl?: string
  liveUrl?: string
  createdAt?: any // Firebase Timestamp
  featured?: boolean
  category?: string
  screenshots?: string[]
  screenshotDescriptions?: string[]
  url?: string // Assuming this is liveUrl or similar
  techDetails?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const carouselVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
}

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>() // Ensure it's string
  const router = useRouter() // For redirect after delete
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [hasLiked, setHasLiked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0)
  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || 'fallback-uid-if-env-missing' // Updated to env var
  const db = getFirestore()
  const auth = getAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser && projectId) {
        // Check like status
        getDoc(doc(db, 'projects', projectId, 'likes', currentUser.uid))
          .then((likeDoc) => setHasLiked(likeDoc.exists()))
          .catch((err) => console.error('Error checking like:', err))
      }
      // Fetch project after user is known (avoids race for admin_logs)
      if (projectId) {
        fetchProject(currentUser)
      }
    })

    return () => unsubscribe()
  }, [projectId]) // Only re-run on projectId change

  const fetchProject = async (currentUser: User | null) => {
    setLoading(true)
    try {
      const projectDoc = await getDoc(doc(db, 'projects', projectId))
      if (projectDoc.exists()) {
        const projectData = { id: projectDoc.id, ...projectDoc.data() } as Project
        setProject(projectData)
        // Increment views
        await updateDoc(doc(db, 'projects', projectId), { views: increment(1) })
        // Log view with correct user (now that user is set)
        const logId = `${currentUser?.uid || 'anonymous'}_${Date.now()}`
        await setDoc(doc(db, 'admin_logs', logId), {
          action: 'view_project',
          projectId,
          timestamp: new Date()
        })
      } else {
        setError('Project not found.')
      }
    } catch (error) {
      console.error('ProjectDetailsPage: Error fetching project:', error)
      setError('Failed to load project.')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (!user) {
      alert('Please log in to like a project! 😎')
      return
    }
    if (!project) return // Extra guard

    try {
      const likeRef = doc(db, 'projects', projectId, 'likes', user.uid)
      const projectRef = doc(db, 'projects', projectId)
      const likeDoc = await getDoc(likeRef)

      if (likeDoc.exists()) {
        // Unlike
        await deleteDoc(likeRef)
        await updateDoc(projectRef, { likes: increment(-1) })
        setProject({ ...project, likes: (project.likes || 0) - 1 })
        setHasLiked(false)
        const logId = `${user.uid}_${Date.now()}`
        await setDoc(doc(db, 'admin_logs', logId), {
          action: 'unlike_project',
          projectId,
          timestamp: new Date()
        })
      } else {
        // Like
        await setDoc(likeRef, { userId: user.uid, timestamp: new Date() })
        await updateDoc(projectRef, { likes: increment(1) })
        setProject({ ...project, likes: (project.likes || 0) + 1 })
        setHasLiked(true)
        const logId = `${user.uid}_${Date.now()}`
        await setDoc(doc(db, 'admin_logs', logId), {
          action: 'like_project',
          projectId,
          timestamp: new Date()
        })
      }
    } catch (error) {
      console.error('ProjectDetailsPage: Error liking/unliking project:', error)
      setError('Failed to like/unlike project.')
    }
  }

  const handleDelete = async () => {
    if (!user || user.uid !== ADMIN_UID) {
      alert('Access denied: Only the admin can delete projects.')
      return
    }
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projects', projectId))
        const logId = `${user.uid}_${Date.now()}`
        await setDoc(doc(db, 'admin_logs', logId), {
          action: 'delete_project',
          projectId,
          timestamp: new Date()
        })
        router.push('/projects') // Use router for smooth redirect
      } catch (error) {
        console.error('ProjectDetailsPage: Error deleting project:', error)
        setError('Failed to delete project.')
      }
    }
  }

  const nextScreenshot = () => {
    const length = project?.screenshots?.length || 0
    if (length > 0) {
      setCurrentScreenshotIndex((prev) => (prev + 1) % length)
    }
  }

  const prevScreenshot = () => {
    const length = project?.screenshots?.length || 0
    if (length > 0) {
      setCurrentScreenshotIndex((prev) => (prev - 1 + length) % length)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-warm dark:bg-gradient-warm-dark bg-[url('/pattern.png')] bg-opacity-10 flex items-center justify-center">
        <div className="text-center text-lg text-muted-foreground">Loading project...</div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-warm dark:bg-gradient-warm-dark bg-[url('/pattern.png')] bg-opacity-10 flex items-center justify-center">
        <div className="text-center text-lg text-muted-foreground">{error || 'Project not found.'}</div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-warm dark:bg-gradient-warm-dark bg-[url('/pattern.png')] bg-opacity-10 py-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="mb-8">
          <Link href="/projects" className="inline-flex items-center text-foreground hover:text-rose-500">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Projects
          </Link>
        </motion.div>
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">{project.title || 'Untitled'}</h1>
          <img
            src={project.image || '/placeholder.png'}
            alt={project.title || 'Project Image'}
            className="w-full h-[60vh] sm:h-[70vh] object-cover rounded-2xl mb-6"
          />
          <div className="flex flex-wrap gap-2 mb-4">
            {project.category && (
              <span className="inline-flex items-center px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-sm">
                {project.category}
              </span>
            )}
            {(project.tags || []).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 ${hasLiked ? 'text-rose-500' : 'text-muted-foreground'} hover:text-rose-500`}
            >
              <Heart className={`h-5 w-5 ${hasLiked ? 'fill-rose-500' : ''}`} /> {project.likes || 0}
            </button>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Eye className="h-5 w-5" /> {project.views || 0}
            </span>
          </div>
          <p className="text-lg text-foreground mb-4">{project.description || 'No description available.'}</p>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Tech Stack</h2>
            <p className="text-muted-foreground">{project.techDetails || 'No additional tech details provided.'}</p>
          </div>
          {project.screenshots && project.screenshots.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-2">Screenshots</h2>
              <div className="relative">
                <motion.div
                  key={currentScreenshotIndex}
                  variants={carouselVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <img
                    src={project.screenshots[currentScreenshotIndex] || '/placeholder.png'}
                    alt={`Screenshot ${currentScreenshotIndex + 1}`}
                    className="w-full h-[60vh] sm:h-[70vh] object-cover rounded-2xl"
                  />
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    {project.screenshotDescriptions?.[currentScreenshotIndex] || `Screenshot ${currentScreenshotIndex + 1}`}
                  </p>
                </motion.div>
                {project.screenshots.length > 1 && (
                  <>
                    <button
                      onClick={prevScreenshot}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-rose-500/20 text-rose-500 rounded-full hover:bg-rose-500/30"
                      aria-label="Previous screenshot"
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </button>
                    <button
                      onClick={nextScreenshot}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-rose-500/20 text-rose-500 rounded-full hover:bg-rose-500/30"
                      aria-label="Next screenshot"
                    >
                      <ChevronRight className="h-8 w-8" />
                    </button>
                  </>
                )}
              </div>
              <div className="text-center text-sm text-muted-foreground mt-2">
                {currentScreenshotIndex + 1} / {project.screenshots.length}
              </div>
            </div>
          )}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all hover:scale-105"
            >
              Visit Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          )}
          {user?.uid === ADMIN_UID && (
            <div className="flex justify-end gap-2 mt-6">
              <motion.button
                onClick={() => alert('Edit functionality TBD')}
                className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit className="h-4 w-4" />
              </motion.button>
              <motion.button
                onClick={handleDelete}
                className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-800/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}