import { Express } from "express";
export declare class App {
    app: Express;
    constructor();
    private configure;
    private routes;
    private handleError;
    start(): void;
}
