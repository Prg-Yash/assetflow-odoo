import nodemailer from "nodemailer";
import { IEmailProvider } from "../provider.interface.js";
import { EmailOptions } from "../types.js";
import { env } from "../../../config/environment.js";
import { logger } from "../../../logger/index.js";

/**
 * Gmail SMTP Fallback Email Delivery Provider.
 * Triggered automatically if primary AWS SES delivery fails.
 */
export class GmailEmailProvider implements IEmailProvider {
  public async send(options: EmailOptions): Promise<void> {
    const { GMAIL_SMTP_HOST, GMAIL_SMTP_PORT, GMAIL_SMTP_USER, GMAIL_SMTP_PASS, SMTP_FROM_EMAIL } = env;

    if (!GMAIL_SMTP_USER || !GMAIL_SMTP_PASS) {
      throw new Error("Gmail Fallback: Missing GMAIL_SMTP_USER or GMAIL_SMTP_PASS app passwords.");
    }

    const transporter = nodemailer.createTransport({
      host: GMAIL_SMTP_HOST,
      port: GMAIL_SMTP_PORT || 587,
      secure: GMAIL_SMTP_PORT === 465,
      auth: {
        user: GMAIL_SMTP_USER,
        pass: GMAIL_SMTP_PASS,
      },
    });

    logger.debug(
      { host: GMAIL_SMTP_HOST, port: GMAIL_SMTP_PORT, to: options.to, subject: options.subject },
      "Gmail Fallback: Initializing transmission..."
    );

    const htmlBody = `
      <h3>AssetFlow Notification (Gmail Fallback Link)</h3>
      <p><b>Event Template:</b> ${options.template}</p>
      <hr />
      <div>
        <p><b>Details:</b></p>
        <pre>${JSON.stringify(options.context, null, 2)}</pre>
      </div>
      <hr />
      <p style="font-size: 11px; color: #888;">This is an automated notification from the Gmail Fallback Service.</p>
    `;

    await transporter.sendMail({
      from: SMTP_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: htmlBody,
    });

    logger.info(
      { to: options.to, subject: options.subject },
      "Gmail Fallback: Email sent successfully"
    );
  }
}
export default GmailEmailProvider;
