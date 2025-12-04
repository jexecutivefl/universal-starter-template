# EHR System - Comprehensive Gap Analysis

## Executive Summary

This document analyzes the current system design against the requirements for a **true all-in-one EHR, medical billing, coding, and RCM solution** that serves:

1. **Medical Billing Companies** (like yours) - Primary operator
2. **Medical Practices/Clinics** - Direct customers who may use the system themselves
3. **Doctors/Physicians** - Clinical users and billing clients
4. **Patients** - Self-service portal users
5. **Medical Billers** - Staff processing claims
6. **Medical Coders** - Staff assigning codes

**Key Innovation Required:** Three Operating Modes
- **Full AI Mode** - Agents do everything, humans approve
- **Hybrid Mode** - Agents assist, humans do some work manually
- **Full Manual Mode** - Turn off agents, humans do all work

---

## Current Coverage Analysis

### What's Well Covered ✅

| Area | Coverage | Notes |
|------|----------|-------|
| Medical Billing Company Operations | ✅ Excellent | Core business model well defined |
| Doctor Client Management | ✅ Good | Multi-tenant architecture |
| Email Ingestion Pipeline | ✅ Good | 8 AI agents designed |
| Claims Processing | ✅ Good | Full revenue cycle workflow |
| Denial Management | ✅ Good | Comprehensive denial tracking |
| Payment Posting (ERA) | ✅ Good | Auto-posting designed |
| Medical Coding Workflow | ✅ Good | Coder workstation designed |
| Clearinghouse Integration | ✅ Good | ClaimMD + abstraction layer |
| AI Agent Architecture | ✅ Good | 8 agents with clear workflows |
| HIPAA Compliance | ✅ Good | Security requirements defined |
| Data Models (Billing Core) | ✅ Good | 43+ models implemented |

### What's Partially Covered ⚠️

| Area | Coverage | Gaps |
|------|----------|------|
| Patient Portal | ⚠️ Partial | Missing: payments, scheduling self-service |
| Doctor Portal | ⚠️ Partial | Missing: claim submission, analytics |
| Prior Authorization | ⚠️ Partial | Model exists, workflow incomplete |
| Eligibility Verification | ⚠️ Partial | Basic model, needs UI workflow |
| Reporting & Analytics | ⚠️ Partial | Mentioned, no models defined |
| Practice Management | ⚠️ Partial | Focus on billing company, not practice |

### What's Missing ❌

| Area | Priority | Impact |
|------|----------|--------|
| **Three Operating Modes** | CRITICAL | Core differentiator |
| **Scheduling System** | HIGH | Essential for practices |
| **Patient Payment Processing** | HIGH | Revenue collection |
| **SaaS Subscription Management** | HIGH | Monetization |
| **Encounter/Clinical Documentation** | HIGH | Full EHR capability |
| **Appointment Reminders** | MEDIUM | Patient engagement |
| **Multi-Location Support** | MEDIUM | Practice scalability |
| **Telehealth Integration** | MEDIUM | Modern practice needs |
| **Referral Management** | MEDIUM | Care coordination |
| **Quality Metrics/KPIs** | MEDIUM | Performance tracking |
| **E-Prescribing** | LOW (Phase 2) | Full clinical capability |
| **Lab Orders/Results** | LOW (Phase 2) | Full clinical capability |

---

## Critical Gap #1: Three Operating Modes

### Current State
The system currently assumes AI-assisted workflows but doesn't explicitly support mode switching.

### Required Architecture

```
+------------------------------------------------------------------+
|                    OPERATING MODE SYSTEM                          |
+------------------------------------------------------------------+
| Mode: [Full AI] [Hybrid] [Full Manual]                           |
+------------------------------------------------------------------+
|                                                                    |
| FULL AI MODE                                                       |
| - AI agents run automatically on triggers                          |
| - Auto-approve claims above confidence threshold                   |
| - Human approval for: low confidence, high value, exceptions       |
| - Auto-post payments, auto-categorize denials                      |
| - AI generates doctor queries automatically                        |
|                                                                    |
| HYBRID MODE (Default)                                              |
| - AI agents process documents and suggest actions                  |
| - Human review required for all submissions                        |
| - AI coding suggestions shown but coder decides                    |
| - Payment posting requires human confirmation                      |
| - AI drafts emails, human sends                                    |
|                                                                    |
| FULL MANUAL MODE                                                   |
| - All AI agents disabled                                           |
| - Manual claim entry only                                          |
| - Manual code lookup and assignment                                |
| - Manual payment posting                                           |
| - Manual eligibility verification                                  |
| - Standard billing workflows without AI assistance                 |
+------------------------------------------------------------------+
```

