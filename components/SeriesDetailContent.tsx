"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { basePath } from "@/lib/locale";
import ArtworkForm from "./ArtworkForm";
import ArtworkZoomImage from "./ArtworkZoomImage";
import SeriesForm from "./SeriesForm";
import type { Artwork, Series, Tag } from "@/lib/supabaseClient";
import { artworkImageProxyUrl } from "@/lib/imageProxy";
import styles from "@/styles/artworks.module.css";
import admin from "@/styles/adminUI.module.css";

interface SeriesDetailContentProps {
  series: Series | null;
  artworks: Artwork[];
  seriesList: Series[];
  allTags: Tag[];
  isStandalone: boolean;
  /** 目前頁面 URL slug（用於連結） */
  currentSlug?: string;
}

export default function SeriesDetailContent({
  series,
  artworks,
  seriesList,
  allTags,
  isStandalone,
  currentSlug,
}: SeriesDetailContentProps) {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const prefix = basePath(pathname);
  const searchParams = useSearchParams();
  const isAdmin = !!(session?.user as any)?.isAdmin;

  const [showEdit, setShowEdit] = useState(false);
  const [showArtworkForm, setShowArtworkForm] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  const fixedSeriesId = series?.id ?? null;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const thumbsContainerRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [canBackToSeriesList, setCanBackToSeriesList] = useState(false);
  const [failedThumbIds, setFailedThumbIds] = useState<Set<string>>(new Set());
  const thumbRetryScheduled = useRef<Set<string>>(new Set());
  const thumbRetryTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    try {
      const ref = document.referrer;
      if (!ref) return;
      const url = new URL(ref);
      if (url.origin !== window.location.origin) return;
      const p = url.pathname.replace(/\/$/, "") || "/";
      if (p === "/series" || p === "/en/series") setCanBackToSeriesList(true);
    } catch {
      // ignore
    }
  }, []);

  // 縮圖載入失敗時標記，2 秒後自動重試一次（避免偶發逾時/502）
  useEffect(() => {
    const timeouts = thumbRetryTimeouts.current;
    failedThumbIds.forEach((id) => {
      if (thumbRetryScheduled.current.has(id)) return;
      thumbRetryScheduled.current.add(id);
      timeouts[id] = setTimeout(() => {
        setFailedThumbIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        delete timeouts[id];
      }, 2000);
    });
    return () => {
      Object.values(timeouts).forEach(clearTimeout);
      Object.keys(timeouts).forEach((k) => delete timeouts[k]);
    };
  }, [failedThumbIds]);

  /** 此系列作品有使用的媒材，未出現的媒材不顯示在篩選器。有 allTags 時用其順序，否則從 artworks 推導 */
  const tagsInSeries = useMemo(() => {
    if (allTags.length > 0) {
      const ids = new Set<string>();
      artworks.forEach((a) => a.tags?.forEach((t) => ids.add(t.id)));
      return allTags.filter((t) => ids.has(t.id));
    }
    const seen = new Set<string>();
    const list: Tag[] = [];
    artworks.forEach((a) =>
      a.tags?.forEach((t) => {
        if (t && !seen.has(t.id)) {
          seen.add(t.id);
          list.push(t);
        }
      })
    );
    return list;
  }, [artworks, allTags]);

  const filteredArtworks = useMemo(() => {
    if (selectedTagIds.size === 0) return artworks;
    return artworks.filter((a) =>
      a.tags?.some((t) => selectedTagIds.has(t.id)),
    );
  }, [artworks, selectedTagIds]);

  const highlightArtworkId = searchParams.get("artwork");

  /** 切換作品並即時更新 URL 以利分享（用 replaceState 避免 router 延遲） */
  function goToArtwork(index: number) {
    const artwork = filteredArtworks[index];
    if (!artwork || !currentSlug) return;
    setSelectedIndex(index);
    const url = `${window.location.pathname}?artwork=${artwork.id}`;
    window.history.replaceState(null, "", url);
  }

  useEffect(() => {
    setSelectedIndex((i) =>
      i >= filteredArtworks.length
        ? Math.max(0, filteredArtworks.length - 1)
        : i,
    );
  }, [filteredArtworks.length]);

  useEffect(() => {
    if (!highlightArtworkId || filteredArtworks.length === 0) return;
    const idx = filteredArtworks.findIndex((a) => a.id === highlightArtworkId);
    if (idx >= 0) setSelectedIndex(idx);
  }, [highlightArtworkId, filteredArtworks]);

  /** 將當前選中的縮圖捲動到可見區域：桌面版垂直中間偏上，手機版水平中間 */
  useEffect(() => {
    const container = thumbsContainerRef.current;
    const thumb = thumbRefs.current[selectedIndex];
    if (!container || !thumb) return;

    const isHorizontal = container.scrollWidth > container.clientWidth;
    if (isHorizontal) {
      const scrollLeft =
        thumb.offsetLeft - container.clientWidth / 2 + thumb.offsetWidth / 2;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;
      container.scrollTo({
        left: Math.max(0, Math.min(scrollLeft, maxScrollLeft)),
        behavior: "smooth",
      });
    } else {
      const containerHeight = container.clientHeight;
      const thumbTop = thumb.offsetTop;
      const thumbHeight = thumb.offsetHeight;
      const targetOffset = containerHeight * 0.35;
      const scrollTop = thumbTop - targetOffset + thumbHeight / 2;
      const maxScroll = container.scrollHeight - containerHeight;
      container.scrollTo({
        top: Math.max(0, Math.min(scrollTop, maxScroll)),
        behavior: "smooth",
      });
    }
  }, [selectedIndex]);

  /** 只預載相鄰一張（前一、下一），避免一次請求過多主圖 */
  useEffect(() => {
    const n = filteredArtworks.length;
    if (n === 0) return;
    const indices = new Set<number>();
    for (const delta of [-1, 1]) {
      const i = (selectedIndex + delta + n) % n;
      indices.add(i);
    }
    const links: HTMLLinkElement[] = [];
    indices.forEach((i) => {
      const art = filteredArtworks[i];
      const url = art?.image_url;
      if (!url || url === "/placeholder.png") return;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = url;
      document.head.appendChild(link);
      links.push(link);
    });
    return () => links.forEach((l) => l.remove());
  }, [filteredArtworks, selectedIndex]);

  /** 依語言同步頁籤標題（系列名稱） */
  useEffect(() => {
    const suffix = " — Leon Hong Art";
    if (isStandalone) {
      document.title = (zh ? "獨立作品" : "Standalone") + suffix;
      return;
    }
    const name = series
      ? zh
        ? series.name
        : series.name_en || series.name
      : "";
    if (name) document.title = name + suffix;
  }, [zh, isStandalone, series]);

  function formatStatus(status: Artwork["status"] | undefined, zh: boolean) {
    if (!status) return null;
    switch (status) {
      case "available":
        return zh ? "開放收藏" : "Available";
      case "private_collection":
        return zh ? "私人收藏" : "Private Collection";
      case "reserved":
        return zh ? "已預定" : "Reserved";
      case "acquired":
        return zh ? "已被典藏" : "Acquired";
      default:
        return status;
    }
  }

  function toggleFilterTag(id: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const title = isStandalone
    ? zh
      ? "獨立作品"
      : "Standalone"
    : zh
      ? series!.name
      : series!.name_en || series!.name;

  const description =
    !isStandalone && series
      ? zh
        ? series.description
        : series.description_en || series.description
      : null;

  async function handleDeleteArtwork(id: string) {
    if (!confirm(zh ? "確定要刪除此作品？" : "Delete this artwork?")) return;
    await fetch("/api/artworks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  async function handleEditSeries(form: any) {
    if (!series) return;
    setSaving(true);
    try {
      const res = await fetch("/api/series", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: series.id, ...form }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => null);
        throw new Error(d?.error || `Error (${res.status})`);
      }
      setShowEdit(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteSeries() {
    if (!series) return;
    if (
      !confirm(
        zh
          ? "確定要刪除此系列？系列內的作品不會被刪除。"
          : "Delete this series? Artworks in this series will not be deleted.",
      )
    )
      return;
    await fetch("/api/series", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: series.id }),
    });
    router.push(prefix || "/");
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <div className={styles.seriesHeaderRow}>
          <button
            type="button"
            className={styles.seriesBackLink}
            onClick={() => {
              if (canBackToSeriesList) {
                router.back();
              } else {
                router.push(prefix ? `${prefix}/series` : "/series");
              }
            }}
          >
            ←{' '}{zh ? "返回" : "Back"}
          </button>
          {isAdmin && !isStandalone && series && (
            <div className={styles.seriesHeaderActions}>
              <button
                className={admin.editBtn}
                onClick={() => setShowEdit(true)}
              >
                {zh ? "編輯系列" : "Edit Series"}
              </button>
              <button className={admin.deleteBtn} onClick={handleDeleteSeries}>
                {zh ? "刪除系列" : "Delete Series"}
              </button>
            </div>
          )}
        </div>

        <div className={styles.seriesPageContentRow}>
          <div className={styles.seriesPageContentLeft}>
            <div className={styles.seriesIntro}>
              <h1 className={styles.seriesTitle}>{title}</h1>

              {description && (
                <p className={styles.seriesDescription}>{description}</p>
              )}
            </div>

            {isAdmin && (
              <div
                className={admin.adminBar}
                style={{ justifyContent: "flex-start", marginBottom: "2rem" }}
              >
                <button
                  className={admin.addBtn}
                  onClick={() => setShowArtworkForm(true)}
                >
                  + {zh ? "新增作品" : "Add Artwork"}
                </button>
              </div>
            )}

            {/* 媒材過濾器 + 上一張/下一張（有作品時同一列） */}
            {(tagsInSeries.length > 1 || filteredArtworks.length > 0) && (
              <div className={styles.filterRow}>
                <div className={styles.filterSection}>
                  {tagsInSeries.length > 1 && (
                    <div className={styles.filterChips}>
                      {tagsInSeries.map((t) => (
                        <button
                          key={t.id}
                          className={`${styles.filterChip} ${selectedTagIds.has(t.id) ? styles.filterChipActive : ""}`}
                          onClick={() => toggleFilterTag(t.id)}
                        >
                          {zh ? t.name : t.name_en || t.name}
                        </button>
                      ))}
                      {selectedTagIds.size > 0 && (
                        <button
                          className={styles.filterClear}
                          onClick={() => setSelectedTagIds(new Set())}
                        >
                          {zh ? "清除" : "Clear"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {filteredArtworks.length > 0 && (
                  <div className={styles.seriesNavButtons}>
                    <span className={styles.seriesNavProgress} aria-hidden>
                      {selectedIndex + 1} / {filteredArtworks.length}
                    </span>
                    <button
                      type="button"
                      className={styles.seriesNavBtn}
                      onClick={() =>
                        goToArtwork(
                          (selectedIndex - 1 + filteredArtworks.length) %
                            filteredArtworks.length,
                        )
                      }
                      aria-label={zh ? "上一張" : "Previous"}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={styles.seriesNavBtn}
                      onClick={() =>
                        goToArtwork(
                          (selectedIndex + 1) % filteredArtworks.length,
                        )
                      }
                      aria-label={zh ? "下一張" : "Next"}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {artworks.length === 0 ? (
              <div className={styles.emptyState}>
                <p>
                  {zh ? "此系列尚無作品。" : "No artworks in this series yet."}
                </p>
              </div>
            ) : filteredArtworks.length === 0 ? (
              <div className={styles.emptyState}>
                <p>
                  {zh
                    ? selectedTagIds.size > 0
                      ? "沒有符合條件的作品。"
                      : "此系列尚無作品。"
                    : selectedTagIds.size > 0
                      ? "No artworks match the selected filters."
                      : "No artworks in this series yet."}
                </p>
              </div>
            ) : (
              <>
                <div className={styles.seriesGallerySlideWrap}>
                  {filteredArtworks.map((artwork, i) => {
                    const n = filteredArtworks.length;
                    const prev = (selectedIndex - 1 + n) % n;
                    const next = (selectedIndex + 1) % n;
                    const shouldLoadMain =
                      i === selectedIndex || i === prev || i === next;
                    return (
                      <div
                        key={artwork.id}
                        className={`${styles.seriesGalleryImagePanel} ${i === selectedIndex ? styles.seriesGalleryImagePanelSelected : ""}`}
                      >
                        <div className={styles.seriesGalleryImageBlock}>
                          {shouldLoadMain ? (
                            <ArtworkZoomImage
                              imageUrl={
                                artwork.image_url || "/placeholder.png"
                              }
                              alt={
                                zh
                                  ? `洪德忠 - ${artwork.title}`
                                  : `Leon Hong - ${artwork.title_en || artwork.title}`
                              }
                              priority={i === selectedIndex}
                            />
                          ) : (
                            <div
                              className={styles.seriesGalleryImagePlaceholder}
                              style={{ aspectRatio: "4/3" }}
                              aria-hidden
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.seriesGalleryInfoFadeWrap}>
                  {filteredArtworks.map((artwork, i) => (
                    <div
                      key={artwork.id}
                      className={`${styles.seriesGalleryInfoBlock} ${i === selectedIndex ? styles.seriesGalleryInfoBlockSelected : ""}`}
                    >
                      <div
                        className={`${styles.infoSection} ${styles.seriesGalleryInfoSection}`}
                      >
                        <h3 className={styles.detailTitle}>
                          {zh
                            ? artwork.title
                            : artwork.title_en || artwork.title}
                        </h3>
                        <div className={styles.metaList}>
                          {artwork.year != null && (
                            <div className={styles.metaRow}>
                              <span className={styles.metaLabel}>
                                {zh ? "年份" : "Year"}
                              </span>
                              <span className={styles.metaValue}>
                                {artwork.year}
                              </span>
                            </div>
                          )}
                          {(artwork.tags?.length ?? 0) > 0 && (
                            <div className={styles.metaRow}>
                              <span className={styles.metaLabel}>
                                {zh ? "媒材" : "Medium"}
                              </span>
                              <span className={styles.metaValue}>
                                {(artwork.tags ?? [])
                                  .map((t) =>
                                    zh ? t.name : t.name_en || t.name,
                                  )
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                          {artwork.size && (
                            <div className={styles.metaRow}>
                              <span className={styles.metaLabel}>
                                {zh ? "尺寸" : "Size"}
                              </span>
                              <span className={styles.metaValue}>
                                {artwork.size}
                              </span>
                            </div>
                          )}
                          <div className={styles.metaRow}>
                            <span className={styles.metaLabel}>
                              {zh ? "狀態" : "Status"}
                            </span>
                            <span className={styles.metaValue}>
                              {formatStatus(artwork.status, zh) ?? "—"}
                              {artwork.status === "available" && (
                                <Link
                                  href={prefix ? `${prefix}/contact` : "/contact"}
                                  className={styles.inquireBtn}
                                >
                                  {zh ? "立即洽詢" : "Inquire"}
                                </Link>
                              )}
                            </span>
                          </div>
                        </div>
                        {(artwork.description ||
                          artwork.description_en) && (
                          <p className={styles.detailDescription}>
                            {zh
                              ? artwork.description
                              : artwork.description_en ||
                                artwork.description}
                          </p>
                        )}
                        {isAdmin && (
                          <div className={styles.detailAdminActions}>
                            <button
                              className={admin.editBtn}
                              onClick={() => setEditingArtwork(artwork)}
                            >
                              {zh ? "編輯" : "Edit"}
                            </button>
                            <button
                              className={admin.deleteBtn}
                              onClick={() =>
                                handleDeleteArtwork(artwork.id)
                              }
                            >
                              {zh ? "刪除" : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {filteredArtworks.length > 0 && (
            <div
              ref={thumbsContainerRef}
              className={styles.seriesGalleryThumbs}
            >
              {filteredArtworks.map((a, i) => {
                const thumbFailed = failedThumbIds.has(a.id);
                const thumbSrc = a.image_url
                  ? artworkImageProxyUrl(a.id, 120)
                  : "/placeholder.png";
                return (
                  <button
                    key={a.id}
                    ref={(el) => {
                      thumbRefs.current[i] = el;
                    }}
                    type="button"
                    className={`${styles.seriesGalleryThumb} ${i === selectedIndex ? styles.seriesGalleryThumbActive : ""}`}
                    onClick={() => goToArtwork(i)}
                    aria-label={zh ? a.title : a.title_en || a.title}
                  >
                    {thumbFailed ? (
                      <div
                        className={styles.seriesGalleryThumbPlaceholder}
                        aria-hidden
                      />
                    ) : (
                      <Image
                        src={thumbSrc}
                        alt={
                          zh
                            ? `洪德忠 - ${a.title}`
                            : `Leon Hong - ${a.title_en || a.title}`
                        }
                        fill
                        sizes="100px"
                        className={styles.seriesGalleryThumbImg}
                        style={{ objectFit: "cover" }}
                        loading="lazy"
                        fetchPriority={i <= 3 ? "auto" : "low"}
                        quality={60}
                        unoptimized={(a.image_url || "").startsWith("/api/image")}
                        onError={() =>
                          setFailedThumbIds((prev) => new Set(prev).add(a.id))
                        }
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {showEdit && series && (
          <div className={admin.overlay} onClick={() => setShowEdit(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <SeriesForm
                series={series}
                artworks={artworks}
                onSubmit={handleEditSeries}
                onCancel={() => setShowEdit(false)}
                loading={saving}
              />
            </div>
          </div>
        )}

        {/* 新增作品（所屬系列已鎖定為當前系列 / 獨立作品） */}
        {showArtworkForm && (
          <div
            className={admin.overlay}
            onClick={() => setShowArtworkForm(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ArtworkForm
                artwork={null}
                seriesList={seriesList}
                allTags={allTags}
                fixedSeriesId={fixedSeriesId}
                externalErrMsg={errMsg}
                onSubmit={async (data) => {
                  setSaving(true);
                  setErrMsg("");
                  try {
                    const res = await fetch("/api/artworks", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    });
                    const d = await res.json().catch(() => ({}));
                    if (res.ok) {
                      setShowArtworkForm(false);
                      router.refresh();
                    } else {
                      throw new Error(d?.error || `Error (${res.status})`);
                    }
                  } catch (err: any) {
                    setErrMsg(
                      err.message || (zh ? "網路錯誤" : "Network error"),
                    );
                  }
                  setSaving(false);
                }}
                onCancel={() => setShowArtworkForm(false)}
                loading={saving}
              />
            </div>
          </div>
        )}

        {/* 編輯作品（從系列頁編輯時系列鎖定） */}
        {editingArtwork && (
          <div
            className={admin.overlay}
            onClick={() => setEditingArtwork(null)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <ArtworkForm
                artwork={editingArtwork}
                seriesList={seriesList}
                allTags={allTags}
                fixedSeriesId={fixedSeriesId}
                externalErrMsg={errMsg}
                onSubmit={async (data) => {
                  setSaving(true);
                  setErrMsg("");
                  try {
                    const res = await fetch("/api/artworks", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: editingArtwork.id, ...data }),
                    });
                    const d = await res.json().catch(() => ({}));
                    if (res.ok) {
                      setEditingArtwork(null);
                      router.refresh();
                    } else {
                      throw new Error(d?.error || `Error (${res.status})`);
                    }
                  } catch (err: any) {
                    setErrMsg(
                      err.message || (zh ? "網路錯誤" : "Network error"),
                    );
                  }
                  setSaving(false);
                }}
                onCancel={() => setEditingArtwork(null)}
                loading={saving}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
