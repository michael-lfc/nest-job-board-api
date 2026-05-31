import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendApplicationConfirmation(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    companyName: string,
  ) {
    await this.mailer.sendMail({
      to: candidateEmail,
      subject: `Application Received — ${jobTitle}`,
      html: `
        <h2>Hi ${candidateName},</h2>
        <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been received successfully.</p>
        <p>We will review your application and get back to you shortly.</p>
        <br/>
        <p>Best regards,</p>
        <p>Job Board Team</p>
      `,
    });
  }
}