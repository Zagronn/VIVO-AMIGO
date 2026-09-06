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

CREATE TABLE IF NOT EXISTS corporate_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    legal_name TEXT NOT NULL,
    nit TEXT NOT NULL,
    mercantile_registration_number TEXT NOT NULL,
    mercantile_document_url TEXT NOT NULL,
    tax_certificate_url TEXT NOT NULL,
    verification_level TEXT NOT NULL DEFAULT 'submitted' CHECK (verification_level IN ('submitted', 'ai_review', 'government_verified', 'admin_approved', 'rejected', 'expired')),
    government_reference TEXT,
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type TEXT NOT NULL CHECK (resource_type IN ('CORPORATE_ACCOUNT', 'PROPERTY_LISTING', 'TRANSACTION', 'ESCROW_RELEASE')),
    resource_id UUID NOT NULL,
    admin_user_id UUID NOT NULL REFERENCES users(id),
    decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected', 'returned')),
    notes TEXT,
    decided_at TIMESTAMPTZ NOT NULL DEFAULT now()
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

CREATE TABLE IF NOT EXISTS job_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    corporate_verification_id UUID NOT NULL REFERENCES corporate_verifications(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    job_type TEXT NOT NULL CHECK (job_type IN ('EMPLOYMENT', 'SERVICE_CONTRACT', 'SUBCONTRACTOR')),
    zone TEXT,
    salary_min NUMERIC(18, 2) CHECK (salary_min >= 0),
    salary_max NUMERIC(18, 2) CHECK (salary_max >= salary_min),
    currency CHAR(3) NOT NULL DEFAULT 'GTQ',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'ARCHIVED', 'FILLED', 'CANCELLED')),
    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '15 days'),
    renewal_count INTEGER NOT NULL DEFAULT 0 CHECK (renewal_count >= 0),
    early_closed_at TIMESTAMPTZ,
    early_close_reason TEXT,
    hiring_commitment_signed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_listing_renewals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_listing_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES users(id),
    previous_expires_at TIMESTAMPTZ NOT NULL,
    next_expires_at TIMESTAMPTZ NOT NULL,
    renewal_fee NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (renewal_fee >= 0),
    status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'paid', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hiring_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_listing_id UUID UNIQUE NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
    employer_id UUID NOT NULL REFERENCES users(id),
    contract_url TEXT NOT NULL,
    signed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'signed' CHECK (status IN ('signed', 'fulfilled', 'breached', 'voided'))
);

CREATE TABLE IF NOT EXISTS job_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_listing_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
    candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    match_score NUMERIC(5, 2) NOT NULL CHECK (match_score BETWEEN 0 AND 100),
    status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'contacted', 'accepted', 'rejected', 'hired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (job_listing_id, candidate_id)
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
    delivery_code TEXT UNIQUE,
    delivery_code_issued_at TIMESTAMPTZ,
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

CREATE TABLE IF NOT EXISTS gmv_reporting_daily (
    report_date DATE PRIMARY KEY,
    gross_merchandise_value_usd NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (gross_merchandise_value_usd >= 0),
    transaction_count INTEGER NOT NULL DEFAULT 0 CHECK (transaction_count >= 0),
    platform_revenue_usd NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (platform_revenue_usd >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS escrow_reporting_snapshots (
    snapshot_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    held_amount_gtq NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (held_amount_gtq >= 0),
    active_transaction_count INTEGER NOT NULL DEFAULT 0 CHECK (active_transaction_count >= 0),
    released_amount_gtq NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (released_amount_gtq >= 0)
);

CREATE TABLE IF NOT EXISTS vivo_assist_subscription_metrics (
    metric_date DATE PRIMARY KEY,
    active_subscriptions INTEGER NOT NULL DEFAULT 0 CHECK (active_subscriptions >= 0),
    completed_requests INTEGER NOT NULL DEFAULT 0 CHECK (completed_requests >= 0),
    gross_revenue_gtq NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (gross_revenue_gtq >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profile_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_code TEXT NOT NULL,
    source_event_id TEXT NOT NULL,
    awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, badge_code)
);

CREATE TABLE IF NOT EXISTS wallet_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reward_type TEXT NOT NULL CHECK (reward_type IN ('LISTING_DOPING_CREDIT', 'ESCROW_COMMISSION_DISCOUNT_50')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    source_event_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    ,UNIQUE (user_id, reward_type, source_event_id)
);

CREATE TABLE IF NOT EXISTS community_reward_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source TEXT NOT NULL CHECK (source IN ('VIVO_CRITIQUE', 'VIVO_VOZ')),
    status TEXT NOT NULL CHECK (status = 'DEPLOYED_LIVE'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_changelog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_event_id TEXT UNIQUE NOT NULL,
    message TEXT NOT NULL,
    author_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_escrow_closures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_listing_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES marketplace_transactions(id),
    employer_confirmed_at TIMESTAMPTZ,
    work_completed_at TIMESTAMPTZ,
    provider_paid_at TIMESTAMPTZ,
    platform_fee NUMERIC(18, 2) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'funds_held', 'work_completed', 'released', 'disputed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('LIBERTAD_GRAVAMEN', 'NOTARIZED_TITLE', 'LOCATION_PROOF')),
    document_url TEXT NOT NULL,
    ocr_status TEXT NOT NULL DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'passed', 'failed', 'manual_review')),
    seal_detected BOOLEAN,
    document_date DATE,
    extracted_area NUMERIC(14, 2),
    extracted_zone TEXT,
    admin_status TEXT NOT NULL DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS signed_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID UNIQUE NOT NULL REFERENCES marketplace_transactions(id) ON DELETE CASCADE,
    buyer_signed_at TIMESTAMPTZ,
    seller_signed_at TIMESTAMPTZ,
    contract_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partially_signed', 'fully_signed', 'voided')),
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
CREATE INDEX IF NOT EXISTS idx_job_listings_active_expiry ON job_listings(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_job_matches_candidate ON job_matches(candidate_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_provider_status ON marketplace_leads(provider_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_status_created ON marketplace_transactions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_leads_campaign_status ON ad_leads(campaign_id, status);