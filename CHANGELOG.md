# Changelog

## [1.2.0] - Requirements Compliance Update

### ✅ Fixed Critical Issues
- **Cancel Order Logic** - User hanya bisa cancel sebelum upload bukti bayar (PENDING_PAYMENT only)
- **Reject Payment Logic** - Status kembali ke PENDING_PAYMENT, bukan CANCELLED
- **Reject Payment** - Payment proof dihapus saat ditolak

### ✅ Added Missing Endpoints
- **POST /api/tenant/bookings/[id]/cancel** - Tenant cancel user order
- **GET /api/tenant/properties/[id]/calendar** - Property availability calendar (per property)
- **GET /api/tenant/properties/calendar** - All properties calendar summary

### ✅ Enhanced Features
- **User Bookings** - Added date range filters (checkInStart, checkInEnd, checkOutStart, checkOutEnd)
- **Sales Report** - Added filters by propertyId, userId, transactionStatus
- **Sales Report** - Added sort by totalPrice

### 📊 Requirements Compliance
- User Transaction Process: 100% ✅
- Tenant Transaction Management: 100% ✅
- Review Feature: 100% ✅
- Report & Analysis: 100% ✅

---

## [1.1.0] - Refactored & Optimized

### ✅ Added
- **Pagination System** 
  - `src/lib/pagination.ts` - Helper functions untuk pagination
  - Pagination di semua list endpoints (user/bookings, tenant/bookings, properties/search)
  - Meta information (page, limit, total, hasNext, hasPrev)

- **Booking Utilities**
  - `src/lib/booking-utils.ts` - Shared utilities untuk booking
  - `checkRoomAvailability()` - Check room availability
  - `validateBookingDates()` - Validate check-in/out dates
  - `calculateBookingPrice()` - Calculate price dengan price rules
  - `isPaymentExpired()` - Check payment timeout (1 hour)

- **Email Service**
  - `src/lib/email.ts` - Email notification service
  - `sendBookingConfirmation()` - Konfirmasi booking
  - `sendPaymentRejection()` - Reject payment
  - `sendCheckInReminder()` - H-1 reminder
  - `sendBookingCancellation()` - Cancel notification

- **Error Handling**
  - `src/lib/errors.ts` - Custom error classes
  - `ApiError`, `ValidationError`, `UnauthorizedError`, dll
  - `handlePrismaError()` - Prisma error handler
  - `handleZodError()` - Zod validation error handler

- **Missing Endpoints**
  - `GET /api/tenant/bookings` - List bookings dengan pagination
  - `POST /api/bookings/[id]/cancel` - Cancel booking

- **Cron Jobs**
  - `GET /api/cron/cancel-expired-bookings` - Auto-cancel expired bookings
  - `GET /api/cron/send-checkin-reminders` - H-1 check-in reminders

### 🔧 Fixed
- **File Upload Validation**
  - Strict validation untuk JPG/PNG only
  - File extension validation
  - File type validation lebih ketat

- **Booking Logic**
  - Date validation (check-in < check-out, tidak masa lalu)
  - Max 30 days booking limit
  - Proper price calculation dengan price rules

- **Reject Booking**
  - Status diubah ke CANCELLED (sebelumnya: PENDING_PAYMENT)
  - Email notification saat reject

- **Middleware**
  - Public routes pattern diperbaiki
  - Lebih efficient route checking

- **N+1 Query Problem**
  - Properties search sekarang 1 query untuk availability check
  - Menggunakan Set untuk O(1) lookup

### 🚀 Optimized
- **Function Size**
  - `properties/search/route.ts`: 159 lines → 124 lines
  - `tenant/reports/route.ts`: 128 lines → 119 lines
  - Split menjadi smaller functions (< 15 lines per function)

- **Code Duplication**
  - Extracted `checkRoomAvailability()` ke shared utility
  - Extracted pagination logic ke helper
  - Extracted email functions ke service

- **Performance**
  - Parallel database queries dengan `Promise.all()`
  - Reduced N+1 queries
  - Optimized availability checking

### 📚 Documentation
- **Added Files:**
  - `SETUP.md` - Comprehensive setup guide
  - `CHANGELOG.md` - This file
  - Updated `env.example` with CRON_SECRET

### 🗑️ Removed
- **Unused Dependencies**
  - Removed `clsx` and `twMerge` from utils.ts (frontend only)
  
### ⚠️ Known Issues
- Console.log masih ada di beberapa file (perlu dihapus untuk production)
- Property availability calendar belum diimplementasi
- Rate limiting belum diimplementasi

---

## [1.0.0] - Initial Release

### Features
- Authentication (JWT-based)
- Property management
- Booking system
- Review & rating
- Price rules
- Basic reporting

