'use client'

import { useEffect, useRef } from 'react'

export default function OnboardOnMount() {
  const didRun = useRef(false)
  useEffect(() => {
    if (didRun.current) return
    didRun.current = true
    fetch('/api/onboard', { method: 'POST' }).catch(() => {})
  }, [])
  return null
}


