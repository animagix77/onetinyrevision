import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "One Tiny Revision · The Carving Room",
  description:
    "Carve a Thanksgiving plate for a very particular guest. A shared game by Judge Dean LLC.",
  icons: { icon: "/favicon.svg" },
  authors: [{ name: "Judge Dean LLC" }],
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
