# Phase 2: Claims Workflow

Core medical billing operations - claims, denials, payments.

## 2.1 Patient & Insurance Management

### Models Used
- `Patient` - Demographics, contacts
- `PatientInsurance` - Insurance policies

### Files to Create
```
src/app/(dashboard)/patients/page.tsx
src/app/(dashboard)/patients/[id]/page.tsx
src/app/(dashboard)/patients/new/page.tsx
src/components/patients/PatientForm.tsx
src/components/patients/PatientTable.tsx
src/components/patients/PatientSearch.tsx
src/components/patients/InsuranceForm.tsx
src/lib/api/patients.ts
src/lib/validations/patient.ts
```

### Features
- Patient demographics entry
- Multiple insurance policies (primary, secondary, tertiary)
- Insurance eligibility status display
- Patient search by name, DOB, MRN

## 2.2 Claim Entry & Submission

### Models Used
- `Claim` - Header info
- `ClaimLine` - Service lines with codes
- `ClaimAttachment` - Supporting documents

### Files to Create
```
src/app/(dashboard)/claims/page.tsx
src/app/(dashboard)/claims/[id]/page.tsx
src/app/(dashboard)/claims/new/page.tsx
src/components/claims/ClaimForm.tsx
src/components/claims/ClaimLineEditor.tsx
src/components/claims/ClaimTable.tsx
src/components/claims/ClaimDetail.tsx
src/components/claims/DiagnosisSelector.tsx
src/components/claims/ProcedureSelector.tsx
src/lib/api/claims.ts
src/lib/validations/claim.ts
src/lib/utils/claim-calculations.ts
```

### Features
- CMS-1500 style claim entry
- ICD-10 diagnosis code lookup
- CPT/HCPCS procedure code lookup
- Modifier selection
- Charge calculation
- Claim validation before submit
- Claim status tracking

## 2.3 Work Queues

### Models Used
- `WorkQueue`, `WorkQueueItem` - Task management

### Files to Create
```
src/app/(dashboard)/work-queues/page.tsx
src/app/(dashboard)/work-queues/[queueId]/page.tsx
src/components/work-queues/QueueList.tsx
src/components/work-queues/QueueItemTable.tsx
src/components/work-queues/QueueFilters.tsx
src/lib/api/work-queues.ts
```

### Features
- Predefined queues: New Claims, Pending Review, Denials, Appeals
- Queue item assignment
- Priority sorting (by age, amount, payer)
- Bulk actions (assign, status change)
- Item counts per queue

## 2.4 Claim Scrubbing

### Models Used
- `ClaimScrubResult` - Validation results

### Files to Create
```
src/components/claims/ClaimScrubber.tsx
src/components/claims/ScrubResultDisplay.tsx
src/lib/scrubbing/rules.ts
src/lib/scrubbing/ncci-edits.ts
src/lib/scrubbing/medical-necessity.ts
src/lib/api/claim-scrubbing.ts
```

### Features
- Required field validation
- NCCI edit checks (bundling)
- Modifier validation
- Age/gender appropriateness
- Frequency limits
- Display errors, warnings, info

## 2.5 Denial Management

### Models Used
- `Denial` - Denial records
- Claim status updates

### Files to Create
```
src/app/(dashboard)/denials/page.tsx
src/app/(dashboard)/denials/[id]/page.tsx
src/components/denials/DenialTable.tsx
src/components/denials/DenialDetail.tsx
src/components/denials/DenialWorkflow.tsx
src/components/denials/AppealForm.tsx
src/lib/api/denials.ts
src/lib/validations/denial.ts
src/lib/utils/denial-categories.ts
```

### Features
- Denial categorization (CO, PR, OA codes)
- Denial reason code lookup
- Appeal tracking
- Denial trends by payer/reason
- Write-off workflow

## 2.6 Payment Posting

### Models Used
- `Remittance` - ERA/EOB records
- `RemittanceLine` - Line-level payments

### Files to Create
```
src/app/(dashboard)/remittances/page.tsx
src/app/(dashboard)/remittances/[id]/page.tsx
src/components/remittances/RemittanceTable.tsx
src/components/remittances/RemittanceDetail.tsx
src/components/remittances/PaymentPostingForm.tsx
src/components/remittances/ERAUpload.tsx
src/lib/api/remittances.ts
src/lib/validations/remittance.ts
src/lib/parsing/era-835.ts
```

### Features
- ERA (835) file upload and parsing
- Manual EOB entry
- Payment matching to claims
- Adjustment posting
- Patient responsibility calculation
- Batch posting

## 2.7 Eligibility Verification

### Models Used
- `EligibilityCheck` - Verification records

### Files to Create
```
src/components/eligibility/EligibilityChecker.tsx
src/components/eligibility/EligibilityResult.tsx
src/components/eligibility/BenefitsSummary.tsx
src/lib/api/eligibility.ts
src/lib/integrations/edi-270-271.ts
```

### Features
- Real-time eligibility check
- Coverage details display
- Deductible/copay info
- Prior auth requirements
- Cache recent checks

## Completion Criteria

- [ ] Can create claims with diagnosis/procedure codes
- [ ] Claims go through scrubbing validation
- [ ] Work queues organize pending tasks
- [ ] Can manage denials and create appeals
- [ ] Can post payments from ERA files
- [ ] Can verify patient eligibility
