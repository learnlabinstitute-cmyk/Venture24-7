import React, { useEffect, useRef } from 'react';
import { Camera, X, RefreshCw } from 'lucide-react';

interface CameraPreviewProps {
  isActive: boolean;
  onClose: () => void;
  onFrameCaptured: (base64Jpeg: string) => void;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  isActive,
  onClose,
  onFrameCaptured,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isActive) return;

    let intervalId: NodeJS.Timeout;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Capture frame at 1 FPS (1000ms)
        intervalId = setInterval(() => {
          if (!videoRef.current || !canvasRef.current) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx || video.videoWidth === 0) return;

          canvas.width = 320;
          canvas.height = 240;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Get base64 JPEG without prefix header
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          const base64Jpeg = dataUrl.split(',')[1];
          if (base64Jpeg) {
            onFrameCaptured(base64Jpeg);
          }
        }, 1000);
      } catch (err) {
        console.error('Failed to access webcam:', err);
      }
    };

    startCamera();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isActive, onFrameCaptured]);

  if (!isActive) return null;

  return (
    <div className="fixed bottom-24 right-6 z-40 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3 shadow-2xl backdrop-blur-xl w-64 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Camera className="w-4 h-4 animate-pulse" />
          <span>Gemini Vision Live (1 FPS)</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-black aspect-video border border-slate-800">
        <video
          ref={videoRef}
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
          Live feed to Gemini
        </div>
      </div>
    </div>
  );
};
