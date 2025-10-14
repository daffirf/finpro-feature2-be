import { Router } from 'express';
export declare class UserRouter {
    private router;
    private jwtMiddleware;
    constructor();
    private initializeRoutes;
    getRouter: () => Router;
}
