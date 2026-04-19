'use client';
import React, { useState, useCallback } from 'react';
import Room from '../components/Room';
import Win95Window from '../components/Win95Window';
import TurntablePanel from '../components/TurntablePanel';
import WindowPanel from '../components/WindowPanel';
import NotesCanvas from '../components/NotesCanvas';
import { useTimeOfDay } from '../hooks/useTimeOfDay';
import { useDevicePerformance } from '../hooks/useDevicePerformance';
import type { ActivePanel } from '../types';

export default function Page() {
  const { timeOfDay, theme, currentHour } = useTimeOfDay();
  const perfTier = useDevicePerformance();
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const openPanel = useCallback((panel: ActivePanel) => setActivePanel(panel), []);
  const closePanel = useCallback(() => setActivePanel(null), []);

  const panelConfigs = {
    turntable: { title: 'Turntable.exe', icon: '🎵', width: '680px', height: '520px', defaultX: 80, defaultY: 60 },
    window:    { title: 'Window View', icon: '🪟', width: '520px', height: '500px', defaultX: 100, defaultY: 50 },
    desk:      { title: 'Sticky Notes Workspace', icon: '📝', width: '780px', height: '560px', defaultX: 50, defaultY: 40 },
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#008080',
        overflow: 'hidden',
        fontFamily: '"Press Start 2P", monospace',
      }}
    >
      {/* ── Win95 App Chrome ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          margin: '8px',
          border: '3px solid',
          borderColor: '#ffffff #404040 #404040 #ffffff',
          boxShadow: '2px 2px 0 #000000, inset 1px 1px 0 #dfdfdf',
          background: 'rgba(192,192,192,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          overflow: 'hidden',
        }}
      >
        {/* Title bar */}
        <div
          style={{
            height: '28px',
            background: 'linear-gradient(to right, #000080, #1084d0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '8px',
            paddingRight: '6px',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'white', fontSize: '11px', fontFamily: '"Press Start 2P", monospace', textShadow: '1px 1px 0 #000040' }}>
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
                background: 'rgba(192,192,192,0.85)',
                border: '1px solid',
                borderColor: '#ffffff #404040 #404040 #ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', fontWeight: 'bold', cursor: 'pointer',
              }}>{s}</div>
            ))}
          </div>
        </div>

        {/* Menu bar */}
        <div style={{
          height: '22px',
          background: 'rgba(192,192,192,0.7)',
          borderBottom: '1px solid #808080',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '4px',
          gap: '2px',
          flexShrink: 0,
          fontSize: '11px',
          fontFamily: 'system-ui, sans-serif',
        }}>
          {['File', 'Edit', 'View', 'Room', 'Help'].map(m => (
            <button key={m} style={{
              padding: '0 8px', height: '20px',
              background: 'transparent', border: 'none',
              cursor: 'pointer', fontSize: '11px',
              fontFamily: 'system-ui, sans-serif',
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

          {/* Help hint — bottom left */}
          <div style={{
            position: 'absolute',
            bottom: '8px', left: '8px',
            background: 'rgba(0,0,0,0.65)',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '8px',
            fontFamily: '"Press Start 2P", monospace',
            padding: '5px 8px',
            pointerEvents: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            lineHeight: '1.8',
          }}>
            Click objects to interact
          </div>

          {/* Active panel */}
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
              >
                {activePanel === 'turntable' && <TurntablePanel timeOfDay={timeOfDay} />}
                {activePanel === 'window'    && <WindowPanel timeOfDay={timeOfDay} theme={theme} />}
                {activePanel === 'desk'      && <NotesCanvas perfTier={perfTier} />}
              </Win95Window>
            </div>
          )}
        </div>

        {/* Status bar */}
        <div style={{
          height: '22px',
          background: 'rgba(192,192,192,0.7)',
          borderTop: '1px solid #808080',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '8px',
          gap: '16px',
          flexShrink: 0,
          fontSize: '12px',
          fontFamily: '"VT323", monospace',
          color: '#333',
        }}>
          <div style={{ borderRight: '1px solid #808080', paddingRight: '12px' }}>
            {theme.icon} {theme.label}
          </div>
          <div style={{ borderRight: '1px solid #808080', paddingRight: '12px' }}>
            {activePanel ? `${panelConfigs[activePanel].icon} ${panelConfigs[activePanel].title}` : 'Ready'}
          </div>
          <div>Performance: {perfTier}</div>
        </div>
      </div>

      {/* Win95 Taskbar */}
      <div style={{
        height: '28px',
        background: 'rgba(192,192,192,0.9)',
        backdropFilter: 'blur(8px)',
        borderTop: '2px solid #ffffff',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '4px',
        paddingRight: '8px',
        gap: '4px',
        flexShrink: 0,
        margin: '0 8px 8px',
        border: '2px solid',
        borderColor: '#ffffff #404040 #404040 #ffffff',
      }}>
        {/* Start button */}
        <button style={{
          height: '22px',
          padding: '0 8px',
          background: '#c0c0c0',
          border: '2px solid',
          borderColor: '#ffffff #404040 #404040 #ffffff',
          cursor: 'pointer',
          fontSize: '10px',
          fontFamily: '"Press Start 2P", monospace',
          display: 'flex', alignItems: 'center', gap: '4px',
          fontWeight: 'bold',
        }}>
          🪟 Start
        </button>

        <div style={{ width: '2px', height: '18px', background: '#808080', margin: '0 2px' }} />

        {/* Active window button */}
        {activePanel && (
          <button
            onClick={closePanel}
            style={{
              height: '22px',
              padding: '0 10px',
              background: 'rgba(192,192,192,0.7)',
              border: '2px solid',
              borderColor: '#404040 #ffffff #ffffff #404040',
              cursor: 'pointer',
              fontFamily: '"VT323", monospace',
              fontSize: '14px',
            }}
          >
            {panelConfigs[activePanel].icon} {panelConfigs[activePanel].title}
          </button>
        )}

        <div style={{ flex: 1 }} />

        {/* Clock */}
        <div style={{
          padding: '0 8px',
          border: '1px solid',
          borderColor: '#808080 #ffffff #ffffff #808080',
          height: '20px',
          display: 'flex', alignItems: 'center',
          fontSize: '12px',
          fontFamily: '"VT323", monospace',
          color: '#000',
        }}>
          {theme.icon} {currentHour}:{new Date().getMinutes().toString().padStart(2, '0')}
        </div>
      </div>
    </div>
  );
}
