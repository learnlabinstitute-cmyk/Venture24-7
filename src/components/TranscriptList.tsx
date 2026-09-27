import React, { useEffect, useRef } from 'react';
import { TranscriptEntry } from '../types';
import { Volume2, Copy, Check, User, Bot, Sparkles } from 'lucide-react';

interface TranscriptListProps {
  transcripts: TranscriptEntry[];
  autoScroll: boolean;
  onReplayAudio?: (text: string) => void;
}

export const TranscriptList: React.FC<TranscriptListProps> = ({
  transcripts,
  autoScroll,
  onReplayAudio,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts, autoScroll]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (transcripts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-slate-800/80 my-4 min-h-[160px]">
        <Sparkles className="w-8 h-8 text-cyan-400/70 mb-2 animate-pulse" />
        <p className="text-sm font-medium text-slate-300">IVR Line Ready: 1800-VENTURE-24</p>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Connect call or click any prompt above to talk with Executive Isha. Real-time audio dialogue and transcripts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 max-h-[380px] sm:max-h-[440px] custom-scrollbar my-4"
    >
      {transcripts.map((item) => {
        const isUser = item.sender === 'user';
        return (
          <div
            key={item.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl text-sm transition-all ${
              isUser
                ? 'bg-indigo-950/40 border border-indigo-800/50 text-indigo-100 ml-6 sm:ml-12'
                : 'bg-slate-800/60 border border-slate-700/60 text-slate-100 mr-6 sm:mr-12'
            }`}
          >
            {/* Avatar Badge */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                isUser
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/30'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-400">
                  {isUser ? 'Customer (Caller)' : 'Isha (Support Executive)'}
                  {item.isPartial && (
                    <span className="ml-2 text-[10px] text-amber-400 font-normal animate-pulse">
                      (speaking...)
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>

              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap break-words font-sans">
                {item.text}
              </p>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-800/60 text-slate-400">
                <button
                  onClick={() => handleCopy(item.id, item.text)}
                  className="p-1 hover:text-slate-200 hover:bg-slate-700/50 rounded transition flex items-center gap-1 text-[11px]"
                  title="Copy transcript"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {!isUser && onReplayAudio && (
                  <button
                    onClick={() => onReplayAudio(item.text)}
                    className="p-1 hover:text-cyan-300 hover:bg-cyan-900/30 rounded transition flex items-center gap-1 text-[11px]"
                    title="Replay with TTS voice"
                  >
                    <Volume2 className="w-3 h-3 text-cyan-400" />
                    <span>Replay Audio</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
