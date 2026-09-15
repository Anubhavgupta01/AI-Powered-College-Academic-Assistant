import { useState } from 'react';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import ChatPage from '@/pages/ChatPage';

type Page = 'landing' | 'auth' | 'chat';

function App() {
  const [page, setPage] = useState<Page>('landing');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleGetStarted = () => {
    setAuthMode('signup');
    setPage('auth');
  };

  const handleLogin = () => {
    setAuthMode('login');
    setPage('auth');
  };

  const handleAuth = () => {
    setPage('chat');
  };

  const handleBackToLanding = () => {
    setPage('landing');
  };

  const handleLogout = () => {
    setPage('landing');
  };

  if (page === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />;
  }

  if (page === 'auth') {
    return (
      <AuthPage
        initialMode={authMode}
        onBack={handleBackToLanding}
        onAuth={handleAuth}
      />
    );
  }

  return <ChatPage onLogout={handleLogout} />;
}

export default App;
