-- Migration: Make phone column nullable for email-only registration
-- Date: 2026-04-02
-- Author: backend-auth-expert

-- Make phone column nullable
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- Add check constraint to ensure at least one of email or phone is set
ALTER TABLE users ADD CONSTRAINT chk_user_contact_required 
  CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- Verify the changes
\d users

-- Expected output should show:
-- phone character varying(11)
-- (no NOT NULL in column definition)
