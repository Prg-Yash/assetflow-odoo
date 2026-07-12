import { EmailOptions, SMSOptions, SlackOptions } from "./types.js";

/**
 * Interface definition for Email Delivery Services (e.g. NodeMailer, SendGrid, Resend, SES).
 */
export interface IEmailProvider {
  send(options: EmailOptions): Promise<void>;
}

/**
 * Interface definition for SMS Delivery Services (e.g. Twilio, MessageBird, Vonage).
 */
export interface ISMSProvider {
  send(options: SMSOptions): Promise<void>;
}

/**
 * Interface definition for Slack / Chat Delivery Services.
 */
export interface ISlackProvider {
  send(options: SlackOptions): Promise<void>;
}
