import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ConnectionState,
  AudioState,
  TranscriptEntry,
  CompanionSettings,
  VoiceName,
  VenturePlanType,
} from './types';
import {
  VENTURE_INFOTECH_SYSTEM_INSTRUCTION,
} from './lib/constants';
import { GeminiAudioPlayer, MicRecorder, speakWithWebSpeech, playPhoneRingTone } from './lib/audio-utils';
import {
  saveConversationToDB,
  saveTicketToDB,
} from './lib/indexeddb';
import { IPhoneCallInterface } from './components/IPhoneCallInterface';

export default function App() {
  // Session ID for current active phone call
  const [activeSessionId, setActiveSessionId] = useState<string>(() => `call-${Date.now()}`);

  // Selected Verified Plan
  const [selectedPlan, setSelectedPlan] = useState<VenturePlanType>('Gold Plan');

  // Connection & Audio states
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [audioState, setAudioState] = useState<AudioState>('idle');
  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [userVolume, setUserVolume] = useState<number>(0);
  const [geminiVolume, setGeminiVolume] = useState<number>(0);

  // Settings
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');

  // Pre-fetched natural human greeting audio buffer
  const cachedGreetingAudioRef = useRef<{ audioBase64: string; mimeType: string } | null>(null);

  // Audio / Hardware references
  const wsRef = useRef<WebSocket | null>(null);
  const playerRef = useRef<GeminiAudioPlayer | null>(null);
  const recorderRef = useRef<MicRecorder | null>(null);
  const ringStopFnRef = useRef<(() => void) | null>(null);

  const transcriptsRef = useRef<TranscriptEntry[]>(transcripts);
  transcriptsRef.current = transcripts;

  const isMutedRef = useRef<boolean>(isMuted);
  isMutedRef.current = isMuted;

  const currentModelTranscriptIdRef = useRef<string | null>(null);
  const currentUserTranscriptIdRef = useRef<string | null>(null);

  // Prefetch natural human opening greeting audio on mount so it's ready instantly when caller dials
  useEffect(() => {
    const prefetchGreeting = async () => {
      try {
        const res = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: 'Welcome to Venture Support! Main Isha baat kar rahi hoon. Aapko kis cheez mein issue aa raha hai, please batayein?',
            voice: selectedVoice,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.audioBase64) {
            cachedGreetingAudioRef.current = {
              audioBase64: data.audioBase64,
              mimeType: data.mimeType || 'audio/pcm;rate=24000',
            };
          }
        }
      } catch (err) {
        console.warn('Prefetch greeting notice:', err);
      }
    };
    prefetchGreeting();
  }, [selectedVoice]);

  // Helper to append or update transcript in real-time
  const appendOrUpdateTranscript = useCallback(
    (sender: 'user' | 'gemini', text: string, ref: React.MutableRefObject<string | null>) => {
      setTranscripts((prev) => {
        if (ref.current) {
          const index = prev.findIndex((t) => t.id === ref.current);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              text: updated[index].text + text,
            };
            return updated;
          }
        }
        const newId = `${sender}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        ref.current = newId;
        return [
          ...prev,
          {
            id: newId,
            sender,
            text,
            timestamp: new Date(),
            isPartial: true,
          },
        ];
      });
    },
    []
  );

  const finalizeTranscript = useCallback(
    (ref: React.MutableRefObject<string | null>) => {
      if (ref.current) {
        setTranscripts((prev) =>
          prev.map((t) => (t.id === ref.current ? { ...t, isPartial: false } : t))
        );
        ref.current = null;
      }
    },
    []
  );

  // Proactively speak Isha's human opening greeting
  const playOfficialGreeting = useCallback(async () => {
    const greetingText =
      'Welcome to Venture Support! Main Isha baat kar rahi hoon. Aapko kis cheez mein issue aa raha hai, please batayein?';

    // Ensure greeting is visible at the top of subtitles/transcripts
    setTranscripts((prev) => {
      const filtered = prev.filter((t) => !t.text.includes('Welcome to Venture Support'));
      return [
        {
          id: `greeting-${Date.now()}`,
          sender: 'gemini',
          text: greetingText,
          timestamp: new Date(),
          isPartial: false,
        },
        ...filtered,
      ];
    });

    setAudioState('speaking');

    if (!playerRef.current) {
      playerRef.current = new GeminiAudioPlayer(
        24000,
        (vol) => {
          setGeminiVolume(vol);
          setAudioState('speaking');
        },
        () => {
          setAudioState('idle');
          setGeminiVolume(0);
        }
      );
    }

    // 1. Play pre-fetched natural human AI audio instantly with zero latency
    if (cachedGreetingAudioRef.current?.audioBase64) {
      await playerRef.current.playAudioData(
        cachedGreetingAudioRef.current.audioBase64,
        cachedGreetingAudioRef.current.mimeType
      );
      return;
    }

    // 2. Fetch fresh natural AI audio from /api/speak
    try {
      const res = await fetch('/api/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: greetingText,
          voice: selectedVoice,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          cachedGreetingAudioRef.current = {
            audioBase64: data.audioBase64,
            mimeType: data.mimeType || 'audio/wav',
          };
          await playerRef.current.playAudioData(data.audioBase64, data.mimeType);
          return;
        }
      }
    } catch (e) {
      console.warn('Backend speak call notice:', e);
    }

    // Graceful fallback to browser speech synthesis if server is unreachable
    speakWithWebSpeech(
      greetingText,
      () => setAudioState('speaking'),
      () => setAudioState('idle')
    );
  }, [selectedVoice]);

  // Teardown / End Call
  const stopSession = useCallback(() => {
    if (ringStopFnRef.current) {
      ringStopFnRef.current();
      ringStopFnRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.stop();
      playerRef.current = null;
    }
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    setConnectionState('disconnected');
    setAudioState('idle');
    setUserVolume(0);
    setGeminiVolume(0);

    // Persist call session to IndexedDB in background
    const currentTranscripts = transcriptsRef.current;
    if (currentTranscripts && currentTranscripts.length > 0) {
      saveConversationToDB({
        id: activeSessionId,
        title: `IVR Call - ${new Date().toLocaleTimeString()} (${selectedPlan})`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        durationSeconds: 0,
        voiceName: selectedVoice,
        personalityId: 'isha-executive',
        callerPlan: selectedPlan,
        transcripts: currentTranscripts,
        stats: {
          durationSeconds: 0,
          userTurns: currentTranscripts.filter((t) => t.sender === 'user').length,
          geminiTurns: currentTranscripts.filter((t) => t.sender === 'gemini').length,
          interruptionCount: 0,
        },
      }).catch(console.warn);
    }
  }, [activeSessionId, selectedPlan, selectedVoice]);

  // Start Call: The natural voice speaks first immediately upon dialing!
  const startSession = useCallback(async () => {
    if (connectionState === 'connecting' || connectionState === 'connected') return;

    setConnectionState('connected');

    try {
      // 1. Initialize Audio Player immediately inside user gesture
      if (!playerRef.current) {
        playerRef.current = new GeminiAudioPlayer(
          24000,
          (vol) => {
            setGeminiVolume(vol);
            setAudioState('speaking');
          },
          () => {
            setAudioState('idle');
            setGeminiVolume(0);
            finalizeTranscript(currentModelTranscriptIdRef);
          }
        );
      }

      // Voice speaks first immediately with natural human speech
      playOfficialGreeting();

      // 2. Setup WebSocket in background for real-time listening & replies
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live?voice=${encodeURIComponent(
        selectedVoice
      )}`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        // Send initialization payload over WebSocket frame
        ws.send(
          JSON.stringify({
            type: 'init',
            voice: selectedVoice,
            systemInstruction: VENTURE_INFOTECH_SYSTEM_INSTRUCTION,
          })
        );

        // 3. Start Microphone Recorder for active listening
        recorderRef.current = new MicRecorder(
          (base64PCM) => {
            if (isMutedRef.current) return;
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  type: 'audio',
                  data: base64PCM,
                })
              );
            }
          },
          (vol) => {
            if (isMutedRef.current) {
              setUserVolume(0);
              return;
            }
            setUserVolume(vol);
            if (vol > 0.08 && audioState !== 'speaking') {
              setAudioState('listening');
            } else if (vol <= 0.08 && audioState === 'listening') {
              setAudioState('idle');
            }
          }
        );

        const micStarted = await recorderRef.current.start();
        if (!micStarted) {
          console.warn('Microphone permission not available or denied.');
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'connected') {
            // Already greeted
          } else if (msg.type === 'audio' && msg.data) {
            if (playerRef.current) {
              playerRef.current.playAudioData(msg.data, 'audio/pcm;rate=24000');
            }
          } else if (msg.type === 'model_transcript' && msg.text) {
            appendOrUpdateTranscript('gemini', msg.text, currentModelTranscriptIdRef);
          } else if (msg.type === 'user_transcript' && msg.text) {
            appendOrUpdateTranscript('user', msg.text, currentUserTranscriptIdRef);
          } else if (msg.type === 'interrupted') {
            if (playerRef.current) playerRef.current.interrupt();
            setAudioState('idle');
            setGeminiVolume(0);
            finalizeTranscript(currentModelTranscriptIdRef);
          } else if (msg.type === 'turn_complete') {
            setAudioState('idle');
            setGeminiVolume(0);
            finalizeTranscript(currentModelTranscriptIdRef);
            finalizeTranscript(currentUserTranscriptIdRef);
          } else if (msg.type === 'error') {
            console.warn('Live API status notice:', msg.message);
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (_err) => {
        if (ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
          setConnectionState('error');
        }
      };

      ws.onclose = () => {
        stopSession();
      };
    } catch (err) {
      console.error('Session start error:', err);
      setConnectionState('error');
      stopSession();
    }
  }, [
    connectionState,
    selectedVoice,
    playOfficialGreeting,
    appendOrUpdateTranscript,
    finalizeTranscript,
    stopSession,
    audioState,
  ]);

  const toggleConnection = () => {
    if (connectionState === 'connected' || connectionState === 'connecting') {
      stopSession();
    } else {
      startSession();
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  // Replay speech aloud
  const handleReplayAudio = async (text: string) => {
    try {
      setAudioState('speaking');
      if (!playerRef.current) {
        playerRef.current = new GeminiAudioPlayer(
          24000,
          (vol) => {
            setGeminiVolume(vol);
            setAudioState('speaking');
          },
          () => {
            setAudioState('idle');
            setGeminiVolume(0);
          }
        );
      }

      try {
        const res = await fetch('/api/speak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: text,
            voice: selectedVoice,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audioBase64) {
            await playerRef.current.playAudioData(data.audioBase64, data.mimeType);
            return;
          }
        }
      } catch (err) {
        console.warn('API speak error, falling back:', err);
      }

      // Fallback
      speakWithWebSpeech(
        text,
        () => setAudioState('speaking'),
        () => setAudioState('idle')
      );
    } catch (err) {
      console.error('Replay speech error:', err);
      setAudioState('idle');
    }
  };

  // Send customer prompt query
  const handleSendPrompt = async (text: string) => {
    // 1. Add user transcript entry
    setTranscripts((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: text,
        timestamp: new Date(),
      },
    ]);

    // 2. If connected via Live WebSocket, send realtime text frame
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'text',
          text: text,
        })
      );
      setAudioState('thinking');
    } else {
      // Turn-based fallback via REST /api/chat
      setAudioState('thinking');
      try {
        const history = transcriptsRef.current.map((t) => ({
          role: t.sender === 'user' ? 'user' : 'model',
          text: t.text,
        }));

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: text,
            history: history,
            voice: selectedVoice,
            systemInstruction: VENTURE_INFOTECH_SYSTEM_INSTRUCTION,
          }),
        });

        const data = await res.json();
        setAudioState('idle');

        if (data.text) {
          setTranscripts((prev) => [
            ...prev,
            {
              id: `gemini-${Date.now()}`,
              sender: 'gemini',
              text: data.text,
              timestamp: new Date(),
            },
          ]);
        }

        if (data.audioBase64) {
          if (!playerRef.current) {
            playerRef.current = new GeminiAudioPlayer(
              24000,
              (vol) => {
                setGeminiVolume(vol);
                setAudioState('speaking');
              },
              () => {
                setAudioState('idle');
                setGeminiVolume(0);
              }
            );
          }
          await playerRef.current.playAudioData(data.audioBase64, data.mimeType);
        } else if (data.text) {
          speakWithWebSpeech(
            data.text,
            () => setAudioState('speaking'),
            () => setAudioState('idle')
          );
        }
      } catch (err) {
        console.error('Script response error:', err);
        setAudioState('idle');
      }
    }
  };

  return (
    <IPhoneCallInterface
      connectionState={connectionState}
      audioState={audioState}
      transcripts={transcripts}
      isMuted={isMuted}
      userVolume={userVolume}
      geminiVolume={geminiVolume}
      selectedPlan={selectedPlan}
      onSelectPlan={(plan) => setSelectedPlan(plan as VenturePlanType)}
      onToggleConnection={toggleConnection}
      onToggleMute={toggleMute}
      onSendPrompt={handleSendPrompt}
      onPlayGreeting={playOfficialGreeting}
      onReplayAudio={handleReplayAudio}
      selectedVoice={selectedVoice}
      onSelectVoice={(v) => setSelectedVoice(v as VoiceName)}
    />
  );
}
