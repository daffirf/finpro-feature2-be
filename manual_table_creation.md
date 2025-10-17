# Manual Table Creation Guide

## Option 1: Via Supabase SQL Editor

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Login and select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in sidebar
   - Click "New Query"

3. **Copy and Run SQL**
   ```sql
   -- Clean setup
   DROP TABLE IF EXISTS users CASCADE;
   DROP TYPE IF EXISTS UserRole CASCADE;
   
   -- Create role enum
   CREATE TYPE UserRole AS ENUM ('USER', 'TENANT', 'ADMIN');
   
   -- Enable UUID
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   
   -- Create users table
   CREATE TABLE users (
       id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
       email VARCHAR(255) UNIQUE NOT NULL,
       name VARCHAR(255) NOT NULL,
       phone VARCHAR(50),
       password VARCHAR(255) NOT NULL,
       role UserRole DEFAULT 'USER',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

4. **Verify Creation**
   ```sql
   SELECT * FROM users LIMIT 1;
   ```

## Option 2: Via Supabase Table Editor

1. **Open Table Editor**
2. **Click "Create a new table"**
3. **Table name:** `users`
4. **Add columns:**
   - `id` → UUID, Primary Key, Default: `uuid_generate_v4()`
   - `email` → Text, Unique, Not Null
   - `name` → Text, Not Null  
   - `phone` → Text, Nullable
   - `password` → Text, Not Null
   - `role` → Text, Default: 'USER', Not Null
   - `created_at` → Timestamp, Default: `now()`
   - `updated_at` → Timestamp, Default: `now()`

## Option 3: Test Registration Endpoints

**USER Registration:**
```json
POST http://localhost:8000/api/auth/register
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "USER"
}
```

**TENANT Registration:**
```json
POST http://localhost:8000/api/auth/register
{
    "name": "Hotel Owner",
    "email": "owner@hotel.com", 
    "password": "password123",
    "role": "TENANT"
}
```

**ADMIN Registration:**
```json
POST http://localhost:8000/api/auth/register
{
    "name": "System Admin",
    "email": "admin@system.com",
    "password": "password123",
    "role": "ADMIN"
}
```

## Expected Success Response
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
}
```
