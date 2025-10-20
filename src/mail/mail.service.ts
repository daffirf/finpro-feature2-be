import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

export class MailService {
  private resend?: Resend;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn('⚠️  Resend API key not configured. Emails will be logged to console only.');
      this.isConfigured = false;
      return;
    }

    try {
      this.resend = new Resend(apiKey);
      this.isConfigured = true;
      console.log('✅ Email service (Resend) configured successfully');
    } catch (error) {
      console.error('❌ Failed to configure email service:', error);
      this.isConfigured = false;
    }
  }

  private loadTemplate(templateName: string): string {
    const templatePath = path.join(
      __dirname,
      'template mail',
      `${templateName}.hbs`
    );

    try {
      return fs.readFileSync(templatePath, 'utf-8');
    } catch (error) {
      console.error(`Failed to load template ${templateName}:`, error);
      throw new Error(`Email template ${templateName} not found`);
    }
  }

  private compileTemplate(templateName: string, data: any): string {
    const templateSource = this.loadTemplate(templateName);
    const template = handlebars.compile(templateSource);
    return template(data);
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // If not configured, log to console
    if (!this.isConfigured || !this.resend) {
      console.log('📧 [EMAIL NOT SENT - Resend not configured]');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`HTML: ${html.substring(0, 100)}...`);
      return true;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'Property Rent <onboarding@resend.dev>', // Use your verified domain in production
        to,
        subject,
        html,
      });

      if (error) {
        console.error('❌ Failed to send email:', error);
        return false;
      }

      console.log('✅ Email sent successfully:', data?.id);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(user: {
    email: string;
    name?: string | null;
  }): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const currentYear = new Date().getFullYear();

    const html = this.compileTemplate('welcome', {
      email: user.email,
      name: user.name || user.email,
      loginUrl: `${frontendUrl}/login`,
      supportUrl: `${frontendUrl}/support`,
      year: currentYear,
    });

    return this.sendEmail(
      user.email,
      'Welcome to Property Rent! 🏠',
      html
    );
  }

  async sendPasswordResetEmail(
    user: {
      email: string;
      name?: string | null;
    },
    resetToken: string
  ): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const currentYear = new Date().getFullYear();
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const html = this.compileTemplate('reset-password', {
      email: user.email,
      name: user.name || user.email,
      resetLink,
      supportUrl: `${frontendUrl}/support`,
      year: currentYear,
    });

    return this.sendEmail(
      user.email,
      'Reset Your Password - Property Rent 🔐',
      html
    );
  }
}
