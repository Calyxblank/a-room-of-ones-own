import { NextRequest } from 'next/server';
import { redis } from '../../../lib/redis';

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

  const photo: RoomPhoto = {
    id: String(Date.now()),
    dataUrl,
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

  const photos = await getPhotos(roomId);
  delete photos[Number(frame)];
  await redis.set(`room:photos:${roomId}`, photos);

  return Response.json({ ok: true });
}
