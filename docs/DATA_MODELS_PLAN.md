# EHR System - Data Models Plan

## Overview

This document outlines all data models required to support the 6 user personas and 80+ features identified in the persona simulations. These models will be implemented in AWS Amplify Gen2's data layer.

---

## Model Categories

| Category | Model Count | Description |
|----------|-------------|-------------|
| **Billing & Revenue Cycle** | **28** | **Claims, payments, denials, coding (PRIORITY)** |
| **AI Billing Automation** | **8** | **AI agent tasks, predictions, suggestions** |
| Core Clinical | 18 | Patient care and documentation |
| Orders & Results | 12 | Lab, pharmacy, imaging orders |
| Scheduling | 8 | Appointments and calendars |
| Administrative | 15 | Users, roles, configuration |
| Communication | 6 | Messaging and notifications |
| Quality & Compliance | 8 | QC, audit, regulatory |
| Reference Data | 10 | Lookup tables and catalogs |

**Total: 113 Data Models**

---

## PRIORITY: Billing & Revenue Cycle Models

These models must be implemented first as they support the core medical billing functionality.

### Claim
```typescript
Claim: a.model({
  id: a.id().required(),
  claimNumber: a.string().required(),        // Internal claim ID
  patientId: a.id().required(),
  encounterId: a.id().required(),
  // Claim Type & Form
  claimType: a.enum(['professional', 'institutional']),  // CMS-1500 vs UB-04
  formType: a.enum(['cms1500', 'ub04']),
  frequencyCode: a.enum(['1', '7', '8']),    // Original, Replace, Void
  originalClaimId: a.id(),                    // For corrected claims
  // Dates
  serviceFromDate: a.date().required(),
  serviceToDate: a.date().required(),
  admissionDate: a.date(),
  dischargeDate: a.date(),
  statementFromDate: a.date(),
  statementToDate: a.date(),
  // Provider Information
  billingProviderId: a.id().required(),
  renderingProviderId: a.id().required(),
  referringProviderId: a.id(),
  facilityId: a.id(),
  // Payer Information
  primaryPayerId: a.id().required(),
  secondaryPayerId: a.id(),
  tertiaryPayerId: a.id(),
  patientInsuranceId: a.id().required(),
  // Claim Totals
  totalCharges: a.float().required(),
  totalAllowed: a.float(),
  totalPaid: a.float(),
  totalAdjustment: a.float(),
  patientResponsibility: a.float(),
  // Status Tracking
  status: a.enum([
    'draft', 'ready', 'scrubbing', 'hold',
    'submitted', 'acknowledged', 'pending',
    'paid', 'partial_paid', 'denied',
    'rejected', 'appealed', 'written_off', 'void'
  ]),
  submissionStatus: a.enum(['not_submitted', 'pending', 'accepted', 'rejected']),
  // Submission Details
  clearinghouseId: a.string(),
  clearinghouseClaimId: a.string(),
  submittedAt: a.datetime(),
  acknowledgedAt: a.datetime(),
  paidAt: a.datetime(),
  // EDI Information
  ediFileId: a.string(),
  controlNumber: a.string(),
  // Billing User
  createdById: a.id(),
  lastWorkedById: a.id(),
  lastWorkedAt: a.datetime(),
  // AR Tracking
  arBucket: a.enum(['0-30', '31-60', '61-90', '91-120', '120+']),
  daysInAR: a.integer(),
  followUpDate: a.date(),
  // Notes
  billingNotes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  encounter: a.belongsTo('Encounter', 'encounterId'),
  lines: a.hasMany('ClaimLine', 'claimId'),
  diagnoses: a.hasMany('ClaimDiagnosis', 'claimId'),
  remittances: a.hasMany('RemittanceLine', 'claimId'),
  denials: a.hasMany('Denial', 'claimId'),
  appeals: a.hasMany('Appeal', 'claimId'),
  statusHistory: a.hasMany('ClaimStatusHistory', 'claimId'),
})
```

### ClaimLine
```typescript
ClaimLine: a.model({
  id: a.id().required(),
  claimId: a.id().required(),
  lineNumber: a.integer().required(),
  // Service Information
  serviceDate: a.date().required(),
  placeOfService: a.string().required(),     // POS code
  procedureCode: a.string().required(),      // CPT/HCPCS
  modifiers: a.json(),                       // Array of up to 4 modifiers
  description: a.string(),
  // Diagnosis Pointers
  diagnosisPointers: a.json(),               // Array of pointers [1,2,3,4]
  // Units & Charges
  units: a.float().required(),
  unitType: a.enum(['units', 'minutes', 'days']),
  chargeAmount: a.float().required(),
  // Payment Information
  allowedAmount: a.float(),
  paidAmount: a.float(),
  adjustmentAmount: a.float(),
  patientResponsibility: a.float(),
  coinsurance: a.float(),
  copay: a.float(),
  deductible: a.float(),
  // Status
  status: a.enum(['pending', 'paid', 'denied', 'adjusted']),
  // Rendering Provider (if different from claim)
  renderingProviderId: a.id(),
  renderingProviderNpi: a.string(),
  // Revenue Code (for institutional claims)
  revenueCode: a.string(),
  // NDC for drugs
  ndcCode: a.string(),
  ndcUnits: a.float(),
  ndcUnitType: a.string(),
  // Prior Authorization
  priorAuthNumber: a.string(),
  // Notes
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  claim: a.belongsTo('Claim', 'claimId'),
})
```

### ClaimDiagnosis
```typescript
ClaimDiagnosis: a.model({
  id: a.id().required(),
  claimId: a.id().required(),
  sequence: a.integer().required(),          // 1-12 for professional, 1-25 for institutional
  icd10Code: a.string().required(),
  description: a.string(),
  diagnosisType: a.enum(['principal', 'admitting', 'secondary', 'external_cause']),
  presentOnAdmission: a.enum(['Y', 'N', 'U', 'W', 'E']),  // POA indicator
  createdAt: a.datetime(),
  // Relationships
  claim: a.belongsTo('Claim', 'claimId'),
})
```

### ClaimStatusHistory
```typescript
ClaimStatusHistory: a.model({
  id: a.id().required(),
  claimId: a.id().required(),
  previousStatus: a.string(),
  newStatus: a.string().required(),
  reason: a.string(),
  changedById: a.id(),
  changedAt: a.datetime().required(),
  notes: a.string(),
  // Relationships
  claim: a.belongsTo('Claim', 'claimId'),
})
```

### Remittance (ERA/EOB)
```typescript
Remittance: a.model({
  id: a.id().required(),
  // ERA Identification
  remittanceNumber: a.string().required(),   // Check/EFT number
  ediFileId: a.string(),
  controlNumber: a.string(),
  // Payer Information
  payerId: a.id().required(),
  payerName: a.string(),
  payerIdentifier: a.string(),
  // Payment Information
  paymentMethod: a.enum(['check', 'eft', 'virtual_card', 'ach']),
  paymentDate: a.date().required(),
  totalPaymentAmount: a.float().required(),
  // Totals
  totalClaimCount: a.integer(),
  totalChargeAmount: a.float(),
  totalAllowedAmount: a.float(),
  totalAdjustmentAmount: a.float(),
  totalPatientResponsibility: a.float(),
  // Processing Status
  status: a.enum(['received', 'processing', 'posted', 'reconciled', 'exception']),
  receivedAt: a.datetime(),
  processedAt: a.datetime(),
  postedById: a.id(),
  postedAt: a.datetime(),
  // Reconciliation
  isReconciled: a.boolean(),
  reconciledAt: a.datetime(),
  reconciledById: a.id(),
  varianceAmount: a.float(),
  varianceNotes: a.string(),
  // Bank Deposit
  depositDate: a.date(),
  depositReference: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  payer: a.belongsTo('Insurance', 'payerId'),
  lines: a.hasMany('RemittanceLine', 'remittanceId'),
})
```

### RemittanceLine
```typescript
RemittanceLine: a.model({
  id: a.id().required(),
  remittanceId: a.id().required(),
  claimId: a.id(),
  claimLineId: a.id(),
  // Claim Identification
  patientControlNumber: a.string(),          // Original claim number
  payerClaimNumber: a.string(),              // Payer's claim ID
  // Patient Information
  patientId: a.id(),
  patientName: a.string(),
  patientAccountNumber: a.string(),
  // Service Information
  serviceFromDate: a.date(),
  serviceToDate: a.date(),
  procedureCode: a.string(),
  modifiers: a.json(),
  revenueCode: a.string(),
  // Amounts
  chargeAmount: a.float(),
  allowedAmount: a.float(),
  paidAmount: a.float(),
  patientResponsibility: a.float(),
  coinsurance: a.float(),
  copay: a.float(),
  deductible: a.float(),
  // Adjustments (CARC/RARC)
  adjustments: a.json(),                     // Array of {groupCode, reasonCode, amount}
  // Remark Codes
  remarkCodes: a.json(),                     // Array of RARC codes
  // Status
  status: a.enum(['matched', 'unmatched', 'posted', 'exception']),
  postingStatus: a.enum(['pending', 'auto_posted', 'manual_posted', 'exception']),
  exceptionReason: a.string(),
  // Matching
  matchedAt: a.datetime(),
  matchConfidence: a.float(),
  manuallyMatched: a.boolean(),
  postedAt: a.datetime(),
  postedById: a.id(),
  createdAt: a.datetime(),
  // Relationships
  remittance: a.belongsTo('Remittance', 'remittanceId'),
  claim: a.belongsTo('Claim', 'claimId'),
})
```

### Denial
```typescript
Denial: a.model({
  id: a.id().required(),
  claimId: a.id().required(),
  claimLineId: a.id(),
  remittanceLineId: a.id(),
  // Denial Information
  denialDate: a.date().required(),
  // Reason Codes
  carcCode: a.string().required(),           // Claim Adjustment Reason Code
  carcDescription: a.string(),
  rarcCodes: a.json(),                       // Remark codes
  groupCode: a.enum(['CO', 'PR', 'OA', 'PI', 'CR']),  // Contractual, Patient, Other, Payer, Correction
  // Categorization
  denialCategory: a.enum([
    'eligibility', 'authorization', 'medical_necessity',
    'coding', 'duplicate', 'timely_filing', 'bundling',
    'missing_info', 'coordination_of_benefits', 'other'
  ]),
  denialType: a.enum(['hard', 'soft']),      // Hard = non-recoverable, Soft = fixable
  isPreventable: a.boolean(),
  rootCause: a.string(),
  // Financial Impact
  deniedAmount: a.float().required(),
  // Resolution
  status: a.enum(['open', 'in_progress', 'appealed', 'corrected', 'written_off', 'recovered', 'closed']),
  resolution: a.enum(['paid_on_appeal', 'paid_on_resubmit', 'written_off', 'patient_responsibility', 'upheld']),
  resolvedAt: a.datetime(),
  recoveredAmount: a.float(),
  // Work Queue
  assignedToId: a.id(),
  priority: a.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: a.date(),
  // Tracking
  daysToResolve: a.integer(),
  touchCount: a.integer(),                   // Number of times worked
  lastWorkedAt: a.datetime(),
  lastWorkedById: a.id(),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  claim: a.belongsTo('Claim', 'claimId'),
  appeals: a.hasMany('Appeal', 'denialId'),
})
```

