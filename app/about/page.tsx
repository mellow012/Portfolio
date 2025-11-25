'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, collection, getDocs, QuerySnapshot, DocumentData } from 'firebase/firestore'
import { db } from '../../lib/firebaseConfig'
import { motion } from 'framer-motion'
import { Award, Heart, Target, Users, Code, Server, Cloud, User, Download, Briefcase, GraduationCap, Star, Coffee } from 'lucide-react'
import Image from 'next/image'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const stats = [
  { icon: Users, label: 'Happy Clients', value: '15+', color: 'text-purple-500' },
  { icon: Award, label: 'Years Experience', value: '5+', color: 'text-blue-500' },
  { icon: Code, label: 'Projects Completed', value: '10+', color: 'text-green-500' },
  { icon: Heart, label: 'Technologies Mastered', value: '5+', color: 'text-red-500' }
]

const values = [
  {
    icon: Target,
    title: 'Mission',
    description: 'To create innovative digital solutions that solve real-world problems and enhance user experiences through cutting-edge technology and thoughtful design.'
  },
  {
    icon: Heart,
    title: 'Vision',
    description: 'To be a leading force in the digital transformation landscape, empowering businesses and individuals through technology that makes a meaningful impact.'
  },
  {
    icon: Users,
    title: 'Values',
    description: 'Collaboration, innovation, quality, and continuous learning. I believe in building lasting relationships and delivering excellence in every project.'
  },
  {
    icon: Award,
    title: 'Excellence',
    description: 'Committed to delivering high-quality solutions that exceed expectations, with attention to detail and a focus on performance and scalability.'
  }
]

interface Qualification {
  id: string
  title: string
  institution: string
  year: string
  type?: 'education' | 'certification' | 'award'
}

interface Experience {
  id: string
  title: string
  company: string
  period: string
  description?: string
}

interface Skill {
  id: string
  name: string
  category: string
  proficiency: number
}

interface FunFact {
  id: string
  text: string
  icon?: string
}

interface ProfileData {
  profileImage: string | null
  bio: string
  name: string
  title: string
  location: string
  resumeUrl?: string
}

