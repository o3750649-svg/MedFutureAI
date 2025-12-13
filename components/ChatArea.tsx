
import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { startChat, sendMessageStream } from '../services/geminiService';
import { sanitizeText, isValidTextLength, validationRules } from '../services/validation';
import type { ChatMessage } from '../types';
import { PaperAirplaneIcon, UserCircleIcon, SparklesIcon } from './icons';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatAreaProps {
  initialHistory: ChatMessage[];
  setHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const WelcomeMessage: ChatMessage = {
    role: 'model',
    content: 'أهلاً بك في المحادثة المباشرة مع طبيبك الرقمي. أنا "نبض"، مساعدك الطبي الفائق من تطوير Amr Ai. كيف يمكنني مساعدتك اليوم؟'
};

const ChatArea: React.FC<ChatAreaProps> = ({ initialHistory, setHistory }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [chatDisplayHistory, setChatDisplayHistory] = useState<ChatMessage[]>([WelcomeMessage, ...initialHistory]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setChatDisplayHistory([WelcomeMessage, ...initialHistory]);
  }, [initialHistory]);

  useEffect(() => {
    // Start a new chat session when the component mounts or history changes
    setChat(startChat(chatDisplayHistory));
  }, [chatDisplayHistory]); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatDisplayHistory, isStreaming]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        textareaRef.current.style.height = `${scrollHeight}px`;
    }
  }, [input]);

  const executeChatTurn = async (message: string) => {
    if (!chat || isStreaming) return;

    // Sanitize message before adding to history and sending
    const cleanMessage = sanitizeText(message);
    if (!cleanMessage) return;

    const userMessage: ChatMessage = { role: 'user', content: cleanMessage };
    setHistory(prev => [...prev, userMessage]);
    setChatDisplayHistory(prev => [...prev, userMessage, { role: 'model', content: '' }]);
    setIsStreaming(true);

    try {
        const stream = await sendMessageStream(chat, cleanMessage);
        let modelResponse = '';

        for await (const chunk of stream) {
            modelResponse += chunk.text;
            setChatDisplayHistory(prev => {
                const newHistory = [...prev];
                const lastMessage = newHistory[newHistory.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.content = modelResponse;
                }
                return newHistory;
            });
        }
        
        const suggestionRegex = /\[SUGGESTION\](.*?)\[\/SUGGESTION\]/g;
        const suggestions = [...modelResponse.matchAll(suggestionRegex)].map(match => match[1]);
        const cleanContent = modelResponse.replace(suggestionRegex, '').trim();

        const finalModelMessage: ChatMessage = {
            role: 'model',
            content: cleanContent || "عذراً، لم أتمكن من إيجاد إجابة.",
            suggestions: suggestions,
        };

        setHistory(prev => [...prev, finalModelMessage]);
        setChatDisplayHistory(prev => [...prev.slice(0, -1), finalModelMessage]);

    } catch (error) {
        console.error("Error sending message:", error);
        const errorMessage: ChatMessage = { role: 'model', content: 'عذراً، حدث خطأ ما. يرجى المحاولة مرة أخرى.' };
        setHistory(prev => [...prev, errorMessage]);
        setChatDisplayHistory(prev => [...prev.slice(0, -1), errorMessage]);
    } finally {
        setIsStreaming(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (isValidTextLength(text)) {
        setInput(text);
    }
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    executeChatTurn(input);
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    executeChatTurn(suggestion);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px] bg-slate-900/50 border border-slate-700 rounded-xl animate-fade-in-up">
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {chatDisplayHistory.map((msg, index) => {
          const isLastMessage = index === chatDisplayHistory.length - 1;
          return (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-4 items-start w-full ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'model' && (
                  <div className="w-10 h-10 flex-shrink-0 bg-cyan-500/20 rounded-full flex items-center justify-center">
                      <SparklesIcon className="w-6 h-6 text-cyan-400" />
                  </div>
                  )}
                  <div className={`max-w-xl p-4 rounded-2xl text-gray-200 ${msg.role === 'user' ? 'bg-slate-700 rounded-br-none' : 'bg-slate-800 rounded-bl-none'}`}>
                     <MarkdownRenderer text={msg.content} />
                     {msg.role === 'model' && isStreaming && isLastMessage && (
                        <span className="inline-block w-2 h-5 bg-cyan-400 ml-1 animate-pulse" />
                     )}
                  </div>
                  {msg.role === 'user' && (
                  <div className="w-10 h-10 flex-shrink-0 bg-slate-700 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  )}
              </div>
              {msg.role === 'model' && msg.suggestions && msg.suggestions.length > 0 && !isStreaming && (
                  <div className="mt-3 flex flex-wrap gap-2" style={{ marginLeft: '3.5rem' }}>
                      {msg.suggestions.map((s, i) => (
                          <button
                              key={i}
                              onClick={() => handleSuggestionClick(s)}
                              disabled={isStreaming}
                              className="bg-slate-700/60 hover:bg-slate-700 text-cyan-300 text-sm font-semibold px-4 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in-up"
                              style={{animationDelay: `${i * 100}ms`}}
                          >
                              {s}
                          </button>
                      ))}
                  </div>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-700">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="اسألني أي شيء..."
            rows={1}
            className="w-full bg-slate-800 border border-slate-600 rounded-2xl py-3 pr-6 pl-14 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-none overflow-y-auto max-h-40"
            disabled={isStreaming}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isStreaming}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-cyan-600 text-white rounded-full p-2.5 transition-all duration-300 transform hover:scale-110 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none"
            aria-label="إرسال رسالة"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
