'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore'
import { auth, db } from '../../lib/firebaseConfig'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  User, BarChart2, Folder, Mail, FileText, QrCode, Edit, 
  TrendingUp, Eye, ArrowUpRight 
} from 'lucide-react'

// Use environment variable — safe & clean
const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID!

if (!ADMIN_UID) {
  throw new Error('Missing NEXT_PUBLIC_ADMIN_UID in .env.local')
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
}

interface Project {
  id: string
  title?: string
  description?: string
  image?: string
  views?: number
  updatedAt?: any
}

export default function Overview() {
  const [projects, setProjects] = useState<Project[]>([])
  const [projectCount, setProjectCount] = useState(0)
  const [totalViews, setTotalViews] = useState(0)
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [about, setAbout] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [contact, setContact] = useState({ email: '', twitter: '', github: '', whatsapp: '' })
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [userName, setUserName] = useState('Mellow')
  const [greeting, setGreeting] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login')
        return
      }

      if (user.uid !== ADMIN_UID) {
        setError('Access denied: Admin only')
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Fetch user profile
        const userDoc = await getDoc(doc(db, 'users', ADMIN_UID))
        let displayName = 'Mellow'

        if (userDoc.exists()) {
          const data = userDoc.data()
          displayName = data?.name || 'Mellow'

          setUserName(displayName)
          setAbout(data?.bio || '')
          setTechStack(data?.techStack || [])
          setContact({
            email: data?.contact?.email || user.email || '',
            twitter: data?.contact?.twitter || '',
            github: data?.contact?.github || '',
            whatsapp: data?.contact?.whatsapp || ''
          })
          setQrCode(data?.qrCode || null)
        }

        // Fetch projects
        const projectsSnap = await getDocs(collection(db, 'projects'))
        const projectsData = projectsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          updatedAt: doc.data()?.updatedAt || { toDate: () => new Date() }
        })) as Project[]

        setProjects(projectsData)
        setProjectCount(projectsData.length)
        setTotalViews(projectsData.reduce((sum, p) => sum + (p.views || 0), 0))

        const sorted = [...projectsData].sort((a, b) => {
          const dateA = a.updatedAt?.toDate?.() || new Date()
          const dateB = b.updatedAt?.toDate?.() || new Date()
          return dateB.getTime() - dateA.getTime()
        })
        setRecentProjects(sorted.slice(0, 3))

        // Greeting + Malawi Time
        const now = new Date()
        const hour = now.getHours()
        const greetingText = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
        setGreeting(`${greetingText}, ${displayName}!`)

        setCurrentTime(now.toLocaleString('en-GB', {
          timeZone: 'Africa/Blantyre',
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }))

        // Log visit
        await setDoc(doc(db, 'admin_logs', `${user.uid}_${Date.now()}`), {
          action: 'view_overview',
          timestamp: new Date()
        }, { merge: true })

      } catch (err: any) {
        console.error('Overview error:', err)
        setError('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 text-lg font-medium">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 py-8 sm:py-12 lg:py-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 sm:space-y-12">

          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              Portfolio Overview
            </h1>
            <div className="text-right text-muted-foreground">
              <p className="text-xl sm:text-2xl font-medium">{greeting}</p>
              <p className="text-sm sm:text-base">{currentTime}</p>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { label: 'Total Projects', value: projectCount, icon: BarChart2, color: 'blue' },
              { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'purple' },
              { label: 'Profile Status', value: about ? 'Complete' : 'Incomplete', icon: User, color: 'emerald', dot: about ? 'bg-green-500' : 'bg-yellow-500' },
              { label: 'Technologies', value: techStack.length, icon: FileText, color: 'orange', dot: techStack.length > 0 ? 'bg-green-500' : 'bg-gray-400' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                className="group bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`h-12 w-12 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                  </div>
                  {stat.dot && <div className={`h-3 w-3 rounded-full ${stat.dot}`}></div>}
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Manage Content', desc: 'Edit projects & settings', icon: Folder, href: '/dashboard' },
              { title: 'Update Profile', desc: 'Edit personal info', icon: User, href: '/profile' },
              { title: 'View Logs', desc: 'Check activity history', icon: FileText, href: '/logs' }
            ].map((action, i) => (
              <motion.button
                key={i}
                onClick={() => router.push(action.href)}
                className="group bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 hover:shadow-lg text-left transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-rose-500 to-purple-500 rounded-2xl flex items-center justify-center text-white">
                    <action.icon className="h-6 w-6" />
                  </div>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.desc}</p>
              </motion.button>
            ))}
          </motion.div>

          {/* Recent Projects + Contact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Projects */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Recent Projects</h2>
                <motion.button onClick={() => router.push('/dashboard')} className="text-primary hover:underline flex items-center gap-1">
                  View All <ArrowUpRight className="h-4 w-4" />
                </motion.button>
              </div>

              {recentProjects.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-foreground mb-2">No projects yet</p>
                  <button onClick={() => router.push('/dashboard')} className="px-6 py-3 bg-primary text-white rounded-xl hover:scale-105 transition">
                    Create First Project
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:shadow-md transition"
                    >
                      {p.image && <img src={p.image} alt={p.title} className="w-16 h-16 rounded-xl object-cover" />}
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{p.title || 'Untitled'}</h4>
                        <p className="text-sm text-muted-foreground">{p.views || 0} views</p>
                      </div>
                      <button onClick={() => router.push(`/projects/${p.id}`)} className="text-primary hover:underline text-sm">
                        View
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Contact + QR */}
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <Mail className="h-6 w-6 text-emerald-500" /> Contact Info
                </h2>
                <div className="space-y-3">
                  {['email', 'twitter', 'github', 'whatsapp'].map(key => (
                    <div key={key} className="flex justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <span className="text-sm text-muted-foreground capitalize">{key}</span>
                      <span className="text-sm text-foreground">{contact[key as keyof typeof contact] || 'Not set'}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => router.push('/dashboard')} className="w-full mt-6 px-6 py-3 bg-primary text-white rounded-xl hover:scale-105 transition flex items-center justify-center gap-2">
                  <Edit className="h-4 w-4" /> Update Contact
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8 text-center">
                <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-3">
                  <QrCode className="h-6 w-6 text-purple-500" /> Contact QR Code
                </h2>
                {qrCode ? (
                  <img src={qrCode} alt="QR Code" className="w-40 h-40 mx-auto rounded-xl shadow-lg" />
                ) : (
                  <div className="py-8 text-muted-foreground">
                    <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p>No QR code uploaded</p>
                  </div>
                )}
                <button onClick={() => router.push('/dashboard')} className="w-full mt-6 px-6 py-3 bg-primary text-white rounded-xl hover:scale-105 transition flex items-center justify-center gap-2">
                  <Edit className="h-4 w-4" /> Update QR
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}