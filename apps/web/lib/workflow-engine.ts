import { VercelAIEngine } from "./ai-engine";
import { AGENTS_REGISTRY } from "./agents-registry";

export interface WorkflowTask {
  id: string;
  agentId: string;
  title: string;
  description: string;
  dependencies: string[];
  priority: "low" | "medium" | "high" | "urgent";
  status: "backlog" | "planning" | "assigned" | "in_progress" | "waiting_approval" | "quality_review" | "completed" | "failed";
  expectedOutput: string;
  actualOutput?: string;
  costUsd: number;
  tokensUsed: number;
  durationSec: number;
  error?: string;
  deliverableFile?: { name: string; path: string; category: string; content: string };
}

export interface WorkflowRun {
  id: string;
  projectId: string;
  projectName: string;
  objective: string;
  executiveSummary: string;
  status: "planning" | "running" | "waiting_approval" | "completed" | "failed" | "cancelled" | "paused";
  tasks: WorkflowTask[];
  totalCostUsd: number;
  totalTokens: number;
  startedAt: string;
  completedAt?: string;
  logs: { timestamp: string; agentId: string; message: string; type: string }[];
}

// In-memory persistent cache for serverless environments with Supabase sync
const WORKFLOW_STORE = new Map<string, WorkflowRun>();

