/**
 * Common Type Definitions
 *
 * Shared types used across the application.
 */

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextToken?: string;
  totalCount?: number;
}

export interface PaginationParams {
  limit?: number;
  nextToken?: string;
}

// ============================================================================
// Entity Types
// ============================================================================

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditableEntity extends BaseEntity {
  createdById?: string;
  updatedById?: string;
}

export interface TenantEntity extends AuditableEntity {
  organizationId: string;
}

// ============================================================================
// Status Types
// ============================================================================

export type EntityStatus = 'active' | 'inactive' | 'archived';

export type WorkflowStatus =
  | 'draft'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'canceled';

export type AIProcessingStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'requires_review';

// ============================================================================
// User Types
// ============================================================================

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface User extends TenantEntity {
  cognitoId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: UserRole;
  status: 'active' | 'invited' | 'suspended';
  lastLoginAt?: string;
}

// ============================================================================
// Organization Types
// ============================================================================

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid';

export interface Organization extends BaseEntity {
  name: string;
  slug: string;
  domain?: string;
  logoUrl?: string;
  settings?: Record<string, unknown>;
  status: EntityStatus;
  stripeCustomerId?: string;
  subscriptionStatus?: SubscriptionStatus;
}

// ============================================================================
// AI Types
// ============================================================================

export type OperatingMode = 'full_ai' | 'hybrid' | 'manual';

export interface AIConfidence {
  score: number; // 0-1
  breakdown?: Record<string, number>;
  requiresReview: boolean;
}

export interface AITask extends TenantEntity {
  type: string;
  status: AIProcessingStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  confidenceScore?: number;
  requiresHumanReview: boolean;
  reviewedById?: string;
  reviewedAt?: string;
  startedAt?: string;
  completedAt?: string;
  processingTimeMs?: number;
  errorMessage?: string;
  retryCount?: number;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType =
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'action_required';

export interface Notification extends TenantEntity {
  userId: string;
  type: NotificationType;
  category?: string;
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  readAt?: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithOptionalChildren {
  children?: React.ReactNode;
}

// ============================================================================
// Form Types
// ============================================================================

export interface FormProps<T> {
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

// ============================================================================
// Table Types
// ============================================================================

export interface TableColumn<T> {
  id: keyof T | string;
  header: string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}
