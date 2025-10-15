'use client'

import { useState } from 'react'

export default function StartPoolForm() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.set('name', name || 'New Pool')
      const res = await fetch('/api/pools/create', { method: 'POST', body: formData })
      const data = await res.json()
      if (data?.requiresPurchase && data?.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }
      if (data?.ok) {
        window.location.reload()
        return
      }
      setError(data?.error || 'Unable to create pool')
    } catch (err: any) {
      setError(err?.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New pool name"
        className="border rounded px-3 py-2"
        required
      />
      <button disabled={loading} className="px-3 py-2 rounded bg-blue-600 text-white">
        {loading ? 'Starting...' : 'Start Pool'}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </form>
  )
}


