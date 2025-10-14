import { Router } from 'express';
export declare class BookingRouter {
    private router;
    private bookingController;
    private jwtMiddleware;
    constructor();
    private initializeRoutes;
    getRouter: () => Router;
}
