# Phase 6: Practice Management

Scheduling, providers, and locations.

## 6.1 Provider Management

### Models Used
- Provider information (linked to DoctorClient)

### Files to Create
```
src/app/(dashboard)/providers/page.tsx
src/app/(dashboard)/providers/[id]/page.tsx
src/components/providers/ProviderForm.tsx
src/components/providers/ProviderTable.tsx
src/components/providers/CredentialsPanel.tsx
src/lib/api/providers.ts
src/lib/validations/provider.ts
```

### Features
- Provider demographics
- NPI, licenses, credentials
- Specialty information
- Linked locations
- Schedule assignment

## 6.2 Location Management

### Files to Create
```
src/app/(dashboard)/locations/page.tsx
src/app/(dashboard)/locations/[id]/page.tsx
src/components/locations/LocationForm.tsx
src/components/locations/LocationTable.tsx
src/lib/api/locations.ts
src/lib/validations/location.ts
```

### Features
- Practice locations
- Address, phone, fax
- Place of service codes
- Operating hours
- Assigned providers

## 6.3 Schedule Templates

### Models Used
- `ProviderScheduleTemplate`
- `ScheduleBlock`

### Files to Create
```
src/app/(dashboard)/schedules/templates/page.tsx
src/components/schedules/TemplateEditor.tsx
src/components/schedules/TimeSlotGrid.tsx
src/components/schedules/BlockTypeSelector.tsx
src/lib/api/schedule-templates.ts
```

### Features
- Weekly schedule templates
- Appointment slot duration
- Block types (available, blocked, lunch)
- Apply template to date ranges
- Provider-specific templates

## 6.4 Appointment Scheduling

### Models Used
- `Appointment`
- `Waitlist`

### Files to Create
```
src/app/(dashboard)/appointments/page.tsx
src/app/(dashboard)/appointments/calendar/page.tsx
src/components/appointments/AppointmentCalendar.tsx
src/components/appointments/AppointmentForm.tsx
src/components/appointments/AppointmentSlot.tsx
src/components/appointments/DayView.tsx
src/components/appointments/WeekView.tsx
src/components/appointments/PatientLookup.tsx
src/lib/api/appointments.ts
src/lib/validations/appointment.ts
```

### Features
- Calendar view (day, week, month)
- Drag-drop rescheduling
- Appointment types (new, follow-up, procedure)
- Patient search & select
- Appointment status (scheduled, confirmed, arrived, no-show)
- Recurring appointments

## 6.5 Waitlist Management

### Files to Create
```
src/app/(dashboard)/appointments/waitlist/page.tsx
src/components/appointments/WaitlistTable.tsx
src/components/appointments/WaitlistForm.tsx
src/components/appointments/SlotFinder.tsx
src/lib/api/waitlist.ts
```

### Features
- Add patients to waitlist
- Preferred times/providers
- Auto-match to cancellations
- Waitlist notifications
- Priority ordering

## 6.6 Appointment Reminders

### Files to Create
```
amplify/functions/appointment-reminder/handler.ts
src/app/(dashboard)/settings/reminders/page.tsx
src/components/settings/ReminderConfig.tsx
src/lib/api/reminders.ts
```

### Features
- SMS/email reminders
- Configurable timing (24hr, 48hr, 1 week)
- Confirmation requests
- No-show follow-up

## Completion Criteria

- [ ] Providers and locations manageable
- [ ] Schedule templates create available slots
- [ ] Calendar displays appointments
- [ ] Appointments can be created/edited
- [ ] Waitlist tracks patients wanting earlier slots
- [ ] Reminders send at configured times
