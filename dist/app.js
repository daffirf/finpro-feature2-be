"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const error_middleware_1 = require("./middlewares/error.middleware");
const auth_router_1 = require("./modules/auth/auth.router");
const booking_router_1 = require("./modules/booking/booking.router");
const property_router_1 = require("./modules/property/property.router");
const review_router_1 = require("./modules/review/review.router");
const room_router_1 = require("./modules/room/room.router");
const tenant_router_1 = require("./modules/tenant/tenant.router");
const user_router_1 = require("./modules/user/user.router");
const cron_router_1 = require("./modules/cron/cron.router");
const upload_router_1 = require("./modules/upload/upload.router");
const cron_service_1 = require("./services/cron.service");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.configure();
        this.routes();
        this.handleError();
        cron_service_1.CronService.init();
    }
    configure() {
        // CORS configuration
        this.app.use((0, cors_1.default)({
            origin: process.env.NODE_ENV === 'production'
                ? ['https://your-frontend-domain.com']
                : ['http://localhost:3000', 'http://localhost:3001'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        }));
        this.app.use(express_1.default.json());
    }
    routes() {
        const authRouter = new auth_router_1.AuthRouter();
        const bookingRouter = new booking_router_1.BookingRouter();
        const propertyRouter = new property_router_1.PropertyRouter();
        const reviewRouter = new review_router_1.ReviewRouter();
        const roomRouter = new room_router_1.RoomRouter();
        const tenantRouter = new tenant_router_1.TenantRouter();
        const userRouter = new user_router_1.UserRouter();
        const cronRouter = new cron_router_1.CronRouter();
        const uploadRouter = new upload_router_1.UploadRouter();
        // API routes
        this.app.use("/api/auth", authRouter.getRouter());
        this.app.use("/api/bookings", bookingRouter.getRouter());
        this.app.use("/api/properties", propertyRouter.getRouter());
        this.app.use("/api/reviews", reviewRouter.getRouter());
        this.app.use("/api/rooms", roomRouter.getRouter());
        this.app.use("/api/tenant", tenantRouter.getRouter());
        this.app.use("/api/user", userRouter.getRouter());
        this.app.use("/api/cron", cronRouter.getRouter());
        // Upload routes for serving static files
        this.app.use("/uploads", uploadRouter.getRouter());
        // Legacy auth routes (for backward compatibility)
        this.app.use("/auth", authRouter.getRouter());
    }
    handleError() {
        this.app.use(error_middleware_1.errorMiddleware);
    }
    start() {
        this.app.listen(env_1.PORT, () => {
            console.log(`Server running on port: ${env_1.PORT}`);
            console.log("✅ Cron jobs initialized");
        });
    }
}
exports.App = App;
