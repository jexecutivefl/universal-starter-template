# Medical Billing Automation Architecture Plan

## Executive Summary

This document outlines the complete architecture for an AI-powered medical billing automation system designed specifically for **medical billing companies** (not healthcare providers directly). The system automates the entire revenue cycle from email ingestion through claim submission and payment posting.

---

## System Overview

### Core Business Model
- **You (Medical Billing Company)** receive patient notes, PDFs, superbills, etc. via email from **your doctor clients**
- AI agents process these documents, extract billing information, and prepare claims
- Human billers review and approve claims before submission
- Claims are submitted to clearinghouses (primarily ClaimMD)
- Payments and denials are processed automatically
- **You invoice doctors** based on a percentage of collections

### Key Differentiators
1. **Email-First Workflow** - Documents arrive via email, not clinical EHR
2. **Visual AI Review** - Playwright screenshots + Claude vision for document analysis
3. **Multi-Tenant** - Support multiple doctor/practice clients
4. **Billing Company Dashboard** - Track fees owed by each doctor client
5. **Clearinghouse Abstraction** - Works with ClaimMD and others

---

## Architecture Layers

```
+------------------------------------------------------------------+
|                      PRESENTATION LAYER                          |
+------------------------------------------------------------------+
|  Billing Dashboard  |  Work Queues  |  Reports  |  Doctor Portal |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                      APPLICATION LAYER                           |
+------------------------------------------------------------------+
|  Claim Processing  |  Payment Posting  |  Denial Mgmt  |  AR     |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                      AI AGENT LAYER                              |
+------------------------------------------------------------------+
|  Email Watcher  |  Document Extractor  |  Visual Reviewer        |
|  Claim Scrubber |  Denial Handler      |  Payment Processor      |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                      INTEGRATION LAYER                           |
+------------------------------------------------------------------+
|  Email (IMAP/API)  |  Clearinghouses  |  Insurance APIs  |  LLM  |
+------------------------------------------------------------------+
                              |
+------------------------------------------------------------------+
|                      DATA LAYER (AWS Amplify)                    |
+------------------------------------------------------------------+
|  DynamoDB Tables  |  S3 Documents  |  CloudWatch Logs            |
+------------------------------------------------------------------+
```

---

## AI Agent System Design

### Agent 1: Email Watcher Agent

**Purpose**: Monitor designated email inbox(es) for incoming documents from doctors

**Trigger**: Runs continuously (every 1-5 minutes) or via webhook

**Workflow**:
```
1. Connect to email inbox (IMAP or Gmail/Outlook API)
2. Fetch new/unread emails from approved sender list
3. For each email:
   a. Identify sender (match to doctor client)
   b. Extract attachments (PDF, images, documents)
   c. Extract email body text (may contain notes)
   d. Create EmailIngestion record
   e. Create Document records for attachments
   f. Store documents in S3
   g. Queue documents for AI processing
   h. Mark email as processed
4. Trigger Document Extractor Agent
```

**Technology**:
- IMAP library (node-imap) or Gmail API / Microsoft Graph API
- AWS Lambda for scheduled execution
- S3 for document storage
- SQS for job queuing

### Agent 2: Document Extractor Agent

**Purpose**: Extract structured billing data from documents using AI

**Trigger**: New document queued from Email Watcher

**Workflow**:
```
1. Retrieve document from S3
2. Determine document type:
   - PDF (text-based or scanned)
   - Image (superbill scan, etc.)
   - DOCX/Text (clinical notes)
3. For PDFs/Images:
   a. Use Playwright to render document
   b. Take high-resolution screenshots
   c. Send screenshots to Claude Vision API
   d. Extract structured data
4. For text documents:
   a. Parse text directly
   b. Send to Claude for entity extraction
5. Extract key fields:
   - Patient demographics (name, DOB, insurance)
   - Service date(s)
   - Diagnosis codes (ICD-10)
   - Procedure codes (CPT/HCPCS)
   - Modifiers
   - Units/time
   - Provider information
   - Place of service
   - Insurance information
6. Calculate confidence scores for each field
7. Create ClaimDraft record with extracted data
8. Queue for Visual Review if confidence < threshold
9. Queue for human review if errors detected
```

**Technology**:
- Playwright for PDF/image rendering
- Claude API (claude-3-5-sonnet or opus) for vision + text analysis
- pdf-parse for text extraction fallback
- Sharp for image processing

### Agent 3: Visual Reviewer Agent

**Purpose**: Use Claude Vision to verify extracted data against original document

**Trigger**: ClaimDraft queued for visual review

**Workflow**:
```
1. Retrieve original document and extracted data
2. Render document using Playwright
3. Take full-page screenshot(s)
4. Create comparison prompt:
   "I extracted the following data from this document:
   [extracted data]
   Please verify each field against the document image.
   Flag any discrepancies or missing information."
5. Send to Claude Vision API
6. Parse verification results:
   - Confirmed fields (high confidence)
   - Discrepancy fields (need human review)
   - Missing fields (need doctor clarification)
7. Update ClaimDraft with verification results
8. Route appropriately:
   - Clean claims → Claim Scrubber
   - Discrepancies → Human work queue
   - Missing info → Doctor query queue
```

