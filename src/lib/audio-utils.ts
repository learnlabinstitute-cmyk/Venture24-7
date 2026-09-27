/**
 * Convert Float32 audio samples (-1.0 to +1.0) to 16-bit PCM Little Endian Int16
 */
export function float32ToInt16PCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    // Scale float -1.0..1.0 to 16-bit signed integer -32768..32767
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

/**
 * Convert ArrayBuffer to Base64 String
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Base64 encoded Int16 PCM to Float32Array
 */
export function base64ToFloat32PCM(base64: string): Float32Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const dataView = new DataView(bytes.buffer);
  const sampleCount = Math.floor(len / 2);
  const float32 = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32[i] = int16 < 0 ? int16 / 32768 : int16 / 32767;
  }
  return float32;
}

/**
 * Compute Root-Mean-Square (RMS) audio volume level (0.0 to 1.0)
 */
export function calculateVolume(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  const rms = Math.sqrt(sum / samples.length);
  return Math.min(1.0, rms * 5.0); // Boost for visual feedback
}

/**
 * Gapless Audio Player for 24kHz PCM Gemini Live Output
 */
export class GeminiAudioPlayer {
  private audioCtx: AudioContext | null = null;
  private nextStartTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private onVolumeCallback?: (volume: number) => void;
  private onEndedCallback?: () => void;
  private isPlaying: boolean = false;
  private sampleRate: number = 24000;

  constructor(sampleRate = 24000, onVolume?: (v: number) => void, onEnded?: () => void) {
    this.sampleRate = sampleRate;
    this.onVolumeCallback = onVolume;
    this.onEndedCallback = onEnded;
  }

  private initCtx() {
    if (!this.audioCtx || this.audioCtx.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: this.sampleRate });
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playChunk(base64Pcm: string) {
    this.initCtx();
    if (!this.audioCtx) return;

    const float32Samples = base64ToFloat32PCM(base64Pcm);
    if (float32Samples.length === 0) return;

    if (this.onVolumeCallback) {
      const vol = calculateVolume(float32Samples);
      this.onVolumeCallback(vol);
    }

    const audioBuffer = this.audioCtx.createBuffer(1, float32Samples.length, this.sampleRate);
    audioBuffer.getChannelData(0).set(float32Samples);

    const source = this.audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioCtx.destination);

    const currentTime = this.audioCtx.currentTime;
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime + 0.05; // 50ms buffer for jitter
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
    this.activeSources.push(source);
    this.isPlaying = true;

