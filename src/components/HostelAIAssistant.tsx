import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Bot, User as UserIcon, RefreshCw, MessageSquare } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.js';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  time: string;
}

interface HostelAIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HostelAIAssistant: React.FC<HostelAIAssistantProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello ${user?.name || 'there'}! I am HostelAI, your 24/7 Hostel Assistant. How can I help you today with mess timings, gate rules, leave applications, or maintenance?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'What are the hostel gate timings?',
    'How do I apply for overnight leave?',
    'How do I lodge a room maintenance complaint?',
    'What are the mess meal timings?'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        text: m.text
      }));

      const res = await api.post('/ai/chat', {
        message: messageText,
        history
      });

      const replyText = res.data?.data?.reply || "I've logged your query. Please refer to your hostel warden or administrator.";

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'model',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        text: 'Hostel system is currently responding. Please verify your connection or check with the hostel warden office.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-1.5">
              HostelAI Assistant
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-400 text-slate-950">
                Online
              </span>
            </div>
            <p className="text-[11px] text-indigo-100">AI Hostel Operations Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 max-w-[88%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
          >
            <div
              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white'
              }`}
            >
              {m.role === 'user' ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700 shadow-sm whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block px-1">{m.time}</span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 mr-auto">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center text-xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5 text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 text-[11px] no-scrollbar">
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap transition border border-slate-200 dark:border-slate-700 shrink-0 font-medium"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about rooms, leave, mess, rules..."
            className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
