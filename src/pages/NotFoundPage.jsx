import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Home, Swords, Search, Ghost } from 'lucide-react';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export default function NotFoundPage() {
  const navigate = useNavigate();
  useDocumentTitle('Page Not Found');

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      {/* Background Particles (Pure CSS) */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-accent/20 rounded-full animate-float"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 animate-fade-in flex flex-col items-center">
        {/* Animated Robot Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative animate-robot-wiggle">
            <Bot size={120} className="text-accent stroke-[1.5]" />
            <Ghost 
              size={40} 
              className="absolute -top-4 -right-4 text-accent/40 animate-bounce" 
            />
          </div>
        </div>

        <h1 className="text-7xl font-black mb-4 bg-gradient-to-b from-text-primary to-text-muted bg-clip-text text-transparent">
          404
        </h1>
        
        <h2 className="text-2xl font-bold dark:text-text-primary text-gray-900 mb-2">
          Looks like this agent went rogue.
        </h2>
        <p className="dark:text-text-secondary text-gray-500 max-w-md mb-10 leading-relaxed">
          The page you are looking for does not exist or has been relocated to a different sector of the grid.
        </p>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="group relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm
              bg-accent text-white hover:bg-accent-hover transition-all duration-300
              hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95 overflow-hidden"
          >
            <Home size={18} />
            <span>Go Home</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>

          <button
            onClick={() => navigate('/battle')}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm
              dark:bg-surface-card dark:border-border border border-gray-200 bg-white
              dark:text-text-primary text-gray-900 hover:border-yellow-500/50 transition-all duration-300
              hover:shadow-[0_0_20px_rgba(234,179,8,0.15)] active:scale-95"
          >
            <Swords size={18} className="group-hover:text-yellow-500 transition-colors" />
            <span>Battle Mode</span>
          </button>

          <button
            onClick={() => {
              navigate('/');
              setTimeout(() => {
                document.getElementById('agent-search')?.focus();
              }, 100);
            }}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm
              dark:bg-surface-card dark:border-border border border-gray-200 bg-white
              dark:text-text-primary text-gray-900 hover:border-accent/50 transition-all duration-300
              hover:shadow-[0_0_20px_rgba(99,102,241,0.15)] active:scale-95"
          >
            <Search size={18} className="group-hover:text-accent transition-colors" />
            <span>Browse Agents</span>
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(20px); }
          75% { transform: translateY(10px) translateX(-10px); }
        }
        @keyframes robot-wiggle {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(-8deg) translateY(-5px); }
          75% { transform: rotate(8deg) translateY(5px); }
        }
        .animate-float {
          animation: float linear infinite;
        }
        .animate-robot-wiggle {
          animation: robot-wiggle 4s ease-in-out infinite;
        }
      `}} />
    </div>
  );
}
