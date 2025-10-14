import { Router } from 'express'
import { CronService } from '@/services/cron.service'

export class CronRouter {
  private router: Router

  constructor() {
    this.router = Router()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.post('/cancel-expired-bookings', async (req, res, next) => {
      try {
        const result = await CronService.cancelExpiredBookings()
        res.status(200).json(result)
      } catch (error) {
        next(error)
      }
    })

    this.router.post('/send-checkin-reminders', async (req, res, next) => {
      try {
        const result = await CronService.sendCheckinReminders()
        res.status(200).json(result)
      } catch (error) {
        next(error)
      }
    })
  }

  getRouter = () => {
    return this.router
  }
}
