import React from 'react';
import { CompanionSettings, SessionStats, VoiceName } from '../types';
import { VOICE_OPTIONS } from '../lib/constants';
import { X, Sliders, Trash2, Clock, MessageSquare, AlertCircle, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: CompanionSettings;
  stats: SessionStats;
  onClose: () => void;
  onSaveSettings: (newSettings: CompanionSettings) => void;
  onClearTranscripts: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  stats,
  onClose,
  onSaveSettings,
  onClearTranscripts,
}) => {
  const [localSettings, setLocalSettings] = React.useState<CompanionSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold">Companion Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Gemini 3.1 Voice Tone
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {VOICE_OPTIONS.map((v) => {
              const isSelected = localSettings.voice === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setLocalSettings({ ...localSettings, voice: v.id })}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-sm font-bold">{v.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{v.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom System Instruction */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Custom System Instructions / Prompt
          </label>
          <textarea
            rows={3}
            value={localSettings.customSystemInstruction}
            onChange={(e) =>
              setLocalSettings({ ...localSettings, customSystemInstruction: e.target.value })
            }
            placeholder="Instruct Gemini how to speak or behave (e.g. Speak in Spanish, act as a career advisor)..."
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80 transition"
          />
        </div>

        {/* Auto Scroll */}
        <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-2xl">
          <div>
            <div className="text-sm font-semibold text-slate-200">Auto-Scroll Transcript</div>
            <div className="text-xs text-slate-400">Keep latest speech transcript visible</div>
          </div>
          <input
            type="checkbox"
            checked={localSettings.autoScroll}
            onChange={(e) =>
              setLocalSettings({ ...localSettings, autoScroll: e.target.checked })
            }
            className="w-5 h-5 accent-cyan-500 cursor-pointer rounded"
          />
        </div>

        {/* Session Stats */}
        <div className="p-4 bg-slate-950/80 border border-slate-800/90 rounded-2xl space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Live Session Stats
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <Clock className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
              <div className="text-xs text-slate-400">Duration</div>
              <div className="text-sm font-bold text-white">{formatTime(stats.durationSeconds)}</div>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <MessageSquare className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
              <div className="text-xs text-slate-400">Speech Turns</div>
              <div className="text-sm font-bold text-white">
                {stats.userTurns + stats.geminiTurns}
              </div>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
              <AlertCircle className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-xs text-slate-400">Interruptions</div>
              <div className="text-sm font-bold text-white">{stats.interruptionCount}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onClearTranscripts}
            className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Transcripts</span>
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
