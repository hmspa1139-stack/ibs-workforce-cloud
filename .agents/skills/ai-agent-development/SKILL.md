---
name: ai-agent-development
description: Standards for defining, executing, and testing the 30 specialized AI agents in the IBS AI Workforce runtime.
---

# AI Agent Development Skill

## Overview
Every one of the 30 IBS AI agents has a unique profile, designation, department, mission, system instructions, accepted inputs, expected outputs, tool permissions, and quality checklists.

## Development Patterns
1. Follow the OpenAI Agents SDK patterns:
   - Dedicated agent runners with tool definitions.
   - Dynamic prompt injection with context scopes.
   - Structured JSON schema validation for outputs.
2. Provider Agnostic:
   - Provide an abstraction layer (`AIProviderAdapter`) that supports OpenAI, compatible providers, and a resilient offline mock mode for testing without active billing keys.
3. QA Validation:
   - All code and critical deliverables must undergo review by `agent_qa_engineer` before being marked as completed.
