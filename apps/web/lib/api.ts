// IBS AI Workforce — Core API Client
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ibs_token");
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ibs_token", token);
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ibs_token");
    localStorage.removeItem("ibs_user");
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAuthToken();
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login") && !window.location.pathname.includes("/setup")) {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    let errMsg = `Request failed: ${res.statusText}`;
    try {
      const errData = await res.json();
      errMsg = errData.detail || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }

  return res.json();
}

// ---------------- AUTH ----------------
export async function checkSetupStatus() {
  return request<{ is_initialized: boolean; owner_exists: boolean }>("/auth/status");
}

export async function setupOwner(data: { full_name: string; email: string; password: string }) {
  const res = await request<{ access_token: string; user: any }>("/auth/setup", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setAuthToken(res.access_token);
  localStorage.setItem("ibs_user", JSON.stringify(res.user));
  return res;
}

export async function login(data: { email: string; password: string }) {
  const res = await request<{ access_token: string; user: any }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setAuthToken(res.access_token);
  localStorage.setItem("ibs_user", JSON.stringify(res.user));
  return res;
}

export async function getCurrentUser() {
  return request<any>("/auth/me");
}

// ---------------- OVERVIEW & ANALYTICS ----------------
export async function getOverviewStats() {
  return request<any>("/analytics/overview");
}

export async function getPerformanceReports() {
  return request<any>("/analytics/reports");
}

// ---------------- AI CEO ----------------
export async function sendCeoChat(data: { message: string; project_id?: string; plan_only?: boolean; cost_limit_usd?: number }) {
  return request<any>("/ceo/chat", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getCeoHistory() {
  return request<any[]>("/ceo/history");
}

// ---------------- AGENTS ----------------
export async function listAgents(params?: { department_id?: string; status_filter?: string }) {
  let q = "";
  if (params?.department_id) q += `?department_id=${params.department_id}`;
  return request<any[]>(`/agents${q}`);
}

export async function getAgent(agentId: string) {
  return request<any>(`/agents/${agentId}`);
}

export async function getAgentInstruction(agentId: string) {
  return request<{ agent_id: string; system_prompt: string }>(`/agents/${agentId}/instruction`);
}

export async function updateAgentInstruction(agentId: string, system_prompt: string) {
  return request<any>(`/agents/${agentId}/instruction`, {
    method: "PUT",
    body: JSON.stringify({ system_prompt }),
  });
}

export async function updateAgentStatus(agentId: string, data: { is_enabled?: boolean; status?: string }) {
  return request<any>(`/agents/${agentId}/status`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function testAgent(agentId: string, prompt: string) {
  return request<any>(`/agents/${agentId}/test`, {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
}

export async function getAgentRuns(agentId: string) {
  return request<any[]>(`/agents/${agentId}/runs`);
}

// ---------------- DEPARTMENTS ----------------
export async function listDepartments() {
  return request<any[]>("/departments");
}

// ---------------- PROJECTS ----------------
export async function listProjects(statusFilter?: string) {
  const q = statusFilter ? `?status_filter=${statusFilter}` : "";
  return request<any[]>(`/projects${q}`);
}

export async function createProject(data: { name: string; description?: string; priority?: string; budget_limit_usd?: number }) {
  return request<any>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getProject(projectId: string) {
  return request<any>(`/projects/${projectId}`);
}

export async function listProjectFiles(projectId: string) {
  return request<{ project_id: string; files: any[] }>(`/projects/${projectId}/files`);
}

export function getProjectExportUrl(projectId: string) {
  return `${API_URL}/projects/${projectId}/export`;
}

// ---------------- TASKS ----------------
export async function listTasks(params?: { project_id?: string; agent_id?: string; status_filter?: string }) {
  const query = new URLSearchParams(params as any).toString();
  return request<any[]>(`/tasks${query ? `?${query}` : ""}`);
}

export async function createTask(data: any) {
  return request<any>("/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTask(taskId: string, data: any) {
  return request<any>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ---------------- APPROVALS ----------------
export async function listApprovals(statusFilter?: string) {
  const q = statusFilter ? `?status_filter=${statusFilter}` : "";
  return request<any[]>(`/approvals${q}`);
}

export async function decideApproval(approvalId: string, decision: "approve" | "reject", reason?: string) {
  return request<any>(`/approvals/${approvalId}/decision`, {
    method: "POST",
    body: JSON.stringify({ decision, reason }),
  });
}

// ---------------- FILES ----------------
export async function listFiles(category?: string) {
  const q = category ? `?category=${category}` : "";
  return request<any[]>(`/files${q}`);
}

export async function getFileContent(fileId: string) {
  return request<{ id: string; file_name: string; content: string }>(`/files/${fileId}/content`);
}

export function getFileDownloadUrl(fileId: string) {
  return `${API_URL}/files/${fileId}/download`;
}

// ---------------- CLIENTS ----------------
export async function listClients() {
  return request<any[]>("/clients");
}

export async function createClient(data: any) {
  return request<any>("/clients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---------------- INTEGRATIONS ----------------
export async function listIntegrations() {
  return request<any[]>("/integrations");
}

export async function testIntegration(providerKey: string) {
  return request<any>(`/integrations/${providerKey}/test`, {
    method: "POST",
  });
}

export async function configureIntegration(providerKey: string, data: { is_enabled?: boolean; credentials?: any; config?: any }) {
  return request<any>(`/integrations/${providerKey}/configure`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---------------- SETTINGS & AUDIT ----------------
export async function getSettings() {
  return request<{ settings: Record<string, string> }>("/settings");
}

export async function updateSettings(settings: Record<string, string>) {
  return request<{ settings: Record<string, string> }>("/settings", {
    method: "PATCH",
    body: JSON.stringify({ settings }),
  });
}

export async function listAuditLogs() {
  return request<any[]>("/audit");
}
