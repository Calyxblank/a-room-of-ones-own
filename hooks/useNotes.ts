'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Note } from '../types';

const NOTE_COLORS = ['#fef08a', '#86efac', '#f9a8d4', '#93c5fd', '#fca5a5', '#c4b5fd'];

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function encodeNotes(notes: Note[]): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(notes)));
  } catch {
    return '';
  }
}

function decodeNotes(encoded: string): Note[] | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {
    return null;
  }
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('notes');
    if (encoded) {
      const decoded = decodeNotes(encoded);
      if (decoded) {
        setNotes(decoded);
        setLoaded(true);
        return;
      }
    }
    const saved = localStorage.getItem('room-notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch {}
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem('room-notes', JSON.stringify(notes));
  }, [notes, loaded]);

  const addNote = useCallback((x: number, y: number) => {
    const color = NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
    const note: Note = {
      id: generateId(),
      content: '',
      x,
      y,
      color,
      connections: [],
    };
    setNotes(prev => [...prev, note]);
    return note.id;
  }, []);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes(prev =>
      prev
        .filter(n => n.id !== id)
        .map(n => ({ ...n, connections: n.connections.filter(c => c !== id) }))
    );
  }, []);

  const startConnect = useCallback((id: string) => {
    setConnectingFrom(id);
  }, []);

  const finishConnect = useCallback((targetId: string) => {
    if (!connectingFrom || connectingFrom === targetId) {
      setConnectingFrom(null);
      return;
    }
    setNotes(prev =>
      prev.map(n => {
        if (n.id === connectingFrom) {
          const already = n.connections.includes(targetId);
          return {
            ...n,
            connections: already
              ? n.connections.filter(c => c !== targetId)
              : [...n.connections, targetId],
          };
        }
        return n;
      })
    );
    setConnectingFrom(null);
  }, [connectingFrom]);

  const cancelConnect = useCallback(() => setConnectingFrom(null), []);

  const getShareUrl = useCallback((): string => {
    const encoded = encodeNotes(notes);
    const url = new URL(window.location.href);
    url.searchParams.set('notes', encoded);
    return url.toString();
  }, [notes]);

  const clearAll = useCallback(() => {
    setNotes([]);
    localStorage.removeItem('room-notes');
  }, []);

  return {
    notes,
    connectingFrom,
    addNote,
    updateNote,
    deleteNote,
    startConnect,
    finishConnect,
    cancelConnect,
    getShareUrl,
    clearAll,
  };
}