**Technology**:
- Playwright with custom viewport settings
- Claude Vision API
- Structured output parsing

### Agent 4: Insurance Verification Agent

**Purpose**: Verify patient insurance eligibility before claim submission

**Trigger**: ClaimDraft ready for eligibility check

**Workflow**:
```
1. Retrieve patient insurance information from ClaimDraft
2. Format 270 eligibility request:
   - Subscriber ID
   - Patient name and DOB
   - Payer ID
   - Service type codes
3. Submit to clearinghouse or direct payer API
4. Parse 271 eligibility response:
   - Coverage active? (Y/N)
   - Effective dates
   - Plan type
   - Deductible/copay information
   - Prior auth requirements
5. Create EligibilityCheck record
6. Update ClaimDraft with eligibility status
7. Flag if:
   - Coverage inactive → Route to doctor for updated info
   - Prior auth required → Create PriorAuthorization task
   - Benefits unknown → Flag for manual verification
```

**Technology**:
- X12 270/271 EDI formatting
- Clearinghouse APIs (ClaimMD, Availity, etc.)
- SOAP/REST API calls to payers

### Agent 5: Claim Scrubber Agent

**Purpose**: Validate claims against payer rules before submission

**Trigger**: ClaimDraft passed eligibility and visual review

**Workflow**:
```
1. Retrieve ClaimDraft with all extracted data
2. Run validation checks:
   a. NCCI edits (bundling/unbundling)
   b. Medical necessity (diagnosis ↔ procedure)
   c. Modifier validation
   d. Place of service rules
   e. Payer-specific rules
   f. Timely filing check
   g. Duplicate claim check
   h. Missing field validation
3. Calculate denial risk score
4. For each validation failure:
   - Classify as hard error vs soft warning
   - Determine if auto-correctable
   - Create error record with recommendation
5. Results:
   - Clean (no errors) → Queue for submission
   - Warnings only → Queue for human review with notes
   - Hard errors → Queue for correction workflow
6. Send email notification to biller for review queue items
```

**Technology**:
- Custom rules engine
- NCCI edit database
- Claude for complex rule interpretation
- Email service (SES, SendGrid)

### Agent 6: Claim Submission Agent

**Purpose**: Submit approved claims to clearinghouse

**Trigger**: Claim approved by human or auto-approved (clean + high confidence)

**Workflow**:
```
1. Retrieve approved Claim record
2. Format claim for submission:
   - Generate EDI 837P (professional) or 837I (institutional)
   - Or format for ClaimMD API
3. Submit to primary clearinghouse (ClaimMD)
4. Handle response:
   - Accepted → Update status, store confirmation
   - Rejected → Parse rejection reason, route to correction queue
5. Store submission details:
   - Clearinghouse claim ID
   - Control number
   - Timestamp
6. Update claim status to 'submitted'
7. Schedule follow-up status check (3-5 days)
```

**Technology**:
- X12 837P/837I EDI generation
- ClaimMD API integration
- Fallback clearinghouse integrations (Availity, etc.)
- AWS Step Functions for orchestration

### Agent 7: Payment & Denial Processor Agent

**Purpose**: Process incoming payments (ERAs) and denials

**Trigger**: ERA file received from clearinghouse or manual upload

**Workflow**:
```
1. Receive ERA (835) file or payment notification
2. Parse payment details:
   - Check/EFT number
   - Payment amount
   - Line-level details
3. For each payment line:
   a. Match to original claim (by claim number, patient, DOS)
   b. Compare paid amount to expected
   c. Parse adjustment reason codes (CARC/RARC)
4. Categorize each line:
   - Paid as expected → Auto-post
   - Underpaid → Create variance record, review queue
   - Denied → Create Denial record, categorize
   - Partial → Create adjustment record
5. For denials:
   a. Categorize denial type
   b. Determine if appealable
   c. Calculate financial impact
   d. Route to appropriate queue:
      - Correctable → Auto-correction queue
      - Appealable → Appeal queue
      - Write-off → Write-off review queue
6. Update Claim and AR records
7. Calculate billing company fees (% of collections)
8. Update BillingCompanyInvoice for doctor client
```

**Technology**:
- X12 835 EDI parsing
- ClaimMD payment API
- CARC/RARC code database
- Automated posting logic

### Agent 8: Doctor Communication Agent

**Purpose**: Send automated emails to doctors for claim issues

**Trigger**: Claim needs doctor input/approval

**Workflow**:
```
1. Retrieve claim issue details
2. Determine communication type:
   - Missing information request
   - Coding clarification needed
   - Claim correction approval
   - Prior authorization needed
   - Appeal approval needed
3. Generate professional email:
   - Use Claude to draft context-aware message
   - Include specific questions/requests
   - Attach relevant documents
   - Include secure link to review portal
4. Send email via configured service
5. Track email delivery and opens
6. Handle responses:
   - Parse email replies for answers
   - Update claim records
   - Re-queue for processing
7. Send reminders for unanswered queries (3, 7 days)
8. Escalate to biller after 14 days no response
```

