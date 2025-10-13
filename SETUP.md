# Setup Guide - Property Renting Backend

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm atau yarn

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd finpro-feature2-be
npm install
```

### 2. Environment Variables

Buat file `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/property_rent"

# JWT Secret (WAJIB diganti di production!)
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cron Secret
CRON_SECRET="your-cron-secret-key"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database
npx prisma db push

# (Optional) Seed database
npm run db:seed
```

### 4. Create Upload Directories

```bash
mkdir -p uploads/properties
mkdir -p uploads/payments
```

### 5. Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## 🔧 Setup Email (Gmail)

### 1. Enable 2-Factor Authentication
- Buka Google Account Settings
- Security → 2-Step Verification → Enable

### 2. Generate App Password
- Security → App passwords
- Select app: Mail
- Select device: Other (Custom name)
- Copy generated password ke `SMTP_PASS`

## ⏰ Setup Cron Jobs (Production)

### Auto-Cancel Expired Bookings

**Frequency:** Setiap 10 menit

**Endpoint:** `GET /api/cron/cancel-expired-bookings`

**Header:** `Authorization: Bearer YOUR_CRON_SECRET`

**Setup di Vercel:**
```json
{
  "crons": [
    {
      "path": "/api/cron/cancel-expired-bookings",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

### H-1 Check-in Reminders

**Frequency:** Setiap hari jam 9 pagi

**Endpoint:** `GET /api/cron/send-checkin-reminders`

**Header:** `Authorization: Bearer YOUR_CRON_SECRET`

**Setup di Vercel:**
```json
{
  "crons": [
    {
      "path": "/api/cron/send-checkin-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## 📊 Database Schema

```
User ─┬─ Tenant ── Property ─┬─ Room ── Booking
      │                      └─ PriceRule
      └─ Booking ── Review
```

## 🧪 Testing

```bash
# Check database connection
npx prisma studio

# Test API endpoints
curl http://localhost:3000/api/auth/register -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"USER"}'
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000
```

### Prisma Client Not Generated
```bash
npx prisma generate
```

### Database Connection Error
1. Pastikan PostgreSQL running
2. Check DATABASE_URL di .env.local
3. Test connection: `npx prisma db pull`

### Email Not Sending
1. Check SMTP credentials
2. Verify Gmail App Password
3. Check firewall/network

## 📦 Production Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel dashboard
```

### Environment Variables (Production)

⚠️ **PENTING:** Set di Vercel dashboard:
- `DATABASE_URL`
- `JWT_SECRET` (WAJIB diganti!)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`

## 📝 API Documentation

Lihat README.md untuk dokumentasi lengkap semua endpoint.

### Key Endpoints:

**Authentication:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

**User:**
- `GET /api/user/bookings` (with pagination)
- `POST /api/bookings`
- `POST /api/bookings/payment-proof`
- `POST /api/bookings/[id]/cancel`

**Tenant:**
- `GET /api/tenant/bookings` (with pagination)
- `POST /api/tenant/bookings/[id]/confirm`
- `POST /api/tenant/bookings/[id]/reject`
- `GET /api/tenant/reports`

## 🔐 Security Checklist

- [ ] JWT_SECRET diganti (minimal 32 karakter)
- [ ] CRON_SECRET diset
- [ ] Database credentials aman
- [ ] SMTP credentials aman
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (production)

## 💡 Tips

1. **Development:** Gunakan `npm run dev` dengan hot reload
2. **Database:** Gunakan `npx prisma studio` untuk GUI
3. **Logs:** Check console untuk errors
4. **Testing:** Test pagination dengan `?page=1&limit=10`

## 📞 Support

Jika ada masalah, check:
1. Logs di terminal
2. Prisma Studio untuk data
3. Browser console untuk client errors
4. README.md untuk dokumentasi API
