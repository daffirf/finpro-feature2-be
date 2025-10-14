export declare class CronService {
    static init(): void;
    static cancelExpiredBookings(): Promise<{
        message: string;
        count: number;
    }>;
    static sendCheckinReminders(): Promise<{
        message: string;
        count: number;
    }>;
}