### Appeal
```typescript
Appeal: a.model({
  id: a.id().required(),
  claimId: a.id().required(),
  denialId: a.id().required(),
  // Appeal Information
  appealLevel: a.enum(['first', 'second', 'third', 'external_review']),
  appealType: a.enum(['written', 'peer_to_peer', 'expedited']),
  appealReason: a.string().required(),
  // Dates & Deadlines
  filingDeadline: a.date().required(),
  submittedAt: a.datetime(),
  receivedByPayerAt: a.datetime(),
  decisionDueDate: a.date(),
  decisionReceivedAt: a.datetime(),
  // Appeal Content
  appealLetter: a.string(),                  // Generated or manual letter text
  letterTemplateId: a.id(),
  supportingDocuments: a.json(),             // Array of document URLs
  // Decision
  status: a.enum(['draft', 'submitted', 'pending', 'approved', 'denied', 'partial', 'expired']),
  decision: a.enum(['approved', 'denied', 'partial_approval']),
  decisionReason: a.string(),
  approvedAmount: a.float(),
  // Submission Details
  submittedById: a.id(),
  submissionMethod: a.enum(['clearinghouse', 'portal', 'fax', 'mail']),
  trackingNumber: a.string(),
  confirmationNumber: a.string(),
  // AI Assistance
  aiGenerated: a.boolean(),
  aiConfidenceScore: a.float(),
  // Notes
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  claim: a.belongsTo('Claim', 'claimId'),
  denial: a.belongsTo('Denial', 'denialId'),
})
```

### PriorAuthorization
```typescript
PriorAuthorization: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  patientInsuranceId: a.id().required(),
  // Request Information
  authorizationType: a.enum(['inpatient', 'outpatient', 'procedure', 'medication', 'dme', 'imaging']),
  requestedServiceCode: a.string(),
  requestedServiceDescription: a.string().required(),
  requestedUnits: a.integer(),
  requestedFromDate: a.date().required(),
  requestedToDate: a.date().required(),
  // Diagnosis
  diagnosisCodes: a.json(),                  // Array of ICD-10 codes
  // Provider Information
  requestingProviderId: a.id().required(),
  servicingProviderId: a.id(),
  facilityId: a.id(),
  // Submission
  submittedAt: a.datetime(),
  submissionMethod: a.enum(['portal', 'phone', 'fax', 'edi_278']),
  submittedById: a.id(),
  // Payer Response
  authorizationNumber: a.string(),
  status: a.enum([
    'draft', 'pending_submission', 'submitted', 'pending_review',
    'approved', 'partially_approved', 'denied', 'expired', 'cancelled'
  ]),
  approvedUnits: a.integer(),
  approvedFromDate: a.date(),
  approvedToDate: a.date(),
  denialReason: a.string(),
  // Tracking
  expirationDate: a.date(),
  unitsUsed: a.integer(),
  unitsRemaining: a.integer(),
  // Review Information
  reviewerName: a.string(),
  reviewerPhone: a.string(),
  peerReviewRequired: a.boolean(),
  peerReviewScheduledAt: a.datetime(),
  // Documents
  clinicalDocuments: a.json(),               // Array of document URLs
  letterOfMedicalNecessity: a.string(),
  // Notes
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  claims: a.hasMany('Claim', 'priorAuthId'),
})
```

### EligibilityCheck
```typescript
EligibilityCheck: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  patientInsuranceId: a.id().required(),
  // Request Information
  checkDate: a.datetime().required(),
  serviceTypeCode: a.string(),               // Service type being verified
  requestedById: a.id(),
  // Response Information
  status: a.enum(['pending', 'active', 'inactive', 'error']),
  coverageActive: a.boolean(),
  effectiveDate: a.date(),
  terminationDate: a.date(),
  // Plan Information
  planName: a.string(),
  planType: a.string(),
  groupNumber: a.string(),
  // Benefits Information
  deductibleIndividual: a.float(),
  deductibleIndividualMet: a.float(),
  deductibleFamily: a.float(),
  deductibleFamilyMet: a.float(),
  outOfPocketMax: a.float(),
  outOfPocketMet: a.float(),
  coinsurancePercent: a.float(),
  copayOffice: a.float(),
  copaySpecialist: a.float(),
  copayUrgentCare: a.float(),
  copayER: a.float(),
  // Prior Auth Requirements
  priorAuthRequired: a.boolean(),
  priorAuthPhone: a.string(),
  // Network Status
  inNetwork: a.boolean(),
  // EDI Transaction
  ediRequestId: a.string(),
  ediResponseId: a.string(),
  rawResponse: a.json(),
  // Error Information
  errorCode: a.string(),
  errorMessage: a.string(),
  createdAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  patientInsurance: a.belongsTo('PatientInsurance', 'patientInsuranceId'),
})
```

### Charge
```typescript
Charge: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  encounterId: a.id().required(),
  // Charge Information
  chargeDate: a.date().required(),
  procedureCode: a.string().required(),
  modifiers: a.json(),
  description: a.string(),
  diagnosisCodes: a.json(),                  // Array of ICD-10 codes
  // Units & Amount
  units: a.float().required(),
  unitPrice: a.float().required(),
  totalAmount: a.float().required(),
  // Provider
  renderingProviderId: a.id().required(),
  // Status
  status: a.enum(['pending_review', 'approved', 'hold', 'billed', 'void']),
  holdReason: a.string(),
  // Billing
  claimId: a.id(),
  claimLineId: a.id(),
  billedAt: a.datetime(),
  // Capture Source
  captureSource: a.enum(['encounter', 'order', 'procedure', 'manual', 'ai_suggested']),
  capturedById: a.id(),
  approvedById: a.id(),
  approvedAt: a.datetime(),
  // Notes
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  encounter: a.belongsTo('Encounter', 'encounterId'),
  claim: a.belongsTo('Claim', 'claimId'),
})
```

### FeeSchedule
```typescript
FeeSchedule: a.model({
  id: a.id().required(),
  payerId: a.id(),                           // Null for master fee schedule
  name: a.string().required(),
  type: a.enum(['master', 'payer_contracted', 'medicare', 'medicaid', 'self_pay']),
  effectiveDate: a.date().required(),
  terminationDate: a.date(),
  status: a.enum(['active', 'inactive', 'pending']),
  // Notes
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  payer: a.belongsTo('Insurance', 'payerId'),
  items: a.hasMany('FeeScheduleItem', 'feeScheduleId'),
})
```

### FeeScheduleItem
```typescript
FeeScheduleItem: a.model({
  id: a.id().required(),
  feeScheduleId: a.id().required(),
  procedureCode: a.string().required(),
  modifiers: a.json(),
  description: a.string(),
  // Fees
  standardFee: a.float().required(),
  allowedAmount: a.float(),
  medicareRate: a.float(),
  // RVU Information (for professional)
  workRvu: a.float(),
  practiceExpenseRvu: a.float(),
  malpracticeRvu: a.float(),
  totalRvu: a.float(),
  conversionFactor: a.float(),
  // Effective Dates
  effectiveDate: a.date(),
  terminationDate: a.date(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  feeSchedule: a.belongsTo('FeeSchedule', 'feeScheduleId'),
})
```

### PayerContract
```typescript
PayerContract: a.model({
  id: a.id().required(),
  payerId: a.id().required(),
  contractName: a.string().required(),
  contractNumber: a.string(),
  // Contract Dates
  effectiveDate: a.date().required(),
  terminationDate: a.date(),
  autoRenew: a.boolean(),
  renewalNoticeDays: a.integer(),
  // Contract Terms
  reimbursementMethod: a.enum(['fee_schedule', 'percent_of_charges', 'percent_of_medicare', 'per_diem', 'case_rate']),
  reimbursementPercent: a.float(),
  // Timely Filing
  timelyFilingDays: a.integer(),
  appealTimelineDays: a.integer(),
  // Contact Information
  contractManagerName: a.string(),
  contractManagerEmail: a.string(),
  contractManagerPhone: a.string(),
  // Documents
  contractDocumentUrl: a.string(),
  feeScheduleId: a.id(),
  // Status
  status: a.enum(['active', 'pending', 'expired', 'terminated']),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  payer: a.belongsTo('Insurance', 'payerId'),
  feeSchedule: a.belongsTo('FeeSchedule', 'feeScheduleId'),
})
```

### Statement (Patient Statement)
```typescript
Statement: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  statementNumber: a.string().required(),
  statementDate: a.date().required(),
  // Period
  periodFromDate: a.date(),
  periodToDate: a.date(),
  // Amounts
  previousBalance: a.float(),
  newCharges: a.float(),
  paymentsReceived: a.float(),
  adjustments: a.float(),
  currentBalance: a.float().required(),
  // Minimum Payment
  minimumPaymentDue: a.float(),
  paymentDueDate: a.date(),
  // Statement Details
  statementMessage: a.string(),
  dunningLevel: a.integer(),                 // 1, 2, 3, 4 for escalating messages
  // Delivery
  deliveryMethod: a.enum(['mail', 'email', 'portal', 'sms']),
  deliveredAt: a.datetime(),
  emailAddress: a.string(),
  mailingAddress: a.json(),
  // Status
  status: a.enum(['generated', 'sent', 'delivered', 'paid', 'partial_paid', 'collections']),
  // Documents
  statementPdfUrl: a.string(),
  // Payment Plan
  paymentPlanId: a.id(),
  // Notes
  notes: a.string(),
  createdAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  charges: a.hasMany('StatementCharge', 'statementId'),
})
```

### PaymentPlan
```typescript
PaymentPlan: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  // Plan Details
  planName: a.string(),
  originalBalance: a.float().required(),
  remainingBalance: a.float().required(),
  // Payment Terms
  paymentAmount: a.float().required(),
  paymentFrequency: a.enum(['weekly', 'biweekly', 'monthly']),
  numberOfPayments: a.integer(),
  paymentsCompleted: a.integer(),
  startDate: a.date().required(),
  nextPaymentDate: a.date(),
  // Auto-Pay
  autoPayEnabled: a.boolean(),
  paymentMethodId: a.id(),
  // Status
  status: a.enum(['active', 'completed', 'defaulted', 'cancelled']),
  defaultCount: a.integer(),
  lastPaymentDate: a.date(),
  lastPaymentAmount: a.float(),
  // Approval
  approvedById: a.id(),
  approvedAt: a.datetime(),
  // Notes
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  payments: a.hasMany('Payment', 'paymentPlanId'),
})
```

### WriteOff
```typescript
WriteOff: a.model({
  id: a.id().required(),
  patientId: a.id(),
  claimId: a.id(),
  // Write-Off Information
  writeOffType: a.enum([
    'contractual', 'bad_debt', 'charity_care', 'small_balance',
    'timely_filing', 'provider_discount', 'admin_adjustment', 'other'
  ]),
  reason: a.string().required(),
  // Amount
  amount: a.float().required(),
  // Approval Workflow
  status: a.enum(['pending', 'approved', 'rejected']),
  requestedById: a.id().required(),
  requestedAt: a.datetime().required(),
  approvedById: a.id(),
  approvedAt: a.datetime(),
  rejectionReason: a.string(),
  // Approval Requirements
  approvalRequired: a.boolean(),
  approvalThreshold: a.float(),              // Amount requiring approval
  // Financial Classification
  financialClass: a.string(),
  glAccountCode: a.string(),
  // Notes
  notes: a.string(),
  createdAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  claim: a.belongsTo('Claim', 'claimId'),
})
```

### BillingWorkQueue
```typescript
BillingWorkQueue: a.model({
  id: a.id().required(),
  // Work Item
  workItemType: a.enum([
    'claim_review', 'claim_correction', 'denial_work', 'appeal',
    'ar_followup', 'payment_posting', 'eligibility', 'prior_auth',
    'refund', 'statement', 'collections'
  ]),
  referenceType: a.enum(['claim', 'denial', 'remittance', 'patient', 'prior_auth']),
  referenceId: a.id().required(),
  // Patient/Claim Info (denormalized for queue display)
  patientId: a.id(),
  patientName: a.string(),
  claimNumber: a.string(),
  amount: a.float(),
  payerName: a.string(),
  // Priority & Assignment
  priority: a.enum(['low', 'medium', 'high', 'urgent']).required(),
  assignedToId: a.id(),
  assignedAt: a.datetime(),
  // Status
  status: a.enum(['open', 'in_progress', 'pending', 'completed', 'escalated']),
  // Dates
  dueDate: a.date(),
  slaDeadline: a.datetime(),
  createdAt: a.datetime().required(),
  startedAt: a.datetime(),
  completedAt: a.datetime(),
  // Work Tracking
  touchCount: a.integer(),
  lastAction: a.string(),
  lastActionAt: a.datetime(),
  lastActionById: a.id(),
  // Resolution
  resolution: a.string(),
  resolutionNotes: a.string(),
  // AI Flags
  aiSuggested: a.boolean(),
  aiPriority: a.float(),
  aiRecommendedAction: a.string(),
  // Relationships
  assignedTo: a.belongsTo('User', 'assignedToId'),
})
```

