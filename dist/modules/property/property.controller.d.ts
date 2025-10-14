import { Request, Response, NextFunction } from 'express';
export declare class PropertyController {
    private propertyService;
    constructor();
    searchProperties: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPropertyById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getPropertyPrices: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
