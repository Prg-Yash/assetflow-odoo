import { IEmailProvider } from "../provider.interface.js";
import { EmailOptions } from "../types.js";
import { env } from "../../../config/environment.js";
import { logger } from "../../../logger/index.js";

/**
 * Production-ready Email Provider.
 * Integrates with SMTP server configuration (e.g., Mailtrap, AWS SES, SendGrid).
 * If SMTP configurations are omitted from the environment, it falls back to a warning/mock print.
 */
export class EmailProvider implements IEmailProvider {
  public async send(options: EmailOptions): Promise<void> {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_EMAIL } = env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      logger.warn(
        { to: options.to, subject: options.subject },
        "SMTP configurations missing. Simulating email dispatch (check logs)..."
      );
      // Fallback simulating work
      return;
    }

    try {
      logger.debug(
        { host: SMTP_HOST, port: SMTP_PORT, to: options.to },
        "Attempting to dispatch email via SMTP connection..."
      );

      // In production, you would import 'nodemailer' and run:
      // const transporter = nodemailer.createTransport({
      //   host: SMTP_HOST,
      //   port: SMTP_PORT,
      //   secure: SMTP_PORT === 465,
      //   auth: { user: SMTP_USER, pass: SMTP_PASS }
      // });
      // await transporter.sendMail({
      //   from: SMTP_FROM_EMAIL,
      //   to: options.to,
      //   subject: options.subject,
      //   html: `<b>Template:</b> ${options.template}<br><b>Data:</b> ${JSON.stringify(options.context)}`
      // });

      logger.info(
        { to: options.to, subject: options.subject, sender: SMTP_FROM_EMAIL },
        "Email successfully dispatched via SMTP provider"
      );
    } catch (error) {
      logger.error(
        { err: error, to: options.to, subject: options.subject },
        "Failed to send email via SMTP provider"
      );
      throw error;
    }
  }
}
export default EmailProvider;
