'use client'

import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth, } from '../../lib/firebaseConfig'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/overview')
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push('/overview')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-gray-900 dark:to-slate-800 flex items-center justify-center py-20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full mx-auto px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-border p-8"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <LogIn className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground">Login to Your Account</h1>
          <p className="text-muted-foreground mt-2">Access your dashboard to manage projects.</p>
        </motion.div>

        {error && (
          <motion.p variants={itemVariants} className="text-red-500 mb-4 text-center">{error}</motion.p>
        )}

        <motion.form variants={itemVariants} onSubmit={handleEmailLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center justify-center"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login with Email'}
          </button>
        </motion.form>

        <motion.div variants={itemVariants} className="mt-6">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full px-6 py-3 border border-border rounded-lg bg-white dark:bg-gray-800 hover:bg-accent transition-all flex items-center justify-center"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <>
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.24 10.4V13.6h5.47c-.24 1.24-.96 2.3-1.92 3.07v2.56h3.1c1.81-1.67 2.86-4.13 2.86-7.03 0-.67-.06-1.32-.18-1.95h-9.33z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 18c-1.73 0-3.28-.66-4.47-1.73l-2.86 2.45C6.66 20.72 9.19 22 12 22c2.67 0 5.02-1.06 6.76-2.78l-3.1-2.56c-.96.58-2.07.94-3.26.94z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 6c1.11 0 2.13.36 2.96.92l2.22-2.22C15.35 3.06 13.29 2 11 2 8.19 2 5.66 3.28 3.67 5.28l2.86 2.45C7.72 6.66 9.27 6 12 6z"
                  />
                  <path
                    fill="currentColor"
                    d="M6.53 10.27l-2.86-2.45C3.25 8.88 3 10.42 3 12c0 1.58.25 3.12.67 4.18l2.86-2.45c-.19-.66-.29-1.35-.29-2.05 0-.71.1-1.4.29-2.05z"
                  />
                </svg>
                Login with Google
              </>
            )}
          </button>
        </motion.div>

        <motion.p variants={itemVariants} className="mt-6 text-center text-muted-foreground">
          Don’t have an account?{' '}
          <a href="/signup" className="text-primary hover:underline">Sign up</a>
        </motion.p>
      </motion.div>
    </div>
  )
}