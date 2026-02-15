import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// 確保uploads目錄存在
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 52428800; // 50MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未找到文件' },
        { status: 400 }
      );
    }

    // 驗證文件類型
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return NextResponse.json(
        { error: '不支持的文件格式。僅接受 JPG、PNG、GIF 和 WebP' },
        { status: 400 }
      );
    }

    // 驗證文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '文件太大。最大允許 50MB' },
        { status: 400 }
      );
    }

    // 生成唯一的文件名
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const filename = `${timestamp}-${random}-${file.name}`;
    const filepath = path.join(uploadsDir, filename);

    // 讀取文件並保存
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));

    return NextResponse.json(
      {
        success: true,
        message: '文件上傳成功',
        filename: filename,
        url: `/uploads/${filename}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('上傳錯誤:', error);
    return NextResponse.json(
      { error: '上傳失敗，請稍後再試' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 列出所有上傳的文件
    const files = fs.readdirSync(uploadsDir);
    const fileList = files.map((filename) => ({
      filename,
      url: `/uploads/${filename}`,
      uploadedAt: fs.statSync(path.join(uploadsDir, filename)).mtime,
    }));

    // 按時間倒序排列
    fileList.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    return NextResponse.json(
      {
        success: true,
        files: fileList,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('列表錯誤:', error);
    return NextResponse.json(
      { error: '無法獲取文件列表' },
      { status: 500 }
    );
  }
}
