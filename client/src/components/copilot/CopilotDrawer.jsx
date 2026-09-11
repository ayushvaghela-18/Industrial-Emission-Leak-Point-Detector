import React, { useState, useRef, useEffect } from 'react';
import { useFactory } from '../../context/FactoryContext';
import { aiService } from '../../services/aiService';
import { MOCK_AI_SUGGESTED_QUESTIONS } from '../../mock/mockData';
import { Sparkles, X, Send, Bot, User, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';

export const CopilotDrawer = () => {
  const { copilotOpen, setCopilotOpen, activeFactory } = useFactory();

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your AI Sustainability Copilot grounded in the calculated telemetry for ${activeFactory?.name || 'your plant'}. How can I assist with your decarbonization strategy?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, copilotOpen]);

  if (!copilotOpen) return null;

  const handleSend = async (questionText) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMsg = {
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const contextData = {
        factoryName: activeFactory?.name,
        totalEmissions: activeFactory?.metrics?.totalEmissionsTonnes,
        topHotspot: activeFactory?.hotspots?.[0]?.title
      };

      const res = await aiService.askCopilot(q, contextData);
      if (res.success) {
        const aiMsg = {
          sender: 'ai',
          text: res.data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "I encountered an error querying plant data. Please try asking again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-slate-900 text-white shadow-2xl flex flex-col justify-between border-l border-slate-800 animate-in slide-in-from-right duration-300">
      
      {/* Drawer Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white tracking-tight">AI Sustainability Copilot</h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Bound to {activeFactory?.name || 'Active Plant'} Telemetry</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setCopilotOpen(false)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Questions Strip */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-1.5">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Suggested Questions</span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {MOCK_AI_SUGGESTED_QUESTIONS.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded-lg border border-slate-700 whitespace-nowrap flex-shrink-0 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start space-x-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                msg.sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-emerald-400 border border-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-none shadow-md'
              }`}
            >
              <p>{msg.text}</p>
              <span className={`text-[9px] block mt-1 ${msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs p-2">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>Analyzing plant telemetry & calculated models...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Prompt Box */}
      <div className="p-3.5 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Ask about emissions, ROI, payback, or circular steps..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
