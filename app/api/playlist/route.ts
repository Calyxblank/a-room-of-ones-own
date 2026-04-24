import { NextRequest } from 'next/server';
import { redis } from '../../../lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface SharedPlaylist {
  id: string;
  spotifyId: string;
  title: string;
  addedBy: string;
  addedAt: number;
}

// SSE clients are inherently in-memory (live connections)
const clients = new Map<string, Set<ReadableStreamDefaultController<Uint8Array>>>();
const encoder = new TextEncoder();

function getClients(roomId: string) {
  if (!clients.has(roomId)) clients.set(roomId, new Set());
  return clients.get(roomId)!;
}

function broadcast(roomId: string, payload: string) {
  const bytes = encoder.encode(`data: ${payload}\n\n`);
  const room = getClients(roomId);
  room.forEach(ctrl => {
    try { ctrl.enqueue(bytes); } catch { room.delete(ctrl); }
  });
}

async function getPlaylists(roomId: string): Promise<SharedPlaylist[]> {
  const data = await redis.get<SharedPlaylist[]>(`room:playlists:${roomId}`);
  return data ?? [];
}

async function savePlaylists(roomId: string, playlists: SharedPlaylist[]) {
  await redis.set(`room:playlists:${roomId}`, playlists);
}

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('room') ?? 'default';
  const room = getClients(roomId);
  const playlists = await getPlaylists(roomId);

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      room.add(ctrl);
      ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'init', playlists })}\n\n`));
      req.signal.addEventListener('abort', () => {
        room.delete(ctrl);
        try { ctrl.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

export async function POST(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('room') ?? 'default';
  const body = await req.json();

  const rawUrl = String(body.url ?? '');
  const match = rawUrl.match(/(?:playlist|album)\/([A-Za-z0-9]+)/);
  if (!match) return Response.json({ error: 'Paste a Spotify playlist or album URL' }, { status: 400 });

  const pl: SharedPlaylist = {
    id: String(Date.now()),
    spotifyId: match[1],
    title: String(body.title ?? 'Shared Playlist').slice(0, 80),
    addedBy: String(body.addedBy ?? 'Someone').slice(0, 28),
    addedAt: Date.now(),
  };

  const playlists = await getPlaylists(roomId);
  playlists.unshift(pl);
  await savePlaylists(roomId, playlists.slice(0, 20));

  broadcast(roomId, JSON.stringify({ type: 'add', playlist: pl }));
  return Response.json({ ok: true, playlist: pl });
}

export async function DELETE(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('room') ?? 'default';
  const { id } = await req.json();

  const playlists = await getPlaylists(roomId);
  await savePlaylists(roomId, playlists.filter(p => p.id !== id));

  broadcast(roomId, JSON.stringify({ type: 'remove', id }));
  return Response.json({ ok: true });
}
