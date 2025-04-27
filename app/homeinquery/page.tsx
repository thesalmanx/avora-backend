'use client';

import { useEffect, useState } from 'react';

type HomeEnquiry = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  createdAt: string;
};

export default function HomeInqueryPage() {
  const [enquiries, setEnquiries] = useState<HomeEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const res = await fetch('/api/homeinquery');
        if (!res.ok) throw new Error(`Error fetching enquiries (Status ${res.status})`);

        const data: {
          success: boolean;
          enquiries?: HomeEnquiry[];
          error?: string;
        } = await res.json();

        if (!data.success) throw new Error(data.error || 'Unknown error fetching enquiries');
        setEnquiries(data.enquiries || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        console.error('Failed to load enquiries:', message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-gray-600">Loading home enquiries…</div>;
  }

  if (error) {
    return <div className="p-10 text-center text-red-600">Error: {error}</div>;
  }

  if (enquiries.length === 0) {
    return <div className="p-10 text-center text-gray-500">No home enquiries found.</div>;
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-6">Home Enquiry Submissions</h1>
      <div className="space-y-6">
        {enquiries.map((e) => (
          <div key={e._id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
            <h2 className="text-lg font-semibold text-black">{e.name}</h2>
            <p className="text-gray-700">{e.email} — {e.phone} ({e.country})</p>
            <p className="text-xs text-gray-400 mt-2">{new Date(e.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