**Technology**:
- SendGrid/SES for email delivery
- Claude for email drafting
- Email tracking pixels
- Reply parsing (IMAP monitoring)

---

## Clearinghouse Integration

### Primary: ClaimMD

ClaimMD API integration for:
- Claim submission (837P/837I equivalent)
- Eligibility verification (270/271)
- Claim status inquiry (276/277)
- ERA/payment retrieval (835)
- Prior authorization (278)

### Secondary Clearinghouses (Abstraction Layer)

```typescript
interface ClearinghouseAdapter {
  submitClaim(claim: Claim): Promise<SubmissionResult>;
  checkEligibility(request: EligibilityRequest): Promise<EligibilityResponse>;
  getClaimStatus(claimId: string): Promise<ClaimStatusResponse>;
  getPayments(dateRange: DateRange): Promise<Payment[]>;
  submitPriorAuth(request: PriorAuthRequest): Promise<PriorAuthResponse>;
}

// Implementations
class ClaimMDAdapter implements ClearinghouseAdapter { ... }
class AvailityAdapter implements ClearinghouseAdapter { ... }
class ChangeHealthcareAdapter implements ClearinghouseAdapter { ... }
class TrizzettoAdapter implements ClearinghouseAdapter { ... }
```

### Clearinghouse Selection Logic
1. Check doctor/practice preferred clearinghouse
2. Check payer-specific requirements
3. Fall back to ClaimMD as default
4. Automatic failover on submission errors

---

## Billing Company Dashboard

### Fee Collection from Doctors

Your business model: You charge doctors a **percentage of collections** (payments received from insurance + patient).

**Fee Tracking Models**:

```typescript
// Contract with each doctor client
DoctorContract: {
  doctorClientId: string;
  feeType: 'percentage_of_collections' | 'flat_fee' | 'per_claim';
  feePercentage: number; // e.g., 5-10%
  minimumFee: number;
  paymentTerms: 'net_15' | 'net_30' | 'net_45';
  effectiveDate: date;
  // Track different rates for different collection types
  insuranceCollectionRate: number;
  patientCollectionRate: number;
}

// Monthly invoice to doctor
BillingCompanyInvoice: {
  doctorClientId: string;
  invoicePeriod: { start: date, end: date };
  totalCollections: number;
  insuranceCollections: number;
  patientCollections: number;
  feeAmount: number; // calculated percentage
  adjustments: number;
  totalDue: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: date;
  paidDate: date;
  paymentMethod: string;
}

// Line-level collection tracking
CollectionFeeDetail: {
  invoiceId: string;
  claimId: string;
  patientName: string;
  serviceDate: date;
  payerName: string;
  collectionAmount: number;
  collectionType: 'insurance' | 'patient';
  feePercentage: number;
  feeAmount: number;
}
```

### Dashboard Views

#### 1. Revenue Dashboard (Billing Company Admin)
- Total collections this month (all doctors)
- Fees earned this month
- Outstanding invoices
- Collection by doctor
- Top performing practices
- Trends and forecasts

#### 2. Doctor Client Dashboard
- Per-doctor collection summary
- Claims submitted/pending/paid/denied
- Fee invoices
- Outstanding balance
- Payment history

#### 3. Work Queue Dashboard
- Claims pending review
- Denials to work
- Doctor queries awaiting response
- Appeals in progress
- Eligibility failures

#### 4. AI Agent Performance Dashboard
- Documents processed today
- Auto-approval rate
- Average confidence scores
- Processing time metrics
- Error rates by type

---

## Human Biller Workflows

### 1. Claim Review Queue

```
Claims awaiting human review:
+----+----------+--------+------------+--------+-----------+-------------+
| #  | Patient  | Doctor | Service    | Amount | Status    | Issues      |
+----+----------+--------+------------+--------+-----------+-------------+
| 1  | J. Smith | Dr. A  | 2024-01-15 | $450   | Review    | Low conf.   |
| 2  | M. Jones | Dr. B  | 2024-01-14 | $1,200 | Warning   | NCCI edit   |
| 3  | R. Brown | Dr. A  | 2024-01-15 | $320   | Error     | Missing DX  |
+----+----------+--------+------------+--------+-----------+-------------+

Actions: [Approve] [Edit] [Query Doctor] [Reject] [View Original]
```

**Review Interface**:
- Side-by-side: Original document | Extracted data
- AI suggestions highlighted
- Edit any field with audit trail
- One-click approve or reject
- Send to doctor for clarification

### 2. Denial Work Queue

```
Denials to work:
+----+----------+--------+--------+-----------+------------------+------------+
| #  | Patient  | Claim# | Amount | Denial    | Reason           | Action     |
+----+----------+--------+--------+-----------+------------------+------------+
| 1  | J. Smith | 10234  | $450   | CO-4      | Modifier missing | Correctable|
| 2  | M. Jones | 10189  | $1,200 | PR-96     | Non-covered svc  | Appeal     |
| 3  | R. Brown | 10156  | $320   | CO-29     | Timely filing    | Write-off  |
+----+----------+--------+--------+-----------+------------------+------------+

Actions: [Correct & Resubmit] [Appeal] [Write-off] [Patient Bill]
```