### CodingWorkQueue
```typescript
CodingWorkQueue: a.model({
  id: a.id().required(),
  encounterId: a.id().required(),
  patientId: a.id().required(),
  // Encounter Information
  encounterDate: a.date().required(),
  encounterType: a.string(),
  providerName: a.string(),
  payerName: a.string(),
  // Priority & Assignment
  priority: a.enum(['routine', 'urgent', 'stat']),
  assignedCoderId: a.id(),
  assignedAt: a.datetime(),
  // Status
  status: a.enum(['pending', 'in_progress', 'query_pending', 'completed', 'hold']),
  holdReason: a.string(),
  // Coding Information
  codingStartedAt: a.datetime(),
  codingCompletedAt: a.datetime(),
  codingDurationMinutes: a.integer(),
  // Codes Assigned
  diagnosisCodes: a.json(),                  // Array of ICD-10 codes
  procedureCodes: a.json(),                  // Array of CPT codes
  emLevel: a.string(),
  // DRG/APC (if applicable)
  drgCode: a.string(),
  drgWeight: a.float(),
  apcCode: a.string(),
  // Query Tracking
  hasOpenQuery: a.boolean(),
  queryCount: a.integer(),
  // Audit Flags
  auditSelected: a.boolean(),
  auditCompletedAt: a.datetime(),
  auditScore: a.float(),
  // AI Suggestions
  aiCodesAvailable: a.boolean(),
  aiCodeAcceptanceRate: a.float(),
  // Deadline
  codingDeadline: a.date(),
  daysFromService: a.integer(),
  // Notes
  coderNotes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  encounter: a.belongsTo('Encounter', 'encounterId'),
  assignedCoder: a.belongsTo('User', 'assignedCoderId'),
  queries: a.hasMany('CodingQuery', 'codingWorkQueueId'),
})
```

### CodingQuery
```typescript
CodingQuery: a.model({
  id: a.id().required(),
  codingWorkQueueId: a.id().required(),
  encounterId: a.id().required(),
  // Query Information
  queryType: a.enum([
    'diagnosis_clarification', 'procedure_clarification', 'medical_necessity',
    'present_on_admission', 'principal_diagnosis', 'specificity',
    'clinical_validation', 'compliance', 'other'
  ]),
  queryReason: a.string().required(),
  queryText: a.string().required(),
  queryTemplateId: a.id(),
  // Clinical Context
  documentReference: a.string(),             // Where in chart to look
  suggestedCodes: a.json(),                  // Potential codes pending clarification
  // Provider Response
  providerId: a.id().required(),
  providerName: a.string(),
  status: a.enum(['draft', 'sent', 'viewed', 'responded', 'no_response', 'cancelled']),
  sentAt: a.datetime(),
  viewedAt: a.datetime(),
  responseReceivedAt: a.datetime(),
  providerResponse: a.string(),
  agreementStatus: a.enum(['agreed', 'disagreed', 'modified', 'unable_to_determine']),
  // Follow-up
  reminderSentAt: a.datetime(),
  reminderCount: a.integer(),
  escalatedAt: a.datetime(),
  escalatedToId: a.id(),
  // Resolution
  resolvedAt: a.datetime(),
  resolvedById: a.id(),
  resolutionOutcome: a.string(),
  finalCodes: a.json(),
  // Metrics
  turnaroundDays: a.integer(),
  impactOnReimbursement: a.float(),
  // Notes
  notes: a.string(),
  createdAt: a.datetime(),
  createdById: a.id(),
  updatedAt: a.datetime(),
  // Relationships
  codingWorkQueue: a.belongsTo('CodingWorkQueue', 'codingWorkQueueId'),
  encounter: a.belongsTo('Encounter', 'encounterId'),
  provider: a.belongsTo('Provider', 'providerId'),
})
```

### ReasonCode (Reference Data)
```typescript
ReasonCode: a.model({
  id: a.id().required(),
  codeType: a.enum(['carc', 'rarc', 'group']),
  code: a.string().required(),
  description: a.string().required(),
  category: a.string(),
  // Actionability
  actionRequired: a.enum(['appeal', 'correct_and_resubmit', 'write_off', 'patient_bill', 'review']),
  isPreventable: a.boolean(),
  // Common Causes & Solutions
  commonCauses: a.json(),
  suggestedActions: a.json(),
  // Effective Dates
  effectiveDate: a.date(),
  terminationDate: a.date(),
  isActive: a.boolean(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
```

---

## AI Billing Automation Models

These models support the AI Billing Agent functionality.

### AIBillingTask
```typescript
AIBillingTask: a.model({
  id: a.id().required(),
  // Task Type
  taskType: a.enum([
    'code_suggestion', 'claim_scrub', 'denial_prediction',
    'payment_posting', 'appeal_generation', 'eligibility_check',
    'charge_capture', 'ar_followup', 'prior_auth'
  ]),
  // Reference
  referenceType: a.enum(['encounter', 'claim', 'remittance', 'denial', 'patient']),
  referenceId: a.id().required(),
  // Status
  status: a.enum(['pending', 'processing', 'completed', 'failed', 'human_review']),
  startedAt: a.datetime(),
  completedAt: a.datetime(),
  processingTimeMs: a.integer(),
  // Input/Output
  inputData: a.json(),
  outputData: a.json(),
  // Confidence & Decision
  confidenceScore: a.float(),
  autoApproved: a.boolean(),
  autoApprovalThreshold: a.float(),
  // Human Review
  requiresHumanReview: a.boolean(),
  reviewedById: a.id(),
  reviewedAt: a.datetime(),
  reviewDecision: a.enum(['approved', 'rejected', 'modified']),
  reviewNotes: a.string(),
  // Error Handling
  errorMessage: a.string(),
  retryCount: a.integer(),
  // Metrics
  impactAmount: a.float(),                   // Financial impact of action
  timesSaved: a.integer(),                   // Estimated minutes saved
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
```

### AICodeSuggestion
```typescript
AICodeSuggestion: a.model({
  id: a.id().required(),
  encounterId: a.id().required(),
  aiBillingTaskId: a.id(),
  // Suggestion Type
  codeType: a.enum(['diagnosis', 'procedure', 'modifier', 'em_level']),
  // Suggested Code
  suggestedCode: a.string().required(),
  codeDescription: a.string(),
  // Confidence
  confidenceScore: a.float().required(),
  confidenceLevel: a.enum(['high', 'medium', 'low']),
  // Evidence
  evidenceText: a.string(),                  // Text from clinical note
  evidenceLocation: a.string(),              // Where in document
  supportingCodes: a.json(),                 // Related codes that support this
  // Validation
  passesNcci: a.boolean(),
  passesMedicalNecessity: a.boolean(),
  passesLcd: a.boolean(),
  validationErrors: a.json(),
  // Coder Action
  status: a.enum(['pending', 'accepted', 'rejected', 'modified']),
  coderDecision: a.enum(['accept', 'reject', 'modify']),
  finalCode: a.string(),                     // What coder actually used
  rejectionReason: a.string(),
  reviewedById: a.id(),
  reviewedAt: a.datetime(),
  // Model Information
  modelVersion: a.string(),
  modelName: a.string(),
  // Metrics
  financialImpact: a.float(),                // Estimated $ impact
  createdAt: a.datetime(),
  // Relationships
  encounter: a.belongsTo('Encounter', 'encounterId'),
})
```

### DenialPrediction
```typescript
DenialPrediction: a.model({
  id: a.id().required(),
  claimId: a.id().required(),
  aiBillingTaskId: a.id(),
  // Prediction
  denialProbability: a.float().required(),   // 0-1 probability
  riskLevel: a.enum(['low', 'medium', 'high', 'very_high']),
  // Predicted Denial Reasons
  predictedReasons: a.json(),                // Array of {reason, probability}
  primaryPredictedReason: a.string(),
  // Risk Factors
  riskFactors: a.json(),                     // Array of contributing factors
  // Recommendations
  recommendations: a.json(),                 // Array of suggested fixes
  autoCorrectible: a.boolean(),
  // Claim Details (at time of prediction)
  claimAmount: a.float(),
  payerName: a.string(),
  serviceType: a.string(),
  // Action Taken
  actionTaken: a.enum(['submitted', 'held_for_review', 'auto_corrected', 'manual_correction']),
  actionById: a.id(),
  actionAt: a.datetime(),
  // Outcome (for model training)
  actualOutcome: a.enum(['paid', 'denied', 'partial']),
  actualDenialReason: a.string(),
  predictionAccurate: a.boolean(),
  // Model Information
  modelVersion: a.string(),
  createdAt: a.datetime(),
  // Relationships
  claim: a.belongsTo('Claim', 'claimId'),
})
```

### AIAppealDraft
```typescript
AIAppealDraft: a.model({
  id: a.id().required(),
  denialId: a.id().required(),
  appealId: a.id(),
  aiBillingTaskId: a.id(),
  // Generated Content
  appealLetterText: a.string().required(),
  appealSummary: a.string(),
  // Key Arguments
  keyArguments: a.json(),                    // Array of appeal arguments
  supportingEvidence: a.json(),              // Array of evidence citations
  relevantPolicies: a.json(),                // Payer policy references
  // Confidence
  confidenceScore: a.float(),
  successProbability: a.float(),
  // Template/Style
  templateUsed: a.string(),
  toneStyle: a.enum(['formal', 'clinical', 'urgent']),
  // Review
  status: a.enum(['draft', 'reviewed', 'approved', 'rejected', 'sent']),
  reviewedById: a.id(),
  reviewedAt: a.datetime(),
  editsRequired: a.boolean(),
  editedText: a.string(),
  // Model Information
  modelVersion: a.string(),
  promptTokens: a.integer(),
  completionTokens: a.integer(),
  createdAt: a.datetime(),
  // Relationships
  denial: a.belongsTo('Denial', 'denialId'),
  appeal: a.belongsTo('Appeal', 'appealId'),
})
```

### PaymentPostingResult
```typescript
PaymentPostingResult: a.model({
  id: a.id().required(),
  remittanceId: a.id().required(),
  remittanceLineId: a.id().required(),
  aiBillingTaskId: a.id(),
  // Matching Result
  matchStatus: a.enum(['auto_matched', 'fuzzy_matched', 'unmatched', 'multiple_matches']),
  matchConfidence: a.float(),
  matchedClaimId: a.id(),
  matchedClaimLineId: a.id(),
  // Matching Criteria Used
  matchCriteria: a.json(),                   // What fields matched
  matchIssues: a.json(),                     // What didn't match
  alternativeMatches: a.json(),              // Other possible matches
  // Posting Decision
  postingDecision: a.enum(['auto_post', 'manual_review', 'exception']),
  postingStatus: a.enum(['pending', 'posted', 'exception', 'manual']),
  // Variance Detection
  hasVariance: a.boolean(),
  varianceType: a.enum(['underpaid', 'overpaid', 'unexpected_denial', 'contractual']),
  varianceAmount: a.float(),
  varianceExplanation: a.string(),
  // Human Review
  reviewRequired: a.boolean(),
  reviewReason: a.string(),
  reviewedById: a.id(),
  reviewedAt: a.datetime(),
  reviewDecision: a.string(),
  // Posting Execution
  postedAt: a.datetime(),
  postedById: a.id(),
  createdAt: a.datetime(),
  // Relationships
  remittance: a.belongsTo('Remittance', 'remittanceId'),
  claim: a.belongsTo('Claim', 'matchedClaimId'),
})
```

