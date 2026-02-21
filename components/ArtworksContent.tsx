"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import ArtworkGrid from "./ArtworkGrid";
import SeriesForm from "./SeriesForm";
import TagForm from "./TagForm";
import type { Artwork, Series, Tag } from "@/lib/supabaseClient";
import styles from "@/styles/artworks.module.css";
import admin from "@/styles/adminUI.module.css";

interface ArtworksContentProps {
  artworks: Artwork[];
  seriesList: Series[];
  allTags: Tag[];
  error: string | null;
}

export default function ArtworksContent({
  artworks,
  seriesList,
  allTags,
  error,
}: ArtworksContentProps) {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const { data: session } = useSession();
  const router = useRouter();
  const isAdmin = !!(session?.user as any)?.isAdmin;

  const [showSeriesForm, setShowSeriesForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());

  // Build series cards data
  const seriesCards = useMemo(() => {
    return seriesList.map((s) => {
      let cover = null;
      if (s.cover_image_id) {
        cover = artworks.find((a) => a.id === s.cover_image_id);
      } else {
        cover = artworks.find((a) => a.series_id === s.id);
      }
      return { series: s, coverUrl: cover?.image_url || null };
    });
  }, [seriesList, artworks]);

  // Filter artworks by selected tags
  const filteredArtworks = useMemo(() => {
    if (selectedTagIds.size === 0) return artworks;
    return artworks.filter((a) =>
      a.tags?.some((t) => selectedTagIds.has(t.id)),
    );
  }, [artworks, selectedTagIds]);

  function toggleFilterTag(id: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Series CRUD ──
  async function handleSeriesDelete(id: string) {
    if (!confirm(zh ? "確定要刪除此系列？" : "Delete this series?")) return;
    await fetch("/api/series", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  // ── Tag CRUD ──
  async function handleTagDelete(id: string) {
    if (!confirm(zh ? "確定要刪除此媒材？" : "Delete this medium?")) return;
    await fetch("/api/tags", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        {isAdmin && (
          <div className={admin.adminBar}>
            <button
              className={admin.addBtn}
              onClick={() => setShowSeriesForm(true)}
            >
              + {zh ? "新增系列" : "Add Series"}
            </button>
            <button
              className={admin.addBtn}
              onClick={() => setShowTagForm(true)}
            >
              + {zh ? "新增媒材" : "Add Medium"}
            </button>
          </div>
        )}

        {/* Tag management (admin only) */}
        {isAdmin && allTags.length > 0 && (
          <div className={styles.seriesAdminList}>
            <h2 className={styles.seriesAdminTitle}>
              {zh ? "媒材管理" : "Medium Management"}
            </h2>
            <div className={styles.seriesChips}>
              {allTags.map((t) => (
                <span key={t.id} className={styles.seriesChip}>
                  {zh ? t.name : t.name_en || t.name}
                  <button
                    className={styles.seriesChipEdit}
                    onClick={() => setEditingTag(t)}
                  >
                    ✎
                  </button>
                  <button
                    className={styles.seriesChipDelete}
                    onClick={() => handleTagDelete(t.id)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Series cards */}
        {seriesCards.length > 0 && (
          <div className={styles.seriesCardsSection}>
            <div className={styles.seriesCardsGrid}>
              {seriesCards.map(({ series: s, coverUrl }) => (
                <div key={s.id} className={styles.seriesCardWrap}>
                  <Link href={`/series/${s.id}`} className={styles.seriesCard}>
                    <div className={styles.seriesCardImageWrap}>
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={zh ? s.name : s.name_en || s.name}
                          fill
                          sizes="(max-width: 768px) 40vw, 200px"
                          className={styles.seriesCardImage}
                        />
                      ) : (
                        <div className={styles.seriesCardPlaceholder} />
                      )}
                    </div>
                    <span className={styles.seriesCardName}>
                      {zh ? s.name : s.name_en || s.name}
                    </span>
                  </Link>
                  {isAdmin && (
                    <div className={styles.seriesCardAdmin}>
                      <button
                        className={styles.seriesCardAdminBtn}
                        onClick={() => setEditingSeries(s)}
                      >
                        ✎
                      </button>
                      <button
                        className={`${styles.seriesCardAdminBtn} ${styles.seriesCardDeleteBtn}`}
                        onClick={() => handleSeriesDelete(s.id)}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tag filter */}
        {allTags.length > 1 && (
          <div className={styles.filterSection}>
            <div className={styles.filterChips}>
              {allTags.map((t) => (
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
          </div>
        )}

        {error ? (
          <div className={styles.errorMessage}>
            <p>{zh ? "載入作品失敗，請稍後再試。" : error}</p>
            <p className={styles.errorSubtext}>
              {zh
                ? "請檢查網路連線後重新整理頁面。"
                : "Please check your connection and try refreshing the page."}
            </p>
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>
              {zh
                ? selectedTagIds.size > 0
                  ? "沒有符合條件的作品。"
                  : "尚無作品，請稍後再來！"
                : selectedTagIds.size > 0
                  ? "No artworks match the selected filters."
                  : "No artworks found yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <ArtworkGrid artworks={filteredArtworks} isAdmin={isAdmin} />
        )}

        {/* ── Modals ── */}

        {/* Edit Series */}
        {editingSeries && (
          <div className={admin.overlay} onClick={() => setEditingSeries(null)}>
            <div onClick={(e) => e.stopPropagation()}>
              <SeriesForm
                series={editingSeries}
                artworks={artworks.filter(
                  (a) => a.series_id === editingSeries?.id,
                )}
                onSubmit={async (data) => {
                  setErrMsg("");
                  const res = await fetch("/api/series", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: editingSeries.id, ...data }),
                  });
                  if (!res.ok) {
                    const d = await res.json().catch(() => null);
                    throw new Error(d?.error || `Error (${res.status})`);
                  }
                  setEditingSeries(null);
                  router.refresh();
                }}
                onCancel={() => setEditingSeries(null)}
                loading={saving}
              />
            </div>
          </div>
        )}

        {/* Edit Tag */}
        {editingTag && (
          <div className={admin.overlay} onClick={() => setEditingTag(null)}>
            <div onClick={(e) => e.stopPropagation()}>
              <TagForm
                tag={editingTag}
                onSubmit={async (data) => {
                  setSaving(true);
                  setErrMsg("");
                  try {
                    const res = await fetch("/api/tags", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: editingTag.id, ...data }),
                    });
                    if (res.ok) {
                      setEditingTag(null);
                      router.refresh();
                    } else {
                      const d = await res.json().catch(() => null);
                      throw new Error(d?.error || `Error (${res.status})`);
                    }
                  } catch (err: any) {
                    setErrMsg(err.message || "網路錯誤");
                  }
                  setSaving(false);
                }}
                onCancel={() => setEditingTag(null)}
                loading={saving}
              />
            </div>
          </div>
        )}

        {/* Add Series */}
        {showSeriesForm && (
          <div
            className={admin.overlay}
            onClick={() => setShowSeriesForm(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <SeriesForm
                series={null}
                artworks={[]}
                onSubmit={async (data) => {
                  setSaving(true);
                  setErrMsg("");
                  try {
                    const res = await fetch("/api/series", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    });
                    if (res.ok) {
                      setShowSeriesForm(false);
                      router.refresh();
                    } else {
                      const d = await res.json().catch(() => null);
                      throw new Error(d?.error || `Error (${res.status})`);
                    }
                  } catch (err: any) {
                    setErrMsg(err.message || "網路錯誤");
                  }
                  setSaving(false);
                }}
                onCancel={() => setShowSeriesForm(false)}
                loading={saving}
              />
            </div>
          </div>
        )}

        {/* Add Tag */}
        {showTagForm && (
          <div className={admin.overlay} onClick={() => setShowTagForm(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <TagForm
                tag={null}
                onSubmit={async (data) => {
                  setSaving(true);
                  setErrMsg("");
                  try {
                    const res = await fetch("/api/tags", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    });
                    if (res.ok) {
                      setShowTagForm(false);
                      router.refresh();
                    } else {
                      const d = await res.json().catch(() => null);
                      throw new Error(d?.error || `Error (${res.status})`);
                    }
                  } catch (err: any) {
                    setErrMsg(err.message || "網路錯誤");
                  }
                  setSaving(false);
                }}
                onCancel={() => setShowTagForm(false)}
                loading={saving}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
