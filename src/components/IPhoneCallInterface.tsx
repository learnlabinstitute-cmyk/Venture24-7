import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Phone,
  Grid,
  FileText,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  MessageSquare,
  Radio,
  Sliders,
  Maximize2,
  Minimize2,
  User,
  Clock,
  Layers,
} from 'lucide-react';
import { TranscriptEntry, ConnectionState, AudioState } from '../types';
import { VENTURE_LOGO_URL } from '../lib/constants';
import { playDtmfTone } from '../lib/audio-utils';

interface IPhoneCallInterfaceProps {
  connectionState: ConnectionState;
  audioState: AudioState;
  transcripts: TranscriptEntry[];
  isMuted: boolean;
  userVolume: number;
  geminiVolume: number;
  selectedPlan: string;
  onSelectPlan: (plan: string) => void;
  onToggleConnection: () => void;
  onToggleMute: () => void;
  onSendPrompt: (text: string) => void;
  onPlayGreeting: () => void;
  onReplayAudio: (text: string) => void;
  selectedVoice: string;
  onSelectVoice: (voice: string) => void;
}

const QUICK_CUSTOMER_PROMPTS = [
  {
    title: 'Zero Sales & Inquiry',
    subtitle: 'States concern / complaint',
    prompt: 'Hello, mujhe ad updates aur zero sales issue ke regarding complaint karni hai.',
    category: 'Opening',
  },
  {
    title: 'Personal Ad Run & UltraViewer',
    subtitle: 'Wants ads on personal account with remote slot',
    prompt: 'Mujhe agency account nahi chahiye, mujhe mere khud ke account me ads run karwana hai. Aap kaise slot book karoge? UltraViewer se access loge kya?',
    category: 'UltraViewer Setup',
  },
  {
    title: 'Police / Cyber / Legal Threat',
    subtitle: 'Client threatens police or legal FIR',
    prompt: 'Main tumhare khilaf Police aur Cyber Cell mein fraud case file kar raha hoon!',
    category: 'Legal Protocol',
  },
  {
    title: 'Dispute / Email Routing',
    subtitle: 'Payment fast resolution & email routing',
    prompt: 'Mera payment fast resolve karwao, nahi toh payment screenshot kahan bhejna hai?',
    category: 'Dispute & Email',
  },
  {
    title: 'Office Timings Inquiry',
    subtitle: 'Inquires about operating hours',
    prompt: 'Aapka official office timing kab se kab tak rehta hai?',
    category: 'Office Timings',
  },
  {
    title: 'Plan: Gold Plan',
    subtitle: 'Verifies package selected',
    prompt: 'Mera Gold Plan package activate hua tha.',
    category: 'Verification',
  },
  {
    title: 'Plan: Silver Plan',
    subtitle: 'Verifies Silver tier',
    prompt: 'Mera Silver Plan package activate hai.',
    category: 'Verification',
  },
  {
    title: 'Plan: Platinum Plan',
    subtitle: 'Verifies VIP Platinum tier',
    prompt: 'Mera Platinum VIP package activate hai.',
    category: 'Verification',
  },
  {
    title: 'Sales Promises vs. Reality',
    subtitle: 'Did sales team lie about high sales?',
    prompt: 'Sales executive ne toh mujhe bola tha ki daily thousands ki sales aayegi! Unhone jhoot bola tha kya?',
    category: 'Objection',
  },
  {
    title: 'Turn Ad OFF Now!',
    subtitle: 'Demands stopping ad immediately',
    prompt: 'Mera ad chal raha hai par sales nahi aa rahi, ad abhi turant OFF kar do!',
    category: 'Testing Window',
  },
  {
    title: 'Backup Plan Execution',
    subtitle: 'How does winning product copy-paste work?',
    prompt: 'Agar 2 din baad bhi sales slow rahi toh Backup Plan kaise kaam karega? Winning product copy-paste kaise hoga?',
    category: 'Solution',
  },
  {
    title: 'Offline Phone Number?',
    subtitle: 'Why is executive number offline?',
    prompt: 'Mera phone disconnect hone ke baad personal number offline kyu batata hai?',
    category: 'Policy',
  },
  {
    title: 'Ad Updates & Spend Report',
    subtitle: 'Where to check ad reports?',
    prompt: 'Ad ka regular update aur spend report kahan milta hai?',
    category: 'Reporting',
  },
  {
    title: 'Demand Instant Refund',
    subtitle: 'Cancel and refund full payment',
    prompt: 'Mujhe aage kaam nahi karna, mera saara paisa refund kar do abhi!',
    category: 'Dispute',
  },
  {
    title: 'Shouting / Abuse Warning 1',
    subtitle: 'First policy warning trigger',
    prompt: 'Tum sab fraud ho! Ekdum bekaar service hai!',
    category: 'Policy Warning',
  },
  {
    title: 'Shouting / Abuse Warning 2',
    subtitle: 'Call termination & escalation trigger',
    prompt: 'Faltu bakwas band karo, main sabko sabak sikhaunga!',
    category: 'Call Termination',
  },
];

