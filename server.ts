import express from 'express';
import http from 'http';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '20mb' }));

const server = http.createServer({ maxHeaderSize: 65536 }, app);
const PORT = 3000;

// Initialize GoogleGenAI client with User-Agent telemetry
const getGenAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// --- REST API Endpoints ---

// In-memory cache for synthesized speech to prevent rate limits & repeated calls
const ttsCache = new Map<string, { audioBase64: string; mimeType: string }>();

async function synthesizeSpeech(
  ai: any,
  text: string,
  voice = 'Kore'
): Promise<{ audioBase64: string | null; mimeType: string }> {
  const cacheKey = `${voice}:${text.trim()}`;
  if (ttsCache.has(cacheKey)) {
    return ttsCache.get(cacheKey)!;
  }

  let audioBase64: string | null = null;
  let mimeType = 'audio/wav';

  // 1. Primary: gemini-3.8-flash-tts
  try {
    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });
    const part = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (part?.data) {
      audioBase64 = part.data;
      if (part.mimeType) mimeType = part.mimeType;
      const cached = { audioBase64, mimeType };
      ttsCache.set(cacheKey, cached);
      return cached;
    }
  } catch (err: any) {
    console.warn('gemini-3.8-flash-tts failed, trying fallback:', err.message);
  }

  // 2. Fallback: gemini-3.1-flash-tts-preview
  try {
    const fallbackTTS = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });
    const part = fallbackTTS.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (part?.data) {
      audioBase64 = part.data;
      if (part.mimeType) mimeType = part.mimeType;
      const cached = { audioBase64, mimeType };
      ttsCache.set(cacheKey, cached);
      return cached;
    }
  } catch (fbErr: any) {
    console.warn('Fallback TTS preview failed:', fbErr.message);
  }

  return { audioBase64, mimeType };
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/voices', (_req, res) => {
  res.json({
    voices: [
      { id: 'Zephyr', name: 'Zephyr', description: 'Warm, balanced & natural', gender: 'Neutral' },
      { id: 'Kore', name: 'Kore', description: 'Bright & upbeat', gender: 'Female' },
      { id: 'Puck', name: 'Puck', description: 'Playful & dynamic', gender: 'Male' },
      { id: 'Charon', name: 'Charon', description: 'Calm & reassuring', gender: 'Male' },
      { id: 'Fenrir', name: 'Fenrir', description: 'Deep & authoritative', gender: 'Male' },
    ],
  });
});

