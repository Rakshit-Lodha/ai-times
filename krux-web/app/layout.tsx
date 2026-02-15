import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KRUX - Everything about AI in 100 words",
  description: "Swipe through AI news. Multi-source synthesis in 100 words.",
  metadataBase: new URL("https://krux.news"),
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
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
