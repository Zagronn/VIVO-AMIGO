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

CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    price NUMERIC(18, 2) NOT NULL CHECK (price >= 0),
    zone TEXT,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT 'GENERAL',
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SOLD', 'DRAFT')),
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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