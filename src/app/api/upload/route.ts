import { NextRequest, NextResponse } from 'next/server';
import { StorageService } from '@/services/storage/storage.service';
import { requireAuth } from '@/security/middleware/auth.middleware';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if ('response' in auth) return auth.response;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const bucket = formData.get('bucket') as string || 'documents';
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Generate unique path
    const extension = file.name.split('.').pop();
    const path = `${auth.session.sub}/${Date.now()}.${extension}`;

    const result = await StorageService.uploadFile(bucket, path, buffer, file.type);

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }

    const publicUrl = StorageService.getPublicUrl(bucket, path);

    return NextResponse.json({
      success: true,
      data: {
        path,
        url: publicUrl,
        size: file.size,
        type: file.type,
      }
    });

  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
