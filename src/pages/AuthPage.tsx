import { useState, FormEvent } from 'react';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  Check,
} from 'lucide-react';
import AbesLogo from '@/components/AbesLogo';

type AuthPageProps = {
  initialMode?: 'login' | 'signup';
  onBack: () => void;
  onAuth: () => void;
};

export default function AuthPage({ initialMode = 'login', onBack, onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (mode === 'signup' && !name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!email.endsWith('@abes.ac.in') && !email.endsWith('@abes.edu.in')) {
      newErrors.email = 'Please use your ABES college email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onAuth();
    }, 1200);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-700 via-primary-800 to-ink-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col justify-between p-12 w-full">
          <button onClick={onBack} className="flex items-center">
            <AbesLogo size={40} variant="dark" />
          </button>

          <div className="max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered
            </div>
            <h1 className="text-4xl font-extrabold text-white leading-tight text-balance">
              Your smart companion for academic information
            </h1>
            <p className="mt-4 text-primary-200 text-lg leading-relaxed">
              Get instant, citation-backed answers about policies, events, exams, and more — all from official ABES documents.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: ShieldCheck, text: 'Answers grounded in official college documents' },
                { icon: GraduationCap, text: 'Built specifically for ABES Engineering College' },
                { icon: Check, text: 'Every response includes source citations' },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-primary-100">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-primary-300 text-sm">
            <ShieldCheck className="w-4 h-4" />
            Your data is secure and never shared
          </div>
        </div>
      </div>

      {/* Right side — Form */}
      <div className="flex-1 flex flex-col bg-ink-50">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-ink-200">
          <button onClick={onBack} className="flex items-center">
            <AbesLogo size={32} />
          </button>
          <button onClick={onBack} className="btn-ghost text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-2xl font-extrabold text-ink-900">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
            </div>

            <div className="hidden lg:flex items-center gap-2 mb-8">
              <button onClick={onBack} className="btn-ghost text-sm -ml-2">
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-extrabold text-ink-900">
                {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
              </h2>
              <p className="mt-2 text-sm text-ink-500">
                {mode === 'login'
                  ? 'Enter your credentials to access the assistant'
                  : 'Use your ABES college email to get started'}
              </p>
            </div>

            {/* Mode toggle */}
            <div className="flex p-1 bg-ink-100 rounded-xl mb-6">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === 'signup'
                    ? 'bg-white text-ink-900 shadow-sm'
                    : 'text-ink-500 hover:text-ink-700'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className={`input-field pl-11 ${errors.name ? 'border-error-400 focus:border-error-400 focus:ring-error-100' : ''}`}
                    />
                  </div>
                  {errors.name && <p className="mt-1.5 text-xs text-error-600">{errors.name}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  College Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@abes.ac.in"
                    className={`input-field pl-11 ${errors.email ? 'border-error-400 focus:border-error-400 focus:ring-error-100' : ''}`}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-error-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`input-field pl-11 pr-11 ${errors.password ? 'border-error-400 focus:border-error-400 focus:ring-error-100' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-error-600">{errors.password}</p>}
              </div>

              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-ink-600 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-ink-300 text-primary-600 focus:ring-primary-200" />
                    Remember me
                  </label>
                  <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-ink-500">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setMode('signup')} className="text-primary-600 hover:text-primary-700 font-semibold">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-primary-600 hover:text-primary-700 font-semibold">
                    Sign in
                  </button>
                </>
              )}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-primary-50 border border-primary-100">
              <p className="text-xs text-primary-700 leading-relaxed text-center">
                <ShieldCheck className="w-4 h-4 inline mr-1 -mt-0.5" />
                Use your ABES college email (@abes.ac.in) to sign in. Your data is encrypted and never shared.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
