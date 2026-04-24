'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Room from '../components/Room';
import Win95Window from '../components/Win95Window';
import TurntablePanel from '../components/TurntablePanel';
import WindowPanel from '../components/WindowPanel';
import NotesCanvas from '../components/NotesCanvas';
import ChatPanel from '../components/ChatPanel';
import { useTimeOfDay } from '../hooks/useTimeOfDay';
import { useDevicePerformance } from '../hooks/useDevicePerformance';
import { useIsMobile } from '../hooks/useIsMobile';
import type { ActivePanel } from '../types';

type PanelKey = NonNullable<ActivePanel>;

const PANELS: Record<PanelKey, { title: string; icon: string; width: string; height: string; defaultX: number; defaultY: number }> = {
  turntable: { title: 'Turntable',    icon: '🎵', width: '640px', height: '540px', defaultX: 80,  defaultY: 50 },
  window:    { title: 'Window View',  icon: '🪟', width: '500px', height: '480px', defaultX: 100, defaultY: 50 },
  desk:      { title: 'Sticky Notes', icon: '📝', width: '760px', height: '540px', defaultX: 60,  defaultY: 40 },
};

const PANEL_KEYS = Object.keys(PANELS) as PanelKey[];

export default function Page() {
  const { timeOfDay, theme, dsTheme } = useTimeOfDay();
  const perfTier = useDevicePerformance();
  const isMobile = useIsMobile();

  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [clockStr, setClockStr] = useState(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClockStr(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
    };
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  const togglePanel = useCallback((panel: ActivePanel) => {
    setActivePanel(prev => (prev === panel ? null : panel));
  }, []);

  const bevel = `${dsTheme.bevelLight} ${dsTheme.bevelDark} ${dsTheme.bevelDark} ${dsTheme.bevelLight}`;
  const bevelIn = `${dsTheme.bevelDark} ${dsTheme.bevelLight} ${dsTheme.bevelLight} ${dsTheme.bevelDark}`;

  const taskbarHeight = isMobile ? '48px' : '32px';
  const taskBtnBase: React.CSSProperties = {
    height: isMobile ? '36px' : '24px',
    padding: isMobile ? '0 12px' : '0 10px',
    border: '2px solid',
    cursor: 'pointer',
    fontSize: isMobile ? '18px' : '10px',
    fontFamily: '"Space Mono", monospace',
    display: 'flex', alignItems: 'center', gap: '4px',
    color: dsTheme.text,
    whiteSpace: 'nowrap',
    minWidth: isMobile ? '44px' : undefined,
    justifyContent: isMobile ? 'center' : undefined,
  };

  return (
    <div style={{
      width: '100vw', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: '"Space Mono", monospace',
    }}>
      {/* Room fills all space above taskbar */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <Room
          theme={theme}
          timeOfDay={timeOfDay}
          dsTheme={dsTheme}
          onOpen={togglePanel}
          reduceAnimations={perfTier === 'low'}
        />

        {activePanel && (
          <div className="panel-appear">
            <Win95Window
              key={activePanel}
              title={PANELS[activePanel].title}
              icon={PANELS[activePanel].icon}
              onClose={() => setActivePanel(null)}
              width={PANELS[activePanel].width}
              height={PANELS[activePanel].height}
              defaultX={PANELS[activePanel].defaultX}
              defaultY={PANELS[activePanel].defaultY}
              dsTheme={dsTheme}
            >
              {activePanel === 'turntable' && <TurntablePanel dsTheme={dsTheme} />}
              {activePanel === 'window'    && <WindowPanel timeOfDay={timeOfDay} theme={theme} dsTheme={dsTheme} />}
              {activePanel === 'desk'      && <NotesCanvas perfTier={perfTier} dsTheme={dsTheme} />}
            </Win95Window>
          </div>
        )}

        {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} dsTheme={dsTheme} />}
      </div>

      {/* Taskbar */}
      <div style={{
        height: taskbarHeight, flexShrink: 0,
        background: dsTheme.surfaceSolid,
        border: '2px solid', borderColor: bevel,
        display: 'flex', alignItems: 'center',
        paddingLeft: '4px', paddingRight: '8px', gap: '4px',
        transition: 'background 1.5s, border-color 1.5s',
      }}>
        {/* Brand — hidden on mobile to save space */}
        {!isMobile && (
          <>
            <button style={{
              ...taskBtnBase,
              background: dsTheme.titleBar,
              borderColor: bevel,
              color: dsTheme.titleText,
              fontWeight: 700,
              letterSpacing: '0.03em',
            }}>
              🏠 Room
            </button>
            <div style={{ width: '1px', height: '20px', background: dsTheme.bevelDark, margin: '0 2px' }} />
          </>
        )}

        {/* Panel buttons */}
        {PANEL_KEYS.map(key => (
          <button
            key={key}
            onClick={() => togglePanel(key)}
            title={PANELS[key].title}
            style={{
              ...taskBtnBase,
              background: activePanel === key ? dsTheme.glass : dsTheme.chromeLight,
              borderColor: activePanel === key ? bevelIn : bevel,
            }}
          >
            {PANELS[key].icon}
            {!isMobile && ` ${PANELS[key].title}`}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Chat */}
        <button
          onClick={() => setChatOpen(o => !o)}
          title="Chat"
          style={{
            ...taskBtnBase,
            background: chatOpen ? dsTheme.glass : dsTheme.chromeLight,
            borderColor: chatOpen ? bevelIn : bevel,
          }}
        >
          💬{!isMobile && ' Chat'}
        </button>

        {!isMobile && (
          <div style={{ width: '1px', height: '20px', background: dsTheme.bevelDark, margin: '0 2px' }} />
        )}

        {/* Clock */}
        <div style={{
          padding: isMobile ? '0 6px' : '0 8px',
          height: isMobile ? '34px' : '22px',
          border: '1px solid', borderColor: bevelIn,
          display: 'flex', alignItems: 'center',
          fontSize: isMobile ? '11px' : '10px',
          fontFamily: '"Space Mono", monospace',
          color: dsTheme.text, gap: '4px',
        }}>
          {theme.icon} {clockStr}
        </div>
      </div>
    </div>
  );
}
