import nodemailer from 'nodemailer';
import { compile } from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import moment from 'moment';
import { JwtPayload } from 'jsonwebtoken';

import { createBunyanLogger } from '../loaders/logger';
import { decrypt, ERROR_MESSAGES, GLOBAL_APP_CONFIG_KEY, TOKEN_EXPIRY_EMAIL_VERIFY } from '../utility';
// import UserService from './user';
import { Email } from '../models';
import { IEmail, IToken, IUser } from '../interfaces';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 465,
  secure: true,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  }
});

const log = createBunyanLogger('Email-service');

export default class EmailService {
  public async sendVerifyMail(data): Promise<void> {
    const appConfig = global[GLOBAL_APP_CONFIG_KEY];

    // Open template file
    const rootDir = process.cwd();
    const source = readFileSync(join(rootDir, 'email-templates', 'verify-email.hbs'), 'utf-8');
    const token = await this._getToken();
    // const rootDir = __dirname;
    // const source = readFileSync(join(rootDir, '../email-templates', 'verify-email.hbs'), 'utf-8');
    const template = compile(source);
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"Tradeoptima support"<${process.env.SUPPORT_MAIL}>`,
      to: data.Email,
      subject: 'Verify email',
      html: template({
        verifyEmailLink: `${appConfig.VERIFY_EMAIL_ROUTE}?token=${token}`,
        firstName: data.FirstName
      }) // Process template with locals
    });
    log.info('Message sent:', info.messageId);
  }

  public async verifyEmail(data): Promise<IUser> {
    const token: IToken = await decrypt(data.token);
    if (!token) {
      throw ERROR_MESSAGES.TOKEN_INVALID;
    }

    const currentTime = moment().unix(); // seconds
    const valid = (token?.payload as JwtPayload)?.time + TOKEN_EXPIRY_EMAIL_VERIFY >= currentTime;

    if (!valid) {
      throw ERROR_MESSAGES.TOKEN_EXPIRED;
    }

    // update user record with token.payload
    const user = this._updateUser();
    return user;
  }

  public async sendWelcomeEmail(data): Promise<void> {
    try {
      // const appConfig = global[GLOBAL_APP_CONFIG_KEY];
      // Open template file
      const rootDir = process.cwd();
      const source = readFileSync(join(rootDir, 'email-templates', 'reset-password.hbs'), 'utf-8');
      const template = compile(source);
      // Send mail with defined transport object
      const info = await transporter.sendMail({
        from: `"Tradeoptima support"<${process.env.SUPPORT_MAIL}>`,
        to: data.Email,
        subject: 'Welcome email',
        html: template({
          firstName: data.Name,
          loginEmail: data.Email,
          loginPassword: data.Password,
          resetPassword: `${process.env.RESET_PASSWORD_LINK}`
        })
      });
      log.info('Send welcome email sent:', info.messageId);
    } catch (error) {
      log.error('Send welcome email error', error);
      throw error;
    }
  }

  public async sendContactUsMail(data): Promise<void> {
    const msg = {
      to: 'info@tradeoptima.co.uk',
      from: 'vikram@tradeoptima.co.uk',
      subject: 'Contact us [Marketing]',
      html: `<div><p>Name: ${data.FirstName || ''} ${data.LastName || ''}</p>\n<p>Subject: ${data.Subject || ''}</p>\n<p>Message: ${data.Message || ''}</p>\n<p>Phone: ${data.Phone || ''}</p></div>`,
    };
    const info = await transporter.sendMail(msg);
    log.info('Contact us mail', info);
  }

  public async createEmail(data): Promise<IEmail> {
    const result = await Email.model.create(data);
    return result;
  }

  private async _getToken(): Promise<object>  {
    return null;
  }

  private async _updateUser(): Promise<IUser> {
    // const userService = new UserService();
    const user = {} as IUser;
    return user;
  }
}