# Phase 7: Patient Portal

Self-service portal for patients.

## 7.1 Portal Authentication

### Files to Create
```
src/app/portal/(auth)/login/page.tsx
src/app/portal/(auth)/register/page.tsx
src/app/portal/(auth)/verify/page.tsx
src/components/portal/PortalAuthGuard.tsx
src/lib/auth/patient-auth.ts
```

### Features
- Patient registration with verification
- Email/phone verification
- Password requirements
- Portal-specific Cognito user pool or group

## 7.2 Portal Layout

### Files to Create
```
src/app/portal/(dashboard)/layout.tsx
src/app/portal/(dashboard)/page.tsx
src/components/portal/PortalHeader.tsx
src/components/portal/PortalNav.tsx
src/components/portal/PortalFooter.tsx
```

### Navigation
- Dashboard (home)
- My Health Records
- Appointments
- Messages
- Billing & Payments
- Profile

## 7.3 Health Records Access

### Files to Create
```
src/app/portal/(dashboard)/records/page.tsx
src/app/portal/(dashboard)/records/[type]/page.tsx
src/components/portal/RecordsList.tsx
src/components/portal/RecordViewer.tsx
src/components/portal/DownloadButton.tsx
src/lib/api/portal/records.ts
```

### Features
- View visit summaries
- Lab results display
- Medication list
- Immunization records
- Download records (PDF)

## 7.4 Appointment Self-Scheduling

### Files to Create
```
src/app/portal/(dashboard)/appointments/page.tsx
src/app/portal/(dashboard)/appointments/schedule/page.tsx
src/components/portal/AppointmentList.tsx
src/components/portal/ScheduleWizard.tsx
src/components/portal/ProviderPicker.tsx
src/components/portal/TimeslotPicker.tsx
src/lib/api/portal/appointments.ts
```

### Features
- View upcoming appointments
- View past appointments
- Schedule new appointment
- Cancel/reschedule existing
- Appointment type selection
- Provider preference

## 7.5 Secure Messaging

### Files to Create
```
src/app/portal/(dashboard)/messages/page.tsx
src/app/portal/(dashboard)/messages/[threadId]/page.tsx
src/components/portal/MessageList.tsx
src/components/portal/MessageThread.tsx
src/components/portal/ComposeMessage.tsx
src/lib/api/portal/messages.ts
```

### Features
- Inbox/sent organization
- Compose new message
- Reply to messages
- Message categories (billing, clinical, general)
- Read receipts
- File attachments

## 7.6 Patient Billing & Payments

### Models Used
- `Payment`, `PaymentPlan`, `StoredPaymentMethod`

### Files to Create
```
src/app/portal/(dashboard)/billing/page.tsx
src/app/portal/(dashboard)/billing/pay/page.tsx
src/components/portal/StatementList.tsx
src/components/portal/StatementDetail.tsx
src/components/portal/PaymentForm.tsx
src/components/portal/PaymentHistory.tsx
src/components/portal/PaymentPlanSetup.tsx
src/lib/api/portal/billing.ts
src/lib/payments/stripe-client.ts
```

### Features
- View statements
- Outstanding balance display
- Make payment (card, ACH)
- Save payment methods
- Set up payment plan
- Payment history

## 7.7 Profile Management

### Files to Create
```
src/app/portal/(dashboard)/profile/page.tsx
src/components/portal/ProfileForm.tsx
src/components/portal/InsuranceCard.tsx
src/components/portal/PreferencesForm.tsx
src/lib/api/portal/profile.ts
```

### Features
- Update demographics
- Update contact info
- View/update insurance
- Communication preferences
- Password change

## Completion Criteria

- [ ] Patients can register and login
- [ ] Health records viewable and downloadable
- [ ] Appointments can be self-scheduled
- [ ] Secure messaging works bidirectionally
- [ ] Payments can be made online
- [ ] Profile information editable
