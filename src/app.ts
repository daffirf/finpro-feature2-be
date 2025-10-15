import cors from "cors";
import express, { Express } from "express";
import { PORT } from "./config/env";
import { errorMiddleware } from "./middlewares/error.middleware";
import { AuthRouter } from "./modules/auth/auth.router";
import { BookingRouter } from "./modules/booking/booking.router";
import { PropertyRouter } from "./modules/property/property.router";
import { ReviewRouter } from "./modules/review/review.router";
import { RoomRouter } from "./modules/room/room.router";
import { TenantRouter } from "./modules/tenant/tenant.router";
import { UserRouter } from "./modules/user/user.router";
import { CronRouter } from "./modules/cron/cron.router";
import { CronService } from "./services/cron.service";

export class App {
  app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
    CronService.init();
  }

  private configure() {
    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-frontend-domain.com'] 
        : true, // Allow all origins in development
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));
    
    this.app.use(express.json());
  }

  private routes() {
    const authRouter = new AuthRouter();
    const bookingRouter = new BookingRouter();
    const propertyRouter = new PropertyRouter();
    const reviewRouter = new ReviewRouter();
    const roomRouter = new RoomRouter();
    const tenantRouter = new TenantRouter();
    const userRouter = new UserRouter();
    const cronRouter = new CronRouter();

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
    this.app.use("/uploads", express.static('uploads'));

    // Legacy auth routes (for backward compatibility)
    this.app.use("/auth", authRouter.getRouter());

    // Root route for testing
    this.app.get("/", (req, res) => {
      res.json({ 
        message: "Express API Server is running!", 
        version: "1.0.0",
        endpoints: {
          auth: "/api/auth/*",
          bookings: "/api/bookings/*",
          properties: "/api/properties/*",
          uploads: "/uploads/*"
        }
      });
    });
  }

  private handleError() {
    this.app.use(errorMiddleware);
  }

  public start() {
    this.app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
      console.log("✅ Cron jobs initialized");
    });
  }
}