"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ShieldCheck, ArrowRight, UserCheck } from "lucide-react";
import { setupOwner } from "@/lib/api";

export default function SetupWizardPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await setupOwner({
        full_name: fullName,
        email,
        password,
      });
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to initialize Founder account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070A0F] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      <div className="w-full max-w-md bg-[#0B0F17] border border-[#1F293D] rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0066FF] to-[#00D2FF] flex items-center justify-center shadow-glow-blue">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">IBS AI WORKFORCE</h1>
            <p className="text-xs text-slate-400">Founder & Owner Setup Wizard</p>
          </div>
        </div>

        <div className="mb-6 p-3.5 rounded-xl bg-[#111827] border border-[#1F293D] text-xs text-slate-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#00D2FF] shrink-0 mt-0.5" />
          <div>
            Initialize your primary executive account. This credentials will have full governance authority over the 30 specialized AI agents.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Founder Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Official Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@ibsdigital.com"
              className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FF] transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Master Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FF] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow-blue transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Initializing Agency OS...</span>
            ) : (
              <>
                <span>Complete Setup & Launch Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#1F293D] text-center text-[11px] text-slate-500">
          One Company. Thirty AI Specialists. Unlimited Possibilities.
        </div>
      </div>
    </div>
  );
}