### Required Data Models

```typescript
// Organization/Client Settings for Operating Mode
OperatingModeSettings: {
  entityType: 'billing_company' | 'practice' | 'doctor_client',
  entityId: string,
  operatingMode: 'full_ai' | 'hybrid' | 'manual',

  // Full AI Mode Settings
  aiAutoApprovalEnabled: boolean,
  aiConfidenceThreshold: number,          // e.g., 0.95
  aiAutoApprovalMaxAmount: number,        // e.g., $500
  aiAutoPostPayments: boolean,
  aiAutoSendDoctorQueries: boolean,
  aiAutoAppealEnabled: boolean,

  // Hybrid Mode Settings
  aiSuggestionsEnabled: boolean,
  aiCodingAssistEnabled: boolean,
  aiDenialPredictionEnabled: boolean,
  aiEmailDraftsEnabled: boolean,

  // Notification Settings
  notifyOnAutoApproval: boolean,
  notifyOnAiException: boolean,
  dailyAiSummaryEnabled: boolean,

  // Override Settings
  allowUserModeOverride: boolean,
  requireApprovalAboveAmount: number,
}
```

---

## Critical Gap #2: Scheduling System

### Current State
No scheduling models or workflows defined.

### Required Models

```typescript
// Appointment
Appointment: {
  id: string,
  patientId: string,
  providerId: string,
  locationId: string,

  // Scheduling
  appointmentType: 'new_patient' | 'follow_up' | 'procedure' |
                   'telehealth' | 'urgent' | 'annual_wellness',
  scheduledDate: date,
  scheduledStartTime: time,
  scheduledEndTime: time,
  duration: integer,                      // minutes

  // Status
  status: 'scheduled' | 'confirmed' | 'checked_in' | 'in_room' |
          'in_progress' | 'completed' | 'no_show' | 'cancelled' |
          'rescheduled',
  confirmedAt: datetime,
  checkedInAt: datetime,
  roomedAt: datetime,
  seenByProviderAt: datetime,
  completedAt: datetime,

  // Cancellation
  cancelledAt: datetime,
  cancelledById: string,
  cancellationReason: string,

  // Rescheduling
  rescheduledFromId: string,              // Original appointment ID
  rescheduledToId: string,                // New appointment ID

  // Reminders
  remindersSent: json,                    // Array of sent reminders
  nextReminderAt: datetime,

  // Visit Details
  chiefComplaint: string,
  visitNotes: string,
  encounterId: string,                    // Links to clinical encounter

  // Billing
  copayAmount: number,
  copayCollected: boolean,
  copayCollectedAmount: number,

  // Telehealth
  isTelehealth: boolean,
  telehealthLink: string,
  telehealthPlatform: string,
}

// Provider Schedule Template
ProviderScheduleTemplate: {
  id: string,
  providerId: string,
  locationId: string,
  dayOfWeek: 'monday' | 'tuesday' | ... | 'sunday',
  startTime: time,
  endTime: time,
  slotDuration: integer,                  // minutes (15, 20, 30, 60)
  appointmentTypes: json,                 // Allowed appointment types
  effectiveFrom: date,
  effectiveTo: date,
  isActive: boolean,
}

// Schedule Block (time off, meetings, etc.)
ScheduleBlock: {
  id: string,
  providerId: string,
  locationId: string,
  blockType: 'vacation' | 'meeting' | 'lunch' | 'admin' | 'other',
  startDate: date,
  startTime: time,
  endDate: date,
  endTime: time,
  isAllDay: boolean,
  isRecurring: boolean,
  recurrencePattern: json,
  reason: string,
}

// Waitlist
Waitlist: {
  id: string,
  patientId: string,
  providerId: string,
  locationId: string,
  appointmentType: string,
  preferredDays: json,                    // ['monday', 'wednesday', 'friday']
  preferredTimeStart: time,
  preferredTimeEnd: time,
  urgency: 'routine' | 'soon' | 'urgent',
  addedAt: datetime,
  expiresAt: datetime,
  status: 'active' | 'scheduled' | 'expired' | 'cancelled',
  notes: string,
}

// Appointment Reminder
AppointmentReminder: {
  id: string,
  appointmentId: string,
  patientId: string,
  reminderType: 'sms' | 'email' | 'phone' | 'portal',
  scheduledFor: datetime,
  sentAt: datetime,
  status: 'scheduled' | 'sent' | 'delivered' | 'failed' | 'responded',
  response: 'confirmed' | 'cancelled' | 'reschedule_requested' | null,
  responseAt: datetime,
  messageContent: string,
}
```

