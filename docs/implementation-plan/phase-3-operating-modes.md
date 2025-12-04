# Phase 3: Operating Modes System

Three-mode architecture: Full AI, Hybrid, Manual.

## 3.1 Mode Configuration

### Models Used
- `ClientOperatingMode` - Per-client mode settings
- `OperatingModeOverride` - Temporary overrides

### Files to Create
```
src/app/(dashboard)/settings/operating-modes/page.tsx
src/components/settings/OperatingModeSelector.tsx
src/components/settings/ModeOverrideForm.tsx
src/lib/api/operating-modes.ts
src/lib/modes/mode-context.ts
src/lib/modes/mode-utils.ts
```

### Features
- Global default mode setting
- Per-client mode override
- Temporary mode override with expiry
- Mode change audit logging

## 3.2 Mode-Aware UI Components

### Files to Create
```
src/components/modes/ModeIndicator.tsx          # Shows current mode
src/components/modes/ModeSwitch.tsx             # Quick toggle
src/components/modes/AIDisabledBanner.tsx       # Manual mode notice
src/components/modes/ConfidenceDisplay.tsx      # AI confidence scores
src/components/modes/AutoApprovalSettings.tsx   # Thresholds config
src/lib/hooks/useOperatingMode.ts
```

### Features
- Visual mode indicator in header
- Conditional AI feature rendering
- Confidence score display
- Auto-approval threshold configuration

## 3.3 Auto-Approval Engine

### Configuration
```typescript
interface AutoApprovalConfig {
  minConfidence: number;      // Default: 0.95
  maxClaimAmount: number;     // Default: 500
  requireDualReview: boolean;
  excludedPayers: string[];
  excludedCodes: string[];
}
```

### Files to Create
```
src/lib/modes/auto-approval.ts
src/lib/modes/confidence-scoring.ts
src/components/modes/ApprovalQueue.tsx
src/components/modes/ApprovalReview.tsx
```

### Features
- Confidence threshold checks
- Claim amount limits
- Payer exclusions
- Code exclusions
- Manual review queue for below-threshold

## 3.4 Human-in-the-Loop UI

### Files to Create
```
src/app/(dashboard)/review-queue/page.tsx
src/components/review/ReviewItem.tsx
src/components/review/AIExtractionComparison.tsx
src/components/review/ApproveRejectButtons.tsx
src/components/review/CorrectionForm.tsx
src/lib/api/review-queue.ts
```

### Features
- Items pending human review
- Side-by-side: AI extraction vs source document
- Approve/reject/correct workflow
- Correction feedback for AI improvement
- Bulk approval for high-confidence batches

## 3.5 Mode Transition Logic

### Files to Create
```
src/lib/modes/transition-rules.ts
src/lib/modes/fallback-handlers.ts
src/lib/hooks/useModeAwareAction.ts
```

### Logic
- Full AI → Hybrid: On confidence below threshold
- Hybrid → Manual: On repeated failures or user request
- Manual → Hybrid: User explicitly re-enables
- All transitions logged for audit

## Completion Criteria

- [ ] Mode displayed in UI header
- [ ] Per-client mode configuration works
- [ ] AI features hidden in Manual mode
- [ ] Review queue shows pending AI actions
- [ ] Auto-approval respects thresholds
- [ ] Mode transitions logged
