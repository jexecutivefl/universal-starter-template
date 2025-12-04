#!/usr/bin/env tsx
/**
 * Project Discovery Questionnaire
 *
 * Interactive CLI that guides you through defining your project,
 * then generates:
 * - Customized CLAUDE.md
 * - Implementation plan with phases
 * - Data model scaffolding
 * - Feature configuration
 *
 * Usage: npx tsx scripts/discover.ts
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

interface ProjectConfig {
  // Identity
  projectName: string;
  projectSlug: string;
  projectDescription: string;
  domainType: DomainType;
  domainDescription: string;

  // Users & Access
  personas: Persona[];
  authMethods: AuthMethod[];
  hasMultiTenancy: boolean;

  // Features
  features: Feature[];
  aiIntegration: AIIntegrationLevel;

  // Technical
  dataEntities: DataEntity[];
  integrations: Integration[];

  // Compliance
  complianceRequirements: ComplianceRequirement[];

  // Scale
  expectedUsers: ScaleLevel;
  expectedDataVolume: ScaleLevel;
}

type DomainType =
  | 'saas_platform'
  | 'internal_tool'
  | 'marketplace'
  | 'healthcare'
  | 'fintech'
  | 'ecommerce'
  | 'education'
  | 'social'
  | 'productivity'
  | 'other';

interface Persona {
  name: string;
  role: string;
  goals: string[];
  accessLevel: 'admin' | 'power_user' | 'standard' | 'limited' | 'public';
}

type AuthMethod = 'email_password' | 'social_google' | 'social_github' | 'sso_saml' | 'mfa' | 'api_keys';

interface Feature {
  id: string;
  name: string;
  description: string;
  priority: 'must_have' | 'should_have' | 'nice_to_have';
  complexity: 'simple' | 'medium' | 'complex';
  dependencies: string[];
}

type AIIntegrationLevel = 'none' | 'minimal' | 'hybrid' | 'full_ai';

interface DataEntity {
  name: string;
  description: string;
  isCore: boolean;
  fields: EntityField[];
  relationships: EntityRelationship[];
}

interface EntityField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'json' | 'reference';
  required: boolean;
  description?: string;
}

interface EntityRelationship {
  type: 'has_one' | 'has_many' | 'belongs_to';
  target: string;
  fieldName: string;
}

interface Integration {
  type: 'payment' | 'email' | 'storage' | 'analytics' | 'search' | 'ai' | 'other';
  name: string;
  provider?: string;
}

interface ComplianceRequirement {
  name: string;
  description: string;
  requirements: string[];
}

type ScaleLevel = 'small' | 'medium' | 'large' | 'enterprise';

// ============================================================================
// Feature Catalog
// ============================================================================

const FEATURE_CATALOG: Record<string, Omit<Feature, 'priority'>> = {
  auth_basic: {
    id: 'auth_basic',
    name: 'Basic Authentication',
    description: 'Email/password login with session management',
    complexity: 'simple',
    dependencies: [],
  },
  auth_social: {
    id: 'auth_social',
    name: 'Social Authentication',
    description: 'Login with Google, GitHub, etc.',
    complexity: 'medium',
    dependencies: ['auth_basic'],
  },
  auth_mfa: {
    id: 'auth_mfa',
    name: 'Multi-Factor Authentication',
    description: 'TOTP/SMS verification for enhanced security',
    complexity: 'medium',
    dependencies: ['auth_basic'],
  },
  user_management: {
    id: 'user_management',
    name: 'User Management',
    description: 'User profiles, settings, and preferences',
    complexity: 'simple',
    dependencies: ['auth_basic'],
  },
  role_permissions: {
    id: 'role_permissions',
    name: 'Role-Based Access Control',
    description: 'Roles, permissions, and access control lists',
    complexity: 'medium',
    dependencies: ['user_management'],
  },
  multi_tenancy: {
    id: 'multi_tenancy',
    name: 'Multi-Tenancy',
    description: 'Organization-level data isolation',
    complexity: 'complex',
    dependencies: ['user_management'],
  },
  billing_subscription: {
    id: 'billing_subscription',
    name: 'Subscription Billing',
    description: 'Stripe integration for recurring payments',
    complexity: 'complex',
    dependencies: ['user_management'],
  },
  billing_usage: {
    id: 'billing_usage',
    name: 'Usage-Based Billing',
    description: 'Metered billing based on usage',
    complexity: 'complex',
    dependencies: ['billing_subscription'],
  },
  file_storage: {
    id: 'file_storage',
    name: 'File Storage',
    description: 'S3-based file uploads with presigned URLs',
    complexity: 'medium',
    dependencies: [],
  },
  notifications_email: {
    id: 'notifications_email',
    name: 'Email Notifications',
    description: 'Transactional and marketing emails',
    complexity: 'medium',
    dependencies: [],
  },
  notifications_inapp: {
    id: 'notifications_inapp',
    name: 'In-App Notifications',
    description: 'Real-time notification center',
    complexity: 'medium',
    dependencies: [],
  },
  notifications_push: {
    id: 'notifications_push',
    name: 'Push Notifications',
    description: 'Browser and mobile push notifications',
    complexity: 'complex',
    dependencies: ['notifications_inapp'],
  },
  search_basic: {
    id: 'search_basic',
    name: 'Basic Search',
    description: 'Full-text search across entities',
    complexity: 'simple',
    dependencies: [],
  },
  search_advanced: {
    id: 'search_advanced',
    name: 'Advanced Search',
    description: 'Faceted search with filters',
    complexity: 'medium',
    dependencies: ['search_basic'],
  },
  audit_logging: {
    id: 'audit_logging',
    name: 'Audit Logging',
    description: 'Track all user actions for compliance',
    complexity: 'medium',
    dependencies: [],
  },
  analytics_dashboard: {
    id: 'analytics_dashboard',
    name: 'Analytics Dashboard',
    description: 'Charts, metrics, and KPIs',
    complexity: 'medium',
    dependencies: [],
  },
  reporting: {
    id: 'reporting',
    name: 'Reporting',
    description: 'Generate and export reports',
    complexity: 'medium',
    dependencies: ['analytics_dashboard'],
  },
  ai_processing: {
    id: 'ai_processing',
    name: 'AI Processing Pipeline',
    description: 'Background AI tasks with Claude API',
    complexity: 'complex',
    dependencies: [],
  },
  ai_chat: {
    id: 'ai_chat',
    name: 'AI Chat Interface',
    description: 'Conversational AI assistant',
    complexity: 'medium',
    dependencies: ['ai_processing'],
  },
  operating_modes: {
    id: 'operating_modes',
    name: 'Operating Modes (AI/Hybrid/Manual)',
    description: 'Toggle between full AI, hybrid, and manual modes',
    complexity: 'complex',
    dependencies: ['ai_processing'],
  },
  workflow_engine: {
    id: 'workflow_engine',
    name: 'Workflow Engine',
    description: 'State machine-based workflow processing',
    complexity: 'complex',
    dependencies: [],
  },
  work_queues: {
    id: 'work_queues',
    name: 'Work Queues',
    description: 'Task assignment and queue management',
    complexity: 'medium',
    dependencies: ['workflow_engine'],
  },
  messaging: {
    id: 'messaging',
    name: 'Internal Messaging',
    description: 'User-to-user messaging system',
    complexity: 'medium',
    dependencies: ['user_management'],
  },
  api_public: {
    id: 'api_public',
    name: 'Public API',
    description: 'REST/GraphQL API for external consumers',
    complexity: 'medium',
    dependencies: [],
  },
  webhooks: {
    id: 'webhooks',
    name: 'Webhooks',
    description: 'Outbound event notifications',
    complexity: 'medium',
    dependencies: ['api_public'],
  },
};

// ============================================================================
// Compliance Templates
// ============================================================================

const COMPLIANCE_TEMPLATES: Record<string, ComplianceRequirement> = {
  hipaa: {
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act',
    requirements: [
      'Encrypt PHI at rest and in transit',
      'Implement access controls and audit logging',
      'Business Associate Agreements with vendors',
      'Employee training on PHI handling',
      'Incident response procedures',
    ],
  },
  soc2: {
    name: 'SOC 2',
    description: 'Service Organization Control 2',
    requirements: [
      'Security policies and procedures',
      'Access control management',
      'Change management processes',
      'Risk assessment and monitoring',
      'Vendor management',
    ],
  },
  gdpr: {
    name: 'GDPR',
    description: 'General Data Protection Regulation',
    requirements: [
      'User consent management',
      'Right to access/delete/export data',
      'Data processing agreements',
      'Privacy by design',
      'Breach notification procedures',
    ],
  },
  pci_dss: {
    name: 'PCI DSS',
    description: 'Payment Card Industry Data Security Standard',
    requirements: [
      'Never store card CVV',
      'Use tokenized payment processing',
      'Quarterly vulnerability scans',
      'Restrict access to cardholder data',
      'Maintain secure systems and applications',
    ],
  },
};

// ============================================================================
// CLI Utilities
// ============================================================================

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

function print(message: string = '') {
  console.log(message);
}

function printHeader(title: string) {
  print();
  print('═'.repeat(60));
  print(`  ${title}`);
  print('═'.repeat(60));
  print();
}

function printSection(title: string) {
  print();
  print(`── ${title} ${'─'.repeat(50 - title.length)}`);
  print();
}

async function selectOne<T extends string>(
  prompt: string,
  options: { value: T; label: string; description?: string }[]
): Promise<T> {
  print(prompt);
  print();
  options.forEach((opt, i) => {
    print(`  ${i + 1}. ${opt.label}`);
    if (opt.description) {
      print(`     ${opt.description}`);
    }
  });
  print();

  while (true) {
    const answer = await ask('Enter number: ');
    const index = parseInt(answer) - 1;
    if (index >= 0 && index < options.length) {
      return options[index].value;
    }
    print('Invalid selection. Please try again.');
  }
}

async function selectMany<T extends string>(
  prompt: string,
  options: { value: T; label: string; description?: string }[]
): Promise<T[]> {
  print(prompt);
  print('(Enter numbers separated by commas, e.g., 1,3,5)');
  print();
  options.forEach((opt, i) => {
    print(`  ${i + 1}. ${opt.label}`);
    if (opt.description) {
      print(`     ${opt.description}`);
    }
  });
  print();

  while (true) {
    const answer = await ask('Enter numbers: ');
    const indices = answer.split(',').map(s => parseInt(s.trim()) - 1);
    const valid = indices.every(i => i >= 0 && i < options.length);
    if (valid && indices.length > 0) {
      return indices.map(i => options[i].value);
    }
    print('Invalid selection. Please try again.');
  }
}

async function confirm(prompt: string): Promise<boolean> {
  const answer = await ask(`${prompt} (y/n): `);
  return answer.toLowerCase().startsWith('y');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================================================
// Questionnaire Steps
// ============================================================================

async function gatherProjectIdentity(): Promise<Partial<ProjectConfig>> {
  printHeader('PROJECT IDENTITY');

  const projectName = await ask('What is your project called? ');
  const projectSlug = slugify(projectName);
  const projectDescription = await ask('Describe your project in one sentence: ');

  const domainType = await selectOne<DomainType>(
    'What type of application are you building?',
    [
      { value: 'saas_platform', label: 'SaaS Platform', description: 'Multi-tenant software as a service' },
      { value: 'internal_tool', label: 'Internal Tool', description: 'Internal business application' },
      { value: 'marketplace', label: 'Marketplace', description: 'Two-sided marketplace connecting buyers and sellers' },
      { value: 'healthcare', label: 'Healthcare App', description: 'Medical, clinical, or health-related' },
      { value: 'fintech', label: 'Fintech App', description: 'Financial services or payments' },
      { value: 'ecommerce', label: 'E-commerce', description: 'Online store or commerce platform' },
      { value: 'education', label: 'Education', description: 'Learning management or education tech' },
      { value: 'social', label: 'Social Platform', description: 'Community or social networking' },
      { value: 'productivity', label: 'Productivity Tool', description: 'Task management, collaboration, or workflow' },
      { value: 'other', label: 'Other', description: 'Something else entirely' },
    ]
  );

  const domainDescription = await ask(
    'Describe the domain in more detail (what problem are you solving?): '
  );

  return {
    projectName,
    projectSlug,
    projectDescription,
    domainType,
    domainDescription,
  };
}

async function gatherPersonas(): Promise<Persona[]> {
  printHeader('USERS & PERSONAS');

  print('Let\'s define who will use your application.');
  print('You can add multiple user types.');
  print();

  const personas: Persona[] = [];
  let addMore = true;

  while (addMore) {
    printSection(`Persona ${personas.length + 1}`);

    const name = await ask('What do you call this user type? (e.g., Admin, Customer, Agent): ');
    const role = await ask('What is their role/job? (e.g., System administrator, Billing specialist): ');

    print('What are their main goals? (Enter each goal, empty line to finish)');
    const goals: string[] = [];
    while (true) {
      const goal = await ask(`  Goal ${goals.length + 1}: `);
      if (!goal) break;
      goals.push(goal);
    }

    const accessLevel = await selectOne<Persona['accessLevel']>(
      'What access level do they need?',
      [
        { value: 'admin', label: 'Admin', description: 'Full system access' },
        { value: 'power_user', label: 'Power User', description: 'Advanced features, limited admin' },
        { value: 'standard', label: 'Standard', description: 'Normal user access' },
        { value: 'limited', label: 'Limited', description: 'Restricted access' },
        { value: 'public', label: 'Public', description: 'Unauthenticated access' },
      ]
    );

    personas.push({ name, role, goals, accessLevel });

    addMore = await confirm('Add another persona?');
  }

  return personas;
}

async function gatherFeatures(): Promise<{ features: Feature[]; aiIntegration: AIIntegrationLevel }> {
  printHeader('FEATURES');

  print('Select the features your application needs.');
  print();

  // Group features by category
  const categories = {
    'Authentication & Users': ['auth_basic', 'auth_social', 'auth_mfa', 'user_management', 'role_permissions', 'multi_tenancy'],
    'Billing & Payments': ['billing_subscription', 'billing_usage'],
    'Storage & Files': ['file_storage'],
    'Notifications': ['notifications_email', 'notifications_inapp', 'notifications_push'],
    'Search & Discovery': ['search_basic', 'search_advanced'],
    'Compliance & Audit': ['audit_logging'],
    'Analytics & Reporting': ['analytics_dashboard', 'reporting'],
    'AI & Automation': ['ai_processing', 'ai_chat', 'operating_modes'],
    'Workflow': ['workflow_engine', 'work_queues'],
    'Communication': ['messaging'],
    'API & Integration': ['api_public', 'webhooks'],
  };

  const selectedFeatures: Feature[] = [];

  for (const [category, featureIds] of Object.entries(categories)) {
    printSection(category);

    const options = featureIds.map(id => ({
      value: id,
      label: FEATURE_CATALOG[id].name,
      description: FEATURE_CATALOG[id].description,
    }));

    print('Select features for this category:');
    print('(Enter numbers separated by commas, or press Enter to skip)');
    print();

    options.forEach((opt, i) => {
      print(`  ${i + 1}. ${opt.label}`);
      print(`     ${opt.description}`);
    });
    print();

    const answer = await ask('Enter numbers (or Enter to skip): ');
    if (answer) {
      const indices = answer.split(',').map(s => parseInt(s.trim()) - 1);
      for (const i of indices) {
        if (i >= 0 && i < options.length) {
          const featureId = options[i].value;
          const priority = await selectOne<Feature['priority']>(
            `Priority for "${FEATURE_CATALOG[featureId].name}"?`,
            [
              { value: 'must_have', label: 'Must Have', description: 'Critical for launch' },
              { value: 'should_have', label: 'Should Have', description: 'Important but not blocking' },
              { value: 'nice_to_have', label: 'Nice to Have', description: 'Future enhancement' },
            ]
          );
          selectedFeatures.push({
            ...FEATURE_CATALOG[featureId],
            priority,
          });
        }
      }
    }
  }

  // AI Integration Level
  printSection('AI Integration Level');

  const aiIntegration = await selectOne<AIIntegrationLevel>(
    'How much AI automation do you want?',
    [
      { value: 'none', label: 'None', description: 'No AI features' },
      { value: 'minimal', label: 'Minimal', description: 'AI assists with specific tasks' },
      { value: 'hybrid', label: 'Hybrid', description: 'AI does work, humans review and approve' },
      { value: 'full_ai', label: 'Full AI', description: 'AI operates autonomously with human oversight' },
    ]
  );

  return { features: selectedFeatures, aiIntegration };
}

async function gatherDataEntities(): Promise<DataEntity[]> {
  printHeader('CORE DATA ENTITIES');

  print('Define the main data entities in your domain.');
  print('These are the "nouns" of your application (e.g., User, Order, Product).');
  print();

  const entities: DataEntity[] = [];
  let addMore = true;

  while (addMore) {
    printSection(`Entity ${entities.length + 1}`);

    const name = await ask('Entity name (PascalCase, e.g., Customer, Invoice): ');
    const description = await ask('What does this entity represent? ');
    const isCore = await confirm('Is this a core entity (central to the domain)?');

    print('Add fields (enter empty name to finish):');
    const fields: EntityField[] = [];
    while (true) {
      const fieldName = await ask(`  Field name (camelCase): `);
      if (!fieldName) break;

      const fieldType = await selectOne<EntityField['type']>(
        `  Type for "${fieldName}":`,
        [
          { value: 'string', label: 'String' },
          { value: 'number', label: 'Number' },
          { value: 'boolean', label: 'Boolean' },
          { value: 'date', label: 'Date/DateTime' },
          { value: 'enum', label: 'Enum (fixed values)' },
          { value: 'json', label: 'JSON (flexible object)' },
          { value: 'reference', label: 'Reference (ID to another entity)' },
        ]
      );

      const required = await confirm(`  Is "${fieldName}" required?`);

      fields.push({ name: fieldName, type: fieldType, required });
    }

    entities.push({
      name,
      description,
      isCore,
      fields,
      relationships: [], // Could expand this
    });

    addMore = await confirm('Add another entity?');
  }

  return entities;
}

async function gatherCompliance(): Promise<ComplianceRequirement[]> {
  printHeader('COMPLIANCE & SECURITY');

  const requirements: ComplianceRequirement[] = [];

  const complianceTypes = await selectMany(
    'Does your application need to comply with any standards?',
    [
      { value: 'hipaa', label: 'HIPAA', description: 'Healthcare data (PHI)' },
      { value: 'soc2', label: 'SOC 2', description: 'Service organization controls' },
      { value: 'gdpr', label: 'GDPR', description: 'EU data protection' },
      { value: 'pci_dss', label: 'PCI DSS', description: 'Payment card data' },
    ]
  );

  for (const type of complianceTypes) {
    if (COMPLIANCE_TEMPLATES[type]) {
      requirements.push(COMPLIANCE_TEMPLATES[type]);
    }
  }

  return requirements;
}

async function gatherScale(): Promise<{ expectedUsers: ScaleLevel; expectedDataVolume: ScaleLevel }> {
  printHeader('SCALE EXPECTATIONS');

  const expectedUsers = await selectOne<ScaleLevel>(
    'How many users do you expect in the first year?',
    [
      { value: 'small', label: '< 100 users' },
      { value: 'medium', label: '100 - 10,000 users' },
      { value: 'large', label: '10,000 - 100,000 users' },
      { value: 'enterprise', label: '100,000+ users' },
    ]
  );

  const expectedDataVolume = await selectOne<ScaleLevel>(
    'How much data do you expect to store?',
    [
      { value: 'small', label: '< 1 GB' },
      { value: 'medium', label: '1 GB - 100 GB' },
      { value: 'large', label: '100 GB - 10 TB' },
      { value: 'enterprise', label: '10+ TB' },
    ]
  );

  return { expectedUsers, expectedDataVolume };
}

// ============================================================================
// Output Generation
// ============================================================================

function generateClaudeMd(config: ProjectConfig): string {
  const template = fs.readFileSync(
    path.join(__dirname, '..', 'CLAUDE.template.md'),
    'utf-8'
  );

  // Simple template replacement (could use handlebars for more complex cases)
  let output = template;

  // Replace simple placeholders
  output = output.replace(/\{\{projectName\}\}/g, config.projectName);
  output = output.replace(/\{\{projectDescription\}\}/g, config.projectDescription);

  // Build domain context
  const domainContext = `
**Domain:** ${config.domainType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}

${config.domainDescription}

**Core Entities:** ${config.dataEntities.filter(e => e.isCore).map(e => e.name).join(', ')}

**Key Features:** ${config.features.filter(f => f.priority === 'must_have').map(f => f.name).join(', ')}

**User Types:** ${config.personas.map(p => p.name).join(', ')}
`;

  // Build constraints
  const constraints: string[] = [];
  if (config.hasMultiTenancy) {
    constraints.push('All data must be tenant-isolated using organizationId');
  }
  if (config.complianceRequirements.length > 0) {
    constraints.push(`Compliance: ${config.complianceRequirements.map(c => c.name).join(', ')}`);
  }
  if (config.aiIntegration !== 'none') {
    constraints.push(`AI Integration: ${config.aiIntegration} mode - include confidence scoring and human review workflows`);
  }

  // Remove template conditionals and insert content
  // (In production, use a proper template engine like Handlebars)
  output = output.replace(/\{\{#if projectDescription\}\}[\s\S]*?\{\{\/if\}\}/g,
    `> **${config.projectName}**: ${config.projectDescription}`);

  output = output.replace(/\{\{#if domainContext\}\}[\s\S]*?\{\{\/if\}\}/g,
    `## Domain Context\n${domainContext}`);

  if (constraints.length > 0) {
    output = output.replace(/\{\{#if projectConstraints\}\}[\s\S]*?\{\{\/if\}\}/g,
      `## Project-Specific Constraints\n\n${constraints.map(c => `- ${c}`).join('\n')}`);
  } else {
    output = output.replace(/\{\{#if projectConstraints\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  if (config.complianceRequirements.length > 0) {
    const complianceSection = config.complianceRequirements.map(c =>
      `- **${c.name}**: ${c.description}`
    ).join('\n');
    output = output.replace(/\{\{#if complianceRequirements\}\}[\s\S]*?\{\{\/if\}\}/g,
      `### Compliance Requirements\n\nThis project has specific compliance requirements:\n\n${complianceSection}`);
  } else {
    output = output.replace(/\{\{#if complianceRequirements\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }

  // Remove remaining template syntax
  output = output.replace(/\{\{#if [\w]+\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  output = output.replace(/\{\{[\w.]+\}\}/g, '');

  return output;
}

interface ImplementationPhase {
  number: string;
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  subphases: ImplementationSubphase[];
  dependencies: string[];
}

interface ImplementationSubphase {
  number: string;
  name: string;
  description: string;
  tasks: string[];
  claudePrompt: string;
}

function generateImplementationPlan(config: ProjectConfig): ImplementationPhase[] {
  const phases: ImplementationPhase[] = [];

  // Phase 0 is always foundation
  phases.push({
    number: '0',
    name: 'Foundation & Infrastructure',
    description: 'Set up the base project, authentication, and core UI components',
    priority: 'critical',
    dependencies: [],
    subphases: [
      {
        number: '0.1',
        name: 'Project Setup',
        description: 'Initialize project with dependencies',
        tasks: [
          'Install shadcn/ui components',
          'Set up react-hook-form and Zod',
          'Configure TanStack Query',
          'Set up date-fns and utility libraries',
        ],
        claudePrompt: `Set up the project with the following dependencies:
- shadcn/ui for components
- react-hook-form with Zod for form handling
- TanStack Query for data fetching
- date-fns for date formatting

Install and configure each, ensuring they work with the existing Next.js 15 + Amplify setup.`,
      },
      {
        number: '0.2',
        name: 'Authentication UI',
        description: 'Build login, register, and password reset flows',
        tasks: [
          'Create login page with email/password',
          'Create registration page',
          'Build password reset flow',
          'Add auth state management',
        ],
        claudePrompt: `Build a complete authentication UI with:
- Login page at /auth/login
- Register page at /auth/register
- Password reset flow at /auth/forgot-password
- Protected route wrapper component
- Auth context for state management

Use Amplify Auth for the backend. Make it feel polished and professional.`,
      },
      {
        number: '0.3',
        name: 'Core UI Components',
        description: 'Set up shared UI components library',
        tasks: [
          'Install essential shadcn/ui components',
          'Create layout components (Sidebar, Header)',
          'Build loading states and skeletons',
          'Create error boundary components',
        ],
        claudePrompt: `Create the core UI component library:
- Install shadcn/ui: button, input, dialog, dropdown-menu, table, card, tabs, form, toast
- Create layout/Sidebar with navigation
- Create layout/Header with user menu
- Build shared/LoadingSpinner and shared/Skeleton components
- Create ErrorBoundary with fallback UI

Ensure consistent styling and dark mode support.`,
      },
      {
        number: '0.4',
        name: 'Data Layer Setup',
        description: 'Create API client and data fetching patterns',
        tasks: [
          'Create Amplify client wrapper',
          'Build generic useQuery hooks',
          'Create mutation helpers',
          'Set up optimistic updates pattern',
        ],
        claudePrompt: `Set up the data layer:
- Create lib/api/client.ts with Amplify GraphQL client
- Build generic hooks: useQuery, useMutation with TanStack Query
- Create type-safe API functions for each entity
- Implement optimistic update patterns
- Add error handling and retry logic

Make it feel like a production-ready data layer.`,
      },
      {
        number: '0.5',
        name: 'Dashboard Shell',
        description: 'Build the main application layout',
        tasks: [
          'Create dashboard layout with sidebar',
          'Build responsive navigation',
          'Add breadcrumbs component',
          'Create dashboard home page',
        ],
        claudePrompt: `Build the dashboard shell:
- Create app/(dashboard)/layout.tsx with Sidebar and Header
- Build responsive sidebar that collapses on mobile
- Add breadcrumb navigation
- Create the dashboard home page with placeholder widgets
- Ensure protected routes require authentication

Make it feel like a premium SaaS product.`,
      },
    ],
  });

  // Generate feature-based phases
  const mustHaveFeatures = config.features.filter(f => f.priority === 'must_have');
  const shouldHaveFeatures = config.features.filter(f => f.priority === 'should_have');
  const niceToHaveFeatures = config.features.filter(f => f.priority === 'nice_to_have');

  // Phase 1: Core Domain
  if (config.dataEntities.length > 0) {
    const coreEntities = config.dataEntities.filter(e => e.isCore);
    phases.push({
      number: '1',
      name: `Core Domain: ${coreEntities.map(e => e.name).join(', ')}`,
      description: `Implement the core ${config.domainType} domain entities and workflows`,
      priority: 'critical',
      dependencies: ['0'],
      subphases: coreEntities.map((entity, i) => ({
        number: `1.${i + 1}`,
        name: `${entity.name} Management`,
        description: `Full CRUD for ${entity.name}`,
        tasks: [
          `Create ${entity.name} list page with filters`,
          `Build ${entity.name} detail view`,
          `Implement create/edit forms`,
          `Add delete with confirmation`,
        ],
        claudePrompt: `Build complete ${entity.name} management:

Entity definition: ${entity.description}
Fields: ${entity.fields.map(f => `${f.name} (${f.type}${f.required ? ', required' : ''})`).join(', ')}

Create:
- List page with sortable/filterable DataTable
- Detail view showing all ${entity.name} information
- Create/Edit form with validation using Zod
- Delete confirmation dialog

Use the established patterns from Phase 0. Make it feel intuitive for ${config.personas[0]?.name || 'users'}.`,
      })),
    });
  }

  // Generate phases for must-have features
  let phaseNum = 2;
  const featureGroups = groupFeatures(mustHaveFeatures);

  for (const [groupName, features] of Object.entries(featureGroups)) {
    phases.push({
      number: String(phaseNum),
      name: groupName,
      description: `Implement ${features.map(f => f.name).join(', ')}`,
      priority: 'critical',
      dependencies: [String(phaseNum - 1)],
      subphases: features.map((feature, i) => ({
        number: `${phaseNum}.${i + 1}`,
        name: feature.name,
        description: feature.description,
        tasks: getFeatureTasks(feature),
        claudePrompt: generateFeaturePrompt(feature, config),
      })),
    });
    phaseNum++;
  }

  // Should-have features
  const shouldHaveGroups = groupFeatures(shouldHaveFeatures);
  for (const [groupName, features] of Object.entries(shouldHaveGroups)) {
    phases.push({
      number: String(phaseNum),
      name: groupName,
      description: `Implement ${features.map(f => f.name).join(', ')}`,
      priority: 'high',
      dependencies: [String(phaseNum - 1)],
      subphases: features.map((feature, i) => ({
        number: `${phaseNum}.${i + 1}`,
        name: feature.name,
        description: feature.description,
        tasks: getFeatureTasks(feature),
        claudePrompt: generateFeaturePrompt(feature, config),
      })),
    });
    phaseNum++;
  }

  // Nice-to-have features
  const niceToHaveGroups = groupFeatures(niceToHaveFeatures);
  for (const [groupName, features] of Object.entries(niceToHaveGroups)) {
    phases.push({
      number: String(phaseNum),
      name: groupName,
      description: `Implement ${features.map(f => f.name).join(', ')}`,
      priority: 'low',
      dependencies: [String(phaseNum - 1)],
      subphases: features.map((feature, i) => ({
        number: `${phaseNum}.${i + 1}`,
        name: feature.name,
        description: feature.description,
        tasks: getFeatureTasks(feature),
        claudePrompt: generateFeaturePrompt(feature, config),
      })),
    });
    phaseNum++;
  }

  return phases;
}

function groupFeatures(features: Feature[]): Record<string, Feature[]> {
  const groups: Record<string, Feature[]> = {};

  for (const feature of features) {
    let group = 'Other Features';

    if (feature.id.startsWith('auth_') || feature.id.includes('user') || feature.id.includes('role')) {
      group = 'Authentication & Access Control';
    } else if (feature.id.includes('billing') || feature.id.includes('payment')) {
      group = 'Billing & Payments';
    } else if (feature.id.includes('notification')) {
      group = 'Notifications';
    } else if (feature.id.includes('ai_') || feature.id.includes('operating')) {
      group = 'AI & Automation';
    } else if (feature.id.includes('search')) {
      group = 'Search';
    } else if (feature.id.includes('analytics') || feature.id.includes('reporting')) {
      group = 'Analytics & Reporting';
    } else if (feature.id.includes('workflow') || feature.id.includes('queue')) {
      group = 'Workflow';
    } else if (feature.id.includes('api') || feature.id.includes('webhook')) {
      group = 'API & Integrations';
    }

    if (!groups[group]) groups[group] = [];
    groups[group].push(feature);
  }

  return groups;
}

function getFeatureTasks(feature: Feature): string[] {
  // Return default tasks based on feature type
  const taskMap: Record<string, string[]> = {
    auth_basic: ['Create login form', 'Create registration form', 'Add session management', 'Build protected routes'],
    auth_social: ['Add Google OAuth', 'Add GitHub OAuth', 'Handle OAuth callbacks', 'Link social accounts'],
    auth_mfa: ['Add MFA enrollment flow', 'Create TOTP verification', 'Add backup codes', 'MFA recovery flow'],
    user_management: ['Create user profile page', 'Build settings UI', 'Add avatar upload', 'Create user preferences'],
    role_permissions: ['Define role hierarchy', 'Create permissions matrix', 'Build role management UI', 'Add permission checks'],
    multi_tenancy: ['Add organization model', 'Create org switcher', 'Implement data isolation', 'Build org settings'],
    billing_subscription: ['Integrate Stripe', 'Create pricing page', 'Build subscription management', 'Add billing history'],
    file_storage: ['Set up S3 bucket', 'Create upload component', 'Add file browser', 'Implement presigned URLs'],
    notifications_email: ['Set up email provider', 'Create email templates', 'Build notification preferences', 'Add email queue'],
    notifications_inapp: ['Create notification model', 'Build notification center UI', 'Add real-time updates', 'Mark as read/unread'],
    search_basic: ['Add search index', 'Create search UI', 'Implement search API', 'Add search results page'],
    search_advanced: ['Add filters', 'Create faceted search', 'Build saved searches', 'Add search suggestions'],
    audit_logging: ['Create audit log model', 'Add logging middleware', 'Build audit log viewer', 'Add export capability'],
    analytics_dashboard: ['Create dashboard layout', 'Add chart components', 'Build KPI widgets', 'Add date range picker'],
    reporting: ['Create report templates', 'Build report generator', 'Add export formats', 'Schedule reports'],
    ai_processing: ['Set up task queue', 'Create AI worker', 'Build processing pipeline', 'Add progress tracking'],
    ai_chat: ['Create chat interface', 'Integrate Claude API', 'Add message history', 'Build streaming responses'],
    operating_modes: ['Create mode settings', 'Build mode switcher', 'Add confidence scoring', 'Create human review queue'],
    workflow_engine: ['Design state machine', 'Create workflow definitions', 'Build workflow runner', 'Add workflow visualization'],
    work_queues: ['Create queue model', 'Build queue UI', 'Add task assignment', 'Create priority handling'],
    messaging: ['Create message model', 'Build inbox UI', 'Add compose dialog', 'Create notification integration'],
    api_public: ['Design API schema', 'Add authentication', 'Create documentation', 'Build rate limiting'],
    webhooks: ['Create webhook model', 'Build webhook management', 'Add event dispatch', 'Create retry logic'],
  };

  return taskMap[feature.id] || ['Implement feature', 'Add tests', 'Update documentation'];
}

function generateFeaturePrompt(feature: Feature, config: ProjectConfig): string {
  const basePrompt = `Implement ${feature.name}: ${feature.description}

This is for ${config.projectName}, a ${config.domainType.replace(/_/g, ' ')} application.

Primary users: ${config.personas.map(p => `${p.name} (${p.role})`).join(', ')}`;

  const complianceNote = config.complianceRequirements.length > 0
    ? `\n\nCompliance requirements: ${config.complianceRequirements.map(c => c.name).join(', ')}`
    : '';

  const aiNote = config.aiIntegration !== 'none'
    ? `\n\nAI Integration: ${config.aiIntegration} mode - include appropriate confidence scoring and human review capabilities.`
    : '';

  return basePrompt + complianceNote + aiNote + `

Tasks:
${getFeatureTasks(feature).map(t => `- ${t}`).join('\n')}

Make it feel polished and production-ready. Follow the patterns established in Phase 0.`;
}

function formatImplementationPlan(phases: ImplementationPhase[]): string {
  let output = `# Implementation Plan

## Overview

This plan is organized into ${phases.length} phases, each with specific sub-phases and tasks.
Dependencies between phases are noted - complete dependencies before starting a phase.

---

`;

  for (const phase of phases) {
    output += `## Phase ${phase.number}: ${phase.name}

**Priority:** ${phase.priority.toUpperCase()}
${phase.dependencies.length > 0 ? `**Dependencies:** Phase ${phase.dependencies.join(', Phase ')}` : '**Dependencies:** None'}

${phase.description}

`;

    for (const subphase of phase.subphases) {
      output += `### ${subphase.number} ${subphase.name}

${subphase.description}

**Tasks:**
${subphase.tasks.map(t => `- [ ] ${t}`).join('\n')}

<details>
<summary>Claude Code Prompt</summary>

\`\`\`
${subphase.claudePrompt}
\`\`\`

</details>

---

`;
    }
  }

  return output;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  printHeader('PROJECT DISCOVERY');
  print('Welcome! Let\'s define your project so Claude Code can help you build it.');
  print('This questionnaire will generate:');
  print('  - A customized CLAUDE.md with your project context');
  print('  - An implementation plan with phases and prompts');
  print('  - Data model scaffolding');
  print();

  const identity = await gatherProjectIdentity();
  const personas = await gatherPersonas();
  const { features, aiIntegration } = await gatherFeatures();
  const dataEntities = await gatherDataEntities();
  const complianceRequirements = await gatherCompliance();
  const { expectedUsers, expectedDataVolume } = await gatherScale();

  const hasMultiTenancy = features.some(f => f.id === 'multi_tenancy');

  const config: ProjectConfig = {
    projectName: identity.projectName!,
    projectSlug: identity.projectSlug!,
    projectDescription: identity.projectDescription!,
    domainType: identity.domainType!,
    domainDescription: identity.domainDescription!,
    personas,
    authMethods: features
      .filter(f => f.id.startsWith('auth_'))
      .map(f => f.id.replace('auth_', '') as AuthMethod),
    hasMultiTenancy,
    features,
    aiIntegration,
    dataEntities,
    integrations: [],
    complianceRequirements,
    expectedUsers,
    expectedDataVolume,
  };

  // Generate outputs
  printHeader('GENERATING PROJECT FILES');

  const outputDir = path.join(process.cwd(), 'generated');
  fs.mkdirSync(outputDir, { recursive: true });

  // Generate CLAUDE.md
  print('Generating CLAUDE.md...');
  const claudeMd = generateClaudeMd(config);
  fs.writeFileSync(path.join(outputDir, 'CLAUDE.md'), claudeMd);

  // Generate implementation plan
  print('Generating implementation plan...');
  const phases = generateImplementationPlan(config);
  const planMd = formatImplementationPlan(phases);
  fs.writeFileSync(path.join(outputDir, 'IMPLEMENTATION_PLAN.md'), planMd);

  // Save config for reference
  print('Saving project config...');
  fs.writeFileSync(
    path.join(outputDir, 'project-config.json'),
    JSON.stringify(config, null, 2)
  );

  // Generate individual phase files
  const phasesDir = path.join(outputDir, 'phases');
  fs.mkdirSync(phasesDir, { recursive: true });

  for (const phase of phases) {
    const phaseMd = `# Phase ${phase.number}: ${phase.name}

**Priority:** ${phase.priority.toUpperCase()}
${phase.dependencies.length > 0 ? `**Dependencies:** Phase ${phase.dependencies.join(', Phase ')}` : '**Dependencies:** None'}

${phase.description}

---

${phase.subphases.map(sp => `## ${sp.number} ${sp.name}

${sp.description}

### Tasks

${sp.tasks.map(t => `- [ ] ${t}`).join('\n')}

### Claude Code Prompt

Copy this prompt to Claude Code to implement this sub-phase:

\`\`\`
${sp.claudePrompt}
\`\`\`
`).join('\n---\n\n')}
`;
    fs.writeFileSync(
      path.join(phasesDir, `phase-${phase.number.replace('.', '-')}.md`),
      phaseMd
    );
  }

  printHeader('COMPLETE!');
  print(`Files generated in: ${outputDir}`);
  print();
  print('Generated files:');
  print(`  - CLAUDE.md (copy to your project root)`);
  print(`  - IMPLEMENTATION_PLAN.md (full plan with all phases)`);
  print(`  - project-config.json (your answers for reference)`);
  print(`  - phases/ (individual phase files with prompts)`);
  print();
  print('Next steps:');
  print('  1. Copy CLAUDE.md to your project root');
  print('  2. Review IMPLEMENTATION_PLAN.md');
  print('  3. Start with Phase 0 and work through each sub-phase');
  print('  4. Use the Claude Code prompts to implement each feature');
  print();

  rl.close();
}

main().catch(console.error);
