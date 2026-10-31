"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Building,
  Cpu,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HardDrive
} from "lucide-react";
import { getSettings, updateSettings } from "@/lib/api";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form Fields
  const [companyName, setCompanyName] = useState("IBS Digital");
  const [tagline, setTagline] = useState("One Company. Thirty AI Specialists. Unlimited Possibilities.");
  const [aiProvider, setAiProvider] = useState("gemini");
  const [aiModel, setAiModel] = useState("gemini-3.8-flash");
  const [timezone, setTimezone] = useState("Asia/Karachi");

  useEffect(() => {
    async function load() {
      try {
        const res = await getSettings();
        const s = res.settings || {};
        setSettings(s);
        if (s.company_name) setCompanyName(s.company_name);
        if (s.tagline) setTagline(s.tagline);
        if (s.default_ai_provider) setAiProvider(s.default_ai_provider);
        if (s.default_model) setAiModel(s.default_model);
        if (s.display_timezone) setTimezone(s.display_timezone);
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSavedSuccess(false);

    try {
      await updateSettings({
        company_name: companyName,
        tagline: tagline,
        default_ai_provider: aiProvider,
        default_model: aiModel,
        display_timezone: timezone,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Error updating settings: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#00D2FF]" />
          System & Enterprise Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure agency branding, AI model providers, default display timezone, and safety policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Identity */}
        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Building className="w-4 h-4 text-[#00D2FF]" />
            <span>Company Identity</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0066FF]"
              />
            </div>
          </div>
        </div>

        {/* AI Engine & Model Provider */}
        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>AI Model & Provider Abstraction</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Default AI Provider</label>
              <select
                value={aiProvider}
                onChange={(e) => {
                  const p = e.target.value;
                  setAiProvider(p);
                  if (p === "gemini") setAiModel("gemini-flash-lite-latest");
                  else if (p === "groq") setAiModel("openai/gpt-oss-120b");
                  else if (p === "openrouter") setAiModel("openai/gpt-4o");
                  else if (p === "ollama") setAiModel("llama3.2");
                }}
                className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#0066FF]"
              >
                <option value="gemini">Google Gemini API (Default / Verified)</option>
                <option value="groq">Groq LPU Engine (Ultra-Fast Inference)</option>
                <option value="openrouter">OpenRouter Gateway (GPT-4o, Claude 3.5)</option>
                <option value="ollama">Ollama Private LLM (Local Execution)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Active Model Name</label>
              <input
                type="text"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#0066FF]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Supports: gemini-flash-lite-latest, openai/gpt-oss-120b, openai/gpt-4o, llama3.2
              </span>
            </div>
          </div>
        </div>

        {/* Regional & Timezone Preferences */}
        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Localization & Timezone</span>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-300 mb-1">Display Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#0066FF]"
            >
              <option value="Asia/Karachi">Asia/Karachi (PKT - UTC+05:00) [Default]</option>
              <option value="UTC">UTC (Universal Coordinated Time)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            </select>
            <p className="text-[10px] text-slate-500 mt-1">
              Timestamps are stored in UTC internally and localized to this timezone in UI headers and logs.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings successfully saved.</span>
            </div>
          ) : <div />}

          <button
            type="submit"
            disabled={saveLoading}
            className="px-6 py-2.5 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-semibold shadow-glow-blue transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saveLoading ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
