import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
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

