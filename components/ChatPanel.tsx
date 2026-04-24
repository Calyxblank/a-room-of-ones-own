'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from '../types';
import type { DSTheme } from '../lib/design-system';
import Btn from './Btn';
import Win95Input from './Win95Input';

function getOrCreateUsername(): string {
  if (typeof window === 'undefined') return 'Guest';
  const stored = localStorage.getItem('room-username');
  if (stored) return stored;
  const name = 'Guest' + Math.floor(1000 + Math.random() * 9000);
  localStorage.setItem('room-username', name);
  return name;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel({ onClose, dsTheme }: { onClose: () => void; dsTheme: DSTheme }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('Guest');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [online, setOnline] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setUsername(getOrCreateUsername()); }, []);

  useEffect(() => {
    const es = new EventSource('/api/chat');
    es.onopen = () => setOnline(true);
    es.onerror = () => setOnline(false);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data) as { type: string; messages?: ChatMessage[]; message?: ChatMessage };
      if (data.type === 'history') setMessages(data.messages ?? []);
      else if (data.type === 'message' && data.message) setMessages(prev => [...prev, data.message!]);
    };
    return () => es.close();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, user: username }),
    });
  }, [input, username]);

  const saveName = () => {
    const n = nameInput.trim().slice(0, 28);
    if (n) { setUsername(n); localStorage.setItem('room-username', n); }
    setEditingName(false);
  };

  const bevel = `${dsTheme.bevelLight} ${dsTheme.bevelDark} ${dsTheme.bevelDark} ${dsTheme.bevelLight}`;

  return (
    <div style={{
      position: 'fixed',
      bottom: '38px',
      right: '12px',
      width: '320px',
      height: '420px',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      border: '2px solid',
      borderColor: bevel,
      boxShadow: `3px 3px 0 ${dsTheme.chromeDark}`,
      background: dsTheme.surfaceSolid,
      fontFamily: '"Space Mono", monospace',
      transition: 'background 1.5s, border-color 1.5s',
    }}>
      {/* Title bar */}
      <div style={{
        height: '26px',
        background: dsTheme.titleBar,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingLeft: '6px', paddingRight: '4px',
        flexShrink: 0,
      }}>
        <div style={{ color: dsTheme.titleText, fontSize: '10px', fontFamily: '"Space Mono", monospace', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, textShadow: '1px 1px 0 rgba(0,0,0,0.4)' }}>
          💬 Chat
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: online ? '#4ade80' : dsTheme.textMuted,
            display: 'inline-block',
            boxShadow: online ? '0 0 4px #4ade80' : 'none',
          }} />
        </div>
        <button
          onClick={onClose}
          style={{
            width: '18px', height: '18px',
            background: dsTheme.chromeLight,
            border: '2px solid', borderColor: bevel,
            fontSize: '9px', fontWeight: 'bold',
            cursor: 'pointer', lineHeight: 1,
            color: dsTheme.chromeDark,
          }}
        >✕</button>
      </div>

      {/* Username bar */}
      <div style={{
        padding: '4px 6px',
        borderBottom: `1px solid ${dsTheme.bevelDark}`,
        fontSize: '10px',
        display: 'flex', alignItems: 'center', gap: '6px',
        flexShrink: 0,
        background: dsTheme.glass,
      }}>
        <span style={{ color: dsTheme.textMuted }}>You:</span>
        {editingName ? (
          <>
            <Win95Input
              dsTheme={dsTheme}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
              autoFocus
              maxLength={28}
              style={{ flex: 1 }}
            />
            <Btn dsTheme={dsTheme} variant="primary" size="sm" onClick={saveName}>OK</Btn>
          </>
        ) : (
          <>
            <span style={{ fontWeight: 700, color: dsTheme.accent1 }}>{username}</span>
            <Btn dsTheme={dsTheme} variant="ghost" size="sm"
              style={{ marginLeft: 'auto', minWidth: 'unset' }}
              onClick={() => { setNameInput(username); setEditingName(true); }}
            >Edit</Btn>
          </>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '8px 6px',
        display: 'flex', flexDirection: 'column', gap: '6px',
        background: dsTheme.surface,
        backdropFilter: dsTheme.blur,
        WebkitBackdropFilter: dsTheme.blur,
        border: `1px solid ${dsTheme.glassBorder}`,
        margin: '4px',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: dsTheme.textMuted, marginTop: '20px', fontFamily: '"Space Mono", monospace', fontSize: '10px', lineHeight: 1.8 }}>
            No messages yet.<br />Say hello! 👋
          </div>
        )}
        {messages.map(m => {
          const isOwn = m.user === username;
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
              <div style={{ fontSize: '9px', color: dsTheme.textMuted, marginBottom: '3px', paddingLeft: isOwn ? 0 : '4px', paddingRight: isOwn ? '4px' : 0 }}>
                {!isOwn && <span style={{ fontWeight: 700, color: dsTheme.accent1 }}>{m.user} · </span>}
                {formatTime(m.timestamp)}
              </div>
              <div style={{
                maxWidth: '85%', padding: '8px 12px',
                background: isOwn ? `${dsTheme.accent1}cc` : dsTheme.glass,
                backdropFilter: dsTheme.blur, WebkitBackdropFilter: dsTheme.blur,
                color: isOwn ? '#fff' : dsTheme.text,
                fontSize: '11px', fontFamily: '"Space Mono", monospace',
                border: `1px solid ${isOwn ? dsTheme.accent1 : dsTheme.glassBorder}`,
                borderRadius: isOwn ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                wordBreak: 'break-word', lineHeight: '1.6',
              }}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '4px', padding: '4px 6px 6px', flexShrink: 0 }}>
        <Win95Input
          ref={inputRef}
          dsTheme={dsTheme}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type a message…"
          maxLength={400}
          style={{ flex: 1 }}
        />
        <Btn dsTheme={dsTheme} variant="primary" size="sm" onClick={send} disabled={!input.trim()}>
          Send
        </Btn>
      </div>
    </div>
  );
}
