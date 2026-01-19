# Database Schema Alignment Summary

## Overview
Your project has been updated to align with your Team's database schema while maintaining all your unique features.

---

## Database Schema Changes

### Team's Tables (Now Using)
1. **customer** - Customer authentication and basic info
2. **enquiry_category** - Hierarchical category structure (with parent_id for subcategories)
3. **enquiry** - Customer enquiries
4. **account** - Customer banking accounts
5. **card** - Customer credit/debit cards

### Your Tables (Kept as-is)
1. **consultations** - QR code check-ins (customer_id FK)
2. **callbacks** - Callback scheduling (customer_id FK)
3. **queue_entries** - Online queue system (customer_id FK)

---

## Backend Code Changes Completed

### ✅ authController.js
- `register()` - Changed from `users` to `customer` table
  - Parameters: email, password, name, mobileNumber
  - Creates demo account in `account` table
- `login()` - Fetches from `customer` table
  - Joins with `account` table for balance info
- `getProfile()` - Changed to `customer` table references
  - Returns customer_id, name, mobile_number, etc.

### ✅ enquiryService.js
- `createEnquiry()` - Creates in `enquiry` table
  - Maps subcategory name to category_id via `enquiry_category` lookup
  - Stores description as `{category} - {subcategory}`
- `getEnquiryHistory()` - Queries `enquiry` table by customer_id
- `updateEnquiryStatus()` - Updates `enquiry_id` (not `id`)
- `getEnquiry()` - Queries `enquiry` table

### ✅ queueService.js
- All functions updated: `user_id` → `customer_id`
- `joinQueue(customerId, enquiryId, ...)`
- `getQueuePosition(customerId)`
- `leaveQueue(customerId)`
- `scheduleCallback(customerId, enquiryId, ...)`
- `getUserCallbacks(customerId, status)`
- `cancelCallback(callbackId, customerId)`

### ✅ consultationService.js
- `generateConsultationQR(customerId, enquiryId, branch)`
- `getUserConsultations(customerId)`
- `submitConsultationFeedback(consultationId, customerId, feedback)`

### ✅ intentEngine.js
- NEW: `getCategories()` - Fetches from `enquiry_category` table (main categories where parent_id IS NULL)
- NEW: `getSubcategories(categoryName)` - Fetches from `enquiry_category` table (where parent_id = category_id)
- Added database imports and category caching
- Fallback to hardcoded categories if database unavailable

### ✅ chatbotController.js
- `chatWithAI()` - Changed userId → customerId
- `requestConsultationQR()` - Uses customerId
  - Uses `enquiry.enquiry_id` (not `enquiry.id`)
- `handleQueueAction()` - Uses customerId
- `handleCallbackRequest()` - Uses customerId

### ✅ schema.sql
- Complete rewrite with Team's table structure
- Includes all 5 Team tables + your 3 custom tables
- Seed categories in `enquiry_category` table
- Demo customers and accounts

---

## Frontend Code Changes Needed

You need to update these files with the new field names:

### 1. auth.js
```javascript
// OLD API calls
POST /api/auth/register
{
  "email": string,
  "password": string,
  "fullName": string  // ❌ OLD
}

// NEW API calls
POST /api/auth/register
{
  "email": string,
  "password": string,
  "name": string,        // ✅ NEW
  "mobileNumber": string // ✅ NEW
}

// Response fields changed
OLD: { id, email, fullName, accountNumber, accountBalance }
NEW: { customerId, email, name, mobileNumber, accountNumber }
```

### 2. chatbot.js
```javascript
// OLD: createEnquiry(userId, ...)
// NEW: createEnquiry(customerId, ...)

// OLD: joinQueue(userId, ...)
// NEW: joinQueue(customerId, ...)

// OLD: scheduleCallback(userId, ...)
// NEW: scheduleCallback(customerId, ...)

// OLD: generateConsultationQR(userId, ...)
// NEW: generateConsultationQR(customerId, ...)

// API responses now use enquiry_id instead of id
OLD: enquiry.id
NEW: enquiry.enquiry_id
```

### 3. utils.js
Update all localStorage keys that reference user data:
```javascript
// OLD
localStorage.setItem('userId', ...)
localStorage.getItem('userId')

// NEW
localStorage.setItem('customerId', ...)
localStorage.getItem('customerId')
```

---

## API Endpoint Changes

All endpoints remain the same, but request/response formats changed:

| Endpoint | Changes |
|----------|---------|
| POST /api/auth/register | fullName → name, added mobileNumber |
| POST /api/auth/login | Response: id → customerId |
| GET /api/auth/profile | Response fields changed |
| POST /api/chat | User context now uses customerId |
| POST /api/queue/join | Renamed parameter: userId → customerId |
| POST /api/consultations/qr | Renamed parameter: userId → customerId |
| POST /api/callbacks/schedule | Renamed parameter: userId → customerId |

---

## Testing Checklist

- [ ] Run database migration SQL in Supabase
- [ ] Test user registration with new field names
- [ ] Test user login and profile fetch
- [ ] Test creating enquiry (should lookup category_id from enquiry_category)
- [ ] Test joining queue
- [ ] Test generating QR code for consultation
- [ ] Test scheduling callback
- [ ] Verify localStorage uses customerId

---

## Important Notes

1. **Category Lookup**: Categories are now fetched from `enquiry_category` table. The hierarchical structure uses `parent_id` to link subcategories to main categories.

2. **Backwards Compatibility**: Old `users` table can be kept for reference but shouldn't be used. All new data goes to `customer` table.

3. **Account Management**: Account information now lives in separate `account` table, not in `customer` table.

4. **Field Name Consistency**: 
   - `user_id` → `customer_id` everywhere
   - `full_name` → `name`
   - `phone_number` → `mobile_number` (Team's schema)
   - `id` → `customer_id` in customer table, `enquiry_id` in enquiry table

---

## Next Steps

1. **Database**: Execute [migration_to_team_schema.sql](migration_to_team_schema.sql) in Supabase
2. **Backend**: ✅ Already updated
3. **Frontend**: Update auth.js, chatbot.js, utils.js with new API contract
4. **Testing**: Run full integration tests with new schema
