"use client";

import Script from "next/script";

const GA_ID = "G-YJQNMJX572";

type GtagParams = Record<string, string | number | boolean>;

export function trackEvent(name: string, params?: GtagParams) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

declare global {
  interface Window {
    gtag?: (...args: [string, ...unknown[]]) => void;
  }
}

export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`/ga/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
