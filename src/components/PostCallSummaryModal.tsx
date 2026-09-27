import React from 'react';
import {
  SupportTicket,
  TaskItem,
  NoteItem,
  MeetingItem,
  SavedConversationSession,
} from '../types';
import {
  Sparkles,
  CheckCircle2,
  Phone,
  User,
  Clock,
  ArrowRight,
  Database,
  FileText,
  ListTodo,
  X,
  ShieldCheck,
  AlertTriangle,
  Repeat,
  DollarSign,
  Layers,
  Store,
  CreditCard,
  AlertOctagon,
} from 'lucide-react';

interface PostCallSummaryModalProps {
  isOpen: boolean;
  isAnalyzing: boolean;
  ticket: SupportTicket | null;
  extractedTasks: TaskItem[];
  extractedNotes: NoteItem[];
  extractedMeetings: MeetingItem[];
  savedSession: SavedConversationSession | null;
  onClose: () => void;
  onViewInCrm: () => void;
  onStartNewCall: () => void;
}

export const PostCallSummaryModal: React.FC<PostCallSummaryModalProps> = ({
  isOpen,
  isAnalyzing,
  ticket,
  extractedTasks,
  extractedNotes,
  extractedMeetings,
  savedSession,
  onClose,
  onViewInCrm,
  onStartNewCall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">IVR Call Logged & Analyzed</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  IndexedDB Synchronized
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Venture Infotech Support 24 ticket generated with 48-hr testing window & policy audit.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Close summary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          {isAnalyzing ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Analyzing Support Call with AI...</h4>
                <p className="text-xs text-slate-400 max-w-sm mt-1">
                  Verifying plan tier, checking 48-hr testing window, evaluating backup plan eligibility, and logging tickets.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Ticket Overview Banner */}
              {ticket && (
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    ticket.warningCount > 0
                      ? 'bg-rose-950/40 border-rose-500/40'
                      : ticket.status === 'Backup Plan Triggered'
                      ? 'bg-emerald-950/40 border-emerald-500/40'
                      : 'bg-slate-800/60 border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl flex items-center justify-center ${
                        ticket.warningCount > 0
                          ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/40'
                          : 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/40'
                      }`}
                    >
                      {ticket.warningCount > 0 ? (
                        <AlertOctagon className="w-6 h-6 animate-pulse" />
                      ) : (
                        <ShieldCheck className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Support Ticket
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-500 text-slate-950">
                          {ticket.plan}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {ticket.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                        <span>{ticket.clientName}</span>
                        <span className="text-xs font-normal text-slate-400 font-mono">({ticket.storeName})</span>
                      </h4>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <div className="bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 flex items-center gap-1.5 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{ticket.contactNumber}</span>
                    </div>
                    <div className="bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-700/60 font-semibold text-emerald-400 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{ticket.gateway}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2-Sentence Executive Summary */}
              {ticket && (
                <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Executive Call Summary (Isha)</span>
                    </div>
                    <span className="text-[11px] font-medium text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-800/50">
                      Category: {ticket.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    {ticket.executiveSummary}
                  </p>
                </div>
              )}

              {/* 48-Hour Ad Testing & Backup Plan Status Grid */}
              {ticket && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 48-Hr Testing Progress */}
                  <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        48-Hr Testing Window
                      </span>
                      <span className="text-amber-400 font-mono">{ticket.testingWindowHoursElapsed}/48 hrs</span>
                    </div>
                    <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-cyan-400 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, (ticket.testingWindowHoursElapsed / 48) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Algorithm exploring target audience. Turning ad OFF resets learning phase.
                    </p>
                  </div>

                  {/* Backup Execution Plan Status */}
                  <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <Repeat className="w-3.5 h-3.5 text-emerald-400" />
                      Backup Plan
                    </div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          ticket.backupPlanStatus.includes('Triggered') ? 'bg-emerald-400 animate-ping' : 'bg-blue-400'
                        }`}
                      />
                      {ticket.backupPlanStatus}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Winning digital products copy-pasted with tested creatives.
                    </p>
                  </div>

                  {/* Anti-Harassment / Warnings */}
                  <div className="p-3.5 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                      Policy & Conduct
                    </div>
                    <p
                      className={`text-xs font-bold ${
                        ticket.warningCount === 0
                          ? 'text-emerald-400'
                          : ticket.warningCount === 1
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {ticket.warningCount === 0 && 'Zero Tolerance Compliant (Clean)'}
                      {ticket.warningCount === 1 && '1st Warning Issued (Abusive tone)'}
                      {ticket.warningCount >= 2 && 'Terminated: 2nd Warning / Suspended'}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Strictly Non-Refundable & Recorded Line standards enforced.
                    </p>
                  </div>
                </div>
              )}

              {/* Recommended Next Action */}
              {ticket && (
                <div className="p-3.5 bg-cyan-950/30 border border-cyan-500/30 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-cyan-500/20 text-cyan-300 rounded-lg shrink-0 mt-0.5">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Recommended Support Action
                    </h5>
                    <p className="text-xs text-slate-200 mt-0.5 font-medium">
                      {ticket.recommendedAction}
                    </p>
                  </div>
                </div>
              )}

              {/* Extracted Database Items */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Structured Actions Saved in System</span>
                  <span className="text-[10px] font-normal text-slate-500">
                    {extractedTasks.length} Tasks • {extractedNotes.length} Notes • {extractedMeetings.length} Callbacks
                  </span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {extractedTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 bg-slate-800/30 border border-slate-700/40 rounded-lg flex items-start gap-2 text-xs"
                    >
                      <ListTodo className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-white truncate">{task.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{task.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onStartNewCall}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Start Another IVR Call</span>
          </button>

          <button
            onClick={onViewInCrm}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Open Support & Operations Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
