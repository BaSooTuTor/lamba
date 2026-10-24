import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import { Header } from "./header";
import "./globals.css";

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "لمبة",
  description: "لما الفيزيا تنوّر في دماغك: محاكاة تفاعلية ومدرس ذكي لطلاب الثانوية العامة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${plexArabic.variable} font-sans antialiased`}>
        <div className="mx-auto min-h-screen max-w-md">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
