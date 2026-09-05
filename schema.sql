CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    national_id VARCHAR(32) UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'vendor' CHECK (role IN ('customer', 'vendor', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    parent_category_id UUID REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS category_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    data_type TEXT NOT NULL DEFAULT 'STRING' CHECK (data_type IN ('STRING', 'NUMBER', 'BOOLEAN')),
    is_filterable BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (category_id, key_name)
);

CREATE TABLE IF NOT EXISTS monetization_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    monthly_fee NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (monthly_fee >= 0),
    listing_free_limit INTEGER NOT NULL DEFAULT 0 CHECK (listing_free_limit >= 0),
    success_fee_bps INTEGER NOT NULL DEFAULT 0 CHECK (success_fee_bps BETWEEN 0 AND 10000),
    lead_fee NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (lead_fee >= 0),
    transaction_fee_bps INTEGER NOT NULL DEFAULT 0 CHECK (transaction_fee_bps BETWEEN 0 AND 10000),
    active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS merchant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES monetization_plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('trialing', 'active', 'past_due', 'cancelled')),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    renews_at TIMESTAMPTZ,
    UNIQUE (user_id, plan_id)
);

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    price NUMERIC(18, 2) NOT NULL CHECK (price >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'GTQ',
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    zone TEXT,
    description TEXT NOT NULL DEFAULT '',
    whatsapp_click_count INTEGER NOT NULL DEFAULT 0 CHECK (whatsapp_click_count >= 0),
    category TEXT NOT NULL DEFAULT 'GENERAL',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SOLD', 'DRAFT')),
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS listing_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    charge_type TEXT NOT NULL CHECK (charge_type IN ('listing_fee', 'promotion', 'success_fee')),
    amount NUMERIC(18, 2) NOT NULL CHECK (amount >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'GTQ',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'waived', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
    provider_id UUID REFERENCES users(id) ON DELETE SET NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    lead_type TEXT NOT NULL CHECK (lead_type IN ('SERVICE_REQUEST', 'TEST_DRIVE', 'WHOLESALE', 'DELIVERY')),
    zone TEXT,
    estimated_value NUMERIC(18, 2) CHECK (estimated_value >= 0),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'quoted', 'won', 'lost', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES marketplace_leads(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bid_amount NUMERIC(18, 2) NOT NULL CHECK (bid_amount >= 0),
    platform_fee NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
    fee_type TEXT NOT NULL CHECK (fee_type IN ('bid_fee', 'success_fee')),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'accepted', 'rejected', 'charged')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marketplace_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES users(id) ON DELETE SET NULL,
    listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES marketplace_leads(id) ON DELETE SET NULL,
    gross_amount NUMERIC(18, 2) NOT NULL CHECK (gross_amount >= 0),
    commission_bps INTEGER NOT NULL CHECK (commission_bps BETWEEN 0 AND 10000),
    platform_fee NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
    currency CHAR(3) NOT NULL DEFAULT 'GTQ',
    status TEXT NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'escrowed', 'delivered', 'settled', 'refunded', 'disputed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escrow_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID UNIQUE NOT NULL REFERENCES marketplace_transactions(id) ON DELETE CASCADE,
    held_amount NUMERIC(18, 2) NOT NULL CHECK (held_amount >= 0),
    buyer_fee_bps INTEGER NOT NULL CHECK (buyer_fee_bps BETWEEN 0 AND 10000),
    status TEXT NOT NULL DEFAULT 'funds_pending' CHECK (status IN ('funds_pending', 'funds_held', 'released', 'refunded', 'disputed')),
    release_after TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ad_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    lead_id UUID REFERENCES marketplace_leads(id) ON DELETE SET NULL,
    attribution_source TEXT NOT NULL DEFAULT 'direct',
    payout_amount_usd NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (payout_amount_usd >= 0),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'converted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escrow_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    currency CHAR(3) NOT NULL DEFAULT 'GTQ',
    available_balance NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
    held_balance NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (held_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, currency)
);

CREATE TABLE IF NOT EXISTS escrow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES escrow_wallets(id),
    amount NUMERIC(18, 2) NOT NULL CHECK (amount > 0),
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'hold', 'release', 'refund', 'withdrawal')),
    idempotency_key TEXT UNIQUE NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID REFERENCES users(id),
    tracking_code TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'in_transit', 'delivered', 'cancelled')),
    origin JSONB NOT NULL,
    destination JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pos_terminals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    terminal_code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pos_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    terminal_id UUID NOT NULL REFERENCES pos_terminals(id),
    client_transaction_id TEXT NOT NULL,
    total_amount NUMERIC(18, 2) NOT NULL CHECK (total_amount > 0),
    currency CHAR(3) NOT NULL DEFAULT 'GTQ',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'invoiced', 'failed')),
    sold_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (terminal_id, client_transaction_id)
);

CREATE TABLE IF NOT EXISTS pos_sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES pos_sales(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(18, 2) NOT NULL CHECK (unit_price >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 12.00 CHECK (tax_rate >= 0)
);

CREATE TABLE IF NOT EXISTS fel_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID UNIQUE NOT NULL REFERENCES pos_sales(id),
    sat_uuid TEXT UNIQUE,
    invoice_number TEXT,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'issued', 'rejected')),
    response JSONB NOT NULL DEFAULT '{}'::jsonb,
    issued_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_sales_terminal_created ON pos_sales(terminal_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_active ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_embedding_hnsw ON listings USING hnsw (embedding vector_cosine_ops) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_leads_provider_status ON marketplace_leads(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_status_created ON marketplace_transactions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_leads_campaign_status ON ad_leads(campaign_id, status);