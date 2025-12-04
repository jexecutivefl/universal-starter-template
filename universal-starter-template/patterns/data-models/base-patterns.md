# Data Model Patterns

Reusable patterns for Amplify Gen2 data models. Copy and adapt these for your domain entities.

## Base Entity Pattern

Every entity should include these standard fields:

```typescript
BaseEntity: a
  .model({
    // Required: Organization isolation for multi-tenancy
    organizationId: a.id().required(),

    // Audit fields
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
    createdById: a.id(),

    // Soft delete support
    deletedAt: a.datetime(),
    deletedById: a.id(),
  })
  .authorization((allow) => [allow.authenticated()])
```

## Status Tracking Pattern

For entities with workflow states:

```typescript
StatusEntity: a
  .model({
    organizationId: a.id().required(),

    // Status with enum
    status: a.enum([
      'draft',
      'pending',
      'in_progress',
      'completed',
      'failed',
      'canceled',
    ]),

    // Status transitions
    statusChangedAt: a.datetime(),
    statusChangedById: a.id(),
    previousStatus: a.string(),
    statusReason: a.string(),

    // Audit
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
  .authorization((allow) => [allow.authenticated()])
```

## AI-Enabled Entity Pattern

For entities processed by AI:

```typescript
AIProcessedEntity: a
  .model({
    organizationId: a.id().required(),

    // AI Processing
    status: a.enum([
      'pending',
      'processing',
      'completed',
      'failed',
      'requires_review',
    ]),

    // Confidence & Review
    confidenceScore: a.float(), // 0.0 - 1.0
    confidenceBreakdown: a.json(), // Per-field confidence
    requiresHumanReview: a.boolean(),
    reviewedById: a.id(),
    reviewedAt: a.datetime(),
    reviewNotes: a.string(),

    // AI Metadata
    aiModelVersion: a.string(),
    aiProcessingTimeMs: a.integer(),
    validationErrors: a.json(),
    suggestions: a.json(),

    // Audit
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
  .authorization((allow) => [allow.authenticated()])
```

## Workflow Entity Pattern

For entities with complex state machines:

```typescript
WorkflowEntity: a
  .model({
    organizationId: a.id().required(),

    // Workflow State
    workflowStatus: a.enum([
      'initiated',
      'step_1_pending',
      'step_1_complete',
      'step_2_pending',
      'step_2_complete',
      'final_review',
      'approved',
      'rejected',
    ]),

    // Current Assignment
    assignedToId: a.id(),
    assignedAt: a.datetime(),
    dueAt: a.datetime(),
    priority: a.enum(['low', 'normal', 'high', 'urgent']),

    // Workflow History
    workflowHistory: a.json(), // Array of state transitions

    // Blocking/Dependencies
    blockedBy: a.json(), // Array of blocking item IDs
    blockedReason: a.string(),

    // Timing
    startedAt: a.datetime(),
    completedAt: a.datetime(),
    totalDurationMs: a.integer(),

    // Audit
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
  .authorization((allow) => [allow.authenticated()])
```

## Financial Entity Pattern

For entities with monetary values:

```typescript
FinancialEntity: a
  .model({
    organizationId: a.id().required(),

    // Amounts (use float for currency)
    amount: a.float().required(),
    currency: a.string().default('USD'),

    // Tax
    taxAmount: a.float(),
    taxRate: a.float(),

    // Breakdown
    subtotal: a.float(),
    discountAmount: a.float(),
    discountPercent: a.float(),
    totalAmount: a.float().required(),

    // Payment Status
    paymentStatus: a.enum(['pending', 'partial', 'paid', 'refunded', 'void']),
    paidAmount: a.float(),
    balanceDue: a.float(),
    paidAt: a.datetime(),

    // Audit
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
  .authorization((allow) => [allow.authenticated()])
```

## Document/File Entity Pattern

For entities with file attachments:

```typescript
DocumentEntity: a
  .model({
    organizationId: a.id().required(),

    // File Info
    filename: a.string().required(),
    originalName: a.string().required(),
    mimeType: a.string().required(),
    size: a.integer().required(), // bytes

    // Storage
    s3Key: a.string().required(),
    s3Bucket: a.string().required(),
    thumbnailS3Key: a.string(),

    // Processing
    processingStatus: a.enum(['pending', 'processing', 'completed', 'failed']),
    extractedText: a.string(),
    extractedData: a.json(),

    // Associations
    entityType: a.string(), // What this document belongs to
    entityId: a.id(),

    // Metadata
    metadata: a.json(),
    tags: a.json(), // Array of tags

    // Audit
    uploadedById: a.id().required(),
    createdAt: a.datetime(),
  })
  .authorization((allow) => [allow.authenticated()])
```

## User Reference Pattern

For entities owned by or assigned to users:

```typescript
UserOwnedEntity: a
  .model({
    organizationId: a.id().required(),

    // Ownership
    ownerId: a.id().required(),

    // Sharing
    sharedWith: a.json(), // Array of user IDs
    visibility: a.enum(['private', 'team', 'organization', 'public']),

    // Assignment (different from ownership)
    assignedToId: a.id(),
    assignedById: a.id(),
    assignedAt: a.datetime(),

    // Collaboration
    lastEditedById: a.id(),
    lastEditedAt: a.datetime(),
    editCount: a.integer(),

    // Audit
    createdById: a.id().required(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  })
  .authorization((allow) => [allow.authenticated()])
```

## Notification/Event Pattern

For audit logs and notifications:

```typescript
NotificationEntity: a
  .model({
    organizationId: a.id().required(),
    userId: a.id().required(),

    // Notification
    type: a.enum(['info', 'success', 'warning', 'error', 'action_required']),
    category: a.string(), // e.g., 'order', 'payment', 'system'
    title: a.string().required(),
    message: a.string(),

    // Action
    actionUrl: a.string(),
    actionLabel: a.string(),

    // Status
    read: a.boolean().default(false),
    readAt: a.datetime(),
    dismissed: a.boolean().default(false),
    dismissedAt: a.datetime(),

    // Expiry
    expiresAt: a.datetime(),

    // Metadata
    metadata: a.json(),

    // Timestamp
    createdAt: a.datetime().required(),
  })
  .authorization((allow) => [allow.authenticated()])
```

## Best Practices

1. **Always include organizationId** for multi-tenant isolation
2. **Use enums for status fields** to enforce valid values
3. **Include audit timestamps** (createdAt, updatedAt)
4. **Track who made changes** (createdById, updatedById)
5. **Use JSON for flexible/nested data** but keep queryable fields as primitives
6. **Plan for soft deletes** with deletedAt instead of hard deletes
7. **Use floats for currency** (not integers with cents)
8. **Include confidence scores** for AI-processed fields
