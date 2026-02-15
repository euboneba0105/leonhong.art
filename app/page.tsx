'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [selectedLink, setSelectedLink] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* 導航欄 */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">🎨 Leon Hong Art</h1>
          <div className="flex gap-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-amber-600 font-medium transition"
            >
              首頁
            </Link>
            <Link
              href="/gallery"
              className="text-gray-700 hover:text-amber-600 font-medium transition"
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

      {/* 英雄部分 */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="mb-8">
          <div className="text-8xl mb-4">🎨</div>
          <h2 className="text-5xl font-bold text-gray-900 mb-4">歡迎來到我的藝術世界</h2>
          <p className="text-xl text-gray-600 mb-8">
            探索獨特的视觉艺术作品，每一件作品都表达了我对创意的热情
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link
            href="/gallery"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition transform hover:-translate-y-2"
          >
            <div className="text-5xl mb-4">🖼️</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">瀏覽作品集</h3>
            <p className="text-gray-600">
              查看所有已上傳的藝術作品，欣賞各種風格和主題的創意表現
            </p>
            <div className="mt-6 inline-block bg-amber-600 text-white px-6 py-2 rounded-lg group-hover:bg-amber-700 transition font-medium">
              進入作品集 →
            </div>
          </Link>

          <Link
            href="/upload"
            className="group bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition transform hover:-translate-y-2"
          >
            <div className="text-5xl mb-4">📤</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">上傳新作品</h3>
            <p className="text-gray-600">
              分享您最新的藝術創作，讓世界看到您獨特的視角和才華
            </p>
            <div className="mt-6 inline-block bg-amber-600 text-white px-6 py-2 rounded-lg group-hover:bg-amber-700 transition font-medium">
              開始上傳 →
            </div>
          </Link>
        </div>
      </section>

      {/* 功能介紹 */}
      <section className="bg-gray-100 py-16 mt-12">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">功能特色</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-4xl mb-4">✨</div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">簡單易用</h4>
              <p className="text-gray-600">
                直觀的界面設計，輕鬆上傳和管理您的藝術作品
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-4xl mb-4">🖼️</div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">精美展示</h4>
              <p className="text-gray-600">
                高質量的圖片展示，讓您的作品以最佳效果呈現
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">安全可靠</h4>
              <p className="text-gray-600">
                您的作品安全存儲，隨時可以編輯或刪除
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 頁尾 */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>&copy; 2024 Leon Hong Art. 保留所有權利。</p>
          <p className="text-gray-400 mt-2">用 Next.js 和 React 打造</p>
        </div>
      </footer>
    </div>
  );
}
