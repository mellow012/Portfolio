'use client'

import React, { useState, useEffect, useRef } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../../lib/firebaseConfig' // No storage import needed
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { User, Plus, Upload, X, Loader2, Github, Globe, Code, Star, Layout } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function Dashboard() {
  // --- Form State ---
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('') // Short text for cards
  const [description, setDescription] = useState('') // Long text for details
  const [category, setCategory] = useState('web')
  const [status, setStatus] = useState('Live') // Live, In Development, Completed
  const [featured, setFeatured] = useState(false)
  
  // Links
  const [githubUrl, setGithubUrl] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  
  // Tech Stack (Comma separated string -> Array)
  const [techInput, setTechInput] = useState('')

  // Image State (Base64)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  
  // UI State
  const [error, setError] = useState('')
  const [pageLoading, setPageLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID

  // 1. Auth Check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login')
      } else if (user.uid !== ADMIN_UID) {
        setError('Access denied: You are not authorized.')
        router.push('/')
      } else {
        setPageLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router, ADMIN_UID])

  // 2. Handle Image -> Base64 Conversion
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit (Strict for Base64)
        setError("Base64 images must be under 2MB to fit in Firestore")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImageBase64(reader.result as string)
        setError('')
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageBase64(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // 3. Submit Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) {
      setError('Access denied.')
      setIsSubmitting(false)
      return
    }

    try {
      // Parse technologies from comma-separated string
      const technologies = techInput.split(',').map(t => t.trim()).filter(t => t.length > 0)

      await addDoc(collection(db, 'projects'), {
        title,
        summary,
        description,
        category,
        status,
        featured,
        githubUrl,
        liveUrl, // Used for 'url' in your type
        technologies, // Matches your Display component
        image: imageBase64, // Storing the massive string directly
        userId: auth.currentUser.uid,
        likes: 0,
        views: 0,
        createdAt: serverTimestamp()
      })

      // Reset Form
      setTitle('')
      setSummary('')
      setDescription('')
      setCategory('web')
      setStatus('Live')
      setFeatured(false)
      setGithubUrl('')
      setLiveUrl('')
      setTechInput('')
      removeImage()
      
      router.push('/projects')
      
    } catch (err: any) {
      console.error(err)
      setError('Failed to add project: ' + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Project</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Upload to Firestore (Base64 Mode)</p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <Layout className="h-4 w-4 mr-2" /> 
            View All
          </Link>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} className="p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center">
             <X className="h-4 w-4 mr-2" /> {error}
          </motion.div>
        )}

        <motion.form variants={itemVariants} onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-8">
          
          {/* Section: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Basic Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="e.g. Neo-Portfolio"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all dark:text-white"
                >
                  <option value="web">Web Development</option>
                  <option value="mobile">Mobile Development</option>
                  <option value="design">Design</option>
                  <option value="ai">AI & ML</option>
                  <option value="fullstack">Full Stack</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all dark:text-white"
                >
                  <option value="Live">Live</option>
                  <option value="In Development">In Development</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center h-full pt-6">
                 <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${featured ? 'bg-rose-500 border-rose-500' : 'border-gray-300 dark:border-gray-600'}`}>
                        {featured && <Star className="h-4 w-4 text-white fill-current" />}
                    </div>
                    <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="hidden" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-rose-500 transition-colors">Mark as Featured Project</span>
                 </label>
              </div>
            </div>
          </div>

          {/* Section: Links & Tech */}
          <div className="space-y-4">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Details & Links</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <Github className="h-4 w-4 mr-2" /> GitHub URL
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all dark:text-white"
                      placeholder="https://github.com/..."
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        <Globe className="h-4 w-4 mr-2" /> Live URL
                    </label>
                    <input
                      type="url"
                      value={liveUrl}
                      onChange={(e) => setLiveUrl(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all dark:text-white"
                      placeholder="https://..."
                    />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                    <Code className="h-4 w-4 mr-2" /> Technologies (Comma separated)
                </label>
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all dark:text-white"
                  placeholder="React, Firebase, Tailwind CSS, TypeScript"
                />
                <p className="text-xs text-gray-500">These will appear as tags on the project card.</p>
             </div>
          </div>

          {/* Section: Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">Content</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Short Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all resize-none dark:text-white"
                rows={2}
                placeholder="A brief tagline for the featured card..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all resize-none dark:text-white"
                rows={5}
                placeholder="Detailed explanation of the project features and goals..."
                required
              />
            </div>
          </div>

          {/* Section: Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image</label>
            
            {!imageBase64 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-rose-500 dark:hover:border-rose-500 transition-colors group bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6 text-gray-400 group-hover:text-rose-500" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Click to upload cover image</p>
                <p className="text-xs text-gray-400 mt-1">Images converted to Base64 (Max 2MB)</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 group">
                <img src={imageBase64} alt="Preview" className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={removeImage}
                    className="p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-red-500 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="pt-4">
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-rose-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center font-bold text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving to Firestore...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Create Project
                </>
              )}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </motion.div>
  )
}