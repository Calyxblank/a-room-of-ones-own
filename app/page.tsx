'use client';
import React, { useState, useCallback } from 'react';
import Room from '../components/Room';
import Win95Window from '../components/Win95Window';
import TurntablePanel from '../components/TurntablePanel';
import WindowPanel from '../components/WindowPanel';
import NotesCanvas from '../components/NotesCanvas';
import ChatPanel from '../components/ChatPanel';
import { useTimeOfDay } from '../hooks/useTimeOfDay';
import { useDevicePerformance } from '../hooks/useDevicePerformance';
import type { ActivePanel } from '../types';

export default function Page() {
  const { timeOfDay, theme, dsTheme, currentHour } = useTimeOfDay();
  const perfTier = useDevicePerformance();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const openPanel = useCallback((panel: ActivePanel) => setActivePanel(panel), []);
  const closePanel = useCallback(() => setActivePanel(null), []);

  const panelConfigs = {
    turntable: { title: 'Turntable.exe', icon: '🎵', width: '680px', height: '520px', defaultX: 80, defaultY: 60 },
    window:    { title: 'Window View',   icon: '🪟', width: '520px', height: '500px', defaultX: 100, defaultY: 50 },
    desk:      { title: 'Sticky Notes',  icon: '📝', width: '780px', height: '560px', defaultX: 50, defaultY: 40 },
  };

  const bevel = `${dsTheme.bevelLight} ${dsTheme.bevelDark} ${dsTheme.bevelDark} ${dsTheme.bevelLight}`;
  const bevelIn = `${dsTheme.bevelDark} ${dsTheme.bevelLight} ${dsTheme.bevelLight} ${dsTheme.bevelDark}`;

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: dsTheme.bg,
      overflow: 'hidden',
      fontFamily: '"Space Mono", "Press Start 2P", monospace',
      transition: 'background 1.5s ease',
    }}>
      {/* ── Win95 App Chrome ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', flex: 1,
        margin: '8px',
        border: '2px solid', borderColor: bevel,
        boxShadow: `3px 3px 0 ${dsTheme.chromeDark}`,
        background: dsTheme.glass,
        backdropFilter: dsTheme.blur,
        WebkitBackdropFilter: dsTheme.blur,
        overflow: 'hidden',
        transition: 'border-color 1.5s, background 1.5s',
      }}>
        {/* Title bar */}
        <div style={{
          height: '28px',
          background: dsTheme.titleBar,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingLeft: '8px', paddingRight: '6px',
          flexShrink: 0,
          transition: 'background 1.5s',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            color: dsTheme.titleText, fontSize: '11px',
            fontFamily: '"Space Mono", monospace', fontWeight: 700,
            letterSpacing: '0.05em',
            textShadow: '1px 1px 0 rgba(0,0,0,0.4)',
          }}>
            <span style={{ fontSize: '14px' }}>🏠</span>
            <span>A Room of One&apos;s Own</span>
            <span style={{ fontSize: '9px', opacity: 0.7, marginLeft: '8px' }}>
              {theme.icon} {theme.label} — {currentHour}:00
            </span>
          </div>
          <div style={{ display: 'flex', gap: '3px' }}>
            {['─', '□', '✕'].map((s, i) => (
              <div key={i} style={{
                width: '18px', height: '18px',
                background: dsTheme.chromeLight,
                border: '1px solid', borderColor: bevel,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', fontWeight: 'bold', cursor: 'pointer',
                color: dsTheme.chromeDark,
              }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Menu bar */}
        <div style={{
          height: '22px',
          background: dsTheme.surfaceSolid,
          borderBottom: `1px solid ${dsTheme.bevelDark}`,
          display: 'flex', alignItems: 'center',
          paddingLeft: '4px', gap: '2px',
          flexShrink: 0, fontSize: '11px',
          fontFamily: '"Space Mono", monospace',
          transition: 'background 1.5s',
        }}>
          {['File', 'Edit', 'View', 'Room', 'Help'].map(m => (
            <button key={m} style={{
              padding: '0 8px', height: '20px',
              background: 'transparent', border: 'none',
              cursor: 'pointer', fontSize: '11px',
              fontFamily: '"Space Mono", monospace',
              color: dsTheme.text,
            }}>{m}</button>
          ))}
        </div>

        {/* Room content */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Room
            theme={theme}
            timeOfDay={timeOfDay}
            onOpen={openPanel}
            reduceAnimations={perfTier === 'low'}
          />

          {activePanel && (
            <div className="panel-appear">
              <Win95Window
                key={activePanel}
                title={panelConfigs[activePanel].title}
                icon={panelConfigs[activePanel].icon}
                onClose={closePanel}
                width={panelConfigs[activePanel].width}
                height={panelConfigs[activePanel].height}
                defaultX={panelConfigs[activePanel].defaultX}
                defaultY={panelConfigs[activePanel].defaultY}
                dsTheme={dsTheme}
              >
                {activePanel === 'turntable' && <TurntablePanel timeOfDay={timeOfDay} dsTheme={dsTheme} />}
                {activePanel === 'window'    && <WindowPanel timeOfDay={timeOfDay} theme={theme} dsTheme={dsTheme} />}
                {activePanel === 'desk'      && <NotesCanvas perfTier={perfTier} dsTheme={dsTheme} />}
              </Win95Window>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div style={{
          height: '22px',
          background: dsTheme.surfaceSolid,
          borderTop: `1px solid ${dsTheme.bevelDark}`,
          display: 'flex', alignItems: 'center',
          paddingLeft: '8px', gap: '16px',
          flexShrink: 0, fontSize: '11px',
          fontFamily: '"Space Mono", monospace',
          color: dsTheme.textMuted,
          transition: 'background 1.5s',
        }}>
          <div style={{ borderRight: `1px solid ${dsTheme.bevelDark}`, paddingRight: '12px' }}>
            {theme.icon} {theme.label}
          </div>
          <div style={{ borderRight: `1px solid ${dsTheme.bevelDark}`, paddingRight: '12px' }}>
            {activePanel ? `${panelConfigs[activePanel].icon} ${panelConfigs[activePanel].title}` : 'Ready'}
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div style={{
        height: '30px',
        background: dsTheme.surfaceSolid,
        display: 'flex', alignItems: 'center',
        paddingLeft: '4px', paddingRight: '8px', gap: '4px',
        flexShrink: 0,
        margin: '0 8px 8px',
        border: '2px solid', borderColor: bevel,
        transition: 'background 1.5s, border-color 1.5s',
      }}>
        {/* Start button */}
        <button style={{
          height: '22px', padding: '0 10px',
          background: dsTheme.chromeLight,
          border: '2px solid', borderColor: bevel,
          cursor: 'pointer', fontSize: '10px',
          fontFamily: '"Space Mono", monospace',
          display: 'flex', alignItems: 'center', gap: '4px',
          fontWeight: 'bold', color: dsTheme.text,
        }}>
          🪟 Start
        </button>

        <div style={{ width: '1px', height: '18px', background: dsTheme.bevelDark, margin: '0 2px' }} />

        {/* Active window button */}
        {activePanel && (
          <button onClick={closePanel} style={{
            height: '22px', padding: '0 10px',
            background: dsTheme.glass,
            border: '2px solid', borderColor: bevelIn,
            cursor: 'pointer',
            fontFamily: '"Space Mono", monospace',
            fontSize: '10px', color: dsTheme.text,
          }}>
            {panelConfigs[activePanel].icon} {panelConfigs[activePanel].title}
          </button>
        )}

        <div style={{ flex: 1 }} />

        {/* Chat button */}
        <button onClick={() => setChatOpen(o => !o)} style={{
          height: '22px', padding: '0 10px',
          background: chatOpen ? dsTheme.glass : dsTheme.chromeLight,
          border: '2px solid',
          borderColor: chatOpen ? bevelIn : bevel,
          cursor: 'pointer',
          fontFamily: '"Space Mono", monospace',
          fontSize: '10px', color: dsTheme.text,
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          💬 Chat
        </button>

        <div style={{ width: '1px', height: '18px', background: dsTheme.bevelDark, margin: '0 2px' }} />

        {/* Clock */}
        <div style={{
          padding: '0 8px',
          border: '1px solid', borderColor: bevelIn,
          height: '20px',
          display: 'flex', alignItems: 'center',
          fontSize: '10px',
          fontFamily: '"Space Mono", monospace',
          color: dsTheme.text,
        }}>
          {theme.icon} {currentHour}:{new Date().getMinutes().toString().padStart(2, '0')}
        </div>
      </div>

      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} dsTheme={dsTheme} />}
    </div>
  );
}
