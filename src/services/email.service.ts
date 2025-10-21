import nodemailer, { Transporter } from 'nodemailer';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FRONTEND_URL } from '@/config/env';

export class EmailService {
  private static transporter?: Transporter;
  private static templateCache = new Map<string, handlebars.TemplateDelegate>();

  constructor() {
    if (!EmailService.transporter) {
      EmailService.initTransporter();
    }
  }

  private static initTransporter() {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.warn('⚠️  SMTP not configured. Emails will be logged to console.');
      console.log('📝 Required: SMTP_HOST, SMTP_USER, SMTP_PASS');
      return;
    }

    const port = parseInt(SMTP_PORT || '587');
    
    try {
      EmailService.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: port,
        secure: port === 465, // true for 465, false for 587
        auth: { 
          user: SMTP_USER, 
          pass: SMTP_PASS 
        }
      });

      console.log('✅ Email service configured');
      console.log(`📧 SMTP: ${SMTP_HOST}:${port} (secure: ${port === 465})`);
      console.log(`👤 User: ${SMTP_USER}`);
    } catch (error) {
      console.error('❌ Failed to configure email service:', error);
    }
  }

  private getTemplate(name: string, data: any): string {
    // Check cache first
    if (!EmailService.templateCache.has(name)) {
      // Try multiple paths (production dist/ and development src/)
      const paths = [
        path.join(__dirname, 'email-templates', `${name}.hbs`), // Compiled dist/
        path.join(process.cwd(), 'src/services/email-templates', `${name}.hbs`), // Source
        path.join(process.cwd(), 'dist/services/email-templates', `${name}.hbs`) // Absolute dist
      ];

      let templateSource: string | null = null;
      let usedPath: string = '';

      for (const templatePath of paths) {
        try {
          if (fs.existsSync(templatePath)) {
            templateSource = fs.readFileSync(templatePath, 'utf-8');
            usedPath = templatePath;
            console.log(`✅ Template loaded: ${templatePath}`);
            break;
          }
        } catch (error) {
          // Try next path
          continue;
        }
      }

      if (!templateSource) {
        console.error('❌ Template not found in any of these paths:');
        paths.forEach(p => console.error(`   - ${p}`));
        throw new Error(`Email template "${name}" not found`);
      }

      EmailService.templateCache.set(name, handlebars.compile(templateSource));
    }

    return EmailService.templateCache.get(name)!(data);
  }

  private async send(to: string, subject: string, html: string): Promise<boolean> {
    if (!EmailService.transporter) {
      console.log(`📧 [Dev Mode] Email to: ${to} | Subject: ${subject}`);
      return true;
    }

    try {
      await EmailService.transporter.sendMail({
        from: `"Property Rent" <${SMTP_USER}>`,
        to,
        subject,
        html
      });
      console.log(`✅ Email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Email failed:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      return false;
    }
  }

  // Auth emails
  async sendWelcomeEmail(user: { email: string; name?: string | null }) {
    const html = this.getTemplate('welcome', {
      email: user.email,
      name: user.name || user.email,
      loginUrl: `${FRONTEND_URL}/login`,
      supportUrl: `${FRONTEND_URL}/support`,
      year: new Date().getFullYear()
    });

    return this.send(user.email, 'Welcome to Property Rent! 🏠', html);
  }

  async sendEmailVerification(user: { email: string; name?: string | null }, token: string) {
    const html = this.getTemplate('welcome', {
      email: user.email,
      name: user.name || user.email,
      verificationUrl: `${FRONTEND_URL}/auth/set-password?token=${token}`,
      expiryHours: 1,
      supportUrl: `${FRONTEND_URL}/support`,
      year: new Date().getFullYear()
    });

    return this.send(user.email, 'Verify Your Email Address 📧', html);
  }

  async sendPasswordResetEmail(user: { email: string; name?: string | null }, token: string) {
    const html = this.getTemplate('reset-password', {
      email: user.email,
      name: user.name || user.email,
      resetLink: `${FRONTEND_URL}/auth/reset-password?token=${token}`,
      supportUrl: `${FRONTEND_URL}/support`,
      year: new Date().getFullYear()
    });

    return this.send(user.email, 'Reset Your Password 🔐', html);
  }

  // Booking emails (inline HTML untuk simplicity)
  async sendBookingConfirmation(booking: any) {
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

  async sendBookingCancellation(booking: any, reason?: string) {
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

  async sendPaymentRejection(booking: any, reason?: string) {
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

  async sendCheckInReminder(booking: any) {
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

// Export singleton instance for convenience
export const emailService = new EmailService();

// Export convenience functions (for backward compatibility)
export const sendWelcomeEmail = (user: { email: string; name?: string | null }) => 
  emailService.sendWelcomeEmail(user);

export const sendPasswordResetEmail = (user: { email: string; name?: string | null }, token: string) => 
  emailService.sendPasswordResetEmail(user, token);

export const sendBookingConfirmation = (booking: any) => 
  emailService.sendBookingConfirmation(booking);

export const sendBookingCancellation = (booking: any, reason?: string) => 
  emailService.sendBookingCancellation(booking, reason);

export const sendPaymentRejection = (booking: any, reason?: string) => 
  emailService.sendPaymentRejection(booking, reason);

export const sendCheckInReminder = (booking: any) => 
  emailService.sendCheckInReminder(booking);

