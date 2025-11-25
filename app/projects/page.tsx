'use client'

import { useState, useEffect } from 'react'
import { getFirestore, collection, getDocs, updateDoc, doc, increment, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { getAuth, onAuthStateChanged, User } from 'firebase/auth'
import { motion } from 'framer-motion'
import {
  Heart,
  Github,
  ExternalLink,
  Code,
  Smartphone,
  Palette,
  Globe,
  Database,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
  Eye,
  Calendar,
  Users,
  Zap,
  Award,
  TrendingUp,
  Edit,
  Trash2,
  Filter,
  Search,
  Mail,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const categories = [
  { id: 'all', name: 'All Projects', icon: Globe },
  { id: 'web', name: 'Web Development', icon: Code },
  { id: 'mobile', name: 'Mobile Development', icon: Smartphone },
  { id: 'design', name: 'Design', icon: Palette },
  { id: 'ai', name: 'AI & ML', icon: Zap },
  { id: 'fullstack', name: 'Full Stack', icon: Database },
]

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
  createdAt?: any // firebase Timestamp
  featured?: boolean
  category?: string
  screenshots?: string[]
  screenshotDescriptions?: string[]
  url?: string
  techDetails?: string
}

interface ProjectCardProps {
  project: Project
  isLiked: boolean
  onLike: (id: string) => void
  onView: (id: string) => void
  compact?: boolean
  isAdmin?: boolean
  onDelete?: (id: string) => void
}

type FeaturedCarousel = {
  projects: Project[]
  likedProjects: string[]
  onLike: (id: string) => void
  onView: (id: string) => void
}

function ProjectCard({ project, isLiked, onLike, onView, compact = false, isAdmin, onDelete }: ProjectCardProps) {
  const getStatusColor = (status: Project['status'] = 'Live'): string => {
    switch (status) {
      case 'Live': return 'bg-green-500 text-white'
      case 'In Development': return 'bg-yellow-500 text-black'
      case 'Completed': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  // Prevents card click navigation when clicking on a button inside the card
  const handleActionClick = (e: React.MouseEvent, action?: () => void) => {
    e.stopPropagation();
    if (action) action();
  };

  return (
    <Link href={`/projects/${project.id}`} passHref>
      <motion.div
        variants={itemVariants}
        onClick={() => onView(project.id)}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 cursor-pointer group ${compact ? 'h-auto' : 'h-full'}`}
      >
        <div className="relative">
          <img
            src={project.image || '/placeholder.png'}
            alt={project.title}
            className={`w-full object-cover ${compact ? 'h-48' : 'h-64'}`}
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status || 'Live')}`}>
              {project.status || 'Live'}
            </span>
          </div>
          <div className="absolute top-4 right-4 flex space-x-2">
            <button
              onClick={(e) => handleActionClick(e, () => onLike(project.id))}
              className={`p-2 rounded-full backdrop-blur-sm transition-all hover:scale-110 ${
                isLiked ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-rose-500 transition-colors">
              {project.title}
            </h3>
            <div className="flex items-center space-x-3 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{(project.views || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{project.likes || 0}</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {(project.technologies || project.tags || []).slice(0, compact ? 3 : 5).map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-xs font-medium"
              >
                {tech}
              </span>
            ))}
            {(project.technologies || project.tags || []).length > (compact ? 3 : 5) && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs">
                +{(project.technologies || project.tags || []).length - (compact ? 3 : 5)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-auto pt-4">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>{project.createdAt ? new Date(project.createdAt.toDate()).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex space-x-2">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleActionClick(e)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors hover:scale-105"
                >
                  <Github className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </a>
              )}
              {/* The ExternalLink button is removed as the card is now the link */}
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end gap-2 mt-4 border-t dark:border-gray-700 pt-3">
              <motion.button
                onClick={(e) => handleActionClick(e, () => alert('Edit functionality TBD'))}
                className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Edit className="h-4 w-4" />
              </motion.button>
              <motion.button
                onClick={(e) => handleActionClick(e, () => onDelete && onDelete(project.id))}
                className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-800/20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}

function FeaturedCarousel({ projects, likedProjects, onLike, onView }: FeaturedCarousel) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (projects.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % projects.length)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [projects.length])

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % projects.length)
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)

  if (projects.length === 0) return null

  const currentProject = projects[currentIndex]

  return (
    <motion.div
      variants={itemVariants}
      className="relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl p-8 border border-blue-200 dark:border-blue-800 overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="relative">
          <img
            src={currentProject.image || '/placeholder.png'}
            alt={currentProject.title}
            className="w-full h-80 object-cover rounded-2xl shadow-lg"
          />
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
              Featured
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <Award className="h-8 w-8 text-yellow-500" />
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {currentProject.title}
            </h3>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {currentProject.summary || currentProject.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {(currentProject.technologies || currentProject.tags || []).map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>{(currentProject.views || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>{currentProject.likes || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>
                {currentProject.createdAt
                  ? new Date(currentProject.createdAt.toDate()).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onLike(currentProject.id)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-lg font-medium transition-all hover:scale-105 ${
                likedProjects.includes(currentProject.id)
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-red-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${likedProjects.includes(currentProject.id) ? 'fill-current' : ''}`} />
              <span>Like</span>
            </button>

            {currentProject.githubUrl && (
              <a
                href={currentProject.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-5 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all hover:scale-105"
              >
                <Github className="h-5 w-5" />
                <span>Code</span>
              </a>
            )}

            {currentProject.liveUrl && (
              <Link href={`/projects/${currentProject.id}`} passHref>
                <button
                  onClick={() => onView(currentProject.id)}
                  className="flex items-center space-x-2 px-5 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all hover:scale-105"
                >
                  <Play className="h-5 w-5" />
                  <span>View Project</span>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {projects.length > 1 && (
        <div className="flex items-center justify-between mt-12">
          <button
            onClick={prevSlide}
            className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full shadow-lg hover:scale-110 transition"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="flex space-x-2">
            {projects.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2 h-2 rounded-full transition ${
                  i === currentIndex ? 'bg-rose-500 w-8' : 'bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-full shadow-lg hover:scale-110 transition"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [likedProjects, setLikedProjects] = useState<string[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [page, setPage] = useState(1)
  const projectsPerPage = 6
  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID || 'fallback-uid-if-env-missing' // Updated to env var
  const db = getFirestore()
  const auth = getAuth()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // Load user's liked projects
        const loadLikedProjects = async () => {
          try {
            const userLikes = []
            const projectsSnapshot = await getDocs(collection(db, 'projects'))
            for (const projectDoc of projectsSnapshot.docs) {
              const likeDoc = await getDoc(doc(db, 'projects', projectDoc.id, 'likes', currentUser.uid))
              if (likeDoc.exists()) {
                userLikes.push(projectDoc.id)
              }
            }
            setLikedProjects(userLikes)
          } catch (error) {
            console.error('Error loading liked projects:', error)
          }
        }
        loadLikedProjects()
      }
    })

    const fetchProjects = async () => {
      setLoading(true)
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'))
        const projectsData: Project[] = querySnapshot.docs.map(docSnap => {
          const data = docSnap.data() as Project
          const { id: _id, ...rest } = data || {}
          return { id: docSnap.id, ...(rest as Omit<Project, 'id'>) }
        })
        setProjects(projectsData)
        setFilteredProjects(projectsData)
        setFeaturedProjects(projectsData.filter(project => Boolean(project.featured)))
      } catch (error) {
        console.error('ProjectsPage: Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let updatedProjects = projects
    if (activeCategory !== 'all') {
      updatedProjects = projects.filter(project => project.category === activeCategory)
    }
    if (searchQuery) {
      updatedProjects = updatedProjects.filter(project =>
        project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredProjects(updatedProjects.slice(0, page * projectsPerPage))
  }, [activeCategory, searchQuery, projects, page])

  const handleLike = async (projectId:string) => {
    if (!user) {
      alert('Please log in to like a project! 😎')
      return
    }
    try {
      const likeRef = doc(db, 'projects', projectId, 'likes', user.uid)
      const likeDoc = await getDoc(likeRef)
      const projectRef = doc(db, 'projects', projectId)

      if (likeDoc.exists()) {
        // Unlike
        await deleteDoc(likeRef)
        await updateDoc(projectRef, { likes: increment(-1) })
        setLikedProjects(prev => prev.filter(id => id !== projectId))
        setProjects(projects.map(project =>
          project.id === projectId ? { ...project, likes: (project.likes || 0) - 1 } : project
        ))
      } else {
        // Like
        await setDoc(likeRef, { userId: user.uid, timestamp: new Date() })
        await updateDoc(projectRef, { likes: increment(1) })
        setLikedProjects(prev => [...prev, projectId])
        setProjects(projects.map(project =>
          project.id === projectId ? { ...project, likes: (project.likes || 0) + 1 } : project
        ))
      }
    } catch (error) {
      console.error('Error liking/unliking project:', error)
    }
  }

  const handleView = async (projectId:string) => {
    try {
      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, { views: increment(1) })
      setProjects(projects.map(project =>
        project.id === projectId ? { ...project, views: (project.views || 0) + 1 } : project
      ))
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  const handleDelete = async (projectId: string): Promise<void> => {
    if (!user || user.uid !== ADMIN_UID) {
      alert('Access denied: Only the admin can delete projects.')
      return
    }
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projects', projectId))
        setProjects((prevProjects) => prevProjects.filter(project => project.id !== projectId))
        setFilteredProjects((prevFilteredProjects) => prevFilteredProjects.filter(project => project.id !== projectId))
        setFeaturedProjects((prevFeaturedProjects) => prevFeaturedProjects.filter(project => project.id !== projectId))
      } catch (error) {
        console.error('Error deleting project:', error)
      }
    }
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1)
  }

  // Update categories with dynamic counts
  const categoriesWithCounts = categories.map(category => ({
    ...category,
    count: category.id === 'all' ? projects.length : projects.filter(p => p.category === category.id).length
  }))

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen py-20 bg-gradient-warm dark:bg-gradient-warm-dark bg-[url('/pattern.png')] bg-opacity-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="mb-6">
            <Monitor className="h-16 w-16 text-rose-500 mx-auto mb-4" />
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            My <span className="text-rose-500">Projects</span> 🚀
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A showcase of my recent work, featuring applications built with modern technologies
            and best practices. Each project represents a unique challenge and learning experience. 🌟
          </p>
        </motion.div>

        {/* Featured Projects Carousel */}
        {featuredProjects.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <Star className="h-8 w-8 text-yellow-500" />
              <h2 className="text-3xl font-bold text-foreground">
                Featured Projects
              </h2>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
            <FeaturedCarousel
              projects={featuredProjects}
              likedProjects={likedProjects}
              onLike={handleLike}
              onView={handleView}
            />
          </section>
        )}

        {/* Search and Filter */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <select
              className="px-4 py-2 rounded-xl border border-border bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
            >
              {categoriesWithCounts.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex flex-wrap justify-center gap-4">
            {categoriesWithCounts.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all hover:scale-105 ${
                    activeCategory === category.id
                      ? 'bg-rose-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{category.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    activeCategory === category.id
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {category.count}
                  </span>
                </button>
              )
            })}
          </div>
        </motion.div>

        {/* Projects Grid */}
        <section className="mb-16">
          {loading ? (
            <div className="text-center text-lg text-muted-foreground">Loading projects...</div>
          ) : (
            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isLiked={likedProjects.includes(project.id)}
                  onLike={handleLike}
                  onView={handleView}
                  compact={true}
                  isAdmin={user?.uid === ADMIN_UID}
                  onDelete={handleDelete}
                />
              ))}
            </motion.div>
          )}

          {/* Load More Button */}
          {filteredProjects.length < projects.filter(p => activeCategory === 'all' || p.category === activeCategory).length && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mt-12"
            >
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center px-6 py-3 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all hover:scale-105"
              >
                Load More Projects
              </button>
            </motion.div>
          )}
        </section>

        {/* Stats Section */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <TrendingUp className="h-8 w-8 text-rose-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">{projects.length}</div>
              <div className="text-sm text-muted-foreground">Total Projects</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Eye className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {projects.reduce((sum, p) => sum + (p.views || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {projects.reduce((sum, p) => sum + (p.likes || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Likes</div>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">
                {projects.filter(p => p.featured).length}
              </div>
              <div className="text-sm text-muted-foreground">Featured Projects</div>
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section variants={itemVariants} className="mt-16">
          <div className="text-center bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-2xl p-12 border border-rose-200 dark:border-rose-800">
            <Zap className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Have a Project in Mind?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision. Let's build something amazing together!
            </p>
            <Link href="/contact">
              <motion.button
                className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 text-white rounded-xl shadow-lg hover:bg-rose-600 transition-all hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Let's Talk</span>
              </motion.button>
            </Link>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}