'use client'

import React, { useState, useEffect } from 'react'
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../lib/firebaseConfig'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Phone, MapPin, Send, Github, Linkedin, Twitter, 
  MessageCircle, CheckCircle, QrCode, Heart, AlertCircle, Loader2, LucideIcon 
} from 'lucide-react'

// --- Types ---
interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  timeline: string;
}

interface ContactInfo {
  icon: LucideIcon;
  title: string;
  value: string;
  href: string;
  description: string;
  color: string;
}

interface SocialLink {
  name: string;
  href: string;
  icon: LucideIcon;
  color: string;
  followers: string;
}

// --- Animations ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function ContactPage() {
  // 1. State Management
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    timeline: ''
  })
  
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([
    {
      icon: Mail,
      title: 'Email',
      value: 'QuantumByteslab012@gmail.com',
      href: 'mailto:QuantumByteslab012@gmail.com',
      description: 'Drop me a line anytime 📧',
      color: 'bg-blue-500/10 text-blue-500'
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+265991457495',
      href: 'tel:+265991457495',
      description: 'Available 9 AM - 6 PM CAT',
      color: 'bg-green-500/10 text-green-500'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: 'Chat on WhatsApp',
      href: 'https://wa.me/+265991457495',
      description: 'Quick responses 💬',
      color: 'bg-green-600/10 text-green-600'
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'Mzuzu, Malawi',
      href: 'https://maps.google.com/?q=Mzuzu,Malawi',
      description: 'Open to remote work 🌍',
      color: 'bg-purple-500/10 text-purple-500'
    }
  ])

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    {
      name: 'GitHub',
      href: 'https://github.com/mellow012',
      icon: Github,
      color: 'hover:bg-gray-900 hover:text-white',
      followers: '1.2K'
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/in/wisdomMlambia',
      icon: Linkedin,
      color: 'hover:bg-blue-600 hover:text-white',
      followers: '850'
    },
    {
      name: 'Twitter',
      href: 'https://twitter.com',
      icon: Twitter,
      color: 'hover:bg-sky-500 hover:text-white',
      followers: '620'
    }
  ])

  const [status, setStatus] = useState({ loading: false, success: false, error: '' })
  
  // FIXED: Explicitly allow number or null
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  // 2. Data Fetching
  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID
        if (!adminUid) throw new Error("Admin UID not configured")

        const userDoc = await getDoc(doc(db, 'users', adminUid))
        
        if (userDoc.exists()) {
          const data = userDoc.data()
          const contact = data.contact || {}

          setContactInfo(prev => prev.map(info => {
            if (info.title === 'Email' && contact.email) return { ...info, value: contact.email, href: `mailto:${contact.email}` }
            if (info.title === 'WhatsApp' && contact.whatsapp) return { ...info, href: `https://wa.me/${contact.whatsapp}` }
            return info
          }))

          setSocialLinks(prev => prev.map(social => {
            if (social.name === 'Twitter' && contact.twitter) return { ...social, href: contact.twitter }
            if (social.name === 'GitHub' && contact.github) return { ...social, href: contact.github }
            if (social.name === 'LinkedIn' && contact.linkedin) return { ...social, href: contact.linkedin }
            return social
          }))
        }
      } catch (err) {
        console.warn('Using default contact info. Firebase fetch failed:', err)
      } finally {
        setPageLoading(false)
      }
    }
    fetchContactData()
  }, [])

  // FIXED: Added event type for inputs, textareas, and selects
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (status.error) setStatus({ ...status, error: '' })
  }

  // FIXED: Added event type for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ loading: true, success: false, error: '' })

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
        setStatus({ loading: false, success: false, error: 'Please enter a valid email address.' })
        return
    }

    try {
      await addDoc(collection(db, 'contact_submissions'), {
        ...formData,
        createdAt: serverTimestamp(),
        platform: 'portfolio-web',
        status: 'new'
      })

      setStatus({ loading: false, success: true, error: '' })
      
      setTimeout(() => {
        setFormData({ name: '', email: '', subject: '', message: '', timeline: '' })
        setStatus(prev => ({ ...prev, success: false }))
      }, 5000)

    } catch (error) {
      console.error('Submission Error:', error)
      setStatus({ 
        loading: false, 
        success: false, 
        error: 'Something went wrong. Please try emailing me directly.' 
      })
    }
  }

  // FIXED: Added type for props
  const QRCodePlaceholder = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center bg-gray-50 dark:bg-gray-700 aspect-square ${className}`}>
      <div className="text-center p-4">
        <QrCode className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <div className="text-xs text-gray-500 font-mono">Scan for WhatsApp</div>
      </div>
    </div>
  )

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-20 flex items-center justify-center">
         <Loader2 className="h-10 w-10 text-rose-500 animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-purple-50/50 dark:from-rose-950/10 dark:to-purple-950/10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div variants={itemVariants} className="text-center mb-12">
          <span className="inline-flex items-center px-4 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-sm font-medium mb-6">
            <MessageCircle className="h-4 w-4 mr-2" />
            Let's Connect
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-purple-600">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have a project idea? Let's make something awesome happen! 🚀
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* --- MODIFIED COMPACT FORM --- */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-6 sm:p-8 h-fit">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
                <Send className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send a Message</h2>
            </div>

            <AnimatePresence mode="wait">
              {status.success ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                  <p className="text-gray-600 dark:text-gray-400">I'll get back to you within 24 hours. 📧</p>
                </motion.div>
              ) : (
                <motion.form 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="space-y-4" // Reduced spacing from 5 to 4
                >
                  {status.error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {status.error}
                    </div>
                  )}

                  {/* ROW 1: Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all dark:text-white"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all dark:text-white"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* ROW 2: Subject & Timeline (Merged to save height) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject *</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all dark:text-white"
                        placeholder="Project Inquiry"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="timeline" className="text-sm font-medium text-gray-700 dark:text-gray-300">Timeline</label>
                      <select
                        id="timeline"
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all dark:text-white"
                      >
                        <option value="">Select timeline</option>
                        <option value="asap">ASAP</option>
                        <option value="1-month">Within 1 month</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  {/* ROW 3: Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={4} // Reduced from 5 to 4
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent outline-none transition-all resize-none dark:text-white"
                      placeholder="Tell me about your project..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status.loading}
                    className="w-full flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-rose-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-rose-500/25 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {status.loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column: Info */}
          <div className="space-y-6">
            <motion.div variants={itemVariants} className="grid gap-5">
              {contactInfo.map((info) => {
                const Icon = info.icon
                return (
                  <a
                    key={info.title}
                    href={info.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-rose-200 dark:hover:border-rose-900 transition-colors shadow-sm hover:shadow-md"
                  >
                    <div className={`p-3 rounded-xl mr-4 ${info.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-rose-600 transition-colors">{info.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 font-medium mb-1 break-all">{info.value}</p>
                      <p className="text-sm text-gray-500">{info.description}</p>
                    </div>
                  </a>
                )
              })}
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <QrCode className="h-5 w-5 text-rose-500 mr-2" />
                  Connect
                </h3>
                <QRCodePlaceholder className="rounded-lg" />
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Heart className="h-5 w-5 text-rose-500 mr-2" />
                  Socials
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800 transition-all hover:scale-105 ${social.color}`}
                        aria-label={`Visit ${social.name}`}
                      >
                        <Icon className="h-5 w-5 mb-2" />
                        <span className="text-[10px] font-medium">{social.name}</span>
                      </a>
                    )
                  })}
                </div>
              </motion.div>
            </div>
            
            <motion.div variants={itemVariants} className="mt-8">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">FAQ</h3>
               <div className="space-y-3">
                  {[
                    { q: "What's your typical timeline?", a: "Simple sites take 2-4 weeks, complex apps 2-6 months." },
                    { q: "Do you include hosting?", a: "I help set it up, but hosting costs are usually covered by the client." }
                  ].map((faq, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        className="w-full px-5 py-3 text-left font-medium text-gray-900 dark:text-white flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {faq.q}
                        <span className={`transform transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}>▼</span>
                      </button>
                      <AnimatePresence>
                        {expandedFaq === i && (
                          <motion.div 
                            initial={{ height: 0 }} 
                            animate={{ height: "auto" }} 
                            exit={{ height: 0 }} 
                            className="overflow-hidden"
                          >
                            <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
               </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}