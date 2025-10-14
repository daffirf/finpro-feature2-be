import { Router } from 'express'
import { BookingController } from './booking.controller'
import { JwtMiddleware } from '@/middlewares/jwt.middleware'
import multer from 'multer'

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 } // 1MB
})

export class BookingRouter {
  private router: Router
  private bookingController: BookingController
  private jwtMiddleware: JwtMiddleware

  constructor() {
    this.router = Router()
    this.bookingController = new BookingController()
    this.jwtMiddleware = new JwtMiddleware()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    // All booking routes require authentication
    this.router.use(this.jwtMiddleware.verifyToken())

    // Create booking
    this.router.post('/', this.bookingController.createBooking)
    
    // Get user bookings
    this.router.get('/user', this.bookingController.getUserBookings)
    
    // Upload payment proof
    this.router.post('/payment-proof', upload.single('file'), this.bookingController.uploadPaymentProof)
    
    // Get booking by ID
    this.router.get('/:id', this.bookingController.getBookingById)
    
    // Cancel booking
    this.router.post('/:id/cancel', this.bookingController.cancelBooking)
  }

  getRouter = () => {
    return this.router
  }
}
