"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import { basePath } from "@/lib/locale";
import { uploadFile } from "@/lib/uploadFile";
import type { Exhibition, EventGalleryPhoto } from "@/lib/supabaseClient";
import styles from "@/styles/eventDetail.module.css";
import admin from "@/styles/adminUI.module.css";

function formatDate(dateStr: string, zh: boolean): string {
  const date = new Date(dateStr);
  if (zh) {
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateRange(start?: string, end?: string, zh?: boolean): string {
  if (!start) return "";
  const s = formatDate(start, !!zh);
  if (!end) return s;
  const startDay = new Date(start).toISOString().slice(0, 10);
  const endDay = new Date(end).toISOString().slice(0, 10);
  if (startDay === endDay) return s;
  const e = formatDate(end, !!zh);
  return `${s} — ${e}`;
}

interface EventDetailContentProps {
  event: Exhibition;
  galleryPhotos: EventGalleryPhoto[];
}

export default function EventDetailContent({
  event,
  galleryPhotos: initialPhotos,
}: EventDetailContentProps) {
  const { lang } = useLanguage();
  const zh = lang === "zh";
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const prefix = basePath(pathname);
  const isAdmin = !!(session?.user as any)?.isAdmin;

  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: event.title || "",
    title_en: event.title_en || "",
    description: event.description || "",
    description_en: event.description_en || "",
    start_date: event.start_date || "",
    end_date: event.end_date || "",
    location: event.location || "",
    location_en: event.location_en || "",
    location_url: event.location_url || "",
  });

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] =
    useState<EventGalleryPhoto | null>(null);
  const [photoModalClosing, setPhotoModalClosing] = useState(false);

  // Gallery state
  const [galleryPhotos, setGalleryPhotos] =
    useState<EventGalleryPhoto[]>(initialPhotos);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [canBackToEventsList, setCanBackToEventsList] = useState(false);

  useEffect(() => {
    try {
      const ref = document.referrer;
      if (!ref) return;
      const url = new URL(ref);
      if (url.origin !== window.location.origin) return;
      const p = url.pathname.replace(/\/$/, "") || "/";
      if (p === "/events" || p === "/en/events") setCanBackToEventsList(true);
    } catch {
      // ignore
    }
  }, []);

  const currentPhotoIndex =
    selectedPhoto === null
      ? -1
      : galleryPhotos.findIndex((p) => p.id === selectedPhoto.id);
  const prevPhoto =
    currentPhotoIndex > 0 ? galleryPhotos[currentPhotoIndex - 1] : null;
  const nextPhoto =
    currentPhotoIndex >= 0 && currentPhotoIndex < galleryPhotos.length - 1
      ? galleryPhotos[currentPhotoIndex + 1]
      : null;

  function closePhotoModal() {
    setPhotoModalClosing(true);
    setTimeout(() => {
      setSelectedPhoto(null);
      setPhotoModalClosing(false);
    }, 280);
  }

  useEffect(() => {
    if (!selectedPhoto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePhotoModal();
      else if (e.key === "ArrowLeft" && prevPhoto) setSelectedPhoto(prevPhoto);
      else if (e.key === "ArrowRight" && nextPhoto) setSelectedPhoto(nextPhoto);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedPhoto, prevPhoto, nextPhoto]);

  const title = zh ? event.title : event.title_en || event.title;
  const description = zh
    ? event.description
    : event.description_en || event.description;
  const location = zh ? event.location : event.location_en || event.location;
  const dateRange = formatDateRange(event.start_date, event.end_date, zh);

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrMsg("");
    try {
      let cover_image_url = event.cover_image_url || null;

      if (coverFile) {
        try {
          cover_image_url = await uploadFile(coverFile, "events", (p) =>
            setUploadProgress(p),
          );
        } catch (uploadErr: any) {
          setErrMsg(uploadErr.message);
          setSaving(false);
          setUploadProgress(null);
          return;
        }
        setUploadProgress(null);
      }

      const res = await fetch("/api/exhibitions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.id, ...form, cover_image_url }),
      });
      if (res.ok) {
        setShowEdit(false);
        setCoverFile(null);
        router.refresh();
      } else {
        const d = await res.json().catch(() => null);
        setErrMsg(d?.error || `Error (${res.status})`);
      }
    } catch (err: any) {
      setErrMsg(err.message || "網路錯誤");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm(zh ? "確定要刪除此活動？" : "Delete this event?")) return;
    await fetch("/api/exhibitions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: event.id }),
    });
    router.push(`${prefix}/events`);
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);

    for (let i = 0; i < files.length; i++) {
      try {
        setUploadProgress(0);
        const imageUrl = await uploadFile(files[i], "gallery", (p) =>
          setUploadProgress(p),
        );
        setUploadProgress(null);
        const res = await fetch("/api/event-gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exhibition_id: event.id,
            image_url: imageUrl,
          }),
        });
        if (res.ok) {
          const photo = await res.json();
          setGalleryPhotos((prev) => [...prev, photo]);
        }
      } catch {
        // skip failed uploads
      }
    }

    setUploadProgress(null);
    setUploadingGallery(false);
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  async function handleDeleteGalleryPhoto(photoId: string) {
    if (!confirm(zh ? "確定要刪除此照片？" : "Delete this photo?")) return;
    await fetch("/api/event-gallery", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: photoId }),
    });
    setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId));
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => {
            if (canBackToEventsList) {
              router.back();
            } else {
              router.push(prefix ? `${prefix}/events` : "/events");
            }
          }}
        >
          ← {zh ? "返回" : "Back"}
        </button>

        {event.cover_image_url && (
          <div className={styles.coverWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={event.cover_image_url}
              alt={title}
              className={styles.coverImage}
              loading="eager"
            />
          </div>
        )}

        <h1 className={styles.title}>{title}</h1>

        {dateRange && <p className={styles.date}>{dateRange}</p>}

        {location && (
          <p className={styles.location}>
            {event.location_url ? (
              <a
                href={event.location_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.locationLink}
              >
                {location}
              </a>
            ) : (
              location
            )}
          </p>
        )}

        {description && <div className={styles.description}>{description}</div>}

        {isAdmin && (
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
            <button className={admin.editBtn} onClick={() => setShowEdit(true)}>
              {zh ? "編輯" : "Edit"}
            </button>
            <button className={admin.deleteBtn} onClick={handleDelete}>
              {zh ? "刪除" : "Delete"}
            </button>
          </div>
        )}

        {/* Gallery Photos Section */}
        {(galleryPhotos.length > 0 || isAdmin) && (
          <section className={styles.gallerySection}>
            <h2 className={styles.galleryTitle}>
              {zh ? "活動花絮" : "Event Highlights"}
            </h2>

            {galleryPhotos.length > 0 && (
              <div className={styles.galleryGrid}>
                {galleryPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className={styles.galleryItem}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPhoto(photo)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedPhoto(photo);
                      }
                    }}
                    aria-label={zh ? "放大檢視" : "View larger"}
                  >
                    <Image
                      src={photo.image_url}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className={styles.galleryImage}
                    />
                    {isAdmin && (
                      <button
                        type="button"
                        className={styles.galleryDeleteBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGalleryPhoto(photo.id);
                        }}
                        title={zh ? "刪除此花絮" : "Delete photo"}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isAdmin && (
              <div style={{ marginTop: "1rem" }}>
                <label
                  className={admin.addBtn}
                  style={{ cursor: "pointer", display: "inline-block" }}
                >
                  {uploadingGallery
                    ? zh
                      ? "上傳中..."
                      : "Uploading..."
                    : zh
                      ? "+ 上傳活動花絮"
                      : "+ Upload Highlights"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={galleryInputRef}
                    style={{ display: "none" }}
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                  />
                </label>
                {uploadingGallery && uploadProgress !== null && (
                  <div className={admin.progressWrapper}>
                    <div className={admin.progressLabel}>
                      {zh
                        ? `上傳中 ${uploadProgress}%`
                        : `Uploading ${uploadProgress}%`}
                    </div>
                    <div className={admin.progressTrack}>
                      <div
                        className={admin.progressFill}
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Photo lightbox modal */}
        {selectedPhoto && (
          <div
            className={`${styles.photoModalOverlay} ${photoModalClosing ? styles.photoModalOverlayClosing : ""}`}
            onClick={closePhotoModal}
            role="dialog"
            aria-modal="true"
            aria-label={zh ? "放大檢視照片" : "View photo"}
          >
            <button
              type="button"
              className={styles.photoModalClose}
              onClick={closePhotoModal}
              aria-label={zh ? "關閉" : "Close"}
            >
              ×
            </button>
            {galleryPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  className={styles.photoModalNav}
                  style={{ left: "1rem" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (prevPhoto) setSelectedPhoto(prevPhoto);
                  }}
                  disabled={!prevPhoto}
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
                  className={styles.photoModalNav}
                  style={{ right: "1rem" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (nextPhoto) setSelectedPhoto(nextPhoto);
                  }}
                  disabled={!nextPhoto}
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
              </>
            )}
            <div
              className={`${styles.photoModalContent} ${photoModalClosing ? styles.photoModalContentClosing : ""}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={selectedPhoto.id}
                src={selectedPhoto.image_url}
                alt=""
                className={styles.photoModalImage}
              />
            </div>
          </div>
        )}

        {showEdit && (
          <div className={admin.overlay} onClick={() => setShowEdit(false)}>
            <form
              className={admin.modal}
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleEdit}
            >
              <h2 className={admin.modalTitle}>
                {zh ? "編輯活動" : "Edit Event"}
              </h2>

              <div className={admin.formGroup}>
                <label className={admin.formLabel}>
                  {zh ? "封面圖片" : "Cover Image"}
                </label>
                {event.cover_image_url && !coverFile && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#666",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {zh
                      ? "目前已有封面圖片，選擇新檔案將會替換"
                      : "Current cover exists. Choose a new file to replace."}
                  </p>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={coverInputRef}
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                />
                {coverFile && (
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "#666",
                      marginTop: "0.25rem",
                    }}
                  >
                    {coverFile.name}
                  </p>
                )}
              </div>

              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>標題 (中文) *</label>
                  <input
                    className={admin.formInput}
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Title (EN)</label>
                  <input
                    className={admin.formInput}
                    value={form.title_en}
                    onChange={(e) =>
                      setForm({ ...form, title_en: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>開始日期</label>
                  <input
                    className={admin.formInput}
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                  />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>結束日期</label>
                  <input
                    className={admin.formInput}
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm({ ...form, end_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>地點 (中文)</label>
                  <input
                    className={admin.formInput}
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                  />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Location (EN)</label>
                  <input
                    className={admin.formInput}
                    value={form.location_en}
                    onChange={(e) =>
                      setForm({ ...form, location_en: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>地點連結</label>
                <input
                  className={admin.formInput}
                  type="url"
                  value={form.location_url}
                  onChange={(e) =>
                    setForm({ ...form, location_url: e.target.value })
                  }
                />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>說明 (中文)</label>
                <textarea
                  className={admin.formTextarea}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>Description (EN)</label>
                <textarea
                  className={admin.formTextarea}
                  value={form.description_en}
                  onChange={(e) =>
                    setForm({ ...form, description_en: e.target.value })
                  }
                />
              </div>
              {uploadProgress !== null && (
                <div className={admin.progressWrapper}>
                  <div className={admin.progressLabel}>
                    {zh
                      ? `上傳中 ${uploadProgress}%`
                      : `Uploading ${uploadProgress}%`}
                  </div>
                  <div className={admin.progressTrack}>
                    <div
                      className={admin.progressFill}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              {errMsg && (
                <p style={{ color: "red", margin: "0 0 12px" }}>{errMsg}</p>
              )}
              <div className={admin.modalActions}>
                <button
                  type="button"
                  className={admin.cancelBtn}
                  onClick={() => setShowEdit(false)}
                >
                  {zh ? "取消" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className={admin.submitBtn}
                  disabled={saving}
                >
                  {saving
                    ? zh
                      ? "儲存中..."
                      : "Saving..."
                    : zh
                      ? "儲存"
                      : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
