import { Resend } from 'resend';
import WelcomeTemplate from './templates/WelcomeTemplate';
import ResetPasswordTemplate from './templates/ResetPasswordTemplate';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
const defaultFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

export class EmailService {
  /**
   * Send a welcome email to a newly created employee.
   */
  static async sendWelcomeEmail(to: string, name: string, companyName: string = 'Our Company') {
    if (process.env.NODE_ENV === 'test') return { success: true, id: 'mock_id' };

    try {
      const { data, error } = await resend.emails.send({
        from: defaultFrom,
        to,
        subject: `Welcome to ${companyName}!`,
        react: WelcomeTemplate({ name, companyName }),
      });

      if (error) {
        console.error('Failed to send welcome email:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }
  }

  /**
   * Send a password reset email.
   */
  static async sendPasswordResetEmail(to: string, name: string, resetToken: string) {
    if (process.env.NODE_ENV === 'test') return { success: true, id: 'mock_id' };

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    try {
      const { data, error } = await resend.emails.send({
        from: defaultFrom,
        to,
        subject: 'Reset your password',
        react: ResetPasswordTemplate({ name, resetLink }),
      });

      if (error) {
        console.error('Failed to send reset password email:', error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error sending reset password email:', error);
      return { success: false, error };
    }
  }
}
