import React, { useState } from 'react';
import {
  TaskItem,
  NoteItem,
  MeetingItem,
  SavedConversationSession,
  TranscriptEntry,
} from '../types';
import {
  CheckSquare,
  FileText,
  Calendar,
  Mic,
  Download,
  Upload,
  Trash2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Pin,
  Tag,
  Phone,
  User,
  X,
  Sparkles,
  ExternalLink,
  RotateCcw,
  Volume2,
  Database,
  Check,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';

interface DataManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessionId: string;
  currentTranscripts: TranscriptEntry[];
  tasks: TaskItem[];
  notes: NoteItem[];
  meetings: MeetingItem[];
  conversations: SavedConversationSession[];
  onSaveTask: (task: TaskItem) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onSaveNote: (note: NoteItem) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onSaveMeeting: (meeting: MeetingItem) => Promise<void>;
  onDeleteMeeting: (id: string) => Promise<void>;
  onDeleteConversation: (id: string) => Promise<void>;
  onLoadConversation: (conversation: SavedConversationSession) => void;
  onExportData: () => void;
  onImportData: (file: File) => Promise<void>;
  onClearAllDB: () => Promise<void>;
  onExtractFromTranscripts: () => void;
  onReplayAudio?: (text: string) => void;
}

type TabType = 'tasks' | 'notes' | 'meetings' | 'conversations' | 'database';

