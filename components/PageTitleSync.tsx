"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { pathToZh } from "@/lib/locale";

const SUFFIX = { zh: " — 洪德忠 Leon Hong", en: " — Leon Hong Art" };

const TITLE_MAP: Record<string, { zh: string; en: string }> = {
  "/": { zh: "洪德忠", en: "Leon Hong — Art Portfolio" },
  "/about": { zh: "關於", en: "About" },
  "/contact": { zh: "聯繫", en: "Contact" },
  "/series": { zh: "作品集", en: "Series" },
  "/events": { zh: "活動", en: "Events" },
};

export default function PageTitleSync() {
  const pathname = usePathname() ?? "/";
  const { lang } = useLanguage();
  const pathKey = pathToZh(pathname);

  useEffect(() => {
    let entry = TITLE_MAP[pathKey];
    if (!entry && pathKey.startsWith("/events")) entry = TITLE_MAP["/events"];
    if (!entry) return;
    const title = lang === "zh" ? entry.zh : entry.en;
    document.title = `${title}${SUFFIX[lang]}`;
  }, [pathname, pathKey, lang]);

  // Scroll to top on route change (e.g. homepage → series page)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
