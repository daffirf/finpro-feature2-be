# 🚀 Panduan Setup Backend dengan Data

Panduan lengkap untuk setup backend API dengan database dan data dummy.

## 📋 Prerequisites

- ✅ Node.js 18 atau lebih baru
- ✅ Docker Desktop (recommended) atau PostgreSQL lokal
- ✅ Git

## 🐳 Step 1: Setup Database dengan Docker

### 1.1. Start Docker Desktop

Pastikan Docker Desktop sudah running di Windows Anda.

### 1.2. Start PostgreSQL Container

Jalankan perintah berikut di terminal:

```bash
docker-compose up -d
```

Ini akan:
- Download PostgreSQL image (jika belum ada)
- Membuat container bernama `property-rent-db`
- Database akan running di `localhost:5432`
- Username: `postgres`
- Password: `postgres123`
- Database name: `property_rent`

### 1.3. Cek Status Container

```bash
docker ps
```

Anda harus melihat container `property-rent-db` dengan status `Up`.

### 1.4. Stop Container (jika diperlukan)

```bash
docker-compose down
```

### 1.5. Stop dan Hapus Data (reset total)

```bash
docker-compose down -v
```

## 📦 Step 2: Install Dependencies

```bash
npm install
```

## ⚙️ Step 3: Setup Environment Variables

File `.env.local` sudah dibuat otomatis dengan konfigurasi:

```env
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/property_rent?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production-2024"
```

**Note:** Untuk production, ganti `JWT_SECRET` dengan string random yang kuat!

## 🗄️ Step 4: Setup Database Schema

### 4.1. Generate Prisma Client

```bash
npx prisma generate
```

### 4.2. Push Schema ke Database

```bash
npm run db:push
```

Atau menggunakan prisma langsung:

```bash
npx prisma db push
```

Ini akan membuat semua tabel di database sesuai schema Prisma.

## 🌱 Step 5: Seed Database dengan Data Dummy

```bash
npm run db:seed
```

Ini akan mengisi database dengan data:

### Data yang Akan Dibuat:

#### 👤 **4 Users:**
1. **Regular User 1**
   - Email: `user@example.com`
   - Password: `password123`
   - Name: John Doe

2. **Regular User 2**
   - Email: `user2@example.com`
   - Password: `password123`
   - Name: Jane Smith

3. **Tenant 1**
   - Email: `tenant1@example.com`
   - Password: `password123`
   - Name: Budi Santoso
   - Business: Bali Villa Paradise

4. **Tenant 2**
   - Email: `tenant2@example.com`
   - Password: `password123`
   - Name: Siti Rahayu
   - Business: Jakarta Apartement

#### 🏢 **2 Tenants:**
- Bali Villa Paradise
- Jakarta Apartement

#### 🏠 **4 Properties:**
1. Villa Sunset View (Bali) - Rp 1.500.000/malam
2. Villa Ocean Breeze (Bali) - Rp 2.000.000/malam
3. Luxury Apartement Sudirman (Jakarta) - Rp 800.000/malam
4. Modern Studio Senopati (Jakarta) - Rp 500.000/malam

#### 🛏️ **5 Rooms:**
- Various room types across all properties

#### 💰 **3 Price Rules:**
- Weekend pricing
- Holiday season pricing
- Weekday discounts

#### 📅 **3 Bookings:**
- Different statuses (CONFIRMED, PENDING_PAYMENT, COMPLETED)

#### ⭐ **1 Review:**
- 5-star review dengan response dari tenant

## 🚀 Step 6: Run Development Server

```bash
npm run dev
```

Server akan berjalan di: **http://localhost:3000**

## 🧪 Step 7: Test API

### Test 1: Register User Baru

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "USER"
}
```

### Test 2: Login

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response akan berisi `token` yang bisa Anda gunakan untuk API lainnya.

### Test 3: Get User Profile

```bash
GET http://localhost:3000/api/auth/me
Authorization: Bearer <your-token-here>
```

### Test 4: Search Properties

```bash
GET http://localhost:3000/api/properties/search?city=Bali
```

### Test 5: Get Property Detail

```bash
GET http://localhost:3000/api/properties/<property-id>
```

## 🔍 Step 8: View Database (Optional)

### Prisma Studio

Prisma Studio adalah GUI untuk melihat dan mengedit data:

```bash
npm run db:studio
```

Akan membuka browser di: **http://localhost:5555**

Di sini Anda bisa:
- ✅ Lihat semua tabel dan data
- ✅ Edit data langsung
- ✅ Tambah data baru
- ✅ Hapus data

## 🔄 Reset Database

Jika ingin reset database dan isi ulang dengan data dummy:

```bash
npm run db:reset
```

Atau manual:

```bash
npx prisma db push --force-reset
npm run db:seed
```

## 📊 Database Commands Cheat Sheet

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database
npm run db:push
# atau
npx prisma db push

# Seed database
npm run db:seed

# Reset dan seed ulang
npm run db:reset

# Buka Prisma Studio
npm run db:studio

# Migrate database (production)
npx prisma migrate dev --name init
```

## 🐛 Troubleshooting

### Error: Can't reach database server

**Solusi:**
1. Pastikan Docker Desktop running
2. Cek container: `docker ps`
3. Restart container: `docker-compose restart`
4. Cek logs: `docker-compose logs`

### Error: P1001 - Connection refused

**Solusi:**
1. Pastikan PostgreSQL container running
2. Cek port 5432 tidak digunakan aplikasi lain
3. Restart Docker Desktop

### Error: Table does not exist

**Solusi:**
```bash
npx prisma generate
npx prisma db push
```

### Error saat seed: Cannot find module

**Solusi:**
```bash
npm install
npx prisma generate
```

## 🎯 Testing dengan Postman/Thunder Client

### Import Collection

Anda bisa menggunakan tools seperti:
- Postman
- Thunder Client (VS Code extension)
- Insomnia

### Authentication Flow

1. **Register/Login** → Dapat token
2. **Simpan token** di environment variable
3. **Gunakan token** di header semua request yang memerlukan auth:
   ```
   Authorization: Bearer <your-token>
   ```

## 📝 Struktur Data

### User Roles
- `USER`: Customer yang bisa booking
- `TENANT`: Pemilik property
- `ADMIN`: Administrator (belum diimplementasi)

### Booking Status Flow
1. `PENDING_PAYMENT` → User buat booking
2. `PAYMENT_CONFIRMED` → User upload bukti bayar
3. `CONFIRMED` → Tenant konfirmasi
4. `COMPLETED` → Selesai check-out
5. `CANCELLED` → Dibatalkan

## 🎉 Selesai!

Backend Anda sekarang sudah siap dengan:
- ✅ Database running
- ✅ Schema di-apply
- ✅ Data dummy terisi
- ✅ API ready to use

## 🔗 Useful Links

- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js API Routes**: https://nextjs.org/docs/api-routes/introduction
- **Docker Compose**: https://docs.docker.com/compose/

## 📧 Support

Jika ada masalah, cek:
1. Docker logs: `docker-compose logs`
2. Application logs di terminal
3. Prisma Studio untuk cek data: `npm run db:studio`

---

**Happy Coding! 🚀**