### 3. Payment Posting Review

```
Payments requiring review:
+----+----------+--------+----------+----------+----------+-----------+
| #  | Check#   | Payer  | Expected | Received | Variance | Status    |
+----+----------+--------+----------+----------+----------+-----------+
| 1  | EFT9928  | BCBS   | $450.00  | $380.00  | -$70.00  | Underpaid |
| 2  | 102938   | Aetna  | $1,200   | $0.00    | -$1,200  | Denied    |
+----+----------+--------+----------+----------+----------+-----------+

Actions: [Accept Variance] [Appeal] [Correct Claim] [Research]
```

### 4. AI Agent Monitoring Dashboard

**Purpose**: Monitor AI agent performance, view logs, and intervene when needed.

```
+------------------------------------------------------------------+
|                    AI AGENT MONITORING                            |
+------------------------------------------------------------------+
| AGENT STATUS                                                      |
+------------------------------------------------------------------+
| Agent                    | Status  | Last Run    | Success Rate  |
|--------------------------|---------|-------------|---------------|
| Email Watcher            | RUNNING | 2 min ago   | 99.2%         |
| Document Extractor       | RUNNING | 30 sec ago  | 94.8%         |
| Visual Reviewer          | RUNNING | 1 min ago   | 97.1%         |
| Claim Scrubber           | RUNNING | 45 sec ago  | 98.5%         |
| Insurance Verification   | RUNNING | 5 min ago   | 96.3%         |
| Payment Processor        | IDLE    | 2 hrs ago   | 99.8%         |
| Doctor Communication     | RUNNING | 10 min ago  | 100%          |
+------------------------------------------------------------------+
| TODAY'S METRICS                                                   |
+------------------------------------------------------------------+
| Documents Processed: 47        | Avg Confidence: 0.89            |
| Claims Auto-Approved: 31 (66%) | Claims Needing Review: 16 (34%) |
| Emails Sent to Doctors: 8      | Denials Predicted: 5            |
| Payments Auto-Posted: 23       | Exceptions: 4                   |
| Time Saved: ~6.2 hours         | Cost (Claude API): $12.45       |
+------------------------------------------------------------------+
| RECENT AI ACTIVITY (Live Feed)                                    |
+------------------------------------------------------------------+
| 2:34 PM | Document Extractor | Processed superbill.pdf (0.94)    |
| 2:33 PM | Visual Reviewer    | Verified claim #4892 ✓            |
| 2:31 PM | Email Watcher      | New email from dr.smith@clinic.com|
| 2:30 PM | Claim Scrubber     | Warning: NCCI edit on claim #4891 |
| 2:28 PM | Payment Processor  | Auto-posted EFT #9928 ($4,521)    |
+------------------------------------------------------------------+

Actions: [Pause Agent] [View Logs] [Retry Failed] [Configure]
```

---

## Full Manual Dashboards (No AI Required)

These dashboards allow billers, coders, and RCM staff to do ALL work manually without any AI agent involvement. The AI agents are optional - everything can be done by humans.

### Biller Workstation Dashboard

**Purpose**: Complete manual billing workflow for human billers.

```
+------------------------------------------------------------------+
|                    BILLER WORKSTATION                             |
+------------------------------------------------------------------+
| User: Jane Smith (Biller)  | Doctor Client: [All Clients ▼]       |
+------------------------------------------------------------------+
| QUICK ACTIONS                                                     |
| [+ New Claim] [Upload Document] [Check Eligibility] [Post Payment]|
+------------------------------------------------------------------+
| MY WORK QUEUES                            | PRODUCTIVITY          |
|-------------------------------------------|------------------------|
| Claims to Enter:           12             | Today: 23 claims       |
| Claims to Review:          8              | This Week: 89 claims   |
| Denials to Work:           15             | Pending: 35 items      |
| Payments to Post:          6              |                        |
| AR Follow-up:              22             |                        |
| Doctor Queries:            4              |                        |
+------------------------------------------------------------------+
| RECENT ACTIVITY                                                   |
| 2:45 PM - Submitted claim #4892 for Carter Family Med             |
| 2:30 PM - Posted payment EFT#9928 - $4,521.00                     |
| 2:15 PM - Worked denial CO-4 on claim #4856 - resubmitted         |
+------------------------------------------------------------------+

Tabs: [Claims] [Payments] [Denials] [AR] [Eligibility] [Reports]
```

### Claims Management Tab (Manual)

```
+------------------------------------------------------------------+
|                    CLAIMS MANAGEMENT                              |
+------------------------------------------------------------------+
| Filter: [All Statuses ▼] [All Clients ▼] [Date Range: This Month] |
| Search: [Patient name, claim #, or DOS...]            [Search]    |
+------------------------------------------------------------------+
| # | Claim#  | Patient      | Client       | DOS      | Status    |
|---|---------|--------------|--------------|----------|-----------|
| 1 | 4892    | Smith, John  | Carter Med   | 12/01/24 | Draft     |
| 2 | 4891    | Jones, Mary  | Smith Ortho  | 11/28/24 | Ready     |
| 3 | 4890    | Brown, Robert| Carter Med   | 11/28/24 | Submitted |
| 4 | 4889    | Davis, Lisa  | Johnson Ped  | 11/27/24 | Paid      |
| 5 | 4888    | Wilson, Tom  | Carter Med   | 11/26/24 | Denied    |
+------------------------------------------------------------------+
| Selected: Claim #4892                                             |
| Actions: [Edit] [Validate] [Submit] [Hold] [Void] [View History]  |
+------------------------------------------------------------------+
```

