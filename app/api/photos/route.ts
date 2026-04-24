import { NextRequest } from 'next/server';
import { redis } from '../../../lib/redis';
import { supabase, BUCKET } from '../../../lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface RoomPhoto {
  id: string;
  dataUrl: string;
  frame: number;
  uploadedAt: number;
}

type PhotoStore = Record<number, RoomPhoto>;

async function getPhotos(roomId: string): Promise<PhotoStore> {
  const data = await redis.get<PhotoStore>(`room:photos:${roomId}`);
  return data ?? {};
}

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('room') ?? 'default';
  const photos = await getPhotos(roomId);
  return Response.json({ photos });
}

export async function POST(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('room') ?? 'default';
  const body = await req.json();

  const frame = Number(body.frame);
  const dataUrl = String(body.dataUrl ?? '');

  if (!Number.isInteger(frame) || frame < 0 || frame > 2) {
    return Response.json({ error: 'Invalid frame' }, { status: 400 });
  }
  if (!dataUrl.startsWith('data:image/')) {
    return Response.json({ error: 'Invalid image data' }, { status: 400 });
  }
  if (dataUrl.length > 2_000_000) {
    return Response.json({ error: 'Image too large (max ~1.5MB)' }, { status: 400 });
  }

  const mimeType = dataUrl.match(/^data:(image\/\w+);base64,/)?.[1] ?? 'image/jpeg';
  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const filePath = `${roomId}/${frame}.jpg`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, buffer, { contentType: mimeType, upsert: true });

  if (error) {
    console.error('Supabase upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  const photo: RoomPhoto = {
    id: String(Date.now()),
    dataUrl: `${publicUrl}?t=${Date.now()}`,
    frame,
    uploadedAt: Date.now(),
  };

  const photos = await getPhotos(roomId);
  photos[frame] = photo;
  await redis.set(`room:photos:${roomId}`, photos);

  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('room') ?? 'default';
  const { frame } = await req.json();

  await supabase.storage.from(BUCKET).remove([`${roomId}/${frame}.jpg`]);

  const photos = await getPhotos(roomId);
  delete photos[Number(frame)];
  await redis.set(`room:photos:${roomId}`, photos);

  return Response.json({ ok: true });
}