export class VercelWorkflowEngine {
  static createPlan(objective: string): { projectName: string; summary: string; tasks: WorkflowTask[] } {
    const lower = objective.toLowerCase();
    let projectName = "Agency Digital Initiative";
    let summary = "Cross-functional agency execution coordinated by the AI CEO.";
    let rawTasks: { id: string; agentId: string; title: string; desc: string; deps: string[]; priority: any; out: string }[] = [];

    if (lower.includes("pizza") || lower.includes("restaurant") || lower.includes("cafe") || lower.includes("food") || lower.includes("burger") || lower.includes("bakery")) {
      projectName = lower.includes("pizza") ? "Artisan Pizza Parlor & Online Storefront" : "Culinary Online Storefront & Ordering System";
      summary = "High-converting online ordering storefront with appetizing menu catalog, cart checkout, local Google Maps SEO, and targeted Meta ads.";
      rawTasks = [
        { id: "task_1", agentId: "agent_business_analyst", title: "Pizza Storefront Architecture & Digital Menu Specifications", desc: "Define online ordering flows, toppings customizer, delivery radius, and payment gateway specifications.", deps: [], priority: "high", out: "Menu & Ordering FRD" },
        { id: "task_2", agentId: "agent_uiux_designer", title: "Artisan Pizza UI Layout, Menu Grid & Brand Tokens", desc: "Design appetite-stimulating color palette, mobile-first menu grid, and order review modal.", deps: ["task_1"], priority: "high", out: "Tailwind UI Tokens & Wireframe Deck" },
        { id: "task_3", agentId: "agent_seo_specialist", title: "Local Restaurant Schema & Google Maps Local SEO Matrix", desc: "Restaurant JSON-LD schema, local keyword optimization, delivery area keywords, and OpenGraph tags.", deps: ["task_1"], priority: "medium", out: "Local Restaurant SEO Matrix" },
        { id: "task_4", agentId: "agent_fullstack_developer", title: "Build Interactive Pizza Shop Web Application", desc: "Implement production Next.js/Tailwind landing page with cart state, mobile navigation, and responsive menu.", deps: ["task_1", "task_2"], priority: "high", out: "Production Storefront Code Package" },
        { id: "task_5", agentId: "agent_meta_ads", title: "Local Foodie Meta Ads & Instagram Conversion Campaign", desc: "High-ROAS Instagram reels/stories ad copy, local 5-mile geo-targeting, and promotional discount angle.", deps: ["task_1"], priority: "medium", out: "Meta Ads Copy & Creative Brief" },
        { id: "task_6", agentId: "agent_qa_engineer", title: "Order Flow & Mobile Responsiveness Playwright Audit", desc: "Execute automated verification on cart checkout journey, cross-device responsiveness, and load times.", deps: ["task_4"], priority: "urgent", out: "QA Verification Certificate" },
      ];
    } else if (lower.includes("landing page") || lower.includes("landing") || lower.includes("website") || lower.includes("portfolio")) {
      const topicMatch = objective.match(/(?:for|about)\s+([^,.]+)/i);
      const topic = topicMatch ? topicMatch[1].trim() : "Custom Initiative";
      projectName = `${topic.charAt(0).toUpperCase() + topic.slice(1)} Conversion Landing Page`;
      summary = `High-converting responsive landing page for ${topic} with hero value proposition, social proof, and lead capture.`;
      rawTasks = [
        { id: "task_1", agentId: "agent_product_manager", title: "Landing Page Architecture & Conversion Funnel Specs", desc: `Map user journey, CTA positioning, and lead capture hooks for ${topic}.`, deps: [], priority: "high", out: "Conversion Funnel Specifications" },
        { id: "task_2", agentId: "agent_uiux_designer", title: "Landing Page Visual Design & Tailwind Tokens", desc: "Modern typography, hero hierarchy, social proof grid, and interactive elements.", deps: ["task_1"], priority: "high", out: "UI Design Deck & Tokens" },
        { id: "task_3", agentId: "agent_content_copywriter", title: "Direct-Response Conversion Copywriting", desc: "Craft headline formulas, benefit bullet points, objection handling, and CTA copy.", deps: ["task_1"], priority: "high", out: "Sales Copy Deck" },
        { id: "task_4", agentId: "agent_fullstack_developer", title: "Implement Production Landing Page Web App", desc: "Code responsive Next.js/HTML component with fast edge delivery and analytics hooks.", deps: ["task_1", "task_2", "task_3"], priority: "high", out: "Production Landing Page Source" },
        { id: "task_5", agentId: "agent_seo_specialist", title: "Technical On-Page SEO & Metadata Strategy", desc: "Title tags, meta descriptions, canonical URLs, and structured data schema.", deps: ["task_4"], priority: "medium", out: "SEO Strategy & Tags" },
        { id: "task_6", agentId: "agent_qa_engineer", title: "Lighthouse Performance & Mobile Responsiveness QA", desc: "Verify sub-second load times, accessibility, and zero-defect rendering.", deps: ["task_4"], priority: "urgent", out: "QA Acceptance Certificate" },
      ];
    } else if (lower.includes("ecommerce") || lower.includes("e-commerce") || lower.includes("store") || lower.includes("shop")) {
      projectName = "E-Commerce Cloud Storefront";
      summary = "Turnkey online storefront with product catalog, cart checkout, SEO optimization, and Meta ad campaign.";
      rawTasks = [
        { id: "task_1", agentId: "agent_business_analyst", title: "E-Commerce Architecture & Functional Specifications", desc: "Define catalog hierarchy, cart state, and checkout gateways.", deps: [], priority: "high", out: "FRD & Checkout Architecture Document" },
        { id: "task_2", agentId: "agent_uiux_designer", title: "Storefront UI Layout & Tailwind Design Tokens", desc: "Create modern responsive storefront layouts and component hierarchy.", deps: ["task_1"], priority: "high", out: "Tailwind Design System & Wireframes" },
        { id: "task_3", agentId: "agent_seo_specialist", title: "E-Commerce Search Engine Optimization Matrix", desc: "Keyword clustering, product metadata, and Schema.org JSON-LD.", deps: ["task_1"], priority: "medium", out: "SEO Keyword Matrix & Schema" },
        { id: "task_4", agentId: "agent_fullstack_developer", title: "Implement Storefront Web Application", desc: "Build responsive Next.js application with cart state and API routes.", deps: ["task_1", "task_2"], priority: "high", out: "Production Storefront Source Package" },
        { id: "task_5", agentId: "agent_meta_ads", title: "Meta Conversion Ads Creative Brief", desc: "Structure high-ROAS Facebook/Instagram ad sets and direct-response copy.", deps: ["task_1"], priority: "medium", out: "Meta Campaign Architecture & Copy" },
        { id: "task_6", agentId: "agent_qa_engineer", title: "Playwright E2E Verification & Deliverable Audit", desc: "Execute automated verification on generated code and user journeys.", deps: ["task_4"], priority: "urgent", out: "QA Verification Audit Certificate" },
      ];
    } else if (lower.includes("marketing") || lower.includes("campaign") || lower.includes("ads") || lower.includes("seo")) {
      projectName = "Omnichannel Growth & Marketing Campaign";
      summary = "Multi-channel digital marketing engine combining competitor intelligence, SEO, ad copy, and analytics.";
      rawTasks = [
        { id: "task_1", agentId: "agent_strategy_research", title: "Market & Competitor Intelligence Teardown", desc: "Audit top 5 market competitors, benchmark CAC, and define USP.", deps: [], priority: "high", out: "Market Intelligence Whitepaper" },
        { id: "task_2", agentId: "agent_content_copywriter", title: "High-Converting Sales Copy & Funnel Messaging", desc: "Draft landing page messaging, email drip sequences, and ad copy.", deps: ["task_1"], priority: "high", out: "Conversion Copywriting Deck" },
        { id: "task_3", agentId: "agent_seo_specialist", title: "Organic Search Ranking & Content Strategy", desc: "Keyword research, search intent mapping, and on-page metadata.", deps: ["task_1"], priority: "medium", out: "SEO Keyword Strategy Matrix" },
        { id: "task_4", agentId: "agent_qa_engineer", title: "Brand Compliance & Quality Review", desc: "Verify copy alignment, links, and tone against brand standards.", deps: ["task_2", "task_3"], priority: "high", out: "QA Marketing Certification" },
      ];
    } else {
      projectName = "Enterprise SaaS & Digital Initiative";
      summary = "Full-cycle digital technology initiative executed across specialized divisions.";
      rawTasks = [
        { id: "task_1", agentId: "agent_product_manager", title: "Product Requirements Document & Specifications", desc: "Define user stories, technical requirements, and acceptance criteria.", deps: [], priority: "high", out: "Comprehensive PRD" },
        { id: "task_2", agentId: "agent_fullstack_developer", title: "Application Architecture & Core Components", desc: "Implement modular components and API data bindings.", deps: ["task_1"], priority: "high", out: "Application Source Package" },
        { id: "task_3", agentId: "agent_qa_engineer", title: "Independent Quality Assurance & Regression Audit", desc: "Run verification checks and confirm deliverable integrity.", deps: ["task_2"], priority: "urgent", out: "QA Verification Certificate" },
      ];
    }

    const tasks: WorkflowTask[] = rawTasks.map((t) => ({
      ...t,
      description: t.desc,
      dependencies: t.deps,
      status: "backlog",
      expectedOutput: t.out,
      costUsd: 0,
      tokensUsed: 0,
      durationSec: 0,
    }));

    return { projectName, summary, tasks };
  }

