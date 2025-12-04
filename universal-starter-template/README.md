# Universal Starter Template

A production-ready starter template for building SaaS applications with **Next.js 15**, **AWS Amplify Gen2**, and **Claude Code** as your AI development partner.

## What's Included

- **Next.js 15** with App Router and Turbopack
- **React 19** with latest features
- **AWS Amplify Gen2** for backend (auth, data, storage)
- **Tailwind CSS 4** for styling
- **TypeScript** throughout
- **shadcn/ui** component system
- **TanStack Query** for data fetching
- **react-hook-form + Zod** for forms
- **Project Discovery CLI** - generate customized CLAUDE.md and implementation plans
- **Prompt Library** - pre-written prompts for common features

## Quick Start

### 1. Clone or Copy the Template

```bash
# Copy the template to a new project
cp -r universal-starter-template my-new-project
cd my-new-project
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Discovery Questionnaire

```bash
npx tsx scripts/discover.ts
```

This interactive CLI will ask about your project and generate:
- **CLAUDE.md** - Customized AI development instructions
- **IMPLEMENTATION_PLAN.md** - Phased development plan
- **Individual phase files** with Claude Code prompts

### 4. Set Up Amplify

```bash
# Initialize Amplify sandbox
npx ampx sandbox
```

### 5. Start Development

```bash
npm run dev
```

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (login, register)
│   ├── (dashboard)/         # Protected dashboard routes
│   └── globals.css          # Global styles + theme
├── amplify/                  # AWS Amplify Gen2 backend
│   ├── auth/                # Cognito configuration
│   ├── data/                # GraphQL schema
│   └── backend.ts           # Backend composition
├── components/               # React components
│   ├── ui/                  # shadcn/ui components
│   ├── layout/              # Layout components
│   └── shared/              # Shared components
├── lib/                      # Utilities and hooks
│   ├── api/                 # API client and hooks
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Utility functions
│   └── validations/         # Zod schemas
├── patterns/                 # Reusable patterns
│   ├── data-models/         # Data model templates
│   └── features/            # Feature implementation patterns
├── prompts/                  # Claude Code prompts
│   ├── phase-0-foundation.md
│   ├── crud-feature.md
│   ├── ai-features.md
│   └── common-patterns.md
├── scripts/                  # CLI tools
│   └── discover.ts          # Project discovery questionnaire
├── CLAUDE.md                 # AI development instructions
└── CLAUDE.template.md        # Template for generating CLAUDE.md
```

## Using with Claude Code

### The Discovery Process

1. **Run the questionnaire** - Answer questions about your project
2. **Review generated files** - Check CLAUDE.md and implementation plan
3. **Copy CLAUDE.md to root** - Replace the template with your customized version
4. **Follow the phases** - Each phase has specific prompts for Claude Code

### Using the Prompts

The `/prompts` directory contains pre-written prompts for common tasks:

```markdown
# Example: Building a CRUD feature

Copy this prompt to Claude Code:

"Implement complete CRUD for Product:

## Data Model
Add to amplify/data/resource.ts:
Product: a.model({
  organizationId: a.id().required(),
  name: a.string().required(),
  price: a.float().required(),
  status: a.enum(['active', 'inactive']),
  createdAt: a.datetime(),
})

..."
```

### Phase-by-Phase Development

1. **Phase 0: Foundation** - Always start here
   - Install components
   - Set up auth
   - Create layouts
   - Build data layer

2. **Phase 1+: Core Features** - Based on your discovery answers
   - Each phase has detailed prompts
   - Complete phases in order
   - Commit after each sub-phase

## Key Features

### Multi-Tenancy

All data models include `organizationId` for tenant isolation:

```typescript
Product: a.model({
  organizationId: a.id().required(),
  name: a.string().required(),
  // ...
})
```

### Operating Modes (AI/Hybrid/Manual)

Built-in support for three operating modes:

- **Full AI** - Autonomous processing with human oversight
- **Hybrid** - AI assists, humans decide
- **Manual** - Traditional workflow without AI

### Audit Logging

Track all changes for compliance:

```typescript
AuditLog: a.model({
  organizationId: a.id().required(),
  action: a.string().required(),
  entityType: a.string().required(),
  previousValue: a.json(),
  newValue: a.json(),
  createdAt: a.datetime(),
})
```

### AI Task Processing

Queue and process AI tasks with confidence scoring:

```typescript
AITask: a.model({
  status: a.enum(['pending', 'processing', 'completed', 'requires_review']),
  confidenceScore: a.float(),
  requiresHumanReview: a.boolean(),
  // ...
})
```

## Scripts

```bash
# Start development server
npm run dev

# Run discovery questionnaire
npm run discover

# Type checking
npm run typecheck

# Linting
npm run lint

# Formatting
npm run format

# Run tests
npm run test

# Run E2E tests
npm run e2e
```

## Protected Files

These files should not be modified without careful consideration:

| File | Why It's Protected |
|------|-------------------|
| `amplify.yml` | Build pipeline configuration |
| `amplify/` | Backend infrastructure |
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `*.config.js/ts` | Framework configurations |

## Customization

### Adding a New Entity

1. Add model to `amplify/data/resource.ts`
2. Create API hooks in `lib/api/`
3. Create validation schemas in `lib/validations/`
4. Create pages in `app/(dashboard)/`
5. Create components in `components/`

### Adding a New Feature

1. Check if a prompt exists in `/prompts`
2. Copy and customize the prompt
3. Run with Claude Code
4. Review and test

### Changing Styles

1. Modify CSS variables in `app/globals.css`
2. Update Tailwind theme if needed
3. Component styles are in `components/ui/`

## Deployment

### Amplify Hosting

```bash
# Connect your repo to Amplify Hosting
# Amplify will detect the Next.js app automatically
```

### Environment Variables

Required in production:
- Cognito configuration (auto-generated by Amplify)
- Any API keys for integrations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT
