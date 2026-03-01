

## Auto-Categorization After Document Upload

### What it does
After a PDF is successfully uploaded, the system will automatically analyze the document's filename and send it to an AI-powered backend function that categorizes it into one of the governance document types (e.g., "subscription_agreement", "board_resolution", "financial_report", "shareholder_agreement", "bylaws", "operating_agreement", "annual_report", "tax_document", "general"). The result is written back to the `documents` table and displayed to the user in a post-upload confirmation card.

### Implementation Steps

**1. Create an edge function `categorize-document`**
- Receives the document ID and filename/title
- Calls Lovable AI (Gemini Flash) with a prompt asking it to classify the document based on its title/filename into a predefined category list
- Uses tool calling to extract structured output: `{ category: string, confidence: string }`
- Updates the `documents` row with the returned `document_type`
- Returns the category to the frontend

**2. Update `AdminDocuments.tsx` frontend**
- After successful upload + DB insert, call the `categorize-document` edge function with the new document's ID and title
- Show a post-upload state with a spinner ("Categorizing...") followed by the assigned category displayed in a badge/card
- Handle errors gracefully (if categorization fails, document stays as "general" and user sees a note)

**3. No database schema changes needed**
- The `document_type` column already exists on the `documents` table as a text field, currently defaulting to `"general"`. The AI will update it to a more specific value.

### Technical Details

- **AI model**: `google/gemini-3-flash-preview` via Lovable AI gateway
- **Edge function**: `supabase/functions/categorize-document/index.ts` -- uses `LOVABLE_API_KEY` (already configured) and `SUPABASE_URL` + service role key to update the document row server-side
- **Categories**: subscription_agreement, board_resolution, financial_report, shareholder_agreement, bylaws, operating_agreement, annual_report, tax_document, meeting_minutes, general
- **UI flow**: Upload button -> "Uploading..." -> success -> "Categorizing..." spinner -> category badge with result

