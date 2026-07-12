import nodemailer from "nodemailer";
import { IEmailProvider } from "../provider.interface.js";
import { EmailOptions } from "../types.js";
import { env } from "../../../config/environment.js";
import { logger } from "../../../logger/index.js";

/**
 * AWS SES SMTP Email Delivery Provider.
 * Connects to AWS SES SMTP server endpoints to transmit emails.
 */
export class AwsSesEmailProvider implements IEmailProvider {
  public async send(options: EmailOptions): Promise<void> {
    const { SES_SMTP_HOST, SES_SMTP_PORT, SES_SMTP_USER, SES_SMTP_PASS, SMTP_FROM_EMAIL } = env;

    if (!SES_SMTP_HOST || !SES_SMTP_USER || !SES_SMTP_PASS) {
      throw new Error("AWS SES: Missing required SMTP configurations.");
    }

    const transporter = nodemailer.createTransport({
      host: SES_SMTP_HOST,
      port: SES_SMTP_PORT || 587,
      secure: SES_SMTP_PORT === 465,
      auth: {
        user: SES_SMTP_USER,
        pass: SES_SMTP_PASS,
      },
    });

    logger.debug(
      { host: SES_SMTP_HOST, port: SES_SMTP_PORT, to: options.to, subject: options.subject },
      "AWS SES: Initializing transmission..."
    );

    // Build standard text fallback and basic HTML template block
    const htmlBody = `
      <h3>AssetFlow Notification</h3>
      <p><b>Event Template:</b> ${options.template}</p>
      <hr />
      <div>
        <p><b>Details:</b></p>
        <pre>${JSON.stringify(options.context, null, 2)}</pre>
      </div>
      <hr />
      <p style="font-size: 11px; color: #888;">This is an automated notification from the AssetFlow Background Worker.</p>
    `;

    await transporter.sendMail({
      from: SMTP_FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: htmlBody,
    });

    logger.info(
      { to: options.to, subject: options.subject },
      "AWS SES: Email sent successfully"
    );
  }
}
export default AwsSesEmailProvider;
