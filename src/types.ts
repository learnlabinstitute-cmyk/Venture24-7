export type VoiceName = 'Zephyr' | 'Kore' | 'Puck' | 'Charon' | 'Fenrir';

export interface VoiceOption {
  id: VoiceName;
  name: string;
  description: string;
  gender: 'Female' | 'Male' | 'Neutral';
  tone: string;
}

export interface PersonalityPreset {
  id: string;
  title: string;
  description: string;
  systemInstruction: string;
  suggestedPrompts: string[];
  iconName: string;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';
export type AudioState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface TranscriptEntry {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: Date;
  isPartial?: boolean;
  audioUrl?: string;
  sentiment?: 'neutral' | 'curious' | 'frustrated' | 'angry' | 'reassured';
}

export interface CompanionSettings {
  voice: VoiceName;
  personalityId: string;
  customSystemInstruction: string;
  enableVision: boolean;
  autoScroll: boolean;
  speechRate: number;
}

export interface SessionStats {
  durationSeconds: number;
  userTurns: number;
  geminiTurns: number;
  interruptionCount: number;
}

export type VenturePlanType = 'Silver Plan' | 'Gold Plan' | 'Platinum Plan' | 'Unverified';

export type SupportCallCategory =
  | 'Zero Sales / Slow Performance'
  | 'Sales Promise vs Reality'
  | '48-Hour Ad Testing'
  | 'Backup Plan (Winning Products)'
  | 'Offline Phone Question'
  | 'EOD Report & Dashboard'
  | 'Refund & Billing Dispute'
  | 'Policy & Abuse Warning'
  | 'General Inquiries';

export type TicketStatus =
  | 'Active - In Progress'
  | 'In 48-Hr Testing Window'
  | 'Backup Plan Triggered'
  | 'Under Observation'
  | 'Escalated to Legal/Management'
  | 'Resolved & Closed';

export type CallerSentiment = 'Calm' | 'Anxious' | 'Frustrated' | 'Aggressive' | 'Reassured';

export interface SupportTicket {
  id: string;
  callId: string;
  createdAt: number;
  updatedAt: number;
  clientName: string;
  contactNumber: string;
  email: string;
  storeName: string;
  storeId: string;
  plan: VenturePlanType;
  category: SupportCallCategory;
  sentiment: CallerSentiment;
  testingWindowHoursElapsed: number; // 0 to 48 hours
  backupPlanStatus: 'Not Needed' | 'Eligible' | 'Triggered - Winning Products Imported' | 'Under Review';
  gateway: 'Cosmofeed' | 'Razorpay' | 'Both' | 'None';
  warningCount: number; // 0, 1 (first warning), 2 (terminated)
  status: TicketStatus;
  executiveSummary: string;
  recommendedAction: string;
  assignedExecutive: string;
  rawTranscript: string;
  audioFileUrl?: string;
  tags: string[];
}

export interface ClientProfile {
  id: string;
  clientName: string;
  storeName: string;
  storeId: string;
  contactNumber: string;
  email: string;
  plan: VenturePlanType;
  gateway: 'Cosmofeed' | 'Razorpay' | 'Both';
  adAccountId: string;
  adStatus: 'Active' | 'In 48-Hr Testing' | 'Paused' | 'Review Required';
  dailyAdBudget: number;
  testingHoursElapsed: number; // 0 to 48
  totalOrders: number;
  totalRevenue: number;
  winningProductsImported: boolean;
  assignedExecutive: string;
  notes: string;
  updatedAt: number;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: number;
  updatedAt: number;
  sessionId?: string;
  tags?: string[];
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  sessionId?: string;
  tags?: string[];
  isPinned?: boolean;
}

export interface MeetingItem {
  id: string;
  title: string;
  clientName: string;
  clientContact?: string;
  date: string;
  time: string;
  location?: string;
  type: 'ivr_callback' | 'escalation_review' | 'ad_strategy_sync' | 'backup_plan_onboarding';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: number;
  sessionId?: string;
}

export interface SavedConversationSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  durationSeconds: number;
  voiceName: string;
  personalityId: string;
  callerPlan: VenturePlanType;
  transcripts: TranscriptEntry[];
  summary?: string;
  tags?: string[];
  stats?: SessionStats;
}
