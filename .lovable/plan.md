

## Add a Document Library to the Admin Documents Page

### Problem
Currently `/admin/documents` only has an upload form. There is no way to view, search, or manage previously uploaded documents. The `documents` table already stores all the data needed.

### What will be built

**Below the upload area on the same page**, add a documents table/list that shows all uploaded documents with:

- **Columns**: Title, Category (badge), File size, Status, Upload date, Actions (download/delete)
- **Filtering**: Filter by category dropdown and search by title
- **Sorting**: By date (newest first by default)
- **Download**: Click to open/download the PDF via file_url
- **Delete**: Remove document from DB and storage (with confirmation dialog)

### Implementation

1. **Query documents** -- Add a `useQuery` that fetches from `documents` table ordered by `created_at desc`
2. **Documents table component** -- Render below the upload area using the existing `Table` UI components, with category badges matching the `CATEGORY_LABELS` already defined
3. **Search and filter bar** -- Simple input + select dropdown above the table
4. **Delete mutation** -- Delete from both the `documents` table and `documents` storage bucket
5. **Empty state** -- Show a message when no documents exist yet

### Technical details
- No database changes needed -- the table and columns already exist
- Reuses existing `CATEGORY_LABELS` map already in `AdminDocuments.tsx`
- Uses `@tanstack/react-query` for data fetching (already installed)
- Uses existing `Table`, `Badge`, `Button`, `Select`, `Input` UI components
- Page layout changes from centered upload-only to a full-width layout with upload section at top and document list below

