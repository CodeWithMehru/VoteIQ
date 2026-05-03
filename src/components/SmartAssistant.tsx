'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '@/lib';

export default function SmartAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am the VoteIQ Assistant. I can help you understand the election process, how to register, and how to cast your vote. What would you like to know?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, timestamp: Date.now() }]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply, timestamp: Date.now() }]);
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${err.message || 'Please try again later.'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_QUESTIONS = ['How do I register to vote?', 'What ID do I need?', 'How does an EVM work?'];

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 flex flex-col h-[500px] overflow-hidden transition-all duration-300">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex items-center shadow-md">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-3 backdrop-blur-sm">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-white text-lg leading-tight">VoteIQ Assistant</h3>
          <p className="text-blue-100 text-xs">Powered by Google Gemini</p>
        </div>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl p-4 shadow-sm backdrop-blur-sm transition-all duration-200 ${
                msg.role === 'user'
                  ? 'bg-blue-600/90 text-white rounded-tr-sm border border-blue-500/50'
                  : 'bg-white/90 dark:bg-gray-800/90 border border-white/40 dark:border-gray-700/50 text-gray-800 dark:text-gray-200 rounded-tl-sm'
              }`}
            >
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm p-4 shadow-sm flex space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="flex space-x-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(q);
              }}
              className="flex-shrink-0 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 dark:text-blue-300 px-3 py-1.5 rounded-full transition-colors border border-blue-100 dark:border-blue-800"
            >
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the voting process..."
            className="w-full pl-5 pr-14 py-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white dark:focus:bg-gray-900 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
