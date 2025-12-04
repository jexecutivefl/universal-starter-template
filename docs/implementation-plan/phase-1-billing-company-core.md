# Phase 1: Billing Company Core

Primary business entities for a medical billing company.

## 1.1 Doctor Client Management

### Models Used
- `DoctorClient` - The doctors/practices being serviced
- `ClientContract` - Service agreements with fee structures

### API Operations
```
listDoctorClients, getDoctorClient, createDoctorClient, updateDoctorClient
listClientContracts, createClientContract, updateClientContract
```

### Files to Create
```
src/app/(dashboard)/clients/page.tsx              # Client list
src/app/(dashboard)/clients/[id]/page.tsx         # Client detail
src/app/(dashboard)/clients/new/page.tsx          # Create client
src/components/clients/ClientForm.tsx
src/components/clients/ClientTable.tsx
src/components/clients/ContractForm.tsx
src/lib/api/clients.ts
src/lib/validations/client.ts
```

### Features
- List clients with search/filter
- Create/edit client with practice info
- Manage contracts (fee %, effective dates)
- Client status (active, onboarding, churned)

## 1.2 Email Account Configuration

### Models Used
- `MonitoredEmailAccount` - Email accounts to watch for documents

### Files to Create
```
src/app/(dashboard)/settings/email-accounts/page.tsx
src/components/settings/EmailAccountForm.tsx
src/components/settings/EmailAccountTable.tsx
src/lib/api/email-accounts.ts
src/lib/validations/email-account.ts
```

### Features
- Configure email accounts (IMAP, Gmail, Outlook)
- Map accounts to doctor clients
- Test connection
- Enable/disable monitoring

## 1.3 Document Management

### Models Used
- `IngestedDocument` - Documents extracted from emails
- S3 storage for actual files

### Files to Create
```
src/app/(dashboard)/documents/page.tsx
src/app/(dashboard)/documents/[id]/page.tsx
src/components/documents/DocumentTable.tsx
src/components/documents/DocumentViewer.tsx
src/components/documents/DocumentUpload.tsx
src/lib/api/documents.ts
src/lib/storage/s3.ts
```

### Features
- List documents by client/date/type
- Manual document upload
- Document preview (PDF, images)
- Document status tracking (pending, processed, error)
- Link documents to claims

## 1.4 Invoice & Fee Management

### Models Used
- `BillingCompanyInvoice` - Invoices to doctor clients
- `ClientContract` - For fee calculation

### Files to Create
```
src/app/(dashboard)/invoices/page.tsx
src/app/(dashboard)/invoices/[id]/page.tsx
src/app/(dashboard)/invoices/new/page.tsx
src/components/invoices/InvoiceForm.tsx
src/components/invoices/InvoiceTable.tsx
src/components/invoices/InvoicePreview.tsx
src/lib/api/invoices.ts
src/lib/validations/invoice.ts
src/lib/utils/invoice-calculations.ts
```

### Features
- Generate invoices based on collections
- Calculate fees per contract terms
- Invoice line items with claim references
- Mark invoices paid/partial
- Invoice PDF generation

## 1.5 User & Role Management

### Models Used
- `User`, `UserRole` (via Cognito + custom attributes)

### Files to Create
```
src/app/(dashboard)/settings/users/page.tsx
src/app/(dashboard)/settings/users/[id]/page.tsx
src/components/settings/UserForm.tsx
src/components/settings/UserTable.tsx
src/lib/api/users.ts
src/lib/validations/user.ts
src/lib/auth/roles.ts
```

### Features
- Invite users via email
- Assign roles (admin, biller, coder, viewer)
- Deactivate users
- Role-based permissions

## Completion Criteria

- [ ] Can create and manage doctor clients
- [ ] Can configure email accounts
- [ ] Can upload and view documents
- [ ] Can generate invoices for collections
- [ ] Can manage users and roles
