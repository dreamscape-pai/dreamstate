import { Resend } from 'resend';
import { generateTicketConfirmationEmail, TicketEmailData } from './template';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTicketConfirmationEmail(data: TicketEmailData) {
  try {
    const { html, subject } = await generateTicketConfirmationEmail(data);

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Dreamstate <onboarding@resend.dev>',
      to: [data.customerEmail],
      subject,
      html,
    });

    console.log(`✅ Confirmation email sent to ${data.customerEmail}`, result);
    return result;
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    throw error;
  }
}