### Manual Claim Editor (Full Form)

```
+------------------------------------------------------------------+
|                    CLAIM EDITOR - #4892                           |
+------------------------------------------------------------------+
| Status: DRAFT          | Created: 12/01/24 | By: Jane Smith       |
+------------------------------------------------------------------+
| CLAIM TYPE                                                        |
| Form: (•) CMS-1500  ( ) UB-04    Frequency: (•) Original ( ) Void |
+------------------------------------------------------------------+
| PATIENT                                      | SUBSCRIBER          |
| Name: [John Smith        ]                   | Relation: [Self ▼]  |
| DOB: [03/15/1980]  Gender: [Male ▼]          | Name: [John Smith  ]|
| Address: [123 Main St, City, ST 12345]       | DOB: [03/15/1980]   |
| Phone: [(555) 123-4567]                      |                     |
+------------------------------------------------------------------+
| INSURANCE                                                         |
| Primary: [Blue Cross Blue Shield         ▼]  Payer ID: [BCBS01]   |
| Member ID: [XYZ123456789]  Group: [GRP001]                        |
| [✓] Verified 12/01/24 - Active through 12/31/24                   |
| Secondary: [None                         ▼]                       |
+------------------------------------------------------------------+
| PROVIDER                                                          |
| Billing: [Carter Family Medicine    ▼]  NPI: [1234567890]         |
| Rendering: [Dr. James Carter        ▼]  NPI: [0987654321]         |
| Facility: [Carter Medical Center    ▼]  POS: [11 - Office ▼]      |
+------------------------------------------------------------------+
| SERVICE DATES                                                     |
| From: [12/01/2024]  To: [12/01/2024]                              |
+------------------------------------------------------------------+
| DIAGNOSES (ICD-10)                                                |
| Ptr | Code     | Description                                      |
| A   | [M54.5 ] | Low back pain                          [x Remove]|
| B   | [M54.16] | Radiculopathy, lumbar region           [x Remove]|
| [+ Add Diagnosis]                                                 |
+------------------------------------------------------------------+
| SERVICE LINES                                                     |
| Ln | DOS      | CPT   | Mod | Dx  | Units | Charge  | Actions    |
| 1  | 12/01/24 | 99214 | 25  | A,B | 1     | $150.00 | [Edit][x]  |
| 2  | 12/01/24 | 20552 |     | A,B | 1     | $85.00  | [Edit][x]  |
|                                        Total: $235.00             |
| [+ Add Service Line]                                              |
+------------------------------------------------------------------+
| NOTES                                                             |
| [Patient presents with chronic low back pain with radiculopathy  ]|
| [Trigger point injection performed today                         ]|
+------------------------------------------------------------------+
| [Save Draft] [Validate Claim] [Submit to Clearinghouse] [Cancel]  |
+------------------------------------------------------------------+
```

### Payment Posting Dashboard (Manual)

```
+------------------------------------------------------------------+
|                    PAYMENT POSTING                                |
+------------------------------------------------------------------+
| [Upload ERA/835] [Manual Payment Entry] [Batch Post]              |
+------------------------------------------------------------------+
| UNPOSTED PAYMENTS                                                 |
| Check/EFT | Payer        | Amount     | Claims | Status           |
|-----------|--------------|------------|--------|------------------|
| EFT9930   | Blue Cross   | $8,421.50  | 12     | Ready to Post    |
| CHK45678  | Aetna        | $2,150.00  | 5      | Ready to Post    |
| EFT9929   | Medicare     | $12,890.00 | 28     | Partially Posted |
+------------------------------------------------------------------+
| POSTING: EFT9930 - Blue Cross - $8,421.50                         |
+------------------------------------------------------------------+
| Claim#  | Patient      | Billed   | Allowed  | Paid    | Adj    |
|---------|--------------|----------|----------|---------|--------|
| 4850    | Smith, John  | $235.00  | $180.00  | $144.00 | $55.00 |
|         | Line 1: 99214| $150.00  | $120.00  | $96.00  | $30.00 |
|         |   CARC: CO-45 (Contractual adjustment)                 |
|         | Line 2: 20552| $85.00   | $60.00   | $48.00  | $25.00 |
|         |   CARC: CO-45 (Contractual adjustment)                 |
|         | Patient Resp: $36.00 (Coinsurance)                     |
|         | [✓ Post] [Edit Amounts] [Create Denial] [Skip]         |
|---------|--------------|----------|----------|---------|--------|
| 4851    | Jones, Mary  | $450.00  | $0.00    | $0.00   | $450.00|
|         | DENIED - CO-4: Procedure code inconsistent with modifier|
|         | [Create Denial Work Item] [Appeal] [Write-off]         |
+------------------------------------------------------------------+
| Posted: $6,271.50 | Remaining: $2,150.00 | [Finish Batch]         |
+------------------------------------------------------------------+
```

