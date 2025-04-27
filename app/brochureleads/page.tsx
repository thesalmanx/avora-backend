'use client';

import { useEffect, useState } from 'react';

type BrochureLead = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  userType: string;
  property: string;
  createdAt: string;
};

export default function BrochureLeadsPage() {
  const [leads, setLeads] = useState<BrochureLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch('/api/brochurelead');
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data: {
          success: boolean;
          leads?: BrochureLead[];
          error?: string;
        } = await res.json();
        if (!data.success) throw new Error(data.error ?? 'Unknown error');
        setLeads(data.leads ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchLeads();
  }, []);

  if (loading) return <p className="p-10">Loading brochure leads…</p>;
  if (error) return <p className="p-10 text-red-600">Error: {error}</p>;

  return (
    <div className="p-10 font-open">
      <h1 className="text-2xl font-bold mb-8">Brochure Leads Submissions</h1>
      <div className="space-y-6">
        {leads.map((lead) => (
          <div key={lead._id} className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold">{lead.name}</h2>
            <p className="text-gray-600">{lead.email} — {lead.phone}</p>
            <p className="mt-1 italic text-gray-800">
              {lead.userType ? `Type: ${lead.userType}` : ''}
            </p>
            <p className="mt-1 text-gray-700">
              {lead.property ? `Property: ${lead.property}` : ''}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(lead.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