export const IPhoneCallInterface: React.FC<IPhoneCallInterfaceProps> = ({
  connectionState,
  audioState,
  transcripts,
  isMuted,
  userVolume,
  geminiVolume,
  selectedPlan,
  onSelectPlan,
  onToggleConnection,
  onToggleMute,
  onSendPrompt,
  onPlayGreeting,
  onReplayAudio,
  selectedVoice,
  onSelectVoice,
}) => {
  const [callDuration, setCallDuration] = useState<number>(0);
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'keypad' | 'scenarios' | 'captions' | 'plans'>('none');
  const [dialedDigits, setDialedDigits] = useState<string>('');
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('9:41');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const captionsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll captions
  useEffect(() => {
    if (activeDrawer === 'captions' && captionsEndRef.current) {
      captionsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts, activeDrawer]);

  // Current clock time simulation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (connectionState === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [connectionState]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleKeypadPress = (digit: string) => {
    playDtmfTone(digit);
    setDialedDigits((prev) => (prev + digit).slice(-15));
  };

  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';
  const isSpeaking = audioState === 'speaking' || geminiVolume > 0.05;
  const isListening = audioState === 'listening' || userVolume > 0.05;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-900/20 via-blue-900/15 to-teal-900/20 rounded-full blur-[120px]" />
      </div>

      {/* Top Floating Utility Bar */}
      <div className="w-full max-w-[420px] flex items-center justify-between text-xs text-slate-400 mb-2 px-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-200">Venture Infotech Support 24</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPlayGreeting()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 transition-colors text-[11px] font-semibold"
            title="Hear Isha's natural opening greeting"
          >
            <span>🔊 Greet Aloud</span>
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Toggle compact / full view"
          >
            {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* iPhone 16 Pro Chassis Frame */}
      <div
        className={`relative w-full max-w-[420px] transition-all duration-300 rounded-[50px] p-3 shadow-2xl ${
          isFullScreen ? 'max-w-[480px]' : 'max-w-[410px]'
        }`}
        style={{
          background: 'linear-gradient(145deg, #2b313d, #14171f, #0d0f14)',
          boxShadow: '0 25px 70px -10px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(255,255,255,0.12)',
        }}
      >
        {/* Hardware side button accents */}
        <div className="absolute -left-[5px] top-28 w-[3px] h-10 bg-slate-700/80 rounded-l" />
        <div className="absolute -left-[5px] top-42 w-[3px] h-12 bg-slate-700/80 rounded-l" />
        <div className="absolute -left-[5px] top-58 w-[3px] h-12 bg-slate-700/80 rounded-l" />
        <div className="absolute -right-[5px] top-36 w-[3px] h-16 bg-slate-700/80 rounded-r" />

        {/* iPhone Inner Screen (OLED Retina Canvas) */}
        <div className="relative w-full aspect-[9/19.5] min-h-[720px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-[44px] overflow-hidden flex flex-col justify-between text-white border border-white/5">
          {/* Subtle iOS In-Call Glass Glow Wallpaper */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-br from-cyan-600/10 via-blue-600/10 to-teal-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-600/5 rounded-full blur-3xl" />
          </div>

          {/* iOS Top Status Bar & Dynamic Island */}
          <div className="relative z-20 pt-3 px-6 flex items-center justify-between">
            {/* Clock */}
            <span className="text-xs font-semibold tracking-tight text-slate-100 font-sans pl-1">
              {currentTime}
            </span>

            {/* Dynamic Island */}
            <div
              className={`transition-all duration-300 bg-black rounded-full flex items-center justify-between px-3 py-1 shadow-md border border-white/10 ${
                isConnected ? 'w-36 h-7' : 'w-24 h-6'
              }`}
            >
              {isConnected ? (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-mono text-emerald-300 font-bold">
                      {formatTimer(callDuration)}
                    </span>
                  </div>
                  {/* Dynamic waveform indicator */}
                  <div className="flex items-center gap-0.5 h-3">
                    <span
                      className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, Math.min(12, isSpeaking ? geminiVolume * 24 : isListening ? userVolume * 20 : 4))}px` }}
                    />
                    <span
                      className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(6, Math.min(12, isSpeaking ? geminiVolume * 30 : isListening ? userVolume * 25 : 6))}px` }}
                    />
                    <span
                      className="w-0.5 bg-emerald-400 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(4, Math.min(12, isSpeaking ? geminiVolume * 20 : isListening ? userVolume * 18 : 4))}px` }}
                    />
                  </div>
                  <Phone className="w-2.5 h-2.5 text-emerald-400 fill-emerald-400" />
                </>
              ) : (
                <div className="w-full flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700" />
                </div>
              )}
            </div>

            {/* Cellular, WiFi, Battery Icons */}
            <div className="flex items-center gap-1.5 text-slate-200 pr-1">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.3c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.7-1.7C9.07 20.26 10.97 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
              </svg>
              <div className="flex items-center gap-0.5">
                <div className="w-0.5 h-1.5 bg-white rounded-full" />
                <div className="w-0.5 h-2.5 bg-white rounded-full" />
                <div className="w-0.5 h-3.5 bg-white rounded-full" />
                <div className="w-0.5 h-3.5 bg-white/40 rounded-full" />
              </div>
              <div className="w-5 h-2.5 border border-white/80 rounded-sm p-[1px] flex items-center">
                <div className="h-full w-4 bg-white rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Center Call Stage */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-2">
            {/* Contact Avatar with Interactive Human Audio Pulse */}
            <div className="relative mb-5 flex items-center justify-center">
              {/* Pulsing audio rings */}
              {isConnected && (
                <>
                  <div
                    className={`absolute rounded-full transition-all duration-300 pointer-events-none ${
                      isSpeaking
                        ? 'w-48 h-48 border border-cyan-400/40 bg-cyan-500/10 scale-110'
                        : isListening
                        ? 'w-44 h-44 border border-emerald-400/40 bg-emerald-500/10 scale-105'
                        : 'w-36 h-36 border border-white/5 opacity-50'
                    }`}
                  />
                  <div
                    className={`absolute rounded-full transition-all duration-200 pointer-events-none ${
                      isSpeaking
                        ? 'w-40 h-40 border border-teal-300/60 bg-teal-400/10 scale-105'
                        : isListening
                        ? 'w-36 h-36 border border-emerald-300/60'
                        : 'w-32 h-32 opacity-0'
                    }`}
                  />
                </>
              )}

              {/* Official Venture Logo (Green & Yellow 3D Ribbon S Logo) */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden p-3 bg-gradient-to-b from-white/20 via-slate-900 to-black shadow-2xl border border-emerald-400/40 flex items-center justify-center">
                <img
                  src={VENTURE_LOGO_URL}
                  alt="Venture Infotech Official Brand Logo"
                  className="w-full h-full object-contain filter drop-shadow-lg"
                  onError={(e) => {
                    // Fallback to local copy if needed
                    (e.target as HTMLImageElement).src = '/venture_logo.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none rounded-full" />
              </div>

              {/* Verified Executive Badge */}
              <div className="absolute -bottom-1 bg-slate-900/90 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1 shadow-md">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Executive Isha</span>
              </div>
            </div>

            {/* Caller Header Information */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold tracking-tight text-white mb-0.5">
                Venture Support 24
              </h2>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                +91 1800-VENTURE-24 • Office: 11 AM - 6:30 PM
              </p>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-xs">
                {isConnected ? (
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connected • {formatTimer(callDuration)}
                  </span>
                ) : isConnecting ? (
                  <span className="font-medium text-amber-300 animate-pulse">
                    Calling Venture Support...
                  </span>
                ) : (
                  <span className="text-slate-400">
                    24/7 Support IVR • Ready to Connect
                  </span>
                )}
              </div>
            </div>

            {/* Verified Plan & Real-time State Pills */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveDrawer('plans')}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 transition-colors text-slate-200"
              >
                <Layers className="w-3 h-3 text-cyan-400" />
                <span>Plan: <strong>{selectedPlan}</strong></span>
              </button>

              <button
                onClick={() => setActiveDrawer('scenarios')}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/30 transition-colors text-cyan-300 font-semibold"
              >
                <Sparkles className="w-3 h-3" />
                <span>Customer Queries</span>
              </button>
            </div>

            {/* Dynamic Sound Wave Indicator */}
            {isConnected && (
              <div className="flex items-center gap-1 h-6 px-4 py-1 rounded-full bg-slate-950/60 border border-white/5 mb-3">
                <span className="text-[10px] text-slate-400 mr-1">
                  {isSpeaking ? 'Isha speaking' : isListening ? 'Listening to you' : 'In Call'}
                </span>
                {[0.4, 0.8, 1.2, 0.6, 1.0, 0.5, 0.9].map((multiplier, idx) => {
                  const vol = isSpeaking ? geminiVolume : isListening ? userVolume : 0.05;
                  const height = Math.max(3, Math.min(16, vol * 25 * multiplier));
                  return (
                    <span
                      key={idx}
                      className={`w-0.5 rounded-full transition-all duration-75 ${
                        isSpeaking ? 'bg-cyan-400' : isListening ? 'bg-emerald-400' : 'bg-slate-600'
                      }`}
                      style={{ height: `${height}px` }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom Call Controls & Action Grid */}
          <div className="relative z-20 px-6 pb-8 pt-2">
            {isConnected || isConnecting ? (
              <>
                {/* Authentic iOS 6-Button In-Call Grid */}
                <div className="grid grid-cols-3 gap-y-4 gap-x-6 max-w-[280px] mx-auto mb-6">
                  {/* Button 1: Mute */}
                  <button
                    onClick={onToggleMute}
                    className="flex flex-col items-center gap-1 group"
                    title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                        isMuted
                          ? 'bg-white text-slate-950'
                          : 'bg-white/15 hover:bg-white/20 text-white backdrop-blur-md'
                      }`}
                    >
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">
                      {isMuted ? 'unmute' : 'mute'}
                    </span>
                  </button>

                  {/* Button 2: Keypad */}
                  <button
                    onClick={() => setActiveDrawer(activeDrawer === 'keypad' ? 'none' : 'keypad')}
                    className="flex flex-col items-center gap-1 group"
                    title="Open Keypad"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                        activeDrawer === 'keypad'
                          ? 'bg-white text-slate-950'
                          : 'bg-white/15 hover:bg-white/20 text-white backdrop-blur-md'
                      }`}
                    >
                      <Grid className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">keypad</span>
                  </button>

                  {/* Button 3: Speaker Audio */}
                  <button
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className="flex flex-col items-center gap-1 group"
                    title="Toggle Speaker"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                        isSpeakerOn
                          ? 'bg-white text-slate-950'
                          : 'bg-white/15 hover:bg-white/20 text-white backdrop-blur-md'
                      }`}
                    >
                      {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">speaker</span>
                  </button>

                  {/* Button 4: Captions (Live Subtitles) */}
                  <button
                    onClick={() => setActiveDrawer(activeDrawer === 'captions' ? 'none' : 'captions')}
                    className="flex flex-col items-center gap-1 group"
                    title="View live call transcript"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                        activeDrawer === 'captions'
                          ? 'bg-cyan-400 text-slate-950 font-bold'
                          : 'bg-white/15 hover:bg-white/20 text-white backdrop-blur-md'
                      }`}
                    >
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">captions</span>
                  </button>

                  {/* Button 5: Customer Queries Drawer */}
                  <button
                    onClick={() => setActiveDrawer(activeDrawer === 'scenarios' ? 'none' : 'scenarios')}
                    className="flex flex-col items-center gap-1 group"
                    title="Quick Customer Queries & Complaints"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-md ${
                        activeDrawer === 'scenarios'
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-white/15 hover:bg-white/20 text-white backdrop-blur-md'
                      }`}
                    >
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">queries</span>
                  </button>

                  {/* Button 6: Voice Selection */}
                  <button
                    onClick={() => {
                      const nextVoice = selectedVoice === 'Kore' ? 'Aoede' : selectedVoice === 'Aoede' ? 'Zephyr' : 'Kore';
                      onSelectVoice(nextVoice);
                    }}
                    className="flex flex-col items-center gap-1 group"
                    title={`Current Voice: ${selectedVoice}. Click to switch voice`}
                  >
                    <div className="w-14 h-14 rounded-full bg-white/15 hover:bg-white/20 text-white flex items-center justify-center transition-all backdrop-blur-md shadow-md">
                      <Radio className="w-6 h-6 text-cyan-300" />
                    </div>
                    <span className="text-[11px] font-medium text-slate-300">voice: {selectedVoice}</span>
                  </button>
                </div>

                {/* Big Red End Call Button */}
                <div className="flex justify-center">
                  <button
                    onClick={onToggleConnection}
                    className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-red-600/40 transition-all border border-red-400/40"
                    title="End Call"
                  >
                    <PhoneOff className="w-7 h-7" />
                  </button>
                </div>
              </>
            ) : (
              /* Idle / Dial Call Mode */
              <div className="flex flex-col items-center gap-4">
                <div className="text-center text-xs text-slate-400 mb-1">
                  Tap below to start live voice call with Executive Isha
                </div>

                {/* Big Green Dial Call Button */}
                <button
                  onClick={onToggleConnection}
                  className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 transition-all border border-emerald-300/40 animate-pulse"
                  title="Call Venture Support"
                >
                  <Phone className="w-7 h-7 fill-current" />
                </button>
                <span className="text-xs font-semibold text-slate-300">Call Support Line</span>
              </div>
            )}

            {/* Bottom iOS Home Indicator Bar */}
            <div className="w-32 h-1 bg-white/40 rounded-full mx-auto mt-6" />
          </div>

          {/* Drawer 1: Authentic iOS Keypad Modal */}
          {activeDrawer === 'keypad' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-30 flex flex-col justify-between p-6 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pt-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Keypad / Tone Dialer
                </span>
                <button
                  onClick={() => setActiveDrawer('none')}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Display dialed numbers */}
              <div className="text-center py-4">
                <div className="text-2xl font-light font-mono tracking-widest text-white min-h-[36px]">
                  {dialedDigits || 'Dial DTMF'}
                </div>
              </div>

              {/* 12-Key iOS Dialpad */}
              <div className="grid grid-cols-3 gap-4 max-w-[260px] mx-auto mb-4">
                {[
                  { digit: '1', letters: '' },
                  { digit: '2', letters: 'ABC' },
                  { digit: '3', letters: 'DEF' },
                  { digit: '4', letters: 'GHI' },
                  { digit: '5', letters: 'JKL' },
                  { digit: '6', letters: 'MNO' },
                  { digit: '7', letters: 'PQRS' },
                  { digit: '8', letters: 'TUV' },
                  { digit: '9', letters: 'WXYZ' },
                  { digit: '*', letters: '' },
                  { digit: '0', letters: '+' },
                  { digit: '#', letters: '' },
                ].map((item) => (
                  <button
                    key={item.digit}
                    onClick={() => handleKeypadPress(item.digit)}
                    className="w-16 h-16 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/40 text-white flex flex-col items-center justify-center transition-all shadow-md"
                  >
                    <span className="text-2xl font-light leading-none">{item.digit}</span>
                    {item.letters && (
                      <span className="text-[9px] text-slate-400 font-bold tracking-widest mt-0.5">
                        {item.letters}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-center pb-4">
                <button
                  onClick={() => setActiveDrawer('none')}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 py-2 px-4 rounded-full bg-white/10"
                >
                  Hide Keypad
                </button>
              </div>
            </div>
          )}

          {/* Drawer 2: Customer Queries & Complaint Prompts */}
          {activeDrawer === 'scenarios' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-30 flex flex-col justify-between p-5 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pt-6 border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Customer Query Prompts
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tap to feed speech query directly to Isha:
                  </p>
                </div>
                <button
                  onClick={() => setActiveDrawer('none')}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* List of prompts */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1 custom-scrollbar">
                {QUICK_CUSTOMER_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSendPrompt(item.prompt);
                      setActiveDrawer('captions'); // switch to live captions so caller sees response
                    }}
                    className="w-full text-left p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 transition-all group flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                        {item.title}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-medium">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-medium line-clamp-2">
                      "{item.prompt}"
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={() => setActiveDrawer('none')}
                  className="text-xs font-semibold text-slate-400 hover:text-white py-1 px-4"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Drawer 3: Live Subtitles & Captions */}
          {activeDrawer === 'captions' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-30 flex flex-col justify-between p-5 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pt-6 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Live Call Subtitles</h3>
                    <p className="text-[10px] text-slate-400">Real-time speech transcription</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveDrawer('none')}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Transcript list */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 custom-scrollbar">
                {transcripts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    No speech recorded yet. Speak into your microphone or tap a query prompt.
                  </div>
                ) : (
                  transcripts.map((t) => {
                    const isIsha = t.sender === 'gemini';
                    return (
                      <div
                        key={t.id}
                        className={`flex flex-col ${isIsha ? 'items-start' : 'items-end'}`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                          {isIsha ? 'Isha (Support Executive)' : 'You (Caller)'}
                        </span>
                        <div
                          className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                            isIsha
                              ? 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700'
                              : 'bg-cyan-600 text-white rounded-tr-sm'
                          }`}
                        >
                          <p>{t.text}</p>
                          {isIsha && (
                            <button
                              onClick={() => onReplayAudio(t.text)}
                              className="mt-1.5 flex items-center gap-1 text-[10px] text-cyan-300 hover:text-cyan-200 opacity-80 hover:opacity-100"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>Replay Voice</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={captionsEndRef} />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <button
                  onClick={() => setActiveDrawer('scenarios')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  + Add Query Prompt
                </button>
                <button
                  onClick={() => setActiveDrawer('none')}
                  className="text-xs text-slate-400 hover:text-white font-medium"
                >
                  Minimize
                </button>
              </div>
            </div>
          )}

          {/* Drawer 4: Verified Plan Selection */}
          {activeDrawer === 'plans' && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl z-30 flex flex-col justify-between p-6 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pt-6 border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Select Verified Plan
                </h3>
                <button
                  onClick={() => setActiveDrawer('none')}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-6 space-y-3">
                {[
                  {
                    name: 'Gold Plan',
                    description: 'Most popular growth tier • 48-hr testing window & winning product backup',
                    color: 'border-amber-500/40 bg-amber-950/30 text-amber-200',
                  },
                  {
                    name: 'Silver Plan',
                    description: 'Standard starter package • Standard support & ad testing',
                    color: 'border-slate-500/40 bg-slate-900/50 text-slate-200',
                  },
                  {
                    name: 'Platinum Plan',
                    description: 'VIP High-Volume Store tier • Dedicated priority winning product imports',
                    color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-200',
                  },
                ].map((plan) => (
                  <button
                    key={plan.name}
                    onClick={() => {
                      onSelectPlan(plan.name);
                      setActiveDrawer('none');
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all ${plan.color} ${
                      selectedPlan === plan.name ? 'ring-2 ring-white/50 shadow-lg' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{plan.name}</span>
                      {selectedPlan === plan.name && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <p className="text-[11px] opacity-80">{plan.description}</p>
                  </button>
                ))}
              </div>

              <div className="text-center pb-4">
                <button
                  onClick={() => setActiveDrawer('none')}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