---

## Critical Gap #3: Patient Payment Processing

### Current State
No payment processing models or gateway integration.

### Required Models

```typescript
// Payment (for patient payments, not ERA)
Payment: {
  id: string,
  patientId: string,

  // Payment Source
  paymentType: 'patient' | 'insurance' | 'third_party',
  paymentMethod: 'credit_card' | 'debit_card' | 'ach' | 'check' |
                 'cash' | 'money_order' | 'payment_plan',

  // Amount
  amount: number,
  appliedAmount: number,
  unappliedAmount: number,

  // Gateway Info
  gatewayTransactionId: string,
  gatewayResponse: json,
  cardLast4: string,
  cardBrand: string,

  // Check/Cash Details
  checkNumber: string,
  checkDate: date,
  depositDate: date,
  depositReference: string,

  // Status
  status: 'pending' | 'completed' | 'failed' | 'refunded' |
          'partially_refunded' | 'voided' | 'chargeback',

  // Processing
  processedAt: datetime,
  processedById: string,

  // Refund Info
  refundedAmount: number,
  refundReason: string,
  refundedAt: datetime,
  refundedById: string,

  // Application
  paymentApplications: hasMany('PaymentApplication'),

  notes: string,
}

// Payment Application (links payment to claims/charges)
PaymentApplication: {
  id: string,
  paymentId: string,
  claimId: string,
  claimLineId: string,
  chargeId: string,
  amount: number,
  appliedAt: datetime,
  appliedById: string,
}

// Stored Payment Method
StoredPaymentMethod: {
  id: string,
  patientId: string,
  paymentMethodType: 'credit_card' | 'debit_card' | 'ach',

  // Card Info (tokenized)
  gatewayToken: string,
  cardLast4: string,
  cardBrand: string,
  cardExpMonth: integer,
  cardExpYear: integer,

  // Bank Info (tokenized)
  bankName: string,
  accountLast4: string,
  accountType: 'checking' | 'savings',

  // Settings
  isDefault: boolean,
  nickname: string,

  // Billing Address
  billingAddress: json,

  // Status
  status: 'active' | 'expired' | 'deleted',

  // Compliance
  consentGivenAt: datetime,
  consentType: string,
}

// Refund Request
RefundRequest: {
  id: string,
  paymentId: string,
  patientId: string,

  refundType: 'full' | 'partial',
  requestedAmount: number,
  approvedAmount: number,

  reason: string,
  reasonCategory: 'overpayment' | 'service_not_rendered' |
                  'duplicate' | 'insurance_paid' | 'other',

  status: 'pending' | 'approved' | 'rejected' | 'processed',

  requestedById: string,
  requestedAt: datetime,
  approvedById: string,
  approvedAt: datetime,
  processedAt: datetime,

  refundMethod: 'original_method' | 'check' | 'account_credit',
  gatewayRefundId: string,

  notes: string,
}
```

### Payment Gateway Integration

```typescript
// Payment Gateway Configuration
PaymentGateway: {
  id: string,
  name: string,                           // 'stripe', 'square', 'authorize_net'

  // Credentials (encrypted)
  apiKey: string,
  apiSecret: string,
  merchantId: string,

  // Settings
  isActive: boolean,
  isDefault: boolean,
  environment: 'sandbox' | 'production',

  // Capabilities
  supportsCards: boolean,
  supportsACH: boolean,
  supportsRecurring: boolean,
  supportsRefunds: boolean,

  // Processing
  dailyLimit: number,
  perTransactionLimit: number,

  // Webhook
  webhookSecret: string,
  webhookUrl: string,
}
```

---

## Critical Gap #4: SaaS Subscription Management

