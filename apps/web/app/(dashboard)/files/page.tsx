"use client";

import { useEffect, useState } from "react";
import {
  FileCode2,
  Download,
  Eye,
  Search,
  Folder,
  FileText,
  FileCode,
  Calendar,
  Bot
} from "lucide-react";
import { listFiles, getFileContent, getFileDownloadUrl } from "@/lib/api";

export default function FilesDeliverablesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activePreview, setActivePreview] = useState<{ name: string; content: string } | null>(null);

  useEffect(() => {
    loadFiles();
  }, [selectedCategory]);

  async function loadFiles() {
    setLoading(true);
    try {
      const data = await listFiles(selectedCategory !== "all" ? selectedCategory : undefined);
      setFiles(data);
    } catch (err) {
      console.error("Failed to load deliverables:", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePreview = async (fileId: string, fileName: string) => {
    try {
      const res = await getFileContent(fileId);
      setActivePreview({ name: fileName, content: res.content });
    } catch (err: any) {
      alert(`Error reading file: ${err.message}`);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.file_name.toLowerCase().includes(search.toLowerCase()) ||
    f.created_by_agent_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-[#00D2FF]" />
            Agency Deliverables & Artifacts
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Compiled software code, marketing blueprints, design specifications, and QA certificates.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#111827] border border-[#1F293D] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#0066FF]"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#111827] border border-[#1F293D] rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-[#0066FF]"
          >
            <option value="all">All Categories</option>
            <option value="code">Code Artifacts</option>
            <option value="document">Documentation</option>
            <option value="report">Reports</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-xs text-slate-500">Loading deliverables...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-16 p-8 rounded-2xl bg-[#0B0F17] border border-[#1F293D]">
          <FileCode2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white mb-1">No Deliverables Generated</h3>
          <p className="text-xs text-slate-400">
            Files produced by coding, marketing, and design agents will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-[#0B0F17] border border-[#1F293D] rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1F293D] bg-[#111827]/60 text-slate-400 text-[11px]">
                <th className="py-3 px-4 font-semibold">File Name</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Specialist</th>
                <th className="py-3 px-4 font-semibold">Size</th>
                <th className="py-3 px-4 font-semibold">Created</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F293D]">
              {filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-[#111827]/40 transition-colors">
                  <td className="py-3 px-4 font-medium text-white flex items-center gap-2.5">
                    {file.file_category === "code" ? (
                      <FileCode className="w-4 h-4 text-[#00D2FF]" />
                    ) : (
                      <FileText className="w-4 h-4 text-emerald-400" />
                    )}
                    <span>{file.file_name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#111827] text-slate-300 border border-[#1F293D]">
                      {file.file_category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#00D2FF]">
                    {file.created_by_agent_id}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                    {(file.file_size_bytes / 1024).toFixed(1)} KB
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(file.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handlePreview(file.id, file.file_name)}
                        className="p-1.5 rounded bg-[#111827] hover:bg-[#161F30] text-slate-300 border border-[#1F293D] transition-colors"
                        title="View Content Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={getFileDownloadUrl(file.id)}
                        download
                        className="p-1.5 rounded bg-[#111827] hover:bg-[#161F30] text-slate-300 border border-[#1F293D] transition-colors"
                        title="Download File"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Code / Content Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#1F293D] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-[#1F293D] flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white font-mono">
                <FileCode className="w-4 h-4 text-[#00D2FF]" />
                <span>{activePreview.name}</span>
              </div>
              <button
                onClick={() => setActivePreview(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 bg-[#070A0F]">
              <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {activePreview.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
