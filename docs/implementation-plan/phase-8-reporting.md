# Phase 8: Reporting & Analytics

Dashboards, reports, and KPIs.

## 8.1 Reporting Infrastructure

### Files to Create
```
src/lib/reporting/query-builder.ts
src/lib/reporting/aggregations.ts
src/lib/reporting/date-ranges.ts
src/lib/reporting/export.ts
amplify/functions/report-generator/handler.ts
```

### Features
- Date range presets (MTD, YTD, custom)
- Grouping (by payer, provider, location)
- Aggregation functions
- Export to CSV/Excel/PDF

## 8.2 Executive Dashboard

### Files to Create
```
src/app/(dashboard)/analytics/page.tsx
src/components/analytics/KPICard.tsx
src/components/analytics/TrendChart.tsx
src/components/analytics/ComparisonWidget.tsx
src/lib/api/analytics.ts
```

### KPIs
- Total collections (period)
- Net collection rate
- Days in A/R
- Denial rate
- Clean claim rate
- First-pass resolution rate

## 8.3 A/R Aging Report

### Files to Create
```
src/app/(dashboard)/reports/ar-aging/page.tsx
src/components/reports/ARAgingTable.tsx
src/components/reports/ARAgingChart.tsx
src/components/reports/AgingBuckets.tsx
```

### Features
- Aging buckets (0-30, 31-60, 61-90, 91-120, 120+)
- By payer breakdown
- By provider breakdown
- Drill-down to claims
- Trend over time

## 8.4 Denial Analysis

### Files to Create
```
src/app/(dashboard)/reports/denials/page.tsx
src/components/reports/DenialsByReason.tsx
src/components/reports/DenialsByPayer.tsx
src/components/reports/DenialTrends.tsx
src/components/reports/TopDenialCodes.tsx
```

### Features
- Denial rate by payer
- Denial rate by reason code
- Denial amount trends
- Appeal success rate
- Root cause analysis

## 8.5 Production Reports

### Files to Create
```
src/app/(dashboard)/reports/production/page.tsx
src/components/reports/ProductionSummary.tsx
src/components/reports/ProviderProduction.tsx
src/components/reports/ProcedureMix.tsx
src/components/reports/PayerMix.tsx
```

### Features
- Charges by provider
- Collections by provider
- Procedure code analysis
- Payer mix percentages
- RVU tracking

## 8.6 Billing Company Reports

### Files to Create
```
src/app/(dashboard)/reports/billing-company/page.tsx
src/components/reports/ClientSummary.tsx
src/components/reports/FeeRevenue.tsx
src/components/reports/ClientPerformance.tsx
```

### Features
- Revenue by client
- Fee calculation summary
- Collection performance by client
- Invoice aging
- Client profitability

## 8.7 Custom Report Builder

### Files to Create
```
src/app/(dashboard)/reports/builder/page.tsx
src/components/reports/ReportBuilder.tsx
src/components/reports/FieldSelector.tsx
src/components/reports/FilterBuilder.tsx
src/components/reports/SavedReports.tsx
src/lib/api/saved-reports.ts
```

### Features
- Select fields from available data
- Apply filters
- Choose grouping
- Save report definitions
- Schedule report delivery

## 8.8 Scheduled Reports

### Files to Create
```
src/app/(dashboard)/settings/scheduled-reports/page.tsx
src/components/settings/ScheduleForm.tsx
src/components/settings/DeliveryConfig.tsx
amplify/functions/scheduled-report-runner/handler.ts
```

### Features
- Daily/weekly/monthly schedules
- Email delivery
- S3 storage
- Multiple recipients
- Format selection

## Completion Criteria

- [ ] Executive dashboard shows key KPIs
- [ ] A/R aging displays accurate buckets
- [ ] Denial analysis identifies problem areas
- [ ] Production reports track provider output
- [ ] Custom reports can be built and saved
- [ ] Scheduled reports deliver automatically
