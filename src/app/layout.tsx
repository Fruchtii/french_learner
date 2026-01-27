import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VerbeMaître - Master French Irregular Verbs",
  description: "Learn and master the 100 most common French irregular verbs with spaced repetition",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
