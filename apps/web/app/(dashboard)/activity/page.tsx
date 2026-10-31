"use client";

import { useEffect, useState } from "react";
import { Activity, Radio, Bot, CheckCircle2, ShieldAlert, Terminal, Clock, RefreshCw } from "lucide-react";

export default function LiveActivityPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("/api/ceo/events");

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (e) => {
      try {
        if (e.data && e.data.trim() !== "ping") {
          const newEvent = JSON.parse(e.data);
          setEvents((prev) => [newEvent, ...prev.slice(0, 49)]);
        }
      } catch (err) {
        console.error("Error parsing SSE event:", err);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Live Task Activity Stream (SSE)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real backend execution events broadcasted directly from the multi-agent worker.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827] border border-[#1F293D] text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              connected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span className={connected ? "text-emerald-400" : "text-amber-400"}>
            {connected ? "SSE Stream Connected" : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Stream Window */}
      <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-6 min-h-[500px]">
        {events.length === 0 ? (
          <div className="text-center py-20 text-xs text-slate-500 space-y-3">
            <Radio className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
            <div>Listening for live task and agent execution events...</div>
            <div className="text-[11px] text-slate-600">
              When tasks run, tool calls, QA audits, and status transitions stream here in real time.
            </div>
          </div>
        ) : (
          <div className="space-y-3 font-mono text-xs">
            {events.map((ev, i) => (
              <div
                key={ev.id || i}
                className="p-3.5 rounded-lg bg-[#111827] border border-[#1F293D] flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded bg-[#0B0F17] text-[#00D2FF] shrink-0 mt-0.5">
                    <Terminal className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{ev.message}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Event Type: <span className="text-[#00D2FF]">{ev.type}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 shrink-0">
                  {new Date(ev.created_at).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
