# Implementation Plan Template

Use this template structure when creating implementation plans.

---

# Implementation Plan: [Project Name]

## Overview

[Brief description of what we're building and why]

**Domain:** [Type of application]
**Primary Users:** [Target users]
**AI Integration:** [None / Minimal / Hybrid / Full AI]

---

## Phase Dependencies

```
Phase 0 ─┬─> Phase 1 ─┬─> Phase 2
         │            └─> Phase 3
         └─> Phase 4 ────> Phase 5
```

---

## Phase 0: Foundation (CRITICAL)

**Priority:** Critical - Must complete first
**Dependencies:** None

Set up the base project, authentication, and core components.

### 0.1 Project Setup

**Description:** Install and configure dependencies

**Tasks:**
- [ ] Install shadcn/ui components
- [ ] Set up react-hook-form and Zod
- [ ] Configure TanStack Query
- [ ] Add utility libraries

**Acceptance Criteria:**
- All dependencies installed
- No TypeScript errors
- Dev server runs without issues

<details>
<summary>Claude Code Prompt</summary>

```
[Paste the prompt here]
```

</details>

---

### 0.2 Authentication UI

**Description:** Build login, register, and password reset flows

**Tasks:**
- [ ] Create login page
- [ ] Create registration page
- [ ] Build password reset flow
- [ ] Add auth state management

**Acceptance Criteria:**
- Users can register new accounts
- Users can log in and log out
- Password reset emails are sent
- Auth state persists across refreshes

<details>
<summary>Claude Code Prompt</summary>

```
[Paste the prompt here]
```

</details>

---

### 0.3 Core UI Components

**Description:** Set up shared UI components

**Tasks:**
- [ ] Install essential shadcn/ui components
- [ ] Create layout components
- [ ] Build loading states
- [ ] Create error boundary

**Acceptance Criteria:**
- Components render correctly
- Dark mode works
- Responsive on all screen sizes
- Accessible (keyboard nav, screen readers)

---

### 0.4 Data Layer Setup

**Description:** Create API client and data fetching patterns

**Tasks:**
- [ ] Create Amplify client wrapper
- [ ] Build generic query hooks
- [ ] Create mutation helpers
- [ ] Set up optimistic updates

**Acceptance Criteria:**
- Can fetch data from GraphQL
- Mutations work correctly
- Loading and error states handled
- Types are inferred correctly

---

### 0.5 Dashboard Shell

**Description:** Build the main application layout

**Tasks:**
- [ ] Create dashboard layout
- [ ] Build responsive sidebar
- [ ] Add navigation
- [ ] Create dashboard home

**Acceptance Criteria:**
- Layout is responsive
- Navigation works
- Protected routes redirect to login
- Dashboard renders placeholder content

---

## Phase 1: [Core Domain Feature]

**Priority:** Critical
**Dependencies:** Phase 0

[Description of this phase]

### 1.1 [Sub-feature Name]

**Description:** [What this sub-phase accomplishes]

**Tasks:**
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

**Acceptance Criteria:**
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]

<details>
<summary>Claude Code Prompt</summary>

```
[Detailed prompt for Claude Code]
```

</details>

---

## Phase N: [Feature Name]

**Priority:** [Critical / High / Medium / Low]
**Dependencies:** [Phase X, Phase Y]

[Description]

### N.1 [Sub-feature]

[Same structure as above]

---

## Appendix: Data Models

### [Entity Name]

```typescript
EntityName: a.model({
  field1: a.string().required(),
  field2: a.integer(),
  // ...
})
```

### [Another Entity]

```typescript
// ...
```

---

## Appendix: API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/... | GET | ... |
| /api/... | POST | ... |

---

## Appendix: Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| ... | ... | Yes/No |

---

## Notes

- [Important note 1]
- [Important note 2]
- [Decisions made during planning]
