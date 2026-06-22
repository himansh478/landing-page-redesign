import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      { source: '/editing', destination: '/masterful-editing', permanent: true },
      { source: '/shoots', destination: '/professional-shoots', permanent: true },
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

