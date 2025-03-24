-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

/**
* USERS
* Note: This table contains user data. Users should only be able to view and update their own data.
*/
CREATE TABLE IF NOT EXISTS users (
  -- UUID from auth.users
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  -- The customer's billing address, stored in JSON format.
  billing_address JSONB,
  -- Stores your customer's payment instruments.
  payment_method JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE users
  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Can view own user data" ON users;
CREATE POLICY "Can view own user data"
  ON users FOR SELECT
  USING ((auth.uid()) = id);

DROP POLICY IF EXISTS "Can update own user data" ON users;
CREATE POLICY "Can update own user data"
  ON users FOR UPDATE
  USING ((auth.uid()) = id);

/**
* This trigger automatically creates a user entry when a new user signs up via Supabase Auth.
*/
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$
LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

/**
* CUSTOMERS
* Note: this is a private table that contains a mapping of user IDs to Polar customer IDs.
*/
CREATE TABLE IF NOT EXISTS customers (
  -- UUID from auth.users
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  -- The user's customer ID in Polar. User must not be able to update this.
  polar_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- No policies as this is a private table that the user must not have access to.

/**
* PRODUCTS
* Note: products are created and managed in Polar and synced to our DB.
*/
CREATE TABLE IF NOT EXISTS products (
  -- Product ID from Polar
  id TEXT PRIMARY KEY,
  -- Whether the product is currently available for purchase.
  active BOOLEAN DEFAULT TRUE,
  -- The product's name, meant to be displayable to the customer.
  name TEXT NOT NULL,
  -- The product's description
  description TEXT,
  -- A URL of the product image
  image TEXT,
  -- Set of key-value pairs for additional information
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE products
  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-only access" ON products;
CREATE POLICY "Allow public read-only access"
  ON products FOR SELECT
  USING (true);

/**
* PRICES
* Note: prices are created and managed in Polar and synced to our DB.
*/
CREATE TYPE pricing_type AS ENUM ('one_time', 'recurring');
CREATE TYPE pricing_plan_interval AS ENUM ('day', 'week', 'month', 'year');

CREATE TABLE IF NOT EXISTS prices (
  -- Price ID from Polar
  id TEXT PRIMARY KEY,
  -- The ID of the product that this price belongs to.
  product_id TEXT REFERENCES products,
  -- Whether the price can be used for new purchases.
  active BOOLEAN DEFAULT TRUE,
  -- A brief description of the price.
  description TEXT,
  -- The unit amount in the smallest currency unit
  unit_amount BIGINT,
  -- Three-letter ISO currency code, in lowercase.
  currency TEXT CHECK (char_length(currency) = 3),
  -- One of `one_time` or `recurring`
  type pricing_type,
  -- The frequency at which a subscription is billed.
  interval pricing_plan_interval,
  -- The number of intervals between subscription billings.
  interval_count INTEGER,
  -- Default number of trial days
  trial_period_days INTEGER,
  -- Additional information
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE prices
  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read-only access" ON prices;
CREATE POLICY "Allow public read-only access"
  ON prices FOR SELECT
  USING (true);

/**
* SUBSCRIPTIONS
* Note: subscriptions are created and managed in Polar and synced to our DB.
*/
CREATE TYPE subscription_status AS ENUM (
  'trialing', 'active', 'canceled', 'incomplete', 
  'incomplete_expired', 'past_due', 'unpaid'
);

CREATE TABLE IF NOT EXISTS subscriptions (
  -- Subscription ID from Polar
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  -- The status of the subscription object
  status subscription_status,
  -- Additional information
  metadata JSONB,
  -- ID of the price that created this subscription.
  price_id TEXT REFERENCES prices,
  -- Quantity multiplied by the unit amount
  quantity INTEGER,
  -- If true the subscription has been canceled
  cancel_at_period_end BOOLEAN,
  -- Time at which the subscription was created.
  created TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Start of the current period
  current_period_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- End of the current period
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- If the subscription has ended
  ended_at TIMESTAMP WITH TIME ZONE,
  -- A date in the future at which the subscription will automatically get canceled.
  cancel_at TIMESTAMP WITH TIME ZONE,
  -- If the subscription has been canceled
  canceled_at TIMESTAMP WITH TIME ZONE,
  -- If the subscription has a trial, the beginning of that trial.
  trial_start TIMESTAMP WITH TIME ZONE,
  -- If the subscription has a trial, the end of that trial.
  trial_end TIMESTAMP WITH TIME ZONE
);
ALTER TABLE subscriptions
  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Can only view own subs data" ON subscriptions;
CREATE POLICY "Can only view own subs data"
  ON subscriptions FOR SELECT
  USING ((auth.uid()) = user_id);

/**
* USER PURCHASES
* Tracks individual purchases made by users
*/
CREATE TABLE IF NOT EXISTS user_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users,
  project_id UUID REFERENCES projects,
  checkout_id TEXT REFERENCES polar_checkouts(checkout_id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own purchases" ON user_purchases;
CREATE POLICY "Users can view their own purchases"
  ON user_purchases FOR SELECT
  USING ((auth.uid()) = user_id);

/**
* Add tables to realtime publication
*/
ALTER PUBLICATION supabase_realtime ADD TABLE products, prices;
