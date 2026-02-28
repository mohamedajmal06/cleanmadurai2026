import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Mail, Lock, ArrowRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '../App';

export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        onLogin(data.user);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-dark min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-6 py-8">
        <Link to="/landing" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <div className="card-dark p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-primary rounded-2xl mb-6 shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <Leaf className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-slate-400 text-sm">Login to your citizen account</p>
            </div>

            <div className="flex p-1 bg-black/40 rounded-xl mb-8 border border-white/5">
              <button className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Login
              </button>
              <Link to="/register" className="flex-1 py-2.5 text-sm font-bold rounded-lg text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                <UserIcon className="w-4 h-4" />
                Sign Up
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-dark pr-12"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 group mt-4"
              >
                {loading ? 'Logging in...' : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    Login
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 text-xs mt-8">
              By continuing, you agree to help make Madurai cleaner 🌿
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link to="/authority-login" className="text-primary/60 hover:text-primary text-sm font-medium transition-colors">
              Are you a Municipal Authority? →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
    </svg>
  );
}
