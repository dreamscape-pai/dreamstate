import { Resend } from 'resend';
import { generateTicketConfirmationEmail, TicketEmailData } from './template';
import { generateQRCodeDataURL } from './qr';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTicketConfirmationEmail(data: TicketEmailData) {
  try {
    const verificationUrl = `${data.siteUrl}/verify/${data.verificationToken}`;
    const qrCodeDataURL = await generateQRCodeDataURL(verificationUrl);

    // Convert data URL to Buffer for attachment
    const base64Data = qrCodeDataURL.split(',')[1];
    const qrCodeBuffer = Buffer.from(base64Data, 'base64');

    const { html, subject } = await generateTicketConfirmationEmail(data);

    if (!process.env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM environment variable is not set');
    }

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [data.customerEmail],
      subject,
      html,
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          contentId: 'qrcode', // Content ID for embedding
        },
      ],
    });

    console.log(`✅ Confirmation email sent to ${data.customerEmail}`, result);
    return result;
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    throw error;
  }
}
