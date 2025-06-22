import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { StagewiseToolbar } from "@stagewise/toolbar-next";
import { ReactPlugin } from "@stagewise-plugins/react";

export const metadata: Metadata = {
  title: "Jido-ka",
  description: "AI Agent for Task Automation",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Jido-ka",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/img/logo_192.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Jido-ka",
    "application-name": "Jido-ka",
    "msapplication-TileColor": "#2563eb",
    "msapplication-TileImage": "/img/logo_192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#2563eb" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ],
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
          "font-smart",
          "font-inter"
        )}
      >
        <StagewiseToolbar
          config={{
            plugins: [ReactPlugin],
          }}
        />
        {children}
      </body>
    </html>
  );
}
