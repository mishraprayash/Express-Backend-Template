// email.ts - boilerplate code

import nodemailer from 'nodemailer';

import { AppError } from '../shared/errors/AppError';
import { ErrorType, ErrorModule, ErrorMessages } from '../shared/errors/errorTypes';
import { HTTP_STATUS } from '../shared/constants/httpStatus';

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@example.com',
      to,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    throw new AppError(
      ErrorType.EMAIL,
      ErrorModule.SYSTEM,
      ErrorMessages[ErrorModule.SYSTEM][ErrorType.EMAIL]!.DEFAULT,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      { module: ErrorModule.SYSTEM, method: 'sendEmail' },
      { error }
    );
  }
};

export { transporter };
