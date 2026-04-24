# A Room of One's Own

A cosy, time-aware interactive bedroom you can share with others.

## What is it?

The room shifts with your local time of day — warm dawn light, sage greens in the morning, rosy blush in the afternoon, deep amber at night. Click objects in the scene to open floating panels.

## Features

- **Turntable** — paste a Spotify playlist URL to share music live with everyone in the room. No auth required; Spotify's embed player handles playback.
- **Sticky Notes** — freeform drag-and-drop canvas. Notes can be connected with arrows. Share a snapshot via URL.
- **Window View** — a sky scene and time-appropriate suggestions that change with the hour.
- **Chat** — real-time room chat over Server-Sent Events. No account needed.
- **Photo Frames** — upload personal photos to three frames on the room walls.

## Design system

All UI is built from tokens in `lib/design-system.ts` with four palettes: `dawn`, `morning`, `afternoon`, `night`.

| Component | Description |
|---|---|
| `Btn` | 4 variants (primary / secondary / ghost / danger), 3 sizes, bevel-flip on press |
| `Win95Input` | Inset-bevel text input |
| `GlassPanel` | Frosted glass container |
| `GlassBtn` | Rounded frosted glass button |
| `ToggleRow` | Sliding toggle with bevel flip when on |
| `SectionLabel` | Horizontal-rule section heading |
| `PostItCard` | Tape-strip sticky with flip animation |
| `PolaroidCard` | Polaroid photo card with optional caption |
| `MessageCard` | Chat bubble (sent / received radius variants) |
| `MusicWidget` | Waveform bars, progress bar, Spotify embed |

Tokens: `bevelLight/bevelDark`, `glass/glassBorder/blur`, `surface/surfaceSolid`, `accent1–4`, `postit/postitShadow`, `chrome/chromeDark/chromeLight`, `titleBar/titleText`, `text/textMuted`.

## Stack

- **Next.js 14** — App Router, API routes
- **TypeScript** — strict mode
- **Tailwind CSS** — utility layout
- **Server-Sent Events** — real-time chat and playlist sync
- **Vercel** — deployment

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Roadmap

- Shareable room URL (unique per room, not just per note canvas)
- Mobile layout
