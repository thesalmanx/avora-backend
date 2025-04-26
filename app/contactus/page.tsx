// app/contactus/page.tsx
'use client'

import { useEffect, useState } from 'react'

type Entry = {
  _id:             string
  name:            string
  email:           string
  phone:           string
  projectInterest: string
  message:         string
  createdAt:       string
}

export default function ContactUsEntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    async function fetchEntries() {
      try {
        const res = await fetch('/api/contactus')
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const data: {
          success: boolean
          entries?: Entry[]
          error?: string
        } = await res.json()
        if (!data.success) throw new Error(data.error ?? 'Unknown error')
        setEntries(data.entries ?? [])
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err))
      } finally {
        setLoading(false)
      }
    }
    fetchEntries()
  }, [])

  if (loading) return <p className="p-10">Loading submissions…</p>
  if (error)   return <p className="p-10 text-red-600">Error: {error}</p>

  return (
    <div className="p-10 font-open">
      <h1 className="text-2xl font-bold mb-8">Contact Us Submissions</h1>
      <div className="space-y-6">
        {entries.map((e) => (
          <div key={e._id} className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold">{e.name}</h2>
            <p className="text-gray-600">
              {e.email} — {e.phone}
            </p>
            {e.projectInterest && (
              <p className="mt-1 italic text-gray-800">
                Interested in: {e.projectInterest}
              </p>
            )}
            <p className="mt-2">{e.message}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(e.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
