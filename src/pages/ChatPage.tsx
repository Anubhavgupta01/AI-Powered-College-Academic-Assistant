import { useState, useRef, useEffect, FormEvent } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileText,
  CalendarDays,
  Menu,
  X,
  LogOut,
  Plus,
  MessageSquareText,
  Search,
  Trash2,
  ChevronRight,
  GraduationCap,
  ExternalLink,
  Clock,
  MapPin,
  AlertCircle,
  Lightbulb,
  History,
} from 'lucide-react';
import AbesLogo from '@/components/AbesLogo';

type ChatPageProps = {
  onLogout: () => void;
};

type Citation = {
  source: string;
  section: string;
  url?: string;
};

type Event = {
  title: string;
  date: string;
  time: string;
  location: string;
  category: 'academic' | 'cultural' | 'technical' | 'deadline';
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  events?: Event[];
  timestamp: string;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  date: string;
};

const suggestedQuestions = [
  'What is the minimum attendance required for semester exams?',
  'When is the next technical fest?',
  'What is the grading system at ABES?',
  'How do I apply for a scholarship?',
  'What are the hostel rules and regulations?',
  'When does the semester registration start?',
];

const sampleEvents: Event[] = [
  {
    title: 'TechFest 2024 — Innovation Summit',
    date: 'Sep 20, 2024',
    time: '9:00 AM',
    location: 'Main Auditorium',
    category: 'technical',
  },
  {
    title: 'Mid-Semester Examinations',
    date: 'Oct 5, 2024',
    time: '10:00 AM',
    location: 'Exam Block, Room 201-210',
    category: 'academic',
  },
  {
    title: 'Cultural Night — Rangmanch',
    date: 'Oct 15, 2024',
    time: '6:00 PM',
    location: 'Open Air Theatre',
    category: 'cultural',
  },
  {
    title: 'Scholarship Application Deadline',
    date: 'Sep 30, 2024',
    time: '11:59 PM',
    location: 'Online Portal',
    category: 'deadline',
  },
];

const categoryStyles: Record<Event['category'], { bg: string; text: string; border: string; label: string }> = {
  academic: { bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-200', label: 'Academic' },
  cultural: { bg: 'bg-accent-50', text: 'text-accent-700', border: 'border-accent-200', label: 'Cultural' },
  technical: { bg: 'bg-success-50', text: 'text-success-700', border: 'border-success-200', label: 'Technical' },
  deadline: { bg: 'bg-error-50', text: 'text-error-700', border: 'border-error-200', label: 'Deadline' },
};

const initialConversation: Conversation = {
  id: '1',
  title: 'Attendance Policy Query',
  date: 'Today',
  messages: [
    {
      id: 'm1',
      role: 'user',
      content: 'What is the attendance requirement for appearing in semester exams?',
      timestamp: '10:32 AM',
    },
    {
      id: 'm2',
      role: 'assistant',
      content:
        'Students must maintain a minimum of **75% attendance** in each subject to be eligible for semester examinations. This includes both theory and practical sessions. Students falling below this threshold may be detained from exams and will need to apply for condonation.\n\nKey points:\n• 75% minimum in each subject (theory + practical)\n• Medical leave requires valid documentation\n• Condonation fee applies for attendance between 65%-75%\n• Below 65% results in automatic detention',
      citations: [
        { source: 'ABES Student Handbook 2024-25', section: 'Section 4.3 — Attendance Requirements' },
        { source: 'Academic Regulations', section: 'Clause 12(b) — Examination Eligibility' },
      ],
      timestamp: '10:32 AM',
    },
  ],
};

const pastConversations: Conversation[] = [
  { id: '2', title: 'Scholarship Application Process', messages: [], date: 'Yesterday' },
  { id: '3', title: 'Hostel Rules and Curfew', messages: [], date: 'Yesterday' },
  { id: '4', title: 'Grading System Explained', messages: [], date: '3 days ago' },
  { id: '5', title: 'Event Calendar — September', messages: [], date: '1 week ago' },
  { id: '6', title: 'Semester Registration Steps', messages: [], date: '1 week ago' },
  { id: '7', title: 'Library Resources Available', messages: [], date: '2 weeks ago' },
];

function formatContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('• ')) {
      return (
        <div key={i} className="flex items-start gap-2 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-2 flex-shrink-0" />
          <span>{renderBold(line.slice(2))}</span>
        </div>
      );
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-semibold text-ink-900">{line.slice(2, -2)}</p>;
    }
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i}>{renderBold(line)}</p>;
  });
}

function renderBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-primary-700">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatPage({ onLogout }: ChatPageProps) {
  const [conversations, setConversations] = useState<Conversation[]>([initialConversation, ...pastConversations]);
  const [activeId, setActiveId] = useState('1');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation.messages, isTyping]);

  const handleSend = (e?: FormEvent, question?: string) => {
    e?.preventDefault();
    const text = question || input.trim();
    if (!text) return;

    const userMsg: Message = {
      id: `m${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, userMsg], title: c.messages.length === 0 ? text.slice(0, 40) : c.title }
          : c
      )
    );
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses: Record<string, { content: string; citations?: Citation[]; events?: Event[] }> = {
        attendance: {
          content:
            'Students must maintain a minimum of **75% attendance** in each subject to be eligible for semester examinations. This includes both theory and practical sessions.\n\nKey points:\n• 75% minimum in each subject\n• Medical leave requires valid documentation\n• Condonation available between 65%-75%',
          citations: [
            { source: 'ABES Student Handbook 2024-25', section: 'Section 4.3 — Attendance Requirements' },
          ],
        },
        fest: {
          content:
            'The next major event is **TechFest 2024 — Innovation Summit**, scheduled for September 20th. It features hackathons, project exhibitions, and guest talks from industry leaders.\n\nRegistration is open to all students. You can register through the college portal.',
          citations: [{ source: 'ABES Event Calendar 2024-25', section: 'September Events' }],
          events: sampleEvents,
        },
        grading: {
          content:
            'ABES follows a **10-point CGPA system** as per AKTU guidelines.\n\nGrading scale:\n• O (Outstanding): 10 points\n• A+ (Excellent): 9 points\n• A (Very Good): 8 points\n• B+ (Good): 7 points\n• B (Above Average): 6 points\n• C (Average): 5 points\n• F (Fail): 0 points\n\nSGPA is calculated per semester, and CGPA is the cumulative average across all semesters.',
          citations: [
            { source: 'ABES Academic Regulations', section: 'Section 6 — Grading System' },
            { source: 'AKTU Examination Scheme', section: 'Appendix A' },
          ],
        },
        scholarship: {
          content:
            'To apply for a scholarship at ABES, follow these steps:\n\n• Check eligibility on the scholarship portal\n• Gather required documents (income certificate, mark sheets, caste certificate if applicable)\n• Fill out the online application on the National Scholarship Portal\n• Submit hard copy to the Student Affairs office\n• Track your application status online\n\nThe deadline for this semester is **September 30th**.',
          citations: [
            { source: 'ABES Scholarship Guide 2024-25', section: 'Section 2 — Application Process' },
            { source: 'National Scholarship Portal', section: 'Eligibility Criteria' },
          ],
          events: [sampleEvents[3]],
        },
        hostel: {
          content:
            'ABES hostel rules include:\n\n• Curfew: 10:00 PM (girls), 11:00 PM (boys)\n• No outside guests allowed after 8:00 PM\n• Mess timing: 7-9 AM, 12-2 PM, 7-9 PM\n• Cleanliness inspection every Saturday\n• Leave application required for overnight absence\n• No electrical appliances above 1000W\n• Wi-Fi available 6 AM - 11 PM',
          citations: [{ source: 'ABES Hostel Handbook 2024-25', section: 'Section 3 — Rules and Regulations' }],
        },
        registration: {
          content:
            'Semester registration typically begins **2 weeks before** the start of a new semester. The process is:\n\n• Log in to the student portal\n• Select courses for the semester\n• Pay the semester fee\n• Get advisor approval\n• Download your registration slip\n\nRegistration for the Fall 2024 semester is currently open.',
          citations: [{ source: 'ABES Academic Calendar 2024-25', section: 'Registration Timeline' }],
          events: sampleEvents.slice(0, 2),
        },
      };

      const key = Object.keys(responses).find((k) => text.toLowerCase().includes(k));
      const response = key
        ? responses[key]
        : {
            content:
              "I can help you with questions about academic policies, attendance, exams, events, scholarships, hostel rules, and more. Could you please rephrase your question or try one of the suggested questions below?",
            citations: [{ source: 'ABES Knowledge Base', section: 'General Information' }],
          };

      const assistantMsg: Message = {
        id: `m${Date.now() + 1}`,
        role: 'assistant',
        content: response.content,
        citations: response.citations,
        events: response.events,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };

      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, messages: [...c.messages, assistantMsg] } : c))
      );
      setIsTyping(false);
    }, 1500);
  };

  const handleNewChat = () => {
    const newConv: Conversation = {
      id: `c${Date.now()}`,
      title: 'New Conversation',
      messages: [],
      date: 'Today',
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveId(remaining[0]?.id || '');
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-ink-50 overflow-hidden">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-ink-200 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-ink-100">
          <div className="flex items-center justify-between mb-4">
            <AbesLogo size={32} showText={false} />
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-ghost p-1.5">
              <X className="w-5 h-5" />
            </button>
          </div>
          <button onClick={handleNewChat} className="w-full btn-primary py-2.5 text-sm">
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-ink-50 border border-ink-200 text-sm text-ink-700 placeholder-ink-400 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-sm text-ink-400">
              No conversations found
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 mb-0.5 ${
                  activeId === conv.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-ink-50 text-ink-600'
                }`}
                onClick={() => {
                  setActiveId(conv.id);
                  setSidebarOpen(false);
                }}
              >
                <MessageSquareText
                  className={`w-4 h-4 flex-shrink-0 ${activeId === conv.id ? 'text-primary-600' : 'text-ink-400'}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{conv.title}</div>
                  <div className="text-xs text-ink-400">{conv.date}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-error-50 hover:text-error-600 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Sidebar footer */}
        <div className="p-3 border-t border-ink-100">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-ink-50 transition-colors cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-semibold">
              S
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink-700 truncate">Student User</div>
              <div className="text-xs text-ink-400 truncate">student@abes.ac.in</div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg hover:bg-error-50 hover:text-error-600 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-ink-200 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-ghost p-2">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-ink-800">
                {activeConversation.title}
              </h1>
              <div className="text-xs text-ink-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse-soft" />
                ABES Academic Assistant
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setEventsOpen(!eventsOpen)}
              className={`btn-ghost text-sm hidden sm:flex ${eventsOpen ? 'bg-primary-50 text-primary-600' : ''}`}
            >
              <CalendarDays className="w-4 h-4" />
              Events
            </button>
            <button onClick={onLogout} className="btn-ghost text-sm">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </header>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-3xl mx-auto px-4 py-6 lg:px-6">
            {activeConversation.messages.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center mb-5 shadow-lg shadow-primary-600/25">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-extrabold text-ink-900 mb-2">
                  How can I help you today?
                </h2>
                <p className="text-ink-500 mb-8 max-w-md">
                  Ask me anything about academic policies, events, exams, attendance, scholarships, and more.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(undefined, q)}
                      className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-ink-200 hover:border-primary-300 hover:shadow-md transition-all duration-200 text-left animate-fade-in-up"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center flex-shrink-0 transition-colors">
                        <Lightbulb className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm text-ink-600 group-hover:text-ink-900 font-medium">{q}</span>
                      <ChevronRight className="w-4 h-4 text-ink-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all ml-auto flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-6">
                {activeConversation.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'rounded-tr-sm bg-primary-600 text-white'
                            : 'rounded-tl-sm bg-white border border-ink-200 text-ink-700'
                        }`}
                      >
                        <div className="space-y-1">{formatContent(msg.content)}</div>
                      </div>

                      {/* Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-xs font-semibold text-ink-400 flex items-center gap-1.5 px-1">
                            <FileText className="w-3.5 h-3.5" />
                            Sources ({msg.citations.length})
                          </div>
                          {msg.citations.map((citation, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-success-50 border border-success-200/60 hover:bg-success-100/50 transition-colors cursor-pointer group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-3.5 h-3.5 text-success-700" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-success-800 truncate">{citation.source}</div>
                                <div className="text-xs text-success-600 truncate">{citation.section}</div>
                              </div>
                              <ExternalLink className="w-3.5 h-3.5 text-success-400 group-hover:text-success-600 transition-colors flex-shrink-0" />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Events */}
                      {msg.events && msg.events.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-xs font-semibold text-ink-400 flex items-center gap-1.5 px-1">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Related Events ({msg.events.length})
                          </div>
                          {msg.events.map((event, i) => {
                            const style = categoryStyles[event.category];
                            return (
                              <div
                                key={i}
                                className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-white border border-ink-200 hover:shadow-sm transition-all"
                              >
                                <div className={`px-2 py-0.5 rounded text-xs font-semibold ${style.bg} ${style.text} ${style.border} border flex-shrink-0`}>
                                  {style.label}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-semibold text-ink-800">{event.title}</div>
                                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-ink-500">
                                    <span className="flex items-center gap-1">
                                      <CalendarDays className="w-3 h-3" /> {event.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {event.time}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" /> {event.location}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className={`text-xs text-ink-400 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                        {msg.timestamp}
                      </div>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ink-400 to-ink-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white text-sm font-semibold">S</span>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm bg-white border border-ink-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse-soft" />
                        <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse-soft" style={{ animationDelay: '200ms' }} />
                        <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse-soft" style={{ animationDelay: '400ms' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-ink-200 bg-white px-4 py-4 lg:px-6">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSend} className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about academics, events, policies..."
                  rows={1}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-ink-50 border border-ink-200 text-sm text-ink-800 placeholder-ink-400 focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none focus:bg-white resize-none transition-all max-h-32"
                  style={{ minHeight: '48px' }}
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/25 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="mt-2 text-xs text-ink-400 text-center flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Answers are AI-generated and citation-backed. Verify critical information with the relevant department.
            </p>
          </div>
        </div>
      </main>

      {/* Events Panel */}
      {eventsOpen && (
        <>
          <div
            className="fixed inset-0 bg-ink-900/20 backdrop-blur-sm z-30"
            onClick={() => setEventsOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-ink-200 z-40 flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between p-4 border-b border-ink-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary-600" />
                <h2 className="font-semibold text-ink-800">Upcoming Events</h2>
              </div>
              <button onClick={() => setEventsOpen(false)} className="btn-ghost p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
              {sampleEvents.map((event, i) => {
                const style = categoryStyles[event.category];
                return (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white border border-ink-200 hover:shadow-md transition-all animate-fade-in-up"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${style.bg} ${style.text} ${style.border} border mb-2`}>
                      {style.label}
                    </div>
                    <h3 className="text-sm font-bold text-ink-900 mb-2">{event.title}</h3>
                    <div className="space-y-1 text-xs text-ink-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {event.location}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 border-t border-ink-100">
              <div className="flex items-center gap-2 text-xs text-ink-400">
                <History className="w-3.5 h-3.5" />
                Events sourced from ABES Academic Calendar 2024-25
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
