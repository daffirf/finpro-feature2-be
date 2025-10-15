import { Request, Response, NextFunction } from 'express'
import { BookingService } from './booking.service'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import multer from 'multer'

export class BookingController {
  private bookingService: BookingService

  constructor() {
    this.bookingService = new BookingService()
  }

  createBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id
      const result = await this.bookingService.createBooking(userId, req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  getBookingById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id
      const bookingId = parseInt(req.params.id)
      const result = await this.bookingService.getBookingById(bookingId, userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id
      const bookingId = parseInt(req.params.id)
      const { reason } = req.body
      const result = await this.bookingService.cancelBooking(bookingId, userId, reason)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  uploadPaymentProof = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id
      const file = req.file
      const bookingId = parseInt(req.body.bookingId)

      if (!file || !bookingId) {
        return res.status(400).json({
          error: 'File dan booking ID diperlukan'
        })
      }

      // Validate file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
      const maxSize = 1024 * 1024 // 1MB

      if (file.size > maxSize) {
        return res.status(400).json({
          error: 'Ukuran file terlalu besar (maksimal 1MB)'
        })
      }

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          error: 'Format file harus JPG atau PNG'
        })
      }

      // Save file
      const uploadDir = join(process.cwd(), 'uploads', 'payments')
      await mkdir(uploadDir, { recursive: true })

      const fileName = `${bookingId}-${Date.now()}.${file.originalname.split('.').pop()}`
      const filePath = join(uploadDir, fileName)
      await writeFile(filePath, file.buffer)

      const fileUrl = `/uploads/payments/${fileName}`

      const result = await this.bookingService.uploadPaymentProof(userId, bookingId, fileUrl)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }

  getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id
      const result = await this.bookingService.getUserBookings(userId)
      res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  }
}
