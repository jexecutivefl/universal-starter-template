# Getting Started Guide

This guide walks you through setting up a new project using the Universal Starter Template.

## Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **AWS Account** - [Sign up](https://aws.amazon.com/)
- **AWS CLI configured** - [Setup guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- **Claude Code** - Your AI development partner

## Step 1: Create Your Project

```bash
# Copy the template
cp -r universal-starter-template my-project
cd my-project

# Initialize git
git init
git add .
git commit -m "Initial commit from universal-starter-template"
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Next.js 15 and React 19
- AWS Amplify SDK
- UI components (shadcn/ui)
- Form handling (react-hook-form, Zod)
- Data fetching (TanStack Query)
- Styling (Tailwind CSS 4)

## Step 3: Run the Discovery Questionnaire

```bash
npx tsx scripts/discover.ts
```

The questionnaire asks about:

1. **Project Identity**
   - Name and description
   - Domain type (SaaS, healthcare, fintech, etc.)
   - Problem you're solving

2. **Users & Personas**
   - Who uses your application
   - Their roles and goals
   - Access levels needed

3. **Features**
   - Authentication methods
   - Core features needed
   - AI integration level

4. **Data Entities**
   - Main domain objects
   - Fields and relationships
   - Workflow states

5. **Compliance**
   - HIPAA, SOC2, GDPR, PCI-DSS
   - Security requirements

6. **Scale**
   - Expected users
   - Data volume

### Generated Files

After completing the questionnaire, you'll find:

```
generated/
├── CLAUDE.md              # Copy to project root
├── IMPLEMENTATION_PLAN.md # Your development roadmap
├── project-config.json    # Your answers for reference
└── phases/
    ├── phase-0.md         # Foundation phase
    ├── phase-1.md         # Core domain
    └── ...                # Additional phases
```

## Step 4: Set Up CLAUDE.md

```bash
# Copy generated CLAUDE.md to project root
cp generated/CLAUDE.md ./CLAUDE.md
```

Review and customize:
- Add project-specific constraints
- Adjust protected files if needed
- Add domain-specific patterns

## Step 5: Initialize Amplify

```bash
# Start Amplify sandbox (local development)
npx ampx sandbox
```

This creates:
- Local DynamoDB
- Cognito user pool
- GraphQL API
- Generated types (`amplify_outputs.json`)

Keep this running in a terminal during development.

## Step 6: Start Development

```bash
# In a new terminal
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Step 7: Follow Your Implementation Plan

Open `generated/IMPLEMENTATION_PLAN.md` and start with Phase 0.

### Example: Implementing Phase 0.1

1. Open the phase file: `generated/phases/phase-0.md`
2. Find the Claude Code prompt for sub-phase 0.1
3. Copy the prompt to Claude Code
4. Review and test the implementation
5. Commit your changes:
   ```bash
   git add .
   git commit -m "Phase 0.1: Project setup with shadcn/ui"
   ```
6. Move to the next sub-phase

## Project Structure After Setup

```
my-project/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── amplify/
│   ├── auth/resource.ts
│   ├── data/resource.ts
│   └── backend.ts
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── layout/       # Layout components
│   └── shared/       # Shared components
├── lib/
│   ├── api/          # API client and hooks
│   ├── hooks/        # Custom hooks
│   ├── utils/        # Utilities
│   └── validations/  # Zod schemas
├── generated/        # Discovery output
├── prompts/          # Claude Code prompts
├── CLAUDE.md         # AI instructions
└── package.json
```

## Common Tasks

### Adding a New Data Model

1. Edit `amplify/data/resource.ts`
2. Restart `ampx sandbox`
3. Create API hooks in `lib/api/`
4. Create validation schemas
5. Build UI pages and components

### Adding a New Page

1. Create file in `app/(dashboard)/feature/page.tsx`
2. Use the layout from existing pages
3. Connect to data with hooks

### Adding a New Component

1. Check if shadcn/ui has it: [ui.shadcn.com](https://ui.shadcn.com)
2. If yes: `npx shadcn@latest add button`
3. If no: Create in `components/shared/`

## Deployment

### To Amplify Hosting

1. Push to GitHub
2. Connect repo in AWS Amplify Console
3. Amplify detects Next.js automatically
4. Deploy!

### Environment Variables

Set in Amplify Console:
- Any external API keys
- Feature flags
- Environment-specific config

## Troubleshooting

### Amplify Sandbox Won't Start

```bash
# Check AWS credentials
aws sts get-caller-identity

# Try resetting sandbox
npx ampx sandbox --delete
npx ampx sandbox
```

### TypeScript Errors

```bash
# Regenerate Amplify types
npx ampx sandbox  # Restart sandbox
npm run typecheck
```

### Component Not Found

```bash
# Reinstall shadcn/ui component
npx shadcn@latest add component-name
```

## Next Steps

1. Complete Phase 0 (Foundation)
2. Move through your implementation plan
3. Use prompts from `/prompts` for guidance
4. Customize as you learn the codebase
5. Deploy to production when ready

## Getting Help

- **Amplify Docs**: [docs.amplify.aws](https://docs.amplify.aws)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **shadcn/ui Docs**: [ui.shadcn.com](https://ui.shadcn.com)
- **Claude Code**: Your AI development partner
