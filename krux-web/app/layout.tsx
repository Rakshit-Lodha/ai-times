import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0f1a",
};

export const metadata: Metadata = {
  title: "KRUX - Everything about AI in 100 words",
  description: "Swipe through AI news. Multi-source synthesis in 100 words.",
  metadataBase: new URL("https://krux.news"),
  applicationName: "KRUX",
    appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KRUX",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "KRUX",
    description: "Everything about AI in 100 words. Swipe through AI news.",
    siteName: "KRUX",
    type: "website",
    url: "https://krux.news",
  },
  twitter: {
    card: "summary_large_image",
    title: "KRUX",
    description: "Everything about AI in 100 words. Swipe through AI news.",
    creator: "@kraboratory",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
