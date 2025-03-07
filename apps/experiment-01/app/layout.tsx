import { Inter } from "next/font/google";

import "./globals.css";
import { Providers } from "@/components/providers";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} font-sans antialiased dark`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
