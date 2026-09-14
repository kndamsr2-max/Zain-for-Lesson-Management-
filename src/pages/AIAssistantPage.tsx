import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  RefreshCw,
  HelpCircle,
  Clock,
  AlertCircle,
  Database,
  ArrowRight,
} from 'lucide-react';
import { Student, Group, PaymentRecord, AttendanceRecord } from '../types';
import { aiAssistantService, ChatMessage } from '../services/aiAssistantService';

interface AIAssistantPageProps {
  students: Student[];
  groups: Group[];
  payments: PaymentRecord[];
  attendance: AttendanceRecord[];
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  students,
  groups,
  payments,
  attendance,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: 'أهلاً بك! أنا مساعد زين الذكي. يمكنك سؤالي عن أي طالب، مجموعة، مدفوعات، أو مبالغ متبقية، وسأجيبك مباشرة من واقع قاعدة بيانات السنتر الحقيقية.',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const quickQuestions = [
    'مين الطلاب الموجودين؟',
    'مين عليه فلوس؟',
    'مين دفع؟',
    students.length > 0 ? `${students[0].name} دفع كام؟` : 'أحمد محمد دفع كام؟',
    students.length > 0 ? `${students[0].name} في مجموعة إيه؟` : 'أحمد في مجموعة إيه؟',
    groups.length > 0 ? `مين في ${groups[0].name}؟` : 'المجموعات المتاحة',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsLoading(true);

    try {
      const reply = await aiAssistantService.askAssistant(query, {
        students,
        groups,
        payments,
        attendance,
      });

      const botMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setErrorMessage('تعذر معالجة الطلب حالياً. يرجى المحاولة مرة أخرى.');
      const errBotMsg: ChatMessage = {
        id: 'bot-err-' + Date.now(),
        sender: 'assistant',
        text: 'عذراً، حدث خطأ أثناء الاستعلام من قاعدة البيانات. يرجى إعادة المحاولة.',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errBotMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-msg-reset',
        sender: 'assistant',
        text: 'تم بدء محادثة جديدة. كيف يمكنني مساعدتك اليوم؟',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-4 select-none max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066ff] flex items-center justify-center border border-blue-100 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">المساعد الذكي للسنتر</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0066ff] border border-blue-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#0066ff]" />
                بيانات حقيقية 100%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              إجابات فورية ودقيقة مستخرجة مباشرة من سجلات الطلاب والمجموعات والمقبوضات
            </p>
          </div>
        </div>

        <button
          id="btn-clear-chat"
          type="button"
          onClick={handleClearChat}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#0066ff]" />
          <span>محادثة جديدة</span>
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
        {/* Messages List Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <Bot className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">لا توجد رسائل حالياً</p>
              <p className="text-xs text-slate-400 mt-1">ابدأ بطرح أي سؤال عن بيانات السنتر أدناه.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                  msg.sender === 'user' ? 'mr-auto flex-row-reverse' : 'ml-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.sender === 'user'
                      ? 'bg-[#0066ff] text-white shadow-xs'
                      : msg.isError
                      ? 'bg-rose-100 text-rose-700 border border-rose-200'
                      : 'bg-blue-50 text-[#0066ff] border border-blue-200'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-[#0066ff] text-white rounded-tl-none font-medium'
                      : msg.isError
                      ? 'bg-rose-50 border border-rose-200 text-rose-800 rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tr-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-2 font-mono ${
                      msg.sender === 'user' ? 'text-blue-100 text-left' : 'text-slate-400 text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 max-w-[75%] ml-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066ff] border border-blue-200 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 text-slate-600 rounded-2xl rounded-tr-none p-3.5 flex items-center gap-2 text-xs shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#0066ff] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#0066ff] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#0066ff] animate-bounce [animation-delay:0.4s]" />
                <span className="mr-1 text-slate-500">جاري قراءة البيانات الحقيقية من قاعدة البيانات...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-500 font-bold shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-[#0066ff]" />
            أسئلة سريعة:
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              id={`quick-question-btn-${idx}`}
              type="button"
              disabled={isLoading}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50 text-xs font-semibold shadow-xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          {errorMessage && (
            <div className="mb-2 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-[#0066ff] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0066ff]/20 transition-all">
            <input
              id="ai-assistant-input"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="اسأل المساعد (مثلاً: فلان دفع كام؟ / مين في مجموعة كذا؟)..."
              className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />

            <button
              id="ai-assistant-send-btn"
              type="button"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputQuery.trim()}
              className="p-2 bg-[#0066ff] hover:bg-[#0055ee] disabled:opacity-40 text-white rounded-lg transition-all cursor-pointer shadow-xs shrink-0"
              aria-label="إرسال"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
            <span>المساعد يجيب فقط من واقع البيانات الحقيقية المحفوظة في السنتر ولا يخترع معلومات.</span>
            <span className="font-mono text-[#0066ff] font-bold">قاعدة بيانات مباشرة ومؤمنة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
