-- =============================================
-- Create Consultations, Callbacks, and Queue Tables
-- Run this in Supabase SQL Editor if tables don't exist
-- =============================================

-- Consultations Table (QR Code Check-ins)
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiry(enquiry_id) ON DELETE SET NULL,
  consultation_id TEXT UNIQUE NOT NULL,
  qr_data TEXT,
  qr_code_image TEXT,
  preferred_branch TEXT DEFAULT 'Main Branch',
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Callbacks Table (Callback Scheduling)
CREATE TABLE IF NOT EXISTS callbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiry(enquiry_id) ON DELETE SET NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Queue Entries Table (Online Queue Management)
CREATE TABLE IF NOT EXISTS queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
  enquiry_id UUID REFERENCES enquiry(enquiry_id) ON DELETE SET NULL,
  position INTEGER,
  status TEXT DEFAULT 'waiting',
  joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  left_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultations_customer_id ON consultations(customer_id);
CREATE INDEX IF NOT EXISTS idx_callbacks_customer_id ON callbacks(customer_id);
CREATE INDEX IF NOT EXISTS idx_queue_entries_customer_id ON queue_entries(customer_id);

-- Enable RLS (Row Level Security)
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE callbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY consultations_customer_policy ON consultations
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY callbacks_customer_policy ON callbacks
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY queue_entries_customer_policy ON queue_entries
  FOR SELECT USING (customer_id = auth.uid());