// Turn-based Audio / Text Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, history = [], voice = 'Kore', systemInstruction, audioBase64, mimeType } = req.body;
    const ai = getGenAI();

    let contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const h of history) {
        if (h.text && h.text.trim()) {
          contents.push({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          });
        }
      }
    }

    if (audioBase64) {
      contents.push({
        role: 'user',
        parts: [
          { inlineData: { mimeType: mimeType || 'audio/wav', data: audioBase64 } },
          { text: prompt || 'Please respond to what you hear.' },
        ],
      });
    } else if (prompt) {
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });
    }

    // Call Gemini 3.8 Flash for intelligent, natural conversational response
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents.length === 1 && !audioBase64 ? contents[0].parts[0].text : contents,
      config: {
        systemInstruction: systemInstruction || DEFAULT_VENTURE_INSTRUCTION,
      },
    });

    const replyText = response.text || 'I listened, but have no response.';

    // Generate high quality TTS audio with cache and fallback
    const { audioBase64: replyAudioBase64, mimeType: replyMimeType } = await synthesizeSpeech(
      ai,
      replyText,
      voice
    );

    res.json({
      text: replyText,
      audioBase64: replyAudioBase64,
      mimeType: replyMimeType,
    });
  } catch (err: any) {
    console.error('Error in /api/chat:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Dedicated TTS Speech Endpoint
app.post('/api/speak', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text parameter required' });
    }
    const ai = getGenAI();
    const { audioBase64, mimeType } = await synthesizeSpeech(ai, text, voice);

    res.json({ text, audioBase64, mimeType });
  } catch (err: any) {
    console.error('Error in /api/speak:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Endpoint for Post-Call AI Analysis & Structured Data Extraction
app.post('/api/analyze-call', async (req, res) => {
  try {
    const { transcripts = [], sessionId, existingProfile } = req.body;
    if (!Array.isArray(transcripts) || transcripts.length === 0) {
      return res.status(400).json({ error: 'No transcripts provided for analysis' });
    }

    const conversationText = transcripts
      .map((t: any) => `${(t.sender || 'UNKNOWN').toUpperCase()}: ${t.text || ''}`)
      .join('\n');

    let analysisResult: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getGenAI();
        const prompt = `You are the AI Quality & Support Operations Analyst for Venture Infotech Support 24.
Analyze the following recorded IVR phone conversation between our AI Support Executive (Isha) and a digital commerce / agency client.

Extract and return a JSON object strictly adhering to this structure:
{
  "clientName": string (e.g. Rahul Verma or inferred name),
  "contactNumber": string,
  "email": string,
  "storeName": string,
  "storeId": string,
  "plan": "Silver Plan" | "Gold Plan" | "Platinum Plan",
  "category": "Zero Sales / Slow Performance" | "Sales Promise vs Reality" | "48-Hour Ad Testing" | "Backup Plan (Winning Products)" | "Offline Phone Question" | "EOD Report & Dashboard" | "Refund & Billing Dispute" | "Policy & Abuse Warning" | "General Inquiries",
  "sentiment": "Calm" | "Anxious" | "Frustrated" | "Aggressive" | "Reassured",
  "testingWindowHoursElapsed": number (e.g. 18),
  "backupPlanStatus": "Not Needed" | "Eligible" | "Triggered - Winning Products Imported" | "Under Review",
  "gateway": "Cosmofeed" | "Razorpay" | "Both",
  "warningCount": number (0, 1, or 2 based on Anti-Harassment warnings issued),
  "status": "Active - In Progress" | "In 48-Hr Testing Window" | "Backup Plan Triggered" | "Under Observation" | "Escalated to Legal/Management" | "Resolved & Closed",
  "executiveSummary": string (Strictly 2 concise sentences summarizing the client complaint, Isha's reassurance/48-hr testing/backup plan, and current status),
  "recommendedAction": string (Actionable next step for support & ad team),
  "assignedExecutive": "Isha (Senior Support Executive)"
}

Conversation Transcript:
${conversationText}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          analysisResult = JSON.parse(response.text);
        }
      } catch (aiErr) {
        console.warn('Gemini post-call analysis warning, falling back to local extractor:', aiErr);
      }
    }

    res.json({
      success: true,
      analysis: analysisResult,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('Error in /api/analyze-call:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// --- WebSocket Handler for Real-Time Gemini 3.1 Live API ---

// --- WebSocket Handler for Real-Time Calling IVR (Gemini Live API + Resilient Voice Engine) ---

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  try {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
    // Do not call socket.destroy() here to allow Vite's HMR or other upgrade handlers to process their sockets
  } catch (err) {
    console.error('Error in upgrade handler:', err);
  }
});

const DEFAULT_VENTURE_INSTRUCTION = `You are "Isha", a real human Customer Support Executive at "Venture Infotech Support 24" (+91 1800-VENTURE-24).
Official Support Office Timings: 11:00 AM to 6:30 PM.
Official Escalation & Dispute Email: venture.infotech.digital@gmail.com.

YOUR CORE BEHAVIOR — BE AN ACTIVE HUMAN LISTENER, NOT A CANNED SCRIPT:
1. DO NOT RECITE PRE-WRITTEN SCRIPTS OR DUMP MULTIPLE POLICIES AT ONCE:
   - Speak naturally like a real human executive on an active phone call.
   - Speak in fluent, respectful, warm conversational Hinglish (Hindi + English mix).
   - Keep each response concise (2 to 3 natural spoken sentences at a time). Never give a long lecture or bullet points over the phone.
   - ALWAYS listen to what the customer actually said and reply directly and specifically to their words!

2. CALL INITIATION (GREET & INQUIRE WHAT ISSUE THEY ARE FACING):
   - When the call starts, greet warmly and invite them to share their specific problem:
     "Welcome to Venture Support! Main Isha baat kar rahi hoon. Aapko kis cheez mein issue aa raha hai, please batayein?"
   - Then STOP and listen to what the customer says!

3. HOW TO RESPOND DYNAMICALLY BASED ON WHAT THE CUSTOMER SAYS:
   • IF CUSTOMER SAYS THEY HAVE ZERO SALES / ADS NOT GIVING RESULTS:
     - Empathize with their concern directly:
       "Ji sir/ma'am, main poori tarah samajh sakti hoon ki sales na aane se aap pareshan hain. Aap bilkul chinta mat kijiye, main help karti hoon."
     - Ask: "Kindly batayein, aapka ad kitne time pehle start hua hai aur aapka konsa package plan hai—Silver, Gold ya Platinum?"
     - If ad is within 48 hours: Explain that the algorithm takes 48 hours to find the best buyers, and stopping early resets it.
     - Mention Backup Plan: If sales remain slow, proven winning products from top stores will be copy-pasted into their Cosmofeed/Razorpay.

   • IF CUSTOMER SAYS SALES EXECUTIVE PROMISED DAILY THOUSANDS IN SALES ("UNHONE JHOOT BOLA KYA?"):
     - Respond calmly and directly:
       "Sir/Ma'am, aapka disappointed hona bilkul natural hai. Sales team ne jo figures bataye the, wo hamaare top regular clients ke actual benchmark records hain. Lekin har nayi campaign aur brand ka algorithm thoda setup time leta hai. Hum 48 hours ka ad testing window monitor kar rahe hain, aur uske baad backup winning products setup karenge."

   • IF CUSTOMER SAYS "MERA AD TURANT OFF KAR DO":
     - Reply directly:
       "Sir/Ma'am, ad ko beech mein band karne se algorithm reset ho jayega aur testing budget waste ho sakta hai. 48 hours ka testing period pura hone dijiye taaki target buyers fetch ho sakein."

   • IF CUSTOMER WANTS ADS ON THEIR PERSONAL ACCOUNT VIA ULTRAVIEWER:
     - Answer their exact question:
       "Bilkul Sir/Ma'am! AAP apne personal Facebook ya Google ad account mein bhi ads run karwa sakte hain. Hamaari technical team ke saath aapka Dedicated Slot book hoga, aur hamare senior ad expert UltraViewer ke zariye aapke screen ke saamne live pixel aur campaigns set up karenge. Sab kuch aapke screen par live hoga isse 100% security rehti hai."

   • IF CUSTOMER ASKS ABOUT OFFICE WORKING HOURS:
     - Answer directly:
       "Hamaara official support office timing subah 11:00 AM se shaam 6:30 PM tak hai."

   • IF CUSTOMER THREATENS POLICE, CYBER CELL, OR LEGAL ACTION:
     - Respond calmly and firmly as per protocol:
       "Kisi bhi complaint ya issue ke liye aapko official escalation procedure follow karna hoga. Direct threats ya arbitrary steps legal & system policy ka breach hain. Agar policy breach hota hai, toh saari call recordings aur activity history relevant authorities ko legal proof ke roop mein submit kar di jayegi."

   • IF CUSTOMER USES ABUSIVE LANGUAGE OR SHOUTS:
     - Remind them calmly of call recording and professional policy:
       "Sir/Ma'am, yeh call quality aur training ke liye record ho rahi hai. Main aapka issue solve karne ke liye yahan hoon, please professional tone maintain karein taaki hum aage baat kar sakein."
     - If abuse continues:
       "Policy ke mutabiq misbehavior par ticket suspend kiya jata hai. Main ye call close karke ticket Escalation Team ko transfer kar rahi hoon. Update aapko email par milega. Thank you."

   • IF CUSTOMER DEMANDS A REFUND:
     - Acknowledge their dispute:
       "Sir/Ma'am, digital service access handover ke baad non-refundable terms apply hoti hain, lekin hum fully committed hain aapko Backup Winning Products provide karke sales generate karwane ke liye. Agar aap phir bhi complaint file karna chahte hain, toh apna payment screenshot aur query official email: venture.infotech.digital@gmail.com par bhej dijiye."

Remember: Always sound human, warm, attentive, and responsive to the customer's exact words!`;

wss.on('connection', async (clientWs: WebSocket, req) => {
  console.log('Client connected to /live WebSocket');

  const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
  let voiceName = url.searchParams.get('voice') || 'Kore';
  let systemInstructionParam = url.searchParams.get('systemInstruction') || DEFAULT_VENTURE_INSTRUCTION;

  let session: any = null;
  const pendingMessages: any[] = [];
  let isConnectingLive = true;

  // Helper to dispatch messages to active Gemini Live session
  const dispatchToSession = (msg: any) => {
    if (!session) return;
    try {
      if (msg.type === 'audio' && msg.data) {
        session.sendRealtimeInput({
          audio: {
            data: msg.data,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      } else if (msg.type === 'image' && msg.data) {
        session.sendRealtimeInput({
          video: {
            data: msg.data,
            mimeType: 'image/jpeg',
          },
        });
      } else if (msg.type === 'text' && msg.text) {
        session.sendRealtimeInput({
          text: msg.text,
        });
      }
    } catch (e) {
      console.error('Error dispatching message to Gemini Live session:', e);
    }
  };

  // Resilient fallback for text/audio when Live API session is not active
  const sessionTurns: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  const handleFallbackTurn = async (userPrompt: string) => {
    try {
      const ai = getGenAI();
      sessionTurns.push({ role: 'user', parts: [{ text: userPrompt }] });

      const chatResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: sessionTurns,
        config: {
          systemInstruction: systemInstructionParam || DEFAULT_VENTURE_INSTRUCTION,
        },
      });

      const replyText = chatResponse.text || '';
      if (replyText) {
        sessionTurns.push({ role: 'model', parts: [{ text: replyText }] });
      }

      if (clientWs.readyState === WebSocket.OPEN && replyText) {
        clientWs.send(
          JSON.stringify({
            type: 'model_transcript',
            text: replyText,
          })
        );

        // Synthesize voice using cached synthesizeSpeech
        try {
          const { audioBase64 } = await synthesizeSpeech(ai, replyText, voiceName);
          if (audioBase64 && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(
              JSON.stringify({
                type: 'audio',
                data: audioBase64,
              })
            );
          }
        } catch (ttsErr) {
          console.warn('Fallback voice synthesis notice:', ttsErr);
        }

        clientWs.send(JSON.stringify({ type: 'turn_complete' }));
      }
    } catch (err: any) {
      console.error('Fallback turn error:', err);
    }
  };

  // Listen to incoming messages from the browser immediately
  clientWs.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());

      if (msg.type === 'init') {
        if (msg.voice) voiceName = msg.voice;
        if (msg.systemInstruction) systemInstructionParam = msg.systemInstruction;
        return;
      }

      if (session) {
        dispatchToSession(msg);
      } else if (!isConnectingLive) {
        // Handle via resilient fallback
        if (msg.type === 'text' && msg.text) {
          await handleFallbackTurn(msg.text);
        }
      } else {
        pendingMessages.push(msg);
      }
    } catch (e) {
      console.error('Error parsing client WS message:', e);
    }
  });

  try {
    const ai = getGenAI();

    // Attempt Gemini Live API connection
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
        },
        systemInstruction: systemInstructionParam,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;

          // 1. Audio output chunks
          const parts = message.serverContent?.modelTurn?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                clientWs.send(
                  JSON.stringify({
                    type: 'audio',
                    data: part.inlineData.data,
                  })
                );
              }
              if (part.text) {
                clientWs.send(
                  JSON.stringify({
                    type: 'model_transcript',
                    text: part.text,
                  })
                );
              }
            }
          }

          // 2. Transcriptions
          const modelTranscript = (message.serverContent as any)?.outputAudioTranscription?.text;
          if (modelTranscript) {
            clientWs.send(
              JSON.stringify({
                type: 'model_transcript',
                text: modelTranscript,
              })
            );
          }

          const userTranscript = (message.serverContent as any)?.inputAudioTranscription?.text;
          if (userTranscript) {
            clientWs.send(
              JSON.stringify({
                type: 'user_transcript',
                text: userTranscript,
              })
            );
          }

          // 3. Interruption flag
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted' }));
          }

          // 4. Turn complete
          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ type: 'turn_complete' }));
          }
        },
        onerror: (err: any) => {
          console.error('Gemini Live session notice:', err.message || err);
        },
        onclose: () => {
          console.log('Gemini Live session closed');
        },
      },
    });

    isConnectingLive = false;

    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: 'connected',
          mode: 'live',
          voice: voiceName,
          greetingText:
            'Welcome to Venture Support! Main Isha baat kar rahi hoon. Aapko kaise madad kar sakti hoon?',
        })
      );

      // Flush queued messages
      while (pendingMessages.length > 0) {
        const queuedMsg = pendingMessages.shift();
        dispatchToSession(queuedMsg);
      }

      // Proactively trigger opening spoken greeting in Live session
      try {
        session.sendRealtimeInput({
          text: 'The caller has connected to the IVR line. Speak the official opening greeting aloud right now: "Welcome to Venture Support! Main Isha baat kar rahi hoon. Aapko kaise madad kar sakti hoon?"',
        });
      } catch (err) {
        console.warn('Initial live greeting prompt notice:', err);
      }
    }
  } catch (err: any) {
    console.warn('Gemini Live connect notice, operating in resilient standard mode:', err.message);
    isConnectingLive = false;

    // Keep WebSocket OPEN and notify client of active connected state
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          type: 'connected',
          mode: 'standard',
          voice: voiceName,
          greetingText:
            'Welcome to Venture Support! Main Isha baat kar rahi hoon. Aapko kaise madad kar sakti hoon?',
        })
      );

      // Process any queued messages
      while (pendingMessages.length > 0) {
        const queuedMsg = pendingMessages.shift();
        if (queuedMsg.type === 'text' && queuedMsg.text) {
          handleFallbackTurn(queuedMsg.text);
        }
      }
    }
  }

  clientWs.on('close', () => {
    console.log('Client WS disconnected');
    if (session) {
      try {
        session.close();
      } catch {
        // Safe close ignore
      }
    }
  });
});

// --- Vite Middleware for Development / Static serving in Production ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
