"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
class MailService {
    constructor() {
        this.initTransporter();
    }
    initTransporter() {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
            console.warn('⚠️  SMTP not configured. Emails will be logged only.');
            return;
        }
        this.transporter = nodemailer_1.default.createTransport({
            host: SMTP_HOST,
            port: parseInt(SMTP_PORT || '587'),
            secure: false,
            auth: { user: SMTP_USER, pass: SMTP_PASS }
        });
        console.log('✅ Mail service configured');
    }
    getTemplate(name, data) {
        try {
            const templatePath = path_1.default.join(__dirname, 'template mail', `${name}.hbs`);
            const source = fs_1.default.readFileSync(templatePath, 'utf-8');
            const template = handlebars_1.default.compile(source);
            return template(data);
        }
        catch (error) {
            console.error(`Template ${name} not found:`, error);
            throw new Error(`Template ${name} not found`);
        }
    }
    async send(to, subject, html) {
        if (!this.transporter) {
            console.log('📧 [DEV MODE]', { to, subject });
            return true;
        }
        try {
            await this.transporter.sendMail({
                from: `"Property Rent" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html
            });
            console.log('✅ Email sent:', to);
            return true;
        }
        catch (error) {
            console.error('❌ Email failed:', error);
            return false;
        }
    }
    async sendWelcomeEmail(user) {
        const html = this.getTemplate('welcome', {
            email: user.email,
            name: user.name || user.email,
            loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`,
            supportUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/support`,
            year: new Date().getFullYear()
        });
        return this.send(user.email, 'Welcome to Property Rent! 🏠', html);
    }
    async sendPasswordResetEmail(user, token) {
        const html = this.getTemplate('reset-password', {
            email: user.email,
            name: user.name || user.email,
            resetLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`,
            supportUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/support`,
            year: new Date().getFullYear()
        });
        return this.send(user.email, 'Reset Your Password 🔐', html);
    }
}
exports.MailService = MailService;
