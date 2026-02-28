import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowRight, ChevronLeft, Eye, EyeOff, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '../App';

export default function AuthorityLogin({ onLogin }: { onLogin: (user: User) => void }) {
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
        if (data.user.role !== 'authority') {
          setError('This portal is for municipal authorities only.');
          return;
        }
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
          <div className="card-dark p-8 sm:p-10 border-accent/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-accent/20 rounded-2xl mb-6 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <Shield className="w-10 h-10 text-accent" />
              </div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">Authority Portal</h1>
              <p className="text-slate-400 text-sm">Madurai City Corporation Login</p>
            </div>

            <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl mb-8 flex gap-3">
              <Info className="w-5 h-5 text-accent shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-accent uppercase tracking-wider">Demo Authority Account</p>
                <div className="text-[10px] text-slate-400 space-y-1">
                  <p>Email: <span className="text-white font-mono">authority@mcc.tn.gov.in</span></p>
                  <p>Password: <span className="text-white font-mono">admin123</span></p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Official Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-dark border-white/5 focus:ring-accent/50"
                    placeholder="authority@mcc.tn.gov.in"
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
                    className="input-dark border-white/5 focus:ring-accent/50 pr-12"
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
                className="w-full bg-accent hover:bg-blue-600 text-white py-4 text-lg font-bold rounded-xl flex items-center justify-center gap-3 group mt-4 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-95"
              >
                {loading ? 'Verifying...' : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    Login to Dashboard
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-medium">
              <Lock className="w-3 h-3" />
              Secure government portal • Madurai City Corporation
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
