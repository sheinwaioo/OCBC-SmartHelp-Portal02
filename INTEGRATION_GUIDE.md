# OCBC SmartHelp - Team Database Schema Integration Complete ✅

**Date**: January 19, 2026  
**Status**: ✅ ALL BACKEND CODE UPDATED & READY FOR TESTING

---

## 📋 Executive Summary

Your OCBC SmartHelp project has been **fully aligned** with your Team's database schema while **preserving all unique features** (QR code consultations, online queue, callbacks).

### Key Changes:
- ✅ Tables migrated: `users` → `customer`, `enquiries` → `enquiry`
- ✅ Foreign keys updated: All `user_id` → `customer_id`
- ✅ Categories now hierarchical: Uses Team's `enquiry_category` with `parent_id`
- ✅ Integrated: `account` and `card` tables for banking operations
- ✅ Your features preserved: `consultations`, `callbacks`, `queue_entries` intact
- ✅ Backend fully updated: 7 controller/service files modified
- ✅ Frontend partially updated: 2 files updated, 1 minor HTML field needed

---

## 🔄 Changes Made

### Backend (COMPLETED - 7 Files)

#### 1. **authController.js**
```javascript
// BEFORE: users.full_name, users.id, users.account_balance
// AFTER: customer.name, customer.customer_id, account.balance

register()   // fullName → name, mobileNumber added, creates account
login()      // Joins with account table for balance
getProfile() // customer_id, fetches from account
```

#### 2. **enquiryService.js**
```javascript
// BEFORE: enquiries table with flat subcategory
// AFTER: enquiry table with category_id reference

createEnquiry()      // Maps subcategory name → category_id via lookup
getEnquiryHistory()  // customer_id references
updateEnquiryStatus()// Uses enquiry_id, resolution_method
```

#### 3. **queueService.js**
```javascript
// ALL: user_id → customer_id

joinQueue()           // customerId
getQueuePosition()    // customerId
leaveQueue()          // customerId
scheduleCallback()    // customerId, fetches from customer table
getUserCallbacks()    // customerId
cancelCallback()      // customerId
```

#### 4. **consultationService.js**
```javascript
// ALL: user_id → customer_id

generateConsultationQR()       // customerId
getUserConsultations()         // customerId
submitConsultationFeedback()   // customerId
```

#### 5. **intentEngine.js**
```javascript
// NEW: Database-driven categories

getCategories()        // Fetches main categories from enquiry_category
getSubcategories()     // Handles parent_id relationships
classifyIntent()       // Uses database categories
```

#### 6. **chatbotController.js**
```javascript
// ALL: userId → customerId in request handlers

chatWithAI()                  // customerId in flow state
requestConsultationQR()       // customerId, uses enquiry_id
handleQueueAction()           // customerId
handleCallbackRequest()       // customerId
```

#### 7. **schema.sql** (REWRITTEN)
```sql
-- Team's Tables
customer           -- 10 fields, PK: customer_id
enquiry_category   -- Hierarchical (parent_id)
enquiry            -- FK: customer_id, category_id
account            -- Banking accounts (1:Many with customer)
card               -- Credit/debit cards

-- Your Tables (Updated FKs)
consultations      -- FK: customer_id (not user_id)
callbacks          -- FK: customer_id (not user_id)
queue_entries      -- FK: customer_id (not user_id)
```

### Frontend (COMPLETED - 2 Files, 1 Minor Update Needed)

#### 1. **auth.js** ✅
```javascript
// register() parameters changed
// BEFORE: { email, password, fullName }
// AFTER: { email, password, name, mobileNumber }

// Response field changed
// BEFORE: { id, fullName, accountNumber, accountBalance }
// AFTER: { customerId, name, accountNumber }

// localStorage updated
localStorage.setItem("customerId", response.user.customerId)

// updateAuthUI() uses response.user.name instead of fullName
```

#### 2. **chatbot.js** ✅
No changes needed - enquiryId handling works as-is

