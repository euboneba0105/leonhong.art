"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import ArtworkForm from "./ArtworkForm";
import ArtworkZoomImage from "./ArtworkZoomImage";
import SeriesForm from "./SeriesForm";
import type { Artwork, Series, Tag } from "@/lib/supabaseClient";
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

  /** 此系列作品有使用的媒材，未出現的媒材不顯示在篩選器 */
  const tagsInSeries = useMemo(() => {
    const ids = new Set<string>();
    artworks.forEach((a) => a.tags?.forEach((t) => ids.add(t.id)));
    return allTags.filter((t) => ids.has(t.id));
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
        thumb.offsetLeft -
        container.clientWidth / 2 +
        thumb.offsetWidth / 2;
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

  /** 依語言同步頁籤標題（系列名稱） */
  useEffect(() => {
    const suffix = "｜Leon Hong Art";
    if (isStandalone) {
      document.title = (zh ? "獨立作品" : "Standalone") + suffix;
      return;
    }
    const name = series ? (zh ? series.name : series.name_en || series.name) : "";
    if (name) document.title = name + suffix;
  }, [zh, isStandalone, series]);

  const selectedArtwork = filteredArtworks[selectedIndex] ?? null;

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
    router.push("/");
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <div className={styles.seriesHeaderRow}>
          <Link href="/series" className={styles.seriesBackLink}>
            ← {zh ? "返回" : "Back"}
          </Link>
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
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={styles.seriesNavBtn}
                      onClick={() =>
                        goToArtwork((selectedIndex + 1) % filteredArtworks.length)
                      }
                      aria-label={zh ? "下一張" : "Next"}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
                {selectedArtwork && (
                  <>
                    <div className={styles.seriesGalleryImageBlock}>
                      <ArtworkZoomImage
                        imageUrl={
                          selectedArtwork.image_url || "/placeholder.png"
                        }
                        alt={
                          zh
                            ? selectedArtwork.title
                            : selectedArtwork.title_en || selectedArtwork.title
                        }
                      />
                    </div>
                    <div
                      className={`${styles.infoSection} ${styles.seriesGalleryInfoSection}`}
                    >
                      <h3 className={styles.detailTitle}>
                          {zh
                            ? selectedArtwork.title
                            : selectedArtwork.title_en || selectedArtwork.title}
                        </h3>
                        <div className={styles.metaList}>
                          {selectedArtwork.year != null && (
                            <div className={styles.metaRow}>
                              <span className={styles.metaLabel}>
                                {zh ? "年份" : "Year"}
                              </span>
                              <span className={styles.metaValue}>
                                {selectedArtwork.year}
                              </span>
                            </div>
                          )}
                          {(selectedArtwork.tags?.length ?? 0) > 0 && (
                            <div className={styles.metaRow}>
                              <span className={styles.metaLabel}>
                                {zh ? "媒材" : "Medium"}
                              </span>
                              <span className={styles.metaValue}>
                                {(selectedArtwork.tags ?? [])
                                  .map((t) =>
                                    zh ? t.name : t.name_en || t.name,
                                  )
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                          {selectedArtwork.size && (
                            <div className={styles.metaRow}>
                              <span className={styles.metaLabel}>
                                {zh ? "尺寸" : "Size"}
                              </span>
                              <span className={styles.metaValue}>
                                {selectedArtwork.size}
                              </span>
                            </div>
                          )}
                        </div>
                        {(selectedArtwork.description ||
                          selectedArtwork.description_en) && (
                          <p className={styles.detailDescription}>
                            {zh
                              ? selectedArtwork.description
                              : selectedArtwork.description_en ||
                                selectedArtwork.description}
                          </p>
                        )}
                        {isAdmin && (
                          <div className={styles.detailAdminActions}>
                            <button
                              className={admin.editBtn}
                              onClick={() => setEditingArtwork(selectedArtwork)}
                            >
                              {zh ? "編輯" : "Edit"}
                            </button>
                            <button
                              className={admin.deleteBtn}
                              onClick={() =>
                                handleDeleteArtwork(selectedArtwork.id)
                              }
                            >
                              {zh ? "刪除" : "Delete"}
                            </button>
                          </div>
                        )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {filteredArtworks.length > 0 && (
            <div
              ref={thumbsContainerRef}
              className={styles.seriesGalleryThumbs}
            >
              {filteredArtworks.map((a, i) => (
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
                  <Image
                    src={a.image_url || "/placeholder.png"}
                    alt={zh ? a.title : a.title_en || a.title}
                    fill
                    sizes="100px"
                    className={styles.seriesGalleryThumbImg}
                    style={{ objectFit: "cover" }}
                    unoptimized={(a.image_url || "").startsWith("/api/image")}
                  />
                </button>
              ))}
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
                onSubmit={async (data) => {
                  setSaving(true);
                  setErrMsg("");
                  try {
                    const res = await fetch("/api/artworks", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    });
                    if (res.ok) {
                      setShowArtworkForm(false);
                      router.refresh();
                    } else {
                      const d = await res.json().catch(() => null);
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
                onSubmit={async (data) => {
                  setSaving(true);
                  setErrMsg("");
                  try {
                    const res = await fetch("/api/artworks", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: editingArtwork.id, ...data }),
                    });
                    if (res.ok) {
                      setEditingArtwork(null);
                      router.refresh();
                    } else {
                      const d = await res.json().catch(() => null);
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
