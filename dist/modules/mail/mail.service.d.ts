export declare class MailService {
    constructor();
    sendEmail(to: string, subject: string, body: string): Promise<boolean>;
    sendWelcomeEmail(user: any): Promise<boolean>;
    sendPasswordResetEmail(user: any, resetToken: string): Promise<boolean>;
}