### AIBillingMetrics
```typescript
AIBillingMetrics: a.model({
  id: a.id().required(),
  // Time Period
  metricDate: a.date().required(),
  metricPeriod: a.enum(['daily', 'weekly', 'monthly']),
  // Coding Metrics
  totalCodeSuggestions: a.integer(),
  codeSuggestionsAccepted: a.integer(),
  codeSuggestionsRejected: a.integer(),
  codeSuggestionsModified: a.integer(),
  codeAcceptanceRate: a.float(),
  avgCodingConfidence: a.float(),
  // Denial Prediction Metrics
  totalDenialPredictions: a.integer(),
  predictionsAccurate: a.integer(),
  predictionAccuracy: a.float(),
  denialsPrevented: a.integer(),
  denialPreventionRate: a.float(),
  // Payment Posting Metrics
  totalPaymentsProcessed: a.integer(),
  autoPostedPayments: a.integer(),
  autoPostRate: a.float(),
  exceptionsGenerated: a.integer(),
  avgMatchConfidence: a.float(),
  // Appeal Metrics
  appealsGenerated: a.integer(),
  appealsApproved: a.integer(),
  appealSuccessRate: a.float(),
  // Financial Impact
  revenueRecovered: a.float(),
  denialsCostAvoided: a.float(),
  // Efficiency
  estimatedTimeSavedMinutes: a.integer(),
  tasksAutomated: a.integer(),
  // Model Performance
  modelVersion: a.string(),
  avgInferenceTimeMs: a.float(),
  createdAt: a.datetime(),
})
```

---

## Core Clinical Models

### Patient
```typescript
Patient: a.model({
  id: a.id().required(),
  mrn: a.string().required(),           // Medical Record Number
  firstName: a.string().required(),
  lastName: a.string().required(),
  middleName: a.string(),
  dateOfBirth: a.date().required(),
  gender: a.enum(['male', 'female', 'other', 'unknown']),
  ssn: a.string(),                       // Encrypted
  email: a.string(),
  phone: a.string(),
  address: a.json(),                     // Structured address
  preferredLanguage: a.string(),
  race: a.string().array(),
  ethnicity: a.string(),
  maritalStatus: a.string(),
  photoUrl: a.string(),
  primaryProviderId: a.id(),
  status: a.enum(['active', 'inactive', 'deceased']),
  deceasedDate: a.date(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  allergies: a.hasMany('Allergy', 'patientId'),
  diagnoses: a.hasMany('Diagnosis', 'patientId'),
  medications: a.hasMany('Medication', 'patientId'),
  encounters: a.hasMany('Encounter', 'patientId'),
  appointments: a.hasMany('Appointment', 'patientId'),
  insurances: a.hasMany('PatientInsurance', 'patientId'),
  emergencyContacts: a.hasMany('EmergencyContact', 'patientId'),
})
```

### Encounter
```typescript
Encounter: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  type: a.enum(['office_visit', 'telehealth', 'inpatient', 'emergency', 'observation']),
  class: a.enum(['ambulatory', 'inpatient', 'emergency']),
  status: a.enum(['planned', 'arrived', 'in_progress', 'finished', 'cancelled']),
  reasonForVisit: a.string(),
  chiefComplaint: a.string(),
  locationId: a.id(),
  primaryProviderId: a.id(),
  admitDate: a.datetime(),
  dischargeDate: a.datetime(),
  dischargeDisposition: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  notes: a.hasMany('ClinicalNote', 'encounterId'),
  diagnoses: a.hasMany('Diagnosis', 'encounterId'),
  orders: a.hasMany('Order', 'encounterId'),
  vitalSigns: a.hasMany('VitalSign', 'encounterId'),
})
```

### ClinicalNote
```typescript
ClinicalNote: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  encounterId: a.id().required(),
  authorId: a.id().required(),
  noteType: a.enum(['progress', 'hp', 'procedure', 'consult', 'discharge', 'nursing']),
  status: a.enum(['draft', 'pending_signature', 'signed', 'addended', 'cosigned']),
  // SOAP structure
  subjective: a.json(),
  objective: a.json(),
  assessment: a.json(),
  plan: a.json(),
  freeText: a.string(),
  // Signature tracking
  signedAt: a.datetime(),
  signedBy: a.id(),
  cosignedAt: a.datetime(),
  cosignedBy: a.id(),
  templateId: a.id(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  encounter: a.belongsTo('Encounter', 'encounterId'),
  author: a.belongsTo('User', 'authorId'),
  addendums: a.hasMany('NoteAddendum', 'noteId'),
})
```

### Diagnosis
```typescript
Diagnosis: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  encounterId: a.id(),
  icd10Code: a.string().required(),
  description: a.string().required(),
  snomedCode: a.string(),
  diagnosisType: a.enum(['chronic', 'acute', 'recurrent']),
  status: a.enum(['active', 'resolved', 'inactive']),
  severity: a.string(),
  onsetDate: a.date(),
  resolutionDate: a.date(),
  diagnosedById: a.id(),
  isPrincipal: a.boolean(),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  encounter: a.belongsTo('Encounter', 'encounterId'),
})
```

### Allergy
```typescript
Allergy: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  allergenType: a.enum(['drug', 'food', 'environmental', 'other']),
  allergenName: a.string().required(),
  allergenCode: a.string(),              // RxNorm for drugs
  drugClass: a.string(),
  reactionType: a.enum(['allergy', 'intolerance', 'side_effect']),
  reactions: a.json(),                   // Array of reaction descriptions
  severity: a.enum(['mild', 'moderate', 'severe', 'life_threatening']),
  onsetDate: a.date(),
  source: a.enum(['patient_reported', 'documented', 'observed']),
  verifiedById: a.id(),
  verifiedAt: a.datetime(),
  status: a.enum(['active', 'inactive', 'entered_in_error']),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
})
```

### VitalSign
```typescript
VitalSign: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  encounterId: a.id(),
  recordedBy: a.id().required(),
  recordedAt: a.datetime().required(),
  temperature: a.float(),
  temperatureUnit: a.enum(['F', 'C']),
  temperatureSite: a.enum(['oral', 'tympanic', 'axillary', 'rectal', 'temporal']),
  heartRate: a.integer(),
  systolicBP: a.integer(),
  diastolicBP: a.integer(),
  bpPosition: a.enum(['sitting', 'standing', 'lying']),
  respiratoryRate: a.integer(),
  oxygenSaturation: a.integer(),
  oxygenDelivery: a.string(),
  painScore: a.integer(),
  painLocation: a.string(),
  weight: a.float(),
  weightUnit: a.enum(['kg', 'lb']),
  height: a.float(),
  heightUnit: a.enum(['cm', 'in']),
  bmi: a.float(),
  notes: a.string(),
  deviceId: a.string(),
  createdAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  encounter: a.belongsTo('Encounter', 'encounterId'),
})
```

### Medication (Active Medications)
```typescript
Medication: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  drugCode: a.string(),                  // RxNorm
  drugName: a.string().required(),
  genericName: a.string(),
  strength: a.string(),
  form: a.string(),
  route: a.enum(['oral', 'IV', 'IM', 'SQ', 'topical', 'inhaled', 'other']),
  frequency: a.string(),
  dose: a.string(),
  prescribedById: a.id(),
  startDate: a.date(),
  endDate: a.date(),
  status: a.enum(['active', 'discontinued', 'on_hold', 'completed']),
  source: a.enum(['prescribed', 'otc', 'reported']),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
})
```

### Immunization
```typescript
Immunization: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  encounterId: a.id(),
  vaccineCode: a.string(),               // CVX code
  vaccineName: a.string().required(),
  lotNumber: a.string(),
  expirationDate: a.date(),
  manufacturer: a.string(),
  site: a.string(),
  route: a.string(),
  dose: a.string(),
  doseNumber: a.integer(),
  seriesComplete: a.boolean(),
  administeredAt: a.datetime().required(),
  administeredById: a.id(),
  status: a.enum(['completed', 'not_done', 'entered_in_error']),
  reasonNotGiven: a.string(),
  notes: a.string(),
  createdAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
})
```

### Procedure
```typescript
Procedure: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  encounterId: a.id(),
  procedureCode: a.string(),             // CPT/HCPCS
  description: a.string().required(),
  performedAt: a.datetime().required(),
  performedById: a.id().required(),
  assistedBy: a.json(),                  // Array of provider IDs
  indication: a.string(),
  anesthesiaType: a.string(),
  findings: a.string(),
  complications: a.string(),
  specimens: a.json(),
  consentDocumentId: a.id(),
  status: a.enum(['planned', 'in_progress', 'completed', 'cancelled']),
  notes: a.string(),
  createdAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  encounter: a.belongsTo('Encounter', 'encounterId'),
})
```

### CarePlan
```typescript
CarePlan: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  encounterId: a.id(),
  diagnosisId: a.id(),
  providerId: a.id().required(),
  title: a.string().required(),
  status: a.enum(['active', 'completed', 'discontinued']),
  startDate: a.date(),
  targetEndDate: a.date(),
  lastReviewedAt: a.datetime(),
  lastReviewedById: a.id(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  goals: a.hasMany('CarePlanGoal', 'carePlanId'),
  interventions: a.hasMany('CarePlanIntervention', 'carePlanId'),
})
```

### EmergencyContact
```typescript
EmergencyContact: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  firstName: a.string().required(),
  lastName: a.string().required(),
  relationship: a.string().required(),
  phone: a.string().required(),
  alternatePhone: a.string(),
  email: a.string(),
  address: a.json(),
  priority: a.integer(),
  isLegalGuardian: a.boolean(),
  hasPortalAccess: a.boolean(),
  accessLevel: a.enum(['full', 'limited', 'emergency_only']),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
})
```

---

## Orders & Results Models

### Order (Base)
```typescript
Order: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  encounterId: a.id(),
  orderType: a.enum(['lab', 'imaging', 'medication', 'referral', 'procedure']),
  orderingProviderId: a.id().required(),
  status: a.enum(['draft', 'pending', 'active', 'completed', 'cancelled']),
  priority: a.enum(['routine', 'urgent', 'stat', 'asap']),
  orderedAt: a.datetime().required(),
  effectiveDate: a.datetime(),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  encounter: a.belongsTo('Encounter', 'encounterId'),
})
```

### LabOrder
```typescript
LabOrder: a.model({
  id: a.id().required(),
  orderId: a.id().required(),
  patientId: a.id().required(),
  testCode: a.string().required(),       // LOINC
  testName: a.string().required(),
  specimenType: a.string(),
  diagnosisCode: a.string(),
  diagnosisDescription: a.string(),
  fasting: a.boolean(),
  specialInstructions: a.string(),
  scheduledDate: a.date(),
  performingLabId: a.string(),
  status: a.enum(['ordered', 'collected', 'in_process', 'resulted', 'cancelled']),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  order: a.belongsTo('Order', 'orderId'),
  patient: a.belongsTo('Patient', 'patientId'),
  specimens: a.hasMany('Specimen', 'labOrderId'),
  results: a.hasMany('LabResult', 'labOrderId'),
})
```