### Denial Management Dashboard (Manual)

```
+------------------------------------------------------------------+
|                    DENIAL MANAGEMENT                              |
+------------------------------------------------------------------+
| Filter: [All Categories ▼] [All Clients ▼] [Open Denials Only ✓]  |
+------------------------------------------------------------------+
| DENIAL SUMMARY BY CATEGORY                                        |
| Eligibility: 5 ($2,100)  | Coding: 8 ($4,500)  | Auth: 3 ($1,800) |
| Timely Filing: 2 ($950)  | Duplicate: 1 ($200) | Other: 4 ($1,200)|
| Total Open: 23 denials | Total Value: $10,750                     |
+------------------------------------------------------------------+
| DENIAL WORK LIST                                                  |
| Priority | Claim#  | Patient     | Amount  | CARC | Days | Action |
|----------|---------|-------------|---------|------|------|--------|
| URGENT   | 4851    | Jones, Mary | $450    | CO-4 | 2    | [Work] |
| HIGH     | 4823    | Brown, Tom  | $1,200  | CO-50| 15   | [Work] |
| MEDIUM   | 4810    | Davis, Lisa | $320    | PR-96| 22   | [Work] |
| LOW      | 4798    | Wilson, Pat | $180    | CO-45| 28   | [Work] |
+------------------------------------------------------------------+
| WORKING: Claim #4851 - Jones, Mary - $450.00                      |
+------------------------------------------------------------------+
| Denial Details:                                                   |
| CARC: CO-4 - Procedure code inconsistent with modifier            |
| RARC: N130 - Consult appropriate coding reference                 |
| Original CPT: 99214-25 with 20552                                 |
+------------------------------------------------------------------+
| Resolution Options:                                               |
| ( ) Correct & Resubmit - Fix modifier and resubmit                |
| ( ) Appeal - Write appeal letter with documentation               |
| ( ) Bill Patient - Transfer to patient responsibility             |
| ( ) Write-off - Close as uncollectible                            |
| Notes: [                                                         ]|
| [Save Resolution] [Assign to Another Biller] [Escalate]           |
+------------------------------------------------------------------+
```

### AR Management Dashboard (Manual)

```
+------------------------------------------------------------------+
|                    ACCOUNTS RECEIVABLE                            |
+------------------------------------------------------------------+
| AR AGING SUMMARY (All Clients)                                    |
+------------------------------------------------------------------+
|           | 0-30    | 31-60   | 61-90   | 91-120  | 120+    |Total|
|-----------|---------|---------|---------|---------|---------|-----|
| Insurance | $45,200 | $12,300 | $8,400  | $3,200  | $1,900  |$71K |
| Patient   | $8,100  | $4,200  | $2,800  | $1,500  | $3,400  |$20K |
| Total     | $53,300 | $16,500 | $11,200 | $4,700  | $5,300  |$91K |
+------------------------------------------------------------------+
| FOLLOW-UP WORK LIST                                               |
| Priority | Claim#  | Patient     | Payer   | Amount | Days |Action|
|----------|---------|-------------|---------|--------|------|------|
| HIGH     | 4756    | Adams, Joe  | Aetna   | $1,850 | 45   |[Call]|
| HIGH     | 4742    | Baker, Sue  | UHC     | $920   | 52   |[Call]|
| MEDIUM   | 4701    | Clark, Dan  | BCBS    | $450   | 68   |[Call]|
+------------------------------------------------------------------+
| CLAIM STATUS CHECK                                                |
| Claim #4756 - Adams, Joe - Aetna - $1,850                         |
| Last Status: 11/15/24 - In Process                                |
| [Check Status via Clearinghouse] [Call Payer] [Send Statement]    |
|                                                                    |
| Call Log:                                                          |
| [12/01/24 2:30 PM] Called Aetna, ref#12345. Claim in review.      |
| [Add Call Note: _____________________________________________ ]   |
+------------------------------------------------------------------+
```

### Coder Workstation Dashboard (Manual Coding)

```
+------------------------------------------------------------------+
|                    CODER WORKSTATION                              |
+------------------------------------------------------------------+
| User: Mike Johnson (Certified Coder)  | Specialty: [All ▼]        |
+------------------------------------------------------------------+
| MY CODING QUEUE                           | PRODUCTIVITY          |
|-------------------------------------------|------------------------|
| Encounters to Code:        18             | Today: 15 charts       |
| Queries Pending:           3              | This Week: 62 charts   |
| QA Reviews:                5              | Accuracy: 98.2%        |
+------------------------------------------------------------------+
| CODING QUEUE                                                      |
| Priority | Patient      | DOS      | Provider    | Type    |Action|
|----------|--------------|----------|-------------|---------|------|
| URGENT   | Smith, John  | 12/01/24 | Dr. Carter  | E/M     |[Code]|
| HIGH     | Jones, Mary  | 11/30/24 | Dr. Smith   | Surgery |[Code]|
| NORMAL   | Brown, Tom   | 11/29/24 | Dr. Carter  | E/M     |[Code]|
+------------------------------------------------------------------+
```

