export interface TicketEmailData {
  customerEmail: string;
  ticketNumber: number;
  verificationToken: string;
  faction: {
    displayName: string;
    description: string;
    colorToken: string;
  };
  siteUrl: string;
}

export async function generateTicketConfirmationEmail(
  data: TicketEmailData
): Promise<{ html: string; subject: string }> {
  // QR code will be embedded as attachment with CID reference
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Dreamstate Ticket</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #0f1419; color: #e6e9f0;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #1a1a2e; border-radius: 12px; overflow: hidden;">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6b46c1 0%, #4c1d95 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">
                Welcome to Dreamstate
              </h1>
              <p style="margin: 10px 0 0 0; color: #e9d5ff; font-size: 16px;">
                Your journey begins here
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">

              <!-- Faction Assignment -->
              <div style="background-color: rgba(107, 70, 193, 0.2); border-left: 4px solid ${data.faction.colorToken}; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
                <h2 style="margin: 0 0 10px 0; color: #c4b5fd; font-size: 24px;">
                  You are ${data.faction.displayName}
                </h2>
                <p style="margin: 0; color: #e6e9f0; line-height: 1.6;">
                  ${data.faction.description}
                </p>
              </div>

              <!-- QR Code -->
              <div style="text-align: center; margin: 30px 0;">
                <h3 style="color: #c4b5fd; margin-bottom: 20px;">Your Ticket QR Code</h3>
                <div style="background: white; display: inline-block; padding: 20px; border-radius: 12px;">
                  <img src="cid:qrcode" alt="Ticket QR Code" style="display: block; width: 300px; height: 300px;" />
                </div>
                <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 14px;">
                  Ticket #${data.ticketNumber}
                </p>
                <p style="margin: 10px 0 0 0; font-size: 14px;">
                  <a href="${data.siteUrl}/verify/${data.verificationToken}" style="color: #8b5cf6; text-decoration: none;">
                    Having trouble viewing your QR? Click here
                  </a>
                </p>
              </div>

              <!-- Important Information -->
              <div style="background-color: #16213e; border-radius: 8px; padding: 25px; margin-top: 30px;">
                <h3 style="margin: 0 0 15px 0; color: #c4b5fd; font-size: 18px;">
                  📱 Important: Entry Requirements
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #e6e9f0; line-height: 1.8;">
                  <li>Present this QR code at the door for entry verification</li>
                  <li>Bring this email (digital or printed) with you</li>
                  <li>Arrive ready to experience faction-specific performances</li>
                  <li>Your faction assignment is final and cannot be changed</li>
                </ul>
              </div>

              <!-- Event Details -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #2d3748;">
                <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 0;">
                  <strong style="color: #c4b5fd;">Event:</strong> Dreamstate<br>
                  <strong style="color: #c4b5fd;">Your Email:</strong> ${data.customerEmail}<br>
                  <strong style="color: #c4b5fd;">Ticket Number:</strong> ${data.ticketNumber}
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f1419; padding: 30px; text-align: center;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                Questions? Contact us at <a href="mailto:support@dreamstate.dream.sc" style="color: #8b5cf6; text-decoration: none;">support@dreamstate.dream.sc</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                © ${new Date().getFullYear()} Dreamstate. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  return {
    html,
    subject: `Welcome to Dreamstate - You are ${data.faction.displayName}! 🎭`,
  };
}