### LabResult
```typescript
LabResult: a.model({
  id: a.id().required(),
  labOrderId: a.id().required(),
  patientId: a.id().required(),
  testCode: a.string().required(),
  testName: a.string().required(),
  value: a.string(),
  numericValue: a.float(),
  unit: a.string(),
  referenceRange: a.string(),
  referenceLow: a.float(),
  referenceHigh: a.float(),
  abnormalFlag: a.enum(['normal', 'low', 'high', 'critical_low', 'critical_high', 'abnormal']),
  resultedAt: a.datetime(),
  performingLabName: a.string(),
  performingLabClia: a.string(),
  reviewedById: a.id(),
  reviewedAt: a.datetime(),
  comments: a.string(),
  isCritical: a.boolean(),
  criticalAcknowledgedAt: a.datetime(),
  criticalAcknowledgedBy: a.id(),
  status: a.enum(['pending', 'preliminary', 'final', 'corrected', 'cancelled']),
  createdAt: a.datetime(),
  // Relationships
  labOrder: a.belongsTo('LabOrder', 'labOrderId'),
  patient: a.belongsTo('Patient', 'patientId'),
})
```

### Prescription
```typescript
Prescription: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  encounterId: a.id(),
  prescriberId: a.id().required(),
  drugNdc: a.string(),
  drugName: a.string().required(),
  genericName: a.string(),
  strength: a.string(),
  form: a.string(),
  sig: a.string().required(),            // Directions
  quantity: a.float().required(),
  quantityUnit: a.string(),
  daysSupply: a.integer(),
  refills: a.integer(),
  refillsRemaining: a.integer(),
  dispenseAsWritten: a.boolean(),
  pharmacyNcpdp: a.string(),
  pharmacyName: a.string(),
  isControlled: a.boolean(),
  schedule: a.enum(['II', 'III', 'IV', 'V']),
  status: a.enum(['draft', 'pending', 'sent', 'filled', 'cancelled', 'expired']),
  transmissionId: a.string(),
  sentAt: a.datetime(),
  errorMessage: a.string(),
  pdmpChecked: a.boolean(),
  pdmpCheckDate: a.datetime(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  prescriber: a.belongsTo('Provider', 'prescriberId'),
})
```

### Referral
```typescript
Referral: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  encounterId: a.id(),
  referringProviderId: a.id().required(),
  receivingProviderId: a.id(),
  receivingProviderName: a.string(),
  receivingProviderNpi: a.string(),
  specialty: a.string().required(),
  urgency: a.enum(['routine', 'urgent', 'emergent']),
  diagnosisCode: a.string(),
  diagnosisDescription: a.string(),
  clinicalQuestion: a.string(),
  clinicalSummary: a.string(),
  attachmentUrls: a.json(),
  status: a.enum(['draft', 'sent', 'scheduled', 'completed', 'cancelled']),
  authorizationNumber: a.string(),
  authorizationRequired: a.boolean(),
  sentAt: a.datetime(),
  scheduledDate: a.date(),
  completedAt: a.datetime(),
  consultReportReceived: a.boolean(),
  consultReportUrl: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
})
```

### Specimen
```typescript
Specimen: a.model({
  id: a.id().required(),
  labOrderId: a.id().required(),
  patientId: a.id().required(),
  specimenType: a.string().required(),
  collectedAt: a.datetime(),
  collectedById: a.id(),
  collectionSite: a.string(),
  tubeType: a.string(),
  volume: a.float(),
  status: a.enum(['pending', 'collected', 'received', 'processed', 'stored', 'discarded']),
  condition: a.enum(['acceptable', 'hemolyzed', 'lipemic', 'icteric', 'clotted', 'rejected']),
  rejectReason: a.string(),
  location: a.string(),
  receivedAt: a.datetime(),
  processedAt: a.datetime(),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  labOrder: a.belongsTo('LabOrder', 'labOrderId'),
  patient: a.belongsTo('Patient', 'patientId'),
  chainOfCustody: a.hasMany('ChainOfCustody', 'specimenId'),
})
```

---

## Scheduling Models

### Appointment
```typescript
Appointment: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  providerId: a.id().required(),
  locationId: a.id(),
  appointmentTypeId: a.id(),
  scheduledStart: a.datetime().required(),
  scheduledEnd: a.datetime().required(),
  duration: a.integer(),
  status: a.enum(['scheduled', 'confirmed', 'checked_in', 'roomed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  visitReason: a.string(),
  chiefComplaint: a.string(),
  notes: a.string(),
  isRecurring: a.boolean(),
  recurringPattern: a.json(),
  telehealth: a.boolean(),
  telehealthUrl: a.string(),
  preVisitInstructions: a.string(),
  checkedInAt: a.datetime(),
  roomedAt: a.datetime(),
  cancellationReason: a.string(),
  cancelledAt: a.datetime(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  createdBy: a.id(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  provider: a.belongsTo('Provider', 'providerId'),
  location: a.belongsTo('Location', 'locationId'),
  appointmentType: a.belongsTo('AppointmentType', 'appointmentTypeId'),
})
```

### Schedule (Provider)
```typescript
Schedule: a.model({
  id: a.id().required(),
  providerId: a.id().required(),
  locationId: a.id(),
  dayOfWeek: a.integer(),                // 0-6 (Sunday-Saturday)
  startTime: a.string(),                 // HH:MM format
  endTime: a.string(),
  effectiveDate: a.date().required(),
  expirationDate: a.date(),
  isActive: a.boolean(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  provider: a.belongsTo('Provider', 'providerId'),
  blocks: a.hasMany('ScheduleBlock', 'scheduleId'),
})
```

### ScheduleBlock
```typescript
ScheduleBlock: a.model({
  id: a.id().required(),
  scheduleId: a.id(),
  providerId: a.id().required(),
  startTime: a.datetime().required(),
  endTime: a.datetime().required(),
  blockType: a.enum(['lunch', 'meeting', 'time_off', 'procedure', 'admin', 'other']),
  reason: a.string(),
  isAllDay: a.boolean(),
  createdAt: a.datetime(),
  createdBy: a.id(),
  // Relationships
  schedule: a.belongsTo('Schedule', 'scheduleId'),
})
```

### WaitingRoomQueue
```typescript
WaitingRoomQueue: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  appointmentId: a.id(),
  locationId: a.id().required(),
  checkInTime: a.datetime().required(),
  calledBackTime: a.datetime(),
  roomedTime: a.datetime(),
  status: a.enum(['waiting', 'called', 'roomed', 'completed', 'left']),
  priority: a.enum(['routine', 'urgent', 'walk_in']),
  position: a.integer(),
  estimatedWaitMinutes: a.integer(),
  assignedProviderId: a.id(),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  appointment: a.belongsTo('Appointment', 'appointmentId'),
})
```

---

## Administrative Models

### User
```typescript
User: a.model({
  id: a.id().required(),
  cognitoId: a.string().required(),
  email: a.string().required(),
  firstName: a.string().required(),
  lastName: a.string().required(),
  phone: a.string(),
  employeeId: a.string(),
  userType: a.enum(['staff', 'provider', 'patient', 'admin']),
  status: a.enum(['active', 'inactive', 'pending', 'locked']),
  departmentId: a.id(),
  supervisorId: a.id(),
  hireDate: a.date(),
  terminationDate: a.date(),
  lastLoginAt: a.datetime(),
  failedLoginAttempts: a.integer(),
  lockedUntil: a.datetime(),
  passwordChangedAt: a.datetime(),
  mfaEnabled: a.boolean(),
  preferences: a.json(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  roles: a.hasMany('UserRole', 'userId'),
  sessions: a.hasMany('UserSession', 'userId'),
})
```

### Role
```typescript
Role: a.model({
  id: a.id().required(),
  name: a.string().required(),
  description: a.string(),
  isSystem: a.boolean(),                 // Cannot be deleted
  level: a.integer(),                    // Hierarchy level
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  permissions: a.hasMany('RolePermission', 'roleId'),
})
```

### Permission
```typescript
Permission: a.model({
  id: a.id().required(),
  resource: a.string().required(),       // e.g., 'patient', 'encounter'
  action: a.enum(['create', 'read', 'update', 'delete', 'sign', 'prescribe']),
  scope: a.enum(['own', 'department', 'organization', 'all']),
  description: a.string(),
  createdAt: a.datetime(),
})
```

### Provider
```typescript
Provider: a.model({
  id: a.id().required(),
  userId: a.id().required(),
  npi: a.string().required(),
  firstName: a.string().required(),
  lastName: a.string().required(),
  credentials: a.json(),                 // ['MD', 'DO', 'NP', etc.]
  specialties: a.json(),
  licenseNumber: a.string(),
  licenseState: a.string(),
  licenseExpiration: a.date(),
  deaNumber: a.string(),
  deaExpiration: a.date(),
  photoUrl: a.string(),
  bio: a.string(),
  languages: a.json(),
  acceptingNewPatients: a.boolean(),
  status: a.enum(['active', 'inactive', 'on_leave']),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  user: a.belongsTo('User', 'userId'),
  schedules: a.hasMany('Schedule', 'providerId'),
})
```

### Location
```typescript
Location: a.model({
  id: a.id().required(),
  name: a.string().required(),
  type: a.enum(['clinic', 'hospital', 'lab', 'imaging', 'pharmacy']),
  address: a.json(),
  phone: a.string(),
  fax: a.string(),
  email: a.string(),
  npi: a.string(),
  timezone: a.string(),
  businessHours: a.json(),
  isActive: a.boolean(),
  coordinates: a.json(),                 // {lat, lng}
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
```

### AuditLog
```typescript
AuditLog: a.model({
  id: a.id().required(),
  userId: a.id().required(),
  userRole: a.string(),
  action: a.string().required(),
  resourceType: a.string().required(),
  resourceId: a.string(),
  patientId: a.id(),
  encounterId: a.id(),
  ipAddress: a.string(),
  userAgent: a.string(),
  sessionId: a.string(),
  details: a.json(),
  oldValue: a.json(),
  newValue: a.json(),
  outcome: a.enum(['success', 'failure', 'error']),
  riskScore: a.integer(),
  timestamp: a.datetime().required(),
})
```

---

## Billing & Insurance Models

### PatientInsurance
```typescript
PatientInsurance: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  insuranceId: a.id().required(),
  subscriberId: a.string().required(),
  groupNumber: a.string(),
  policyNumber: a.string(),
  subscriberRelationship: a.enum(['self', 'spouse', 'child', 'other']),
  subscriberName: a.string(),
  subscriberDob: a.date(),
  effectiveDate: a.date().required(),
  terminationDate: a.date(),
  isPrimary: a.boolean(),
  copay: a.json(),                       // {office, specialist, urgent, er}
  deductible: a.float(),
  deductibleMet: a.float(),
  frontCardImageUrl: a.string(),
  backCardImageUrl: a.string(),
  verified: a.boolean(),
  verifiedAt: a.datetime(),
  verifiedBy: a.id(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
  insurance: a.belongsTo('Insurance', 'insuranceId'),
})
```

### Insurance (Payer)
```typescript
Insurance: a.model({
  id: a.id().required(),
  payerId: a.string().required(),
  name: a.string().required(),
  planType: a.enum(['hmo', 'ppo', 'epo', 'pos', 'hdhp', 'medicare', 'medicaid', 'other']),
  address: a.json(),
  phone: a.string(),
  claimsPhone: a.string(),
  eligibilityPhone: a.string(),
  website: a.string(),
  isActive: a.boolean(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
```

### Payment
```typescript
Payment: a.model({
  id: a.id().required(),
  patientId: a.id().required(),
  amount: a.float().required(),
  method: a.enum(['cash', 'check', 'credit_card', 'debit_card', 'ach', 'hsa', 'fsa']),
  reference: a.string(),
  lastFour: a.string(),
  paymentDate: a.datetime().required(),
  status: a.enum(['pending', 'completed', 'failed', 'refunded']),
  confirmationNumber: a.string(),
  allocatedTo: a.json(),                 // Array of charge allocations
  receiptUrl: a.string(),
  processedBy: a.id(),
  notes: a.string(),
  createdAt: a.datetime(),
  // Relationships
  patient: a.belongsTo('Patient', 'patientId'),
})
```

