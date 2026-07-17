'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ProjectDetailRedirect() {
  const params = useParams()
  const router = useRouter()
  
  useEffect(() => {
    const projectId = params?.projectId
    if (projectId) {
      router.replace(`/?project=${projectId}`)
    } else {
      router.replace('/#projects')
    }
  }, [params, router])

  return (
    <div className="min-h-screen bg-[#101415] flex items-center justify-center text-[#908fa0] text-sm">
      Redirecting to project details...
    </div>
  )
}