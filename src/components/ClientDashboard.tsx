import React, { useState } from 'react';
import {
  MessageSquare,
  Calendar,
  CheckSquare,
  FileText,
  Sparkles,
  Phone,
  Clock,
  Download,
  Upload,
  Trash2,
  Search,
  Volume2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Tag,
  Mic,
  Database,
  Store,
  CreditCard,
  Layers,
  Repeat,
  ShieldCheck,
  ArrowRight,
  Gavel,
  PhoneCall,
  LayoutDashboard,
} from 'lucide-react';
import {
  TaskItem,
  NoteItem,
  MeetingItem,
  SavedConversationSession,
  ClientProfile,
  TranscriptEntry,
  SupportTicket,
  VenturePlanType,
} from '../types';
import { VoiceLeadAdminPanel } from './VoiceLeadAdminPanel';
import { VENTURE_PLANS, COMPANY_POLICIES } from '../lib/constants';

interface ClientDashboardProps {
  conversations: SavedConversationSession[];
  tasks: TaskItem[];
  notes: NoteItem[];
  meetings: MeetingItem[];
  tickets: SupportTicket[];
  clientProfile: ClientProfile;
  currentTranscripts: TranscriptEntry[];
  onSaveTask: (task: TaskItem) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onSaveNote: (note: NoteItem) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onSaveMeeting: (meeting: MeetingItem) => Promise<void>;
  onDeleteMeeting: (id: string) => Promise<void>;
  onSaveTicket: (ticket: SupportTicket) => Promise<void>;
  onDeleteTicket: (id: string) => Promise<void>;
  onSaveClientProfile: (profile: ClientProfile) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
  onExtractFromLive: () => void;
  onExportBackup: () => void;
  onImportBackup: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAll: () => void;
  onSwitchToLiveCall: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  conversations,
  tasks,
  notes,
  meetings,
  tickets,
  clientProfile,
  currentTranscripts,
  onSaveTask,
  onDeleteTask,
  onSaveNote,
  onDeleteNote,
  onSaveMeeting,
  onDeleteMeeting,
  onSaveTicket,
  onDeleteTicket,
  onSaveClientProfile,
  onDeleteConversation,
  onExtractFromLive,
  onExportBackup,
  onImportBackup,
  onClearAll,
  onSwitchToLiveCall,
}) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'store_profile' | 'conversations' | 'tasks' | 'notes' | 'meetings'>('tickets');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    conversations.length > 0 ? conversations[0].id : null
  );
  const [conversationSearch, setConversationSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New item modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('high');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState('48-Hour Ad Testing Review & Backup Trigger');
  const [newMeetingClient, setNewMeetingClient] = useState(clientProfile.clientName);
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('17:00');

  const selectedSession = conversations.find((s) => s.id === selectedSessionId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    return (
      c.title.toLowerCase().includes(conversationSearch.toLowerCase()) ||
      (c.summary && c.summary.toLowerCase().includes(conversationSearch.toLowerCase())) ||
      c.callerPlan.toLowerCase().includes(conversationSearch.toLowerCase())
    );
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    const now = Date.now();
    await onSaveTask({
      id: `task-${now}`,
      title: newTaskTitle,
      priority: newTaskPriority,
      status: 'pending',
      dueDate: newTaskDueDate || new Date(now + 86400000).toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now,
      tags: ['manual', 'operations'],
    });
    setNewTaskTitle('');
    setIsTaskModalOpen(false);
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle) return;
    const now = Date.now();
    await onSaveNote({
      id: `note-${now}`,
      title: newNoteTitle,
      content: newNoteContent,
      createdAt: now,
      updatedAt: now,
      tags: ['manual', 'client-note'],
    });
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsNoteModalOpen(false);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTitle) return;
    const now = Date.now();
    await onSaveMeeting({
      id: `meeting-${now}`,
      title: newMeetingTitle,
      clientName: newMeetingClient,
      date: newMeetingDate || new Date(now + 48 * 3600000).toISOString().split('T')[0],
      time: newMeetingTime,
      type: 'ivr_callback',
      status: 'scheduled',
      location: 'Dedicated Support IVR Line (+91 1800-VENTURE-24)',
      createdAt: now,
    });
    setIsMeetingModalOpen(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 p-4 sm:p-6 text-slate-100">
      {/* Dashboard Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-lg shadow-inner">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                Venture Infotech Support 24 Operations Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                Live DB
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Operations desk for client packages, 48-hr testing progress, Cosmofeed/Razorpay backup execution & IVR call records.
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSwitchToLiveCall}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Launch Live Calling IVR</span>
          </button>

          <button
            onClick={onExportBackup}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all"
            title="Export JSON Backup"
          >
            <Download className="w-4 h-4" />
          </button>

          <label
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
            title="Import JSON Backup"
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={onImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 custom-scrollbar">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'tickets'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <PhoneCall className="w-4 h-4" />
          <span>Support Tickets & Operations ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('store_profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'store_profile'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Client Store & Plan Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab('conversations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'conversations'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>IVR Call Recordings ({conversations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Action Tasks ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'notes'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Executive Notes ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'meetings'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>48-Hr Review Callbacks ({meetings.length})</span>
        </button>
      </div>

      {/* TAB 1: Support Tickets Operations Panel */}
      {activeTab === 'tickets' && (
        <VoiceLeadAdminPanel
          tickets={tickets}
          onSaveTicket={onSaveTicket}
          onDeleteTicket={onDeleteTicket}
          onExtractFromTranscripts={onExtractFromLive}
          onSwitchToLiveCall={onSwitchToLiveCall}
        />
      )}

      {/* TAB 2: Store & Plan Intelligence */}
      {activeTab === 'store_profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Active Client Profile
                </span>
                <h3 className="text-2xl font-black text-white mt-0.5">{clientProfile.clientName}</h3>
                <p className="text-xs text-slate-400 font-mono">{clientProfile.storeName} ({clientProfile.storeId})</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {clientProfile.plan}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {clientProfile.gateway} Linked
                </span>
              </div>
            </div>

            {/* Performance & Status Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Ad Campaign Status
                </span>
                <p className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {clientProfile.adStatus}
                </p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Daily Ad Budget
                </span>
                <p className="text-sm font-bold text-white mt-1">₹{clientProfile.dailyAdBudget.toLocaleString()}/day</p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Total Orders
                </span>
                <p className="text-sm font-bold text-cyan-300 mt-1">{clientProfile.totalOrders} Orders</p>
              </div>

              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Live Revenue
                </span>
                <p className="text-sm font-bold text-emerald-400 mt-1">₹{clientProfile.totalRevenue.toLocaleString()}</p>
              </div>
            </div>

            {/* 48-Hour Ad Testing Window Progress */}
            <div className="p-5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  48-Hour Ad Testing Progress
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {clientProfile.testingHoursElapsed} / 48 Hours
                </span>
              </div>

              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-500 to-cyan-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (clientProfile.testingHoursElapsed / 48) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>0h (Campaign Launch)</span>
                <span>24h (Mid-Testing Window)</span>
                <span>48h (Algorithm Stable / Backup Window)</span>
              </div>
            </div>

            {/* Winning Product Backup Plan Status */}
            <div className="p-5 bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-900 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Repeat className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Winning Product Copy-Paste Status
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {clientProfile.winningProductsImported
                    ? 'Winning & Hot-Selling products from top clients successfully imported into store.'
                    : 'Ready to import tested high-converting digital products if sales remain slow post 48 hours.'}
                </p>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                clientProfile.winningProductsImported
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {clientProfile.winningProductsImported ? 'Products Live' : 'Eligible for Import'}
              </span>
            </div>
          </div>

          {/* Right Column: Policies Quick Card */}
          <div className="lg:col-span-4 p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Mandatory Policy Disclaimers</span>
            </h4>

            {COMPANY_POLICIES.map((p) => (
              <div key={p.id} className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{p.title}</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                    {p.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">{p.summary}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Call Recordings & History */}
      {activeTab === 'conversations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl">
              <input
                type="text"
                placeholder="Search call logs by title, summary, plan..."
                value={conversationSearch}
                onChange={(e) => setConversationSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                  No call logs saved yet. Start an IVR session with Isha to generate recordings.
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedSessionId(conv.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                      selectedSessionId === conv.id
                        ? 'bg-slate-800/90 border-cyan-500 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-cyan-400">{conv.callerPlan}</span>
                      <span>{new Date(conv.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h5 className="text-xs font-bold text-white mb-1 line-clamp-1">{conv.title}</h5>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{conv.summary || 'Recorded IVR session.'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-7">
            {selectedSession ? (
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="text-base font-bold text-white">{selectedSession.title}</h4>
                    <p className="text-xs text-slate-400">
                      Duration: {Math.floor(selectedSession.durationSeconds / 60)}m {selectedSession.durationSeconds % 60}s • Voice: {selectedSession.voiceName}
                    </p>
                  </div>

                  <button
                    onClick={() => onDeleteConversation(selectedSession.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl"
                    title="Delete Call Log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedSession.transcripts.map((t, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-xs ${
                        t.sender === 'user'
                          ? 'bg-slate-800/60 ml-4 border border-slate-700/60'
                          : 'bg-cyan-950/40 mr-4 border border-cyan-800/40'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5 text-slate-400">
                        {t.sender === 'user' ? 'Customer' : 'Isha (Support Executive)'}
                      </span>
                      <p className="text-slate-200">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-400 text-xs">
                Select a call log to read the full conversation transcript.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Operational Action Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Support & Ad Optimization Tasks</h3>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        task.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h5 className="text-sm font-bold text-white mb-1">{task.title}</h5>
                  {task.description && (
                    <p className="text-xs text-slate-300 line-clamp-3 mb-2">{task.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800">
                  <span>Due: {task.dueDate || 'Today'}</span>
                  <span className="font-semibold text-cyan-400">{task.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Executive Notes */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Client Intelligence & Call Notes</h3>
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Note</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-bold text-white">{note.title}</h5>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                </div>
                <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-800 mt-3">
                  Updated: {new Date(note.updatedAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: 48-Hr Review Callbacks */}
      {activeTab === 'meetings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Scheduled Support Callbacks & 48-Hr Reviews</h3>
            <button
              onClick={() => setIsMeetingModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Callback</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      IVR Callback
                    </span>
                    <button
                      onClick={() => onDeleteMeeting(m.id)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h5 className="text-sm font-bold text-white mb-0.5">{m.title}</h5>
                  <p className="text-xs text-slate-300 mb-2">Client: {m.clientName}</p>
                </div>

                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Date: {m.date}</span>
                    <span>Time: {m.time}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{m.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <h4 className="text-sm font-bold text-white">Create Support Action Task</h4>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="e.g. Trigger winning product copy-paste"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                required
              />
              <div className="flex gap-2">
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white flex-1"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white flex-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 text-white rounded-xl font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <h4 className="text-sm font-bold text-white">Add Executive Note</h4>
            <form onSubmit={handleCreateNote} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Note Title"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                required
              />
              <textarea
                placeholder="Write note or objection handled..."
                rows={4}
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white resize-none"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 text-white rounded-xl font-bold"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Callback Modal */}
      {isMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-3">
            <h4 className="text-sm font-bold text-white">Schedule 48-Hr Review Callback</h4>
            <form onSubmit={handleCreateMeeting} className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Callback Title"
                value={newMeetingTitle}
                onChange={(e) => setNewMeetingTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                required
              />
              <input
                type="text"
                placeholder="Client Name"
                value={newMeetingClient}
                onChange={(e) => setNewMeetingClient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={newMeetingDate}
                  onChange={(e) => setNewMeetingDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white flex-1"
                />
                <input
                  type="time"
                  value={newMeetingTime}
                  onChange={(e) => setNewMeetingTime(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white flex-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 text-white rounded-xl font-bold"
                >
                  Schedule Callback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