---

## Communication Models

### Message
```typescript
Message: a.model({
  id: a.id().required(),
  threadId: a.id(),
  senderId: a.id().required(),
  senderType: a.enum(['patient', 'provider', 'staff', 'system']),
  recipientIds: a.json().required(),
  patientId: a.id(),
  subject: a.string(),
  body: a.string().required(),
  bodyFormat: a.enum(['plain', 'html']),
  priority: a.enum(['routine', 'urgent', 'callback_requested']),
  category: a.enum(['medical_question', 'refill_request', 'appointment', 'billing', 'records', 'other']),
  attachments: a.json(),
  status: a.enum(['draft', 'sent', 'delivered', 'read', 'archived']),
  readAt: a.datetime(),
  sentAt: a.datetime(),
  parentMessageId: a.id(),
  delegatedToId: a.id(),
  delegatedAt: a.datetime(),
  createdAt: a.datetime(),
  // Relationships
  thread: a.belongsTo('MessageThread', 'threadId'),
})
```

### CriticalValueNotification
```typescript
CriticalValueNotification: a.model({
  id: a.id().required(),
  labResultId: a.id().required(),
  patientId: a.id().required(),
  notifiedProviderId: a.id().required(),
  notifiedByUserId: a.id().required(),
  value: a.string().required(),
  testName: a.string().required(),
  notifiedAt: a.datetime().required(),
  notificationMethod: a.enum(['phone', 'page', 'secure_message', 'in_person']),
  acknowledgedAt: a.datetime(),
  acknowledgedBy: a.string(),
  readBackConfirmed: a.boolean(),
  attempts: a.json(),                    // Array of notification attempts
  notes: a.string(),
  createdAt: a.datetime(),
  // Relationships
  labResult: a.belongsTo('LabResult', 'labResultId'),
  patient: a.belongsTo('Patient', 'patientId'),
})
```

---

## Quality & Compliance Models

### QCEvent
```typescript
QCEvent: a.model({
  id: a.id().required(),
  instrumentId: a.id().required(),
  testCode: a.string().required(),
  qcMaterialId: a.id().required(),
  lotNumber: a.string().required(),
  level: a.string(),
  expectedMean: a.float(),
  expectedSD: a.float(),
  observedValue: a.float().required(),
  unit: a.string(),
  performedAt: a.datetime().required(),
  performedById: a.id().required(),
  status: a.enum(['pending', 'accepted', 'rejected', 'reviewed']),
  westgardViolation: a.string(),
  reviewedById: a.id(),
  reviewedAt: a.datetime(),
  correctiveAction: a.string(),
  notes: a.string(),
  createdAt: a.datetime(),
  // Relationships
  instrument: a.belongsTo('Instrument', 'instrumentId'),
})
```

### Instrument
```typescript
Instrument: a.model({
  id: a.id().required(),
  name: a.string().required(),
  manufacturer: a.string(),
  model: a.string(),
  serialNumber: a.string(),
  locationId: a.id(),
  installDate: a.date(),
  warrantyExpiration: a.date(),
  status: a.enum(['active', 'inactive', 'maintenance', 'decommissioned']),
  lastCalibrationDate: a.datetime(),
  nextCalibrationDue: a.datetime(),
  lastMaintenanceDate: a.datetime(),
  nextMaintenanceDue: a.datetime(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  calibrations: a.hasMany('Calibration', 'instrumentId'),
  qcEvents: a.hasMany('QCEvent', 'instrumentId'),
})
```

---

## Reference Data Models

### AppointmentType
```typescript
AppointmentType: a.model({
  id: a.id().required(),
  code: a.string().required(),
  name: a.string().required(),
  description: a.string(),
  defaultDuration: a.integer(),          // minutes
  color: a.string(),                     // hex color for calendar
  isActive: a.boolean(),
  allowSelfSchedule: a.boolean(),
  requiresReferral: a.boolean(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
```

### TestCatalog
```typescript
TestCatalog: a.model({
  id: a.id().required(),
  testCode: a.string().required(),
  testName: a.string().required(),
  loincCode: a.string(),
  cptCode: a.string(),
  department: a.string(),
  specimenType: a.string(),
  containerType: a.string(),
  volume: a.string(),
  specialInstructions: a.string(),
  turnaroundTime: a.string(),
  isActive: a.boolean(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
```

### Pharmacy
```typescript
Pharmacy: a.model({
  id: a.id().required(),
  ncpdpId: a.string().required(),
  name: a.string().required(),
  address: a.json(),
  phone: a.string(),
  fax: a.string(),
  email: a.string(),
  hours: a.json(),
  isRetail: a.boolean(),
  isMailOrder: a.boolean(),
  isSpecialty: a.boolean(),
  acceptsEpcs: a.boolean(),
  isActive: a.boolean(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
```

---

## Authorization Rules Summary

### Billing & Coding Authorization

| Model | Biller | Coder | AI Agent | Receptionist | Admin |
|-------|--------|-------|----------|--------------|-------|
| Claim | Full | Read | Create/Update | Read | Full |
| ClaimLine | Full | Read | Create/Update | - | Full |
| Denial | Full | Read | Create/Update | - | Full |
| Appeal | Full | Read | Create | - | Full |
| Remittance | Full | - | Full | - | Full |
| Payment | Full | - | Create | Create | Full |
| Charge | Full | Full | Create | - | Full |
| CodingWorkQueue | Read | Full | Create/Update | - | Full |
| BillingWorkQueue | Full | Read | Create/Update | - | Full |
| EligibilityCheck | Full | - | Create | Create | Full |
| PriorAuthorization | Full | Read | Create | Read | Full |
| AICodeSuggestion | Read | Full | Full | - | Full |
| DenialPrediction | Full | Read | Full | - | Full |
| AIBillingTask | Read | Read | Full | - | Full |

### Clinical Authorization

| Model | Patient | Receptionist | Nurse | Doctor | Admin |
|-------|---------|--------------|-------|--------|-------|
| Patient | Own only | Create/Update demographics | Read | Full | Full |
| Encounter | Own (read) | - | Create/Update | Full | Full |
| ClinicalNote | Own (read) | - | Create (nursing) | Full | Full |
| Allergy | Own (read) | - | Full | Full | Full |
| Medication | Own (read) | - | Read | Full | Full |
| Prescription | Own (read) | - | Read | Create/Sign | Full |
| LabResult | Own (read) | - | Read | Full | Full |
| Appointment | Own | Full | Read | Full | Full |
| Payment | Own | Create | - | - | Full |
| Message | Own | Create | Create | Full | Full |
| AuditLog | - | - | - | - | Read |

---

## Implementation Notes

### Phase 0: Billing Core (IMMEDIATE - First Priority)
**These models must be implemented first to enable revenue cycle operations.**

1. Claim, ClaimLine, ClaimDiagnosis, ClaimStatusHistory
2. Remittance, RemittanceLine
3. Denial, Appeal
4. Charge, Payment, PatientInsurance, Insurance
5. BillingWorkQueue, CodingWorkQueue, CodingQuery
6. EligibilityCheck, PriorAuthorization
7. FeeSchedule, FeeScheduleItem, PayerContract
8. Statement, PaymentPlan, WriteOff
9. ReasonCode (reference data for CARC/RARC)

### Phase 0.5: AI Billing Automation
**Deploy AI agents to automate billing operations.**

1. AIBillingTask
2. AICodeSuggestion
3. DenialPrediction
4. AIAppealDraft
5. PaymentPostingResult
6. AIBillingMetrics

### Phase 1 Priority Models
1. User, Role, Permission
2. Patient, EmergencyContact
3. Provider, Location
4. Appointment, AppointmentType
5. AuditLog

### Phase 2 Priority Models
1. Encounter, ClinicalNote
2. Allergy, Diagnosis
3. VitalSign, Medication
4. Order, Prescription
5. Message

### Phase 3 Priority Models
1. LabOrder, LabResult, Specimen
2. CarePlan, Procedure
3. Schedule, WaitingRoomQueue

### Phase 4 Priority Models
1. QCEvent, Instrument, Calibration
2. Referral
3. All remaining reference data
4. Advanced reporting models

---

## BILLING COMPANY SPECIFIC MODELS

These models are specifically designed for **medical billing companies** that service multiple doctor/practice clients and charge based on percentage of collections.

### DoctorClient (Your Doctor Customers)
```typescript
DoctorClient: a.model({
  id: a.id().required(),
  // Practice/Organization Info
  practiceName: a.string().required(),
  practiceType: a.enum(['solo', 'group', 'hospital', 'clinic', 'urgent_care', 'specialty']),
  taxId: a.string(),
  npi: a.string(),
  // Primary Contact
  contactName: a.string().required(),
  contactEmail: a.string().required(),
  contactPhone: a.string(),
  // Address
  address: a.json(),
  // Billing Email (where they send documents)
  inboundEmailAddress: a.string(),          // e.g., drcarter@yourbillingcompany.com
  approvedSenderEmails: a.json(),           // Array of emails allowed to send docs
  // Status
  status: a.enum(['prospect', 'onboarding', 'active', 'suspended', 'terminated']),
  onboardingStartDate: a.date(),
  goLiveDate: a.date(),
  terminationDate: a.date(),
  terminationReason: a.string(),
  // Preferences
  preferredClearinghouse: a.string(),
  autoSubmitCleanClaims: a.boolean(),       // Auto-submit high-confidence claims
  autoSubmitThreshold: a.float(),           // Confidence threshold (e.g., 0.95)
  // Account Manager
  accountManagerId: a.id(),
  // Notes
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  contracts: a.hasMany('DoctorClientContract', 'doctorClientId'),
  providers: a.hasMany('DoctorClientProvider', 'doctorClientId'),
  invoices: a.hasMany('BillingCompanyInvoice', 'doctorClientId'),
  claims: a.hasMany('Claim', 'doctorClientId'),
})
```

### DoctorClientContract (Fee Agreement)
```typescript
DoctorClientContract: a.model({
  id: a.id().required(),
  doctorClientId: a.id().required(),
  contractNumber: a.string(),
  // Contract Dates
  effectiveDate: a.date().required(),
  terminationDate: a.date(),
  autoRenew: a.boolean(),
  renewalNoticeDays: a.integer(),
  // Fee Structure
  feeType: a.enum(['percentage_of_collections', 'flat_monthly', 'per_claim', 'hybrid']),
  // Percentage of Collections
  insuranceCollectionRate: a.float(),       // e.g., 0.07 = 7%
  patientCollectionRate: a.float(),         // e.g., 0.10 = 10%
  // Or Flat Fee
  flatMonthlyFee: a.float(),
  // Or Per Claim
  perClaimFee: a.float(),
  // Minimums & Caps
  minimumMonthlyFee: a.float(),
  maximumMonthlyFee: a.float(),
  // Payment Terms
  paymentTerms: a.enum(['net_15', 'net_30', 'net_45', 'net_60']),
  // Services Included
  servicesIncluded: a.json(),               // Array of service types
  // Document
  contractDocumentUrl: a.string(),
  signedDate: a.date(),
  signedByName: a.string(),
  signedByTitle: a.string(),
  // Status
  status: a.enum(['draft', 'pending_signature', 'active', 'expired', 'terminated']),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  doctorClient: a.belongsTo('DoctorClient', 'doctorClientId'),
})
```

