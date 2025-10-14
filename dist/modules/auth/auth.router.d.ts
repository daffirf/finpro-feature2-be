import { Router } from "express";
export declare class AuthRouter {
    private router;
    private authController;
    private jwtMiddleware;
    constructor();
    private initializedRoutes;
    getRouter: () => Router;
}
