# Database Migration Guide - QR Code Feature

## ⚠️ Issue

The `consultations` table was missing the `qr_code_image` column needed for the QR code feature.

**Error Message:**
```
PGRST204: Could not find the 'qr_code_image' column of 'consultations' in the schema cache
```

## ✅ Solution

### Quick Migration (Copy & Paste)

Run this SQL in Supabase SQL Editor:

```sql
-- Add QR code image column to consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS qr_code_image TEXT;

-- Create index for faster consultation lookups
CREATE INDEX IF NOT EXISTS idx_consultations_consultation_id ON consultations(consultation_id);
```

### Step-by-Step Instructions

1. **Go to Supabase Dashboard**
   - https://supabase.com
   - Select your project

2. **Open SQL Editor**
   - Left sidebar → "SQL Editor"
   - Click "New Query"

3. **Paste the SQL above**
   - Copy the SQL code block
   - Paste into the editor
   - Click "▶ Run" (or Ctrl+Enter)

4. **Verify Success**
   - Should see: `Success. No rows returned`
   - Go to "Database" → "consultations"
   - Scroll right to see new `qr_code_image` column

5. **Test the Feature**
   - Reload frontend: http://localhost:8080
   - Try booking a physical consultation
   - QR code should now generate! ✅

## 📊 What Changed

### Before Migration
```
consultations table columns:
- id
- user_id
- enquiry_id
- consultation_id
- qr_data
- preferred_branch
- status
- feedback
- rating
- created_at
- completed_at
```

### After Migration
```
consultations table columns:
- id
- user_id
- enquiry_id
- consultation_id
- qr_data
- qr_code_image ← NEW
- preferred_branch
- status
- feedback
- rating
- created_at
- completed_at
```

## 🔍 Column Details

### qr_code_image
- **Type**: TEXT
- **Purpose**: Stores base64-encoded PNG QR code image
- **Example**: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB...`
- **Size**: Typically 3-10 KB per image

## 🚀 What Happens Now

After migration, the QR code feature will:
1. Generate unique consultation IDs (ENQ-8921-X format)
2. Create PNG QR code images (300x300 pixels)
3. Store images in `qr_code_image` column
4. Return QR code to frontend for display
5. Allow users to download tickets as PNG files

## 🧪 Test After Migration

```bash
# 1. Make sure backend is running
cd back-end
npm start

# 2. In another terminal, start frontend
cd front-end
python -m http.server 8080
```

**Test Flow:**
1. Go to http://localhost:8080
2. Login (john@example.com / password123)
3. Chat: "I need a physical consultation"
4. Select branch: "Main Branch - CBD"
5. See confirmation message
6. Click "View QR Code"
7. Download PNG ticket

**Should work perfectly now!** ✅

## 🐛 Troubleshooting

### Issue: Still getting PGRST204 error?
**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh page (Ctrl+Shift+R)
3. Restart backend (Ctrl+C, then npm start)
4. Wait 5 seconds for Supabase to sync
5. Try again

### Issue: Column says NULL for all records?
**Solution:** This is expected! 
- Old consultation records won't have QR codes
- New consultations will populate the column
- Previous records can be ignored

### Issue: Permission denied?
**Solution:**
- Make sure you're logged into Supabase as admin
- Check your user role in project settings
- Try running with service role key instead

## 📚 Related Files

- [database/schema.sql](../database/schema.sql) - Updated with QR column
- [back-end/services/consultationService.js](../back-end/services/consultationService.js) - Stores QR codes
- [front-end/chatbot.js](../front-end/chatbot.js) - Displays QR codes

## ✨ Future Migrations

If you add more features, follow the same pattern:

1. Add columns to `database/schema.sql`
2. Run ALTER TABLE in Supabase SQL Editor
3. Update backend code to use new columns
4. Update frontend to display new data
5. Test thoroughly

---

**Migration Date**: January 17, 2026
**Status**: ✅ Complete
**Feature**: QR Code Generation for Consultations