### Current State
System designed for single billing company, no SaaS features.

### Required Models (for selling to public)

```typescript
// SaaS Subscription (for practices buying your software)
Subscription: {
  id: string,
  organizationId: string,

  // Plan
  planId: string,
  planName: string,
  billingCycle: 'monthly' | 'annual',

  // Pricing
  basePrice: number,
  perUserPrice: number,
  perClaimPrice: number,

  // Usage
  includedUsers: integer,
  includedClaims: integer,
  additionalUserPrice: number,
  additionalClaimPrice: number,

  // Dates
  startDate: date,
  endDate: date,
  trialEndDate: date,

  // Status
  status: 'trial' | 'active' | 'past_due' | 'cancelled' | 'suspended',
  cancelledAt: datetime,
  cancellationReason: string,

  // Payment
  paymentMethodId: string,
  lastPaymentDate: date,
  nextBillingDate: date,

  // Features
  enabledFeatures: json,                  // Array of feature flags
}

// SaaS Plan
SubscriptionPlan: {
  id: string,
  name: string,                           // 'Starter', 'Professional', 'Enterprise'
  description: string,

  // Pricing
  monthlyPrice: number,
  annualPrice: number,
  setupFee: number,

  // Limits
  maxUsers: integer,
  maxClaims: integer,
  maxDoctorClients: integer,
  maxLocations: integer,

  // Features
  includedFeatures: json,

  // AI Mode
  aiModeAllowed: json,                    // ['manual', 'hybrid', 'full_ai']

  // Support
  supportLevel: 'email' | 'phone' | 'dedicated',
  slaResponseTime: string,

  isActive: boolean,
  isPublic: boolean,
}

// Organization (for multi-tenant SaaS)
Organization: {
  id: string,
  name: string,
  type: 'billing_company' | 'practice' | 'hospital' | 'health_system',

  // Contact
  primaryContactName: string,
  primaryContactEmail: string,
  primaryContactPhone: string,

  // Address
  address: json,

  // Subscription
  subscriptionId: string,
  subscriptionStatus: string,

  // Settings
  timezone: string,
  dateFormat: string,
  currency: string,

  // Branding
  logoUrl: string,
  primaryColor: string,

  // Features
  enabledFeatures: json,
  operatingMode: 'full_ai' | 'hybrid' | 'manual',

  // Status
  status: 'active' | 'suspended' | 'terminated',
  onboardingCompletedAt: datetime,
}

// Usage Tracking
UsageRecord: {
  id: string,
  organizationId: string,
  subscriptionId: string,

  recordDate: date,
  recordType: 'daily' | 'monthly',

  // Counts
  activeUsers: integer,
  claimsSubmitted: integer,
  claimsPaid: integer,
  documentsProcessed: integer,
  aiTasksRun: integer,
  apiCalls: integer,
  storageUsedMb: number,

  // Financial
  collectionsAmount: number,
  billedAmount: number,
}
```

---

## Critical Gap #5: Encounter/Clinical Documentation

### Current State
Encounter model mentioned but not implemented.

### Required Models

