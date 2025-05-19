import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Thrones Companion",
  description: "Your guide to all things GoT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}