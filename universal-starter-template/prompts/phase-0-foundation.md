# Phase 0: Foundation Prompts

Pre-written prompts for Claude Code to implement foundation phase tasks.

---

## 0.1 Install shadcn/ui Components

```
Install shadcn/ui with the following components:
- button
- input
- label
- card
- dialog
- dropdown-menu
- table
- tabs
- form
- toast (using sonner)
- skeleton
- avatar
- badge
- separator

Use the default style (New York) and neutral color palette.
Ensure components are placed in components/ui/.
After installation, verify each component imports correctly.
```

---

## 0.2 Set Up Form Handling

```
Set up form handling infrastructure:

1. Ensure react-hook-form and @hookform/resolvers are installed
2. Ensure zod is installed for validation
3. Create lib/validations/common.ts with these base schemas:
   - emailSchema
   - passwordSchema (with strength validation)
   - phoneSchema
   - addressSchema
   - paginationSchema

4. Create a form wrapper component at components/forms/form-field.tsx that:
   - Integrates with react-hook-form
   - Shows validation errors
   - Supports different input types
   - Has proper accessibility

5. Create an example form at components/forms/example-form.tsx

Make forms feel polished with proper error states and loading indicators.
```

---

## 0.3 Create Layout Components

```
Create the main layout components for the dashboard:

1. components/layout/sidebar.tsx
   - Collapsible sidebar navigation
   - Logo area at top
   - Navigation links with icons (use lucide-react)
   - User menu at bottom
   - Responsive: drawer on mobile, fixed on desktop

2. components/layout/header.tsx
   - Breadcrumb navigation
   - Search input (placeholder for now)
   - Notifications bell (placeholder)
   - User dropdown menu

3. components/layout/main-layout.tsx
   - Combines sidebar + header + main content area
   - Handles responsive behavior
   - Provides consistent spacing

4. components/layout/page-header.tsx
   - Reusable page title + description + actions component

Use CSS variables for theming. Support dark mode.
Make it feel like a premium SaaS product.
```

---

## 0.4 Authentication UI

```
Build the complete authentication UI:

1. app/(auth)/layout.tsx
   - Centered card layout
   - Logo at top
   - Clean, minimal design

2. app/(auth)/login/page.tsx
   - Email and password fields
   - "Remember me" checkbox
   - "Forgot password" link
   - "Sign up" link
   - Error handling with toast notifications
   - Loading state during submission

3. app/(auth)/register/page.tsx
   - First name, last name, email, password, confirm password
   - Password strength indicator
   - Terms acceptance checkbox
   - Already have account? Sign in link

4. app/(auth)/forgot-password/page.tsx
   - Email input
   - Send reset link button
   - Back to login link

5. app/(auth)/reset-password/page.tsx
   - Verification code input
   - New password + confirm
   - Password requirements displayed

6. lib/auth/auth-provider.tsx
   - Auth context with Amplify
   - User state management
   - Session refresh logic

7. components/auth/protected-route.tsx
   - Redirect to login if not authenticated
   - Loading state while checking auth

Use the validation schemas from lib/validations/common.ts.
Integrate with Amplify Auth (getCurrentUser, signIn, signUp, etc.).
Make the experience feel smooth and professional.
```

---

## 0.5 Data Layer Setup

```
Set up the data layer for API calls:

1. lib/api/client.ts
   - Export typed Amplify client
   - Error handling wrapper
   - Retry logic for network errors

2. lib/api/hooks.ts
   - useQuery wrapper with TanStack Query
   - useMutation wrapper with optimistic updates
   - useInfiniteQuery for pagination
   - Common query keys factory

3. lib/api/types.ts
   - Common API response types
   - Error types
   - Pagination types

4. Example usage in lib/api/users.ts:
   - useUsers() - list with pagination
   - useUser(id) - single user
   - useCreateUser() - create mutation
   - useUpdateUser() - update mutation
   - useDeleteUser() - delete mutation

5. Providers setup in app/providers.tsx:
   - QueryClientProvider
   - AuthProvider

Set up proper error handling and loading states.
Include examples of optimistic updates.
```

---

## 0.6 Dashboard Home

```
Build the dashboard home page:

1. app/(dashboard)/layout.tsx
   - Use MainLayout from components/layout
   - Apply ProtectedRoute wrapper
   - Set up providers

2. app/(dashboard)/page.tsx
   - Welcome message with user's name
   - Quick stats cards row (placeholder data):
     - Total items
     - Pending items
     - Completed today
     - Revenue/value
   - Recent activity list (placeholder)
   - Quick actions section

3. components/dashboard/stats-card.tsx
   - Icon
   - Label
   - Value with optional trend indicator
   - Click action

4. components/dashboard/activity-feed.tsx
   - List of recent activities
   - Timestamp
   - User avatar
   - Action description

5. components/dashboard/quick-actions.tsx
   - Grid of common action buttons
   - Icons and labels

Use skeleton loading states while data loads.
Make it feel like a polished SaaS dashboard.
The layout should work well on mobile and desktop.
```

---

## 0.7 Shared Components

```
Create essential shared components:

1. components/shared/data-table.tsx
   - Uses @tanstack/react-table
   - Sortable columns
   - Pagination
   - Row selection
   - Column visibility toggle
   - Search/filter input
   - Empty state
   - Loading skeleton

2. components/shared/empty-state.tsx
   - Icon
   - Title
   - Description
   - Call to action button

3. components/shared/loading-spinner.tsx
   - Multiple sizes
   - Optional label

4. components/shared/confirm-dialog.tsx
   - Title, description
   - Cancel and confirm buttons
   - Destructive variant
   - Loading state

5. components/shared/error-boundary.tsx
   - Catches React errors
   - Shows friendly error message
   - Reset/retry button

6. components/shared/page-skeleton.tsx
   - Full page loading skeleton
   - Matches common page layouts

7. components/shared/copy-button.tsx
   - Click to copy
   - Success feedback

Make components composable and accessible.
Include proper TypeScript types.
```
