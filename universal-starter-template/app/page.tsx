'use client';

import { Amplify } from 'aws-amplify';

// Import generated Amplify outputs when available
// import outputs from '@/amplify_outputs.json';
// Amplify.configure(outputs);

export default function Home() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center p-24"
    >
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Universal Starter Template
        </h1>
        <p className="text-lg text-muted-foreground">
          Production-ready Next.js 15 + AWS Amplify Gen2 starter template.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="p-6 border rounded-lg">
            <h2 className="font-semibold mb-2">Getting Started</h2>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Run the discovery questionnaire</li>
              <li>Customize your CLAUDE.md</li>
              <li>Deploy with Amplify</li>
            </ol>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="font-semibold mb-2">Included</h2>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Next.js 15 + React 19</li>
              <li>AWS Amplify Gen2</li>
              <li>Tailwind CSS 4</li>
              <li>TypeScript</li>
            </ul>
          </div>
        </div>

        <div className="pt-4">
          <code className="bg-muted px-4 py-2 rounded text-sm">
            npx tsx scripts/discover.ts
          </code>
        </div>
      </div>
    </main>
  );
}
