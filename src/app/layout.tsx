import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cwaya — Premium Video Editing, Photography & Creative Services in India",
  description: "Cwaya offers professional video editing, wedding photography, ImageIcon reels, YouTube shorts, corporate shoots, and AI-powered creative services across India. Based in Sehore, MP.",
  keywords: "video editing India, wedding photography Bhopal, ImageIcon reels editor, YouTube shorts, corporate videography, social media management, Cwaya, Sehore MP",
  authors: [{ name: "Cwaya Creative Studio" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://www.cwaya.me/",
  },
  openGraph: {
    type: "website",
    siteName: "Cwaya",
    title: "Cwaya — Premium Video Editing & Photography Services",
    description: "Professional video editing, reels, wedding photography, corporate shoots, AI bots, and web development services across India. Budget-friendly, professional standards.",
    url: "https://www.cwaya.me/",
    images: [
      {
        url: "https://www.cwaya.me/images/og-thumbnail.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cwaya — Premium Video Editing & Photography Services",
    description: "Professional video editing, reels, wedding photography, corporate shoots — Budget-friendly, professional standards.",
    images: ["https://www.cwaya.me/images/og-thumbnail.png"],
  },
  verification: {
    google: "s6QSrxxeZCt_kNqHjS6dfSxWqw_QHeLjWL8-fYTyA3Q",
  },
};

import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-Q4PY5PVJTS"
          strategy="afterInteractive"
        />
        {/* Google AdSense Auto Ads */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7856336500792481"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Q4PY5PVJTS');
          `}
        </Script>
        <Script
          type="module"
          src="https://gradio.s3-us-west-2.amazonaws.com/4.44.0/gradio.js"
          strategy="lazyOnload"
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <FloatingWhatsApp />
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
