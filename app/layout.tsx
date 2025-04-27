// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title:   'Avora Dashboard',
  description: 'Manage contacts and “contact us” entries',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="bg-white shadow">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-gray-900"
            >
              Contacts
            </Link>
            <Link
              href="/contactus"
              className="text-gray-700 hover:text-gray-900"
            >
              Contact Us Entries
            </Link>

            <Link
              href="/brochureleads"
              className="text-gray-700 hover:text-gray-900"
            >
              Brochure Leads
            </Link>

          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