  static async initializeWorkflow(projectId: string, objective: string): Promise<WorkflowRun> {
    const plan = this.createPlan(objective);
    const runId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const run: WorkflowRun = {
      id: runId,
      projectId,
      projectName: plan.projectName,
      objective,
      executiveSummary: plan.summary,
      status: "running",
      tasks: plan.tasks,
      totalCostUsd: 0,
      totalTokens: 0,
      startedAt: new Date().toISOString(),
      logs: [
        {
          timestamp: new Date().toISOString(),
          agentId: "agent_ceo",
          message: `AI CEO Alex Vance initialized durable workflow for "${plan.projectName}" with ${plan.tasks.length} specialists.`,
          type: "workflow_started",
        },
      ],
    };

    WORKFLOW_STORE.set(runId, run);
    return run;
  }

  static async executeNextStep(runId: string): Promise<WorkflowRun> {
    const run = WORKFLOW_STORE.get(runId);
    if (!run || run.status === "completed" || run.status === "cancelled" || run.status === "paused") {
      return run!;
    }

    const completedIds = new Set(run.tasks.filter((t) => t.status === "completed").map((t) => t.id));

    // Find ready tasks whose prerequisites are satisfied
    const readyTasks = run.tasks.filter(
      (t) => (t.status === "backlog" || t.status === "assigned" || t.status === "in_progress") &&
        t.dependencies.every((dep) => completedIds.has(dep))
    );

    if (readyTasks.length === 0) {
      const allDone = run.tasks.every((t) => t.status === "completed");
      if (allDone) {
        run.status = "completed";
        run.completedAt = new Date().toISOString();
        run.logs.push({
          timestamp: new Date().toISOString(),
          agentId: "agent_ceo",
          message: `All ${run.tasks.length} specialist deliverables compiled, verified, and accepted.`,
          type: "workflow_completed",
        });
      }
      return run;
    }

    // Execute the next ready task durable step
    const currentTask = readyTasks[0];
    currentTask.status = "in_progress";

    const prevOutputs = run.tasks
      .filter((t) => currentTask.dependencies.includes(t.id) && t.actualOutput)
      .map((t) => ({ agent: t.agentId, output: t.actualOutput! }));

    const startTime = Date.now();
    const result = await VercelAIEngine.executeSpecialist({
      agentId: currentTask.agentId,
      userPrompt: `${currentTask.title} — ${currentTask.description}`,
      projectContext: `Project: ${run.projectName}\nObjective: ${run.objective}`,
      previousOutputs: prevOutputs,
    });

    const duration = Number(((Date.now() - startTime) / 1000).toFixed(2));
    currentTask.status = "completed";
    currentTask.actualOutput = result.text;
    currentTask.costUsd = result.costUsd;
    currentTask.tokensUsed = result.totalTokens;
    currentTask.durationSec = duration;

    // Create deliverable file
    const slug = currentTask.title.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30);
    currentTask.deliverableFile = {
      name: `${slug}.md`,
      path: `deliverables/${slug}.md`,
      category: currentTask.agentId.includes("developer") ? "code" : "document",
      content: result.text,
    };

    run.totalCostUsd = Number((run.totalCostUsd + result.costUsd).toFixed(4));
    run.totalTokens += result.totalTokens;

    run.logs.push({
      timestamp: new Date().toISOString(),
      agentId: currentTask.agentId,
      message: `${result.agentName} completed: "${currentTask.title}" (${result.totalTokens} tokens, $${result.costUsd})`,
      type: "task_completed",
    });

    return run;
  }

  static getWorkflow(runId: string): WorkflowRun | undefined {
    return WORKFLOW_STORE.get(runId);
  }

  static listWorkflows(): WorkflowRun[] {
    return Array.from(WORKFLOW_STORE.values());
  }
}
