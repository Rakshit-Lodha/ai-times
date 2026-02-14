import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Krux",
  description:
    "Everything about AI in 100 words.",
  openGraph: {
    title: "Krux",
    description:
      "Everything about AI in 100 words.",
    siteName: "KRUX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Krux",
    description:
      "Everything about AI in 100 words.",
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