#### 3. **index.html** ⏳ MINOR UPDATE NEEDED
Add phone number field to register form:
```html
<label for="register-phone">Phone Number (Optional):</label>
<input type="tel" id="register-phone" />
```

---

## 🗂️ New Database Structure

### Customer (Team)
```
customer_id      UUID    PK
name            TEXT    NOT NULL
mobile_number   TEXT
address         TEXT
email           TEXT    UNIQUE NOT NULL
password        TEXT    NOT NULL
pin_number      TEXT
joined_at       TIMESTAMPTZ
TotpSecret      TEXT
IsMfaVerified   BOOLEAN
```

### Enquiry Category (Team - Hierarchical)
```
enquiry_category_id    UUID    PK
name                   TEXT    NOT NULL
parent_id              UUID    FK (self-reference)

Example:
- Card Services (parent_id: NULL)
  - Report Lost Card (parent_id: Card Services ID)
  - Manage Card Limit (parent_id: Card Services ID)
```

### Enquiry (Team)
```
enquiry_id      UUID    PK
customer_id     UUID    FK (customer)
category_id     UUID    FK (enquiry_category)
description     TEXT
image_url       TEXT
created_at      TIMESTAMPTZ
status          TEXT
resolution_method TEXT
```

### Account (Team)
```
account_number      TEXT    PK
customer_id         UUID    FK (customer)
balance             NUMERIC
transaction_limit   NUMERIC
type                TEXT
created_at          TIMESTAMPTZ
```

### Card (Team)
```
card_id            UUID    PK
customer_id        UUID    FK (customer)
account_id         TEXT    FK (account)
cardlast_4         TEXT
created_at         TIMESTAMPTZ
type               TEXT
is_active          BOOLEAN
transfer_limit     NUMERIC
```

### Consultations (Your Feature - KEPT)
```
id                UUID    PK
customer_id       UUID    FK (customer)     ← Changed from user_id
enquiry_id        UUID    FK (enquiry)
consultation_id   VARCHAR UNIQUE
qr_data           JSONB
qr_code_image     TEXT
preferred_branch  VARCHAR
status            VARCHAR
feedback          TEXT
rating            INTEGER
created_at        TIMESTAMP
completed_at      TIMESTAMP
```

### Callbacks (Your Feature - KEPT)
```
id               UUID    PK
customer_id      UUID    FK (customer)     ← Changed from user_id
enquiry_id       UUID    FK (enquiry)
scheduled_time   TIMESTAMP NOT NULL
phone_number     VARCHAR
status           VARCHAR
notes            TEXT
created_at       TIMESTAMP
completed_at     TIMESTAMP
cancelled_at     TIMESTAMP
```

### Queue Entries (Your Feature - KEPT)
```
id                    UUID    PK
customer_id           UUID    FK (customer)     ← Changed from user_id
enquiry_id            UUID    FK (enquiry)
status                VARCHAR
position              INTEGER
estimated_wait_minutes INTEGER
joined_at             TIMESTAMP
started_at            TIMESTAMP
completed_at          TIMESTAMP
cancelled_at          TIMESTAMP
```

---

## 📡 API Contract Changes

### POST /api/auth/register
```javascript
// REQUEST
{
  "email": "john@example.com",
  "password": "password123",
  "name": "John Doe",                    // ✅ Changed from fullName
  "mobileNumber": "+65 9123 4567"        // ✅ New field
}

// RESPONSE
{
  "token": "eyJhbGc...",
  "user": {
    "customerId": "550e8400...",          // ✅ Changed from id
    "email": "john@example.com",
    "name": "John Doe",                   // ✅ Changed from fullName
    "mobileNumber": "+65 9123 4567",      // ✅ New
    "accountNumber": "OCBC001234567890"   // ✅ Auto-created
  }
}
```

### POST /api/auth/login
```javascript
// RESPONSE
{
  "token": "eyJhbGc...",
  "user": {
    "customerId": "550e8400...",          // ✅ Changed from id
    "email": "john@example.com",
    "name": "John Doe",                   // ✅ Changed from fullName
    "mobileNumber": "+65 9123 4567",
    "accountNumber": "OCBC001234567890",
    "accountBalance": 50000.00            // ✅ From account table
  }
}
```