    source.onended = () => {
      const idx = this.activeSources.indexOf(source);
      if (idx !== -1) {
        this.activeSources.splice(idx, 1);
      }
      if (this.activeSources.length === 0) {
        this.isPlaying = false;
        if (this.onEndedCallback) {
          this.onEndedCallback();
        }
      }
    };
  }

  /**
   * Play encoded audio (WAV, MP3) or fallback to raw PCM chunk
   */
  public async playAudioData(base64Data: string, mimeType?: string): Promise<void> {
    this.initCtx();
    if (!this.audioCtx) return;

    // If starts with RIFF (WAV header) or explicit encoded mimeType, decode using Web Audio
    const isWavOrMp3 =
      base64Data.startsWith('UklGR') ||
      (mimeType && (mimeType.includes('wav') || mimeType.includes('mp3') || mimeType.includes('mpeg')));

    if (isWavOrMp3) {
      try {
        const binaryString = atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const audioBuffer = await this.audioCtx.decodeAudioData(bytes.buffer.slice(0));

        const source = this.audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioCtx.destination);

        const currentTime = this.audioCtx.currentTime;
        if (this.nextStartTime < currentTime) {
          this.nextStartTime = currentTime + 0.05;
        }

        source.start(this.nextStartTime);
        this.nextStartTime += audioBuffer.duration;
        this.activeSources.push(source);
        this.isPlaying = true;

        // Visualizer volume feedback
        const channelData = audioBuffer.getChannelData(0);
        const step = Math.max(1, Math.floor(channelData.length / 25));
        let stepIdx = 0;
        const volInterval = setInterval(() => {
          if (!this.isPlaying || stepIdx >= channelData.length) {
            clearInterval(volInterval);
            return;
          }
          const slice = channelData.subarray(stepIdx, stepIdx + step);
          if (this.onVolumeCallback) {
            this.onVolumeCallback(calculateVolume(slice));
          }
          stepIdx += step;
        }, 80);

        source.onended = () => {
          clearInterval(volInterval);
          const idx = this.activeSources.indexOf(source);
          if (idx !== -1) {
            this.activeSources.splice(idx, 1);
          }
          if (this.activeSources.length === 0) {
            this.isPlaying = false;
            if (this.onEndedCallback) {
              this.onEndedCallback();
            }
          }
        };
        return;
      } catch (e) {
        console.warn('decodeAudioData encountered error, falling back to raw PCM:', e);
      }
    }

    // Default: play as raw 24kHz PCM chunk
    this.playChunk(base64Data);
  }

  public interrupt() {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {
        // Source might already have ended
      }
    }
    this.activeSources = [];
    if (this.audioCtx) {
      this.nextStartTime = this.audioCtx.currentTime;
    }
    this.isPlaying = false;
  }

  public stop() {
    this.interrupt();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

/**
 * Microphone Recorder capturing 16kHz PCM audio
 */
export class MicRecorder {
  private mediaStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private onAudioData: (base64PCM: string) => void;
  private onVolume: (vol: number) => void;
  private isRecording: boolean = false;

  constructor(
    onAudioData: (base64PCM: string) => void,
    onVolume: (vol: number) => void
  ) {
    this.onAudioData = onAudioData;
    this.onVolume = onVolume;
  }

  public async start(): Promise<boolean> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass({ sampleRate: 16000 });
      this.sourceNode = this.audioCtx.createMediaStreamSource(this.mediaStream);

      // 4096 buffer size gives ~256ms audio frames at 16kHz
      this.processorNode = this.audioCtx.createScriptProcessor(4096, 1, 1);

      this.processorNode.onaudioprocess = (e) => {
        if (!this.isRecording) return;
        const float32Data = e.inputBuffer.getChannelData(0);

        // Volume feedback
        const vol = calculateVolume(float32Data);
        this.onVolume(vol);

        // Convert to 16-bit PCM and emit
        const pcmBuffer = float32ToInt16PCM(float32Data);
        const base64PCM = arrayBufferToBase64(pcmBuffer);
        this.onAudioData(base64PCM);
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioCtx.destination);
      this.isRecording = true;
      return true;
    } catch (err) {
      console.error('Failed to start microphone recording:', err);
      return false;
    }
  }

  public stop() {
    this.isRecording = false;
    if (this.processorNode) {
      this.processorNode.onaudioprocess = null;
      this.processorNode.disconnect();
      this.processorNode = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}

/**
 * Web Speech Synthesis fallback helper for Hindi/Hinglish speech output
 */
export function speakWithWebSpeech(
  text: string,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Indian accent / Hindi
    utterance.rate = 0.95; // calm, clear, confident pacing
    utterance.pitch = 1.05; // warm, reassuring tone

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find(
        (v) =>
          (v.lang.includes('hi') || v.lang.includes('IN') || v.lang.includes('en-IN')) &&
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('natural') ||
            v.name.toLowerCase().includes('veena') ||
            v.name.toLowerCase().includes('geeta'))
      ) || voices.find((v) => v.lang.includes('hi') || v.lang.includes('IN'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Web speech synthesis failed:', err);
    return false;
  }
}

/**
 * Realistic iPhone DTMF keypad audio tone generator
 */
const DTMF_FREQS: Record<string, [number, number]> = {
  '1': [697, 1209],
  '2': [697, 1336],
  '3': [697, 1477],
  '4': [770, 1209],
  '5': [770, 1336],
  '6': [770, 1477],
  '7': [852, 1209],
  '8': [852, 1336],
  '9': [852, 1477],
  '*': [941, 1209],
  '0': [941, 1336],
  '#': [941, 1477],
};

let sharedAudioCtx: AudioContext | null = null;
function getSharedAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

export function playDtmfTone(key: string, durationMs = 120): void {
  const ctx = getSharedAudioContext();
  if (!ctx) return;

  const freqs = DTMF_FREQS[key];
  if (!freqs) return;

  const now = ctx.currentTime;
  const duration = durationMs / 1000;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc1.frequency.value = freqs[0];
  osc2.frequency.value = freqs[1];

  gainNode.gain.setValueAtTime(0.08, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + duration);
  osc2.stop(now + duration);
}

/**
 * Realistic outgoing phone ringing sound
 */
export function playPhoneRingTone(durationSeconds = 1.8): () => void {
  const ctx = getSharedAudioContext();
  if (!ctx) return () => {};

  const now = ctx.currentTime;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.frequency.value = 440; // US/Indian phone ring
  osc2.frequency.value = 480;

  gain.gain.setValueAtTime(0.05, now);
  gain.gain.linearRampToValueAtTime(0.05, now + durationSeconds - 0.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + durationSeconds);
  osc2.stop(now + durationSeconds);

  return () => {
    try {
      osc1.stop();
      osc2.stop();
    } catch {
      // ignore
    }
  };
}

