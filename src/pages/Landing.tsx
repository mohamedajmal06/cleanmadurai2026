import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Shield, ArrowRight, CheckCircle2, Lock, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  return (
    <div className="theme-dark overflow-hidden">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl shadow-[0_0_15px_rgba(34,197,94,0.5)]">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white leading-tight">Clean Madurai</h1>
            <p className="text-[10px] text-primary font-medium tracking-wider uppercase hidden sm:block">Smart Waste Management Platform</p>
          </div>
        </div>
        <div className="hidden sm:flex gap-4">
          <Link to="/login" className="btn-outline-dark text-sm px-6">Citizen Login</Link>
          <Link to="/authority-login" className="btn-primary text-sm px-6 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Authority Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center relative">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-8"
        >
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          AI-Powered Smart Waste Management
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl sm:text-8xl font-display font-bold text-white mb-6 tracking-tight"
        >
          Make Madurai <br />
          <span className="text-primary">Clean & Green</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Report garbage issues, track cleanups in real-time, and help Madurai become India's cleanest city through AI-verified citizen participation.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/register" className="btn-primary py-4 px-10 text-lg font-bold flex items-center gap-3 w-full sm:w-auto">
            <CheckCircle2 className="w-6 h-6" />
            I'm a Citizen
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/authority-login" className="btn-outline-dark py-4 px-10 text-lg font-bold flex items-center gap-3 w-full sm:w-auto border-white/10 hover:border-primary/50">
            <Shield className="w-6 h-6" />
            Authority Portal
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Features Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 flex flex-wrap justify-center gap-8 text-slate-500 text-sm font-medium"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            Free to use
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            Secure
          </div>
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            AI-verified
          </div>
        </motion.div>
      </main>

      {/* Floating Chat Icon */}
      <div className="fixed bottom-8 right-8">
        <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)] cursor-pointer hover:scale-110 transition-transform">
          <Bot className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}
