import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

/**
 * Data Schema Definition
 *
 * This is your GraphQL schema using Amplify Gen2's type-safe builder.
 * Define your data models here - they become GraphQL types with auto-generated
 * queries, mutations, and subscriptions.
 *
 * Patterns included:
 * - Multi-tenancy (organizationId on all entities)
 * - Audit fields (createdAt, updatedAt, createdById)
 * - Soft delete support (deletedAt)
 * - Enum-based status tracking
 *
 * IMPORTANT: This file is protected infrastructure.
 * Significant changes require human approval.
 */

const schema = a.schema({
  // ============================================================================
  // Core: Organization (Multi-Tenancy)
  // ============================================================================

  Organization: a
    .model({
      name: a.string().required(),
      slug: a.string().required(),
      domain: a.string(),
      logoUrl: a.string(),
      settings: a.json(),
      status: a.enum(['active', 'inactive', 'suspended']),
      // Billing
      stripeCustomerId: a.string(),
      subscriptionStatus: a.enum(['trialing', 'active', 'past_due', 'canceled', 'unpaid']),
      // Metadata
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // Core: User
  // ============================================================================

  User: a
    .model({
      // Identity
      cognitoId: a.string().required(),
      email: a.string().required(),
      firstName: a.string(),
      lastName: a.string(),
      avatarUrl: a.string(),
      // Organization
      organizationId: a.id().required(),
      role: a.enum(['owner', 'admin', 'member', 'viewer']),
      // Settings
      preferences: a.json(),
      timezone: a.string(),
      locale: a.string(),
      // Status
      status: a.enum(['active', 'invited', 'suspended']),
      lastLoginAt: a.datetime(),
      // Metadata
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // Core: Audit Log
  // ============================================================================

  AuditLog: a
    .model({
      // Context
      organizationId: a.id().required(),
      userId: a.id(),
      // Action
      action: a.string().required(), // e.g., 'user.created', 'order.updated'
      entityType: a.string().required(), // e.g., 'User', 'Order'
      entityId: a.id(),
      // Details
      previousValue: a.json(),
      newValue: a.json(),
      metadata: a.json(), // IP, user agent, etc.
      // Timestamp
      createdAt: a.datetime().required(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // Notifications
  // ============================================================================

  Notification: a
    .model({
      organizationId: a.id().required(),
      userId: a.id().required(),
      // Content
      type: a.enum(['info', 'success', 'warning', 'error']),
      title: a.string().required(),
      message: a.string(),
      link: a.string(),
      // Status
      read: a.boolean(),
      readAt: a.datetime(),
      // Metadata
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // AI Processing (Optional - for AI-enabled projects)
  // ============================================================================

  AITask: a
    .model({
      organizationId: a.id().required(),
      // Task Definition
      type: a.string().required(), // e.g., 'document_extraction', 'classification'
      status: a.enum([
        'pending',
        'processing',
        'completed',
        'failed',
        'requires_review',
      ]),
      priority: a.enum(['low', 'normal', 'high', 'urgent']),
      // Input/Output
      input: a.json(),
      output: a.json(),
      // AI Confidence
      confidenceScore: a.float(),
      requiresHumanReview: a.boolean(),
      reviewedById: a.id(),
      reviewedAt: a.datetime(),
      // Timing
      startedAt: a.datetime(),
      completedAt: a.datetime(),
      processingTimeMs: a.integer(),
      // Error Handling
      errorMessage: a.string(),
      retryCount: a.integer(),
      // Metadata
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // Operating Mode Settings (AI/Hybrid/Manual)
  // ============================================================================

  OperatingModeSettings: a
    .model({
      organizationId: a.id().required(),
      // Mode
      operatingMode: a.enum(['full_ai', 'hybrid', 'manual']),
      // AI Thresholds
      aiConfidenceThreshold: a.float(), // e.g., 0.95
      aiAutoApprovalEnabled: a.boolean(),
      // Feature Flags
      showAiConfidence: a.boolean(),
      showAiRecommendations: a.boolean(),
      allowAiOverride: a.boolean(),
      // Metadata
      updatedAt: a.datetime(),
      updatedById: a.id(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // File Storage
  // ============================================================================

  StoredFile: a
    .model({
      organizationId: a.id().required(),
      // File Info
      filename: a.string().required(),
      originalName: a.string().required(),
      mimeType: a.string().required(),
      size: a.integer().required(),
      // Storage
      s3Key: a.string().required(),
      s3Bucket: a.string().required(),
      // Associations
      entityType: a.string(), // e.g., 'User', 'Document'
      entityId: a.id(),
      // Metadata
      uploadedById: a.id().required(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // Settings & Preferences
  // ============================================================================

  Setting: a
    .model({
      organizationId: a.id().required(),
      // Setting
      key: a.string().required(),
      value: a.json().required(),
      type: a.enum(['string', 'number', 'boolean', 'json']),
      // Metadata
      description: a.string(),
      updatedAt: a.datetime(),
      updatedById: a.id(),
    })
    .authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // Add Your Domain Entities Below
  // ============================================================================

  // Example: Product (for e-commerce)
  // Product: a
  //   .model({
  //     organizationId: a.id().required(),
  //     name: a.string().required(),
  //     description: a.string(),
  //     price: a.float().required(),
  //     status: a.enum(['draft', 'active', 'archived']),
  //     createdAt: a.datetime(),
  //     updatedAt: a.datetime(),
  //   })
  //   .authorization((allow) => [allow.authenticated()]),

  // Example: Order (for e-commerce)
  // Order: a
  //   .model({
  //     organizationId: a.id().required(),
  //     customerId: a.id().required(),
  //     status: a.enum(['pending', 'processing', 'shipped', 'delivered', 'canceled']),
  //     totalAmount: a.float().required(),
  //     items: a.json(),
  //     shippingAddress: a.json(),
  //     createdAt: a.datetime(),
  //     updatedAt: a.datetime(),
  //   })
  //   .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
