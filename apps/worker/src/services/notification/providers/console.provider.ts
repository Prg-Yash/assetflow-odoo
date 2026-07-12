import { IEmailProvider, ISMSProvider, ISlackProvider } from "../provider.interface.js";
import { EmailOptions, SMSOptions, SlackOptions } from "../types.js";
import { logger } from "../../../logger/index.js";

/**
 * Fallback Console Email Provider for development testing.
 */
export class ConsoleEmailProvider implements IEmailProvider {
  public async send(options: EmailOptions): Promise<void> {
    logger.info(
      { to: options.to, subject: options.subject, context: options.context, template: options.template },
      `[DEV-MAILER] Sending Email to ${options.to}`
    );
  }
}

/**
 * Fallback Console SMS Provider for development testing.
 */
export class ConsoleSMSProvider implements ISMSProvider {
  public async send(options: SMSOptions): Promise<void> {
    logger.info(
      { to: options.to, body: options.body },
      `[DEV-SMS] Sending SMS to ${options.to}`
    );
  }
}

/**
 * Fallback Console Slack Provider for development testing.
 */
export class ConsoleSlackProvider implements ISlackProvider {
  public async send(options: SlackOptions): Promise<void> {
    logger.info(
      { channel: options.channel, text: options.text },
      `[DEV-SLACK] Sending Slack Alert to channel "${options.channel || "default"}"`
    );
  }
}
