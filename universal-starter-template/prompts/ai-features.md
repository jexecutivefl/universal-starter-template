# AI Feature Prompts

Prompts for implementing AI-powered features using Claude API.

---

## AI Processing Pipeline

```
Create an AI processing pipeline for background tasks:

## Data Models (amplify/data/resource.ts)

AITask model for tracking AI jobs:
- organizationId, type, status (pending/processing/completed/failed/requires_review)
- priority (low/normal/high/urgent)
- input (JSON), output (JSON)
- confidenceScore (0-1), requiresHumanReview
- reviewedById, reviewedAt, reviewNotes
- startedAt, completedAt, processingTimeMs
- errorMessage, retryCount

## Backend Service

Create lib/ai/ai-service.ts:
- processTask(taskId) - main processing function
- Uses fetch to call Claude API
- Handles retries with exponential backoff
- Updates task status throughout
- Calculates confidence scores

Create lib/ai/prompts.ts:
- System prompts for different task types
- Prompt templates with variable substitution
- Output format specifications

## API Layer

Create lib/api/ai-tasks.ts:
- useAITasks() - list tasks with filters
- useAITask(id) - single task details
- useCreateAITask() - queue new task
- useRetryAITask() - retry failed task
- useCancelAITask() - cancel pending task
- useReviewAITask() - submit human review

## UI Components

1. components/ai/task-queue.tsx
   - List of pending/processing tasks
   - Progress indicators
   - Cancel button
   - Auto-refresh every 5 seconds

2. components/ai/task-result.tsx
   - Display AI output
   - Confidence score badge
   - Review/approve buttons
   - Edit AI output capability

3. components/ai/review-queue.tsx
   - Tasks requiring human review
   - Side-by-side: AI output vs original input
   - Approve/reject/edit options
   - Bulk review capability

4. app/(dashboard)/ai-tasks/page.tsx
   - Tabs: Queue | Completed | Failed | Review
   - Create new task button
   - Filter by type, date, status

## Processing Patterns

1. Confidence thresholds:
   - > 0.95: Auto-approve
   - 0.80-0.95: Flag for quick review
   - < 0.80: Require full review

2. Error handling:
   - Retry transient errors 3 times
   - Flag permanent errors for review
   - Log all errors for debugging

Make it robust and production-ready.
Include proper error boundaries.
Show clear status throughout processing.
```

---

## AI Chat Interface

```
Create an AI chat interface:

## Components

1. components/ai/chat-container.tsx
   - Full chat interface
   - Message history
   - Input area
   - Send button

2. components/ai/chat-message.tsx
   - User message (right-aligned)
   - AI message (left-aligned)
   - Typing indicator
   - Copy message button
   - Markdown rendering for AI responses

3. components/ai/chat-input.tsx
   - Textarea with auto-resize
   - Send on Enter (Shift+Enter for newline)
   - Character count
   - Attachment button (optional)

## Implementation

Create lib/ai/chat.ts:
- sendMessage(messages, context)
- Uses streaming for real-time response
- Maintains conversation history
- Handles context from current page

Create lib/hooks/use-chat.ts:
- messages state
- sendMessage function
- isLoading state
- error handling
- clear history function

## Features

1. Streaming responses
   - Show tokens as they arrive
   - Typing indicator during initial load

2. Context awareness
   - Pass current entity data
   - Reference specific fields
   - Action suggestions based on context

3. Quick actions
   - Predefined prompts for common tasks
   - "Summarize this", "Find issues", etc.

4. Message actions
   - Copy response
   - Regenerate response
   - Rate response (thumbs up/down)

5. Persistence
   - Save chat history to localStorage
   - Clear history option
   - Export conversation

## Page Integration

Add chat panel to relevant pages:
- Slide-out panel from right
- Toggle button in header
- Context from current page

Make it feel conversational and helpful.
Stream responses for better UX.
Handle errors gracefully.
```

---

## Operating Modes System

