'use client'

import { useEffect, useRef } from 'react'

export default function OnboardOnMount() {
  const didRun = useRef(false)
  useEffect(() => {
    if (didRun.current) return
    didRun.current = true
    // /api/onboard route was removed; noop for now
    Promise.resolve()
  }, [])
  return null
}


