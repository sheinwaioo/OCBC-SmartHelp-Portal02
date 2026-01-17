-- OCBC SmartHelp Database Setup
-- Run these SQL scripts in Supabase to create the required tables

-- =============================================
-- Users Table
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- In production, use bcrypt hashed passwords
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  account_number VARCHAR(20) UNIQUE,
  account_balance DECIMAL(15, 2) DEFAULT 50000.00,
  tier VARCHAR(50) DEFAULT 'STANDARD', -- STANDARD, PREMIER, PRIVATE
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Enquiries Table
-- =============================================
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- Card Services, Account & Banking, etc.
  subcategory VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Queue Entries Table
-- =============================================
CREATE TABLE IF NOT EXISTS queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'waiting', -- waiting, in_progress, completed, cancelled
  position INTEGER,
  estimated_wait_minutes INTEGER,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP
);

-- =============================================
-- Callbacks Table
-- =============================================
CREATE TABLE IF NOT EXISTS callbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP NOT NULL,
  phone_number VARCHAR(20),
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled, no_show
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP
);

-- =============================================
-- Consultations Table
-- =============================================
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiries(id) ON DELETE SET NULL,
  consultation_id VARCHAR(50) UNIQUE NOT NULL,
  qr_data JSONB,
  qr_code_image TEXT, -- Base64-encoded PNG QR code image (added for QR feature)
  preferred_branch VARCHAR(255),
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
  feedback TEXT,
  rating INTEGER, -- 1-5 star rating
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- =============================================
-- Indexes for Performance
-- =============================================
CREATE INDEX idx_enquiries_user_id ON enquiries(user_id);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_queue_entries_user_id ON queue_entries(user_id);
CREATE INDEX idx_queue_entries_status ON queue_entries(status);
CREATE INDEX idx_callbacks_user_id ON callbacks(user_id);
CREATE INDEX idx_callbacks_status ON callbacks(status);
CREATE INDEX idx_consultations_user_id ON consultations(user_id);
CREATE INDEX idx_consultations_status ON consultations(status);

-- =============================================
-- Seed Data (Optional - Demo Users)
-- =============================================
INSERT INTO users (email, password, full_name, phone_number, account_number, account_balance, tier)
VALUES 
  ('john@example.com', 'password123', 'John Doe', '+65 9123 4567', 'OCBC001234567890', 50000.00, 'PREMIER'),
  ('jane@example.com', 'password123', 'Jane Smith', '+65 9234 5678', 'OCBC009876543210', 75000.00, 'STANDARD')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- Enable Row Level Security (Optional but recommended)
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE callbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS Policies (Optional - customize based on your needs)
-- =============================================
-- Users can only view their own profile
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can only view their own enquiries
CREATE POLICY "Users can view own enquiries" ON enquiries
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Similar policies for other tables...
