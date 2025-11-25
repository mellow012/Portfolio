'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebaseConfig'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Code, Rocket, Eye, Heart, Users, Award, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import ProjectCard from '../components/project-card'

const stats = [
  { icon: Users, label: 'Happy Clients', value: '15+', color: 'text-purple-500' },
  { icon: Award, label: 'Years Experience', value: '5+', color: 'text-blue-500' },
  { icon: Eye, label: 'Project Views', value: '10K+', color: 'text-green-500' },
  { icon: Heart, label: 'Total Likes', value: '500+', color: 'text-red-500' }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

interface Project {
  id: string
  title: string
  description: string
  imageUrl?: string
  image?: string
  category?: string
  tags?: string[]
  summary?: string
  featured?: boolean
  likes?: number
  views?: number
}

interface ProjectCardProps {
  id: string
  title: string
  description: string
  image: string
  category: string
  tags?: string[]
  summary?: string
  likes?: number
  views?: number
  featured?: boolean
  onLike: () => void
  onView: () => void
}

export default function HomePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [carouselProjects, setCarouselProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Handler functions for likes and views
  const handleLike = (projectId: string) => async () => {
    try {
      // TODO: Implement like functionality with Firestore
      // Example: increment likes count in Firestore
      console.log('Liked project:', projectId)
    } catch (error) {
      console.error('Error liking project:', error)
    }
  }

  const handleView = (projectId: string) => async () => {
    try {
      // TODO: Implement view tracking with Firestore
      // Example: increment views count in Firestore
      console.log('Viewed project:', projectId)
    } catch (error) {
      console.error('Error tracking view:', error)
    }
  }

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true)
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'))
        const projectsData = querySnapshot.docs
          .map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          } as Project))
          .filter(project => project.featured || (project.likes && project.likes > 100))
        
        setCarouselProjects(projectsData.slice(0, 5)) // Top 5 for carousel
        setFeaturedProjects(projectsData.slice(0, 2)) // Top 2 for featured section
      } catch (error) {
        console.error('Error fetching projects:', error)
        setCarouselProjects([])
        setFeaturedProjects([])
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || carouselProjects.length === 0) return
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselProjects.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isAutoPlaying, carouselProjects.length])

  const nextSlide = () => {
    if (carouselProjects.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % carouselProjects.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    if (carouselProjects.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + carouselProjects.length) % carouselProjects.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    if (carouselProjects.length === 0) return
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800">
      {/* Hero Section with Carousel */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800/25 bg-[size:20px_20px]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-blue-500/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* Header Text */}
            <div className="text-center mb-12">
              <motion.div variants={itemVariants} className="inline-flex items-center px-4 py-2 bg-blue-500/10 text-blue-600 rounded-full text-sm font-medium mb-6">
                <Code className="h-4 w-4 mr-2" />
                Welcome to My Portfolio
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Full Stack <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Developer</span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Crafting innovative web and mobile applications with modern technologies. Passionate about creating seamless user experiences and scalable solutions.
              </motion.p>
            </div>

            {/* Project Carousel */}
            {!loading && carouselProjects.length > 0 && (
              <motion.div 
                variants={itemVariants}
                className="relative max-w-5xl mx-auto mb-8"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                  {/* Carousel Container */}
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0"
                      >
                        {carouselProjects[currentSlide]?.imageUrl ? (
                          <Image
                            src={carouselProjects[currentSlide].imageUrl}
                            alt={carouselProjects[currentSlide]?.title || 'Project image'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                            priority={currentSlide === 0}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Code className="h-24 w-24 text-white/20" />
                          </div>
                        )}
                        
                        {/* Overlay with Project Info */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end">
                          <div className="p-8 text-white w-full">
                            <div className="max-w-2xl">
                              <h3 className="text-3xl font-bold mb-2">
                                {carouselProjects[currentSlide]?.title || 'Project Title'}
                              </h3>
                              <p className="text-gray-200 mb-4 line-clamp-2">
                                {carouselProjects[currentSlide]?.description || 'Project description goes here'}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-4">
                                {carouselProjects[currentSlide]?.tags?.slice(0, 4).map((tag: string) => (
                                  <span key={tag} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <Link 
                                href={`/projects/${carouselProjects[currentSlide]?.id}`}
                                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all"
                              >
                                View Project
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-all"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-6 w-6 text-white" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-all"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-6 w-6 text-white" />
                  </button>

                  {/* Dots Indicator */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {carouselProjects.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlide 
                            ? 'bg-white w-8' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/projects" className="group inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105">
                View All Work
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contact" className="inline-flex items-center px-8 py-4 border border-border rounded-lg bg-white dark:bg-gray-800 hover:bg-accent transition-all hover:scale-105">
                Get In Touch
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Featured Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A glimpse of my recent work, showcasing modern technologies and creative solutions.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
                <p className="text-lg text-muted-foreground">Loading projects...</p>
              </div>
            </div>
          ) : featuredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No featured projects found. Start by adding some projects!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredProjects.map((project, index) => {
                const projectCardProps: ProjectCardProps = {
                  id: project.id,
                  title: project.title,
                  description: project.description,
                  image: project.imageUrl || project.image || '/placeholder.png',
                  category: project.category || 'Development',
                  tags: project.tags || [],
                  summary: project.summary || project.description,
                  likes: project.likes || 0,
                  views: project.views || 0,
                  featured: project.featured,
                  onLike: handleLike(project.id),
                  onView: handleView(project.id)
                }
                
                return (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <ProjectCard {...projectCardProps} />
                  </motion.div>
                )
              })}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mt-12"
          >
            <Link href="/projects" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105">
              View All Projects
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">By the Numbers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A snapshot of my journey as a developer, from projects to happy clients.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-12 border border-blue-200 dark:border-blue-800"
          >
            <Rocket className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Ready to Start a Project?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Let's collaborate to bring your ideas to life with cutting-edge technology and exceptional design.
            </p>
            <Link href="/contact" className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all hover:scale-105">
              Start a Conversation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}