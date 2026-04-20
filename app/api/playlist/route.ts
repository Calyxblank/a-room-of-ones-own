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

let playlists: SharedPlaylist[] = [];
const clients = new Set<ReadableStreamDefaultController<Uint8Array>>();
const encoder = new TextEncoder();

function broadcast(payload: string) {
  const bytes = encoder.encode(`data: ${payload}\n\n`);
  Array.from(clients).forEach(ctrl => {
    try {
      ctrl.enqueue(bytes);
    } catch {
      clients.delete(ctrl);
    }
  });
}

export async function GET(req: NextRequest) {
  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      clients.add(ctrl);
      ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'init', playlists })}\n\n`));
      req.signal.addEventListener('abort', () => {
        clients.delete(ctrl);
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
  const body = await req.json();
  const rawUrl = String(body.url ?? '');

  // Accept playlist/XXXXXX or album/XXXXXX
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

  playlists.unshift(pl);
  if (playlists.length > 20) playlists = playlists.slice(0, 20);

  broadcast(JSON.stringify({ type: 'add', playlist: pl }));
  return Response.json({ ok: true, playlist: pl });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  playlists = playlists.filter(p => p.id !== id);
  broadcast(JSON.stringify({ type: 'remove', id }));
  return Response.json({ ok: true });
}
