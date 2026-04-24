import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'A Room of One\'s Own',
  description: 'An interactive, context-aware bedroom experience',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, width: '100vw', height: '100vh', overflow: 'hidden', background: '#008080' }}>
        {children}
      </body>
    </html>
  );
}
