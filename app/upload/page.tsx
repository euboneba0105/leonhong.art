'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;

    // 驗證文件類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadStatus('error');
      setMessage('不支持的文件格式。請上傳 JPG、PNG、GIF 或 WebP 文件');
      return;
    }

    // 驗證文件大小（50MB）
    if (selectedFile.size > 52428800) {
      setUploadStatus('error');
      setMessage('文件太大。最大允許 50MB');
      return;
    }

    setFile(selectedFile);
    setUploadStatus('idle');

    // 創建預覽
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('error');
      setMessage('請先選擇圖片文件');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setMessage('圖片上傳成功！');
        setFile(null);
        setPreview(null);
        if (fileInput.current) {
          fileInput.current.value = '';
        }

        // 3秒後跳轉到作品集
        setTimeout(() => {
          window.location.href = '/gallery';
        }, 2000);
      } else {
        setUploadStatus('error');
        setMessage(data.error || '上傳失敗');
      }
    } catch (error) {
      setUploadStatus('error');
      setMessage('上傳時出錯');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setUploadStatus('idle');
    setMessage('');
    if (fileInput.current) {
      fileInput.current.value = '';
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
              className="text-gray-700 hover:text-amber-600 font-medium transition"
            >
              作品集
            </Link>
            <Link
              href="/upload"
              className="text-amber-600 font-medium"
            >
              上傳作品
            </Link>
          </div>
        </div>
      </nav>

      {/* 頁面內容 */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">上傳新作品</h1>
        <p className="text-gray-600 mb-8">
          分享您的藝術創作。支持 JPG、PNG、GIF 和 WebP 格式，最大 50MB
        </p>

        <div className="bg-gray-50 rounded-lg p-8">
          {/* 上傳區域 */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition ${
              dragActive
                ? 'border-amber-600 bg-amber-50'
                : 'border-amber-300 bg-white hover:border-amber-600'
            }`}
            onClick={() => fileInput.current?.click()}
          >
            <div className="text-6xl mb-4">📤</div>
            <p className="text-xl font-semibold text-gray-800 mb-2">
              拖放圖片或點擊選擇
            </p>
            <p className="text-gray-600">
              支持 JPG、PNG、GIF、WebP 格式，最大 50MB
            </p>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          {/* 狀態消息 */}
          {uploadStatus === 'success' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              ✅ {message}
            </div>
          )}
          {uploadStatus === 'error' && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              ❌ {message}
            </div>
          )}

          {/* 預覽 */}
          {preview && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">預覽</h2>
              <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
              <p className="mt-3 text-sm text-gray-600">
                文件名：{file?.name}
              </p>
              <p className="text-sm text-gray-600">
                大小：{((file?.size || 0) / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {/* 操作按鈕 */}
          <div className="mt-8 flex gap-4">
            {preview && (
              <>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? '上傳中...' : '確認上傳'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={uploading}
                  className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition disabled:bg-gray-200"
                >
                  取消
                </button>
              </>
            )}
            {!preview && (
              <Link
                href="/gallery"
                className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-gray-600 transition"
              >
                返回作品集
              </Link>
            )}
          </div>
        </div>

        {/* 使用提示 */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">💡 使用提示</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• 確保圖片質量清晰，解析度至少 1280x720</li>
            <li>• 使用有意義的文件名會有助於組織您的作品</li>
            <li>• 支持的格式：JPG、PNG、GIF、WebP</li>
            <li>• 最大文件大小為 50MB</li>
            <li>• 上傳後可以在作品集中查看和管理</li>
          </ul>
        </div>
      </div>

      {/* 頁尾 */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p>&copy; 2024 Leon Hong Art. 保留所有權利。</p>
        </div>
      </footer>
    </div>
  );
}
