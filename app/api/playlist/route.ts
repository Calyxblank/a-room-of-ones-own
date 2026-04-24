import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export interface SharedPlaylist {
  id: string;
  spotifyId: string;
  title: string;
  addedBy: string;
  addedAt: number;
}

type RoomStore = {
  playlists: SharedPlaylist[];
  clients: Set<ReadableStreamDefaultController<Uint8Array>>;
};

const rooms = new Map<string, RoomStore>();
const encoder = new TextEncoder();

function getRoom(roomId: string): RoomStore {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { playlists: [], clients: new Set() });
  }
  return rooms.get(roomId)!;
}

function broadcast(room: RoomStore, payload: string) {
  const bytes = encoder.encode(`data: ${payload}\n\n`);
  room.clients.forEach(ctrl => {
    try {
      ctrl.enqueue(bytes);
    } catch {
      room.clients.delete(ctrl);
    }
  });
}

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('room') ?? 'default';
  const room = getRoom(roomId);

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      room.clients.add(ctrl);
      ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'init', playlists: room.playlists })}\n\n`));
      req.signal.addEventListener('abort', () => {
        room.clients.delete(ctrl);
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
  const room = getRoom(roomId);
  const body = await req.json();

  const rawUrl = String(body.url ?? '');
  const match = rawUrl.match(/(?:playlist|album)\/([A-Za-z0-9]+)/);
  if (!match) {
    return Response.json({ error: 'Paste a Spotify playlist or album URL' }, { status: 400 });
  }

  const pl: SharedPlaylist = {
    id: String(Date.now()),
    spotifyId: match[1],
    title: String(body.title ?? 'Shared Playlist').slice(0, 80),
    addedBy: String(body.addedBy ?? 'Someone').slice(0, 28),
    addedAt: Date.now(),
  };

  room.playlists.unshift(pl);
  if (room.playlists.length > 20) room.playlists = room.playlists.slice(0, 20);

  broadcast(room, JSON.stringify({ type: 'add', playlist: pl }));
  return Response.json({ ok: true, playlist: pl });
}

export async function DELETE(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('room') ?? 'default';
  const room = getRoom(roomId);
  const { id } = await req.json();

  room.playlists = room.playlists.filter(p => p.id !== id);
  broadcast(room, JSON.stringify({ type: 'remove', id }));
  return Response.json({ ok: true });
}
