import { Router } from 'express'
import { BookingController } from './booking.controller'
import { JwtMiddleware } from '@/middlewares/jwt.middleware'
import { rbac } from '@/middlewares/rbac.middleware'
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
    // All booking routes require authentication AND user role (tenant cannot book)
    const auth = this.jwtMiddleware.verifyToken()
    
    // Only verified USER can create bookings (tenant tidak bisa booking)
    this.router.post('/', auth, rbac.onlyUser, this.bookingController.createBooking)
    
    // Only verified USER can view their bookings
    this.router.get('/user', auth, rbac.onlyUser, this.bookingController.getUserBookings)
    
    // Only verified USER can upload payment proof
    this.router.post('/payment-proof', auth, rbac.onlyUser, upload.single('file'), this.bookingController.uploadPaymentProof)
    
    // Only verified USER can get booking details
    this.router.get('/:id', auth, rbac.onlyUser, this.bookingController.getBookingById)
    
    // Only verified USER can cancel booking
    this.router.post('/:id/cancel', auth, rbac.onlyUser, this.bookingController.cancelBooking)
  }

  getRouter = () => {
    return this.router
  }
}
