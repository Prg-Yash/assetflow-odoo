export type NotificationChannel = "email" | "sms" | "slack";

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, string | number | boolean>;
}

export interface SMSOptions {
  to: string;
  body: string;
}

export interface SlackOptions {
  channel?: string;
  text: string;
}
