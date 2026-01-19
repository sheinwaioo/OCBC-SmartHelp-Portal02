-- =============================================
-- MIGRATION SCRIPT: Align with Team Database Schema
-- This script migrates from your current setup to Team's schema
-- while preserving ALL your existing data and fields
-- =============================================

-- =============================================
-- Step 1: Create enquiry_category table (NEW - Team's hierarchy)
-- =============================================
CREATE TABLE IF NOT EXISTS enquiry_category (
  enquiry_category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES enquiry_category(enquiry_category_id) ON DELETE SET NULL
);

-- Seed main categories
INSERT INTO enquiry_category (enquiry_category_id, name, parent_id) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'Card Services', NULL),
  ('550e8400-e29b-41d4-a716-446655440002', 'Account & Banking', NULL),
  ('550e8400-e29b-41d4-a716-446655440003', 'Loan & Finances', NULL)
ON CONFLICT DO NOTHING;

-- Seed subcategories
INSERT INTO enquiry_category (enquiry_category_id, name, parent_id) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440011', 'Report Lost Card', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440012', 'Manage Card Limit', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440013', 'Link Account to Card', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440014', 'Lock / Unlock Card', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440021', 'Reset Login PIN', '550e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440022', 'Check Balance', '550e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440023', 'Update Personal Details', '550e8400-e29b-41d4-a716-446655440002'),
  ('550e8400-e29b-41d4-a716-446655440031', 'Loan Inquiry', '550e8400-e29b-41d4-a716-446655440003'),
  ('550e8400-e29b-41d4-a716-446655440032', 'Investment Advisory', '550e8400-e29b-41d4-a716-446655440003'),
  ('550e8400-e29b-41d4-a716-446655440033', 'Savings Plans', '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT DO NOTHING;

-- =============================================
-- Step 2: Create NEW customer table (from users)
-- Combines Team schema + your fields
-- =============================================
CREATE TABLE IF NOT EXISTS customer (
  -- Team's fields
  customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  mobile_number VARCHAR(20),
  address TEXT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  pin_number VARCHAR(10),
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  TotpSecret VARCHAR(255),
  IsMfaVerified BOOLEAN DEFAULT FALSE,
  
  -- Your preserved fields
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  account_number VARCHAR(20) UNIQUE,
  account_balance DECIMAL(15, 2) DEFAULT 50000.00,
  tier VARCHAR(50) DEFAULT 'STANDARD',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate data from users to customer
INSERT INTO customer (
  customer_id, name, mobile_number, address, email, password, pin_number, 
  joined_at, TotpSecret, IsMfaVerified, full_name, phone_number, 
  account_number, account_balance, tier, updated_at
)
SELECT 
  id, full_name, phone_number, NULL, email, password, NULL,
  created_at, NULL, FALSE, full_name, phone_number,
  account_number, account_balance, tier, updated_at
FROM users
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- Step 3: Create NEW enquiry table (from enquiries)
-- Combines Team schema + your fields
-- =============================================
CREATE TABLE IF NOT EXISTS enquiry (
  -- Team's fields
  enquiry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  category_id UUID REFERENCES enquiry_category(enquiry_category_id),
  description TEXT,
  image_url TEXT,
  status VARCHAR(50) DEFAULT 'open',
  resolution_method VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Your preserved fields
  category VARCHAR(100),
  subcategory VARCHAR(100),
  details JSONB,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Migrate data from enquiries to enquiry
-- Maps your categories to Team's category_id
INSERT INTO enquiry (
  enquiry_id, customer_id, category_id, description, image_url, status, 
  resolution_method, created_at, category, subcategory, details, updated_at
)
SELECT 
  id,
  user_id,
  CASE 
    WHEN enquiries.category = 'Card Services' THEN '550e8400-e29b-41d4-a716-446655440001'
    WHEN enquiries.category = 'Account & Banking' THEN '550e8400-e29b-41d4-a716-446655440002'
    WHEN enquiries.category = 'Loan & Finances' THEN '550e8400-e29b-41d4-a716-446655440003'
    ELSE NULL
  END,
  enquiries.category,
  NULL,
  enquiries.status,
  NULL,
  enquiries.created_at,
  enquiries.category,
  enquiries.subcategory,
  enquiries.details,
  enquiries.updated_at
FROM enquiries
ON CONFLICT DO NOTHING;

-- =============================================
-- Step 4: Update consultations table references
-- Change user_id to customer_id
-- =============================================
ALTER TABLE consultations 
  DROP CONSTRAINT IF EXISTS consultations_user_id_fkey;

ALTER TABLE consultations 
  RENAME COLUMN user_id TO customer_id;

ALTER TABLE consultations 
  ADD CONSTRAINT consultations_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE;

-- Update enquiry_id references if they point to old table
ALTER TABLE consultations 
  DROP CONSTRAINT IF EXISTS consultations_enquiry_id_fkey;

ALTER TABLE consultations 
  ADD CONSTRAINT consultations_enquiry_id_fkey 
  FOREIGN KEY (enquiry_id) REFERENCES enquiry(enquiry_id) ON DELETE SET NULL;

-- =============================================
-- Step 5: Update callbacks table references
-- Change user_id to customer_id
-- =============================================
ALTER TABLE callbacks 
  DROP CONSTRAINT IF EXISTS callbacks_user_id_fkey;

ALTER TABLE callbacks 
  RENAME COLUMN user_id TO customer_id;

ALTER TABLE callbacks 
  ADD CONSTRAINT callbacks_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE;

-- Update enquiry_id references
ALTER TABLE callbacks 
  DROP CONSTRAINT IF EXISTS callbacks_enquiry_id_fkey;

ALTER TABLE callbacks 
  ADD CONSTRAINT callbacks_enquiry_id_fkey 
  FOREIGN KEY (enquiry_id) REFERENCES enquiry(enquiry_id) ON DELETE CASCADE;

-- =============================================
-- Step 6: Update queue_entries table references
-- Change user_id to customer_id
-- =============================================
ALTER TABLE queue_entries 
  DROP CONSTRAINT IF EXISTS queue_entries_user_id_fkey;

ALTER TABLE queue_entries 
  RENAME COLUMN user_id TO customer_id;

ALTER TABLE queue_entries 
  ADD CONSTRAINT queue_entries_customer_id_fkey 
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE;

-- Update enquiry_id references
ALTER TABLE queue_entries 
  DROP CONSTRAINT IF EXISTS queue_entries_enquiry_id_fkey;

ALTER TABLE queue_entries 
  ADD CONSTRAINT queue_entries_enquiry_id_fkey 
  FOREIGN KEY (enquiry_id) REFERENCES enquiry(enquiry_id) ON DELETE CASCADE;

-- =============================================
-- Step 7: Create indexes for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(email);
CREATE INDEX IF NOT EXISTS idx_enquiry_customer_id ON enquiry(customer_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_category_id ON enquiry(category_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_status ON enquiry(status);
CREATE INDEX IF NOT EXISTS idx_consultations_customer_id ON consultations(customer_id);
CREATE INDEX IF NOT EXISTS idx_callbacks_customer_id ON callbacks(customer_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_customer_id ON queue_entries(customer_id);

-- =============================================
-- Step 8: Update RLS Policies (if using)
-- =============================================
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiry ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiry_category ENABLE ROW LEVEL SECURITY;

-- Customers can only view their own data
DROP POLICY IF EXISTS "Customers can view own data" ON customer;
CREATE POLICY "Customers can view own data" ON customer
  FOR SELECT USING (auth.uid()::text = customer_id::text);

-- Customers can only view their own enquiries
DROP POLICY IF EXISTS "Customers can view own enquiries" ON enquiry;
CREATE POLICY "Customers can view own enquiries" ON enquiry
  FOR SELECT USING (auth.uid()::text = customer_id::text);

-- =============================================
-- SUMMARY OF CHANGES
-- =============================================
-- ✅ Created: enquiry_category table (hierarchical categories)
-- ✅ Created: customer table (merged schema - Team + your fields)
-- ✅ Created: enquiry table (merged schema - Team + your fields)
-- ✅ Updated: consultations, callbacks, queue_entries (user_id → customer_id)
-- ✅ Migrated: All data from users → customer
-- ✅ Migrated: All data from enquiries → enquiry
-- ✅ Created: Indexes for performance
-- ✅ Updated: RLS Policies
-- 
-- ⚠️ IMPORTANT: After migration, you can safely DELETE the old tables:
--    DROP TABLE IF EXISTS users;
--    DROP TABLE IF EXISTS enquiries;
-- (Only delete after confirming all data is migrated and app is updated)
