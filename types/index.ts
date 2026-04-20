export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'night';
export type ActivePanel = null | 'turntable' | 'window' | 'desk';

export interface ChatMessage {
  id: number;
  text: string;
  user: string;
  timestamp: number;
}

export interface SharedPlaylist {
  id: string;
  spotifyId: string;
  title: string;
  addedBy: string;
  addedAt: number;
}

export interface RoomPhoto {
  id: string;
  dataUrl: string;
  frame: number;
  uploadedAt: number;
}

export interface Note {
  id: string;
  content: string;
  x: number;
  y: number;
  color: string;
  connections: string[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  coverColor: string;
  duration: string;
  genre: string;
}

export interface TimeTheme {
  wallColor: string;
  floorColor: string;
  skyTop: string;
  skyBottom: string;
  overlayColor: string;
  ambientLight: string;
  label: string;
  icon: string;
}
