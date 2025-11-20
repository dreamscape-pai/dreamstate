import QRCode from 'qrcode';

export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    // Generate QR code as data URL
    const dataURL = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#1a1a2e',  // Dark color for QR code
        light: '#ffffff', // White background
      },
    });
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}
