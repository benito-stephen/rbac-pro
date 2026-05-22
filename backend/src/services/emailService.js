import logger from '../configs/logger.js';

/**
 * Email service — production-ready structure.
 * In development, logs reset/verification links to console.
 * Replace sendEmail with SendGrid, AWS SES, or Nodemailer in production.
 */
const APP_NAME = 'RBAC PRO';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const sendEmail = async ({ to, subject, html, text }) => {
  if (process.env.NODE_ENV === 'production' && process.env.SMTP_HOST) {
    // TODO: Integrate Nodemailer / SendGrid
    logger.info(`[EMAIL] Would send to ${to}: ${subject}`);
    return { success: true, messageId: `prod-${Date.now()}` };
  }

  logger.info(`[EMAIL DEV] To: ${to} | Subject: ${subject}`);
  if (text) logger.info(`[EMAIL DEV] Body: ${text}`);
  return { success: true, messageId: `dev-${Date.now()}` };
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

  return sendEmail({
    to: user.email,
    subject: `${APP_NAME} — Password Reset Request`,
    text: `Reset your password: ${resetUrl}\n\nExpires in 1 hour. If you didn't request this, ignore this email.`,
    html: `
      <h2>Password Reset</h2>
      <p>Hi ${user.name},</p>
      <p>Click below to reset your password (expires in 1 hour):</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  });
};

export const sendWelcomeEmail = async (user, verificationToken) => {
  const verifyUrl = `${CLIENT_URL}/verify-email?token=${verificationToken}&email=${encodeURIComponent(user.email)}`;

  return sendEmail({
    to: user.email,
    subject: `Welcome to ${APP_NAME}`,
    text: `Welcome ${user.name}! Verify email: ${verifyUrl}`,
    html: `<h2>Welcome to ${APP_NAME}</h2><p>Hi ${user.name}, verify your email:</p><a href="${verifyUrl}">Verify Email</a>`,
  });
};

export const sendAccountSuspendedEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: `${APP_NAME} — Account Suspended`,
    text: `Your account has been suspended. Contact support for assistance.`,
    html: `<p>Hi ${user.name}, your account has been suspended.</p>`,
  });
};
