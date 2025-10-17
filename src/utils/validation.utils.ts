import { z } from 'zod'

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  phone: z.string().optional(),
  role: z.enum(['USER', 'TENANT']).default('USER')
})

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password harus diisi')
})

// Property schemas
export const createPropertySchema = z.object({
  name: z.string().min(2, 'Nama properti minimal 2 karakter'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
  address: z.string().min(5, 'Alamat minimal 5 karakter'),
  city: z.string().min(2, 'Kota minimal 2 karakter'),
  basePrice: z.number().positive('Harga harus positif'),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional()
})

export const createRoomSchema = z.object({
  propertyId: z.string().min(1, 'Property ID harus diisi'),
  name: z.string().min(2, 'Nama kamar minimal 2 karakter'),
  description: z.string().optional(),
  capacity: z.number().int().positive('Kapasitas harus positif'),
  basePrice: z.number().positive('Harga harus positif'),
  images: z.array(z.string()).optional()
})

// Booking schemas
export const createBookingSchema = z.object({
  propertyId: z.string().min(1, 'Property ID harus diisi'),
  roomId: z.string().min(1, 'Room ID harus diisi'),
  checkIn: z.string().datetime('Tanggal check-in tidak valid'),
  checkOut: z.string().datetime('Tanggal check-out tidak valid'),
  guests: z.number().int().positive('Jumlah tamu harus positif'),
  notes: z.string().optional()
})

// Search schemas
export const searchSchema = z.object({
  city: z.string().min(1, 'Kota harus diisi'),
  checkIn: z.string().datetime('Tanggal check-in tidak valid'),
  checkOut: z.string().datetime('Tanggal check-out tidak valid'),
  guests: z.number().int().positive('Jumlah tamu harus positif')
})

// Review schemas
export const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID harus diisi'),
  rating: z.number().int().min(1).max(5, 'Rating harus 1-5'),
  comment: z.string().min(10, 'Komentar minimal 10 karakter')
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File harus diupload' }),
  maxSize: z.number().default(1024 * 1024), // 1MB
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png'])
})

export function validateFile(file: File, maxSize: number = 1024 * 1024, allowedTypes: string[] = ['image/jpeg', 'image/png']): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return { valid: false, error: 'Ukuran file terlalu besar (maksimal 1MB)' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Tipe file tidak didukung (hanya JPG/PNG)' }
  }
  
  return { valid: true }
}