### GET /api/auth/profile
```javascript
// RESPONSE
{
  "user": {
    "customerId": "550e8400...",
    "email": "john@example.com",
    "name": "John Doe",
    "mobileNumber": "+65 9123 4567",
    "address": "123 Main St",
    "joinedAt": "2026-01-19T...",
    "accountNumber": "OCBC001234567890",
    "accountBalance": 50000.00,
    "accountType": "SAVINGS"
  }
}
```

### POST /api/chat
```javascript
// Internal: customerId used instead of userId
flowState: {
  category: "Card Services",
  subcategory: "Report Lost Card",
  enquiryId: null,
  isLoggedIn: true
}
```

### POST /api/consultations/qr
```javascript
// USES: customerId internally
// Returns: enquiry_id in response (not id)
```

---

## ✅ Testing Checklist

### Registration & Authentication
- [ ] Register with name, email, password, phone number
- [ ] Verify customer record created in `customer` table
- [ ] Verify demo account auto-created in `account` table with $50,000 balance
- [ ] Login with registered credentials
- [ ] Verify `customerId` stored in localStorage
- [ ] Logout clears `customerId`
- [ ] Profile page shows correct customer & account info

### Enquiry Management
- [ ] Chat: "I lost my card" → Creates enquiry with category_id lookup
- [ ] Verify enquiry stored in `enquiry` table (not `enquiries`)
- [ ] Verify category_id populated from `enquiry_category` table
- [ ] Verify description = "Card Services - Report Lost Card"
- [ ] View enquiry history
- [ ] Update enquiry status

### Physical Consultation
- [ ] Click "Schedule Consultation"
- [ ] Select branch
- [ ] Verify QR code generated
- [ ] Verify consultation_id format: ENQ-XXXX-XXX
- [ ] Verify stored in `consultations` with customer_id (not user_id)
- [ ] Download/view QR code

### Online Queue System
- [ ] Click "Join Queue"
- [ ] Verify queue_entry created with customer_id
- [ ] Check position and wait time
- [ ] Leave queue
- [ ] Verify cancelled_at timestamp

### Callback Scheduling
- [ ] Click "Schedule Callback"
- [ ] Select time slot
- [ ] Verify callback created in `callbacks` table
- [ ] Verify phone_number fetched from customer.mobile_number
- [ ] Cancel callback
- [ ] View callback history

### Category System
- [ ] Main categories load: Card Services, Account & Banking, Loan & Finances
- [ ] Subcategories load correctly
- [ ] Parent-child relationships work (parent_id resolves correctly)
- [ ] Intent classification uses database categories

---

## 🚀 Deployment Instructions

### Step 1: Update Database (Supabase)
```bash
# Open Supabase SQL Editor
# Paste contents of: database/schema.sql
# Execute (this will):
# - Create customer, enquiry_category, enquiry, account, card tables
# - Update consultations, callbacks, queue_entries with new FKs
# - Seed demo data
# - Create indexes
```

### Step 2: Update Frontend HTML (Minor)
Edit `front-end/index.html`:
```html
<!-- Add to register form -->
<div class="form-group">
  <label for="register-phone">Phone Number (Optional):</label>
  <input 
    type="tel" 
    id="register-phone" 
    placeholder="+65 9123 4567"
  />
</div>
```

### Step 3: Test Backend Locally
```bash
cd back-end
npm install
npm start
# Server should start on http://localhost:3000
```

### Step 4: Test Frontend Locally
```bash
cd front-end
python -m http.server 8080
# Frontend should run on http://localhost:8080
```

### Step 5: Run Full Integration Tests
- Complete testing checklist above
- Verify all API responses use new field names
- Check localStorage for `customerId`
- Ensure no console errors

### Step 6: Deploy
```bash
# Backend: Deploy to your hosting (Heroku, Railway, Vercel, etc.)
# Frontend: Deploy static files to CDN or server
```

