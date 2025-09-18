import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as sgMail from "@sendgrid/mail";

@Injectable()
export class SendgridService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(msg: sgMail.MailDataRequired) {
    try {
      await sgMail.send({
        from: process.env.SENDGRID_FROM_EMAIL,
        ...msg,
      });
    } catch (error) {
      console.error("SendGrid error:", error.response?.body?.errors || error);
      throw new InternalServerErrorException("Failed to send email");
    }
  }
}
