"use client";

import Script from "next/script";

const GA_ID = "G-YJQNMJX572";

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
