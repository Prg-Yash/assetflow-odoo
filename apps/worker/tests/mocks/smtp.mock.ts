import {
  IEmailProvider,
  ISMSProvider,
  ISlackProvider,
} from "../../src/services/notification/provider.interface.js";
import {
  EmailOptions,
  SMSOptions,
  SlackOptions,
} from "../../src/services/notification/types.js";

/**
 * Mock Email Provider storing sent messages in memory for test assertions.
 */
export class MockEmailProvider implements IEmailProvider {
  public sent: EmailOptions[] = [];

  public async send(options: EmailOptions): Promise<void> {
    this.sent.push(options);
  }

  public clear(): void {
    this.sent = [];
  }
}

/**
 * Mock SMS Provider storing dispatched messages in memory.
 */
export class MockSMSProvider implements ISMSProvider {
  public sent: SMSOptions[] = [];

  public async send(options: SMSOptions): Promise<void> {
    this.sent.push(options);
  }

  public clear(): void {
    this.sent = [];
  }
}

/**
 * Mock Slack Provider storing webhook deliveries in memory.
 */
export class MockSlackProvider implements ISlackProvider {
  public sent: SlackOptions[] = [];

  public async send(options: SlackOptions): Promise<void> {
    this.sent.push(options);
  }

  public clear(): void {
    this.sent = [];
  }
}
