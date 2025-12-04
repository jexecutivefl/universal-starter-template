# Phase 4: AI Agents

Eight autonomous agents for billing automation.

## 4.1 Agent Infrastructure

### AWS Resources
- Step Functions state machines
- Lambda functions per agent
- SQS queues for job dispatch
- EventBridge for scheduling
- CloudWatch for logging

### Files to Create
```
amplify/functions/agent-orchestrator/handler.ts
amplify/functions/shared/claude-client.ts
amplify/functions/shared/agent-base.ts
amplify/functions/shared/confidence-scorer.ts
amplify/functions/shared/audit-logger.ts
src/lib/api/agent-jobs.ts
```

### Shared Agent Interface
```typescript
interface AgentJob {
  id: string;
  agentType: AgentType;
  input: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  confidence?: number;
  output?: Record<string, any>;
  error?: string;
}
```

## 4.2 Email Watcher Agent

### Purpose
Monitor email accounts, detect new documents, create ingestion jobs.

### Files to Create
```
amplify/functions/email-watcher/handler.ts
amplify/functions/email-watcher/imap-client.ts
amplify/functions/email-watcher/gmail-client.ts
amplify/functions/email-watcher/outlook-client.ts
amplify/functions/email-watcher/attachment-extractor.ts
```

### Flow
1. Poll configured email accounts (EventBridge scheduled)
2. Detect new emails with attachments
3. Download attachments to S3
4. Create IngestedDocument records
5. Queue for Document Extractor

## 4.3 Document Extractor Agent

### Purpose
Extract structured data from documents using Claude Vision.

### Files to Create
```
amplify/functions/document-extractor/handler.ts
amplify/functions/document-extractor/pdf-renderer.ts
amplify/functions/document-extractor/image-processor.ts
amplify/functions/document-extractor/extraction-prompts.ts
amplify/functions/document-extractor/field-mappers.ts
```

### Extraction Types
- EOB/ERA documents → Remittance data
- Superbills → Claim data
- Patient forms → Demographics
- Insurance cards → Coverage info

### Flow
1. Receive document from queue
2. Render PDF to images (Playwright)
3. Send to Claude Vision with extraction prompt
4. Parse structured response
5. Calculate confidence scores
6. Queue for Visual Reviewer

## 4.4 Visual Reviewer Agent

### Purpose
Verify extracted data by comparing to source document visually.

### Files to Create
```
amplify/functions/visual-reviewer/handler.ts
amplify/functions/visual-reviewer/comparison-prompts.ts
amplify/functions/visual-reviewer/discrepancy-detector.ts
```

### Flow
1. Receive extraction result
2. Re-render source document
3. Ask Claude to verify each field against document
4. Flag discrepancies
5. Update confidence scores
6. Route to auto-approve or human review

## 4.5 Insurance Verification Agent

### Purpose
Check patient eligibility via 270/271 EDI.

### Files to Create
```
amplify/functions/insurance-verifier/handler.ts
amplify/functions/insurance-verifier/edi-270-builder.ts
amplify/functions/insurance-verifier/edi-271-parser.ts
amplify/functions/insurance-verifier/clearinghouse-client.ts
```

### Flow
1. Receive verification request
2. Build 270 EDI transaction
3. Submit to clearinghouse
4. Parse 271 response
5. Update EligibilityCheck record
6. Flag coverage issues

## 4.6 Claim Scrubber Agent

### Purpose
Validate claims against billing rules before submission.

### Files to Create
```
amplify/functions/claim-scrubber/handler.ts
amplify/functions/claim-scrubber/ncci-validator.ts
amplify/functions/claim-scrubber/lcd-checker.ts
amplify/functions/claim-scrubber/medical-necessity.ts
amplify/functions/claim-scrubber/rule-engine.ts
```

### Validations
- NCCI bundling edits
- LCD/NCD medical necessity
- Modifier requirements
- Frequency limits
- Prior auth requirements

## 4.7 Claim Submission Agent

### Purpose
Generate and submit claims to clearinghouse.

### Files to Create
```
amplify/functions/claim-submitter/handler.ts
amplify/functions/claim-submitter/edi-837-builder.ts
amplify/functions/claim-submitter/claimmd-client.ts
amplify/functions/claim-submitter/submission-tracker.ts
```

### Flow
1. Receive approved claim
2. Build 837P/837I EDI file
3. Submit to ClaimMD
4. Track submission status
5. Update claim record
6. Handle rejections

## 4.8 Payment Processor Agent

### Purpose
Process ERA files, auto-post payments.

### Files to Create
```
amplify/functions/payment-processor/handler.ts
amplify/functions/payment-processor/era-835-parser.ts
amplify/functions/payment-processor/claim-matcher.ts
amplify/functions/payment-processor/adjustment-poster.ts
amplify/functions/payment-processor/denial-creator.ts
```

### Flow
1. Receive ERA file
2. Parse 835 EDI
3. Match payments to claims
4. Post adjustments
5. Create denial records for rejections
6. Calculate patient responsibility

## 4.9 Agent Monitoring Dashboard

### Files to Create
```
src/app/(dashboard)/agents/page.tsx
src/app/(dashboard)/agents/[agentType]/page.tsx
src/components/agents/AgentStatusCard.tsx
src/components/agents/JobTable.tsx
src/components/agents/JobDetail.tsx
src/components/agents/AgentMetrics.tsx
src/lib/api/agents.ts
```

### Features
- Agent health status
- Job queue depths
- Success/failure rates
- Average processing time
- Recent job history
- Manual job retry

## Completion Criteria

- [ ] Email watcher detects and ingests documents
- [ ] Document extractor processes PDFs/images
- [ ] Visual reviewer verifies extractions
- [ ] Eligibility checks run via EDI
- [ ] Claim scrubbing validates before submit
- [ ] Claims submit to clearinghouse
- [ ] ERA files auto-post payments
- [ ] Agent dashboard shows status/metrics
