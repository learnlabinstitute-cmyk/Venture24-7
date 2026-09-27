import React, { useEffect, useRef } from 'react';
import { AudioState, ConnectionState } from '../types';

interface AudioOrbProps {
  connectionState: ConnectionState;
  audioState: AudioState;
  userVolume: number;
  geminiVolume: number;
  voiceName: string;
}

export const AudioOrb: React.FC<AudioOrbProps> = ({
  connectionState,
  audioState,
  userVolume,
  geminiVolume,
  voiceName,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 80;

      // Determine active volume and color theme based on state
      const isListening = audioState === 'listening';
      const isSpeaking = audioState === 'speaking';
      const isThinking = audioState === 'thinking';
      const isConnected = connectionState === 'connected';

      const volume = isSpeaking ? geminiVolume : isListening ? userVolume : 0.05;
      const radius = baseRadius + volume * 45;

      phase += 0.04;

      // Outer Glow Rings
      if (isConnected) {
        const glowRadius = radius + Math.sin(phase) * 8 + (isSpeaking ? 20 : 5);
        const glowGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          radius * 0.5,
          centerX,
          centerY,
          glowRadius * 1.6
        );

        if (isSpeaking) {
          // Gemini speaking: Emerald / Cyan vibrant glow
          glowGradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
          glowGradient.addColorStop(0.6, 'rgba(6, 182, 212, 0.2)');
          glowGradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
        } else if (isListening) {
          // User speaking: Indigo / Violet vibrant glow
          glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
          glowGradient.addColorStop(0.6, 'rgba(168, 85, 247, 0.2)');
          glowGradient.addColorStop(1, 'rgba(168, 85, 247, 0)');
        } else if (isThinking) {
          // Thinking: Amber glow
          glowGradient.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
          glowGradient.addColorStop(0.6, 'rgba(251, 191, 36, 0.2)');
          glowGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
        } else {
          // Idle connected: Subtle Cyan / Blue glow
          glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
          glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        }

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, glowRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Main Liquid Orb with sine-wave deformation
      ctx.beginPath();
      const points = 64;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        // Wavy displacement
        const distortionFactor = isSpeaking ? 12 : isListening ? 8 : isThinking ? 15 : 4;
        const wave1 = Math.sin(angle * 4 + phase) * distortionFactor * (volume + 0.2);
        const wave2 = Math.cos(angle * 6 - phase * 1.5) * (distortionFactor * 0.5);
        const r = radius + wave1 + wave2;

        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();

      // Main Gradient Fill
      const mainGradient = ctx.createLinearGradient(
        centerX - radius,
        centerY - radius,
        centerX + radius,
        centerY + radius
      );

      if (!isConnected) {
        mainGradient.addColorStop(0, '#4b5563');
        mainGradient.addColorStop(1, '#1f2937');
      } else if (isSpeaking) {
        mainGradient.addColorStop(0, '#10b981');
        mainGradient.addColorStop(0.5, '#06b6d4');
        mainGradient.addColorStop(1, '#3b82f6');
      } else if (isListening) {
        mainGradient.addColorStop(0, '#6366f1');
        mainGradient.addColorStop(0.5, '#8b5cf6');
        mainGradient.addColorStop(1, '#ec4899');
      } else if (isThinking) {
        mainGradient.addColorStop(0, '#f59e0b');
        mainGradient.addColorStop(0.5, '#f59e0b');
        mainGradient.addColorStop(1, '#ef4444');
      } else {
        mainGradient.addColorStop(0, '#3b82f6');
        mainGradient.addColorStop(1, '#1d4ed8');
      }

      ctx.fillStyle = mainGradient;
      ctx.shadowColor = isConnected ? '#06b6d4' : '#1f2937';
      ctx.shadowBlur = isConnected ? 15 : 5;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner Highlight Ring
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [connectionState, audioState, userVolume, geminiVolume]);

  return (
    <div className="relative flex flex-col items-center justify-center my-4">
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="w-64 h-64 sm:w-72 sm:h-72 drop-shadow-2xl transition-all duration-300"
      />

      {/* State Label & Voice Indicator Badge */}
      <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
        <div className="text-xs font-semibold tracking-wider uppercase text-slate-300/80 mb-0.5">
          {connectionState === 'disconnected' && 'Tap Call to Connect IVR'}
          {connectionState === 'connecting' && 'Dialing IVR Line...'}
          {connectionState === 'connected' && (
            <>
              {audioState === 'speaking' && 'Isha Speaking (IVR Live)'}
              {audioState === 'listening' && 'Listening to Customer'}
              {audioState === 'thinking' && 'Processing IVR Query...'}
              {audioState === 'idle' && 'Isha Ready (Line Open)'}
            </>
          )}
        </div>
        <div className="text-sm font-bold text-white drop-shadow">
          Executive: <span className="text-cyan-400">Isha</span>
        </div>
      </div>
    </div>
  );
};
