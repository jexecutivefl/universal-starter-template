# Operating Modes - AI/Hybrid/Manual System Design

## Executive Summary

This document defines the three operating modes that make this EHR and medical billing system unique. Users can switch between modes based on their comfort level with AI automation, compliance requirements, or business preferences.

---

## The Three Modes

### 1. Full AI Mode - "Agents Do Everything, Humans Approve"

**Target Users:** High-volume billing companies comfortable with AI, practices wanting maximum efficiency

**How It Works:**
```
+------------------------------------------------------------------+
|                        FULL AI MODE                               |
+------------------------------------------------------------------+
|                                                                    |
|   EMAIL ARRIVES                                                    |
|        ↓                                                           |
|   AI Extracts Data (automatic)                                     |
|        ↓                                                           |
|   AI Verifies via Visual Review (automatic)                        |
|        ↓                                                           |
|   AI Checks Eligibility (automatic)                                |
|        ↓                                                           |
|   AI Scrubs Claim (automatic)                                      |
|        ↓                                                           |
|   ┌─────────────────────────────────────────────────────────┐     |
|   │ DECISION POINT: Is confidence > 95% AND amount < $500?  │     |
|   └─────────────────────────────────────────────────────────┘     |
|        ↓ YES                          ↓ NO                         |
|   AUTO-SUBMIT TO               QUEUE FOR HUMAN                     |
|   CLEARINGHOUSE                APPROVAL                            |
|        ↓                              ↓                             |
|   AI Monitors Status           Human Reviews & Approves            |
|        ↓                              ↓                             |
|   AI Posts Payments            Claim Submitted                     |
|   (auto for clean ERA)                                             |
|                                                                    |
+------------------------------------------------------------------+
```

**Automatic Actions:**
- Document extraction from emails
- Visual verification of extracted data
- Eligibility verification
- Claim scrubbing and validation
- Auto-submission of clean claims (above confidence threshold)
- Auto-posting of clean ERA payments
- Auto-categorization of denials
- Auto-generation of appeal letters (for approval)
- Auto-sending of doctor queries
- Auto-scheduling of AR follow-ups

**Human Approval Required:**
- Claims below confidence threshold
- High-value claims (configurable, e.g., > $500)
- Claims with warnings
- Write-offs
- Appeal submissions
- Patient billing decisions

**Configuration Options:**
| Setting | Description | Default |
|---------|-------------|---------|
| `aiConfidenceThreshold` | Minimum confidence for auto-approval | 0.95 (95%) |
| `aiAutoApprovalMaxAmount` | Max claim amount for auto-approval | $500 |
| `aiAutoPostPayments` | Auto-post clean ERA payments | true |
| `aiAutoSendDoctorQueries` | Send doctor queries without review | true |
| `aiAutoAppealEnabled` | Auto-generate appeals | true |
| `aiAutoSubmitCleanClaims` | Auto-submit claims passing scrub | true |

---

### 2. Hybrid Mode - "Agents Assist, Humans Decide" (DEFAULT)

**Target Users:** Most users, practices wanting AI help with human control

**How It Works:**
```
+------------------------------------------------------------------+
|                        HYBRID MODE                                |
+------------------------------------------------------------------+
|                                                                    |
|   EMAIL ARRIVES                                                    |
|        ↓                                                           |
|   AI Extracts Data (automatic) → Shows suggestions                 |
|        ↓                                                           |
|   AI Verifies via Visual Review → Shows confidence scores          |
|        ↓                                                           |
|   ┌─────────────────────────────────────────────────────────┐     |
|   │              HUMAN REVIEW REQUIRED                       │     |
|   │                                                          │     |
|   │   [ ] Review extracted data                              │     |
|   │   [ ] Confirm patient info                               │     |
|   │   [ ] Verify codes (AI suggestions shown)                │     |
|   │   [ ] Check eligibility (AI pre-verified, shown)         │     |
|   │   [ ] Review scrub results (AI warnings shown)           │     |
|   │   [ ] Approve for submission                             │     |
|   └─────────────────────────────────────────────────────────┘     |
|        ↓                                                           |
|   Human Clicks [Submit to Clearinghouse]                           |
|        ↓                                                           |
|   AI Monitors Status (automatic)                                   |
|        ↓                                                           |
|   ERA Received → AI parses and shows posting preview               |
|        ↓                                                           |
|   Human Reviews → Clicks [Post Payments]                           |
|                                                                    |
+------------------------------------------------------------------+
```