### Chart Coding Interface (Manual)

```
+------------------------------------------------------------------+
|                    CHART CODING - Smith, John                     |
+------------------------------------------------------------------+
| Patient: John Smith  | DOS: 12/01/2024  | Provider: Dr. Carter    |
+------------------------------------------------------------------+
| CLINICAL DOCUMENTATION                    | CODE ASSIGNMENT        |
|-------------------------------------------|------------------------|
| Chief Complaint:                          | DIAGNOSES (ICD-10)     |
| Low back pain x 3 weeks, radiating        | [M54.5  ] Low back pain|
| to left leg                               | [M54.16 ] Radiculopathy|
|                                           | [+ Add Code]           |
| HPI:                                      |------------------------|
| 45 y/o male with chronic LBP,             | PROCEDURES (CPT)       |
| now with new radicular symptoms.          | [99214  ] Office visit |
| Pain 7/10, worse with sitting.            |   Mod: [25]            |
| No bowel/bladder changes.                 |   Units: [1]           |
|                                           | [20552  ] Trigger inj  |
| Exam:                                     |   Mod: [ ]             |
| Lumbar: tenderness L4-L5                  |   Units: [1]           |
| Neuro: + SLR left, 4/5 strength           | [+ Add Procedure]      |
| DTRs: diminished left ankle               |------------------------|
|                                           | E/M CALCULATOR         |
| Assessment:                               | History: Detailed      |
| 1. Lumbar radiculopathy                   | Exam: Detailed         |
| 2. Chronic low back pain                  | MDM: Moderate          |
|                                           | Time: 30 min           |
| Plan:                                     | Suggested: 99214 ✓     |
| - Trigger point injection today           |------------------------|
| - MRI lumbar spine ordered                | VALIDATION             |
| - F/U 2 weeks                             | [✓] Medical necessity  |
|                                           | [✓] NCCI edits pass    |
| [View Full Note] [View Images]            | [!] LCD check needed   |
+------------------------------------------------------------------+
| [Save Codes] [Send to Billing] [Query Provider] [Skip for Now]    |
+------------------------------------------------------------------+
```

### Eligibility Verification (Manual)

```
+------------------------------------------------------------------+
|                    ELIGIBILITY VERIFICATION                       |
+------------------------------------------------------------------+
| VERIFY PATIENT ELIGIBILITY                                        |
| Patient: [Search patient...                         ] [Search]    |
| -OR-                                                              |
| Payer: [Blue Cross Blue Shield    ▼]                              |
| Member ID: [XYZ123456789        ]                                 |
| Patient DOB: [03/15/1980]                                         |
| Service Type: [30 - Health Benefit Plan Coverage ▼]               |
| [Verify Eligibility]                                              |
+------------------------------------------------------------------+
| VERIFICATION RESULT - 12/01/2024 2:45 PM                          |
+------------------------------------------------------------------+
| Status: ✓ ACTIVE                                                  |
| Plan: Blue Cross PPO                                              |
| Effective: 01/01/2024  |  Term: 12/31/2024                        |
+------------------------------------------------------------------+
| BENEFITS                                                          |
| Deductible (Individual): $500.00  | Met: $500.00 ✓                |
| Deductible (Family): $1,500.00    | Met: $1,200.00                |
| Out-of-Pocket Max: $5,000.00      | Met: $1,800.00                |
| Coinsurance: 20% after deductible                                 |
| Office Visit Copay: $30.00                                        |
| Specialist Copay: $50.00                                          |
+------------------------------------------------------------------+
| AUTHORIZATION                                                     |
| Prior Auth Required for: MRI, Surgery, PT (>12 visits)            |
| Auth Phone: 1-800-555-1234                                        |
+------------------------------------------------------------------+
| [Print] [Save to Patient Record] [New Verification]               |
+------------------------------------------------------------------+
```

### 5. Manual Claim Entry (Fallback)

When AI can't process a document or for manual entry:

```
+------------------------------------------------------------------+
|                    CREATE NEW CLAIM                               |
+------------------------------------------------------------------+
| Doctor Client: [Carter Family Medicine        ▼]                  |
| Source: ( ) Email Attachment  (•) Manual Entry  ( ) Portal Upload |
+------------------------------------------------------------------+
| PATIENT INFORMATION                                               |
| First Name: [____________]  Last Name: [____________]             |
| DOB: [__/__/____]  Gender: [____▼]  Phone: [____________]         |
+------------------------------------------------------------------+
| INSURANCE                                                         |
| Payer: [Search payers...                      ▼]                  |
| Member ID: [____________]  Group: [____________]                  |
| [✓] Verify Eligibility Before Submission                          |
+------------------------------------------------------------------+
| SERVICE INFORMATION                                               |
| Service Date: [__/__/____]  POS: [__▼]                            |
|                                                                    |
| Diagnoses:                                                        |
| 1. [Search ICD-10...          ] [____________] [+ Add]            |
|                                                                    |
| Procedures:                                                       |
| Line | CPT    | Mod | Units | Charge  | Dx Ptrs                   |
| 1    | [_____]| [__]| [___] | $[____] | [1,2]                     |
| [+ Add Line]                                                      |
+------------------------------------------------------------------+
| [Save Draft] [Validate] [Submit to Scrubber] [Cancel]             |
+------------------------------------------------------------------+
```

