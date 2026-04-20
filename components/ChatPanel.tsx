'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage } from '../types';

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

interface ChatPanelProps {
  onClose: () => void;
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('Guest');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [online, setOnline] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUsername(getOrCreateUsername());
  }, []);

  useEffect(() => {
    const es = new EventSource('/api/chat');
    es.onopen = () => setOnline(true);
    es.onerror = () => setOnline(false);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'history') {
        setMessages(data.messages);
      } else if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      }
    };
    return () => es.close();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    if (n) {
      setUsername(n);
      localStorage.setItem('room-username', n);
    }
    setEditingName(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '44px',
      right: '12px',
      width: '320px',
      height: '420px',
      zIndex: 200,
      display: 'flex',
      flexDirection: 'column',
      border: '3px solid',
      borderColor: '#ffffff #404040 #404040 #ffffff',
      boxShadow: '2px 2px 0 #000',
      background: '#c0c0c0',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Title bar */}
      <div style={{
        height: '26px',
        background: 'linear-gradient(to right, #000080, #1084d0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: '6px',
        paddingRight: '4px',
        flexShrink: 0,
      }}>
        <div style={{ color: 'white', fontSize: '10px', fontFamily: '"Press Start 2P", monospace', display: 'flex', alignItems: 'center', gap: '5px' }}>
          💬 Chat
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: online ? '#4ade80' : '#808080',
            display: 'inline-block',
            boxShadow: online ? '0 0 4px #4ade80' : 'none',
          }} />
        </div>
        <button
          onClick={onClose}
          style={{
            width: '18px', height: '18px',
            background: '#c0c0c0',
            border: '1px solid',
            borderColor: '#fff #404040 #404040 #fff',
            fontSize: '10px', fontWeight: 'bold',
            cursor: 'pointer', lineHeight: 1,
          }}
        >✕</button>
      </div>

      {/* Username bar */}
      <div style={{
        padding: '4px 6px',
        borderBottom: '1px solid #808080',
        fontSize: '11px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.3)',
      }}>
        <span style={{ color: '#555' }}>You:</span>
        {editingName ? (
          <>
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
              autoFocus
              maxLength={28}
              style={{ flex: 1, fontSize: '11px', border: '1px inset #808080', padding: '1px 3px', background: 'white' }}
            />
            <button className="win95-btn" style={{ fontSize: '10px', padding: '1px 6px' }} onClick={saveName}>OK</button>
          </>
        ) : (
          <>
            <span style={{ fontWeight: 'bold', color: '#000080' }}>{username}</span>
            <button
              className="win95-btn"
              style={{ fontSize: '9px', padding: '1px 5px', marginLeft: 'auto' }}
              onClick={() => { setNameInput(username); setEditingName(true); }}
            >Edit</button>
          </>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        background: 'white',
        border: '1px inset #808080',
        margin: '4px',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', marginTop: '20px', fontFamily: '"VT323", monospace', fontSize: '16px' }}>
            No messages yet.<br />Say hello! 👋
          </div>
        )}
        {messages.map(m => {
          const isOwn = m.user === username;
          return (
            <div key={m.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: isOwn ? 'flex-end' : 'flex-start',
            }}>
              <div style={{ fontSize: '9px', color: '#888', marginBottom: '2px', paddingLeft: isOwn ? 0 : '2px', paddingRight: isOwn ? '2px' : 0 }}>
                {!isOwn && <span style={{ fontWeight: 'bold', color: '#000080' }}>{m.user} · </span>}
                {formatTime(m.timestamp)}
              </div>
              <div style={{
                maxWidth: '85%',
                padding: '5px 8px',
                background: isOwn ? '#000080' : '#e8e8e8',
                color: isOwn ? 'white' : '#111',
                fontSize: '12px',
                border: isOwn
                  ? '1px solid #00005a'
                  : '1px solid #c0c0c0',
                wordBreak: 'break-word',
                lineHeight: '1.4',
              }}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '4px 6px 6px',
        flexShrink: 0,
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type a message…"
          maxLength={400}
          style={{
            flex: 1,
            fontSize: '12px',
            border: '1px inset #808080',
            padding: '3px 6px',
            background: 'white',
            outline: 'none',
          }}
        />
        <button
          className="win95-btn"
          onClick={send}
          disabled={!input.trim()}
          style={{ fontSize: '11px', padding: '3px 10px', flexShrink: 0 }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
