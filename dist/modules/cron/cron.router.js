"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronRouter = void 0;
const express_1 = require("express");
const cron_service_1 = require("@/services/cron.service");
class CronRouter {
    constructor() {
        this.getRouter = () => {
            return this.router;
        };
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/cancel-expired-bookings', async (req, res, next) => {
            try {
                const result = await cron_service_1.CronService.cancelExpiredBookings();
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        });
        this.router.post('/send-checkin-reminders', async (req, res, next) => {
            try {
                const result = await cron_service_1.CronService.sendCheckinReminders();
                res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.CronRouter = CronRouter;
