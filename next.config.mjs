const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com https://cdn.fontshare.com https://use.typekit.net",
  "img-src 'self' data: blob: https://i.ytimg.com https://yt3.ggpht.com https://cdn.discordapp.com https://*.fourthwall.com https://cdn.fourthwall.com https://storage.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com https://cdn.fontshare.com https://use.typekit.net https://p.typekit.net",
  "frame-src https://discord.com https://www.youtube.com https://www.youtube-nocookie.com https://*.fourthwall.com https://player.twitch.tv https://clips.twitch.tv",
  "connect-src 'self' https://www.googleapis.com https://discord.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Content-Security-Policy", value: csp },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [64, 128, 256, 384, 420, 620],
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "yt3.ggpht.com" },
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "cdn.fourthwall.com" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "skelly-xkh-shop.fourthwall.com" },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Domain canonicalization lives in Vercel project Domains settings.
  // A code-level redirect here conflicted with Vercel's edge redirect
  // (apex -> www) and created an infinite loop. To make apex canonical,
  // change the primary domain in Vercel dashboard rather than adding a
  // redirect rule here.
};

export default nextConfig;
