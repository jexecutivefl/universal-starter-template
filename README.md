# Universal Starter Template

A modern, production-ready starter template for building full-stack applications with AWS Amplify Gen2, Next.js 15, React 19, and Tailwind CSS 4.

## Features

- **AWS Amplify Gen2** - Type-safe backend with authentication, database, and storage
- **Next.js 15** - Latest React framework with App Router and Server Components
- **React 19** - Modern React with improved performance and developer experience
- **Tailwind CSS 4** - Utility-first CSS with dark mode support
- **TypeScript** - Full type safety across frontend and backend
- **Authentication** - Email/password auth with AWS Cognito (extendable to social login)
- **Database** - Type-safe GraphQL API with authorization rules
- **Dev Tools** - ESLint, Prettier, and best practices baked in

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- AWS Account (for deployment)
- Git

### Local Development

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd universal-starter-template
```

2. **Install dependencies**

```bash
npm install
```

3. **Start the Amplify sandbox**

This creates a cloud development environment with authentication and database:

```bash
npx ampx sandbox
```

Wait for "Deployed" message - this sets up your AWS resources.

4. **Run the development server** (in a new terminal)

```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
.
├── app/                      # Next.js App Router
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Root layout
│   ├── dashboard/           # Example authenticated page
│   └── login/               # Login page
├── amplify/                 # AWS Amplify backend
│   ├── auth/                # Authentication config
│   ├── data/                # Data models (GraphQL schema)
│   └── backend.ts           # Backend definition
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   └── auth/                # Authentication components
├── lib/                     # Utility functions
│   └── utils/               # Helper functions
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
├── CLAUDE.md               # AI development guidelines
└── AMPLIFY_GEN2_GUIDELINES.md  # Amplify-specific rules
```

## Key Files to Customize

### 1. Data Schema (`/amplify/data/resource.ts`)

Define your data models here. The starter includes example `UserProfile` and `Task` models:

```typescript
const schema = a.schema({
  Task: a
    .model({
      title: a.string().required(),
      status: a.enum(["todo", "in_progress", "done"]),
      // ... your fields
    })
    .authorization((allow) => [allow.owner()]),
});
```

### 2. Landing Page (`/app/page.tsx`)

Customize the marketing landing page with your branding and messaging.

### 3. Authentication (`/amplify/auth/resource.ts`)

Configure authentication settings, add social providers, enable MFA, etc.

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Authentication

The template uses AWS Cognito for authentication. Users can:

- Sign up with email/password
- Sign in to existing accounts
- Reset forgotten passwords
- Access protected routes (example: `/dashboard`)

See `/components/auth/login-form.tsx` for the authentication UI.

## Database & API

Data is managed through AWS Amplify Data (AppSync GraphQL):

- **Type-safe client** - Auto-generated TypeScript types
- **Real-time subscriptions** - Data updates automatically
- **Authorization** - Owner-based, group-based, or custom rules
- **Relationships** - One-to-many, many-to-many support

Example usage:

```typescript
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

// Create
await client.models.Task.create({ title: "My task" });

// Read
const { data } = await client.models.Task.list();

// Update
await client.models.Task.update({ id, title: "Updated" });

// Delete
await client.models.Task.delete({ id });
```

## Deployment

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to AWS Amplify

1. Push your code to GitHub
2. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
3. Click "New app" → "Host web app"
4. Connect your GitHub repository
5. Amplify auto-detects settings and deploys

Your app will be live at `https://[branch].[app-id].amplifyapp.com`

## Environment Variables

Create a `.env.local` file for local environment variables:

```bash
# Add your custom environment variables here
NEXT_PUBLIC_APP_NAME=Universal Starter Template
```

## Documentation

- [Getting Started Guide](./docs/GETTING_STARTED.md) - Detailed setup instructions
- [Deployment Guide](./docs/DEPLOYMENT.md) - How to deploy to AWS
- [CLAUDE.md](./CLAUDE.md) - AI-assisted development guidelines
- [AMPLIFY_GEN2_GUIDELINES.md](./AMPLIFY_GEN2_GUIDELINES.md) - Amplify Gen2 best practices

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Backend:** AWS Amplify Gen2 (AppSync GraphQL, DynamoDB, Cognito)
- **Auth:** AWS Cognito with email/password (extendable to social)
- **Deployment:** AWS Amplify Hosting
- **Dev Tools:** ESLint, Prettier, Turbopack

## Learn More

### Next.js

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)

### AWS Amplify Gen2

- [Amplify Gen2 Documentation](https://docs.amplify.aws/gen2/)
- [Amplify Data (GraphQL)](https://docs.amplify.aws/gen2/build-a-backend/data/)
- [Amplify Auth](https://docs.amplify.aws/gen2/build-a-backend/auth/)

### Tailwind CSS

- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS v4 Beta](https://tailwindcss.com/docs/v4-beta)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions:

- Check the [documentation](./docs/)
- Review [CLAUDE.md](./CLAUDE.md) for development guidelines
- Open an issue on GitHub
