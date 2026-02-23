import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import SessionProvider from "@/components/SessionProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DisableImageContextMenu from "@/components/DisableImageContextMenu";
import PageTitleSync from "@/components/PageTitleSync";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://leonhong.art");

export const metadata = {
  title: {
    default: "Leon Hong Art",
    template: "%s — Leon Hong Art",
  },
  description:
    "洪德忠 Leon Hong (Te-chung Hong) 藝術作品集。當代藝術創作，水性媒材、複合媒材。Leon Hong artist portfolio, original artworks.",
  openGraph: {
    siteName: "Leon Hong Art",
    type: "website",
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Leon Hong",
  alternateName: [
    "洪德忠",
    "Te-chung Hong",
    "Te-chung Hong 洪德忠",
    "Leon Hong 洪德忠",
  ],
  url: SITE_URL,
  image: `${SITE_URL}/portrait.jpg`,
  description:
    "洪德忠 Leon Hong (Te-chung Hong)，台灣藝術家，複合媒材、水性媒材創作。Artist based in Taiwan.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Leon Hong Art",
  alternateName: ["洪德忠 藝術", "Leon Hong Art Portfolio"],
  url: SITE_URL,
  author: personSchema,
  inLanguage: ["zh-Hant", "en"],
};

const schemaJson = JSON.stringify([personSchema, websiteSchema]);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <head>
        <meta
          name="google-site-verification"
          content="vpicKqHjJXWsW3BZ5RFq5NPooaDfsmvTEQVr7MCbzwk"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@600&family=Unna:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: schemaJson }}
        />
      </head>
      <body>
        <DisableImageContextMenu />
        <SessionProvider>
          <LanguageProvider>
            <PageTitleSync />
            <Header />
            {children}
            <Footer />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
