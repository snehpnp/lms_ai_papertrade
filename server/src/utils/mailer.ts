import nodemailer from 'nodemailer';
import { settingsService } from '../modules/settings/settings.service';

export interface MailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export const mailer = {
    async getTransporter() {
        const host = await settingsService.getByKey('SMTP_HOST');
        const port = await settingsService.getByKey('SMTP_PORT');
        const user = await settingsService.getByKey('SMTP_USER');
        const pass = await settingsService.getByKey('SMTP_PASS');

        if (!host || !port || !user || !pass) {
            throw new Error('SMTP credentials not configured in settings');
        }

        return nodemailer.createTransport({
            host,
            port: parseInt(port, 10),
            secure: parseInt(port, 10) === 465,
            auth: {
                user,
                pass,
            },
        });
    },

    async sendMail(options: MailOptions) {
        const transporter = await this.getTransporter();
        const fromEmail = await settingsService.getByKey('FROM_EMAIL');
        const fromName = await settingsService.getByKey('FROM_NAME');

        const mailOptions = {
            from: `"${fromName || 'TradeAlgo'}" <${fromEmail || 'noreply@tradealgo.com'}>`,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        return transporter.sendMail(mailOptions);
    },
};
