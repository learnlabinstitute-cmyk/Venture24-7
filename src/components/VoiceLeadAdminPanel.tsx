import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Repeat,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  Mail,
  Phone,
  Copy,
  Check,
  Trash2,
  Plus,
  ExternalLink,
  Store,
  CreditCard,
  Layers,
  ChevronRight,
  Sparkles,
  AlertOctagon,
  RefreshCw,
  Send,
  User,
  Gavel,
  CheckCircle2,
} from 'lucide-react';
import { SupportTicket, TicketStatus, VenturePlanType, SupportCallCategory, CallerSentiment } from '../types';
import { VENTURE_PLANS, COMPANY_POLICIES } from '../lib/constants';

interface VoiceLeadAdminPanelProps {
  tickets: SupportTicket[];
  onSaveTicket: (ticket: SupportTicket) => Promise<void>;
  onDeleteTicket: (id: string) => Promise<void>;
  onExtractFromTranscripts: () => void;
  onSwitchToLiveCall: () => void;
}

export const VoiceLeadAdminPanel: React.FC<VoiceLeadAdminPanelProps> = ({
  tickets,
  onSaveTicket,
  onDeleteTicket,
  onExtractFromTranscripts,
  onSwitchToLiveCall,
}) => {
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    tickets.length > 0 ? tickets[0] : null
  );
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'tickets' | 'plans' | 'policies'>('tickets');

  // Form state for creating/editing a ticket
  const [formData, setFormData] = useState<Partial<SupportTicket>>({
    clientName: '',
    contactNumber: '',
    email: '',
    storeName: '',
    storeId: `VENTURE-${Math.floor(1000 + Math.random() * 9000)}`,
    plan: 'Gold Plan',
    category: 'Zero Sales / Slow Performance',
    sentiment: 'Anxious',
    testingWindowHoursElapsed: 18,
    backupPlanStatus: 'Eligible',
    gateway: 'Cosmofeed',
    warningCount: 0,
    status: 'In 48-Hr Testing Window',
    executiveSummary: 'Client reported slow initial sales. Executive explained 48-hr algorithm testing window and backup plan.',
    recommendedAction: 'Keep ad running without stopping. Prepare winning product copy-paste if needed.',
    assignedExecutive: 'Isha (Senior Support Executive)',
    rawTranscript: '',
  });

  // Calculate Metrics Overview
  const totalCalls = tickets.length;
  const inTestingWindow = tickets.filter(
    (t) => t.status === 'In 48-Hr Testing Window' || t.testingWindowHoursElapsed < 48
  ).length;
  const backupTriggered = tickets.filter(
    (t) => t.backupPlanStatus.includes('Triggered') || t.status === 'Backup Plan Triggered'
  ).length;
  const warningsIssued = tickets.filter((t) => t.warningCount > 0).length;
  const platinumClients = tickets.filter((t) => t.plan === 'Platinum Plan').length;

  // Filtered Tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesPlan = filterPlan === 'all' || ticket.plan.toLowerCase() === filterPlan.toLowerCase();
    const matchesStatus = filterStatus === 'all' || ticket.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      ticket.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.contactNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.executiveSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlan && matchesStatus && matchesSearch;
  });

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCreateTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.contactNumber) return;

    const now = Date.now();
    const newTicket: SupportTicket = {
      id: `ticket-${now}`,
      callId: `session-manual-${now}`,
      createdAt: now,
      updatedAt: now,
      clientName: formData.clientName,
      contactNumber: formData.contactNumber,
      email: formData.email || `${formData.clientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      storeName: formData.storeName || `${formData.clientName}'s Digital Store`,
      storeId: formData.storeId || `VENTURE-${Math.floor(1000 + Math.random() * 9000)}`,
      plan: (formData.plan as VenturePlanType) || 'Gold Plan',
      category: (formData.category as SupportCallCategory) || 'Zero Sales / Slow Performance',
      sentiment: (formData.sentiment as CallerSentiment) || 'Calm',
      testingWindowHoursElapsed: formData.testingWindowHoursElapsed || 12,
      backupPlanStatus: formData.backupPlanStatus || 'Eligible',
      gateway: formData.gateway || 'Cosmofeed',
      warningCount: formData.warningCount || 0,
      status: (formData.status as TicketStatus) || 'In 48-Hr Testing Window',
      executiveSummary: formData.executiveSummary || 'Manual support entry created.',
      recommendedAction: formData.recommendedAction || 'Monitor 48-hour testing window.',
      assignedExecutive: 'Isha (Senior Support Executive)',
      rawTranscript: formData.rawTranscript || 'Direct support desk ticket logged.',
      tags: [formData.plan || 'Gold Plan', formData.category || 'General'],
    };

    await onSaveTicket(newTicket);
    setSelectedTicket(newTicket);
    setIsNewTicketModalOpen(false);
  };

  const triggerBackupPlanForSelected = async () => {
    if (!selectedTicket) return;
    const updated: SupportTicket = {
      ...selectedTicket,
      backupPlanStatus: 'Triggered - Winning Products Imported',
      status: 'Backup Plan Triggered',
      recommendedAction: 'Winning product imported into Cosmofeed / Razorpay. Applied high-converting ad creatives.',
      updatedAt: Date.now(),
    };
    await onSaveTicket(updated);
    setSelectedTicket(updated);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-slate-100">
      {/* Top Banner / Operations Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-3xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Venture Infotech Support 24 Operations
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Official IVR Line
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Dedicated Support Desk for Client Plans, 48-Hr Ad Testing, Backup Execution & Policy Enforcement
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onSwitchToLiveCall}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Open Calling IVR Line</span>
          </button>

          <button
            onClick={() => setIsNewTicketModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Calls</span>
            <PhoneCall className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalCalls}</p>
          <p className="text-[11px] text-slate-400 mt-1">Logged via 1800-VENTURE-24</p>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">48-Hr Testing</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{inTestingWindow}</p>
          <p className="text-[11px] text-slate-400 mt-1">Active Algorithm Windows</p>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Backup Plan Triggered</span>
            <Repeat className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{backupTriggered}</p>
          <p className="text-[11px] text-slate-400 mt-1">Winning Products Imported</p>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">VIP Platinum</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-blue-400">{platinumClients}</p>
          <p className="text-[11px] text-slate-400 mt-1">High-Tier Accounts</p>
        </div>

        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Warnings & Abuse</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{warningsIssued}</p>
          <p className="text-[11px] text-slate-400 mt-1">Zero-Tolerance Enforced</p>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call Tickets & Records ({tickets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'plans'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Plans Specification (Silver / Gold / Platinum)</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'policies'
              ? 'bg-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Gavel className="w-3.5 h-3.5" />
          <span>Official Company Policies (4 Rules)</span>
        </button>
      </div>

      {/* TAB 1: Support Tickets Management */}
      {activeTab === 'tickets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Tickets List */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Search & Filters */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search client, store ID, phone, concern..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer flex-1"
                >
                  <option value="all">All Plans</option>
                  <option value="silver plan">Silver Plan</option>
                  <option value="gold plan">Gold Plan</option>
                  <option value="platinum plan">Platinum Plan</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer flex-1"
                >
                  <option value="all">All Statuses</option>
                  <option value="in 48-hr testing window">In 48-Hr Testing</option>
                  <option value="backup plan triggered">Backup Triggered</option>
                  <option value="active - in progress">Active</option>
                  <option value="escalated to legal/management">Escalated</option>
                </select>
              </div>
            </div>

            {/* Ticket Cards List */}
            <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-400 text-xs">
                  No support tickets match the selected filters.
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const isSelected = selectedTicket?.id === ticket.id;
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/40'
                          : 'bg-slate-900/80 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ticket.plan === 'Platinum Plan'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : ticket.plan === 'Gold Plan'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-500/20 text-slate-300 border border-slate-500/40'
                            }`}
                          >
                            {ticket.plan}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {ticket.storeId}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            ticket.warningCount > 0
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                              : ticket.status.includes('Backup')
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white mb-0.5 flex items-center justify-between">
                        <span>{ticket.clientName}</span>
                        <span className="text-[10px] font-normal text-slate-400">
                          {ticket.testingWindowHoursElapsed}/48 hrs
                        </span>
                      </h4>

                      <p className="text-xs text-slate-300 line-clamp-1 mb-2">
                        {ticket.executiveSummary}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-cyan-400" />
                          {ticket.gateway}
                        </span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Ticket Detail View */}
          <div className="lg:col-span-7">
            {selectedTicket ? (
              <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl flex flex-col gap-5">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500 text-slate-950">
                        {selectedTicket.plan}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {selectedTicket.category}
                      </span>
                      {selectedTicket.warningCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" />
                          {selectedTicket.warningCount} Warning(s)
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <span>{selectedTicket.clientName}</span>
                      <span className="text-sm font-normal text-slate-400">({selectedTicket.storeName})</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteTicket(selectedTicket.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all"
                      title="Delete Ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Key Client & Store Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Contact Phone
                    </span>
                    <p className="text-xs font-bold text-white mt-0.5">{selectedTicket.contactNumber}</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Payment Gateway
                    </span>
                    <p className="text-xs font-bold text-emerald-400 mt-0.5">{selectedTicket.gateway}</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Sentiment
                    </span>
                    <p className="text-xs font-bold text-cyan-300 mt-0.5">{selectedTicket.sentiment}</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Executive
                    </span>
                    <p className="text-xs font-bold text-slate-200 mt-0.5">Isha</p>
                  </div>
                </div>

                {/* 48-Hour Testing Window Tracker */}
                <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400" />
                      48-Hour Ad Algorithm Testing Window
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {selectedTicket.testingWindowHoursElapsed} / 48 Hours Completed
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 via-teal-400 to-cyan-400 h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (selectedTicket.testingWindowHoursElapsed / 48) * 100)}%`,
                      }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Algorithm testing is ongoing. Meta/Google requires 48 hours to locate high-converting buyers. Turning the campaign OFF resets learning and wastes ad spend.
                  </p>
                </div>

                {/* Backup Execution Plan Banner & Trigger Button */}
                <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Repeat className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                        Backup Execution Plan
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {selectedTicket.backupPlanStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Winning digital products copy-paste with tested video creatives directly to Cosmofeed/Razorpay.
                    </p>
                  </div>

                  <button
                    onClick={triggerBackupPlanForSelected}
                    disabled={selectedTicket.backupPlanStatus.includes('Triggered')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>{selectedTicket.backupPlanStatus.includes('Triggered') ? 'Products Imported' : 'Trigger Backup Plan'}</span>
                  </button>
                </div>

                {/* 2-Sentence Executive Call Summary */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Executive Call Summary
                  </span>
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed">
                    {selectedTicket.executiveSummary}
                  </div>
                </div>

                {/* Recommended Next Action */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Recommended Next Action
                  </span>
                  <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-800/40 text-xs text-cyan-200 font-medium">
                    {selectedTicket.recommendedAction}
                  </div>
                </div>

                {/* Transcript Snippet */}
                {selectedTicket.rawTranscript && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Recorded IVR Transcript Snippet
                    </span>
                    <pre className="p-3 bg-black/40 rounded-xl border border-slate-800 text-[11px] text-slate-300 font-mono whitespace-pre-wrap max-h-36 overflow-y-auto custom-scrollbar">
                      {selectedTicket.rawTranscript}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-400 text-xs">
                Select a ticket from the left panel to inspect call details, 48-hr testing progress, and policies.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Plans Specification */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VENTURE_PLANS.map((plan) => (
            <div
              key={plan.id}
              className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-extrabold uppercase tracking-wider bg-gradient-to-r ${plan.badgeColor} bg-clip-text text-transparent`}>
                    {plan.name}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Verified Package
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Top Client Benchmark
                  </span>
                  <p className="text-xl font-black text-white mt-0.5">
                    {plan.dailyPotentialBenchmark}
                  </p>
                  <p className="text-[10px] text-slate-400 italic">
                    *Aspirational benchmark; individual results vary by audience & testing.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                  <p className="text-slate-300">
                    <strong className="text-white">Testing Window:</strong> {plan.adTestingPeriod}
                  </p>
                  <p className="text-slate-300">
                    <strong className="text-white">Gateway Payout:</strong> {plan.payoutIntegration}
                  </p>
                  <p className="text-slate-300">
                    <strong className="text-white">Backup Plan:</strong> {plan.backupPlanEligibility}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Plan Deliverables
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Official Policies */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {COMPANY_POLICIES.map((policy) => (
            <div
              key={policy.id}
              className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between shadow-xl"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">{policy.title}</h4>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40">
                    {policy.status}
                  </span>
                </div>

                <p className="text-xs font-semibold text-cyan-300">{policy.summary}</p>

                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Official Executive Script & Rule
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium italic">
                    "{policy.rule}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual New Ticket Modal */}
      {isNewTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Create New Support IVR Ticket</h3>

            <form onSubmit={handleCreateTicketSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Client Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Contact Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98112 34567"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Package Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value as VenturePlanType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Silver Plan">Silver Plan</option>
                    <option value="Gold Plan">Gold Plan</option>
                    <option value="Platinum Plan">Platinum Plan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Concern / Issue Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as SupportCallCategory })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Zero Sales / Slow Performance">Zero Sales / Slow Performance</option>
                  <option value="Sales Promise vs Reality">Sales Promise vs Reality</option>
                  <option value="48-Hour Ad Testing">48-Hour Ad Testing</option>
                  <option value="Backup Plan (Winning Products)">Backup Plan (Winning Products)</option>
                  <option value="Offline Phone Question">Offline Phone Question</option>
                  <option value="EOD Report & Dashboard">EOD Report & Dashboard</option>
                  <option value="Refund & Billing Dispute">Refund & Billing Dispute</option>
                  <option value="Policy & Abuse Warning">Policy & Abuse Warning</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Executive Summary</label>
                <textarea
                  rows={2}
                  value={formData.executiveSummary}
                  onChange={(e) => setFormData({ ...formData, executiveSummary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTicketModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20"
                >
                  Save Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
