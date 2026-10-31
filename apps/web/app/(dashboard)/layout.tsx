"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { getAuthToken, checkSetupStatus } from "@/lib/api";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function verifyAuth() {
      try {
        const status = await checkSetupStatus();
        if (!status.is_initialized) {
          router.push("/setup");
          return;
        }

        const token = getAuthToken();
        if (!token) {
          router.push("/login");
          return;
        }
        setMounted(true);
      } catch (err) {
        // Fallback to allow dev preview
        setMounted(true);
      }
    }
    verifyAuth();
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#070A0F] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
          <div className="text-xs text-slate-400 font-mono">Initializing IBS AI Workforce...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 ml-64 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