**Automatic Actions:**
- Document extraction (with human review)
- Visual verification (results shown to human)
- Eligibility verification (results shown)
- Claim scrubbing (warnings shown)
- Denial prediction (risk score shown)
- Code suggestions (human selects)
- Email drafts for doctor queries (human sends)
- ERA parsing (human posts)

**Human Actions Required:**
- Review and confirm extracted data
- Confirm or modify code suggestions
- Review eligibility results
- Submit claims
- Post payments
- Send doctor communications
- Work denials
- Generate reports

**What's Different from Full AI:**
| Action | Full AI | Hybrid |
|--------|---------|--------|
| Claim submission | Automatic (if clean) | Human clicks Submit |
| Payment posting | Automatic (if clean) | Human clicks Post |
| Doctor queries | Auto-send | Human reviews & sends |
| Eligibility | Auto-run, auto-flag | Auto-run, human reviews |
| Code selection | AI selects | AI suggests, human selects |

---

### 3. Full Manual Mode - "No AI, Traditional Workflow"

**Target Users:** Users who prefer traditional workflows, training new staff, compliance-sensitive environments

**How It Works:**
```
+------------------------------------------------------------------+
|                       FULL MANUAL MODE                            |
+------------------------------------------------------------------+
|                                                                    |
|   DOCUMENTS RECEIVED (email, fax, upload)                          |
|        ↓                                                           |
|   Biller Opens Document in Viewer                                  |
|        ↓                                                           |
|   Biller Manually Enters Claim Data:                               |
|        - Patient demographics                                      |
|        - Insurance information                                     |
|        - Provider details                                          |
|        - Diagnosis codes (manual lookup)                           |
|        - Procedure codes (manual lookup)                           |
|        - Charges and units                                         |
|        ↓                                                           |
|   Biller Runs Eligibility Check (manual trigger)                   |
|        ↓                                                           |
|   Biller Runs Claim Validation (manual trigger)                    |
|        ↓                                                           |
|   Biller Submits Claim                                             |
|        ↓                                                           |
|   Biller Checks Claim Status (manual or scheduled)                 |
|        ↓                                                           |
|   ERA Received → Biller Manually Posts Payments                    |
|        ↓                                                           |
|   Biller Works Denials Manually                                    |
|                                                                    |
+------------------------------------------------------------------+
```

**AI Features DISABLED:**
- No automatic document extraction
- No AI code suggestions
- No denial prediction scores
- No auto-generated emails
- No AI appeal letter generation
- No confidence scores displayed

**Traditional Tools Available:**
- Manual claim entry forms
- ICD-10/CPT code search (database lookup, not AI)
- Manual eligibility verification (EDI 270/271)
- Standard claim validation (NCCI edits, not AI)
- Manual payment posting
- Manual denial management
- Standard reporting

**Why Use Manual Mode:**
1. **Training** - New staff learn fundamentals without AI assistance
2. **Compliance** - Some payers or organizations may require human-only processing
3. **Audits** - Demonstrate human decision-making for compliance audits
4. **Troubleshooting** - Isolate issues from AI behavior
5. **Cost Control** - Avoid AI API costs for low-volume operations

---

## Mode Comparison Matrix

| Feature | Full AI | Hybrid | Manual |
|---------|---------|--------|--------|
| **Document Extraction** | Auto | Auto + Review | Manual |
| **Code Suggestions** | AI Selects | AI Suggests | Manual Lookup |
| **Eligibility Check** | Auto + Flag | Auto + Review | Manual Trigger |
| **Claim Scrubbing** | Auto | Auto + Review | Manual Validation |
| **Denial Prediction** | Shows Score + Auto-Route | Shows Score | Not Available |
| **Claim Submission** | Auto (if clean) | Human Click | Human Click |
| **Payment Posting** | Auto (if clean) | Human Click | Manual Entry |
| **Appeal Generation** | Auto Draft | AI Draft + Edit | Manual Write |
| **Doctor Queries** | Auto Send | Human Review + Send | Manual Write |
| **AR Follow-up** | Auto Schedule | Suggestions | Manual |
| **AI Confidence Scores** | Hidden (auto-used) | Visible | Hidden |
| **API Costs** | Highest | Medium | Lowest |

---

## Configuration & Settings

### Organization-Level Settings

