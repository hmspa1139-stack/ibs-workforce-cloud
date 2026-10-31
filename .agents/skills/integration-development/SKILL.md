---
name: integration-development
description: Procedures for developing and maintaining third-party adapters (OpenAI, GitHub, Google Drive, Gmail, Meta Ads, Google Ads, Playwright, ImageGen, Hosting).
---

# Integration Development Skill

## Principles
1. **Genuine Adapters**: Every integration adapter implements authentication checks, status verification, error reporting, and test connection methods.
2. **Strict Transparency**: Never report "Connected" unless valid credentials have been verified with the external provider.
3. **Approval Interception**: Outbound publishing or spending actions in Meta Ads, Google Ads, Gmail, or Production Hosting must route through the Approval Center before execution.
4. **Mock Mode for Development**: Provide cleanly marked mock responses for automated test suites and local development without active billing credentials.
