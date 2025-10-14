import { Router } from 'express';
export declare class ReviewRouter {
    private router;
    private jwtMiddleware;
    constructor();
    private initializeRoutes;
    getRouter: () => Router;
}