export const DataManagerModal: React.FC<DataManagerModalProps> = ({
  isOpen,
  onClose,
  activeSessionId,
  currentTranscripts,
  tasks,
  notes,
  meetings,
  conversations,
  onSaveTask,
  onDeleteTask,
  onSaveNote,
  onDeleteNote,
  onSaveMeeting,
  onDeleteMeeting,
  onDeleteConversation,
  onLoadConversation,
  onExportData,
  onImportData,
  onClearAllDB,
  onExtractFromTranscripts,
  onReplayAudio,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('tasks');
  const [searchQuery, setSearchQuery] = useState('');

  // Task form state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Note form state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Meeting form state
  const [isAddingMeeting, setIsAddingMeeting] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingClient, setMeetingClient] = useState('');
  const [meetingContact, setMeetingContact] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingType, setMeetingType] = useState<'boutique_visit' | 'phone_call' | 'video_consultation'>('boutique_visit');
  const [meetingNotes, setMeetingNotes] = useState('');

  // Conversation preview state
  const [selectedConv, setSelectedConv] = useState<SavedConversationSession | null>(null);

  // File import ref
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // --- Handlers for Tasks ---
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: taskTitle.trim(),
      description: taskDesc.trim() || undefined,
      status: 'pending',
      priority: taskPriority,
      dueDate: taskDueDate || undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sessionId: activeSessionId,
    };

    await onSaveTask(newTask);
    setTaskTitle('');
    setTaskDesc('');
    setTaskDueDate('');
    setIsAddingTask(false);
  };

  const handleToggleTaskStatus = async (task: TaskItem) => {
    const updated: TaskItem = {
      ...task,
      status: task.status === 'completed' ? 'pending' : 'completed',
      updatedAt: Date.now(),
    };
    await onSaveTask(updated);
  };

  // --- Handlers for Notes ---
  const handleCreateOrUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    const tagsArray = noteTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingNoteId) {
      const existing = notes.find((n) => n.id === editingNoteId);
      if (existing) {
        await onSaveNote({
          ...existing,
          title: noteTitle.trim() || 'Untitled Note',
          content: noteContent.trim(),
          tags: tagsArray,
          updatedAt: Date.now(),
        });
      }
    } else {
      const newNote: NoteItem = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: noteTitle.trim() || 'Consultation Note',
        content: noteContent.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sessionId: activeSessionId,
        tags: tagsArray,
        isPinned: false,
      };
      await onSaveNote(newNote);
    }

    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
    setEditingNoteId(null);
    setIsAddingNote(false);
  };

  const handleTogglePinNote = async (note: NoteItem) => {
    await onSaveNote({
      ...note,
      isPinned: !note.isPinned,
      updatedAt: Date.now(),
    });
  };

  // --- Handlers for Meetings ---
  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle.trim() && !meetingClient.trim()) return;

    const newMeeting: MeetingItem = {
      id: `meeting-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: meetingTitle.trim() || `Consultation with ${meetingClient.trim() || 'Client'}`,
      clientName: meetingClient.trim() || 'Valued Customer',
      clientContact: meetingContact.trim() || undefined,
      date: meetingDate || new Date().toISOString().split('T')[0],
      time: meetingTime || '16:00',
      location: meetingType === 'boutique_visit' ? 'Zarika Studio Main Boutique' : 'Phone / WhatsApp',
      type: meetingType,
      status: 'scheduled',
      notes: meetingNotes.trim() || undefined,
      createdAt: Date.now(),
      sessionId: activeSessionId,
    };

    await onSaveMeeting(newMeeting);
    setMeetingTitle('');
    setMeetingClient('');
    setMeetingContact('');
    setMeetingDate('');
    setMeetingTime('');
    setMeetingNotes('');
    setIsAddingMeeting(false);
  };

  const handleUpdateMeetingStatus = async (
    meeting: MeetingItem,
    status: MeetingItem['status']
  ) => {
    await onSaveMeeting({
      ...meeting,
      status,
    });
  };

  // Filtered queries
  const filteredTasks = tasks.filter((t) => {
    const matchQuery =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (taskStatusFilter === 'pending') return matchQuery && t.status !== 'completed';
    if (taskStatusFilter === 'completed') return matchQuery && t.status === 'completed';
    return matchQuery;
  });

  const filteredNotes = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.tags && n.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const filteredMeetings = meetings.filter((m) =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.transcripts.some((t) => t.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col h-[92vh] max-h-[850px] overflow-hidden text-slate-100">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">IndexedDB Workspace Storage</h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Live IndexedDB
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tasks, notes, appointments &amp; voice conversation history saved in your browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentTranscripts.length > 0 && (
              <button
                onClick={onExtractFromTranscripts}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold rounded-xl text-xs shadow hover:brightness-110 transition"
                title="Automatically extract follow-up tasks, notes & appointment from recent speech"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Extract from Speech</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 gap-2 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => { setActiveTab('tasks'); setSelectedConv(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'tasks'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tasks ({tasks.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('notes'); setSelectedConv(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'notes'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes ({notes.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('meetings'); setSelectedConv(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'meetings'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Appointments ({meetings.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('conversations'); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'conversations'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice Logs ({conversations.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('database'); setSelectedConv(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'database'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Backup &amp; DB</span>
            </button>
          </div>

          {/* Search bar inside manager */}
          {activeTab !== 'database' && (
            <div className="relative min-w-[140px] sm:min-w-[180px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-950/30">
          {/* ======================= TAB 1: TASKS ======================= */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Sales Action Items &amp; Tasks
                  </span>
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px]">
                    <button
                      onClick={() => setTaskStatusFilter('all')}
                      className={`px-2 py-0.5 rounded ${taskStatusFilter === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'}`}
                    >
                      All ({tasks.length})
                    </button>
                    <button
                      onClick={() => setTaskStatusFilter('pending')}
                      className={`px-2 py-0.5 rounded ${taskStatusFilter === 'pending' ? 'bg-amber-950/80 text-amber-300 font-bold' : 'text-slate-400'}`}
                    >
                      Pending ({tasks.filter(t => t.status !== 'completed').length})
                    </button>
                    <button
                      onClick={() => setTaskStatusFilter('completed')}
                      className={`px-2 py-0.5 rounded ${taskStatusFilter === 'completed' ? 'bg-emerald-950/80 text-emerald-300 font-bold' : 'text-slate-400'}`}
                    >
                      Done ({tasks.filter(t => t.status === 'completed').length})
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Task</span>
                </button>
              </div>

              {/* Add Task Card Form */}
              {isAddingTask && (
                <form
                  onSubmit={handleCreateTask}
                  className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 space-y-3 animate-fade-in shadow-xl"
                >
                  <div className="text-xs font-bold text-amber-300">Create Follow-Up Task (IndexedDB)</div>
                  <input
                    type="text"
                    placeholder="Task title (e.g. Share WhatsApp video for Wine Silk Saree ₹47,500)..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                  <textarea
                    rows={2}
                    placeholder="Additional details / customer requests..."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                      >
                        <option value="low">Priority: Low</option>
                        <option value="medium">Priority: Medium</option>
                        <option value="high">Priority: High 🔥</option>
                      </select>

                      <input
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingTask(false)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
                      >
                        Save to IndexedDB
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Task Items List */}
              {filteredTasks.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                  <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No tasks found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Add customer follow-up actions, catalog reminders, or click "Auto-Extract from Speech".
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {filteredTasks.map((t) => {
                    const isDone = t.status === 'completed';
                    return (
                      <div
                        key={t.id}
                        className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                          isDone
                            ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => handleToggleTaskStatus(t)}
                            className={`mt-0.5 p-1 rounded-lg border transition ${
                              isDone
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                : 'border-slate-600 hover:border-amber-400 text-transparent'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-sm font-semibold ${
                                  isDone ? 'line-through text-slate-400' : 'text-slate-100'
                                }`}
                              >
                                {t.title}
                              </span>

                              {t.priority === 'high' && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
                                  High Priority
                                </span>
                              )}
                              {t.priority === 'medium' && (
                                <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-medium">
                                  Medium
                                </span>
                              )}
                            </div>

                            {t.description && (
                              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                                {t.description}
                              </p>
                            )}

                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                              {t.dueDate && (
                                <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                                  <Clock className="w-3 h-3" /> Due: {t.dueDate}
                                </span>
                              )}
                              <span>
                                Saved: {new Date(t.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteTask(t.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          title="Delete from IndexedDB"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 2: NOTES ======================= */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Client Consultation Notes &amp; Scratchpad
                </span>

                <button
                  onClick={() => {
                    setEditingNoteId(null);
                    setNoteTitle('');
                    setNoteContent('');
                    setNoteTags('');
                    setIsAddingNote(!isAddingNote);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Note</span>
                </button>
              </div>

              {/* Note Add / Edit Form */}
              {isAddingNote && (
                <form
                  onSubmit={handleCreateOrUpdateNote}
                  className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 space-y-3 animate-fade-in shadow-xl"
                >
                  <div className="text-xs font-bold text-amber-300">
                    {editingNoteId ? 'Edit Note in IndexedDB' : 'Create Consultation Note (IndexedDB)'}
                  </div>
                  <input
                    type="text"
                    placeholder="Note Title (e.g. Saree Preferences - Bride Sister)..."
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                  <textarea
                    rows={4}
                    placeholder="Write detailed notes, fabric preferences, budget constraints, color shortlists..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="Tags (comma separated: wine, bridal, silk, ₹50k)..."
                      value={noteTags}
                      onChange={(e) => setNoteTags(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none min-w-[240px]"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingNote(false);
                          setEditingNoteId(null);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
                      >
                        Save Note to IndexedDB
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Notes Grid */}
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No notes stored yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Take customer notes during sales calls or auto-extract preferences from the transcript.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredNotes.map((n) => (
                    <div
                      key={n.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        n.isPinned
                          ? 'bg-amber-950/20 border-amber-500/40 shadow-lg shadow-amber-500/5'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h4 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                            {n.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleTogglePinNote(n)}
                              className={`p-1 rounded-lg transition ${
                                n.isPinned ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                              }`}
                              title={n.isPinned ? 'Unpin' : 'Pin to top'}
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingNoteId(n.id);
                                setNoteTitle(n.title);
                                setNoteContent(n.content);
                                setNoteTags(n.tags ? n.tags.join(', ') : '');
                                setIsAddingNote(true);
                              }}
                              className="p-1 text-slate-400 hover:text-amber-300 rounded-lg text-xs font-semibold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDeleteNote(n.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {n.content}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-[10px] text-slate-500">
                        <div className="flex items-center gap-1 flex-wrap">
                          {n.tags &&
                            n.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                              >
                                #{tag}
                              </span>
                            ))}
                        </div>
                        <span>{new Date(n.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 3: MEETINGS & APPOINTMENTS ======================= */}
          {activeTab === 'meetings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Boutique Appointments &amp; Consultations
                </span>

                <button
                  onClick={() => setIsAddingMeeting(!isAddingMeeting)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              </div>

              {/* Add Meeting Form */}
              {isAddingMeeting && (
                <form
                  onSubmit={handleCreateMeeting}
                  className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 space-y-3 animate-fade-in shadow-xl"
                >
                  <div className="text-xs font-bold text-amber-300">
                    Book Boutique Visit / Phone Consultation (IndexedDB)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Appointment Title (e.g. Sunday 4 PM Boutique Visit)..."
                      value={meetingTitle}
                      onChange={(e) => setMeetingTitle(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Customer Name (e.g. Priya Sharma)..."
                      value={meetingClient}
                      onChange={(e) => setMeetingClient(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp / Phone number..."
                      value={meetingContact}
                      onChange={(e) => setMeetingContact(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <select
                      value={meetingType}
                      onChange={(e) => setMeetingType(e.target.value as any)}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="boutique_visit">In-Person Boutique Visit (Stylist Trial)</option>
                      <option value="phone_call">Phone Consultation</option>
                      <option value="video_consultation">Live Video / WhatsApp Showcase</option>
                    </select>
                    <input
                      type="date"
                      value={meetingDate}
                      onChange={(e) => setMeetingDate(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                    <input
                      type="time"
                      value={meetingTime}
                      onChange={(e) => setMeetingTime(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Stylist notes, shortlisted saree details, occasion date (e.g. 20 Dec Wedding)..."
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingMeeting(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400"
                    >
                      Save Appointment to IndexedDB
                    </button>
                  </div>
                </form>
              )}

              {/* Meetings List */}
              {filteredMeetings.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                  <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">No appointments scheduled</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    When you or Gemini agree on a Sunday 4 PM boutique slot, it will be saved here in IndexedDB.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredMeetings.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center flex-shrink-0 font-bold">
                          <Calendar className="w-5 h-5" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white">{m.title}</h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                m.status === 'confirmed'
                                  ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                                  : m.status === 'completed'
                                  ? 'bg-slate-800 text-slate-400'
                                  : 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                              }`}
                            >
                              {m.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-300 flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-amber-300">
                              <Clock className="w-3.5 h-3.5" /> {m.date} at {m.time}
                            </span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <User className="w-3.5 h-3.5" /> {m.clientName}
                            </span>
                            {m.clientContact && (
                              <span className="flex items-center gap-1 text-emerald-400">
                                <Phone className="w-3.5 h-3.5" /> {m.clientContact}
                              </span>
                            )}
                          </div>

                          {m.notes && (
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                              {m.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <select
                          value={m.status}
                          onChange={(e) => handleUpdateMeetingStatus(m, e.target.value as any)}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => onDeleteMeeting(m.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                          title="Delete appointment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 4: VOICE CONVERSATIONS HISTORY ======================= */}
          {activeTab === 'conversations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Saved Voice Conversations in IndexedDB ({conversations.length})
                </span>
                <span className="text-xs text-slate-400">
                  Every voice session is automatically stored in your browser's IndexedDB
                </span>
              </div>

              {selectedConv ? (
                /* Detail view of a selected saved conversation */
                <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{selectedConv.title}</h4>
                      <p className="text-xs text-slate-400">
                        {new Date(selectedConv.createdAt).toLocaleString()} • Voice: {selectedConv.voiceName} • {selectedConv.transcripts.length} turns
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onLoadConversation(selectedConv)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Load into Live Screen</span>
                      </button>
                      <button
                        onClick={() => setSelectedConv(null)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
                      >
                        Back to List
                      </button>
                    </div>
                  </div>

                  {/* Dialogue transcripts list */}
                  <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar p-2">
                    {selectedConv.transcripts.map((t, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl text-xs ${
                          t.sender === 'user'
                            ? 'bg-indigo-950/40 border border-indigo-800/40 text-indigo-100 ml-6'
                            : 'bg-slate-800/60 border border-slate-700/60 text-slate-100 mr-6'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-bold">
                            {t.sender === 'user' ? '👤 Customer' : '✨ Zarika Sales Agent (Gemini 3.1)'}
                          </span>
                          <span>{new Date(t.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{t.text}</p>
                        {t.sender === 'gemini' && onReplayAudio && (
                          <button
                            onClick={() => onReplayAudio(t.text)}
                            className="mt-1.5 flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                          >
                            <Volume2 className="w-3 h-3" /> Replay Speech
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* List of saved conversations */
                <div className="space-y-2.5">
                  {filteredConversations.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/80">
                      <Mic className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-300">No conversation logs found</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Start speaking to Gemini 3.1 Live. Every dialogue is persisted locally into IndexedDB.
                      </p>
                    </div>
                  ) : (
                    filteredConversations.map((c) => (
                      <div
                        key={c.id}
                        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition flex items-center justify-between gap-3 group"
                      >
                        <div
                          onClick={() => setSelectedConv(c)}
                          className="flex-1 min-w-0 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition truncate">
                              {c.title}
                            </h4>
                            {c.id === activeSessionId && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                                Current Active Session
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 flex-wrap">
                            <span>📅 {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>🎙️ Voice: {c.voiceName}</span>
                            <span>💬 {c.transcripts.length} dialogue messages</span>
                            {c.durationSeconds > 0 && (
                              <span>⏱️ {Math.floor(c.durationSeconds / 60)}m {c.durationSeconds % 60}s</span>
                            )}
                          </div>

                          {c.transcripts.length > 0 && (
                            <p className="text-xs text-slate-400 mt-1.5 line-clamp-1 italic">
                              Latest: "{c.transcripts[c.transcripts.length - 1]?.text}"
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedConv(c)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
                          >
                            View
                          </button>
                          <button
                            onClick={() => onDeleteConversation(c.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
                            title="Delete from IndexedDB"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================= TAB 5: BACKUP & DATABASE MANAGEMENT ======================= */}
          {activeTab === 'database' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Browser IndexedDB Storage Status</h3>
                    <p className="text-xs text-slate-400">Database Name: <span className="font-mono text-amber-300">ZarikaStudioVoiceDB</span> (Version 1)</p>
                  </div>
                </div>

                {/* Storage counts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <Mic className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-400">Conversations</div>
                    <div className="text-base font-bold text-white">{conversations.length}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <CheckSquare className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-400">Tasks</div>
                    <div className="text-base font-bold text-white">{tasks.length}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <FileText className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-400">Notes</div>
                    <div className="text-base font-bold text-white">{notes.length}</div>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <Calendar className="w-4 h-4 text-rose-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-400">Appointments</div>
                    <div className="text-base font-bold text-white">{meetings.length}</div>
                  </div>
                </div>
              </div>

              {/* Export & Import Tools */}
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Data Export &amp; Backup</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Export all your voice logs, follow-up tasks, consultation scratchpad notes, and booked appointments into a JSON backup file, or restore from a previously exported backup.
                </p>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={onExportData}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download JSON Backup</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs border border-slate-700 transition"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import JSON Backup</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onImportData(file);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-5 bg-rose-950/20 border border-rose-900/40 rounded-3xl space-y-3">
                <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                  <span>Clear All IndexedDB Data</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Permanently delete all stored voice conversations, tasks, notes, and meetings from the browser's IndexedDB.
                </p>

                <button
                  onClick={onClearAllDB}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Wipe Browser IndexedDB</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
