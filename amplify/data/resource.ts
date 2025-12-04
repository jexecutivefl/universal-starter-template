import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * Medical Billing Company EHR System - Data Schema
 *
 * ALL-IN-ONE SOLUTION for:
 * - Medical Billing Companies (like yours) - Primary operator
 * - Medical Practices/Clinics - Direct customers
 * - Doctors/Physicians - Clinical users
 * - Patients - Self-service portal
 * - Medical Billers - Staff processing claims
 * - Medical Coders - Staff assigning codes
 *
 * THREE OPERATING MODES:
 * - Full AI Mode: Agents do everything, humans approve
 * - Hybrid Mode: Agents assist, humans do some work manually
 * - Full Manual Mode: Turn off agents, humans do all work
 *
 * Implementation Priority:
 * Phase 0: Billing Company Core (DoctorClient, Email, Documents, Claims)
 * Phase 0.5: Operating Modes & SaaS Foundation
 * Phase 1: Billing Operations (Remittance, Denials, Appeals)
 * Phase 2: Clinical Support (Patient, Encounter)
 * Phase 3: Scheduling & Portal
 * Phase 4: Patient Payments & Practice Management
 */

const schema = a.schema({
  // ============================================================================
  // PHASE 0: BILLING COMPANY CORE MODELS
  // ============================================================================

  /**
   * DoctorClient - Your doctor customers (the practices you bill for)
   */
  DoctorClient: a.model({
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
    // Email Configuration
    inboundEmailAddress: a.string(), // e.g., drcarter@yourbillingcompany.com
    approvedSenderEmails: a.json(), // Array of approved sender emails
    // Status
    status: a.enum(['prospect', 'onboarding', 'active', 'suspended', 'terminated']),
    onboardingStartDate: a.date(),
    goLiveDate: a.date(),
    terminationDate: a.date(),
    terminationReason: a.string(),
    // Preferences
    preferredClearinghouse: a.string(),
    autoSubmitCleanClaims: a.boolean(),
    autoSubmitThreshold: a.float(),
    // Account Manager
    accountManagerId: a.id(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * DoctorClientContract - Fee agreements with doctor clients
   */
  DoctorClientContract: a.model({
    doctorClientId: a.id().required(),
    contractNumber: a.string(),
    // Dates
    effectiveDate: a.date().required(),
    terminationDate: a.date(),
    autoRenew: a.boolean(),
    renewalNoticeDays: a.integer(),
    // Fee Structure
    feeType: a.enum(['percentage_of_collections', 'flat_monthly', 'per_claim', 'hybrid']),
    insuranceCollectionRate: a.float(), // e.g., 0.07 = 7%
    patientCollectionRate: a.float(),
    flatMonthlyFee: a.float(),
    perClaimFee: a.float(),
    minimumMonthlyFee: a.float(),
    maximumMonthlyFee: a.float(),
    // Payment Terms
    paymentTerms: a.enum(['net_15', 'net_30', 'net_45', 'net_60']),
    servicesIncluded: a.json(),
    // Document
    contractDocumentUrl: a.string(),
    signedDate: a.date(),
    signedByName: a.string(),
    signedByTitle: a.string(),
    status: a.enum(['draft', 'pending_signature', 'active', 'expired', 'terminated']),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * DoctorClientProvider - Providers under a doctor client
   */
  DoctorClientProvider: a.model({
    doctorClientId: a.id().required(),
    firstName: a.string().required(),
    lastName: a.string().required(),
    credentials: a.json(), // ['MD', 'DO', 'NP', 'PA']
    npi: a.string().required(),
    taxId: a.string(),
    specialty: a.string(),
    subspecialties: a.json(),
    email: a.string(),
    phone: a.string(),
    // Credentials
    licenseNumber: a.string(),
    licenseState: a.string(),
    licenseExpiration: a.date(),
    deaNumber: a.string(),
    deaExpiration: a.date(),
    status: a.enum(['active', 'inactive', 'credentialing']),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * BillingCompanyInvoice - Invoice to doctor client for your services
   */
  BillingCompanyInvoice: a.model({
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
    adjustments: a.json(),
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
    remindersSent: a.integer(),
    lastReminderAt: a.datetime(),
    // Documents
    invoicePdfUrl: a.string(),
    detailReportUrl: a.string(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * InvoiceLineItem - Detailed collection breakdown on invoice
   */
  InvoiceLineItem: a.model({
    invoiceId: a.id().required(),
    claimId: a.id(),
    remittanceId: a.id(),
    patientName: a.string(),
    serviceDate: a.date(),
    payerName: a.string(),
    collectionType: a.enum(['insurance', 'patient', 'adjustment', 'fee']),
    collectionAmount: a.float(),
    feePercentage: a.float(),
    feeAmount: a.float(),
    description: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // EMAIL INGESTION & DOCUMENT PROCESSING
  // ============================================================================

  /**
   * EmailAccount - Monitored email inboxes
   */
  EmailAccount: a.model({
    emailAddress: a.string().required(),
    accountType: a.enum(['gmail', 'outlook', 'imap', 'exchange']),
    displayName: a.string(),
    // Connection Settings (encrypted in practice)
    imapHost: a.string(),
    imapPort: a.integer(),
    smtpHost: a.string(),
    smtpPort: a.integer(),
    // OAuth Tokens
    accessToken: a.string(),
    refreshToken: a.string(),
    tokenExpiry: a.datetime(),
    // IMAP Credentials
    username: a.string(),
    encryptedPassword: a.string(),
    // Monitoring
    isActive: a.boolean(),
    checkIntervalMinutes: a.integer(),
    lastCheckedAt: a.datetime(),
    lastMessageId: a.string(),
    processedCount: a.integer(),
    errorCount: a.integer(),
    lastError: a.string(),
    lastErrorAt: a.datetime(),
    defaultAssigneeId: a.id(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * EmailIngestion - Record of incoming emails
   */
  EmailIngestion: a.model({
    emailAccountId: a.id().required(),
    messageId: a.string().required(),
    threadId: a.string(),
    // Sender
    fromAddress: a.string().required(),
    fromName: a.string(),
    toAddresses: a.json(),
    ccAddresses: a.json(),
    // Content
    subject: a.string(),
    bodyText: a.string(),
    bodyHtml: a.string(),
    receivedAt: a.datetime().required(),
    // Identification
    doctorClientId: a.id(),
    providerMatchConfidence: a.float(),
    senderVerified: a.boolean(),
    // Attachments
    attachmentCount: a.integer(),
    hasProcessableAttachments: a.boolean(),
    // Processing
    status: a.enum([
      'received', 'processing', 'documents_extracted',
      'completed', 'failed', 'spam', 'unrecognized_sender'
    ]),
    processingStartedAt: a.datetime(),
    processingCompletedAt: a.datetime(),
    errorMessage: a.string(),
    retryCount: a.integer(),
    lastRetryAt: a.datetime(),
    // Review
    requiresManualReview: a.boolean(),
    reviewedById: a.id(),
    reviewedAt: a.datetime(),
    reviewNotes: a.string(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * IngestedDocument - Documents extracted from emails
   */
  IngestedDocument: a.model({
    emailIngestionId: a.id().required(),
    doctorClientId: a.id(),
    // File Info
    originalFilename: a.string().required(),
    fileType: a.enum(['pdf', 'image', 'docx', 'xlsx', 'txt', 'other']),
    mimeType: a.string(),
    fileSize: a.integer(),
    // Storage
    s3Bucket: a.string(),
    s3Key: a.string().required(),
    s3Url: a.string(),
    // Classification
    documentType: a.enum([
      'superbill', 'clinical_note', 'lab_result', 'imaging_report',
      'referral', 'insurance_card', 'patient_form', 'eob', 'unknown'
    ]),
    classificationConfidence: a.float(),
    pageCount: a.integer(),
    // Text Extraction
    extractedText: a.string(),
    ocrPerformed: a.boolean(),
    ocrConfidence: a.float(),
    // Screenshots (for visual AI)
    screenshotUrls: a.json(),
    screenshotCount: a.integer(),
    // Processing
    status: a.enum([
      'uploaded', 'processing', 'text_extracted', 'ai_reviewed',
      'data_extracted', 'completed', 'failed', 'manual_required'
    ]),
    processingStartedAt: a.datetime(),
    processingCompletedAt: a.datetime(),
    errorMessage: a.string(),
    retryCount: a.integer(),
    // Quality
    qualityScore: a.float(),
    isReadable: a.boolean(),
    qualityIssues: a.json(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * DocumentExtraction - AI-extracted data from documents
   */
  DocumentExtraction: a.model({
    documentId: a.id().required(),
    extractionType: a.enum(['initial', 'visual_review', 'manual', 're_extraction']),
    modelUsed: a.string(),
    modelVersion: a.string(),
    rawExtractionJson: a.json(),
    // Patient Info
    patientFirstName: a.string(),
    patientLastName: a.string(),
    patientDob: a.date(),
    patientGender: a.string(),
    patientAddress: a.json(),
    patientPhone: a.string(),
    patientInsuranceId: a.string(),
    patientGroupNumber: a.string(),
    // Provider Info
    providerName: a.string(),
    providerNpi: a.string(),
    facilityName: a.string(),
    facilityNpi: a.string(),
    // Service Info
    serviceDate: a.date(),
    serviceEndDate: a.date(),
    placeOfService: a.string(),
    // Codes
    diagnosisCodes: a.json(), // Array of {code, description, confidence}
    primaryDiagnosis: a.string(),
    procedureCodes: a.json(), // Array of {code, modifiers, units, description, confidence}
    // Insurance
    insuranceName: a.string(),
    insurancePayerId: a.string(),
    subscriberId: a.string(),
    groupNumber: a.string(),
    // Charges
    charges: a.json(),
    totalCharges: a.float(),
    // Confidence
    overallConfidence: a.float(),
    patientConfidence: a.float(),
    serviceConfidence: a.float(),
    diagnosisConfidence: a.float(),
    procedureConfidence: a.float(),
    insuranceConfidence: a.float(),
    // Validation
    validationErrors: a.json(),
    validationWarnings: a.json(),
    hasLowConfidenceFields: a.boolean(),
    lowConfidenceFields: a.json(),
    // Review
    reviewStatus: a.enum(['pending', 'confirmed', 'corrected', 'rejected']),
    reviewedById: a.id(),
    reviewedAt: a.datetime(),
    reviewCorrections: a.json(),
    // Metrics
    processingTimeMs: a.integer(),
    tokensUsed: a.integer(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * ClaimDraft - Pre-submission claim (before it becomes official)
   */
  ClaimDraft: a.model({
    doctorClientId: a.id().required(),
    emailIngestionId: a.id(),
    documentId: a.id(),
    extractionId: a.id(),
    source: a.enum(['email', 'manual', 'portal', 'api']),
    // Patient
    patientId: a.id(),
    patientFirstName: a.string(),
    patientLastName: a.string(),
    patientDob: a.date(),
    patientGender: a.string(),
    patientAddress: a.json(),
    patientPhone: a.string(),
    // Insurance
    insuranceName: a.string(),
    insurancePayerId: a.string(),
    subscriberId: a.string(),
    groupNumber: a.string(),
    subscriberRelationship: a.string(),
    // Provider
    renderingProviderName: a.string(),
    renderingProviderNpi: a.string(),
    billingProviderName: a.string(),
    billingProviderNpi: a.string(),
    facilityName: a.string(),
    facilityNpi: a.string(),
    facilityAddress: a.json(),
    placeOfService: a.string(),
    // Service
    serviceFromDate: a.date(),
    serviceToDate: a.date(),
    diagnosisCodes: a.json(),
    serviceLines: a.json(),
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
    // Workflow
    status: a.enum([
      'draft', 'extracting', 'extracted', 'eligibility_check',
      'scrubbing', 'review_required', 'pending_approval',
      'approved', 'submitted', 'rejected', 'on_hold', 'cancelled'
    ]),
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
    // Conversion
    claimId: a.id(),
    submittedAt: a.datetime(),
    billerNotes: a.string(),
    auditLog: a.json(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * AIVisualReview - Claude Vision verification record
   */
  AIVisualReview: a.model({
    documentId: a.id().required(),
    claimDraftId: a.id(),
    extractionId: a.id(),
    reviewType: a.enum(['initial', 'verification', 'discrepancy_check', 'manual_trigger']),
    // Model
    modelUsed: a.string(),
    modelVersion: a.string(),
    // Input
    screenshotsUsed: a.json(),
    extractedDataReviewed: a.json(),
    promptUsed: a.string(),
    rawResponse: a.json(),
    // Results
    overallVerificationStatus: a.enum(['confirmed', 'discrepancies', 'unable_to_verify']),
    fieldsVerified: a.json(),
    discrepancies: a.json(),
    missingFields: a.json(),
    additionalFindings: a.json(),
    verificationConfidence: a.float(),
    // Recommendations
    recommendedAction: a.enum(['approve', 'human_review', 're_extract', 'query_doctor']),
    recommendations: a.json(),
    // Metrics
    processingTimeMs: a.integer(),
    tokensUsed: a.integer(),
    costEstimate: a.float(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * DoctorQuery - Communication to doctor requesting clarification
   */
  DoctorQuery: a.model({
    doctorClientId: a.id().required(),
    claimDraftId: a.id(),
    claimId: a.id(),
    denialId: a.id(),
    queryType: a.enum([
      'missing_information', 'coding_clarification', 'documentation_needed',
      'prior_auth_required', 'insurance_update', 'claim_correction',
      'appeal_approval', 'general'
    ]),
    priority: a.enum(['low', 'normal', 'high', 'urgent']),
    urgencyReason: a.string(),
    // Content
    subject: a.string().required(),
    queryText: a.string().required(),
    specificQuestions: a.json(),
    attachmentUrls: a.json(),
    // Recipient
    recipientEmail: a.string().required(),
    recipientName: a.string(),
    ccEmails: a.json(),
    // Status
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
    createdById: a.id(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // CLEARINGHOUSE INTEGRATION
  // ============================================================================

  /**
   * Clearinghouse - Supported clearinghouse configurations
   */
  Clearinghouse: a.model({
    code: a.string().required(), // e.g., 'claimmd', 'availity'
    name: a.string().required(),
    apiType: a.enum(['rest', 'soap', 'sftp', 'edi']),
    baseUrl: a.string(),
    apiVersion: a.string(),
    // Credentials (encrypted)
    apiKey: a.string(),
    apiSecret: a.string(),
    username: a.string(),
    encryptedPassword: a.string(),
    // SFTP
    sftpHost: a.string(),
    sftpPort: a.integer(),
    sftpPath: a.string(),
    // Capabilities
    supportsEligibility: a.boolean(),
    supportsClaims: a.boolean(),
    supportsClaimStatus: a.boolean(),
    supportsEra: a.boolean(),
    supportsPriorAuth: a.boolean(),
    // Endpoints
    eligibilityEndpoint: a.string(),
    claimSubmitEndpoint: a.string(),
    claimStatusEndpoint: a.string(),
    eraEndpoint: a.string(),
    // Settings
    isActive: a.boolean(),
    isDefault: a.boolean(),
    timeoutSeconds: a.integer(),
    retryAttempts: a.integer(),
    // Usage
    lastUsedAt: a.datetime(),
    totalTransactions: a.integer(),
    failureRate: a.float(),
    avgResponseTimeMs: a.integer(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * ClearinghouseTransaction - Transaction log for all clearinghouse calls
   */
  ClearinghouseTransaction: a.model({
    clearinghouseId: a.id().required(),
    transactionType: a.enum([
      'eligibility_270', 'eligibility_271',
      'claim_837p', 'claim_837i',
      'claim_status_276', 'claim_status_277',
      'era_835', 'prior_auth_278'
    ]),
    claimId: a.id(),
    claimDraftId: a.id(),
    patientInsuranceId: a.id(),
    // Request/Response
    requestPayload: a.json(),
    requestSentAt: a.datetime(),
    responsePayload: a.json(),
    responseReceivedAt: a.datetime(),
    responseTimeMs: a.integer(),
    // Status
    status: a.enum(['pending', 'sent', 'success', 'error', 'timeout', 'rejected']),
    httpStatusCode: a.integer(),
    clearinghouseTransactionId: a.string(),
    controlNumber: a.string(),
    // Errors
    errorCode: a.string(),
    errorMessage: a.string(),
    errorDetails: a.json(),
    retryCount: a.integer(),
    lastRetryAt: a.datetime(),
    createdById: a.id(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // CLAIMS & BILLING (Core Revenue Cycle)
  // ============================================================================

  /**
   * Claim - Submitted claim (CMS-1500/UB-04)
   */
  Claim: a.model({
    doctorClientId: a.id().required(),
    claimDraftId: a.id(),
    claimNumber: a.string().required(),
    patientId: a.id().required(),
    encounterId: a.id(),
    // Type
    claimType: a.enum(['professional', 'institutional']),
    formType: a.enum(['cms1500', 'ub04']),
    frequencyCode: a.enum(['original', 'replacement', 'void']), // CMS codes: 1=Original, 7=Replace, 8=Void
    originalClaimId: a.id(),
    // Dates
    serviceFromDate: a.date().required(),
    serviceToDate: a.date().required(),
    admissionDate: a.date(),
    dischargeDate: a.date(),
    // Provider
    billingProviderId: a.id().required(),
    renderingProviderId: a.id().required(),
    referringProviderId: a.id(),
    facilityId: a.id(),
    // Payer
    primaryPayerId: a.id().required(),
    secondaryPayerId: a.id(),
    tertiaryPayerId: a.id(),
    patientInsuranceId: a.id().required(),
    // Totals
    totalCharges: a.float().required(),
    totalAllowed: a.float(),
    totalPaid: a.float(),
    totalAdjustment: a.float(),
    patientResponsibility: a.float(),
    // Status
    status: a.enum([
      'draft', 'ready', 'scrubbing', 'hold',
      'submitted', 'acknowledged', 'pending',
      'paid', 'partial_paid', 'denied',
      'rejected', 'appealed', 'written_off', 'void'
    ]),
    submissionStatus: a.enum(['not_submitted', 'pending', 'accepted', 'rejected']),
    // Submission
    clearinghouseId: a.string(),
    clearinghouseClaimId: a.string(),
    submittedAt: a.datetime(),
    acknowledgedAt: a.datetime(),
    paidAt: a.datetime(),
    // EDI
    ediFileId: a.string(),
    controlNumber: a.string(),
    // Work
    createdById: a.id(),
    lastWorkedById: a.id(),
    lastWorkedAt: a.datetime(),
    // AR
    arBucket: a.enum(['days_0_30', 'days_31_60', 'days_61_90', 'days_91_120', 'days_120_plus']),
    daysInAR: a.integer(),
    followUpDate: a.date(),
    billingNotes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * ClaimLine - Individual service line on a claim
   */
  ClaimLine: a.model({
    claimId: a.id().required(),
    lineNumber: a.integer().required(),
    serviceDate: a.date().required(),
    placeOfService: a.string().required(),
    procedureCode: a.string().required(),
    modifiers: a.json(),
    description: a.string(),
    diagnosisPointers: a.json(),
    units: a.float().required(),
    unitType: a.enum(['units', 'minutes', 'days']),
    chargeAmount: a.float().required(),
    // Payment
    allowedAmount: a.float(),
    paidAmount: a.float(),
    adjustmentAmount: a.float(),
    patientResponsibility: a.float(),
    coinsurance: a.float(),
    copay: a.float(),
    deductible: a.float(),
    status: a.enum(['pending', 'paid', 'denied', 'adjusted']),
    // Provider
    renderingProviderId: a.id(),
    renderingProviderNpi: a.string(),
    // Institutional
    revenueCode: a.string(),
    // Drug
    ndcCode: a.string(),
    ndcUnits: a.float(),
    ndcUnitType: a.string(),
    priorAuthNumber: a.string(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * ClaimDiagnosis - Diagnosis codes on a claim
   */
  ClaimDiagnosis: a.model({
    claimId: a.id().required(),
    sequence: a.integer().required(),
    icd10Code: a.string().required(),
    description: a.string(),
    diagnosisType: a.enum(['principal', 'admitting', 'secondary', 'external_cause']),
    presentOnAdmission: a.enum(['Y', 'N', 'U', 'W', 'E']),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * Remittance - ERA/EOB payment received
   */
  Remittance: a.model({
    remittanceNumber: a.string().required(),
    ediFileId: a.string(),
    controlNumber: a.string(),
    // Payer
    payerId: a.id().required(),
    payerName: a.string(),
    payerIdentifier: a.string(),
    // Payment
    paymentMethod: a.enum(['check', 'eft', 'virtual_card', 'ach']),
    paymentDate: a.date().required(),
    totalPaymentAmount: a.float().required(),
    // Totals
    totalClaimCount: a.integer(),
    totalChargeAmount: a.float(),
    totalAllowedAmount: a.float(),
    totalAdjustmentAmount: a.float(),
    totalPatientResponsibility: a.float(),
    // Status
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
    depositDate: a.date(),
    depositReference: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * Denial - Claim denial tracking
   */
  Denial: a.model({
    claimId: a.id().required(),
    claimLineId: a.id(),
    remittanceLineId: a.id(),
    denialDate: a.date().required(),
    // Reason Codes
    carcCode: a.string().required(),
    carcDescription: a.string(),
    rarcCodes: a.json(),
    groupCode: a.enum(['CO', 'PR', 'OA', 'PI', 'CR']),
    // Categorization
    denialCategory: a.enum([
      'eligibility', 'authorization', 'medical_necessity',
      'coding', 'duplicate', 'timely_filing', 'bundling',
      'missing_info', 'coordination_of_benefits', 'other'
    ]),
    denialType: a.enum(['hard', 'soft']),
    isPreventable: a.boolean(),
    rootCause: a.string(),
    // Financial
    deniedAmount: a.float().required(),
    // Resolution
    status: a.enum(['open', 'in_progress', 'appealed', 'corrected', 'written_off', 'recovered', 'closed']),
    resolution: a.enum(['paid_on_appeal', 'paid_on_resubmit', 'written_off', 'patient_responsibility', 'upheld']),
    resolvedAt: a.datetime(),
    recoveredAmount: a.float(),
    // Work
    assignedToId: a.id(),
    priority: a.enum(['low', 'medium', 'high', 'urgent']),
    dueDate: a.date(),
    daysToResolve: a.integer(),
    touchCount: a.integer(),
    lastWorkedAt: a.datetime(),
    lastWorkedById: a.id(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * Appeal - Denial appeal tracking
   */
  Appeal: a.model({
    claimId: a.id().required(),
    denialId: a.id().required(),
    appealLevel: a.enum(['first', 'second', 'third', 'external_review']),
    appealType: a.enum(['written', 'peer_to_peer', 'expedited']),
    appealReason: a.string().required(),
    // Dates
    filingDeadline: a.date().required(),
    submittedAt: a.datetime(),
    receivedByPayerAt: a.datetime(),
    decisionDueDate: a.date(),
    decisionReceivedAt: a.datetime(),
    // Content
    appealLetter: a.string(),
    letterTemplateId: a.id(),
    supportingDocuments: a.json(),
    // Decision
    status: a.enum(['draft', 'submitted', 'pending', 'approved', 'denied', 'partial', 'expired']),
    decision: a.enum(['approved', 'denied', 'partial_approval']),
    decisionReason: a.string(),
    approvedAmount: a.float(),
    // Submission
    submittedById: a.id(),
    submissionMethod: a.enum(['clearinghouse', 'portal', 'fax', 'mail']),
    trackingNumber: a.string(),
    confirmationNumber: a.string(),
    // AI
    aiGenerated: a.boolean(),
    aiConfidenceScore: a.float(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * EligibilityCheck - Insurance eligibility verification
   */
  EligibilityCheck: a.model({
    patientId: a.id().required(),
    patientInsuranceId: a.id().required(),
    checkDate: a.datetime().required(),
    serviceTypeCode: a.string(),
    requestedById: a.id(),
    // Response
    status: a.enum(['pending', 'active', 'inactive', 'error']),
    coverageActive: a.boolean(),
    effectiveDate: a.date(),
    terminationDate: a.date(),
    // Plan
    planName: a.string(),
    planType: a.string(),
    groupNumber: a.string(),
    // Benefits
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
    // Auth
    priorAuthRequired: a.boolean(),
    priorAuthPhone: a.string(),
    inNetwork: a.boolean(),
    // EDI
    ediRequestId: a.string(),
    ediResponseId: a.string(),
    rawResponse: a.json(),
    errorCode: a.string(),
    errorMessage: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // CORE ENTITIES (Minimal for Billing)
  // ============================================================================

  /**
   * Patient - Patient demographics
   */
  Patient: a.model({
    doctorClientId: a.id().required(),
    mrn: a.string(),
    firstName: a.string().required(),
    lastName: a.string().required(),
    middleName: a.string(),
    dateOfBirth: a.date().required(),
    gender: a.enum(['male', 'female', 'other', 'unknown']),
    ssn: a.string(), // Encrypted
    email: a.string(),
    phone: a.string(),
    address: a.json(),
    preferredLanguage: a.string(),
    status: a.enum(['active', 'inactive', 'deceased']),
    deceasedDate: a.date(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * PatientInsurance - Patient's insurance coverage
   */
  PatientInsurance: a.model({
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
    copay: a.json(),
    deductible: a.float(),
    deductibleMet: a.float(),
    frontCardImageUrl: a.string(),
    backCardImageUrl: a.string(),
    verified: a.boolean(),
    verifiedAt: a.datetime(),
    verifiedBy: a.id(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * Insurance - Insurance payer master data
   */
  Insurance: a.model({
    payerId: a.string().required(),
    name: a.string().required(),
    planType: a.enum(['hmo', 'ppo', 'epo', 'pos', 'hdhp', 'medicare', 'medicaid', 'other']),
    address: a.json(),
    phone: a.string(),
    claimsPhone: a.string(),
    eligibilityPhone: a.string(),
    website: a.string(),
    isActive: a.boolean(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // WORK QUEUES
  // ============================================================================

  /**
   * BillingWorkQueue - Work items for billers
   */
  BillingWorkQueue: a.model({
    workItemType: a.enum([
      'claim_review', 'claim_correction', 'denial_work', 'appeal',
      'ar_followup', 'payment_posting', 'eligibility', 'prior_auth',
      'refund', 'statement', 'collections'
    ]),
    referenceType: a.enum(['claim', 'claim_draft', 'denial', 'remittance', 'patient', 'prior_auth']),
    referenceId: a.id().required(),
    doctorClientId: a.id(),
    patientId: a.id(),
    patientName: a.string(),
    claimNumber: a.string(),
    amount: a.float(),
    payerName: a.string(),
    // Assignment
    priority: a.enum(['low', 'medium', 'high', 'urgent']),
    assignedToId: a.id(),
    assignedAt: a.datetime(),
    // Status
    status: a.enum(['open', 'in_progress', 'pending', 'completed', 'escalated']),
    dueDate: a.date(),
    slaDeadline: a.datetime(),
    startedAt: a.datetime(),
    completedAt: a.datetime(),
    // Work
    touchCount: a.integer(),
    lastAction: a.string(),
    lastActionAt: a.datetime(),
    lastActionById: a.id(),
    resolution: a.string(),
    resolutionNotes: a.string(),
    // AI
    aiSuggested: a.boolean(),
    aiPriority: a.float(),
    aiRecommendedAction: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // AI BILLING AUTOMATION
  // ============================================================================

  /**
   * AIBillingTask - AI agent task tracking
   */
  AIBillingTask: a.model({
    taskType: a.enum([
      'email_processing', 'document_extraction', 'visual_review',
      'code_suggestion', 'claim_scrub', 'denial_prediction',
      'payment_posting', 'appeal_generation', 'eligibility_check',
      'charge_capture', 'ar_followup', 'prior_auth', 'doctor_query'
    ]),
    referenceType: a.enum(['email', 'document', 'claim_draft', 'claim', 'remittance', 'denial', 'patient']),
    referenceId: a.id().required(),
    // Status
    status: a.enum(['pending', 'processing', 'completed', 'failed', 'human_review']),
    startedAt: a.datetime(),
    completedAt: a.datetime(),
    processingTimeMs: a.integer(),
    // Input/Output
    inputData: a.json(),
    outputData: a.json(),
    // Decision
    confidenceScore: a.float(),
    autoApproved: a.boolean(),
    autoApprovalThreshold: a.float(),
    // Review
    requiresHumanReview: a.boolean(),
    reviewedById: a.id(),
    reviewedAt: a.datetime(),
    reviewDecision: a.enum(['approved', 'rejected', 'modified']),
    reviewNotes: a.string(),
    // Error
    errorMessage: a.string(),
    retryCount: a.integer(),
    // Metrics
    impactAmount: a.float(),
    timeSavedMinutes: a.integer(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * DenialPrediction - AI denial risk prediction
   */
  DenialPrediction: a.model({
    claimId: a.id(),
    claimDraftId: a.id(),
    aiBillingTaskId: a.id(),
    denialProbability: a.float().required(),
    riskLevel: a.enum(['low', 'medium', 'high', 'very_high']),
    predictedReasons: a.json(),
    primaryPredictedReason: a.string(),
    riskFactors: a.json(),
    recommendations: a.json(),
    autoCorrectible: a.boolean(),
    // Claim Details
    claimAmount: a.float(),
    payerName: a.string(),
    serviceType: a.string(),
    // Action
    actionTaken: a.enum(['submitted', 'held_for_review', 'auto_corrected', 'manual_correction']),
    actionById: a.id(),
    actionAt: a.datetime(),
    // Outcome (for learning)
    actualOutcome: a.enum(['paid', 'denied', 'partial']),
    actualDenialReason: a.string(),
    predictionAccurate: a.boolean(),
    modelVersion: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // USER & ADMIN
  // ============================================================================

  /**
   * User - System users (billers, coders, admins)
   */
  User: a.model({
    cognitoId: a.string().required(),
    email: a.string().required(),
    firstName: a.string().required(),
    lastName: a.string().required(),
    phone: a.string(),
    employeeId: a.string(),
    userType: a.enum(['owner', 'admin', 'biller', 'coder', 'doctor_portal']),
    status: a.enum(['active', 'inactive', 'pending', 'locked']),
    // For doctor portal users
    doctorClientId: a.id(),
    // Settings
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
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * AuditLog - System audit trail
   */
  AuditLog: a.model({
    userId: a.id().required(),
    userRole: a.string(),
    action: a.string().required(),
    resourceType: a.string().required(),
    resourceId: a.string(),
    doctorClientId: a.id(),
    patientId: a.id(),
    claimId: a.id(),
    ipAddress: a.string(),
    userAgent: a.string(),
    sessionId: a.string(),
    details: a.json(),
    oldValue: a.json(),
    newValue: a.json(),
    outcome: a.enum(['success', 'failure', 'error']),
    riskScore: a.integer(),
    timestamp: a.datetime().required(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // PHASE 0.5: OPERATING MODES & SAAS FOUNDATION
  // ============================================================================

  /**
   * Organization - Multi-tenant organization (for SaaS)
   * This is the top-level entity for practices/billing companies using the system
   */
  Organization: a.model({
    name: a.string().required(),
    organizationType: a.enum(['billing_company', 'practice', 'hospital', 'health_system', 'clinic']),
    // Contact
    primaryContactName: a.string(),
    primaryContactEmail: a.string().required(),
    primaryContactPhone: a.string(),
    // Address
    address: a.json(),
    // Identifiers
    taxId: a.string(),
    npi: a.string(),
    // Subscription
    subscriptionId: a.id(),
    subscriptionStatus: a.enum(['trial', 'active', 'past_due', 'cancelled', 'suspended']),
    trialEndsAt: a.datetime(),
    // Settings
    timezone: a.string(),
    dateFormat: a.string(),
    currency: a.string(),
    // Branding
    logoUrl: a.string(),
    primaryColor: a.string(),
    // Operating Mode (CRITICAL)
    operatingMode: a.enum(['full_ai', 'hybrid', 'manual']),
    // Features
    enabledFeatures: a.json(),
    // Status
    status: a.enum(['onboarding', 'active', 'suspended', 'terminated']),
    onboardingCompletedAt: a.datetime(),
    createdAt: a.datetime(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * OperatingModeSettings - Configuration for AI/Hybrid/Manual modes
   * This controls how the AI agents behave for each organization
   */
  OperatingModeSettings: a.model({
    organizationId: a.id().required(),
    doctorClientId: a.id(), // Optional: override per doctor client
    // Current Mode
    operatingMode: a.enum(['full_ai', 'hybrid', 'manual']),
    // Full AI Mode Settings
    aiAutoApprovalEnabled: a.boolean(),
    aiConfidenceThreshold: a.float(), // e.g., 0.95
    aiAutoApprovalMaxAmount: a.float(), // e.g., 500.00
    aiAutoPostPayments: a.boolean(),
    aiAutoSendDoctorQueries: a.boolean(),
    aiAutoAppealEnabled: a.boolean(),
    aiAutoSubmitCleanClaims: a.boolean(),
    // Hybrid Mode Settings
    aiSuggestionsEnabled: a.boolean(),
    aiCodingAssistEnabled: a.boolean(),
    aiDenialPredictionEnabled: a.boolean(),
    aiEmailDraftsEnabled: a.boolean(),
    aiDocumentExtractionEnabled: a.boolean(),
    // Manual Mode Settings (what to show even in manual)
    showAiConfidenceScores: a.boolean(),
    showDenialRiskScores: a.boolean(),
    // Notification Settings
    notifyOnAutoApproval: a.boolean(),
    notifyOnAiException: a.boolean(),
    dailyAiSummaryEnabled: a.boolean(),
    weeklyAiReportEnabled: a.boolean(),
    // Override Settings
    allowUserModeOverride: a.boolean(),
    requireApprovalAboveAmount: a.float(),
    // Audit
    lastModeChangeAt: a.datetime(),
    lastModeChangeById: a.id(),
    lastModeChangeReason: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * SubscriptionPlan - SaaS pricing plans
   */
  SubscriptionPlan: a.model({
    name: a.string().required(), // 'Starter', 'Professional', 'Enterprise'
    description: a.string(),
    // Pricing
    monthlyPrice: a.float(),
    annualPrice: a.float(),
    setupFee: a.float(),
    // Limits
    maxUsers: a.integer(),
    maxClaims: a.integer(),
    maxDoctorClients: a.integer(),
    maxLocations: a.integer(),
    maxStorageGb: a.integer(),
    // Features
    includedFeatures: a.json(),
    // AI Mode
    aiModesAllowed: a.json(), // ['manual', 'hybrid', 'full_ai']
    aiClaimsIncluded: a.integer(),
    additionalAiClaimPrice: a.float(),
    // Support
    supportLevel: a.enum(['email', 'phone', 'dedicated', 'premium']),
    slaResponseTimeHours: a.integer(),
    // Status
    isActive: a.boolean(),
    isPublic: a.boolean(),
    sortOrder: a.integer(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * PlanSubscription - Organization's subscription to a plan
   * Note: Renamed from "Subscription" because "Subscription" is a reserved GraphQL root type
   */
  PlanSubscription: a.model({
    organizationId: a.id().required(),
    planId: a.id().required(),
    // Billing
    billingCycle: a.enum(['monthly', 'annual']),
    basePrice: a.float(),
    // Usage-based pricing
    perUserPrice: a.float(),
    perClaimPrice: a.float(),
    currentUsers: a.integer(),
    currentClaims: a.integer(),
    // Dates
    startDate: a.date().required(),
    endDate: a.date(),
    trialEndDate: a.date(),
    nextBillingDate: a.date(),
    // Status
    status: a.enum(['trial', 'active', 'past_due', 'cancelled', 'suspended']),
    cancelledAt: a.datetime(),
    cancellationReason: a.string(),
    // Payment
    paymentMethodId: a.id(),
    lastPaymentDate: a.date(),
    lastPaymentAmount: a.float(),
    failedPaymentAttempts: a.integer(),
    // Features
    enabledFeatures: a.json(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * UsageRecord - Track usage for billing
   */
  UsageRecord: a.model({
    organizationId: a.id().required(),
    subscriptionId: a.id(),
    recordDate: a.date().required(),
    recordType: a.enum(['daily', 'monthly']),
    // Counts
    activeUsers: a.integer(),
    claimsSubmitted: a.integer(),
    claimsPaid: a.integer(),
    documentsProcessed: a.integer(),
    aiTasksRun: a.integer(),
    apiCalls: a.integer(),
    storageUsedMb: a.float(),
    // Financial
    collectionsAmount: a.float(),
    billedAmount: a.float(),
    // AI Specific
    aiConfidenceAvg: a.float(),
    aiAutoApprovedCount: a.integer(),
    aiHumanReviewCount: a.integer(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // SCHEDULING SYSTEM
  // ============================================================================

  /**
   * Location - Practice locations/facilities
   */
  Location: a.model({
    organizationId: a.id().required(),
    doctorClientId: a.id(), // For billing company's doctor clients
    name: a.string().required(),
    locationCode: a.string(),
    locationType: a.enum(['office', 'hospital', 'urgent_care', 'surgery_center', 'lab', 'imaging', 'telehealth']),
    // Identifiers
    npi: a.string(),
    taxId: a.string(),
    cliaNumber: a.string(),
    // Address
    address: a.json(),
    phone: a.string(),
    fax: a.string(),
    email: a.string(),
    // Hours
    operatingHours: a.json(), // { monday: {open: '08:00', close: '17:00'}, ... }
    holidaySchedule: a.json(),
    // Billing
    placeOfService: a.string(), // Default POS code
    taxonomyCode: a.string(),
    // Settings
    isActive: a.boolean(),
    acceptsNewPatients: a.boolean(),
    // Telehealth
    telehealthEnabled: a.boolean(),
    telehealthPlatform: a.string(),
    telehealthLink: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * Appointment - Scheduled patient visits
   */
  Appointment: a.model({
    organizationId: a.id().required(),
    patientId: a.id().required(),
    providerId: a.id().required(),
    locationId: a.id().required(),
    // Scheduling
    appointmentType: a.enum(['new_patient', 'follow_up', 'procedure', 'telehealth', 'urgent', 'annual_wellness', 'consultation', 'lab', 'imaging']),
    scheduledDate: a.date().required(),
    scheduledStartTime: a.string().required(), // HH:MM format
    scheduledEndTime: a.string(),
    duration: a.integer(), // minutes
    // Status
    status: a.enum(['scheduled', 'confirmed', 'checked_in', 'in_room', 'in_progress', 'completed', 'no_show', 'cancelled', 'rescheduled']),
    confirmedAt: a.datetime(),
    checkedInAt: a.datetime(),
    roomedAt: a.datetime(),
    seenByProviderAt: a.datetime(),
    completedAt: a.datetime(),
    // Cancellation
    cancelledAt: a.datetime(),
    cancelledById: a.id(),
    cancellationReason: a.string(),
    // Rescheduling
    rescheduledFromId: a.id(),
    rescheduledToId: a.id(),
    // Reminders
    remindersSent: a.json(),
    nextReminderAt: a.datetime(),
    // Visit Details
    chiefComplaint: a.string(),
    visitNotes: a.string(),
    encounterId: a.id(),
    // Billing
    copayAmount: a.float(),
    copayCollected: a.boolean(),
    copayCollectedAmount: a.float(),
    preAuthRequired: a.boolean(),
    preAuthNumber: a.string(),
    // Telehealth
    isTelehealth: a.boolean(),
    telehealthLink: a.string(),
    telehealthJoinedAt: a.datetime(),
    // Booking
    bookedById: a.id(),
    bookedAt: a.datetime(),
    bookingSource: a.enum(['phone', 'portal', 'walk_in', 'referral', 'online']),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * ProviderScheduleTemplate - Provider availability template
   */
  ProviderScheduleTemplate: a.model({
    providerId: a.id().required(),
    locationId: a.id().required(),
    dayOfWeek: a.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    startTime: a.string().required(), // HH:MM
    endTime: a.string().required(),
    slotDuration: a.integer(), // minutes (15, 20, 30, 60)
    appointmentTypes: a.json(), // Allowed appointment types
    maxPatients: a.integer(),
    effectiveFrom: a.date(),
    effectiveTo: a.date(),
    isActive: a.boolean(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * ScheduleBlock - Time off, meetings, etc.
   */
  ScheduleBlock: a.model({
    providerId: a.id().required(),
    locationId: a.id(),
    blockType: a.enum(['vacation', 'meeting', 'lunch', 'admin', 'personal', 'holiday', 'other']),
    startDate: a.date().required(),
    startTime: a.string(),
    endDate: a.date().required(),
    endTime: a.string(),
    isAllDay: a.boolean(),
    isRecurring: a.boolean(),
    recurrencePattern: a.json(),
    reason: a.string(),
    approvedById: a.id(),
    approvedAt: a.datetime(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * Waitlist - Patients waiting for appointments
   */
  Waitlist: a.model({
    organizationId: a.id().required(),
    patientId: a.id().required(),
    providerId: a.id(),
    locationId: a.id(),
    appointmentType: a.string(),
    preferredDays: a.json(), // ['monday', 'wednesday', 'friday']
    preferredTimeStart: a.string(),
    preferredTimeEnd: a.string(),
    urgency: a.enum(['routine', 'soon', 'urgent']),
    addedAt: a.datetime().required(),
    expiresAt: a.datetime(),
    status: a.enum(['active', 'scheduled', 'expired', 'cancelled']),
    scheduledAppointmentId: a.id(),
    notes: a.string(),
    contactAttempts: a.integer(),
    lastContactAt: a.datetime(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * AppointmentReminder - Automated reminders
   */
  AppointmentReminder: a.model({
    appointmentId: a.id().required(),
    patientId: a.id().required(),
    reminderType: a.enum(['sms', 'email', 'phone', 'portal']),
    scheduledFor: a.datetime().required(),
    sentAt: a.datetime(),
    status: a.enum(['scheduled', 'sent', 'delivered', 'failed', 'responded']),
    response: a.enum(['confirmed', 'cancelled', 'reschedule_requested']),
    responseAt: a.datetime(),
    messageContent: a.string(),
    deliveryError: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // PATIENT PAYMENT PROCESSING
  // ============================================================================

  /**
   * PaymentGateway - Payment processor configuration
   */
  PaymentGateway: a.model({
    organizationId: a.id().required(),
    name: a.string().required(), // 'stripe', 'square', 'authorize_net'
    // Credentials (encrypted in practice)
    apiKey: a.string(),
    apiSecret: a.string(),
    merchantId: a.string(),
    // Settings
    isActive: a.boolean(),
    isDefault: a.boolean(),
    environment: a.enum(['sandbox', 'production']),
    // Capabilities
    supportsCards: a.boolean(),
    supportsACH: a.boolean(),
    supportsRecurring: a.boolean(),
    supportsRefunds: a.boolean(),
    // Processing
    dailyLimit: a.float(),
    perTransactionLimit: a.float(),
    // Webhook
    webhookSecret: a.string(),
    webhookUrl: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * Payment - Patient payments (not ERA)
   */
  Payment: a.model({
    organizationId: a.id().required(),
    patientId: a.id().required(),
    // Payment Source
    paymentType: a.enum(['patient', 'insurance', 'third_party', 'collection_agency']),
    paymentMethod: a.enum(['credit_card', 'debit_card', 'ach', 'check', 'cash', 'money_order', 'payment_plan', 'online']),
    // Amount
    amount: a.float().required(),
    appliedAmount: a.float(),
    unappliedAmount: a.float(),
    // Gateway Info
    gatewayId: a.id(),
    gatewayTransactionId: a.string(),
    gatewayResponse: a.json(),
    // Card Details
    cardLast4: a.string(),
    cardBrand: a.string(),
    // Check/Cash Details
    checkNumber: a.string(),
    checkDate: a.date(),
    depositDate: a.date(),
    depositReference: a.string(),
    // Status
    status: a.enum(['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'voided', 'chargeback']),
    // Processing
    processedAt: a.datetime(),
    processedById: a.id(),
    // Refund Info
    refundedAmount: a.float(),
    refundReason: a.string(),
    refundedAt: a.datetime(),
    refundedById: a.id(),
    // Receipt
    receiptNumber: a.string(),
    receiptUrl: a.string(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * PaymentApplication - Links payment to claims/charges
   */
  PaymentApplication: a.model({
    paymentId: a.id().required(),
    claimId: a.id(),
    claimLineId: a.id(),
    statementId: a.id(),
    amount: a.float().required(),
    appliedAt: a.datetime().required(),
    appliedById: a.id(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * StoredPaymentMethod - Saved cards/bank accounts for patients
   */
  StoredPaymentMethod: a.model({
    patientId: a.id().required(),
    organizationId: a.id().required(),
    paymentMethodType: a.enum(['credit_card', 'debit_card', 'ach']),
    // Card Info (tokenized)
    gatewayToken: a.string().required(),
    cardLast4: a.string(),
    cardBrand: a.string(),
    cardExpMonth: a.integer(),
    cardExpYear: a.integer(),
    // Bank Info (tokenized)
    bankName: a.string(),
    accountLast4: a.string(),
    accountType: a.enum(['checking', 'savings']),
    // Settings
    isDefault: a.boolean(),
    nickname: a.string(),
    // Billing Address
    billingAddress: a.json(),
    // Status
    status: a.enum(['active', 'expired', 'deleted']),
    // Compliance
    consentGivenAt: a.datetime(),
    consentType: a.string(),
    createdAt: a.datetime(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * PaymentPlan - Patient payment arrangements
   */
  PaymentPlan: a.model({
    patientId: a.id().required(),
    organizationId: a.id().required(),
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
    status: a.enum(['pending', 'active', 'completed', 'defaulted', 'cancelled']),
    defaultCount: a.integer(),
    lastPaymentDate: a.date(),
    lastPaymentAmount: a.float(),
    // Approval
    approvedById: a.id(),
    approvedAt: a.datetime(),
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * Statement - Patient statement/bill
   */
  Statement: a.model({
    patientId: a.id().required(),
    organizationId: a.id().required(),
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
    // Payment Due
    minimumPaymentDue: a.float(),
    paymentDueDate: a.date(),
    // Statement Details
    statementMessage: a.string(),
    dunningLevel: a.integer(), // 1, 2, 3, 4 for escalating messages
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
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // CLINICAL/ENCOUNTER DOCUMENTATION
  // ============================================================================

  /**
   * Encounter - Clinical visit
   */
  Encounter: a.model({
    organizationId: a.id().required(),
    patientId: a.id().required(),
    appointmentId: a.id(),
    // Type
    encounterType: a.enum(['office_visit', 'telehealth', 'hospital_outpatient', 'emergency', 'inpatient', 'observation', 'home_visit', 'phone']),
    // Dates
    encounterDate: a.date().required(),
    startTime: a.datetime(),
    endTime: a.datetime(),
    // Providers
    attendingProviderId: a.id(),
    renderingProviderId: a.id().required(),
    supervisingProviderId: a.id(),
    // Location
    locationId: a.id(),
    placeOfService: a.string(),
    roomNumber: a.string(),
    // Clinical
    chiefComplaint: a.string(),
    // Status
    status: a.enum(['scheduled', 'in_progress', 'completed', 'signed', 'addended', 'billed', 'cancelled']),
    signedById: a.id(),
    signedAt: a.datetime(),
    coSignedById: a.id(),
    coSignedAt: a.datetime(),
    // Billing
    billingStatus: a.enum(['not_ready', 'ready_to_code', 'coded', 'ready_to_bill', 'billed', 'hold']),
    claimId: a.id(),
    // Coding
    codingStatus: a.enum(['pending', 'in_progress', 'completed', 'query']),
    codedById: a.id(),
    codedAt: a.datetime(),
    // Codes (denormalized for quick access)
    diagnosisCodes: a.json(),
    procedureCodes: a.json(),
    emLevel: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * ClinicalNote - SOAP notes, progress notes, etc.
   */
  ClinicalNote: a.model({
    encounterId: a.id().required(),
    patientId: a.id().required(),
    authorId: a.id().required(),
    noteType: a.enum(['progress_note', 'soap_note', 'h_and_p', 'consultation', 'procedure_note', 'discharge_summary', 'telephone_encounter', 'nursing_note', 'addendum']),
    // SOAP Format
    subjective: a.string(),
    objective: a.string(),
    assessment: a.string(),
    plan: a.string(),
    // Full Text
    noteText: a.string(),
    // Status
    status: a.enum(['draft', 'signed', 'addended', 'amended']),
    signedAt: a.datetime(),
    signedById: a.id(),
    // Addenda
    addenda: a.json(),
    parentNoteId: a.id(), // For addenda
    // Template
    templateUsed: a.string(),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * VitalSigns - Patient vitals
   */
  VitalSigns: a.model({
    encounterId: a.id(),
    patientId: a.id().required(),
    recordedById: a.id().required(),
    recordedAt: a.datetime().required(),
    // Temperature
    temperature: a.float(),
    temperatureUnit: a.enum(['F', 'C']),
    temperatureMethod: a.string(),
    // Blood Pressure
    bloodPressureSystolic: a.integer(),
    bloodPressureDiastolic: a.integer(),
    bloodPressurePosition: a.string(),
    // Heart & Respiratory
    heartRate: a.integer(),
    respiratoryRate: a.integer(),
    oxygenSaturation: a.float(),
    oxygenSupplemental: a.boolean(),
    // Height & Weight
    height: a.float(),
    heightUnit: a.enum(['in', 'cm']),
    weight: a.float(),
    weightUnit: a.enum(['lb', 'kg']),
    bmi: a.float(),
    // Pain
    painLevel: a.integer(), // 0-10
    painLocation: a.string(),
    // Additional
    glucoseLevel: a.float(),
    headCircumference: a.float(), // Pediatric
    notes: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // REPORTING & ANALYTICS
  // ============================================================================

  /**
   * Report - Saved report definitions
   */
  Report: a.model({
    organizationId: a.id().required(),
    name: a.string().required(),
    description: a.string(),
    category: a.enum(['financial', 'operational', 'clinical', 'compliance', 'ai_performance']),
    reportType: a.enum(['standard', 'custom']),
    // Configuration
    dataSource: a.string(),
    filters: a.json(),
    columns: a.json(),
    groupBy: a.json(),
    sortBy: a.json(),
    // Schedule
    isScheduled: a.boolean(),
    scheduleFrequency: a.enum(['daily', 'weekly', 'monthly']),
    scheduleDay: a.integer(),
    scheduleTime: a.string(),
    recipients: a.json(),
    // Output
    outputFormat: a.enum(['pdf', 'excel', 'csv']),
    // Access
    isPublic: a.boolean(),
    sharedWith: a.json(),
    createdById: a.id(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * ReportExecution - Report run history
   */
  ReportExecution: a.model({
    reportId: a.id().required(),
    executedAt: a.datetime().required(),
    executedById: a.id(),
    // Parameters
    parameters: a.json(),
    dateRangeStart: a.date(),
    dateRangeEnd: a.date(),
    // Results
    status: a.enum(['running', 'completed', 'failed']),
    rowCount: a.integer(),
    executionTimeMs: a.integer(),
    // Output
    outputUrl: a.string(),
    outputFormat: a.string(),
    expiresAt: a.datetime(),
    errorMessage: a.string(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * DashboardWidget - Custom dashboard widgets
   */
  DashboardWidget: a.model({
    organizationId: a.id().required(),
    userId: a.id(),
    dashboardType: a.enum(['owner', 'biller', 'coder', 'doctor', 'patient']),
    widgetType: a.enum(['metric', 'chart', 'list', 'table', 'gauge']),
    title: a.string().required(),
    // Configuration
    dataSource: a.string(),
    metrics: a.json(),
    chartType: a.enum(['bar', 'line', 'pie', 'donut', 'area']),
    filters: a.json(),
    refreshInterval: a.integer(), // minutes
    // Layout
    position: a.json(), // {x, y, w, h}
    isActive: a.boolean(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * KPIMetric - Daily/Monthly KPI snapshots
   */
  KPIMetric: a.model({
    organizationId: a.id().required(),
    doctorClientId: a.id(), // Optional: per-client metrics
    metricDate: a.date().required(),
    metricType: a.enum(['daily', 'weekly', 'monthly']),
    // AR Metrics
    totalAR: a.float(),
    ar0to30: a.float(),
    ar31to60: a.float(),
    ar61to90: a.float(),
    ar91to120: a.float(),
    ar120Plus: a.float(),
    arOver90Percent: a.float(),
    // Collection Metrics
    grossCharges: a.float(),
    netCollections: a.float(),
    collectionRate: a.float(),
    adjustmentRate: a.float(),
    // Claim Metrics
    claimsSubmitted: a.integer(),
    claimsPaid: a.integer(),
    claimsDenied: a.integer(),
    denialRate: a.float(),
    cleanClaimRate: a.float(),
    firstPassResolutionRate: a.float(),
    // Denial Metrics
    denialsByCategory: a.json(),
    appealSuccessRate: a.float(),
    // Productivity
    averageDaysInAR: a.float(),
    averageDaysToPayment: a.float(),
    chargesPerFTE: a.float(),
    claimsPerFTE: a.float(),
    // AI Metrics
    aiAutoApprovalRate: a.float(),
    aiAccuracyRate: a.float(),
    aiTimeSavedHours: a.float(),
    aiCostSavings: a.float(),
  }).authorization((allow) => [allow.authenticated()]),

  // ============================================================================
  // NOTIFICATIONS & COMMUNICATION
  // ============================================================================

  /**
   * Notification - System notifications
   */
  Notification: a.model({
    userId: a.id().required(),
    organizationId: a.id(),
    // Content
    title: a.string().required(),
    message: a.string().required(),
    notificationType: a.enum(['info', 'warning', 'error', 'success', 'action_required']),
    category: a.enum(['claim', 'payment', 'denial', 'appointment', 'ai_action', 'system', 'compliance']),
    // Reference
    referenceType: a.string(),
    referenceId: a.id(),
    actionUrl: a.string(),
    // Status
    status: a.enum(['unread', 'read', 'dismissed', 'actioned']),
    readAt: a.datetime(),
    // Delivery
    channels: a.json(), // ['in_app', 'email', 'sms']
    emailSentAt: a.datetime(),
    smsSentAt: a.datetime(),
    createdAt: a.datetime().required(),
    expiresAt: a.datetime(),
  }).authorization((allow) => [allow.authenticated()]),

  /**
   * Message - Internal messaging
   */
  Message: a.model({
    organizationId: a.id().required(),
    threadId: a.id(),
    // Sender/Recipient
    senderId: a.id().required(),
    recipientId: a.id(),
    recipientType: a.enum(['user', 'group', 'all_billers', 'all_coders']),
    // Content
    subject: a.string(),
    body: a.string().required(),
    attachments: a.json(),
    // Reference
    referenceType: a.string(), // 'claim', 'patient', 'denial'
    referenceId: a.id(),
    // Status
    status: a.enum(['sent', 'delivered', 'read']),
    readAt: a.datetime(),
    isUrgent: a.boolean(),
    sentAt: a.datetime().required(),
  }).authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
