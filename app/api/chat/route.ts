import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatMessage {
  id: number;
  text: string;
  user: string;
  timestamp: number;
}

type RoomStore = {
  messages: ChatMessage[];
  clients: Set<ReadableStreamDefaultController<Uint8Array>>;
};

const rooms = new Map<string, RoomStore>();
const encoder = new TextEncoder();

function getRoom(roomId: string): RoomStore {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { messages: [], clients: new Set() });
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
      ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'history', messages: room.messages })}\n\n`));
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

  const msg: ChatMessage = {
    id: Date.now(),
    text: String(body.text ?? '').slice(0, 400),
    user: String(body.user ?? 'Guest').slice(0, 28),
    timestamp: Date.now(),
  };
  if (!msg.text.trim()) return Response.json({ ok: false }, { status: 400 });

  room.messages.push(msg);
  if (room.messages.length > 200) room.messages.shift();
  broadcast(room, JSON.stringify({ type: 'message', message: msg }));
  return Response.json({ ok: true });
}
