"use client";

import { useEffect, useState } from "react";
import {
  Blocks,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sliders,
  ShieldCheck,
  ExternalLink,
  Key
} from "lucide-react";
import { listIntegrations, testIntegration, configureIntegration } from "@/lib/api";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingKey, setTestingKey] = useState<string | null>(null);
  const [configModalIntegration, setConfigModalIntegration] = useState<any | null>(null);
  const [credentialInput, setCredentialInput] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function loadIntegrations() {
    setLoading(true);
    try {
      const data = await listIntegrations();
      setIntegrations(data);
    } catch (err) {
      console.error("Failed to load integrations:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleTest = async (providerKey: string) => {
    setTestingKey(providerKey);
    try {
      const res = await testIntegration(providerKey);
      setIntegrations((prev) =>
        prev.map((i) =>
          i.provider_key === providerKey
            ? { ...i, is_connected: res.is_connected, status_message: res.message }
            : i
        )
      );
    } catch (err: any) {
      alert(`Test error: ${err.message}`);
    } finally {
      setTestingKey(null);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configModalIntegration) return;
    setSaveLoading(true);

    try {
      await configureIntegration(configModalIntegration.provider_key, {
        is_enabled: true,
        credentials: {
          api_key: credentialInput.trim(),
          access_token: credentialInput.trim(),
          token: credentialInput.trim()
        },
      });
      setConfigModalIntegration(null);
      setCredentialInput("");
      loadIntegrations();
    } catch (err: any) {
      alert(`Configuration error: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Blocks className="w-5 h-5 text-[#00D2FF]" />
          Enterprise Integrations Hub
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Genuine provider adapters. Unconfigured credentials display "Not Connected". All API credentials encrypted at rest.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500">Loading integration adapters...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {integrations.map((integ) => (
            <div
              key={integ.id}
              className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-5 card-hover flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="font-bold text-sm text-white">{integ.provider_name}</div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 shrink-0 ${
                      integ.is_connected
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {integ.is_connected ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-slate-500" />
                        <span>Not Connected</span>
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  {integ.description}
                </p>

                <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1F293D] text-[11px] font-mono text-slate-400 line-clamp-2">
                  Status: {integ.status_message}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#1F293D] flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTest(integ.provider_key)}
                  disabled={testingKey === integ.provider_key}
                  className="px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#161F30] text-slate-200 text-xs font-semibold border border-[#1F293D] flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingKey === integ.provider_key ? "animate-spin text-[#00D2FF]" : ""}`} />
                  <span>Test Link</span>
                </button>

                <button
                  onClick={() => {
                    setConfigModalIntegration(integ);
                    setCredentialInput("");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold shadow-glow-blue transition-all"
                >
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Configure Credentials Modal */}
      {configModalIntegration && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1F293D] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-1">
              Configure {configModalIntegration.provider_name}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Enter your official API Key, Personal Access Token, or Service Account secret.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Secret API Key / Token
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={credentialInput}
                    onChange={(e) => setCredentialInput(e.target.value)}
                    placeholder="Paste secret token..."
                    className="w-full bg-[#111827] border border-[#1F293D] rounded-lg pl-8 pr-3 py-2 text-white focus:outline-none focus:border-[#0066FF] font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Credentials are encrypted server-side with AES-256 and never transmitted to the browser.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#1F293D]">
                <button
                  type="button"
                  onClick={() => setConfigModalIntegration(null)}
                  className="px-4 py-2 rounded-lg bg-[#111827] text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-4 py-2 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold disabled:opacity-50"
                >
                  {saveLoading ? "Saving..." : "Save & Verify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
