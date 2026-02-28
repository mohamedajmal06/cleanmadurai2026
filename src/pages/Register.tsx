import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Mail, Lock, User as UserIcon, Shield, ArrowRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '../App';

export default function Register({ onLogin }: { onLogin: (user: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'citizen' | 'authority'>('citizen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await res.json();
      if (res.ok) {
        onLogin(data.user);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed');
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
              <div className="inline-flex items-center justify-center p-3 bg-primary/20 rounded-2xl mb-6 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <Trash2 className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">Join the Movement</h1>
              <p className="text-slate-400 text-sm">Create an account to help clean Madurai</p>
            </div>

            <div className="flex p-1 bg-black/40 rounded-xl mb-8 border border-white/5">
              <Link to="/login" className="flex-1 py-2.5 text-sm font-bold rounded-lg text-slate-500 hover:text-white transition-colors flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Login
              </Link>
              <button className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center gap-2">
                <UserIcon className="w-4 h-4" />
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-dark"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-dark"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-300">Password</label>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-dark"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-3 group mt-4"
              >
                {loading ? 'Creating Account...' : (
                  <>
                    <ArrowRight className="w-5 h-5" />
                    Get Started
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-slate-500 text-xs mt-8">
              By joining, you agree to help make Madurai cleaner 🌿
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
