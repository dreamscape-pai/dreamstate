import { Resend } from 'resend';
import { generateTicketConfirmationEmail, TicketEmailData } from './template';
import { generateQRCodeDataURL } from './qr';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTicketConfirmationEmail(data: TicketEmailData) {
  try {
    // Generate QR codes for all tickets
    const qrAttachments = await Promise.all(
      data.tickets.map(async (ticket) => {
        const verificationUrl = `${data.siteUrl}/verify/${ticket.verificationToken}`;
        const qrCodeDataURL = await generateQRCodeDataURL(verificationUrl);

        // Convert data URL to Buffer for attachment
        const base64Data = qrCodeDataURL.split(',')[1];
        const qrCodeBuffer = Buffer.from(base64Data, 'base64');

        return {
          filename: `qrcode-${ticket.ticketNumber}.png`,
          content: qrCodeBuffer,
          contentId: `qrcode-${ticket.ticketNumber}`,
        };
      })
    );

    const { html, subject } = await generateTicketConfirmationEmail(data);

    if (!process.env.EMAIL_FROM) {
      throw new Error('EMAIL_FROM environment variable is not set');
    }

    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [data.customerEmail],
      subject,
      html,
      attachments: qrAttachments,
      // @ts-ignore - analytics property exists but types aren't updated yet
      analytics: {
        clicks: false,
        opens: false,
      },
    } as any);

    console.log(`✅ Confirmation email sent to ${data.customerEmail} for ${data.tickets.length} ticket(s)`, result);
    return result;
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    throw error;
  }
}
