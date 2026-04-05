import type { Metadata, Viewport } from "next";
import { Geist, IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-mono",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
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
  alternates: {
    types: {
      "application/rss+xml": "https://krux.news/feed.xml",
    },
  },
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
    <html
      lang="en"
      className={`${geist.variable} ${ibmPlexMono.variable} ${sourceSerif.variable}`}
    >
      <body className="font-sans antialiased">
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
