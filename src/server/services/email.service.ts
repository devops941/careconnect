import { getEnv } from "../validation/env";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface IEmailProvider {
  name: string;
  sendEmail(options: SendEmailOptions): Promise<void>;
}

export class ConsoleEmailProvider implements IEmailProvider {
  name = "console";

  async sendEmail(options: SendEmailOptions): Promise<void> {
    console.log("\n=======================================================");
    console.log(`📨 [CARECONNECT EMAIL SERVICE - CONSOLE PROVIDER]`);
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`-------------------------------------------------------`);
    console.log(options.text);
    console.log("=======================================================\n");
  }
}

export class ResendEmailProvider implements IEmailProvider {
  name = "resend";
  private apiKey: string;
  private from: string;

  constructor(apiKey: string, from: string) {
    this.apiKey = apiKey;
    this.from = from;
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: this.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend API error (${res.status}): ${errText}`);
    }
  }
}

export class EmailService {
  private provider: IEmailProvider;

  constructor() {
    const env = getEnv();
    if (env.EMAIL_PROVIDER === "resend" && env.RESEND_API_KEY) {
      this.provider = new ResendEmailProvider(env.RESEND_API_KEY, env.EMAIL_FROM);
    } else {
      this.provider = new ConsoleEmailProvider();
    }
  }

  setProvider(provider: IEmailProvider) {
    this.provider = provider;
  }

  async sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
    const env = getEnv();
    const verificationUrl = `${env.APP_URL}/verify-email?token=${token}`;

    const text = `Hello ${name},\n\nWelcome to CareConnect. Please verify your email by opening this link in your browser:\n${verificationUrl}\n\nThis verification link expires in 24 hours.\n\nBest regards,\nCareConnect Hospital Team`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1F2937;">
        <h2 style="color: #0F766E;">CareConnect Verification</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Thank you for registering with CareConnect. Please confirm your email address by clicking the button below:</p>
        <div style="margin: 24px 0;">
          <a href="${verificationUrl}" style="background-color: #0F766E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p style="color: #64748B; font-size: 14px;">Or copy and paste this link in your browser:<br/><a href="${verificationUrl}" style="color: #0F766E;">${verificationUrl}</a></p>
        <p style="color: #94A3B8; font-size: 12px; margin-top: 32px;">This link will expire in 24 hours. If you did not create this account, please ignore this email.</p>
      </div>
    `;

    await this.provider.sendEmail({
      to,
      subject: "Verify your email address - CareConnect",
      text,
      html,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const env = getEnv();
    const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;

    const text = `Hello ${name},\n\nYou requested a password reset for your CareConnect account. Click the link below to set a new password:\n${resetUrl}\n\nThis reset link expires in 60 minutes.\n\nIf you did not request this, please secure your account immediately.\n\nCareConnect Security Team`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1F2937;">
        <h2 style="color: #0F766E;">CareConnect Password Reset</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>We received a request to reset your password. Click the secure link below to choose a new password:</p>
        <div style="margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #0F766E; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #64748B; font-size: 14px;">Or copy and paste this link in your browser:<br/><a href="${resetUrl}" style="color: #0F766E;">${resetUrl}</a></p>
        <p style="color: #94A3B8; font-size: 12px; margin-top: 32px;">This link is valid for 60 minutes. If you did not request a password reset, you can safely ignore this message.</p>
      </div>
    `;

    await this.provider.sendEmail({
      to,
      subject: "Password Reset Request - CareConnect",
      text,
      html,
    });
  }
}

export const emailService = new EmailService();
