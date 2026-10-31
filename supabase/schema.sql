-- ==============================================================================
-- IBS AI WORKFORCE — Supabase PostgreSQL Schema & Migrations
-- Product: IBS AI Workforce | IBS Digital
-- Tagline: One Company. Thirty AI Specialists. Unlimited Possibilities.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Workspaces
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    owner_id VARCHAR(100) NOT NULL,
    plan VARCHAR(50) DEFAULT 'enterprise' NOT NULL,
    settings_json JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Corporate Departments (5 Core Business Divisions)
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    head_agent_id VARCHAR(100),
    icon VARCHAR(50) DEFAULT 'Briefcase' NOT NULL,
    color VARCHAR(50) DEFAULT '#0066FF' NOT NULL,
    display_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. 30 Specialist Agent Profiles
CREATE TABLE IF NOT EXISTS agent_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) UNIQUE NOT NULL,
    department_code VARCHAR(50) NOT NULL REFERENCES departments(code),
    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255) NOT NULL,
    icon VARCHAR(50) DEFAULT 'Bot' NOT NULL,
    color VARCHAR(50) DEFAULT '#0066FF' NOT NULL,
    mission TEXT NOT NULL,
    specialization TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'idle' NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    accepted_inputs JSONB DEFAULT '[]'::jsonb NOT NULL,
    expected_outputs JSONB DEFAULT '[]'::jsonb NOT NULL,
    tool_permissions JSONB DEFAULT '[]'::jsonb NOT NULL,
    quality_checklist JSONB DEFAULT '[]'::jsonb NOT NULL,
    execution_limits JSONB DEFAULT '{}'::jsonb NOT NULL,
    total_runs INT DEFAULT 0 NOT NULL,
    successful_runs INT DEFAULT 0 NOT NULL,
    failed_runs INT DEFAULT 0 NOT NULL,
    total_tokens BIGINT DEFAULT 0 NOT NULL,
    total_cost_usd NUMERIC(10, 4) DEFAULT 0.0 NOT NULL,
    avg_duration_sec NUMERIC(10, 2) DEFAULT 0.0 NOT NULL,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Agent System Instructions
CREATE TABLE IF NOT EXISTS agent_instructions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(100) NOT NULL REFERENCES agent_profiles(agent_id),
    version INT DEFAULT 1 NOT NULL,
    system_prompt TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. Clients CRM
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    company_name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(255),
    industry VARCHAR(100),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    total_spend_usd NUMERIC(12, 2) DEFAULT 0.0 NOT NULL,
    notes TEXT,
    client_memory JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Software & Digital Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    client_id UUID REFERENCES clients(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'planning' NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium' NOT NULL,
    budget_limit_usd NUMERIC(10, 2) DEFAULT 50.0 NOT NULL,
    total_spend_usd NUMERIC(10, 4) DEFAULT 0.0 NOT NULL,
    deadline TIMESTAMPTZ,
    workspace_storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. Tasks (8-Stage Kanban)
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_agent_id VARCHAR(100) NOT NULL REFERENCES agent_profiles(agent_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'backlog' NOT NULL,
    priority VARCHAR(50) DEFAULT 'medium' NOT NULL,
    expected_output TEXT,
    actual_output TEXT,
    error_message TEXT,
    retry_count INT DEFAULT 0 NOT NULL,
    execution_cost_usd NUMERIC(10, 4) DEFAULT 0.0 NOT NULL,
    tokens_used INT DEFAULT 0 NOT NULL,
    duration_seconds NUMERIC(10, 2) DEFAULT 0.0 NOT NULL,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Task Dependencies (DAG)
CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) DEFAULT 'finish_to_start' NOT NULL
);

-- 9. Human Approvals (Safety Center)
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    task_id UUID REFERENCES tasks(id),
    project_id UUID REFERENCES projects(id),
    requesting_agent_id VARCHAR(100) NOT NULL REFERENCES agent_profiles(agent_id),
    action_type VARCHAR(100) NOT NULL,
    action_title VARCHAR(255) NOT NULL,
    action_details JSONB DEFAULT '{}'::jsonb NOT NULL,
    target_service VARCHAR(100) NOT NULL,
    financial_impact_usd NUMERIC(10, 2) DEFAULT 0.0 NOT NULL,
    risk_level VARCHAR(50) DEFAULT 'medium' NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    decided_at TIMESTAMPTZ,
    rejection_reason TEXT,
    expires_at TIMESTAMPTZ
);

-- 10. Deliverables & File Artifacts
CREATE TABLE IF NOT EXISTS deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id),
    created_by_agent_id VARCHAR(100) NOT NULL REFERENCES agent_profiles(agent_id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_size_bytes INT DEFAULT 0 NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'text/plain' NOT NULL,
    file_category VARCHAR(50) DEFAULT 'document' NOT NULL,
    version INT DEFAULT 1 NOT NULL,
    download_url TEXT,
    raw_content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Multi-Tier Memory Records
CREATE TABLE IF NOT EXISTS memory_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    scope VARCHAR(50) NOT NULL, -- 'company', 'department', 'project', 'client'
    entity_id VARCHAR(100),
    key VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb NOT NULL,
    importance_score INT DEFAULT 5 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. Security Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(100),
    user_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
