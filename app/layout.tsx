import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnalyticsClient from "../components/AnalyticsClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SellerImageFix — Better Listing Photos. Higher Sales.",
  description:
    "Prepare your listing photos instantly. Resize, smart-crop, and download a tidy bundle. Always Free.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}

        <footer className="mt-12 text-center text-sm text-gray-500 space-x-4 py-8">
          <a href="/privacy" className="hover:text-gray-700 transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-gray-700 transition-colors">
            Terms of Use
          </a>
        </footer>

        <AnalyticsClient />
      </body>
    </html>
  );
}

