import type { Metadata } from "next";
import { Inter, DM_Mono } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "AmjiltPressAgency",
    template: "%s — AmjiltPressAgency",
  },
  description: "News as it should be read — beautifully.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    siteName: "AmjiltPressAgency",
    type: "website",
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "AmjiltPressAgency" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${dmMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-(--color-text)">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
