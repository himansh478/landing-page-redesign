import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // The website and AI Captions have separate root layouts, so 404s need their own page.
    globalNotFound: true,
  },
  webpack: (config) => {
    // canvaskit-wasm's loader references Node modules it never uses in the browser.
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false };
    return config;
  },
  async redirects() {
    return [
      { source: '/editing', destination: '/', permanent: false },
      { source: '/shoots', destination: '/', permanent: false },
      // These pages were removed; send old links to the homepage.
      { source: '/masterful-editing', destination: '/', permanent: false },
      { source: '/professional-shoots', destination: '/', permanent: false },
      { source: '/tech', destination: '/technical-solutions', permanent: true },
      { source: '/social', destination: '/social-management', permanent: true },
      { source: '/packages.html', destination: '/packages', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/about', destination: '/about-us', permanent: true },
      { source: '/contact', destination: '/contact-us', permanent: true },
    ];
  },
};

export default nextConfig;

