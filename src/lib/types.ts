export interface MockVote {
  id: string;
  visitorId: string;
  candidateId: string;
  partyLabel: string;
  timestamp: number;
}

export interface TimelineStep {
  id: string;
  title: string;
  description: string;
  order: number;
  icon: string;
}

export interface VoteTally {
  partyA: number;
  partyB: number;
  partyC: number;
  total: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  role: 'citizen' | 'staff';
  displayName: string | null;
}

export interface BoothLocation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

export interface TranslationRequest {
  text: string;
  targetLanguage: string;
}
