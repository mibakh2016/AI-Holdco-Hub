

## Plan: Make Shareholders Table Text Black

The table text currently uses muted/gray colors from the design system. The fix is straightforward:

**File: `src/pages/AdminShareholders.tsx`**
- Remove `text-muted-foreground` classes from table cells (email, joined date)
- Update the `text-table` utility or add `text-foreground` to all `TableCell` elements so text renders in black/dark color

**File: `src/index.css`**
- Update the `.text-table` utility class to use `color: hsl(var(--foreground))` instead of inheriting the muted paragraph color from the base `p, td, th` rule

This will make all table content use the primary dark foreground color instead of the muted gray.