### DoctorClientProvider (Providers under a Doctor Client)
```typescript
DoctorClientProvider: a.model({
  id: a.id().required(),
  doctorClientId: a.id().required(),
  // Provider Info
  firstName: a.string().required(),
  lastName: a.string().required(),
  credentials: a.json(),                    // ['MD', 'DO', 'NP', 'PA']
  npi: a.string().required(),
  taxId: a.string(),
  // Specialties
  specialty: a.string(),
  subspecialties: a.json(),
  // Contact
  email: a.string(),
  phone: a.string(),
  // Credentials Tracking
  licenseNumber: a.string(),
  licenseState: a.string(),
  licenseExpiration: a.date(),
  deaNumber: a.string(),
  deaExpiration: a.date(),
  // Status
  status: a.enum(['active', 'inactive', 'credentialing']),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  doctorClient: a.belongsTo('DoctorClient', 'doctorClientId'),
})
```

### BillingCompanyInvoice (Invoice to Doctor Client)
```typescript
BillingCompanyInvoice: a.model({
  id: a.id().required(),
  doctorClientId: a.id().required(),
  contractId: a.id(),
  invoiceNumber: a.string().required(),
  // Period
  periodStartDate: a.date().required(),
  periodEndDate: a.date().required(),
  invoiceDate: a.date().required(),
  dueDate: a.date().required(),
  // Collections Summary
  totalInsuranceCollections: a.float(),
  totalPatientCollections: a.float(),
  totalCollections: a.float(),
  // Claims Summary
  claimsSubmitted: a.integer(),
  claimsPaid: a.integer(),
  claimsDenied: a.integer(),
  // Fee Calculation
  insuranceFeeRate: a.float(),
  patientFeeRate: a.float(),
  insuranceFeeAmount: a.float(),
  patientFeeAmount: a.float(),
  baseFeeAmount: a.float(),
  // Adjustments
  adjustments: a.json(),                    // Array of {description, amount}
  adjustmentTotal: a.float(),
  // Totals
  subtotal: a.float(),
  taxAmount: a.float(),
  totalDue: a.float().required(),
  // Payment
  amountPaid: a.float(),
  paymentDate: a.datetime(),
  paymentMethod: a.string(),
  paymentReference: a.string(),
  balanceDue: a.float(),
  // Status
  status: a.enum(['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'disputed', 'written_off']),
  sentAt: a.datetime(),
  viewedAt: a.datetime(),
  paidAt: a.datetime(),
  // Communication
  remindersSent: a.integer(),
  lastReminderAt: a.datetime(),
  // Documents
  invoicePdfUrl: a.string(),
  detailReportUrl: a.string(),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  doctorClient: a.belongsTo('DoctorClient', 'doctorClientId'),
  lineItems: a.hasMany('InvoiceLineItem', 'invoiceId'),
})
```

### InvoiceLineItem (Detail of Collections)
```typescript
InvoiceLineItem: a.model({
  id: a.id().required(),
  invoiceId: a.id().required(),
  // Reference
  claimId: a.id(),
  remittanceId: a.id(),
  // Details
  patientName: a.string(),
  serviceDate: a.date(),
  payerName: a.string(),
  // Collection Type
  collectionType: a.enum(['insurance', 'patient', 'adjustment', 'fee']),
  // Amounts
  collectionAmount: a.float(),
  feePercentage: a.float(),
  feeAmount: a.float(),
  // Notes
  description: a.string(),
  createdAt: a.datetime(),
  // Relationships
  invoice: a.belongsTo('BillingCompanyInvoice', 'invoiceId'),
})
```

---

## EMAIL INGESTION & DOCUMENT PROCESSING MODELS

These models support the AI-powered email ingestion and document processing workflow.

### EmailAccount (Monitored Inboxes)
```typescript
EmailAccount: a.model({
  id: a.id().required(),
  // Account Info
  emailAddress: a.string().required(),
  accountType: a.enum(['gmail', 'outlook', 'imap', 'exchange']),
  displayName: a.string(),
  // Connection Settings
  imapHost: a.string(),
  imapPort: a.integer(),
  smtpHost: a.string(),
  smtpPort: a.integer(),
  // OAuth Tokens (encrypted)
  accessToken: a.string(),
  refreshToken: a.string(),
  tokenExpiry: a.datetime(),
  // IMAP Credentials (encrypted, if not OAuth)
  username: a.string(),
  password: a.string(),                     // Encrypted
  // Monitoring Settings
  isActive: a.boolean(),
  checkIntervalMinutes: a.integer(),
  lastCheckedAt: a.datetime(),
  lastMessageId: a.string(),
  // Processing
  processedCount: a.integer(),
  errorCount: a.integer(),
  lastError: a.string(),
  lastErrorAt: a.datetime(),
  // Assignment
  defaultAssigneeId: a.id(),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
```

### EmailIngestion (Incoming Email Record)
```typescript
EmailIngestion: a.model({
  id: a.id().required(),
  emailAccountId: a.id().required(),
  // Email Identification
  messageId: a.string().required(),         // Email Message-ID header
  threadId: a.string(),
  // Sender Info
  fromAddress: a.string().required(),
  fromName: a.string(),
  toAddresses: a.json(),
  ccAddresses: a.json(),
  // Email Content
  subject: a.string(),
  bodyText: a.string(),
  bodyHtml: a.string(),
  receivedAt: a.datetime().required(),
  // Sender Identification
  doctorClientId: a.id(),                   // Matched doctor client
  providerMatchConfidence: a.float(),
  senderVerified: a.boolean(),
  // Attachments
  attachmentCount: a.integer(),
  hasProcessableAttachments: a.boolean(),
  // Processing Status
  status: a.enum([
    'received', 'processing', 'documents_extracted',
    'completed', 'failed', 'spam', 'unrecognized_sender'
  ]),
  processingStartedAt: a.datetime(),
  processingCompletedAt: a.datetime(),
  // Error Handling
  errorMessage: a.string(),
  retryCount: a.integer(),
  lastRetryAt: a.datetime(),
  // Manual Review
  requiresManualReview: a.boolean(),
  reviewedById: a.id(),
  reviewedAt: a.datetime(),
  reviewNotes: a.string(),
  // Notes
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  documents: a.hasMany('IngestedDocument', 'emailIngestionId'),
  claimDrafts: a.hasMany('ClaimDraft', 'emailIngestionId'),
})
```

### IngestedDocument (Document from Email)
```typescript
IngestedDocument: a.model({
  id: a.id().required(),
  emailIngestionId: a.id().required(),
  doctorClientId: a.id(),
  // File Information
  originalFilename: a.string().required(),
  fileType: a.enum(['pdf', 'image', 'docx', 'xlsx', 'txt', 'other']),
  mimeType: a.string(),
  fileSize: a.integer(),
  // Storage
  s3Bucket: a.string(),
  s3Key: a.string().required(),
  s3Url: a.string(),
  // Document Classification
  documentType: a.enum([
    'superbill', 'clinical_note', 'lab_result', 'imaging_report',
    'referral', 'insurance_card', 'patient_form', 'eob', 'unknown'
  ]),
  classificationConfidence: a.float(),
  // Page Info
  pageCount: a.integer(),
  // Text Extraction
  extractedText: a.string(),
  ocrPerformed: a.boolean(),
  ocrConfidence: a.float(),
  // Screenshot Storage (for visual AI)
  screenshotUrls: a.json(),                 // Array of screenshot S3 URLs
  screenshotCount: a.integer(),
  // Processing Status
  status: a.enum([
    'uploaded', 'processing', 'text_extracted', 'ai_reviewed',
    'data_extracted', 'completed', 'failed', 'manual_required'
  ]),
  processingStartedAt: a.datetime(),
  processingCompletedAt: a.datetime(),
  // Error Handling
  errorMessage: a.string(),
  retryCount: a.integer(),
  // Quality Flags
  qualityScore: a.float(),                  // Document quality (blur, contrast)
  isReadable: a.boolean(),
  qualityIssues: a.json(),                  // Array of issues
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  emailIngestion: a.belongsTo('EmailIngestion', 'emailIngestionId'),
  extractions: a.hasMany('DocumentExtraction', 'documentId'),
})
```

### DocumentExtraction (AI-Extracted Data)
```typescript
DocumentExtraction: a.model({
  id: a.id().required(),
  documentId: a.id().required(),
  // Extraction Session
  extractionType: a.enum(['initial', 'visual_review', 'manual', 're_extraction']),
  modelUsed: a.string(),                    // e.g., 'claude-3-5-sonnet'
  modelVersion: a.string(),
  // Raw Output
  rawExtractionJson: a.json(),              // Full AI response
  // Patient Information
  patientFirstName: a.string(),
  patientLastName: a.string(),
  patientDob: a.date(),
  patientGender: a.string(),
  patientAddress: a.json(),
  patientPhone: a.string(),
  patientInsuranceId: a.string(),
  patientGroupNumber: a.string(),
  // Provider Information
  providerName: a.string(),
  providerNpi: a.string(),
  facilityName: a.string(),
  facilityNpi: a.string(),
  // Service Information
  serviceDate: a.date(),
  serviceEndDate: a.date(),
  placeOfService: a.string(),
  // Diagnosis Codes
  diagnosisCodes: a.json(),                 // Array of {code, description, confidence}
  primaryDiagnosis: a.string(),
  // Procedure Codes
  procedureCodes: a.json(),                 // Array of {code, modifiers, units, description, confidence}
  // Insurance Information
  insuranceName: a.string(),
  insurancePayerId: a.string(),
  subscriberId: a.string(),
  groupNumber: a.string(),
  // Amounts (if present)
  charges: a.json(),                        // Array of {procedure, amount}
  totalCharges: a.float(),
  // Confidence Scores
  overallConfidence: a.float(),
  patientConfidence: a.float(),
  serviceConfidence: a.float(),
  diagnosisConfidence: a.float(),
  procedureConfidence: a.float(),
  insuranceConfidence: a.float(),
  // Validation Flags
  validationErrors: a.json(),               // Array of errors
  validationWarnings: a.json(),             // Array of warnings
  hasLowConfidenceFields: a.boolean(),
  lowConfidenceFields: a.json(),            // Array of field names
  // Human Review
  reviewStatus: a.enum(['pending', 'confirmed', 'corrected', 'rejected']),
  reviewedById: a.id(),
  reviewedAt: a.datetime(),
  reviewCorrections: a.json(),              // What was changed
  // Metrics
  processingTimeMs: a.integer(),
  tokensUsed: a.integer(),
  createdAt: a.datetime(),
  // Relationships
  document: a.belongsTo('IngestedDocument', 'documentId'),
})
```

