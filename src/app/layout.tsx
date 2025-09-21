import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Weather Forecast - Modern Weather App",
  description: "Get accurate weather forecasts for any city worldwide. Modern, responsive weather app built with Next.js and TypeScript.",
  keywords: ["weather", "forecast", "temperature", "climate", "meteorology"],
  authors: [{ name: "Weather Forecast App" }],
  robots: "index, follow",
  other: {
    'permissions-policy': 'geolocation=*',
  },
  openGraph: {
    title: "Weather Forecast - Modern Weather App",
    description: "Get accurate weather forecasts for any city worldwide.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Weather Forecast - Modern Weather App",
    description: "Get accurate weather forecasts for any city worldwide.",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
