import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // Book 3 workbook answer pages are static HTML served from public/books/book3/.
  // Clean URLs (/books/book3/p5) map to the underlying .html files. Additive only;
  // the game's own app routes are untouched.
  async rewrites() {
    return [
      { source: '/books/book3', destination: '/books/book3.html' },
      { source: '/books/book3/:page', destination: '/books/book3/:page.html' },
    ];
  },
  async headers() {
    return [
      {
        source: '/books/book3',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'max-age=0, must-revalidate' },
        ],
      },
      {
        source: '/books/book3/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'max-age=0, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
