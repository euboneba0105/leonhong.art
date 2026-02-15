'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface GalleryItem {
  filename: string;
  url: string;
  uploadedAt: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/upload');
      const data = await response.json();

      if (data.success) {
        setImages(data.files);
        setError('');
      } else {
        setError('無法加載圖像');
      }
    } catch (err) {
      setError('加載圖像時出錯');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('確定要刪除這張圖片嗎？')) return;

    try {
      const response = await fetch(`/api/upload/${filename}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImages(images.filter((img) => img.filename !== filename));
        alert('圖片已刪除');
      } else {
        alert('刪除失敗');
      }
    } catch (err) {
      alert('刪除出錯');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 導航欄 */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            🎨 Leon Hong Art
          </Link>
          <div className="flex gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-amber-600 font-medium transition"
            >
              首頁
            </Link>
            <Link
              href="/gallery"
              className="text-amber-600 font-medium"
            >
              作品集
            </Link>
            <Link
              href="/upload"
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition font-medium"
            >
              上傳作品
            </Link>
          </div>
        </div>
      </nav>

      {/* 頁面內容 */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">作品集</h1>
        <p className="text-gray-600 mb-8">
          探索我所有的藝術作品。共 {images.length} 件作品
        </p>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">⏳</div>
            <p className="text-gray-600 mt-4">加載中...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {!loading && images.length === 0 && (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-gray-600 text-lg mb-4">
              還沒有上傳任何作品
            </p>
            <Link
              href="/upload"
              className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition font-medium"
            >
              上傳第一件作品
            </Link>
          </div>
        )}

        {/* 圖片庫 */}
        {!loading && images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <div
                key={image.filename}
                className="group relative bg-gray-100 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition"
              >
                <div
                  className="relative w-full h-64 cursor-pointer"
                  onClick={() => setSelectedImage(image)}
                >
                  <Image
                    src={image.url}
                    alt={image.filename}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedImage(image)}
                      className="bg-white text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition"
                    >
                      查看
                    </button>
                    <button
                      onClick={() => handleDelete(image.filename)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                    >
                      刪除
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white">
                  <p className="text-sm text-gray-600 truncate">
                    {image.filename}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(image.uploadedAt).toLocaleDateString('zh-TW')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 圖片預覽模態 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-96">
              <Image
                src={selectedImage.url}
                alt={selectedImage.filename}
                fill
                className="object-contain"
              />
            </div>

            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {selectedImage.filename}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                上傳於：{new Date(selectedImage.uploadedAt).toLocaleString('zh-TW')}
              </p>

              <div className="flex gap-3">
                <a
                  href={selectedImage.url}
                  download
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-blue-700 transition"
                >
                  下載
                </a>
                <button
                  onClick={() => handleDelete(selectedImage.filename)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition"
                >
                  刪除
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="flex-1 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition"
                >
                  關閉
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 頁尾 */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>&copy; 2024 Leon Hong Art. 保留所有權利。</p>
        </div>
      </footer>
    </div>
  );
}
