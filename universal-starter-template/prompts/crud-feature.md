# CRUD Feature Prompts

Prompts for implementing complete CRUD (Create, Read, Update, Delete) functionality for any entity.

---

## Complete CRUD Implementation

Replace `[Entity]` with your entity name (e.g., `Product`, `Customer`, `Order`).

```
Implement complete CRUD for [Entity]:

## Data Model
Add to amplify/data/resource.ts:
```typescript
[Entity]: a
  .model({
    organizationId: a.id().required(),
    name: a.string().required(),
    // Add your fields here
    status: a.enum(['active', 'inactive', 'archived']),
    createdAt: a.datetime(),
    updatedAt: a.datetime(),
    createdById: a.id(),
  })
  .authorization((allow) => [allow.authenticated()])
```

## API Layer
Create lib/api/[entities].ts with:
- use[Entities]() - list with pagination, filtering, sorting
- use[Entity](id) - get single by ID
- useCreate[Entity]() - create mutation with optimistic update
- useUpdate[Entity]() - update mutation with optimistic update
- useDelete[Entity]() - delete mutation with confirmation

## Validation
Create lib/validations/[entity].ts with:
- create[Entity]Schema - for creation form
- update[Entity]Schema - for edit form
- [entity]FilterSchema - for search/filter

## Pages

### List Page: app/(dashboard)/[entities]/page.tsx
- DataTable with columns for key fields
- Search input
- Status filter dropdown
- Create new button
- Row actions (view, edit, delete)
- Bulk actions if applicable
- Empty state for no results
- Pagination

### Detail Page: app/(dashboard)/[entities]/[id]/page.tsx
- Full [Entity] details in cards
- Edit button
- Delete button with confirmation
- Related entities section if applicable
- Activity/history log if applicable
- Back to list breadcrumb

### Create Page: app/(dashboard)/[entities]/new/page.tsx
- Form with all required fields
- Validation with error messages
- Cancel button (goes back)
- Create button with loading state
- Success toast and redirect to detail page

### Edit Page: app/(dashboard)/[entities]/[id]/edit/page.tsx
- Pre-filled form with current values
- Same validation as create
- Update button with loading state
- Cancel button (discard changes confirmation if dirty)
- Success toast and redirect to detail page

## Components
- components/[entities]/[entity]-form.tsx - shared create/edit form
- components/[entities]/[entity]-card.tsx - card display
- components/[entities]/[entity]-table-columns.tsx - table column definitions
- components/[entities]/[entity]-filters.tsx - filter controls

Make it feel polished:
- Loading skeletons
- Optimistic updates
- Proper error handling
- Accessible forms
- Mobile responsive
```

---

## List Page Only

```
Create a list page for [Entity]:

Location: app/(dashboard)/[entities]/page.tsx

Features:
1. Page header with title and "Create New" button
2. Search input that filters by name/title
3. Filter dropdowns for status and other enum fields
4. DataTable with:
   - Checkbox selection column
   - Key field columns (name, status, date, etc.)
   - Actions column (view, edit, delete)
5. Pagination with page size selector
6. Empty state when no results
7. Loading skeleton while fetching

Use the established DataTable component from components/shared/.
Connect to use[Entities]() hook from lib/api/.
Add breadcrumb: Dashboard > [Entities]

Make the search debounced (300ms).
Persist filters in URL search params.
```

---

## Detail Page Only

```
Create a detail page for [Entity]:

Location: app/(dashboard)/[entities]/[id]/page.tsx

Features:
1. Page header with [Entity] name and actions (Edit, Delete)
2. Breadcrumb: Dashboard > [Entities] > [Entity Name]
3. Main info card with key fields
4. Related data sections (if applicable):
   - Related items list
   - Activity timeline
   - Notes/comments
5. Delete confirmation dialog
6. 404 handling for invalid ID
7. Loading skeleton while fetching

Layout:
- Two-column on desktop (main info + sidebar)
- Single column on mobile

Use use[Entity](id) hook to fetch data.
Add "Back to list" link in breadcrumb.
```

---

## Form Component Only

```
Create a form component for [Entity]:

Location: components/[entities]/[entity]-form.tsx

Props:
- mode: 'create' | 'edit'
- defaultValues?: [Entity] (for edit mode)
- onSubmit: (data) => Promise<void>
- onCancel: () => void
- isLoading: boolean

Features:
1. react-hook-form with Zod validation
2. All required fields with proper types:
   - Text inputs for strings
   - Number inputs for numbers
   - Date picker for dates
   - Select for enums
   - Textarea for long text
3. Field-level error messages
4. Form-level error display
5. Dirty state tracking
6. Cancel confirmation if dirty
7. Submit button with loading state
8. Keyboard navigation (Enter to submit)

Use shadcn/ui form components.
Make labels and placeholders descriptive.
Group related fields logically.
```

---

## Bulk Actions

```
Add bulk actions to [Entity] list:

Modify: app/(dashboard)/[entities]/page.tsx

Features:
1. Checkbox column for row selection
2. "Select all" in header
3. Bulk action bar that appears when items selected:
   - Shows count: "X items selected"
   - Actions: Delete, Change Status, Export
4. Bulk delete with confirmation
5. Bulk status change dropdown
6. Clear selection button

Implementation:
- Track selected IDs in state
- Bulk mutation hooks
- Optimistic updates for better UX
- Error handling with partial success

The bulk action bar should be sticky at bottom on mobile.
```

---

## Export Functionality

```
Add export functionality to [Entity] list:

Features:
1. Export button in page header
2. Export dropdown with formats:
   - CSV
   - Excel (XLSX)
   - JSON
3. Export options dialog:
   - All records or current filter
   - Column selection
   - Date range (if applicable)
4. Download progress indicator
5. Success/error toast

Implementation:
- Client-side export for small datasets
- Server-side export for large datasets (queue + download link)
- Respect current filters

Add to: app/(dashboard)/[entities]/page.tsx
Create: lib/utils/export.ts with export helpers
```
