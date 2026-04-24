import { NextRequest } from 'next/server';
import { redis } from '../../../lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatMessage {
  id: number;
  text: string;
  user: string;
  timestamp: number;
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

export async function GET(req: NextRequest) {
  const roomId = req.nextUrl.searchParams.get('room') ?? 'default';
  const room = getClients(roomId);

  const raw = await redis.lrange(`room:chat:${roomId}`, 0, -1);
  const messages = raw.map(m => (typeof m === 'string' ? JSON.parse(m) : m)) as ChatMessage[];

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      room.add(ctrl);
      ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'history', messages })}\n\n`));
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

  const msg: ChatMessage = {
    id: Date.now(),
    text: String(body.text ?? '').slice(0, 400),
    user: String(body.user ?? 'Guest').slice(0, 28),
    timestamp: Date.now(),
  };
  if (!msg.text.trim()) return Response.json({ ok: false }, { status: 400 });

  const key = `room:chat:${roomId}`;
  await redis.rpush(key, JSON.stringify(msg));
  await redis.ltrim(key, -200, -1);

  broadcast(roomId, JSON.stringify({ type: 'message', message: msg }));
  return Response.json({ ok: true });
}
