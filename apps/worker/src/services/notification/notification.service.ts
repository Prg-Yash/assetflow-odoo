import { IEmailProvider, ISMSProvider, ISlackProvider } from "./provider.interface.js";
import { EmailProvider } from "./providers/email.provider.js";
import {
  ConsoleSMSProvider,
  ConsoleSlackProvider,
} from "./providers/console.provider.js";
import { EmailOptions, SMSOptions, SlackOptions } from "./types.js";
import { logger } from "../../logger/index.js";

/**
 * Orchestrator service for routing notification delivery.
 * Decouples queue processor execution from the underlying third-party provider integrations.
 */
class NotificationService {
  private emailProvider: IEmailProvider;
  private smsProvider: ISMSProvider;
  private slackProvider: ISlackProvider;

  constructor() {
    // In a fully-realized system, these providers could be loaded dynamically 
    // or injected via an IoC container based on configuration variables.
    this.emailProvider = new EmailProvider();
    
    // Twilio/SMS or custom provider can be instantiated here
    this.smsProvider = new ConsoleSMSProvider();
    
    // Slack/webhook provider can be instantiated here
    this.slackProvider = new ConsoleSlackProvider();
  }

  /**
   * Route and send an email
   */
  public async sendEmail(options: EmailOptions): Promise<void> {
    logger.debug({ to: options.to, subject: options.subject }, "Routing email notification request");
    await this.emailProvider.send(options);
  }

  /**
   * Route and send an SMS
   */
  public async sendSMS(options: SMSOptions): Promise<void> {
    logger.debug({ to: options.to }, "Routing SMS notification request");
    await this.smsProvider.send(options);
  }

  /**
   * Route and send a Slack message
   */
  public async sendSlack(options: SlackOptions): Promise<void> {
    logger.debug("Routing Slack notification request");
    await this.slackProvider.send(options);
  }
}

export const notificationService = new NotificationService();
export default notificationService;
