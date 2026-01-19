-- =============================================
-- OCBC SmartHelp Database Setup - Team Schema Aligned
-- Integrates with Team's existing database structure
-- =============================================

-- =============================================
-- TEAM'S TABLES (Use as provided)
-- =============================================

-- =============================================
-- Customer Table (Team's)
-- =============================================
CREATE TABLE IF NOT EXISTS customer (
  customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile_number TEXT,
  address TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  pin_number TEXT,
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  TotpSecret TEXT,
  IsMfaVerified BOOLEAN DEFAULT FALSE
);

-- =============================================
-- Enquiry Category Table (Team's - Hierarchical)
-- =============================================
CREATE TABLE IF NOT EXISTS enquiry_category (
  enquiry_category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
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
-- Enquiry Table (Team's)
-- =============================================
CREATE TABLE IF NOT EXISTS enquiry (
  enquiry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  category_id UUID REFERENCES enquiry_category(enquiry_category_id),
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'open',
  resolution_method TEXT
);

-- =============================================
-- Account Table (Team's)
-- =============================================
CREATE TABLE IF NOT EXISTS account (
  account_number TEXT PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  balance NUMERIC,
  transaction_limit NUMERIC,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Card Table (Team's)
-- =============================================
CREATE TABLE IF NOT EXISTS card (
  card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  account_id TEXT REFERENCES account(account_number) ON DELETE SET NULL,
  cardlast_4 TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  type TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  transfer_limit NUMERIC
);

-- =============================================
-- OUR CUSTOM TABLES (Your Features)
-- =============================================

-- =============================================
-- Consultations Table (QR Code Check-ins)
-- =============================================
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiry(enquiry_id) ON DELETE SET NULL,
  consultation_id VARCHAR(50) UNIQUE NOT NULL,
  qr_data JSONB,
  qr_code_image TEXT,
  preferred_branch VARCHAR(255),
  status VARCHAR(50) DEFAULT 'scheduled',
  feedback TEXT,
  rating INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- =============================================
-- Callbacks Table (Callback Scheduling)
-- =============================================
CREATE TABLE IF NOT EXISTS callbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  enquiry_id UUID NOT NULL REFERENCES enquiry(enquiry_id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP NOT NULL,
  phone_number VARCHAR(20),
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP
);

-- =============================================
-- Queue Entries Table (Online Queue System)
-- =============================================
CREATE TABLE IF NOT EXISTS queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  enquiry_id UUID NOT NULL REFERENCES enquiry(enquiry_id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'waiting',
  position INTEGER,
  estimated_wait_minutes INTEGER,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_customer_email ON customer(email);
CREATE INDEX IF NOT EXISTS idx_enquiry_customer_id ON enquiry(customer_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_category_id ON enquiry(category_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_status ON enquiry(status);
CREATE INDEX IF NOT EXISTS idx_account_customer_id ON account(customer_id);
CREATE INDEX IF NOT EXISTS idx_card_customer_id ON card(customer_id);
CREATE INDEX IF NOT EXISTS idx_consultations_customer_id ON consultations(customer_id);
CREATE INDEX IF NOT EXISTS idx_callbacks_customer_id ON callbacks(customer_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_customer_id ON queue_entries(customer_id);

-- =============================================
-- Demo Data
-- =============================================
INSERT INTO customer (customer_id, email, password, name, mobile_number, address, pin_number, joined_at)
VALUES 
  ('550e8400-e29b-41d4-a716-000000000001', 'john@example.com', 'password123', 'John Doe', '+65 9123 4567', '123 Main St', '1234', CURRENT_TIMESTAMP),
  ('550e8400-e29b-41d4-a716-000000000002', 'jane@example.com', 'password123', 'Jane Smith', '+65 9234 5678', '456 Oak Ave', '5678', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Demo accounts
INSERT INTO account (account_number, customer_id, balance, transaction_limit, type, created_at)
VALUES 
  ('OCBC001234567890', '550e8400-e29b-41d4-a716-000000000001', 50000.00, 100000.00, 'SAVINGS', CURRENT_TIMESTAMP),
  ('OCBC009876543210', '550e8400-e29b-41d4-a716-000000000002', 75000.00, 150000.00, 'CURRENT', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- =============================================
-- Enable Row Level Security (Optional)
-- =============================================
ALTER TABLE customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiry ENABLE ROW LEVEL SECURITY;
ALTER TABLE account ENABLE ROW LEVEL SECURITY;
ALTER TABLE card ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE callbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies
-- =============================================
-- Customers can only view their own data
DROP POLICY IF EXISTS "Customers can view own data" ON customer;
CREATE POLICY "Customers can view own data" ON customer
  FOR SELECT USING (auth.uid()::text = customer_id::text);

-- Customers can only view their own enquiries
DROP POLICY IF EXISTS "Customers can view own enquiries" ON enquiry;
CREATE POLICY "Customers can view own enquiries" ON enquiry
  FOR SELECT USING (auth.uid()::text = customer_id::text)
