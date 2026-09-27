import React from 'react';
import { ConnectionState, VoiceName, PersonalityPreset } from '../types';
import { VOICE_OPTIONS, PERSONALITY_PRESETS } from '../lib/constants';
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Settings,
  Sparkles,
  Volume2,
  Radio,
  Hand,
} from 'lucide-react';

interface VoiceControlsProps {
  connectionState: ConnectionState;
  isMuted: boolean;
  isCameraActive: boolean;
  selectedVoice: VoiceName;
  selectedPersonalityId: string;
  isPushToTalkActive: boolean;
  onToggleConnection: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onSelectVoice: (voice: VoiceName) => void;
  onSelectPersonality: (preset: PersonalityPreset) => void;
  onOpenSettings: () => void;
  onPushToTalkStart: () => void;
  onPushToTalkEnd: () => void;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  connectionState,
  isMuted,
  isCameraActive,
  selectedVoice,
  selectedPersonalityId,
  isPushToTalkActive,
  onToggleConnection,
  onToggleMute,
  onToggleCamera,
  onSelectVoice,
  onSelectPersonality,
  onOpenSettings,
  onPushToTalkStart,
  onPushToTalkEnd,
}) => {
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';

  return (
    <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
      {/* Personality Presets Horizontal Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {PERSONALITY_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedPersonalityId;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPersonality(preset)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 font-semibold'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>{preset.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Action Bar */}
      <div className="flex items-center justify-between gap-2 p-3 bg-slate-900/90 rounded-2xl border border-slate-800/90 shadow-2xl backdrop-blur-xl">
        {/* Voice Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-700/60">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedVoice}
              onChange={(e) => onSelectVoice(e.target.value as VoiceName)}
              disabled={isConnected}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer disabled:opacity-60"
            >
              {VOICE_OPTIONS.map((v) => (
                <option key={v.id} value={v.id} className="bg-slate-900 text-slate-100">
                  {v.name} ({v.tone})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Core Buttons */}
        <div className="flex items-center gap-3">
          {/* Mute Mic Toggle */}
          <button
            onClick={onToggleMute}
            disabled={!isConnected}
            className={`p-3 rounded-2xl transition-all flex items-center justify-center ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-lg shadow-rose-500/10'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700/80'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Main Call Connect / End Button */}
          <button
            onClick={onToggleConnection}
            disabled={isConnecting}
            className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 shadow-xl ${
              isConnected
                ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-500 hover:to-red-500 shadow-rose-600/30 ring-2 ring-rose-500/30'
                : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 hover:brightness-110 shadow-cyan-500/30 ring-2 ring-cyan-400/30'
            }`}
          >
            {isConnected ? (
              <>
                <PhoneOff className="w-5 h-5" />
                <span>Disconnect Call</span>
              </>
            ) : isConnecting ? (
              <>
                <Radio className="w-5 h-5 animate-spin" />
                <span>Dialing IVR...</span>
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                <span>Dial IVR Line (1800-VENTURE-24)</span>
              </>
            )}
          </button>

          {/* Camera / Vision Toggle */}
          <button
            onClick={onToggleCamera}
            disabled={!isConnected}
            className={`p-3 rounded-2xl transition-all flex items-center justify-center ${
              isCameraActive
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700/80'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            title={isCameraActive ? 'Turn Off Vision' : 'Turn On Vision'}
          >
            {isCameraActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            className="p-3 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-2xl border border-slate-700/80 transition-all"
            title="IVR Audio Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Alternative Tap & Hold / Push-To-Talk Button for easy speech trigger */}
      {!isConnected && (
        <div className="flex flex-col items-center gap-1 mt-1">
          <button
            onMouseDown={onPushToTalkStart}
            onMouseUp={onPushToTalkEnd}
            onTouchStart={onPushToTalkStart}
            onTouchEnd={onPushToTalkEnd}
            className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
              isPushToTalkActive
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 animate-pulse'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/80 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Hand className="w-4 h-4 text-cyan-400" />
            <span>
              {isPushToTalkActive ? 'Listening to voice... Release to send to Isha' : 'Hold to Speak (Turn-Based Push-to-Talk with Isha)'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