---

## 📊 Summary of All Changes

| Aspect | Before | After | Status |
|--------|--------|-------|--------|
| **Auth Table** | users | customer | ✅ Updated |
| **Auth Fields** | id, full_name, phone_number | customer_id, name, mobile_number | ✅ Updated |
| **Enquiry Table** | enquiries (id, user_id) | enquiry (enquiry_id, customer_id, category_id) | ✅ Updated |
| **Categories** | Flat (category, subcategory) | Hierarchical (enquiry_category with parent_id) | ✅ Updated |
| **Account Info** | In users table | Separate account table | ✅ Updated |
| **Cards** | Not implemented | card table ready | ✅ Added |
| **Queue** | Uses user_id | Uses customer_id | ✅ Updated |
| **Consultations** | Uses user_id | Uses customer_id | ✅ Updated |
| **Callbacks** | Uses user_id | Uses customer_id | ✅ Updated |
| **Frontend** | fullName param | name, mobileNumber params | ✅ Updated |
| **Frontend HTML** | No phone field | Phone field needed | ⏳ Add manually |

---

## 📝 Files Modified

### Backend (7 files - ALL COMPLETE)
1. ✅ back-end/controllers/authController.js
2. ✅ back-end/services/enquiryService.js
3. ✅ back-end/services/queueService.js
4. ✅ back-end/services/consultationService.js
5. ✅ back-end/services/intentEngine.js
6. ✅ back-end/controllers/chatbotController.js
7. ✅ database/schema.sql

### Frontend (2 files - MOSTLY COMPLETE)
1. ✅ front-end/auth.js
2. ⏳ front-end/index.html (add phone field)

### Documentation (3 new files)
1. 📄 TEAM_SCHEMA_INTEGRATION.md
2. 📄 CODE_ALIGNMENT_COMPLETE.md
3. 📄 INTEGRATION_GUIDE.md (this file)

---

## ⚠️ Important Notes

1. **Migration Strategy**: If migrating from old schema, consider:
   - Backing up old data first
   - Mapping user.id → customer.customer_id
   - Creating new account records for each customer
   - Updating all enquiry records with category_id

2. **Category Migration**: If you have existing enquiries:
   - Need to map old subcategory strings to new category_id references
   - Use SQL to match names and update category_id

3. **Backward Compatibility**: 
   - Old `users` and `enquiries` tables can be kept for reference
   - Frontend should be updated to use new field names
   - No support for mixing old and new schemas

4. **Performance**: 
   - Indexes created on all FK columns
   - Category caching implemented (60 min TTL)
   - Intent classification caching (60 min TTL)

5. **Security**: 
   - Passwords still stored plain in demo (use bcrypt in production!)
   - JWT tokens use customer_id as subject
   - RLS policies available for row-level security

---

## 🎯 Next Steps

1. **Immediate** (This Sprint)
   - [ ] Add phone field to index.html
   - [ ] Run schema.sql in Supabase
   - [ ] Test registration flow
   - [ ] Test login flow
   - [ ] Verify localStorage customerId

2. **Short-term** (Next Week)
   - [ ] Complete full integration testing
   - [ ] Test all enquiry flows
   - [ ] Test consultation QR code
   - [ ] Test queue system
   - [ ] Test callbacks

3. **Medium-term** (Next 2 Weeks)
   - [ ] Performance testing
   - [ ] Load testing
   - [ ] Security audit
   - [ ] Deploy to production
   - [ ] Monitor logs

4. **Long-term** (Ongoing)
   - [ ] Add bcrypt password hashing
   - [ ] Implement RLS policies
   - [ ] Add audit logging
   - [ ] Monitor database growth
   - [ ] Optimize queries

---

## 🎉 Conclusion

Your OCBC SmartHelp chatbot is now **100% aligned** with your Team's database schema while maintaining all your unique features. 

**All backend code is complete and ready for testing!**

The only remaining task is to add one optional phone number field to the frontend HTML registration form.

Good luck with your project! 🚀
