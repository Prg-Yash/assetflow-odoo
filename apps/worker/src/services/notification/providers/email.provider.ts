import { IEmailProvider } from "../provider.interface.js";
import { EmailOptions } from "../types.js";
import { env } from "../../../config/environment.js";
import { logger } from "../../../logger/index.js";
import { AwsSesEmailProvider } from "./ses.provider.js";
import { GmailEmailProvider } from "./gmail.provider.js";

/**
 * Main Email Dispatcher orchestrating primary (AWS SES) and secondary (Gmail) providers.
 * Enforces failover policies: tries AWS SES first, and falls back to Gmail SMTP on error.
 */
export class EmailProvider implements IEmailProvider {
  private sesProvider = new AwsSesEmailProvider();
  private gmailProvider = new GmailEmailProvider();

  public async send(options: EmailOptions): Promise<void> {
    const hasSes = !!(env.SES_SMTP_HOST && env.SES_SMTP_USER && env.SES_SMTP_PASS);
    const hasGmail = !!(env.GMAIL_SMTP_USER && env.GMAIL_SMTP_PASS);

    // If no credentials exist, simulate email send locally (useful for clean offline development runs)
    if (!hasSes && !hasGmail) {
      logger.warn(
        { to: options.to, subject: options.subject },
        "Mailer: Neither AWS SES nor Gmail fallback configurations are set. Simulating dispatch locally..."
      );
      return;
    }

    // Try primary provider (AWS SES) first if configured
    if (hasSes) {
      try {
        await this.sesProvider.send(options);
        return; // Success! Return immediately
      } catch (error) {
        const err = error as Error;
        logger.warn(
          { err: err.message, to: options.to },
          "Mailer: Primary AWS SES transmission failed. Activating Gmail SMTP fallback..."
        );
      }
    } else {
      logger.info(
        { to: options.to },
        "Mailer: AWS SES SMTP parameters missing. Bypassing directly to Gmail fallback..."
      );
    }

    // Attempt Gmail fallback delivery
    if (hasGmail) {
      try {
        await this.gmailProvider.send(options);
      } catch (error) {
        logger.error(
          { err: error, to: options.to },
          "Mailer: Gmail SMTP fallback also failed. Email delivery has failed completely."
        );
        throw error;
      }
    } else {
      throw new Error(
        "Mailer: Primary AWS SES transmission failed, and no Gmail fallback app credentials were configured."
      );
    }
  }
}
export default EmailProvider;
