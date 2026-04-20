import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface RoomPhoto {
  id: string;
  dataUrl: string;
  frame: number;
  uploadedAt: number;
}

const photos = new Map<number, RoomPhoto>();

export async function GET() {
  const result: Record<number, RoomPhoto> = {};
  photos.forEach((v, k) => { result[k] = v; });
  return Response.json({ photos: result });
}

export async function POST(req: NextRequest) {
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

  photos.set(frame, { id: String(Date.now()), dataUrl, frame, uploadedAt: Date.now() });
  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { frame } = await req.json();
  photos.delete(Number(frame));
  return Response.json({ ok: true });
}
