"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Terminal, Bell, Clock, ShieldCheck, CheckCircle } from "lucide-react";

export function Header() {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Karachi",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-[#1F293D] bg-[#0B0F17]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 ml-64">
      {/* Left: Tagline & Status */}
      <div className="flex items-center gap-4">
        <div className="text-xs font-semibold text-slate-300 hidden sm:block">
          <span className="text-white font-bold">IBS Digital</span> — One Company. Thirty AI Specialists. Unlimited Possibilities.
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          AI Engine Online
        </div>
      </div>

      {/* Right: Clock & Shortcuts */}
      <div className="flex items-center gap-4">
        {/* Timezone Clock (Asia/Karachi) */}
        <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1F293D]">
          <Clock className="w-3.5 h-3.5 text-[#00D2FF]" />
          <span>PKT: {timeStr || "09:00 AM"}</span>
        </div>

        {/* Quick Launch CEO */}
        <Link
          href="/ceo"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold shadow-glow-blue transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Command CEO</span>
        </Link>
      </div>
    </header>
  );
}
