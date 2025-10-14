import { Router } from 'express';
export declare class TenantRouter {
    private router;
    private jwtMiddleware;
    constructor();
    private initializeRoutes;
    getRouter: () => Router;
}
