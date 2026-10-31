"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Crown,
  Users,
  Briefcase,
  FolderGit2,
  Kanban,
  Activity,
  CheckCircle2,
  FileCode2,
  Contact2,
  Blocks,
  Coins,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { clearAuthToken } from "@/lib/api";

const NAV_ITEMS = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "AI CEO Command", href: "/ceo", icon: Crown, highlight: true },
  { name: "AI Workforce", href: "/workforce", icon: Users, badge: "30" },
  { name: "Departments", href: "/departments", icon: Briefcase, badge: "5" },
  { name: "Projects", href: "/projects", icon: FolderGit2 },
  { name: "Task Management", href: "/tasks", icon: Kanban },
  { name: "Live Activity", href: "/activity", icon: Activity, dot: true },
  { name: "Approval Center", href: "/approvals", icon: CheckCircle2, alert: true },
  { name: "Files & Deliverables", href: "/files", icon: FileCode2 },
  { name: "Clients", href: "/clients", icon: Contact2 },
  { name: "Integrations", href: "/integrations", icon: Blocks },
  { name: "AI Usage & Costs", href: "/usage", icon: Coins },
  { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
  { name: "Audit Logs", href: "/audit", icon: ShieldCheck },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuthToken();
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-[#1F293D] flex flex-col h-screen fixed top-0 left-0 z-40 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1F293D] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#0066FF] to-[#00D2FF] flex items-center justify-center shadow-glow-blue">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-white flex items-center gap-1.5">
              IBS DIGITAL
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0066FF]/20 text-[#00D2FF] font-semibold border border-[#0066FF]/30">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium tracking-tight">AI Workforce OS</div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
          Management & Operations
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? "bg-[#0066FF] text-white shadow-glow-blue font-semibold"
                  : item.highlight
                  ? "text-[#00D2FF] hover:bg-[#111827] hover:text-white"
                  : "text-slate-400 hover:text-slate-100 hover:bg-[#111827]"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : item.highlight ? "text-[#00D2FF]" : "text-slate-400 group-hover:text-slate-200"}`} />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.dot && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive ? "bg-white/20 text-white" : "bg-[#1F293D] text-slate-400"}`}>
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#1F293D] bg-[#070A0F]/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#111827]/70 border border-[#1F293D]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0066FF]/20 border border-[#0066FF]/40 text-[#00D2FF] flex items-center justify-center font-bold text-xs">
              FD
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-200 truncate">Founder / Owner</div>
              <div className="text-[10px] text-slate-400 truncate">IBS Digital HQ</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
