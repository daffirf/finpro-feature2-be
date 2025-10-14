import { Request, Response, NextFunction } from 'express';
export declare class UploadController {
    private uploadService;
    constructor();
    getFile: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
