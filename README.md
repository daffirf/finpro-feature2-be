# Property Renting Backend API

Backend API untuk aplikasi penyewaan properti dengan fitur perbandingan harga dinamis berdasarkan tanggal dan hari libur.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.16-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)

## 📋 Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Database](#database)
- [API Endpoints](#api-endpoints)
- [Autentikasi](#autentikasi)
- [Upload File](#upload-file)
- [Development](#development)
- [Deployment](#deployment)

## 🚀 Fitur Utama

### Autentikasi & Otorisasi
- ✅ JWT-based authentication
- ✅ Role-based access control (USER, TENANT, ADMIN)
- ✅ Secure password hashing dengan bcryptjs
- ✅ Protected API routes dengan middleware

### Manajemen Properti
- ✅ CRUD properti untuk tenant
- ✅ Manajemen kamar/ruangan
- ✅ Upload gambar properti
- ✅ Pencarian dan filter properti
- ✅ Harga dinamis berdasarkan tanggal

### Sistem Booking
- ✅ Pembuatan booking dengan validasi
- ✅ Upload bukti pembayaran
- ✅ Konfirmasi/reject booking oleh tenant
- ✅ Status tracking booking
- ✅ Riwayat booking user

### Review & Rating
- ✅ Review properti oleh user
- ✅ Response review oleh tenant
- ✅ Rating system (1-5)

### Price Rules (Aturan Harga)
- ✅ Set harga khusus per tanggal
- ✅ Harga hari libur otomatis
- ✅ Perhitungan harga real-time
- ✅ Kalender harga dinamis

### Reporting & Analytics
- ✅ Dashboard statistik tenant
- ✅ Laporan penjualan
- ✅ Analisis booking

### Notifikasi
- ✅ Email notifikasi otomatis
- ✅ Konfirmasi booking
- ✅ Update status pembayaran

## 🛠 Teknologi

- **Runtime**: Node.js
- **Framework**: Next.js 15 (API Routes)
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **File Upload**: Multer
- **Email**: Nodemailer
- **Date Utils**: date-fns

## 📦 Instalasi

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm atau yarn

### Clone Repository

```bash
git clone https://github.com/daffirf/finpro-feature2-be.git
cd finpro-feature2-be
```

### Install Dependencies

```bash
npm install
```

## ⚙️ Konfigurasi

### 1. Environment Variables

Buat file `.env.local` dengan konfigurasi berikut:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/property_rent?schema=public"

# JWT Secret (gunakan string random yang kuat)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Email Configuration (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Setup Upload Directory

```bash
mkdir -p uploads/properties
mkdir -p uploads/payments
```

## 🗄️ Database

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Migrations

```bash
npx prisma db push
```

### (Optional) Seed Database

```bash
npx prisma db seed
```

### Database Schema

#### Models Utama:

- **User**: Pengguna sistem
- **Tenant**: Profil pemilik properti
- **Property**: Data properti
- **Room**: Kamar dalam properti
- **Booking**: Pemesanan
- **Payment**: Pembayaran
- **Review**: Review dan rating
- **PriceRule**: Aturan harga dinamis

### ER Diagram

```
User ─┬─ Tenant ── Property ── Room
      │                        │
      └─ Booking ──────────────┘
         │
         ├─ Payment
         └─ Review
```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register user/tenant | - |
| POST | `/api/auth/login` | Login | - |
| POST | `/api/auth/logout` | Logout | ✅ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Properties

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/properties/search` | Search properties | - |
| GET | `/api/properties/[id]` | Get property detail | - |
| GET | `/api/properties/[id]/prices` | Get price calendar | - |

### Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/bookings` | Create booking | ✅ USER |
| GET | `/api/bookings/[id]` | Get booking detail | ✅ |
| POST | `/api/bookings/payment-proof` | Upload payment proof | ✅ USER |

### User

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/user/bookings` | Get user bookings | ✅ USER |

### Tenant Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/tenant/dashboard` | Dashboard stats | ✅ TENANT |
| GET | `/api/tenant/properties` | List properties | ✅ TENANT |
| POST | `/api/tenant/properties` | Create property | ✅ TENANT |
| GET | `/api/tenant/properties/[id]` | Get property | ✅ TENANT |
| PATCH | `/api/tenant/properties/[id]` | Update property | ✅ TENANT |
| DELETE | `/api/tenant/properties/[id]` | Delete property | ✅ TENANT |
| POST | `/api/tenant/rooms` | Create room | ✅ TENANT |
| GET | `/api/tenant/bookings` | List bookings | ✅ TENANT |
| POST | `/api/tenant/bookings/[id]/confirm` | Confirm booking | ✅ TENANT |
| POST | `/api/tenant/bookings/[id]/reject` | Reject booking | ✅ TENANT |
| GET | `/api/tenant/reports` | Sales reports | ✅ TENANT |
| POST | `/api/tenant/price-rules` | Create price rule | ✅ TENANT |

### Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/reviews` | Create review | ✅ USER |
| POST | `/api/reviews/[id]/response` | Respond to review | ✅ TENANT |

### Rooms

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/rooms/[id]/price` | Get room price | - |

### File Upload

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/uploads/[...path]` | Get uploaded file | - |

## 🔐 Autentikasi

### Register

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER" // atau "TENANT"
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Routes

Untuk mengakses endpoint yang memerlukan autentikasi, sertakan token di header:

```bash
Authorization: Bearer <your-jwt-token>
```

## 📤 Upload File

### Upload Gambar Properti

```bash
POST /api/tenant/properties
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "name": "Villa Bali",
  "description": "Beautiful villa...",
  "images": [File1, File2, ...],
  // ... other fields
}
```

### Upload Bukti Pembayaran

```bash
POST /api/bookings/payment-proof
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "bookingId": "...",
  "paymentProof": File
}
```

### Validasi File:
- **Format**: JPG, JPEG, PNG
- **Max Size**: 1MB per file
- **Max Images**: 5 untuk properti

## 💻 Development

### Run Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### Run Linter

```bash
npm run lint
```

### Run Tests

```bash
npm test
```

### View Database (Prisma Studio)

```bash
npx prisma studio
```

## 📊 Status Booking

- `PENDING_PAYMENT`: Menunggu upload bukti pembayaran
- `PAYMENT_CONFIRMED`: Bukti pembayaran sudah diupload
- `CONFIRMED`: Booking dikonfirmasi tenant
- `CANCELLED`: Booking dibatalkan
- `COMPLETED`: Booking selesai

## 🚀 Deployment

### Build Production

```bash
npm run build
npm start
```

### Environment Variables Production

Pastikan semua environment variables sudah diset di production:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="strong-random-secret"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy ke VPS

1. Clone repository
2. Install dependencies
3. Setup environment variables
4. Build project
5. Run dengan PM2:

```bash
pm2 start npm --name "property-api" -- start
```

## 📝 API Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## 🔧 Troubleshooting

### Database Connection Error

```bash
# Reset database
npx prisma db push --force-reset

# Regenerate client
npx prisma generate
```

### JWT Token Invalid

Pastikan `JWT_SECRET` di `.env.local` sama dengan yang digunakan saat generate token.

### Upload File Error

Pastikan folder `uploads/` memiliki permission yang benar:

```bash
chmod -R 755 uploads/
```

## 📚 Dokumentasi Tambahan

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [TypeScript](https://www.typescriptlang.org/docs)

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 👥 Contact

- **Repository**: [https://github.com/daffirf/finpro-feature2-be](https://github.com/daffirf/finpro-feature2-be)
- **Email**: your-email@example.com