"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Clock, Terminal, User, AlertCircle } from "lucide-react";
import { listAuditLogs } from "@/lib/api";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const data = await listAuditLogs();
        setLogs(data);
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#00D2FF]" />
          Immutable Security & Audit Trail
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Tamper-evident logs of executive actions, permission modifications, and approval events.
        </p>
      </div>

      <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="text-center py-16 text-xs text-slate-500">Loading audit events...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500">No audit events recorded yet.</div>
        ) : (
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1F293D] bg-[#111827]/60 text-slate-400 text-[11px]">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4 text-right">Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F293D]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-[#00D2FF]" />
                    <span>{log.action}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)})` : ""}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {log.user_id ? log.user_id.slice(0, 8) : "System"}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