```typescript
// Encounter (clinical visit)
Encounter: {
  id: string,
  patientId: string,
  appointmentId: string,

  // Type
  encounterType: 'office_visit' | 'telehealth' | 'hospital_outpatient' |
                 'emergency' | 'inpatient' | 'observation' | 'home_visit',

  // Dates
  encounterDate: date,
  startTime: datetime,
  endTime: datetime,

  // Providers
  attendingProviderId: string,
  renderingProviderId: string,
  supervisingProviderId: string,

  // Location
  locationId: string,
  placeOfService: string,                 // POS code
  roomNumber: string,

  // Clinical
  chiefComplaint: string,
  clinicalNotes: hasMany('ClinicalNote'),
  diagnoses: hasMany('EncounterDiagnosis'),
  procedures: hasMany('EncounterProcedure'),
  vitals: hasMany('VitalSigns'),

  // Status
  status: 'scheduled' | 'in_progress' | 'completed' |
          'signed' | 'billed' | 'cancelled',
  signedById: string,
  signedAt: datetime,
  coSignedById: string,
  coSignedAt: datetime,

  // Billing
  billingStatus: 'not_ready' | 'ready_to_code' | 'coded' |
                 'ready_to_bill' | 'billed' | 'hold',
  claimId: string,

  // Coding
  codingStatus: 'pending' | 'in_progress' | 'completed' | 'query',
  codedById: string,
  codedAt: datetime,
}

// Clinical Note
ClinicalNote: {
  id: string,
  encounterId: string,
  patientId: string,
  authorId: string,

  noteType: 'progress_note' | 'soap_note' | 'h_and_p' |
            'consultation' | 'procedure_note' | 'discharge_summary' |
            'telephone_encounter' | 'nursing_note',

  // SOAP Format
  subjective: string,
  objective: string,
  assessment: string,
  plan: string,

  // Full Text
  noteText: string,

  // Status
  status: 'draft' | 'signed' | 'addended' | 'amended',
  signedAt: datetime,
  signedById: string,

  // Addenda
  addenda: json,

  // Template
  templateUsed: string,
}

// Vital Signs
VitalSigns: {
  id: string,
  encounterId: string,
  patientId: string,
  recordedById: string,
  recordedAt: datetime,

  // Measurements
  temperature: number,
  temperatureUnit: 'F' | 'C',
  temperatureMethod: string,

  bloodPressureSystolic: integer,
  bloodPressureDiastolic: integer,
  bloodPressurePosition: string,

  heartRate: integer,
  respiratoryRate: integer,
  oxygenSaturation: number,
  oxygenSupplemental: boolean,

  height: number,
  heightUnit: 'in' | 'cm',
  weight: number,
  weightUnit: 'lb' | 'kg',
  bmi: number,

  painLevel: integer,                     // 0-10
  painLocation: string,

  // Additional
  glucoseLevel: number,
  headCircumference: number,              // Pediatric

  notes: string,
}
```

---

## Critical Gap #6: Practice/Location Management

### Current State
Limited multi-location support.

### Required Models

```typescript
// Location/Facility
Location: {
  id: string,
  organizationId: string,

  name: string,
  locationCode: string,
  locationType: 'office' | 'hospital' | 'urgent_care' |
                'surgery_center' | 'lab' | 'imaging',

  // Identifiers
  npi: string,
  taxId: string,
  cliaNumber: string,                     // For labs

  // Address
  address: json,
  phone: string,
  fax: string,
  email: string,

  // Hours
  operatingHours: json,                   // By day of week
  holidaySchedule: json,

  // Billing
  placeOfService: string,                 // Default POS code
  taxonomyCode: string,

  // Settings
  isActive: boolean,
  acceptsNewPatients: boolean,

  // Telehealth
  telehealthEnabled: boolean,
  telehealthPlatform: string,
}

// Provider-Location Assignment
ProviderLocation: {
  id: string,
  providerId: string,
  locationId: string,

  isPrimaryLocation: boolean,
  effectiveDate: date,
  endDate: date,

  // Schedule at this location
  scheduleTemplateId: string,
}
```

---

## Critical Gap #7: Reporting & Analytics

### Current State
Reports mentioned but no models defined.

### Required Models

