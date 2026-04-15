-- Leads table (SQLite). Version 001.

CREATE TABLE IF NOT EXISTS leads (
    lead_id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    platform TEXT,
    profile_url TEXT,
    location TEXT,
    notes TEXT,
    subject TEXT,
    message TEXT,
    score REAL DEFAULT 0,
    tier TEXT,
    status TEXT,
    created_at TEXT,
    updated_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_platform ON leads(platform);
