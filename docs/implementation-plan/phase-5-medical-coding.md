# Phase 5: Medical Coding

Medical coder workstation and coding tools.

## 5.1 Code Database Setup

### Data
- ICD-10-CM diagnosis codes (~70,000 codes)
- CPT procedure codes (~10,000 codes)
- HCPCS Level II codes (~7,000 codes)
- Modifier codes (~200 codes)

### Files to Create
```
src/lib/coding/icd10-loader.ts
src/lib/coding/cpt-loader.ts
src/lib/coding/hcpcs-loader.ts
src/lib/coding/code-search.ts
src/lib/api/code-lookup.ts
amplify/functions/code-search/handler.ts
```

### Features
- Full-text search across code descriptions
- Category/chapter browsing
- Code relationships (includes, excludes)
- Tabular list navigation

## 5.2 Coder Workstation

### Files to Create
```
src/app/(dashboard)/coding/page.tsx
src/app/(dashboard)/coding/[encounterId]/page.tsx
src/components/coding/CoderWorkstation.tsx
src/components/coding/DocumentPanel.tsx
src/components/coding/CodeSearchPanel.tsx
src/components/coding/SelectedCodesPanel.tsx
src/components/coding/CodingHistory.tsx
```

### Layout
```
+------------------+------------------+
|  Document View   |  Code Search     |
|  (PDF/Notes)     |  [ICD-10] [CPT]  |
|                  |                  |
+------------------+------------------+
|  Selected Codes  |  AI Suggestions  |
|  - 99213         |  (Hybrid mode)   |
|  - J06.9         |                  |
+------------------+------------------+
```

### Features
- Split-pane document viewer
- Quick code search
- Drag-drop code assignment
- Code sequencing (primary dx, etc.)
- Coding history per encounter

## 5.3 E/M Level Calculator

### Files to Create
```
src/components/coding/EMCalculator.tsx
src/components/coding/MDMCalculator.tsx
src/components/coding/TimeBasedSelector.tsx
src/lib/coding/em-rules-2021.ts
src/lib/coding/mdm-scoring.ts
```

### Features
- 2021 E/M guidelines support
- MDM complexity calculator
- Time-based code selection
- New vs established patient
- Place of service considerations

## 5.4 AI Code Suggestions

### Files to Create
```
amplify/functions/code-suggester/handler.ts
amplify/functions/code-suggester/clinical-parser.ts
amplify/functions/code-suggester/code-ranker.ts
src/components/coding/AISuggestions.tsx
src/components/coding/SuggestionCard.tsx
```

### Features
- Analyze clinical documentation
- Suggest ICD-10 codes with confidence
- Suggest CPT codes based on procedures
- Highlight supporting documentation
- Learn from coder corrections

## 5.5 Coding Compliance

### Files to Create
```
src/app/(dashboard)/coding/audits/page.tsx
src/components/coding/AuditQueue.tsx
src/components/coding/AuditReview.tsx
src/components/coding/ComplianceReport.tsx
src/lib/coding/audit-rules.ts
```

### Features
- Random audit selection
- Pre-bill vs post-bill audits
- Audit findings documentation
- Compliance scoring by coder
- Education recommendations

## 5.6 Documentation Queries

### Files to Create
```
src/app/(dashboard)/queries/page.tsx
src/components/queries/QueryForm.tsx
src/components/queries/QueryTable.tsx
src/components/queries/QueryTemplate.tsx
src/lib/api/queries.ts
```

### Features
- Create documentation queries
- Query templates by type
- Query status tracking
- Provider response workflow
- Query impact on coding

## Completion Criteria

- [ ] Code search returns accurate results
- [ ] Coder workstation displays documents + codes
- [ ] E/M calculator computes correct levels
- [ ] AI suggestions appear in Hybrid mode
- [ ] Audit workflow tracks compliance
- [ ] Queries can be created and tracked
