import React, { useState } from 'react';
import {
  Sparkles,
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
  Repeat,
  DollarSign,
  ArrowRight,
  BookOpen,
  Info,
  ShieldAlert,
  Clock,
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { COMPANY_POLICIES, VENTURE_PLANS } from '../lib/constants';

interface ScriptGuideCardProps {
  onSendScriptResponse: (text: string) => void;
  onPlayGreeting?: () => void;
  isConnected: boolean;
  selectedPlan: string;
  onSelectPlan: (plan: string) => void;
}

const SCRIPT_STAGES = [
  {
    category: '1. Welcome & Inquiry',
    step: 'Start Call',
    prompt: 'Hello, mujhe ad updates aur zero sales issue ke regarding complaint karni hai.',
    tag: 'Complaint',
    color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/40',
  },
  {
    category: '2. Plan Verification',
    step: 'Gold Plan',
    prompt: 'Mera Gold Plan package activate hua tha.',
    tag: 'Gold Plan',
    color: 'border-amber-500/40 text-amber-300 bg-amber-950/40',
  },
  {
    category: '2. Plan Verification',
    step: 'Silver Plan',
    prompt: 'Mera Silver Plan package hai.',
    tag: 'Silver Plan',
    color: 'border-slate-500/40 text-slate-300 bg-slate-900/60',
  },
  {
    category: '2. Plan Verification',
    step: 'Platinum Plan',
    prompt: 'Mera Platinum VIP Plan activate hai.',
    tag: 'Platinum',
    color: 'border-blue-500/40 text-blue-300 bg-blue-950/40',
  },
  {
    category: '3. Promises vs Reality',
    step: 'Promises vs Reality',
    prompt: 'Sales executive ne toh mujhe bola tha ki daily thousands ki sales aayegi! Unhone jhoot bola tha kya?',
    tag: 'No Blame Game',
    color: 'border-rose-500/40 text-rose-300 bg-rose-950/40',
  },
  {
    category: '4. 48-Hour Ad Testing',
    step: 'Turn Ad OFF',
    prompt: 'Mera ad chal raha hai par sales nahi aa rahi, ad abhi turant OFF kar do!',
    tag: 'Testing Window',
    color: 'border-orange-500/40 text-orange-300 bg-orange-950/40',
  },
  {
    category: '5. Backup Execution Plan',
    step: 'Winning Products',
    prompt: 'Agar 2 din baad bhi sales slow rahi toh Backup Plan kaise kaam karega? Winning product copy-paste kaise hoga?',
    tag: 'Backup Plan',
    color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40',
  },
  {
    category: '6. Common Objections',
    step: 'Offline Phone',
    prompt: 'Mera call disconnect hone ke baad personal number offline kyu batata hai?',
    tag: 'IVR Policy',
    color: 'border-purple-500/40 text-purple-300 bg-purple-950/40',
  },
  {
    category: '6. Common Objections',
    step: 'Ad Update Report',
    prompt: 'Ad ka regular update aur spend report kahan milta hai?',
    tag: 'EOD Email',
    color: 'border-sky-500/40 text-sky-300 bg-sky-950/40',
  },
  {
    category: '7. Refund Policy',
    step: 'Demand Refund',
    prompt: 'Mujhe aage kaam nahi karna, mera saara paisa refund kar do abhi!',
    tag: 'Non-Refundable',
    color: 'border-red-500/40 text-red-300 bg-red-950/40',
  },
  {
    category: '8. Anti-Harassment',
    step: 'Warning 1 (Abuse)',
    prompt: 'Tum sab fraud ho! Ekdum bekaar service hai!',
    tag: '1st Warning',
    color: 'border-amber-600/50 text-amber-300 bg-amber-950/50',
  },
  {
    category: '8. Anti-Harassment',
    step: 'Warning 2 (Terminate)',
    prompt: 'Faltu bakwas band karo, main sabko sabak sikhaunga!',
    tag: 'Call Terminate',
    color: 'border-red-600/60 text-red-200 bg-red-950/60',
  },
];

export const ScriptGuideCard: React.FC<ScriptGuideCardProps> = ({
  onSendScriptResponse,
  onPlayGreeting,
  isConnected,
  selectedPlan,
  onSelectPlan,
}) => {
  const [showMindsetModal, setShowMindsetModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulation' | 'mindset' | 'policies'>('simulation');

  return (
    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 shadow-2xl backdrop-blur-md mb-4 text-slate-100">
      {/* Header with Navigation tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs shadow-inner">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Venture Infotech Support 24 — Live IVR Script Simulator
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                ● Executive: Isha
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              One-click customer test prompts to simulate sales promises, 48-hr testing, backup plans & warnings
            </p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('simulation')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'simulation'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Caller Prompts
          </button>
          <button
            onClick={() => setActiveTab('mindset')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'mindset'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Executive Mindset
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'policies'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Official Policies
          </button>
        </div>
      </div>

      {/* Tab 1: Caller Prompts Bar */}
      {activeTab === 'simulation' && (
        <div>
          {/* Greeting Trigger Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 p-2.5 mb-2.5 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/30">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <p className="text-xs text-slate-200">
                <strong className="text-cyan-300">Official Opening Greeting:</strong> "Welcome to Venture Support! Main Isha baat kar rahi hoon. Aapko kaise madad kar sakti hoon?"
              </p>
            </div>
            {onPlayGreeting && (
              <button
                onClick={onPlayGreeting}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                title="Hear Isha speak the welcome greeting aloud"
              >
                <span>🔊 Hear Welcome Greeting</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span>Click any customer scenario to feed directly into the live audio IVR:</span>
            <span className="text-cyan-400 font-medium">12 Interactive Scenarios</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {SCRIPT_STAGES.map((stage, idx) => (
              <button
                key={idx}
                onClick={() => onSendScriptResponse(stage.prompt)}
                className={`flex flex-col text-left p-2.5 rounded-xl border transition-all hover:scale-[1.01] hover:border-cyan-400/70 shadow-sm group ${stage.color}`}
                title={`Send prompt: "${stage.prompt}"`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">
                    {stage.step}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 font-mono font-semibold">
                    {stage.tag}
                  </span>
                </div>
                <p className="text-[11px] text-slate-200 font-medium line-clamp-2 group-hover:text-white transition-colors">
                  "{stage.prompt}"
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Executive Confidence Mindset */}
      {activeTab === 'mindset' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-semibold text-xs">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>No Blame Game</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Sales team ko galat mat batao. Bolo ki unhone top normal clients ka actual capability benchmark share kiya tha.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 mb-1.5 text-amber-400 font-semibold text-xs">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Acknowledge Differences</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Accept karo ki har individual aur brand ki market journey alag hoti hai. Algorithm response har store ke liye unique hai.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 mb-1.5 text-emerald-400 font-semibold text-xs">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Stay Calming & Grounded</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Soft aur deeply polite tone mein bolo taaki gussa hone waala client bhi shaanti se situation ko samjhe.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 mb-1.5 text-purple-400 font-semibold text-xs">
              <Repeat className="w-4 h-4 text-purple-400" />
              <span>Focus on Action</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Baat ko 48-Hour Ad Testing Window aur Backup Plan (Winning Product Copy-Paste to Cosmofeed/Razorpay) par hi conclude karo.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Official Policies Summary */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          {COMPANY_POLICIES.map((policy) => (
            <div
              key={policy.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-200">{policy.title}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/30">
                    {policy.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium mb-1.5">{policy.summary}</p>
                <p className="text-[10px] text-slate-400 italic bg-black/30 p-2 rounded-lg border border-slate-800/80">
                  "{policy.rule}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
