import React, { useEffect, useRef, useState } from 'react';
import { Bot, ExternalLink, MapPin, MessageSquare, RotateCcw, Send, User, X } from 'lucide-react';

interface GroundingChunk {
  maps?: {
    title?: string;
    uri?: string;
  };
  web?: {
    title?: string;
    uri?: string;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  groundingChunks?: GroundingChunk[];
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Hello! I am your Jain University Transit Assistant. I can help with real-time shuttle schedules, bay locations, Kanakapura corridor routes, BMTC connections, and emergency transport protocols.',
    timestamp: 'Just now',
  },
];

const QUICK_PROMPTS = [
  'City bus timings from Jain Gate?',
  'When does JT-01 leave for Bengaluru?',
  'Where is Bay 2 at Jain Campus?',
  'Eateries & cafes near Harohalli stop?',
  'How do I reach Thalaghattapura Metro?',
];

function getLocalTransitReply(rawQuery: string): { text: string; groundingChunks?: GroundingChunk[] } {
  const q = rawQuery.toLowerCase().trim();

  if (
    (q.includes('city bus') || q.includes('timing') || q.includes('schedule') || q.includes('departure') || q.includes('gate') || q.includes('bmtc') || q.includes('ksrtc')) &&
    (q.includes('bengaluru') || q.includes('bangalore') || q.includes('city') || q.includes('gate') || q.includes('timings'))
  ) {
    return {
      text:
        '14 Official Campus Gate Departures (BMTC & KSRTC)\n\n' +
        'Buses depart from the Main Campus Terminal Gate throughout the day:\n' +
        '• Morning: 07:45 AM, 08:25 AM, 09:15 AM, 10:15 AM, 11:25 AM, 11:55 AM\n' +
        '• Afternoon: 01:00 PM, 03:00 PM, 04:00 PM, 04:50 PM\n' +
        '• Evening: 05:35 PM, 06:20 PM, 07:15 PM, 08:10 PM\n\n' +
        'Key Routes Covered:\n' +
        '• 211-C / 213-B: Harohalli → Kanakapura Rd → Banashankari TTMC\n' +
        '• Express Connectors: Direct to Majestic (KBS Platform 18) & Thalaghattapura Metro',
      groundingChunks: [
        { maps: { title: 'Jain University Main Gate Bus Stop', uri: 'https://www.google.com/maps/search/?api=1&query=12.6521,77.4412' } },
        { maps: { title: 'Banashankari TTMC Bus Station', uri: 'https://www.google.com/maps/search/?api=1&query=12.9177,77.5739' } },
      ],
    };
  }

  if (q.includes('jt-01') || q.includes('jt01')) {
    return {
      text:
        'Shuttle JT-01 — Kanakapura Corridor Express\n' +
        '• Departure: 08:00 AM from Bay 2 (South Gate)\n' +
        '• Driver: Ramesh Gowda (+91 94480 11223)\n' +
        '• Route Stops:\n' +
        '  1. Jain Campus Terminal (08:00 AM)\n' +
        '  2. Kanakapura Cross (08:18 AM)\n' +
        '  3. Harohalli Town Circle (08:35 AM)\n' +
        '  4. Art of Living Ashram (08:55 AM)\n' +
        '  5. Thalaghattapura Metro (09:12 AM)\n' +
        '  6. Banashankari TTMC Hub (09:35 AM)\n\n' +
        'Track live GPS and stop updates from your Student Lounge.',
      groundingChunks: [
        { maps: { title: 'Jain Campus Bay 2 Terminal', uri: 'https://www.google.com/maps/search/?api=1&query=12.6521,77.4412' } },
      ],
    };
  }

  if (q.includes('jt-02') || q.includes('jt02')) {
    return {
      text:
        'Shuttle JT-02 — Bengaluru Central Express\n' +
        '• Departure: 08:45 AM from Bay 1 (North Gate)\n' +
        '• Driver: Mohan Das (+91 94480 22334)\n' +
        '• Destination: Majestic (Bengaluru Central)\n' +
        '• Route Stops: Jain Gate → Harohalli Industrial → Silk Institute Metro → Majestic (Platform 18)',
    };
  }

  if (q.includes('jt-03') || q.includes('jt03')) {
    return {
      text:
        'Shuttle JT-03 — Harohalli Local Feeder\n' +
        '• Departure: 08:30 AM from Bay 3 (West Bay)\n' +
        '• Driver: Anil Reddy (+91 94480 33445)\n' +
        '• Route: Campus Terminal → Hostel Block 4 & 5 → Harohalli Bus Stand',
    };
  }

  if (q.includes('jt-04') || q.includes('jt04')) {
    return {
      text:
        'Shuttle JT-04 — Late Morning City Connector\n' +
        '• Departure: 09:30 AM from Bay 2 (South Gate)\n' +
        '• Driver: Kishore V.\n' +
        '• Route: Campus Terminal → Kaggalipura Junction → Yelachenahalli Metro',
    };
  }

  if (q.includes('jt-05') || q.includes('jt05')) {
    return {
      text:
        'Shuttle JT-05 — Harohalli Regular Shuttles\n' +
        '• Departure: 08:15 AM from Bay 4 (Express Lane)\n' +
        '• Driver: Sunil Kumar (+91 94480 55667)\n' +
        '• Route: Campus Terminal → Bettahalli Gate → Harohalli Bus Stand',
    };
  }

  if (q.includes('bay') || q.includes('platform')) {
    return {
      text:
        'Jain University Campus Bus Bays:\n' +
        '• Bay 1 (North Gate): Express City Connectors (JT-02 Majestic)\n' +
        '• Bay 2 (South Gate): Kanakapura Corridor (JT-01 Banashankari, JT-04 & Emergency standby)\n' +
        '• Bay 3 (West Bay): Harohalli Local Feeder (JT-03 loop service)\n' +
        '• Bay 4 (Express Lane): Harohalli Regular Shuttles (JT-05)\n' +
        '• Main Gate Drop-Zone: Official BMTC & KSRTC state transport stops',
      groundingChunks: [
        { maps: { title: 'Jain University Campus Terminal Bays', uri: 'https://www.google.com/maps/search/?api=1&query=12.6521,77.4412' } },
      ],
    };
  }

  if (q.includes('eater') || q.includes('cafe') || q.includes('food') || q.includes('coffee')) {
    return {
      text:
        'Eateries & Cafes Near Campus & Harohalli:\n' +
        '• Halli Mane Tiffin Corner (Kanakapura Main Rd) — Hot Thatte Idli, dosas, and filter coffee.\n' +
        '• Udupi Upahar (Harohalli Town Circle) — South Indian meals and fresh juices.\n' +
        '• Cafe Coffee Day Express (BPCL Expressway Plaza) — Highway cafe with Wi-Fi and waiting lounge.',
      groundingChunks: [
        { maps: { title: 'Halli Mane Tiffin Corner, Kanakapura Road', uri: 'https://www.google.com/maps/search/?api=1&query=Halli+Mane+Kanakapura+Road+Harohalli' } },
        { maps: { title: 'Udupi Upahar, Harohalli Junction', uri: 'https://www.google.com/maps/search/?api=1&query=Udupi+Upahar+Harohalli+Karnataka' } },
      ],
    };
  }

  if (q.includes('metro') || q.includes('thalaghattapura') || q.includes('green line') || q.includes('yelachenahalli')) {
    return {
      text:
        'How to Reach Namma Metro (Green Line):\n' +
        '• Closest Station: Thalaghattapura Metro Station along Kanakapura Rd (NH 948).\n' +
        '• Direct Campus Options:\n' +
        '  1. Shuttle JT-01 (08:00 AM from Bay 2) — stops at Thalaghattapura Metro.\n' +
        '  2. Shuttle JT-04 (09:30 AM from Bay 2) — connects to Yelachenahalli Metro.\n' +
        '  3. BMTC 211-C or 211-G from the Main Campus Gate.',
      groundingChunks: [
        { maps: { title: 'Thalaghattapura Metro Station', uri: 'https://www.google.com/maps/search/?api=1&query=Thalaghattapura+Metro+Station+Bengaluru' } },
      ],
    };
  }

  if (q.includes('emergency') || q.includes('hospital') || q.includes('doctor') || q.includes('medical') || q.includes('sos')) {
    return {
      text:
        'Campus Emergency & Medical Transit Protocols:\n' +
        '• Immediate Campus SOS Dispatch: Use the Emergency SOS portal to alert the transport desk with your coordinates.\n' +
        '• Campus Security Hotline: +91 80 4646 9000 (24/7 Control Desk)\n' +
        '• Transport Supervisor Desk: +91 94480 11223\n\n' +
        'Nearest Medical Centers:\n' +
        '• Harohalli Community Health Centre (~3.2 km, Harohalli Town)\n' +
        '• Dayananda Sagar Hospital & Medical College (~14 km along Kanakapura Rd)',
      groundingChunks: [
        { maps: { title: 'Harohalli Community Health Centre', uri: 'https://www.google.com/maps/search/?api=1&query=Government+Hospital+Harohalli' } },
      ],
    };
  }

  return {
    text:
      'I can help you navigate campus travel around Jain University FET Campus (Kanakapura Road):\n' +
      '• Shuttles: Ask "When does JT-01 leave?" or "Where is Bay 2?"\n' +
      '• City Buses: Ask "City bus timings from Jain Gate?"\n' +
      '• Metro Links: Ask "How do I reach Thalaghattapura Metro?"\n' +
      '• Emergency Transit: Ask "Emergency hospital dispatch?"',
    groundingChunks: [
      { maps: { title: 'Jain University Campus Terminal', uri: 'https://www.google.com/maps/search/?api=1&query=12.6521,77.4412' } },
    ],
  };
}