```typescript
// Report Definition
Report: {
  id: string,
  organizationId: string,

  name: string,
  description: string,
  category: 'financial' | 'operational' | 'clinical' | 'compliance',

  // Type
  reportType: 'standard' | 'custom',

  // Configuration
  dataSource: string,
  filters: json,
  columns: json,
  groupBy: json,
  sortBy: json,

  // Schedule
  isScheduled: boolean,
  scheduleFrequency: 'daily' | 'weekly' | 'monthly',
  scheduleDay: integer,
  scheduleTime: time,
  recipients: json,

  // Output
  outputFormat: 'pdf' | 'excel' | 'csv',

  // Access
  isPublic: boolean,
  sharedWith: json,

  createdById: string,
}

// Report Execution
ReportExecution: {
  id: string,
  reportId: string,

  executedAt: datetime,
  executedById: string,

  // Parameters
  parameters: json,
  dateRangeStart: date,
  dateRangeEnd: date,

  // Results
  status: 'running' | 'completed' | 'failed',
  rowCount: integer,
  executionTimeMs: integer,

  // Output
  outputUrl: string,
  outputFormat: string,
  expiresAt: datetime,

  errorMessage: string,
}

// Dashboard Widget
DashboardWidget: {
  id: string,
  organizationId: string,
  userId: string,

  widgetType: 'metric' | 'chart' | 'list' | 'table',
  title: string,

  // Configuration
  dataSource: string,
  metrics: json,
  chartType: 'bar' | 'line' | 'pie' | 'donut',
  filters: json,
  refreshInterval: integer,              // minutes

  // Layout
  position: json,                         // {x, y, w, h}

  isActive: boolean,
}

// KPI Metric
KPIMetric: {
  id: string,
  organizationId: string,
  metricDate: date,

  // AR Metrics
  totalAR: number,
  ar0to30: number,
  ar31to60: number,
  ar61to90: number,
  ar91to120: number,
  ar120Plus: number,
  arOver90Percent: number,

  // Collection Metrics
  grossCharges: number,
  netCollections: number,
  collectionRate: number,
  adjustmentRate: number,

  // Claim Metrics
  claimsSubmitted: integer,
  claimsPaid: integer,
  claimsDenied: integer,
  denialRate: number,
  cleanClaimRate: number,
  firstPassResolutionRate: number,

  // Denial Metrics
  denialsByCategory: json,
  appealSuccessRate: number,

  // Productivity
  averageDaysInAR: number,
  averageDaysToPayment: number,
  chargesPerFTE: number,
  claimsPerFTE: number,

  // AI Metrics
  aiAutoApprovalRate: number,
  aiAccuracyRate: number,
  aiTimeSavedHours: number,
}
```

---

## Implementation Priority Matrix

### Phase 0.5: Operating Modes (IMMEDIATE)

| Item | Effort | Priority |
|------|--------|----------|
| OperatingModeSettings model | Small | CRITICAL |
| Mode toggle in UI | Medium | CRITICAL |
| Conditional AI agent triggering | Medium | CRITICAL |
| Manual workflow paths | Medium | CRITICAL |

### Phase 1: Practice Essentials

| Item | Effort | Priority |
|------|--------|----------|
| Scheduling system (appointments) | Large | HIGH |
| Patient payment processing | Medium | HIGH |
| Location management | Small | HIGH |
| Basic reporting | Medium | HIGH |

### Phase 2: Full EHR

| Item | Effort | Priority |
|------|--------|----------|
| Encounter documentation | Large | MEDIUM |
| Clinical notes | Medium | MEDIUM |
| Vital signs | Small | MEDIUM |
| Telehealth integration | Medium | MEDIUM |

### Phase 3: SaaS Platform

| Item | Effort | Priority |
|------|--------|----------|
| Subscription management | Medium | HIGH |
| Usage tracking | Small | HIGH |
| Multi-org architecture | Large | HIGH |
| Billing/invoicing for SaaS | Medium | HIGH |

### Phase 4: Advanced Features

| Item | Effort | Priority |
|------|--------|----------|
| E-Prescribing | Large | LOW |
| Lab orders/results | Large | LOW |
| Referral management | Medium | LOW |
| Care coordination | Large | LOW |

---

## User Type Coverage Summary

### Medical Billing Company (PRIMARY) ✅
- **Status:** Well covered
- **Gaps:** Operating modes, SaaS subscription for selling

### Medical Practice/Clinic ⚠️
- **Status:** Partially covered
- **Gaps:** Scheduling, encounter documentation, practice analytics

### Doctor/Physician ⚠️
- **Status:** Partially covered
- **Gaps:** Clinical documentation, orders, portal enhancements

### Patient ⚠️
- **Status:** Partially covered
- **Gaps:** Payment processing, scheduling self-service, portal features

### Medical Biller ✅
- **Status:** Well covered
- **Gaps:** Operating mode switch, enhanced reporting

### Medical Coder ✅
- **Status:** Well covered
- **Gaps:** Enhanced encoder integration, CDI queries

---

## Recommended Next Steps

1. **Add Operating Mode System** - Critical for three-mode requirement
2. **Add Scheduling Models** - Essential for practice management
3. **Add Payment Processing Models** - Essential for patient collections
4. **Add SaaS/Subscription Models** - Required for public sales
5. **Update Data Schema** - Add all missing models
6. **Create Mode-Aware UI Components** - Show/hide AI features based on mode
7. **Document Operating Mode Workflows** - Clear documentation for each mode

---

*Gap Analysis Created: 2025-12-03*
*For: EHR-26-2 Medical Billing Platform*