```typescript
// OperatingModeSettings model fields
{
  organizationId: "org_123",
  operatingMode: "hybrid",  // 'full_ai' | 'hybrid' | 'manual'

  // Full AI Mode Settings
  aiAutoApprovalEnabled: true,
  aiConfidenceThreshold: 0.95,
  aiAutoApprovalMaxAmount: 500.00,
  aiAutoPostPayments: true,
  aiAutoSendDoctorQueries: true,
  aiAutoAppealEnabled: true,
  aiAutoSubmitCleanClaims: true,

  // Hybrid Mode Settings
  aiSuggestionsEnabled: true,
  aiCodingAssistEnabled: true,
  aiDenialPredictionEnabled: true,
  aiEmailDraftsEnabled: true,
  aiDocumentExtractionEnabled: true,

  // Manual Mode Settings
  showAiConfidenceScores: false,  // Hide in manual
  showDenialRiskScores: false,    // Hide in manual

  // Notifications
  notifyOnAutoApproval: true,
  notifyOnAiException: true,
  dailyAiSummaryEnabled: true,

  // Override
  allowUserModeOverride: true,    // Let users switch per-session
  requireApprovalAboveAmount: 1000.00
}
```

### Per-Doctor Client Override

Medical billing companies can set different modes per doctor client:

```typescript
// Override for a specific doctor client
{
  organizationId: "org_123",
  doctorClientId: "doc_456",  // Override for this client only
  operatingMode: "manual",    // This doctor wants manual processing
  // ... other settings ...
}
```

### User Session Override

If `allowUserModeOverride` is enabled, users can temporarily switch modes:

```typescript
// User preferences (session-level)
{
  userId: "user_789",
  sessionMode: "hybrid",  // Override for this session
  modeExpiresAt: "2024-12-03T18:00:00Z"  // Revert after shift
}
```

---

## Mode Switching Workflows

### Switching from Manual to Hybrid

When upgrading from Manual to Hybrid mode:

1. **Existing Data** - All claims remain unchanged
2. **New Claims** - Will receive AI suggestions
3. **Training Period** - Show confidence scores but require human action
4. **Gradual Rollout** - Can enable features one at a time:
   - Week 1: Enable `aiDocumentExtractionEnabled`
   - Week 2: Enable `aiCodingAssistEnabled`
   - Week 3: Enable `aiDenialPredictionEnabled`
   - Week 4: Enable `aiEmailDraftsEnabled`

### Switching from Hybrid to Full AI

When upgrading from Hybrid to Full AI mode:

1. **Review Thresholds** - Set appropriate confidence thresholds
2. **Set Dollar Limits** - Configure max auto-approval amount
3. **Test Period** - Run in "shadow mode" where AI decisions are logged but humans still click
4. **Go Live** - Enable auto-submission after confidence in AI accuracy

### Emergency Fallback

If AI issues occur:

1. **Instant Switch** - Admin can switch to Manual mode instantly
2. **Pending Items** - AI-generated items remain in queue for human review
3. **No Data Loss** - All extractions and suggestions preserved
4. **Audit Trail** - Mode change logged with reason

---

## UI/UX Guidelines by Mode

### Full AI Mode UI

```
+------------------------------------------------------------------+
|  MODE: Full AI                              [Switch Mode ▼]       |
+------------------------------------------------------------------+
|                                                                    |
|  TODAY'S AI ACTIVITY                                              |
|  ┌────────────────────────────────────────────────────────────┐   |
|  │  Processed: 47 documents    Auto-Approved: 31 (66%)        │   |
|  │  Pending Review: 16         AI Cost Today: $12.45          │   |
|  └────────────────────────────────────────────────────────────┘   |
|                                                                    |
|  ITEMS NEEDING YOUR ATTENTION (16)                                |
|  ┌────────────────────────────────────────────────────────────┐   |
|  │  ⚠️  Claim #4892 - Confidence 87% - Below threshold        │   |
|  │  ⚠️  Claim #4891 - Amount $1,200 - Exceeds auto-limit     │   |
|  │  ⚠️  Denial #234 - Appeal letter ready for approval       │   |
|  └────────────────────────────────────────────────────────────┘   |
|                                                                    |
+------------------------------------------------------------------+
```

### Hybrid Mode UI

```
+------------------------------------------------------------------+
|  MODE: Hybrid                               [Switch Mode ▼]       |
+------------------------------------------------------------------+
|                                                                    |
|  CLAIM ENTRY - AI Assisted                                        |
|  ┌────────────────────────────────────────────────────────────┐   |
|  │  Patient: John Smith (AI Confidence: 98%)    [Confirm ✓]   │   |
|  │  DOB: 03/15/1980 (AI Confidence: 99%)        [Confirm ✓]   │   |
|  │  Insurance: BCBS (AI Confidence: 95%)        [Confirm ✓]   │   |
|  │                                                             │   |
|  │  DIAGNOSIS CODES (AI Suggestions):                          │   |
|  │  ☑ M54.5 - Low back pain (98% confidence)                  │   |
|  │  ☑ M54.16 - Radiculopathy, lumbar (92% confidence)         │   |
|  │  ☐ M47.816 - Spondylosis (78% confidence) - CONSIDER?      │   |
|  │                                                             │   |
|  │  PROCEDURE CODES (AI Suggestions):                          │   |
|  │  ☑ 99214 - Office visit, established (96% confidence)      │   |
|  │                                                             │   |
|  │  DENIAL RISK: LOW (12%)                                    │   |
|  └────────────────────────────────────────────────────────────┘   |
|                                                                    |
|  [Save Draft]  [Validate]  [Submit to Clearinghouse]             |
|                                                                    |
+------------------------------------------------------------------+
```