```
Implement the AI Operating Modes system (Full AI / Hybrid / Manual):

## Data Model

OperatingModeSettings in amplify/data/resource.ts:
- organizationId
- operatingMode: enum ['full_ai', 'hybrid', 'manual']
- aiConfidenceThreshold (default 0.95)
- aiAutoApprovalEnabled
- aiAutoApprovalMaxAmount (for financial decisions)
- showAiConfidence (show/hide confidence in UI)
- showAiRecommendations
- allowAiOverride
- updatedAt, updatedById

## API Layer

Create lib/api/operating-mode.ts:
- useOperatingMode() - get current settings
- useUpdateOperatingMode() - update settings

Create lib/ai/mode-context.tsx:
- OperatingModeProvider
- useOperatingMode hook
- Mode-aware decision helpers

## UI Components

1. components/ai/mode-switcher.tsx
   - Dropdown to change mode
   - Shows current mode with icon
   - Confirmation for mode changes

2. components/ai/mode-settings.tsx
   - Full settings panel
   - Threshold sliders
   - Feature toggles
   - Save button

3. components/ai/confidence-badge.tsx
   - Color-coded confidence display
   - Hidden in Manual mode
   - Tooltip with breakdown

4. components/ai/ai-recommendation.tsx
   - Shows AI suggestion
   - Accept/reject buttons
   - Edit option
   - Hidden in Manual mode

5. app/(dashboard)/settings/ai/page.tsx
   - Full AI settings page
   - Mode selection with descriptions
   - All threshold controls
   - Feature toggles

## Mode Behaviors

### Full AI Mode
- Auto-process when confidence > threshold
- Auto-approve under amount limit
- Queue low-confidence for review
- Minimal human intervention

### Hybrid Mode (Default)
- AI processes and suggests
- Human reviews all decisions
- Show confidence everywhere
- One-click approve/reject

### Manual Mode
- No automatic AI processing
- Optional AI assistance on demand
- Clean UI without AI indicators
- Traditional workflow

## Integration Points

Wrap decision points with mode checks:
- Before auto-processing
- When showing/hiding AI UI
- When submitting forms
- When approving items

Example hook:
```typescript
const { shouldAutoProcess, showConfidence, requiresReview } = useAIDecision({
  confidence: 0.92,
  amount: 450,
});
```

Make mode switching feel seamless.
Respect mode settings everywhere.
Log all AI decisions for audit.
```

---

## Document Extraction

```
Build AI-powered document extraction:

## Data Models

IngestedDocument:
- organizationId, filename, s3Key, mimeType, size
- processingStatus, uploadedById, createdAt

DocumentExtraction:
- documentId, extractionType
- extractedData (JSON), rawText
- confidenceScore, fieldConfidences (JSON)
- requiresReview, reviewedById, reviewedAt
- validationErrors (JSON)

## Backend Service

Create lib/ai/document-extraction.ts:
- extractDocument(documentId, extractionType)
- Uses Claude vision for PDFs/images
- Text extraction for text files
- Returns structured data + confidence

Create lib/ai/extraction-prompts.ts:
- Prompts for different document types
- Invoice, receipt, form, ID, etc.
- Output JSON schemas

## UI Components

1. components/documents/upload-zone.tsx
   - Drag and drop area
   - File type validation
   - Upload progress
   - Preview thumbnails

2. components/documents/extraction-view.tsx
   - Side-by-side: document + extracted data
   - Highlight fields on document
   - Edit extracted values
   - Confidence indicators per field

3. components/documents/extraction-review.tsx
   - Review queue for low-confidence extractions
   - Approve/reject/edit flow
   - Bulk review capability

4. app/(dashboard)/documents/page.tsx
   - Document list with status
   - Upload button
   - Filter by status, type, date
   - Click to view extraction

## Workflow

1. Upload document → Create IngestedDocument
2. Queue extraction → Create AITask
3. Process with Claude Vision
4. Create DocumentExtraction with results
5. If confidence < threshold → require review
6. Review and approve
7. Use extracted data downstream

Make extraction feel magical.
Show processing progress.
Handle edge cases gracefully.
```
