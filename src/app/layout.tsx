import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "SMS Panel", description: "Virtual numbers panel" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[radial-gradient(60rem_30rem_at_50%_-10%,rgba(99,102,241,0.18),transparent)]">
        {children}
      </body>
    </html>
  );
}
