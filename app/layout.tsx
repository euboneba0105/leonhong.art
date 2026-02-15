import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "萊恩 - 藝術家個人網站",
  description: "探索精彩的藝術作品集",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='80' font-size='90' fill='%23d4a574'>🎨</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
