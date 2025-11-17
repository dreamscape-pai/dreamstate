import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";

// Amanojaku - Japanese brush style for titles
const titleFont = localFont({
  src: '../public/fonts/amanojaku/Amanojaku Demo.otf',
  variable: '--font-title',
  display: 'swap',
});

// Dreaming Outloud All Caps - Script style for subheadings
const subheadingFont = localFont({
  src: '../public/fonts/dreaming-outloud-allcaps-regular.otf',
  variable: '--font-subheading',
  display: 'swap',
});

// Cloud Soft - Rounded sans for body text
const bodyFont = localFont({
  src: [
    {
      path: '../public/fonts/Cloud_Soft_Font_Family_(Fontmirror)/CloudSoft-Light 300.otf',
      weight: '300',
    },
    {
      path: '../public/fonts/Cloud_Soft_Font_Family_(Fontmirror)/CloudSoft-Bold 700.otf',
      weight: '700',
    },
  ],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Dreamstate | Where circus meets the subconscious",
  description: "Join us for an unforgettable journey through the realms of dreams. Choose your faction and experience the extraordinary.",
  openGraph: {
    title: "Dreamstate | Where circus meets the subconscious",
    description: "Join us for an unforgettable journey through the realms of dreams.",
    type: "website",
    url: process.env.SITE_BASE_URL || "http://localhost:3000",
    siteName: "Dreamstate",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dreamstate | Where circus meets the subconscious",
    description: "Join us for an unforgettable journey through the realms of dreams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${titleFont.variable} ${subheadingFont.variable} ${bodyFont.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
