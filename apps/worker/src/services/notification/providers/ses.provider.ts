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
    const htmlBody = options.template === "organization_invite" 
      ? `
        <div style="font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; padding: 40px 20px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #1f2937; color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <span style="font-size: 24px; font-weight: 300; letter-spacing: -0.5px; color: #ffffff;">Asset<span style="font-weight: 600; color: #3b82f6;">Flow</span></span>
          </div>
          <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 32px; text-align: left; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);">
            <h2 style="font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; text-align: center;">Workspace Invitation</h2>
            <p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin-bottom: 24px;">
              Hello <strong>${options.context.inviteName || options.to}</strong>,<br/><br/>
              You have been invited to join the organization <strong>${options.context.organizationName}</strong> on AssetFlow as an <strong>${options.context.roleName}</strong> (${options.context.designation}).
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${options.context.inviteLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.4);">
                Accept Invitation & Join
              </a>
            </div>
            <p style="font-size: 12px; color: #6b7280; line-height: 1.6; margin-bottom: 0; word-break: break-all;">
              If the button above does not work, copy and paste this URL into your browser:<br/>
              <a href="${options.context.inviteLink}" style="color: #3b82f6; text-decoration: none;">${options.context.inviteLink}</a>
            </p>
          </div>
          <p style="font-size: 11px; color: #4b5563; text-align: center; margin-top: 24px;">
            This is an automated invitation from the AssetFlow Platform.
          </p>
        </div>
      `
      : `
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