### Manual Mode UI

```
+------------------------------------------------------------------+
|  MODE: Manual                               [Switch Mode ▼]       |
+------------------------------------------------------------------+
|                                                                    |
|  CLAIM ENTRY                                                      |
|  ┌────────────────────────────────────────────────────────────┐   |
|  │  Patient: [___________________]                             │   |
|  │  DOB: [__/__/____]                                         │   |
|  │  Insurance: [Search Payers... ▼]                           │   |
|  │                                                             │   |
|  │  DIAGNOSIS CODES:                                           │   |
|  │  1. [________] [Search ICD-10...]                          │   |
|  │  [+ Add Diagnosis]                                         │   |
|  │                                                             │   |
|  │  PROCEDURE CODES:                                           │   |
|  │  Line | CPT    | Mod | Units | Charge                      │   |
|  │  1    | [_____]| [__]| [___] | $[_____]                    │   |
|  │  [+ Add Line]                                               │   |
|  └────────────────────────────────────────────────────────────┘   |
|                                                                    |
|  [Save Draft]  [Validate]  [Submit to Clearinghouse]             |
|                                                                    |
+------------------------------------------------------------------+
```

---

## Audit Trail & Compliance

All mode-related actions are logged:

```typescript
// AuditLog entries
{
  action: "MODE_CHANGE",
  userId: "user_123",
  details: {
    previousMode: "hybrid",
    newMode: "full_ai",
    reason: "Completed training period",
    changedBy: "admin_456"
  },
  timestamp: "2024-12-03T10:30:00Z"
}

{
  action: "AI_AUTO_APPROVAL",
  userId: "system",
  details: {
    claimId: "claim_789",
    confidence: 0.97,
    amount: 235.00,
    decision: "auto_approved",
    mode: "full_ai"
  },
  timestamp: "2024-12-03T10:35:00Z"
}
```

---

## Best Practices

### For Medical Billing Companies

1. **Start with Hybrid** - Get familiar with AI suggestions before full automation
2. **Gradual Confidence Increase** - Start threshold at 98%, lower to 95% over time
3. **Monitor AI Performance** - Review daily AI summary reports
4. **Per-Client Settings** - Conservative clients may prefer Manual mode

### For Medical Practices

1. **Consider Volume** - High-volume practices benefit most from Full AI
2. **Specialty Matters** - Complex specialties may do better with Hybrid
3. **Staff Training** - Start new staff in Manual, graduate to Hybrid
4. **Compliance Requirements** - Check payer requirements for AI use

### For Compliance Officers

1. **Document Mode Selection** - Keep records of why each mode was chosen
2. **Review Auto-Approvals** - Periodic audit of AI decisions
3. **Override Monitoring** - Track when users override AI suggestions
4. **Mode Change Approval** - Require approval for mode changes

---

## Implementation Checklist

### Phase 1: Manual Mode (Foundation)
- [ ] Implement all manual workflows
- [ ] Create manual claim entry forms
- [ ] Build ICD-10/CPT code search
- [ ] Implement standard claim validation
- [ ] Build payment posting interface

### Phase 2: Hybrid Mode (AI Assistance)
- [ ] Add AI document extraction (with review)
- [ ] Implement code suggestion engine
- [ ] Add denial prediction display
- [ ] Build email draft generation
- [ ] Add confidence score UI elements

### Phase 3: Full AI Mode (Automation)
- [ ] Implement auto-approval logic
- [ ] Build confidence threshold system
- [ ] Create auto-submission workflow
- [ ] Implement auto-payment posting
- [ ] Add AI activity dashboard
- [ ] Build exception handling queue

### Phase 4: Mode Management
- [ ] Create mode switching UI
- [ ] Implement per-client overrides
- [ ] Build audit logging for modes
- [ ] Create mode performance reports
- [ ] Add mode recommendation engine

---

*Document Created: 2025-12-03*
*For: EHR-26-2 Medical Billing Platform*