export default function AboutMePage() {
  const [profile, setProfile] = useState<ProfileData>({
    profileImage: null,
    bio: 'Passionate full-stack developer crafting digital experiences.',
    name: 'Mellow',
    title: 'Full Stack Developer',
    location: 'Malawi'
  })
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [funFacts, setFunFacts] = useState<FunFact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const ADMIN_UID = 'uQxNQHVIbNhm7hNHl8bnwH2Xc322'

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError('')
      
      try {
        // Fetch profile data
        const userDoc = await getDoc(doc(db, 'users', ADMIN_UID))
        if (userDoc.exists()) {
          const data = userDoc.data()
          setProfile({
            profileImage: data.profileImage || null,
            bio: data.bio || 'Passionate full-stack developer crafting digital experiences.',
            name: data.name || 'Mellow',
            title: data.title || 'Full Stack Developer',
            location: data.location || 'Malawi',
            resumeUrl: data.resumeUrl || undefined
          })
        }

        // Fetch qualifications
        try {
          const qualificationsSnapshot = await getDocs(collection(db, 'users', ADMIN_UID, 'qualifications'))
          setQualifications(
            qualificationsSnapshot.docs.map(doc => ({
              id: doc.id,
              title: doc.data().title || '',
              institution: doc.data().institution || '',
              year: doc.data().year || '',
              type: doc.data().type || 'education'
            }))
          )
        } catch (err) {
          console.warn('No qualifications found:', err)
          setQualifications([])
        }

        // Fetch work experience
        try {
          const experiencesSnapshot = await getDocs(collection(db, 'users', ADMIN_UID, 'experiences'))
          setExperiences(
            experiencesSnapshot.docs.map(doc => ({
              id: doc.id,
              title: doc.data().title || '',
              company: doc.data().company || '',
              period: doc.data().period || '',
              description: doc.data().description || ''
            }))
          )
        } catch (err) {
          console.warn('No experiences found:', err)
          setExperiences([])
        }

        // Fetch skills
        try {
          const skillsSnapshot = await getDocs(collection(db, 'users', ADMIN_UID, 'skills'))
          setSkills(
            skillsSnapshot.docs.map(doc => ({
              id: doc.id,
              name: doc.data().name || '',
              category: doc.data().category || 'Other',
              proficiency: doc.data().proficiency || 50
            }))
          )
        } catch (err) {
          console.warn('No skills found:', err)
          setSkills([])
        }

        // Fetch fun facts
        try {
          const funFactsSnapshot = await getDocs(collection(db, 'users', ADMIN_UID, 'funFacts'))
          setFunFacts(
            funFactsSnapshot.docs.map(doc => ({
              id: doc.id,
              text: doc.data().text || '',
              icon: doc.data().icon || 'coffee'
            }))
          )
        } catch (err) {
          console.warn('No fun facts found:', err)
          setFunFacts([])
        }

      } catch (error) {
        console.error('AboutMePage: Fetch error:', error)
        setError('Failed to load profile data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
              <p className="text-lg text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 py-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 py-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-4 py-2 bg-rose-500/10 text-rose-500 rounded-full text-sm font-medium mb-6"
          >
            <Code className="h-4 w-4 mr-2" />
            Get to Know Me
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            About <span className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">{profile.name}</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            {profile.bio} 😎
          </motion.p>
        </motion.div>

        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 sm:p-12">
            <div className="flex flex-col sm:flex-row items-center mb-8">
              {profile.profileImage ? (
                <div className="relative w-32 h-32 mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                  <Image
                    src={profile.profileImage}
                    alt={`${profile.name}'s profile`}
                    fill
                    className="rounded-full object-cover border-4 border-border shadow-lg"
                    sizes="128px"
                    priority
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                  <User className="h-16 w-16 text-white" />
                </div>
              )}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-3xl font-bold text-foreground">{profile.name}'s Story</h2>
                <p className="text-lg text-rose-600 dark:text-rose-400 mt-1">{profile.title}</p>
                <p className="text-muted-foreground mt-2">📍 {profile.location}</p>
                {profile.resumeUrl && (
                  <a
                    href={profile.resumeUrl}
                    download
                    className="inline-flex items-center mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </a>
                )}
              </div>
            </div>

            {/* Qualifications */}
            {qualifications.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground mb-4">Education & Certifications</h3>
                {qualifications.map((qual) => (
                  <motion.div
                    key={qual.id}
                    variants={itemVariants}
                    className="group bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex flex-row items-center space-x-4"
                  >
                    <div className="h-12 w-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      {qual.type === 'certification' ? (
                        <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      ) : (
                        <GraduationCap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-foreground">{qual.title}</p>
                      <p className="text-muted-foreground">{qual.institution}</p>
                      <p className="text-sm text-muted-foreground">{qual.year}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* Work Experience */}
        {experiences.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Work Experience</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">My professional journey. 💼</p>
            </div>
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start">
                    <div className="h-12 w-12 bg-rose-50 dark:bg-rose-900/20 rounded-xl flex items-center justify-center flex-shrink-0 mr-4">
                      <Briefcase className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground">{exp.title}</h3>
                      <p className="text-rose-600 dark:text-rose-400 font-medium">{exp.company}</p>
                      <p className="text-sm text-muted-foreground mb-2">{exp.period}</p>
                      {exp.description && (
                        <p className="text-muted-foreground">{exp.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Skills Section */}
        {skills.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Technical Skills</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">My tech stack proficiency. 🛠️</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold text-foreground">{skill.name}</span>
                    <span className="text-sm text-muted-foreground">{skill.proficiency}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.proficiency}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-rose-500 to-purple-600 rounded-full"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{skill.category}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Stats Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">By the Numbers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">A snapshot of my journey. 📊</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Mission, Vision & Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">The principles that guide my work. 💡</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-rose-500/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Fun Facts Section */}
        {funFacts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Fun Facts About Me</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Beyond the code. ☕</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {funFacts.map((fact, index) => (
                <motion.div
                  key={fact.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="p-6 bg-gradient-to-br from-rose-50 to-purple-50 dark:from-rose-900/20 dark:to-purple-900/20 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
                >
                  <Coffee className="h-8 w-8 text-rose-500 mb-3" />
                  <p className="text-foreground">{fact.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Core Competencies */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Core Competencies</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Areas where I shine. 🌟</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Code, title: 'Frontend Development', description: 'Crafting responsive, accessible, and performant UIs with modern frameworks.' },
              { icon: Server, title: 'Backend Development', description: 'Building scalable APIs and server-side apps with security and performance in mind.' },
              { icon: Cloud, title: 'DevOps & Deployment', description: 'Implementing CI/CD pipelines and cloud infrastructure for reliable deployments.' }
            ].map((skill, index) => (
              <motion.div
                key={skill.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-rose-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <skill.icon className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{skill.title}</h3>
                <p className="text-muted-foreground">{skill.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}