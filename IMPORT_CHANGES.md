# Excel Import Changes - NAME Column to orders.name

## Summary

Updated the Excel import functionality to save the NAME column to `orders.name`
field instead of putting it in the remark field. Users can now select matched
product_code later via the edit dialog.

## Changes Made

### 1. Import Dialog (`src/app/admin/orders/import-dialog.tsx`)

- **Changed behavior**: NAME column is now always saved to `orders.name` field
- **Auto-matching**: Still attempts to match NAME with product codes for
  convenience
- **Remark field**: Now only contains import errors, not unmatched names
- **UI updates**:
  - Shows "Matched: {product_code}" badge when auto-matched
  - Shows "No match - can select later" badge for unmatched names
  - Added helpful note explaining the new workflow

### 2. Bulk Import API (`src/app/api/orders/bulk/route.ts`)

- Added `name: order.name` to the order data insertion
- Updated warning messages to indicate product codes can be selected later
- Maintained auto-matching logic for convenience

### 3. Orders List Page (`src/app/admin/orders/page.tsx`)

- Updated Product column to display:
  - Order name (from `orders.name`) as primary text
  - Product code (if selected) with green icon
  - "No product selected" message with yellow icon if not matched

### 4. Edit Dialog (`src/app/admin/orders/edit-dialog.tsx`)

- Added `name` field to the form
- Made `product_code` field optional (removed from validation)
- Users can now view/edit the name and select product_code anytime

### 5. Create Dialog (`src/app/admin/orders/create-dialog.tsx`)

- Added `name` field as optional input
- Made `product_code` field optional in validation
- Updated placeholder text to reflect optional nature

### 6. Create Order API (`src/app/api/orders/route.ts`)

- Added support for `name` field in POST endpoint

## Workflow

### Before

1. Import Excel with NAME column
2. If NAME matches product code → use it as product_code
3. If NAME doesn't match → put in remark field
4. No way to edit/select product later without manually editing remark

### After

1. Import Excel with NAME column
2. NAME is **always saved** to `orders.name` field
3. If NAME matches product code → auto-set product_code (convenience)
4. If NAME doesn't match → leave product_code empty
5. Users can **select/change product_code anytime** via edit dialog
6. Order name is always visible in the orders list

## Database

The `name` field already exists in the orders table via migration
`008_add_order_name.ts`. No database changes needed.

## Benefits

- ✅ No data loss - NAME is always preserved in orders.name
- ✅ Flexibility - Users can match products later
- ✅ Better UX - Clear indication of matched vs unmatched products
- ✅ Searchable - NAME field is indexed and searchable
- ✅ Backward compatible - Auto-matching still works for convenience
