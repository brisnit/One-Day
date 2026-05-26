import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One Day Offering",
  description:
    "Discover what one day of your work is worth — and what it could do for someone else.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cloud text-ink">{children}</body>
    </html>
  );
}
