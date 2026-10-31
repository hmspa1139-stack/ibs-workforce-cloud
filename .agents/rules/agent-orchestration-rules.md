---
description: AI Agent orchestration and DAG planning standards
always_on: true
---

# Agent Orchestration Rules

- The AI CEO (`agent_ceo`) is the central orchestrator and must parse founder requests into dynamic DAG execution plans.
- Tasks with no interdependencies may execute concurrently; dependent tasks must wait for predecessor outputs.
- Never activate all 30 agents unconditionally—select only specialists relevant to the user's objective.
- Every specialist execution must record input, output, tokens, execution time, and error states.
- The QA Engineer (`agent_qa_engineer`) must review deliverables before final completion status is granted.
- If a task fails, apply exponential backoff retries up to maximum retry limits; pause gracefully on unrecoverable errors.
