import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatMessage {
  id: number;
  text: string;
  user: string;
  timestamp: number;
}

const messages: ChatMessage[] = [];
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
      ctrl.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'history', messages })}\n\n`));
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
  const msg: ChatMessage = {
    id: Date.now(),
    text: String(body.text ?? '').slice(0, 400),
    user: String(body.user ?? 'Guest').slice(0, 28),
    timestamp: Date.now(),
  };
  if (!msg.text.trim()) return Response.json({ ok: false }, { status: 400 });
  messages.push(msg);
  if (messages.length > 200) messages.shift();
  broadcast(JSON.stringify({ type: 'message', message: msg }));
  return Response.json({ ok: true });
}
