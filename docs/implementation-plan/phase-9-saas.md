# Phase 9: SaaS & Multi-Tenancy

Public availability, subscriptions, and onboarding.

## 9.1 Public Marketing Site

### Files to Create
```
src/app/(marketing)/page.tsx              # Landing page
src/app/(marketing)/features/page.tsx
src/app/(marketing)/pricing/page.tsx
src/app/(marketing)/contact/page.tsx
src/app/(marketing)/layout.tsx
src/components/marketing/Hero.tsx
src/components/marketing/FeatureGrid.tsx
src/components/marketing/PricingTable.tsx
src/components/marketing/Testimonials.tsx
src/components/marketing/CTASection.tsx
```

### Features
- Product overview
- Feature highlights
- Pricing tiers
- Contact form
- Demo request

## 9.2 Subscription Management

### Models Used
- `Subscription`, `SubscriptionPlan`, `UsageRecord`

### Files to Create
```
src/app/(dashboard)/settings/subscription/page.tsx
src/components/settings/PlanSelector.tsx
src/components/settings/UsageDisplay.tsx
src/components/settings/BillingHistory.tsx
src/lib/api/subscriptions.ts
src/lib/payments/stripe-subscriptions.ts
```

### Features
- View current plan
- Upgrade/downgrade plan
- Usage tracking display
- Payment method management
- Invoice history

## 9.3 Self-Service Onboarding

### Files to Create
```
src/app/onboarding/page.tsx
src/app/onboarding/company/page.tsx
src/app/onboarding/payment/page.tsx
src/app/onboarding/setup/page.tsx
src/components/onboarding/OnboardingWizard.tsx
src/components/onboarding/CompanyForm.tsx
src/components/onboarding/PaymentSetup.tsx
src/components/onboarding/InitialConfig.tsx
src/lib/api/onboarding.ts
```

### Flow
1. Create account
2. Company information
3. Payment setup
4. Initial configuration
5. First client setup
6. Tutorial/walkthrough

## 9.4 Tenant Provisioning

### Files to Create
```
amplify/functions/tenant-provisioner/handler.ts
src/lib/tenancy/tenant-context.ts
src/lib/tenancy/data-isolation.ts
src/lib/hooks/useTenant.ts
```

### Features
- Automatic tenant ID assignment
- Data isolation enforcement
- Tenant-specific S3 prefixes
- Tenant configuration defaults

## 9.5 Usage Tracking & Metering

### Files to Create
```
amplify/functions/usage-tracker/handler.ts
src/lib/usage/meters.ts
src/lib/usage/limits.ts
src/components/usage/UsageBar.tsx
src/components/usage/LimitWarning.tsx
```

### Meters
- Claims submitted
- Documents processed
- AI agent invocations
- Storage used
- API calls

### Features
- Real-time usage tracking
- Limit enforcement
- Overage handling
- Usage alerts

## 9.6 Plan-Based Feature Gating

### Files to Create
```
src/lib/features/feature-flags.ts
src/lib/features/plan-features.ts
src/components/shared/FeatureGate.tsx
src/components/shared/UpgradePrompt.tsx
src/lib/hooks/useFeature.ts
```

### Plan Tiers
```
Starter:    Manual mode only, 1 user, 100 claims/mo
Professional: Hybrid mode, 5 users, 500 claims/mo
Enterprise:  Full AI, unlimited users, unlimited claims
```

### Features
- Feature availability by plan
- Graceful feature gating UI
- Upgrade prompts
- Trial period handling

## 9.7 Admin Console

### Files to Create
```
src/app/admin/page.tsx
src/app/admin/tenants/page.tsx
src/app/admin/tenants/[id]/page.tsx
src/app/admin/subscriptions/page.tsx
src/app/admin/usage/page.tsx
src/components/admin/TenantTable.tsx
src/components/admin/TenantDetail.tsx
src/components/admin/SystemMetrics.tsx
src/lib/api/admin.ts
```

### Features
- View all tenants
- Tenant health metrics
- Manual plan adjustments
- Usage overrides
- System-wide analytics
- Support access to tenant data

## 9.8 Compliance & Security Hardening

### Files to Create
```
src/lib/security/audit-log.ts
src/lib/security/session-management.ts
src/lib/security/phi-access-log.ts
amplify/functions/audit-exporter/handler.ts
```

### Features
- Comprehensive audit logging
- Session timeout enforcement
- PHI access logging
- Audit log export (for compliance)
- BAA documentation

## Completion Criteria

- [ ] Marketing site live
- [ ] Self-service signup works
- [ ] Subscription plans enforced
- [ ] Usage tracking accurate
- [ ] Features gated by plan
- [ ] Admin console operational
- [ ] Audit logs complete
