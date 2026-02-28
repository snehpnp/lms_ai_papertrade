
import { settingsService } from '../modules/settings/settings.service';

export const emailTemplates = {
    async getBaseTemplate(content: string, title: string) {
        const appName = await settingsService.getByKey('APP_NAME') || 'TradeAlgo';
        const appLogo = await settingsService.getByKey('APP_LOGO') || '';
        const appFavicon = await settingsService.getByKey('APP_FAVICON') || '';

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f4f7f9;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #ffffff;
            padding: 30px;
            text-align: center;
            border-bottom: 1px solid #eeeeee;
        }
        .logo {
            max-height: 50px;
            margin-bottom: 15px;
        }
        .content {
            padding: 40px 30px;
        }
        .footer {
            background-color: #fcfcfc;
            padding: 20px 30px;
            text-align: center;
            font-size: 12px;
            color: #888888;
            border-top: 1px solid #eeeeee;
        }
        .btn {
            display: inline-block;
            padding: 12px 30px;
            background-color: #6366f1;
            color: #ffffff !important;
            text-decoration: none !important;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
            box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
        }
        .h1 {
            color: #111827;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
        }
        .appName {
            font-weight: 700;
            color: #6366f1;
        }
        .favicon {
            width: 20px;
            height: 20px;
            vertical-align: middle;
            margin-right: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${appLogo ? `<img src="${appLogo}" alt="${appName}" class="logo">` : `<div class="h1 appName">${appName}</div>`}
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>
        `;
    },

    async verificationEmail(name: string, url: string) {
        const appName = await settingsService.getByKey('APP_NAME') || 'TradeAlgo';
        const content = `
            <div class="h1">Verify your email address</div>
            <p>Hi ${name},</p>
            <p>Welcome to <span class="appName">${appName}</span>! We're excited to have you on board.</p>
            <p>To get started, please click the button below to verify your email address:</p>
            <a href="${url}" class="btn">Verify Email Address</a>
            <p>If the button doesn't work, you can copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; color: #6366f1; font-size: 13px;">${url}</p>
            <p>This link will expire in 24 hours.</p>
            <p>Best regards,<br>The ${appName} Team</p>
        `;
        return this.getBaseTemplate(content, `Verify your email - ${appName}`);
    },

    async welcomeEmail(name: string) {
        const appName = await settingsService.getByKey('APP_NAME') || 'TradeAlgo';
        const content = `
            <div class="h1">Welcome to ${appName}!</div>
            <p>Hi ${name},</p>
            <p>Your account has been successfully verified. You're now ready to start your trading and learning journey with us.</p>
            <p>Log in to your dashboard to explore our courses and start paper trading with live market data.</p>
            <a href="${process.env.FRONTEND_URL}/login" class="btn">Login to Dashboard</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Happy Trading!<br>The ${appName} Team</p>
        `;
        return this.getBaseTemplate(content, `Welcome to ${appName}!`);
    },

    async forgotPasswordEmail(name: string, url: string) {
        const appName = await settingsService.getByKey('APP_NAME') || 'TradeAlgo';
        const content = `
            <div class="h1">Reset your password</div>
            <p>Hi ${name},</p>
            <p>We received a request to reset your password for your <span class="appName">${appName}</span> account.</p>
            <p>Click the button below to choose a new password:</p>
            <a href="${url}" class="btn">Reset Password</a>
            <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
            <p>The link will expire in 1 hour.</p>
            <p>Best regards,<br>The ${appName} Team</p>
        `;
        return this.getBaseTemplate(content, `Reset your password - ${appName}`);
    }
};
