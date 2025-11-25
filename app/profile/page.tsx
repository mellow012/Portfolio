'use client'

import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, writeBatch } from 'firebase/firestore'
import { auth, db } from '../../lib/firebaseConfig'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  User, MapPin, Mail, Phone, Globe, Link, QrCode, Edit, Save, Loader2, Trash2,
  GraduationCap, Briefcase, Code, Coffee, Download, ArrowUpRight
} from 'lucide-react'

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID!
if (!ADMIN_UID) throw new Error('Missing NEXT_PUBLIC_ADMIN_UID')

interface ProfileData {
  name: string
  bio: string
  title: string
  location: string
  profileImage: string | null
  resumeUrl?: string
  qrCode?: string
}

interface SocialLink { id: string; platform: string; url: string }
interface ContactDetail { id: string; type: string; value: string }
interface Qualification { id: string; title: string; institution: string; year: string; type?: string }
interface Experience { id: string; title: string; company: string; period: string; description?: string }
interface Skill { id: string; name: string; category: string; proficiency: number }
interface FunFact { id: string; text: string }

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [profile, setProfile] = useState<ProfileData>({
    name: '', bio: '', title: 'Full Stack Developer', location: 'Malawi',
    profileImage: null, resumeUrl: '', qrCode: ''
  })

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
  const [contactDetails, setContactDetails] = useState<ContactDetail[]>([])
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [funFacts, setFunFacts] = useState<FunFact[]>([])

  const inputClasses = "w-full px-5 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary transition"

  const fetchProfile = useCallback(async () => {
    if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) return

    try {
      setLoading(true)
      const userDoc = await getDoc(doc(db, 'users', ADMIN_UID))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setProfile({
          name: data.name || '',
          bio: data.bio || '',
          title: data.title || 'Full Stack Developer',
          location: data.location || 'Malawi',
          profileImage: data.profileImage || null,
          resumeUrl: data.resumeUrl || '',
          qrCode: data.qrCode || null
        })
      }

      const fetchCol = async (name: string) => {
        const snap = await getDocs(collection(db, 'users', ADMIN_UID, name))
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
      }

      const [socials, contacts, quals, exps, sks, facts] = await Promise.all([
        fetchCol('socialLinks'),
        fetchCol('contactDetails'),
        fetchCol('qualifications'),
        fetchCol('experiences'),
        fetchCol('skills'),
        fetchCol('funFacts')
      ])

      setSocialLinks(socials as SocialLink[])
      setContactDetails(contacts as ContactDetail[])
      setQualifications(quals as Qualification[])
      setExperiences(exps as Experience[])
      setSkills(sks as Skill[])
      setFunFacts(facts as FunFact[])

    } catch (err: any) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (!user) router.push('/login')
      else if (user.uid !== ADMIN_UID) setError('Access denied')
      else fetchProfile()
    })
    return () => unsub()
  }, [router, fetchProfile])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'qr') => {
    const file = e.target.files?.[0]
    if (!file || file.size > 3 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'profile') setProfile(p => ({ ...p, profileImage: reader.result as string }))
      else setProfile(p => ({ ...p, qrCode: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const saveAll = async () => {
    setSaving(true)
    const batch = writeBatch(db)

    try {
      batch.set(doc(db, 'users', ADMIN_UID), { ...profile, updatedAt: new Date() }, { merge: true })

      const save = (items: any[], col: string) => {
        items.forEach(item => batch.set(doc(db, 'users', ADMIN_UID, col, item.id), item, { merge: true }))
      }

      save(socialLinks, 'socialLinks')
      save(contactDetails, 'contactDetails')
      save(qualifications, 'qualifications')
      save(experiences, 'experiences')
      save(skills, 'skills')
      save(funFacts, 'funFacts')

      await batch.commit()
      setIsEditing(false)
      alert('Profile saved!')
    } catch (err: any) {
      setError('Save failed')
    } finally {
      setSaving(false)
    }
  }

  const addItem = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>, defaults: Partial<T>) => {
    setter(prev => [...prev, { id: Date.now().toString(), ...defaults } as T])
  }

  const updateItem = <T extends { id: string }>(list: T[], setter: React.Dispatch<React.SetStateAction<T[]>>, id: string, field: keyof T, value: any) => {
    setter(list.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const deleteItem = async (col: string, id: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
    await deleteDoc(doc(db, 'users', ADMIN_UID, col, id))
    setter(prev => prev.filter(x => x.id !== id))
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">{error}</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl flex items-center gap-3 hover:scale-105 transition font-bold shadow-lg"
          >
            <Edit className="h-5 w-5" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* DISPLAY MODE */}
        {!isEditing ? (
          <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 text-center sticky top-6">
                {profile.profileImage ? (
                  <Image src={profile.profileImage} alt="Profile" width={200} height={200} className="w-52 h-52 rounded-full object-cover mx-auto border-8 border-primary/20" />
                ) : (
                  <div className="w-52 h-52 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mx-auto flex items-center justify-center">
                    <User className="h-28 w-28 text-white" />
                  </div>
                )}
                <h2 className="text-4xl font-bold mt-8">{profile.name}</h2>
                <p className="text-2xl text-primary mt-2">{profile.title}</p>
                <p className="text-lg text-muted-foreground mt-3 flex items-center justify-center gap-2">
                  <MapPin className="h-5 w-5" /> {profile.location}
                </p>
                <p className="mt-6 text-foreground leading-relaxed text-lg">{profile.bio}</p>
                {profile.resumeUrl && (
                  <a href={profile.resumeUrl} target="_blank" className="inline-flex items-center gap-3 mt-8 px-8 py-4 bg-primary text-white rounded-2xl hover:scale-105 transition shadow-lg">
                    <Download className="h-6 w-6" /> Resume
                  </a>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-10">
              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl">
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3"><Globe className="h-7 w-7 text-blue-500" /> Social Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {socialLinks.map(link => (
                      <a key={link.id} href={link.url} target="_blank" className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl hover:shadow-lg transition group">
                        <Link className="h-6 w-6 text-primary" />
                        <div>
                          <p className="font-semibold">{link.platform}</p>
                          <p className="text-sm text-muted-foreground group-hover:text-primary">{link.url}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              {contactDetails.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl">
                  <h3 className="text-2xl font-bold mb-8 flex items-center gap-3"><Mail className="h-7 w-7 text-emerald-500" /> Contact</h3>
                  <div className="space-y-5">
                    {contactDetails.map(c => (
                      <div key={c.id} className="flex items-center gap-5 p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                        {c.type.includes('Email') ? <Mail className="h-6 w-6 text-emerald-500" /> : <Phone className="h-6 w-6 text-green-500" />}
                        <div>
                          <p className="font-medium">{c.type}</p>
                          <p className="text-lg">{c.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QR Code */}
              {profile.qrCode && (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-xl text-center">
                  <h3 className="text-2xl font-bold mb-8"><QrCode className="h-8 w-8 inline text-purple-500" /> Contact QR</h3>
                  <img src={profile.qrCode} alt="QR" className="w-64 h-64 mx-auto rounded-2xl shadow-2xl" />
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          /* EDIT MODE */
          <motion.div className="space-y-10">
            {/* Basic Info */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8">Basic Info</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <input placeholder="Name" value={profile.name} onChange={e => setProfile(p => ({...p, name: e.target.value}))} className={inputClasses} />
                <input placeholder="Title" value={profile.title} onChange={e => setProfile(p => ({...p, title: e.target.value}))} className={inputClasses} />
                <input placeholder="Location" value={profile.location} onChange={e => setProfile(p => ({...p, location: e.target.value}))} className={inputClasses} />
                <input placeholder="Resume URL" value={profile.resumeUrl} onChange={e => setProfile(p => ({...p, resumeUrl: e.target.value}))} className={inputClasses} />
                <textarea placeholder="Bio" value={profile.bio} onChange={e => setProfile(p => ({...p, bio: e.target.value}))} rows={6} className={`${inputClasses} md:col-span-2 resize-none`} />
                <div className="md:col-span-2">
                  <label className="block mb-4 font-medium">Profile Picture</label>
                  <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'profile')} className="block w-full file:mr-4 file:py-3 file:px-8 file:rounded-xl file:bg-primary file:text-white" />
                </div>
              </div>
            </section>

            {/* Social Links */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Social Links</h2>
                <button onClick={() => addItem(setSocialLinks, { platform: 'Twitter', url: '' })} className="text-gray-700 dark:text-gray-300 font-bold">+ Add</button>
              </div>
              {socialLinks.map(link => (
                <div key={link.id} className="flex gap-4 mb-4 items-center">
                  <input placeholder="Platform" value={link.platform} onChange={e => updateItem(socialLinks, setSocialLinks, link.id, 'platform', e.target.value)} className={inputClasses} />
                  <input placeholder="URL" value={link.url} onChange={e => updateItem(socialLinks, setSocialLinks, link.id, 'url', e.target.value)} className={inputClasses} />
                  <button onClick={() => deleteItem('socialLinks', link.id, setSocialLinks)} className="text-red-500"><Trash2 className="h-6 w-6" /></button>
                </div>
              ))}
            </section>

            {/* Contact Details */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl">
              <div className="flex justify-between mb-6">
                <h2 className="text-2xl font-bold">Contact Details</h2>
                <button onClick={() => addItem(setContactDetails, { type: 'Email', value: '' })} className="text-gray-700 dark:text-gray-300 font-bold">+ Add</button>
              </div>
              {contactDetails.map(c => (
                <div key={c.id} className="flex gap-4 mb-4 items-center">
                  <input placeholder="Type" value={c.type} onChange={e => updateItem(contactDetails, setContactDetails, c.id, 'type', e.target.value)} className={`${inputClasses} w-48`} />
                  <input placeholder="Value" value={c.value} onChange={e => updateItem(contactDetails, setContactDetails, c.id, 'value', e.target.value)} className={inputClasses} />
                  <button onClick={() => deleteItem('contactDetails', c.id, setContactDetails)} className="text-red-500"><Trash2 className="h-6 w-6" /></button>
                </div>
              ))}
            </section>

            {/* QR Code */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl p-10 shadow-2xl text-center">
              <h2 className="text-2xl font-bold mb-6">Contact QR Code</h2>
              {profile.qrCode ? <img src={profile.qrCode} alt="QR" className="w-48 h-48 mx-auto rounded-xl shadow-lg" /> : <p className="text-muted-foreground">No QR code</p>}
              <input type="file" accept="image/*" onChange={e => handleImageChange(e, 'qr')} className="mt-6 block mx-auto file:mr-4 file:py-3 file:px-8 file:rounded-xl file:bg-primary file:text-white" />
            </section>

            {/* Save */}
            <div className="flex justify-end">
              <button onClick={saveAll} disabled={saving} className="px-12 py-6 bg-gradient-to-r from-rose-600 to-purple-600 text-white text-xl font-bold rounded-2xl flex items-center gap-4 hover:scale-105 transition shadow-2xl">
                {saving ? <Loader2 className="h-8 w-8 animate-spin" /> : <Save className="h-8 w-8" />}
                Save All
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}