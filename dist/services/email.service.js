"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCheckInReminder = exports.sendPaymentRejection = exports.sendBookingCancellation = exports.sendBookingConfirmation = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.emailService = exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const env_1 = require("@/config/env");
class EmailService {
    constructor() {
        if (!EmailService.transporter) {
            EmailService.initTransporter();
        }
    }
    static initTransporter() {
        if (!env_1.SMTP_HOST || !env_1.SMTP_USER || !env_1.SMTP_PASS) {
            console.warn('⚠️  SMTP not configured. Emails will be logged to console.');
            console.log('📝 Required: SMTP_HOST, SMTP_USER, SMTP_PASS');
            return;
        }
        const port = parseInt(env_1.SMTP_PORT || '587');
        try {
            EmailService.transporter = nodemailer_1.default.createTransport({
                host: env_1.SMTP_HOST,
                port: port,
                secure: port === 465, // true for 465, false for 587
                auth: {
                    user: env_1.SMTP_USER,
                    pass: env_1.SMTP_PASS
                }
            });
            console.log('✅ Email service configured');
            console.log(`📧 SMTP: ${env_1.SMTP_HOST}:${port} (secure: ${port === 465})`);
            console.log(`👤 User: ${env_1.SMTP_USER}`);
        }
        catch (error) {
            console.error('❌ Failed to configure email service:', error);
        }
    }
    getTemplate(name, data) {
        // Check cache first
        if (!EmailService.templateCache.has(name)) {
            // Try multiple paths (production dist/ and development src/)
            const paths = [
                path_1.default.join(__dirname, 'email-templates', `${name}.hbs`), // Compiled dist/
                path_1.default.join(process.cwd(), 'src/services/email-templates', `${name}.hbs`), // Source
                path_1.default.join(process.cwd(), 'dist/services/email-templates', `${name}.hbs`) // Absolute dist
            ];
            let templateSource = null;
            let usedPath = '';
            for (const templatePath of paths) {
                try {
                    if (fs_1.default.existsSync(templatePath)) {
                        templateSource = fs_1.default.readFileSync(templatePath, 'utf-8');
                        usedPath = templatePath;
                        console.log(`✅ Template loaded: ${templatePath}`);
                        break;
                    }
                }
                catch (error) {
                    // Try next path
                    continue;
                }
            }
            if (!templateSource) {
                console.error('❌ Template not found in any of these paths:');
                paths.forEach(p => console.error(`   - ${p}`));
                throw new Error(`Email template "${name}" not found`);
            }
            EmailService.templateCache.set(name, handlebars_1.default.compile(templateSource));
        }
        return EmailService.templateCache.get(name)(data);
    }
    async send(to, subject, html) {
        if (!EmailService.transporter) {
            console.log(`📧 [Dev Mode] Email to: ${to} | Subject: ${subject}`);
            return true;
        }
        try {
            await EmailService.transporter.sendMail({
                from: `"Property Rent" <${env_1.SMTP_USER}>`,
                to,
                subject,
                html
            });
            console.log(`✅ Email sent to ${to}`);
            return true;
        }
        catch (error) {
            console.error('❌ Email failed:', error);
            if (error instanceof Error) {
                console.error('Error details:', error.message);
            }
            return false;
        }
    }
    // Auth emails
    async sendWelcomeEmail(user) {
        const html = this.getTemplate('welcome', {
            email: user.email,
            name: user.name || user.email,
            loginUrl: `${env_1.FRONTEND_URL}/login`,
            supportUrl: `${env_1.FRONTEND_URL}/support`,
            year: new Date().getFullYear()
        });
        return this.send(user.email, 'Welcome to Property Rent! 🏠', html);
    }
    async sendEmailVerification(user, token) {
        const html = this.getTemplate('welcome', {
            email: user.email,
            name: user.name || user.email,
            verificationUrl: `${env_1.FRONTEND_URL}/auth/set-password?token=${token}`,
            expiryHours: 1,
            supportUrl: `${env_1.FRONTEND_URL}/support`,
            year: new Date().getFullYear()
        });
        return this.send(user.email, 'Verify Your Email Address 📧', html);
    }
    async sendPasswordResetEmail(user, token) {
        const html = this.getTemplate('reset-password', {
            email: user.email,
            name: user.name || user.email,
            resetLink: `${env_1.FRONTEND_URL}/auth/reset-password?token=${token}`,
            supportUrl: `${env_1.FRONTEND_URL}/support`,
            year: new Date().getFullYear()
        });
        return this.send(user.email, 'Reset Your Password 🔐', html);
    }
    // Booking emails (inline HTML untuk simplicity)
    async sendBookingConfirmation(booking) {
        const property = booking.items?.[0]?.room?.property;
        const room = booking.items?.[0]?.room;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00a8a8;">Booking Confirmed! ✅</h1>
        <p>Hi ${booking.user.name},</p>
        <p>Your booking has been confirmed!</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Booking Details:</h3>
          <p><strong>Booking No:</strong> ${booking.bookingNo}</p>
          <p><strong>Property:</strong> ${property?.name}</p>
          <p><strong>Room:</strong> ${room?.name}</p>
          <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString('id-ID')}</p>
          <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString('id-ID')}</p>
          <p><strong>Total:</strong> Rp ${Number(booking.totalPrice).toLocaleString('id-ID')}</p>
        </div>
        
        <p>See you soon!</p>
      </div>
    `;
        return this.send(booking.user.email, 'Booking Confirmed ✅', html);
    }
    async sendBookingCancellation(booking, reason) {
        const property = booking.items?.[0]?.room?.property;
        const room = booking.items?.[0]?.room;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Booking Cancelled ❌</h1>
        <p>Hi ${booking.user.name},</p>
        <p>Your booking has been cancelled.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Booking No:</strong> ${booking.bookingNo}</p>
          <p><strong>Property:</strong> ${property?.name}</p>
          <p><strong>Room:</strong> ${room?.name}</p>
        </div>
      </div>
    `;
        return this.send(booking.user.email, 'Booking Cancelled', html);
    }
    async sendPaymentRejection(booking, reason) {
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f59e0b;">Payment Rejected ⚠️</h1>
        <p>Hi ${booking.user.name},</p>
        <p>Unfortunately, your payment proof has been rejected.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Please upload a valid payment proof to continue.</p>
      </div>
    `;
        return this.send(booking.user.email, 'Payment Rejected', html);
    }
    async sendCheckInReminder(booking) {
        const property = booking.items?.[0]?.room?.property;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #00a8a8;">Check-in Reminder 🔔</h1>
        <p>Hi ${booking.user.name},</p>
        <p>This is a reminder that your check-in is <strong>tomorrow</strong>!</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Property:</strong> ${property?.name}</p>
          <p><strong>Address:</strong> ${property?.address}</p>
          <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString('id-ID')}</p>
        </div>
        
        <p>We look forward to welcoming you!</p>
      </div>
    `;
        return this.send(booking.user.email, 'Check-in Tomorrow! 🔔', html);
    }
}
exports.EmailService = EmailService;
EmailService.templateCache = new Map();
// Export singleton instance for convenience
exports.emailService = new EmailService();
// Export convenience functions (for backward compatibility)
const sendWelcomeEmail = (user) => exports.emailService.sendWelcomeEmail(user);
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = (user, token) => exports.emailService.sendPasswordResetEmail(user, token);
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendBookingConfirmation = (booking) => exports.emailService.sendBookingConfirmation(booking);
exports.sendBookingConfirmation = sendBookingConfirmation;
const sendBookingCancellation = (booking, reason) => exports.emailService.sendBookingCancellation(booking, reason);
exports.sendBookingCancellation = sendBookingCancellation;
const sendPaymentRejection = (booking, reason) => exports.emailService.sendPaymentRejection(booking, reason);
exports.sendPaymentRejection = sendPaymentRejection;
const sendCheckInReminder = (booking) => exports.emailService.sendCheckInReminder(booking);
exports.sendCheckInReminder = sendCheckInReminder;
