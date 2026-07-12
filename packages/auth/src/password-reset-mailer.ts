import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";

[
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../.env"),
  path.resolve(process.cwd(), "apps/.env"),
  path.resolve(process.cwd(), "apps/api/.env"),
].forEach((envPath) => dotenv.config({ path: envPath }));

type ResetPasswordEmailOptions = {
  to: string;
  name?: string | null;
  url: string;
};

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
};

type SmtpConfig = {
  host?: string;
  port: number;
  user?: string;
  pass?: string;
};

function getNumberEnv(name: string, fallback: number) {
  const value = process.env[name];
  if (!value) return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getSesConfig() {
  const host = process.env.SES_SMTP_HOST || process.env.SMTP_HOST;
  const port = process.env.SES_SMTP_HOST
    ? getNumberEnv("SES_SMTP_PORT", 587)
    : getNumberEnv("SMTP_PORT", 587);
  const user = process.env.SES_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.SES_SMTP_PASS || process.env.SMTP_PASS;

  return { host, port, user, pass };
}

function getGmailConfig() {
  return {
    host: process.env.GMAIL_SMTP_HOST || "smtp.gmail.com",
    port: getNumberEnv("GMAIL_SMTP_PORT", 587),
    user: process.env.GMAIL_SMTP_USER,
    pass: process.env.GMAIL_SMTP_PASS,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createHtml({ name, url }: ResetPasswordEmailOptions) {
  const safeName = escapeHtml(name?.trim() || "there");
  const safeUrl = escapeHtml(url);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
      <h2 style="margin: 0 0 16px;">Reset your AssetFlow password</h2>
      <p style="font-size: 15px; line-height: 1.6;">Hi ${safeName},</p>
      <p style="font-size: 15px; line-height: 1.6;">
        We received a request to reset your password. Use the button below to choose a new one.
      </p>
      <p style="margin: 24px 0;">
        <a href="${safeUrl}" style="display: inline-block; background: #f97316; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 700;">
          Reset password
        </a>
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #6b7280;">
        If the button does not work, copy and paste this link into your browser:
        <br />
        <a href="${safeUrl}" style="color: #f97316;">${safeUrl}</a>
      </p>
      <p style="font-size: 13px; line-height: 1.6; color: #6b7280;">
        If you did not request this, you can ignore this email.
      </p>
    </div>
  `;
}

class BaseSmtpEmailProvider {
  protected async sendWithSmtp(config: SmtpConfig, options: EmailOptions) {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL || "noreply@assetflow.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}

class AwsSesEmailProvider extends BaseSmtpEmailProvider {
  public async send(options: EmailOptions): Promise<void> {
    const config = getSesConfig();

    if (!config.host || !config.user || !config.pass) {
      throw new Error("AWS SES: Missing required SMTP configurations.");
    }

    console.debug("[Auth Mailer] AWS SES: Initializing transmission...", {
      host: config.host,
      port: config.port,
      to: options.to,
      subject: options.subject,
    });

    await this.sendWithSmtp(config, options);

    console.info("[Auth Mailer] AWS SES: Email sent successfully", {
      to: options.to,
      subject: options.subject,
    });
  }
}

class GmailEmailProvider extends BaseSmtpEmailProvider {
  public async send(options: EmailOptions): Promise<void> {
    const config = getGmailConfig();

    if (!config.user || !config.pass) {
      throw new Error("Gmail Fallback: Missing GMAIL_SMTP_USER or GMAIL_SMTP_PASS app passwords.");
    }

    console.debug("[Auth Mailer] Gmail Fallback: Initializing transmission...", {
      host: config.host,
      port: config.port,
      to: options.to,
      subject: options.subject,
    });

    await this.sendWithSmtp(config, options);

    console.info("[Auth Mailer] Gmail Fallback: Email sent successfully", {
      to: options.to,
      subject: options.subject,
    });
  }
}

class EmailProvider {
  private sesProvider = new AwsSesEmailProvider();
  private gmailProvider = new GmailEmailProvider();

  public async send(options: EmailOptions, fallbackResetUrl?: string): Promise<void> {
    const sesConfig = getSesConfig();
    const gmailConfig = getGmailConfig();
    const hasSes = !!(sesConfig.host && sesConfig.user && sesConfig.pass);
    const hasGmail = !!(gmailConfig.user && gmailConfig.pass);

    if (!hasSes && !hasGmail) {
      console.warn(
        "[Auth Mailer] Mailer: Neither AWS SES nor Gmail fallback configurations are set. Simulating dispatch locally...",
        { to: options.to, subject: options.subject }
      );
      if (fallbackResetUrl) {
        console.warn(`[Auth Mailer] Reset link for ${options.to}: ${fallbackResetUrl}`);
      }
      return;
    }

    if (hasSes) {
      try {
        await this.sesProvider.send(options);
        return;
      } catch (error) {
        const err = error as Error;
        console.warn(
          "[Auth Mailer] Mailer: Primary AWS SES transmission failed. Activating Gmail SMTP fallback...",
          { err: err.message, to: options.to }
        );
      }
    } else {
      console.info(
        "[Auth Mailer] Mailer: AWS SES SMTP parameters missing. Bypassing directly to Gmail fallback...",
        { to: options.to }
      );
    }

    if (hasGmail) {
      try {
        await this.gmailProvider.send(options);
        return;
      } catch (error) {
        console.error(
          "[Auth Mailer] Mailer: Gmail SMTP fallback also failed. Email delivery has failed completely.",
          { err: error, to: options.to }
        );
        throw error;
      }
    }

    throw new Error(
      "Mailer: Primary AWS SES transmission failed, and no Gmail fallback app credentials were configured."
    );
  }
}

export async function sendPasswordResetEmail(options: ResetPasswordEmailOptions) {
  const emailProvider = new EmailProvider();

  await emailProvider.send(
    {
      to: options.to,
      subject: "Reset your AssetFlow password",
      html: createHtml(options),
    },
    options.url
  );
}
