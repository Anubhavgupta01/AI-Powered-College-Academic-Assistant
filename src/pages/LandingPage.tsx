import { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  CalendarDays,
  ShieldCheck,
  Zap,
  Quote,
  ArrowRight,
  Check,
  Menu,
  X,
  MessageSquareText,
  FileText,
  Clock,
  ChevronDown,
  Search,
  Bot,
  Users,
  Award,
} from 'lucide-react';
import AbesLogo from '@/components/AbesLogo';

type LandingPageProps = {
  onGetStarted: () => void;
  onLogin: () => void;
};

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const features = [
    {
      icon: MessageSquareText,
      title: 'Instant Q&A',
      desc: 'Ask any question about academics, policies, attendance, or exams. Get clear, accurate answers in seconds.',
      color: 'bg-primary-50 text-primary-600',
    },
    {
      icon: FileText,
      title: 'Citation-Backed',
      desc: 'Every answer includes source citations linking directly to official college documents and handbooks.',
      color: 'bg-success-50 text-success-600',
    },
    {
      icon: CalendarDays,
      title: 'Event Updates',
      desc: 'Stay informed about fests, workshops, deadlines, and academic calendars — all in one place.',
      color: 'bg-accent-50 text-accent-600',
    },
    {
      icon: ShieldCheck,
      title: 'Verified Sources',
      desc: 'Answers are grounded in official ABES documents — no hallucinations, no misinformation.',
      color: 'bg-warning-50 text-warning-600',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      desc: 'Powered by RAG technology for sub-second retrieval from the entire knowledge base.',
      color: 'bg-primary-50 text-primary-600',
    },
    {
      icon: Bot,
      title: 'AI-Powered',
      desc: 'Natural language understanding means you can ask questions the way you actually talk.',
      color: 'bg-success-50 text-success-600',
    },
  ];

  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Ask Your Question',
      desc: 'Type your question in plain English — no need for specific keywords or formal queries.',
    },
    {
      number: '02',
      icon: Sparkles,
      title: 'AI Retrieves & Reasons',
      desc: 'The system searches the entire document corpus and uses AI to synthesize a precise answer.',
    },
    {
      number: '03',
      icon: Check,
      title: 'Get Cited Answers',
      desc: 'Receive a clear answer with source citations you can click to verify the information.',
    },
  ];

  const faqs = [
    {
      q: 'What kind of questions can I ask?',
      a: 'You can ask about academic policies, attendance rules, exam schedules, grading systems, event dates, campus facilities, hostel rules, scholarship criteria, and more. If it is in an official ABES document, the assistant can answer it.',
    },
    {
      q: 'Are the answers always accurate?',
      a: 'The assistant uses Retrieval-Augmented Generation (RAG), meaning every answer is grounded in official college documents. Each response includes citations so you can verify the source yourself. However, for critical decisions, always confirm with the relevant department.',
    },
    {
      q: 'Do I need an account to use it?',
      a: 'Yes, you need to sign in with your college email. This helps keep the platform secure and allows us to save your conversation history for future reference.',
    },
    {
      q: 'Can it tell me about upcoming events?',
      a: 'Absolutely. The assistant has access to event calendars and can tell you about upcoming fests, workshops, deadlines, and academic events with dates and details.',
    },
    {
      q: 'Is my data stored or shared?',
      a: 'Your conversation history is stored securely and is only accessible to you. We do not share your data with third parties.',
    },
  ];

  const stats = [
    { value: '500+', label: 'Documents Indexed' },
    { value: '<2s', label: 'Average Response Time' },
    { value: '24/7', label: 'Always Available' },
    { value: '100%', label: 'Citation-Backed' },
  ];

  return (
    <div className="min-h-screen bg-ink-50 overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={onGetStarted} className="flex items-center">
              <AbesLogo size={36} />
            </button>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-ink-600 hover:text-primary-600 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-ink-600 hover:text-primary-600 transition-colors">
                How It Works
              </a>
              <a href="#faq" className="text-sm font-medium text-ink-600 hover:text-primary-600 transition-colors">
                FAQ
              </a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={onLogin} className="btn-ghost text-sm">
                Sign In
              </button>
              <button onClick={onGetStarted} className="btn-primary text-sm py-2.5 px-5">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-ink-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-ink-200/40 animate-fade-in-down">
            <div className="px-4 py-4 space-y-2">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors">
                Features
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors">
                How It Works
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-medium text-ink-600 hover:bg-ink-100 transition-colors">
                FAQ
              </a>
              <div className="pt-2 space-y-2">
                <button onClick={onLogin} className="w-full btn-secondary text-sm py-2.5">
                  Sign In
                </button>
                <button onClick={onGetStarted} className="w-full btn-primary text-sm py-2.5">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-primary-200/40 via-primary-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-accent-200/30 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-200/60 text-primary-700 text-sm font-medium mb-6 animate-fade-in-down">
              <Sparkles className="w-4 h-4" />
              AI-Powered Academic Q&A for ABES Engineering College
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink-900 leading-tight text-balance animate-fade-in-up">
              Get instant answers about
              <span className="gradient-text"> college academics</span>
            </h1>

            <p className="mt-6 text-lg text-ink-500 leading-relaxed max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Ask questions about policies, events, exams, attendance, and more.
              Every answer is backed by official sources with citations you can verify.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-300">
              <button onClick={onGetStarted} className="btn-primary text-base px-8 py-3.5">
                Start Asking
                <ArrowRight className="w-5 h-5" />
              </button>
              <a href="#how-it-works" className="btn-secondary text-base px-8 py-3.5">
                See How It Works
              </a>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up animation-delay-500">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-extrabold gradient-text font-display">{stat.value}</div>
                  <div className="text-sm text-ink-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Chat Preview */}
          <div className="mt-20 max-w-4xl mx-auto animate-fade-in-up animation-delay-700">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary-200/30 to-accent-200/30 rounded-3xl blur-2xl" />
              <div className="relative bg-white rounded-2xl shadow-2xl shadow-ink-900/10 border border-ink-200/60 overflow-hidden">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-100 bg-ink-50/50">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink-800">ABES Academic Assistant</div>
                    <div className="text-xs text-success-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse-soft" />
                      Online
                    </div>
                  </div>
                </div>

                {/* Chat body */}
                <div className="p-5 space-y-4 bg-ink-50/30 min-h-[280px]">
                  <div className="flex justify-end">
                    <div className="max-w-md px-4 py-2.5 rounded-2xl rounded-tr-sm bg-primary-600 text-white text-sm">
                      What is the attendance requirement for appearing in semester exams?
                    </div>
                  </div>
                  <div className="flex justify-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="max-w-lg space-y-2">
                      <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-ink-200 text-sm text-ink-700 leading-relaxed">
                        Students must maintain a minimum of <strong className="text-primary-700">75% attendance</strong> to be eligible for semester examinations. This includes both theory and practical classes. Students falling below this threshold may be detained from exams.
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success-50 border border-success-200/60">
                        <FileText className="w-3.5 h-3.5 text-success-600" />
                        <span className="text-xs text-success-700 font-medium">Source: ABES Student Handbook 2024-25, Section 4.3</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat input preview */}
                <div className="px-5 py-4 border-t border-ink-100 bg-white">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-ink-50 border border-ink-200">
                    <MessageSquareText className="w-4 h-4 text-ink-400" />
                    <span className="text-sm text-ink-400 flex-1">Ask anything about academics...</span>
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold uppercase tracking-wider mb-4">
              Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 text-balance">
              Everything you need to navigate college academics
            </h2>
            <p className="mt-4 text-ink-500 text-lg">
              A comprehensive AI assistant built specifically for ABES Engineering College students.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="card p-6 hover:-translate-y-1 group animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-ink-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-ink-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-50 text-accent-600 text-xs font-semibold uppercase tracking-wider mb-4">
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 text-balance">
              Three simple steps to get your answers
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative text-center animate-fade-in-up" style={{ animationDelay: `${i * 200}ms` }}>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-px border-t-2 border-dashed border-ink-200" />
                )}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-white border border-ink-200 shadow-sm mb-6">
                  <step.icon className="w-10 h-10 text-primary-600" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-ink-900 mb-2">{step.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Values Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success-50 text-success-600 text-xs font-semibold uppercase tracking-wider mb-4">
                Why Trust It
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 text-balance mb-6">
                Grounded in official sources, not guesswork
              </h2>
              <p className="text-ink-500 text-lg leading-relaxed mb-8">
                Unlike generic chatbots, the ABES Academic Assistant uses Retrieval-Augmented Generation (RAG) to pull answers directly from official college documents. Every response includes citations so you can verify the information yourself.
              </p>
              <div className="space-y-4">
                {[
                  { icon: ShieldCheck, text: 'Answers sourced from official ABES documents and handbooks' },
                  { icon: FileText, text: 'Every response includes clickable source citations' },
                  { icon: Users, text: 'Built specifically for ABES Engineering College students' },
                  { icon: Award, text: 'Continuously updated with the latest academic policies' },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-success-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-success-600" />
                    </div>
                    <span className="text-sm text-ink-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary-100/40 to-accent-100/40 rounded-3xl blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="card p-5">
                    <BookOpen className="w-8 h-8 text-primary-600 mb-3" />
                    <div className="text-sm font-bold text-ink-900">Student Handbook</div>
                    <div className="text-xs text-ink-500 mt-1">Policies, rules, and procedures</div>
                  </div>
                  <div className="card p-5">
                    <CalendarDays className="w-8 h-8 text-accent-600 mb-3" />
                    <div className="text-sm font-bold text-ink-900">Event Calendar</div>
                    <div className="text-xs text-ink-500 mt-1">Fests, workshops, deadlines</div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="card p-5">
                    <GraduationCap className="w-8 h-8 text-success-600 mb-3" />
                    <div className="text-sm font-bold text-ink-900">Academic Info</div>
                    <div className="text-xs text-ink-500 mt-1">Exams, grading, attendance</div>
                  </div>
                  <div className="card p-5">
                    <ShieldCheck className="w-8 h-8 text-warning-600 mb-3" />
                    <div className="text-sm font-bold text-ink-900">Verified Sources</div>
                    <div className="text-xs text-ink-500 mt-1">Citations on every answer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial / Quote Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Quote className="w-12 h-12 text-primary-300 mx-auto mb-6" />
          <blockquote className="text-2xl sm:text-3xl font-display font-medium text-white leading-relaxed text-balance">
            "I used to spend hours searching through the handbook for simple answers about attendance rules and exam policies. Now I just ask and get an answer in seconds with the exact page reference."
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <div className="text-white font-semibold">Student, ABES Engineering College</div>
              <div className="text-primary-200 text-sm">Information Technology Dept.</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 sm:py-28 bg-ink-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold uppercase tracking-wider mb-4">
              FAQ
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-ink-900 text-balance">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="card overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-ink-50/50 transition-colors"
                >
                  <span className="font-semibold text-ink-800 text-sm">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-ink-400 flex-shrink-0 transition-transform duration-300 ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? 'max-h-60' : 'max-h-0'
                  }`}
                >
                  <div className="px-5 pb-4 text-sm text-ink-500 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-ink-900 to-primary-950 p-10 sm:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent-400/10 rounded-full blur-3xl" />

            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-balance">
                Ready to get your answers?
              </h2>
              <p className="mt-4 text-ink-300 text-lg max-w-xl mx-auto">
                Sign in with your college email and start asking questions right away.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={onGetStarted}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-ink-900 font-semibold shadow-lg hover:bg-ink-100 active:scale-[0.98] transition-all duration-200"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onLogin}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 text-white font-semibold border border-white/20 backdrop-blur-sm hover:bg-white/20 active:scale-[0.98] transition-all duration-200"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-900 text-ink-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <AbesLogo size={36} variant="dark" />
              <p className="mt-4 text-sm text-ink-400 max-w-sm leading-relaxed">
                An AI-powered academic assistant built for ABES Engineering College students. Get instant, citation-backed answers to all your academic questions.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">College</h4>
              <ul className="space-y-2 text-sm">
                <li><span className="text-ink-500">ABES Engineering College</span></li>
                <li><span className="text-ink-500">Ghaziabad, U.P.</span></li>
                <li className="flex items-center gap-1 text-ink-500"><Clock className="w-3.5 h-3.5" /> 24/7 Available</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-ink-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-ink-500">
              © 2024 ABES Academic Assistant. Built for students, by students.
            </p>
            <p className="text-xs text-ink-500">
              Not officially affiliated with ABES Engineering College.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
