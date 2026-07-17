'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ContactRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/#contact')
  }, [router])

  return (
    <div className="min-h-screen bg-[#101415] flex items-center justify-center text-[#908fa0] text-sm">
      Redirecting...
    </div>
  )
}