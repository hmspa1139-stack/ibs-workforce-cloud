"use client";

import { useEffect, useState } from "react";
import {
  Contact2,
  Plus,
  Building,
  Mail,
  Phone,
  Globe,
  DollarSign,
  FolderGit2
} from "lucide-react";
import { listClients, createClient } from "@/lib/api";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoading(true);
    try {
      const data = await listClients();
      setClients(data);
    } catch (err) {
      console.error("Failed to load clients:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !email.trim()) return;
    setCreateLoading(true);

    try {
      await createClient({
        company_name: companyName.trim(),
        contact_name: contactName.trim(),
        email: email.trim(),
        industry,
        website,
      });
      setShowCreateModal(false);
      setCompanyName("");
      setContactName("");
      setEmail("");
      loadClients();
    } catch (err: any) {
      alert(`Error creating client: ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Contact2 className="w-5 h-5 text-[#00D2FF]" />
            Client Directory & CRM
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Isolated customer records, dedicated project histories, and client-specific memory scopes.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold shadow-glow-blue flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500">Loading client records...</div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-[#0B0F17] border border-[#1F293D] max-w-md mx-auto">
          <Contact2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">No Clients Registered</h3>
          <p className="text-xs text-slate-400 mb-4">
            Register your agency clients to enable dedicated memory scopes and project billing tracking.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-[#0066FF] text-white text-xs font-semibold"
          >
            Register Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((c) => (
            <div
              key={c.id}
              className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-5 card-hover space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{c.company_name}</h3>
                  <div className="text-xs text-slate-400">{c.contact_name}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 capitalize">
                  {c.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate">{c.email}</span>
                </div>
                {c.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{c.website}</span>
                  </div>
                )}
                {c.industry && (
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{c.industry}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#1F293D] flex justify-between items-center text-[11px] font-mono text-slate-400">
                <span>Projects: {c.projects_count || 0}</span>
                <span>Spend: ${(c.total_spend_usd || 0).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1F293D] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-4">Register Client</h2>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company / Organization</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Apex Health Technologies"
                  className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Primary Contact Name</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Rachel Adams"
                  className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rachel@apexhealth.io"
                  className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Healthcare / SaaS"
                    className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Website</label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://apexhealth.io"
                    className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1F293D]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#111827] text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-4 py-2 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold disabled:opacity-50"
                >
                  {createLoading ? "Saving..." : "Register Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
