import { NextRequest, NextResponse } from "next/server";

const SITE_URL = "https://krux.news";
const SITEMAPS = [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/news-sitemap.xml`];

async function getAccessToken(serviceAccountKey: string): Promise<string> {
  const key = JSON.parse(serviceAccountKey);

  // Build JWT header and claim set
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/webmasters",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  // Base64url encode
  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const unsignedToken = `${encode(header)}.${encode(claimSet)}`;

  // Sign with RSA-SHA256 using Web Crypto API
  const pemContent = key.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken),
  );

  const jwt = `${unsignedToken}.${Buffer.from(signature).toString("base64url")}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Token exchange failed: ${await tokenRes.text()}`);
  }

  const { access_token } = await tokenRes.json();
  return access_token;
}

export async function POST(request: NextRequest) {
  // Verify shared secret
  const secret = request.nextUrl.searchParams.get("secret");
  if (!secret || secret !== process.env.SUBMIT_SITEMAP_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const serviceAccountKey = process.env.GSC_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    return NextResponse.json(
      { error: "GSC_SERVICE_ACCOUNT_KEY not configured" },
      { status: 500 },
    );
  }

  try {
    const accessToken = await getAccessToken(serviceAccountKey);
    const encodedSite = encodeURIComponent(SITE_URL);

    const results = await Promise.all(
      SITEMAPS.map(async (sitemapUrl) => {
        const encodedSitemap = encodeURIComponent(sitemapUrl);
        const res = await fetch(
          `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/sitemaps/${encodedSitemap}`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        );
        return {
          sitemap: sitemapUrl,
          status: res.status,
          ok: res.ok,
        };
      }),
    );

    return NextResponse.json({ submitted: results });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