### ClaimDraft (Pre-Submission Claim)
```typescript
ClaimDraft: a.model({
  id: a.id().required(),
  doctorClientId: a.id().required(),
  emailIngestionId: a.id(),
  documentId: a.id(),
  extractionId: a.id(),
  // Source Tracking
  source: a.enum(['email', 'manual', 'portal', 'api']),
  // Patient Information
  patientId: a.id(),                        // If matched to existing
  patientFirstName: a.string(),
  patientLastName: a.string(),
  patientDob: a.date(),
  patientGender: a.string(),
  patientAddress: a.json(),
  patientPhone: a.string(),
  // Insurance Information
  insuranceName: a.string(),
  insurancePayerId: a.string(),
  subscriberId: a.string(),
  groupNumber: a.string(),
  subscriberRelationship: a.string(),
  // Provider Information
  renderingProviderName: a.string(),
  renderingProviderNpi: a.string(),
  billingProviderName: a.string(),
  billingProviderNpi: a.string(),
  facilityName: a.string(),
  facilityNpi: a.string(),
  facilityAddress: a.json(),
  placeOfService: a.string(),
  // Service Information
  serviceFromDate: a.date(),
  serviceToDate: a.date(),
  // Diagnosis Codes (ordered)
  diagnosisCodes: a.json(),                 // Array of {sequence, code, description}
  // Service Lines
  serviceLines: a.json(),                   // Array of {lineNum, cpt, modifiers, units, charge, dxPointers}
  // Totals
  totalCharges: a.float(),
  // Confidence & Validation
  overallConfidence: a.float(),
  validationStatus: a.enum(['pending', 'passed', 'warnings', 'errors']),
  validationErrors: a.json(),
  validationWarnings: a.json(),
  // Eligibility
  eligibilityCheckId: a.id(),
  eligibilityVerified: a.boolean(),
  eligibilityStatus: a.string(),
  // Scrubbing
  scrubStatus: a.enum(['pending', 'passed', 'warnings', 'errors']),
  scrubErrors: a.json(),
  scrubWarnings: a.json(),
  denialRiskScore: a.float(),
  denialRiskFactors: a.json(),
  // Visual Review
  visualReviewStatus: a.enum(['pending', 'passed', 'discrepancies', 'skipped']),
  visualReviewNotes: a.string(),
  // Workflow Status
  status: a.enum([
    'draft', 'extracting', 'extracted', 'eligibility_check',
    'scrubbing', 'review_required', 'pending_approval',
    'approved', 'submitted', 'rejected', 'on_hold', 'cancelled'
  ]),
  // Work Assignment
  assignedToId: a.id(),
  assignedAt: a.datetime(),
  priority: a.enum(['low', 'normal', 'high', 'urgent']),
  // Doctor Query
  queryStatus: a.enum(['none', 'pending', 'sent', 'responded', 'resolved']),
  queryReason: a.string(),
  querySentAt: a.datetime(),
  queryResponse: a.string(),
  queryRespondedAt: a.datetime(),
  // Approval
  approvalRequired: a.boolean(),
  approvedById: a.id(),
  approvedAt: a.datetime(),
  rejectedById: a.id(),
  rejectedAt: a.datetime(),
  rejectionReason: a.string(),
  // Conversion to Claim
  claimId: a.id(),                          // After submission
  submittedAt: a.datetime(),
  // Notes & Audit
  billerNotes: a.string(),
  auditLog: a.json(),                       // Array of status changes
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  doctorClient: a.belongsTo('DoctorClient', 'doctorClientId'),
  document: a.belongsTo('IngestedDocument', 'documentId'),
})
```

### AIVisualReview (Claude Vision Review Record)
```typescript
AIVisualReview: a.model({
  id: a.id().required(),
  documentId: a.id().required(),
  claimDraftId: a.id(),
  extractionId: a.id(),
  // Review Type
  reviewType: a.enum(['initial', 'verification', 'discrepancy_check', 'manual_trigger']),
  // Model Information
  modelUsed: a.string(),
  modelVersion: a.string(),
  // Input
  screenshotsUsed: a.json(),                // Array of screenshot URLs
  extractedDataReviewed: a.json(),          // Data being verified
  promptUsed: a.string(),
  // Output
  rawResponse: a.json(),
  // Verification Results
  overallVerificationStatus: a.enum(['confirmed', 'discrepancies', 'unable_to_verify']),
  fieldsVerified: a.json(),                 // Array of {field, status, confidence}
  discrepancies: a.json(),                  // Array of {field, extracted, document_shows, recommendation}
  missingFields: a.json(),                  // Array of fields not found in document
  additionalFindings: a.json(),             // Array of items found but not extracted
  // Confidence
  verificationConfidence: a.float(),
  // Recommendations
  recommendedAction: a.enum(['approve', 'human_review', 're_extract', 'query_doctor']),
  recommendations: a.json(),                // Array of recommendation strings
  // Metrics
  processingTimeMs: a.integer(),
  tokensUsed: a.integer(),
  costEstimate: a.float(),
  createdAt: a.datetime(),
  // Relationships
  document: a.belongsTo('IngestedDocument', 'documentId'),
  claimDraft: a.belongsTo('ClaimDraft', 'claimDraftId'),
})
```

### DoctorQuery (Communication to Doctor)
```typescript
DoctorQuery: a.model({
  id: a.id().required(),
  doctorClientId: a.id().required(),
  claimDraftId: a.id(),
  claimId: a.id(),
  denialId: a.id(),
  // Query Type
  queryType: a.enum([
    'missing_information', 'coding_clarification', 'documentation_needed',
    'prior_auth_required', 'insurance_update', 'claim_correction',
    'appeal_approval', 'general'
  ]),
  // Priority
  priority: a.enum(['low', 'normal', 'high', 'urgent']),
  urgencyReason: a.string(),
  // Query Content
  subject: a.string().required(),
  queryText: a.string().required(),
  specificQuestions: a.json(),              // Array of questions
  // Attachments
  attachmentUrls: a.json(),
  // Recipient
  recipientEmail: a.string().required(),
  recipientName: a.string(),
  ccEmails: a.json(),
  // Sending
  status: a.enum(['draft', 'pending', 'sent', 'delivered', 'opened', 'responded', 'closed', 'expired']),
  scheduledSendAt: a.datetime(),
  sentAt: a.datetime(),
  deliveredAt: a.datetime(),
  openedAt: a.datetime(),
  // Response
  responseReceivedAt: a.datetime(),
  responseText: a.string(),
  responseAttachments: a.json(),
  responseAction: a.enum(['answered', 'partial', 'unable_to_answer', 'disagreed']),
  // Follow-up
  reminderCount: a.integer(),
  lastReminderAt: a.datetime(),
  nextReminderAt: a.datetime(),
  escalatedAt: a.datetime(),
  escalatedToId: a.id(),
  // Resolution
  resolvedAt: a.datetime(),
  resolvedById: a.id(),
  resolutionNotes: a.string(),
  // Created By
  createdById: a.id(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  doctorClient: a.belongsTo('DoctorClient', 'doctorClientId'),
  claimDraft: a.belongsTo('ClaimDraft', 'claimDraftId'),
})
```

---

## CLEARINGHOUSE INTEGRATION MODELS

### Clearinghouse (Supported Clearinghouses)
```typescript
Clearinghouse: a.model({
  id: a.id().required(),
  code: a.string().required(),              // e.g., 'claimmd', 'availity'
  name: a.string().required(),
  // API Configuration
  apiType: a.enum(['rest', 'soap', 'sftp', 'edi']),
  baseUrl: a.string(),
  apiVersion: a.string(),
  // Credentials (encrypted)
  apiKey: a.string(),
  apiSecret: a.string(),
  username: a.string(),
  password: a.string(),
  // SFTP Settings
  sftpHost: a.string(),
  sftpPort: a.integer(),
  sftpPath: a.string(),
  // Supported Transactions
  supportsEligibility: a.boolean(),
  supportsClaims: a.boolean(),
  supportsClaimStatus: a.boolean(),
  supportsEra: a.boolean(),
  supportsPriorAuth: a.boolean(),
  // Transaction Endpoints
  eligibilityEndpoint: a.string(),
  claimSubmitEndpoint: a.string(),
  claimStatusEndpoint: a.string(),
  eraEndpoint: a.string(),
  // Settings
  isActive: a.boolean(),
  isDefault: a.boolean(),
  timeoutSeconds: a.integer(),
  retryAttempts: a.integer(),
  // Usage Tracking
  lastUsedAt: a.datetime(),
  totalTransactions: a.integer(),
  failureRate: a.float(),
  avgResponseTimeMs: a.integer(),
  notes: a.string(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
})
```

### ClearinghouseTransaction (Transaction Log)
```typescript
ClearinghouseTransaction: a.model({
  id: a.id().required(),
  clearinghouseId: a.id().required(),
  // Transaction Type
  transactionType: a.enum([
    'eligibility_270', 'eligibility_271',
    'claim_837p', 'claim_837i',
    'claim_status_276', 'claim_status_277',
    'era_835', 'prior_auth_278'
  ]),
  // Reference
  claimId: a.id(),
  claimDraftId: a.id(),
  patientInsuranceId: a.id(),
  // Request
  requestPayload: a.json(),
  requestSentAt: a.datetime(),
  // Response
  responsePayload: a.json(),
  responseReceivedAt: a.datetime(),
  responseTimeMs: a.integer(),
  // Status
  status: a.enum(['pending', 'sent', 'success', 'error', 'timeout', 'rejected']),
  httpStatusCode: a.integer(),
  // Identifiers
  clearinghouseTransactionId: a.string(),
  controlNumber: a.string(),
  // Error Information
  errorCode: a.string(),
  errorMessage: a.string(),
  errorDetails: a.json(),
  // Retry
  retryCount: a.integer(),
  lastRetryAt: a.datetime(),
  // Audit
  createdById: a.id(),
  createdAt: a.datetime(),
  // Relationships
  clearinghouse: a.belongsTo('Clearinghouse', 'clearinghouseId'),
})
```

### PayerClearinghouseMapping (Which Clearinghouse for Which Payer)
```typescript
PayerClearinghouseMapping: a.model({
  id: a.id().required(),
  payerId: a.string().required(),           // Insurance payer ID
  payerName: a.string(),
  // Primary Clearinghouse
  primaryClearinghouseId: a.id().required(),
  // Fallback Clearinghouse
  fallbackClearinghouseId: a.id(),
  // Transaction-Specific Overrides
  eligibilityClearinghouseId: a.id(),
  claimsClearinghouseId: a.id(),
  eraClearinghouseId: a.id(),
  // Payer-Specific Settings
  payerSubmitterId: a.string(),
  enrollmentRequired: a.boolean(),
  enrollmentStatus: a.enum(['not_required', 'pending', 'active', 'expired']),
  enrollmentExpiryDate: a.date(),
  // Notes
  specialInstructions: a.string(),
  isActive: a.boolean(),
  createdAt: a.datetime(),
  updatedAt: a.datetime(),
  // Relationships
  primaryClearinghouse: a.belongsTo('Clearinghouse', 'primaryClearinghouseId'),
})
```

---

## UPDATED MODEL COUNTS

| Category | Original Count | New Models | Total |
|----------|----------------|------------|-------|
| Billing & Revenue Cycle | 28 | 0 | 28 |
| AI Billing Automation | 8 | 0 | 8 |
| **Billing Company Specific** | 0 | **6** | **6** |
| **Email & Document Processing** | 0 | **7** | **7** |
| **Clearinghouse Integration** | 0 | **3** | **3** |
| Core Clinical | 18 | 0 | 18 |
| Orders & Results | 12 | 0 | 12 |
| Scheduling | 8 | 0 | 8 |
| Administrative | 15 | 0 | 15 |
| Communication | 6 | 0 | 6 |
| Quality & Compliance | 8 | 0 | 8 |
| Reference Data | 10 | 0 | 10 |

**New Total: 129 Data Models**

---

## IMPLEMENTATION PRIORITY UPDATE

### Phase 0: Billing Company Core (FIRST PRIORITY)
**New models to implement first for your billing company workflow:**

1. **DoctorClient** - Your doctor customers
2. **DoctorClientContract** - Fee agreements
3. **DoctorClientProvider** - Providers under each client
4. **EmailAccount** - Email inbox configuration
5. **EmailIngestion** - Incoming email tracking
6. **IngestedDocument** - Document from emails
7. **DocumentExtraction** - AI-extracted data
8. **ClaimDraft** - Pre-submission claims
9. **AIVisualReview** - Visual verification records
10. **DoctorQuery** - Communication to doctors
11. **BillingCompanyInvoice** - Invoices to doctors
12. **InvoiceLineItem** - Invoice details
13. **Clearinghouse** - Clearinghouse configuration
14. **ClearinghouseTransaction** - Transaction logs
15. **PayerClearinghouseMapping** - Payer routing

Then continue with standard billing models:
16. Claim, ClaimLine, ClaimDiagnosis
17. Remittance, RemittanceLine
18. Denial, Appeal
19. etc.

---

*Document updated: 2025-12-03*
*Added: Billing Company, Email Ingestion, and Clearinghouse models*
*For: Medical Billing Company EHR Platform*
