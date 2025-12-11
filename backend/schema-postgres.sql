-- MedFutureAI Database Schema for PostgreSQL
-- This schema stores user authentication and subscription data
-- User profiles (Digital Twin data) remain in localStorage for privacy

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    owner_name TEXT NOT NULL,
    plan_type TEXT NOT NULL CHECK(plan_type IN ('monthly', 'yearly')),
    status TEXT NOT NULL CHECK(status IN ('active', 'frozen', 'banned')) DEFAULT 'active',
    is_used INTEGER NOT NULL DEFAULT 0,
    generated_at TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_code ON users(code);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_expiry ON users(expiry_date);

-- Admin authentication table (for enhanced security)
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Audit log for admin actions (for security tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_username TEXT NOT NULL,
    action TEXT NOT NULL,
    target_code TEXT,
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin (Password: Fm@2045!MedX)
-- In production, use bcrypt for hashing
INSERT INTO admins (username, password_hash) 
VALUES ('FutureMed_AmrX', '$2b$10$YourHashedPasswordHere')
ON CONFLICT (username) DO NOTHING;
