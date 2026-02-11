# Product Requirements: Emergent-Style AI Software Builder

## 1. Vision
Enable teams to ship software by describing intent while AI agents handle planning, coding, testing, and deployment under human control.

## 2. Users
- Founder / PM: wants to quickly prototype and ship features.
- Engineer: wants AI to handle repetitive implementation tasks.
- Team lead: needs governance, auditability, and predictable cost.

## 3. Primary Jobs-to-be-Done
1. "Turn my request into a scoped technical plan."
2. "Implement the plan in code with minimal manual work."
3. "Show me what changed and let me approve deployment safely."

## 4. MVP Functional Requirements

### 4.1 Auth + Tenancy
- Email/password and OAuth login.
- Workspace and project ownership.
- Role-based access: owner, editor, viewer.

### 4.2 Project + Run Management
- Create project and connect repository.
- Store run history and statuses.
- Display step-level timeline and logs.

### 4.3 Agent Planning
- Convert prompt into milestones + tasks.
- Show risk/assumption summary.
- Require user approval before execution.

### 4.4 Agent Execution
- Tools: file write/read, shell, git, tests.
- Task retries with bounded limits.
- Failure summarization with suggested fixes.

### 4.5 Git Automation
- Create branch per run.
- Commit grouped changes by task.
- Open PR with summary and test results.

### 4.6 Deploy + Rollback
- One provider integration for preview deploy.
- Capture deployment logs and health status.
- Rollback to prior successful release.

### 4.7 Governance + Safety
- Approval gates before deploy/destructive commands.
- Immutable audit log for tool invocations.
- Secret redaction and access isolation.

## 5. Non-Functional Requirements
- Reliability: 99.5% run orchestration availability for MVP.
- Security: containerized execution isolation.
- Observability: structured logs + traces per run.
- Cost control: model/token budgets per workspace.

## 6. Out of Scope (MVP)
- Multi-cloud deployment orchestration.
- Skill marketplace.
- Multi-repo graph refactors.
- Fully autonomous no-approval production deploys.

## 7. KPIs
- Time to first successful preview.
- Successful run completion rate.
- PR merge rate.
- Mean retries per run.
- Gross margin per run.
