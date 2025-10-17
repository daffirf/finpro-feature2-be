-- STEP 1: Create Users Table Only (for role selection test)

-- Clean up first
DROP TABLE IF EXISTS "users" CASCADE;
DROP INDEX IF EXISTS "users_email_key";
DROP TYPE IF EXISTS "UserRole" CASCADE;

-- Create extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create role enum
CREATE TYPE "UserRole" AS ENUM ('USER', 'TENANT', 'ADMIN');

-- Create users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Create index
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Verify
SELECT 'Users table created successfully!' as message,
       COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public';
