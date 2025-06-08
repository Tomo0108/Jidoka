import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const smartFont = localFont({
  src: "../../public/font/Smartfont_UI.otf",
  display: "swap",
  variable: "--font-sans",
});

const inter = Inter({ subsets: ["latin"], variable: "--font-chat" });

export const metadata: Metadata = {
  title: "Jido-ka",
  description: "AI Agent for Task Automation",
  icons: {
    icon: "/favicon.ico",
    apple: "/img/logo_192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          smartFont.variable,
          inter.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
