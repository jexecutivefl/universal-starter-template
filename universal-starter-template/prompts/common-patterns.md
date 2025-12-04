# Common Pattern Prompts

Prompts for implementing common application patterns.

---

## Multi-Tenancy Setup

```
Implement multi-tenancy with organization-level data isolation:

## Data Models

Organization model:
- name, slug, domain
- logoUrl, settings (JSON)
- status (active/inactive/suspended)
- stripeCustomerId, subscriptionStatus
- createdAt, updatedAt

OrganizationMember model:
- organizationId, userId
- role (owner/admin/member/viewer)
- invitedBy, invitedAt, joinedAt
- status (pending/active/suspended)

OrganizationInvite model:
- organizationId, email
- role, invitedById, expiresAt
- status (pending/accepted/expired/revoked)

## API Layer

Create lib/api/organization.ts:
- useOrganization() - current org details
- useOrganizations() - all user's orgs
- useOrganizationMembers() - list members
- useInviteMember() - send invite
- useUpdateMemberRole() - change role
- useRemoveMember() - remove from org

Create lib/context/organization-context.tsx:
- Current organization state
- Organization switcher logic
- Inject organizationId into all queries

## UI Components

1. components/organization/org-switcher.tsx
   - Dropdown showing current org
   - List of user's organizations
   - Create new org option
   - Org settings link

2. components/organization/org-settings.tsx
   - Organization name, logo, domain
   - Billing settings link
   - Danger zone (delete org)

3. components/organization/members-list.tsx
   - Table of members
   - Role badges
   - Invite button
   - Remove/change role actions

4. components/organization/invite-dialog.tsx
   - Email input
   - Role selector
   - Send invite button

## Middleware

Create lib/middleware/org-middleware.ts:
- Verify user has access to requested org
- Inject organizationId into queries
- Handle org-scoped routes

## Pages

- app/(dashboard)/settings/organization/page.tsx
- app/(dashboard)/settings/members/page.tsx
- app/accept-invite/[token]/page.tsx

Every data query must filter by organizationId.
Never expose data across organizations.
Log all access for audit.
```

---

## Notification System

```
Build a complete notification system:

## Data Model

Notification:
- organizationId, userId
- type (info/success/warning/error/action_required)
- category (order/payment/system/user/etc.)
- title, message, link, linkLabel
- read, readAt, dismissed, dismissedAt
- metadata (JSON), createdAt

NotificationPreference:
- userId, channel (in_app/email/push)
- category, enabled
- frequency (instant/daily/weekly)

## API Layer

Create lib/api/notifications.ts:
- useNotifications(unreadOnly?) - list
- useMarkAsRead(id) - single
- useMarkAllAsRead() - all
- useDismissNotification(id)
- useNotificationPreferences()
- useUpdatePreferences()

## Real-time Updates

Create lib/hooks/use-realtime-notifications.ts:
- Subscribe to new notifications
- Update badge count
- Show toast for important ones

## UI Components

1. components/notifications/notification-bell.tsx
   - Bell icon with badge count
   - Dropdown on click
   - Recent notifications list
   - "View all" link

2. components/notifications/notification-item.tsx
   - Icon based on type
   - Title and preview
   - Timestamp (relative)
   - Click to view/act
   - Mark as read on hover

3. components/notifications/notification-center.tsx
   - Full notification list
   - Tabs: All | Unread | Action Required
   - Mark all as read button
   - Filter by category
   - Date grouping

4. components/notifications/preferences-form.tsx
   - Toggle per category + channel
   - Frequency settings
   - Quiet hours (optional)

5. app/(dashboard)/notifications/page.tsx
   - Full notification center
   - Preferences link

## Sending Notifications

Create lib/notifications/send.ts:
- createNotification(data) - create in DB
- notifyUser(userId, notification) - with preferences
- notifyOrganization(orgId, notification) - all members

Make notifications feel helpful, not annoying.
Respect user preferences.
Group similar notifications.
```

---

## Search & Filtering

```
Implement advanced search and filtering:

## Components

1. components/search/global-search.tsx
   - Command palette (Cmd+K)
   - Search across all entities
   - Recent searches
   - Quick actions
   - Keyboard navigation

2. components/search/search-input.tsx
   - Debounced input
   - Clear button
   - Loading indicator
   - Search icon

3. components/search/filter-bar.tsx
   - Active filters display
   - Clear all button
   - Save filter set

4. components/search/filter-dropdown.tsx
   - Multi-select for enums
   - Date range picker
   - Number range
   - Boolean toggle

5. components/search/saved-filters.tsx
   - Save current filters
   - Name the filter set
   - Load saved filters
   - Share with team

## Implementation

Create lib/hooks/use-filters.ts:
- Manage filter state
- Serialize to URL params
- Deserialize from URL
- Reset filters

Create lib/hooks/use-search.ts:
- Debounced search
- Search history
- Search suggestions

## URL Persistence

Filters persist in URL:
?search=keyword&status=active,pending&dateFrom=2024-01-01&sort=name:asc

Benefits:
- Shareable links
- Browser back/forward works
- Bookmarkable searches

## Search UX

- Instant results as you type (debounced)
- Highlight matching text
- Show result count
- Empty state with suggestions
- Recent searches

Make search feel instant and powerful.
```

---

## Audit Logging