---

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Query** - Data fetching
- **Recharts** - Dashboards and reporting

### Backend
- **AWS Amplify Gen2** - GraphQL API, Auth, Data
- **AWS Lambda** - AI agent execution
- **AWS Step Functions** - Agent orchestration
- **AWS SQS** - Job queues
- **AWS S3** - Document storage
- **AWS EventBridge** - Scheduling

### AI/ML
- **Claude API** (Anthropic) - Document extraction, visual review, email drafting
- **Playwright** - Browser automation for document rendering

### Integrations
- **ClaimMD API** - Primary clearinghouse
- **Gmail API / Microsoft Graph** - Email ingestion
- **SendGrid / AWS SES** - Outbound email
- **Stripe** - Payment processing (for doctor invoice payments)

### Database
- **DynamoDB** - Primary data store (via Amplify)
- **OpenSearch** - Full-text search (claims, patients)
- **ElastiCache** - Caching layer

---

## Security & Compliance

### HIPAA Compliance
- All PHI encrypted at rest (AES-256) and in transit (TLS 1.3)
- Access logging for all PHI access
- Minimum necessary access principle
- BAA required with all vendors (AWS, Anthropic, clearinghouses)
- Automatic session timeout (15 minutes)
- Audit trail for all actions

### Data Isolation
- Multi-tenant with strict data isolation
- Row-level security by doctor client
- Separate S3 buckets/prefixes per tenant
- Encryption keys per tenant (optional)

### Access Control
- Role-based access control (RBAC)
- MFA required for all users
- API key rotation
- IP allowlisting for sensitive operations

---

## Implementation Phases

### Phase 0: Foundation (Weeks 1-4)
- [ ] Core data models (Claims, Patients, Insurance, etc.)
- [ ] Authentication with roles (Biller, Admin, Doctor)
- [ ] Basic dashboard UI shell
- [ ] S3 document storage setup

### Phase 1: Email Ingestion (Weeks 5-8)
- [ ] Email Watcher Agent (Gmail/IMAP)
- [ ] Document storage in S3
- [ ] Document Extractor Agent (Claude integration)
- [ ] Manual claim entry (fallback)

### Phase 2: AI Processing (Weeks 9-12)
- [ ] Visual Reviewer Agent (Playwright + Claude Vision)
- [ ] Claim Scrubber Agent (rules engine)
- [ ] Human review workflow/queue
- [ ] Doctor query workflow

### Phase 3: Clearinghouse Integration (Weeks 13-16)
- [ ] ClaimMD integration (claims, eligibility)
- [ ] Claim submission workflow
- [ ] Payment/ERA processing
- [ ] Denial management

### Phase 4: Billing Company Features (Weeks 17-20)
- [ ] Doctor client management
- [ ] Fee calculation engine
- [ ] Invoice generation
- [ ] Payment tracking
- [ ] Reports and analytics

### Phase 5: Advanced Automation (Weeks 21-24)
- [ ] Auto-approval for high-confidence claims
- [ ] AI appeal letter generation
- [ ] Denial prediction
- [ ] Revenue forecasting
- [ ] Additional clearinghouse integrations

---

## Cost Estimates

### AWS Services (Monthly)
- Amplify/DynamoDB: $50-200
- Lambda executions: $50-100
- S3 storage: $20-50
- SQS/EventBridge: $10-20
- Total AWS: ~$200-400/month

### Third-Party Services (Monthly)
- Claude API: $100-500 (volume dependent)
- ClaimMD: Per-transaction fees
- SendGrid: $20-50
- Total Third-Party: ~$200-600/month

### Total Estimated: $400-1,000/month
(Scales with volume)

---

## Appendix: API Flow Diagrams

### Email to Claim Submission Flow
```
[Doctor Email]
    → [Email Watcher Agent]
    → [Document Extractor Agent]
    → [Visual Reviewer Agent]
    → [Insurance Verification Agent]
    → [Claim Scrubber Agent]
    → [Human Review (if needed)]
    → [Claim Submission Agent]
    → [ClaimMD]
    → [Payment Processor Agent]
    → [Fee Calculation]
    → [Doctor Invoice]
```

### Denial Workflow
```
[ERA with Denial]
    → [Payment Processor Agent]
    → [Denial categorized]
    → {Decision Point}
        → [Correctable] → [Auto-correct] → [Resubmit]
        → [Appealable] → [Generate Appeal] → [Human Approve] → [Submit]
        → [Write-off] → [Human Approve] → [Close]
        → [Patient Responsibility] → [Statement] → [Collections]
```

---

*Document created: 2025-12-03*
*For: Medical Billing Company EHR Platform*
