# EHR Implementation Plan

Optimized for Claude Code development. Each phase builds on the previous.

## Phase Overview

| Phase | Name | Dependencies | Priority |
|-------|------|--------------|----------|
| 0 | Foundation & Infrastructure | None | CRITICAL |
| 1 | Billing Company Core | Phase 0 | CRITICAL |
| 2 | Claims Workflow | Phase 1 | CRITICAL |
| 3 | Operating Modes System | Phase 2 | HIGH |
| 4 | AI Agents | Phase 3 | HIGH |
| 5 | Medical Coding | Phase 2 | MEDIUM |
| 6 | Practice Management | Phase 1 | MEDIUM |
| 7 | Patient Portal | Phase 2, 6 | MEDIUM |
| 8 | Reporting & Analytics | Phase 2 | MEDIUM |
| 9 | SaaS & Multi-Tenancy | Phase 1-8 | LOW |

## Development Principles

1. **Manual First** - Build manual workflows before AI automation
2. **Vertical Slices** - Complete features end-to-end (model → API → UI)
3. **Test As You Go** - Each subphase should be testable
4. **Reuse Patterns** - Establish patterns in Phase 0, replicate throughout

## Tech Stack Reference

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, shadcn/ui
- **Backend**: AWS Amplify Gen2, GraphQL, DynamoDB
- **Storage**: S3 for documents
- **Auth**: Cognito (email/password)
- **AI**: Claude API (vision + text)

## File Structure Convention

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Auth pages (login, register)
│   ├── (dashboard)/       # Protected dashboard routes
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   ├── tables/            # Data tables
│   └── [feature]/         # Feature-specific components
├── lib/
│   ├── api/               # API client functions
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   └── validations/       # Zod schemas
└── amplify/
    ├── data/              # Data models (already defined)
    ├── functions/         # Lambda functions
    └── storage/           # S3 configuration
```

## How to Use This Plan

1. Read the phase file before starting
2. Work through subphases sequentially
3. Each subphase lists specific files/components to create
4. Reference existing data models in `amplify/data/resource.ts`
5. Commit after each completed subphase
