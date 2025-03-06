/*
  # SpotMaster Database Schema

  1. Tables Created:
    - parking_spots: Stores parking location information
    - bookings: Manages parking reservations
    - payments: Tracks payment transactions
    - support_messages: Handles customer support communication

  2. Security:
    - RLS enabled on all tables
    - Policies for user access control
    - Admin access for parking spots management
*/

-- Create parking_spots table
DO $$ BEGIN
CREATE TABLE IF NOT EXISTS parking_spots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  address text NOT NULL,
  is_available boolean DEFAULT true,
  price_per_minute numeric DEFAULT 1.0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
END $$;

-- Create bookings table
DO $$ BEGIN
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  spot_id uuid REFERENCES parking_spots(id),
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'completed', 'cancelled'))
);
END $$;

-- Create payments table
DO $$ BEGIN
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id),
  amount numeric NOT NULL,
  payment_method text,
  status text DEFAULT 'pending',
  transaction_id text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('upi', 'card')),
  CONSTRAINT valid_payment_status CHECK (status IN ('pending', 'completed', 'failed'))
);
END $$;

-- Create support_messages table
DO $$ BEGIN
CREATE TABLE IF NOT EXISTS support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  message text NOT NULL,
  is_from_user boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
END $$;

-- Enable RLS
DO $$ BEGIN
ALTER TABLE parking_spots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
END $$;

-- Parking spots policies
DO $$ BEGIN
CREATE POLICY "Public read access for parking spots"
  ON parking_spots FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin full access for parking spots"
  ON parking_spots
  TO authenticated
  USING (auth.jwt() ->> 'email' = 'admin');
END $$;

-- Bookings policies
DO $$ BEGIN
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
END $$;

-- Payments policies
DO $$ BEGIN
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM bookings 
    WHERE bookings.id = payments.booking_id 
    AND bookings.user_id = auth.uid()
  ));
END $$;

-- Support messages policies
DO $$ BEGIN
CREATE POLICY "Users can view their own messages"
  ON support_messages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create messages"
  ON support_messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
END $$;