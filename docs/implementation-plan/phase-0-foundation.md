# Phase 0: Foundation & Infrastructure

## 0.1 Project Setup

### Tasks
- Install dependencies: `shadcn/ui`, `react-hook-form`, `zod`, `@tanstack/react-query`, `date-fns`, `recharts`
- Configure Tailwind with shadcn/ui theme
- Set up path aliases in `tsconfig.json`
- Deploy Amplify backend with existing data models

### Files to Create
```
src/lib/utils.ts              # cn() helper, formatters
src/lib/constants.ts          # App-wide constants
src/lib/validations/index.ts  # Base Zod schemas
```

## 0.2 Authentication UI

### Tasks
- Login page with email/password
- Registration page
- Password reset flow
- Protected route wrapper

### Files to Create
```
src/app/(auth)/login/page.tsx
src/app/(auth)/register/page.tsx
src/app/(auth)/forgot-password/page.tsx
src/app/(auth)/reset-password/page.tsx
src/components/auth/AuthGuard.tsx
src/lib/hooks/useAuth.ts
```

## 0.3 Core UI Components

### Tasks
- Install shadcn/ui components: button, input, form, dialog, table, card, tabs, dropdown-menu, toast, badge, select, checkbox, date-picker
- Create layout components

### Files to Create
```
src/components/ui/[shadcn components]
src/components/layout/Sidebar.tsx
src/components/layout/Header.tsx
src/components/layout/DashboardLayout.tsx
src/components/layout/PageHeader.tsx
```

## 0.4 Data Layer Setup

### Tasks
- Configure Amplify client
- Create typed API client wrapper
- Set up React Query provider
- Create base CRUD hooks pattern

### Files to Create
```
src/lib/amplify/client.ts
src/lib/amplify/config.ts
src/lib/api/index.ts
src/lib/hooks/useQuery.ts       # Wrapper around React Query
src/lib/hooks/useMutation.ts
src/app/providers.tsx           # QueryClientProvider, etc.
```

## 0.5 Shared Components

### Tasks
- Data table with sorting, filtering, pagination
- Form field wrappers (text, select, date, currency)
- Confirmation dialog
- Loading states
- Empty states
- Error boundary

### Files to Create
```
src/components/tables/DataTable.tsx
src/components/tables/DataTablePagination.tsx
src/components/tables/DataTableFilters.tsx
src/components/forms/FormField.tsx
src/components/forms/CurrencyInput.tsx
src/components/forms/DatePicker.tsx
src/components/shared/ConfirmDialog.tsx
src/components/shared/LoadingSpinner.tsx
src/components/shared/EmptyState.tsx
src/components/shared/ErrorBoundary.tsx
```

## 0.6 Dashboard Shell

### Tasks
- Main dashboard layout with sidebar navigation
- Role-based menu items
- User dropdown with logout
- Breadcrumb navigation

### Files to Create
```
src/app/(dashboard)/layout.tsx
src/app/(dashboard)/page.tsx           # Dashboard home
src/components/layout/NavMenu.tsx
src/components/layout/UserMenu.tsx
src/components/layout/Breadcrumbs.tsx
src/lib/navigation.ts                  # Menu config by role
```

## Completion Criteria

- [ ] User can register, login, logout
- [ ] Protected routes redirect to login
- [ ] Dashboard shell renders with navigation
- [ ] Data table component works with sample data
- [ ] Forms submit and validate correctly
- [ ] Toast notifications display
