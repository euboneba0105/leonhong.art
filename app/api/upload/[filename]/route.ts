import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

export async function DELETE(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    // 防止路径遍历
    if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json(
        { error: '無效的文件名' },
        { status: 400 }
      );
    }

    const filepath = path.join(uploadsDir, filename);

    // 檢查文件是否存在
    if (!fs.existsSync(filepath)) {
      return NextResponse.json(
        { error: '文件不存在' },
        { status: 404 }
      );
    }

    // 刪除文件
    fs.unlinkSync(filepath);

    return NextResponse.json(
      {
        success: true,
        message: '文件已刪除',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('刪除錯誤:', error);
    return NextResponse.json(
      { error: '刪除失敗，請稍後再試' },
      { status: 500 }
    );
  }
}