```
Implement comprehensive audit logging:

## Data Model

AuditLog:
- organizationId, userId
- action (created/updated/deleted/viewed/exported/etc.)
- entityType, entityId
- previousValue (JSON), newValue (JSON)
- metadata (JSON) - IP, user agent, location
- createdAt

## Backend

Create lib/audit/logger.ts:
- logAction(action, entity, changes, metadata)
- Automatically captures user, org, timestamp
- Diffs previous vs new values

Create lib/audit/middleware.ts:
- Wrap mutations with logging
- Capture request metadata

## Integration

Add to all mutations:
```typescript
const result = await createUser(data);
await logAction('created', 'User', null, result, { source: 'web' });
```

Or use decorator pattern:
```typescript
const createUser = withAuditLog('created', 'User')(async (data) => {
  return await client.models.User.create(data);
});
```

## UI Components

1. components/audit/activity-timeline.tsx
   - Vertical timeline of changes
   - User avatar, action, timestamp
   - Expand to see details
   - Filter by action type

2. components/audit/change-diff.tsx
   - Side-by-side diff view
   - Highlight changed fields
   - JSON diff for complex fields

3. components/audit/audit-table.tsx
   - Full audit log table
   - Filter by entity, user, action, date
   - Export capability

4. app/(dashboard)/settings/audit-log/page.tsx
   - Organization-wide audit log
   - Advanced filters
   - Date range picker
   - Export to CSV

## Privacy

- Mask sensitive fields in logs
- Retention policy (e.g., 90 days)
- Role-based access to audit logs
- Anonymize on user deletion

Log everything important.
Make it searchable and exportable.
Respect data retention policies.
```

---

## Settings & Preferences

```
Build a comprehensive settings system:

## Data Models

Setting (organization-level):
- organizationId, key, value (JSON)
- type (string/number/boolean/json)
- description, updatedAt, updatedById

UserPreference (user-level):
- userId, key, value (JSON)
- updatedAt

## API Layer

Create lib/api/settings.ts:
- useSettings() - all org settings
- useSetting(key) - single setting
- useUpdateSetting(key, value)

Create lib/api/preferences.ts:
- usePreferences() - all user prefs
- usePreference(key) - single pref
- useUpdatePreference(key, value)

## Settings Structure

Organization settings:
- General: name, logo, timezone
- Billing: plan, payment method
- Security: MFA required, session timeout
- Notifications: defaults for org
- Integrations: API keys, webhooks
- AI: operating mode, thresholds

User preferences:
- Theme: light/dark/system
- Notifications: per-category toggles
- Dashboard: default view, widgets
- Table: columns, page size
- Locale: language, date format

## UI Components

1. components/settings/settings-nav.tsx
   - Sidebar navigation for settings
   - Groups: General, Team, Billing, etc.
   - Active state indication

2. components/settings/settings-section.tsx
   - Card with title, description
   - Form fields
   - Save button

3. components/settings/theme-toggle.tsx
   - Light/dark/system options
   - Icon-based toggle
   - Persists to preference

4. app/(dashboard)/settings/layout.tsx
   - Settings page layout
   - Sidebar navigation
   - Content area

5. app/(dashboard)/settings/general/page.tsx
   - General settings form

6. app/(dashboard)/settings/profile/page.tsx
   - User profile settings

## Theme Support

Create lib/theme/theme-provider.tsx:
- next-themes integration
- System preference detection
- Persist to user preference
- Apply theme class to body

Make settings intuitive and organized.
Auto-save where appropriate.
Show success feedback.
```

---

## File Upload & Storage

```
Implement file upload with S3 storage:

## Data Model

StoredFile:
- organizationId
- filename, originalName, mimeType, size
- s3Key, s3Bucket, presignedUrl, presignedUrlExpiry
- entityType, entityId (what it's attached to)
- uploadedById, createdAt

## Backend

Create lib/storage/s3.ts:
- getUploadUrl(filename, mimeType) - presigned PUT URL
- getDownloadUrl(s3Key) - presigned GET URL
- deleteFile(s3Key) - remove from S3

Create lib/api/files.ts:
- useFiles(entityType, entityId) - list for entity
- useUploadFile() - upload mutation
- useDeleteFile() - delete mutation

## UI Components

1. components/files/upload-zone.tsx
   - Drag and drop area
   - Click to select files
   - File type restrictions
   - Size limit display
   - Multiple file support

2. components/files/upload-progress.tsx
   - Progress bar per file
   - Cancel button
   - Retry on failure
   - Success checkmark

3. components/files/file-list.tsx
   - Grid or list view toggle
   - Thumbnail for images
   - Icon for other types
   - File name, size, date
   - Download/delete actions

4. components/files/file-preview.tsx
   - Modal preview for images
   - PDF viewer
   - Download button
   - Full-screen option

5. components/files/file-picker.tsx
   - Select existing files
   - Or upload new
   - Used in forms

## Upload Flow

1. User drops file
2. Get presigned URL from backend
3. Upload directly to S3
4. Create StoredFile record
5. Associate with entity

## Security

- Validate file types server-side
- Limit file sizes
- Scan for malware (optional)
- Private bucket with presigned URLs
- Expire presigned URLs quickly

Make uploads feel fast and reliable.
Show clear progress.
Handle errors gracefully.
```
