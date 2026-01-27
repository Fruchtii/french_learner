import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "vokab - Master your flashcards",
  description: "Learn and master vocabulary with spaced repetition. Smart flashcard system for effective learning.",
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
