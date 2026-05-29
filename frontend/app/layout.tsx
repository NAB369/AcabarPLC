import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Acabar Plc",
  description: "A secure, scalable loan management and repayment system with KHQR support.",
  icons: {
    icon: '/acabar-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
