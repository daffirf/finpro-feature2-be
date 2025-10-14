import { Request, Response, NextFunction } from 'express';
export declare class BookingController {
    private bookingService;
    constructor();
    createBooking: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getBookingById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    cancelBooking: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    uploadPaymentProof: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getUserBookings: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
