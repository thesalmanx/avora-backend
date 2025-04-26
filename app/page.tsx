// app/page.tsx
'use client'

import { useEffect, useState } from 'react'

type Contact = {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  message: string
  createdAt: string
}

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('/api/contact')
        if (!res.ok) throw new Error(`Status ${res.status}`)
        const data = await res.json()
        if (!data.success) throw new Error(data.error || 'Unknown error')
        setContacts(data.contacts)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchContacts()
  }, [])

  if (loading) return <p className="p-10">Loading contacts…</p>
  if (error) return (
    <p className="p-10 text-red-600">
      Error loading contacts: {error}
    </p>
  )

  return (
    <div className="p-10 font-open">
      <h1 className="text-2xl font-bold mb-8">All Contacts</h1>

      <div className="space-y-6">
        {contacts.map((c) => (
          <div key={c._id} className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold">
              {c.firstName} {c.lastName}
            </h2>
            <p className="text-gray-600">
              {c.email} — {c.phone} ({c.country})
            </p>
            <p className="mt-2">{c.message}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(c.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