export const TransitChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
    if (!text) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: now,
    };

    const reply = getLocalTransitReply(text);
    const botMsg: ChatMessage = {
      id: `b_${Date.now() + 1}`,
      role: 'assistant',
      content: reply.text,
      groundingChunks: reply.groundingChunks,
      timestamp: now,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xl transition-all cursor-pointer border border-white/20"
          aria-label="Open Transit Help Assistant"
        >
          <MessageSquare size={17} className="text-blue-400" />
          <span className="text-xs sm:text-sm whitespace-nowrap">Transit Guide</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-4 sm:right-5 z-50 w-[92vw] sm:w-[400px] max-h-[80vh] h-[560px] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden">
          <div className="px-4 py-3 bg-slate-800 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <Bot size={16} />
              </div>
              <div>
                <div className="font-bold text-sm leading-none">Jain Transit Guide</div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Schedules, Bays & Corridor Routes
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMessages(INITIAL_MESSAGES)}
                title="Reset conversation"
                aria-label="Reset conversation"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw size={15} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title="Close guide"
                aria-label="Close guide"
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          <div className="px-3 py-2 bg-slate-950/60 border-b border-slate-800 flex gap-1.5 overflow-x-auto text-[11px]">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-200 transition-colors cursor-pointer shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-200 shrink-0 mt-0.5">
                    <Bot size={13} />
                  </div>
                )}

                <div
                  className={`max-w-[82%] rounded-2xl p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-100 border border-slate-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-[13px]">{msg.content}</p>

                  {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-300 flex items-center gap-1 uppercase tracking-wider">
                        <MapPin size={11} />
                        <span>Map Locations</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {msg.groundingChunks.map((chunk, i) => {
                          const url = chunk.maps?.uri || chunk.web?.uri;
                          const title = chunk.maps?.title || chunk.web?.title || 'View Location';
                          if (!url) return null;
                          return (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-950 text-blue-300 hover:text-white border border-slate-700 text-[11px] font-semibold transition-colors no-underline"
                            >
                              <ExternalLink size={11} className="shrink-0" />
                              <span className="truncate">{title}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 text-right mt-1 font-mono tabular-nums">
                    {msg.timestamp}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                    <User size={13} />
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about buses, bays, or routes..."
              className="flex-1 bg-slate-800 hover:bg-slate-800/80 focus:bg-slate-800 text-white placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-xs outline-none border border-slate-700 focus:border-blue-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold transition-colors shrink-0 cursor-pointer"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
