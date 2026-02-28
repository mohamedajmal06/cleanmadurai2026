import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  MapPin,
  Trash2,
  Skull,
  Home as HomeIcon,
  TrendingUp,
  Award,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '../App';
import { formatDistanceToNow } from 'date-fns';

export default function CitizenHome({ user }: { user: User }) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/complaints?role=citizen&user_id=${user.id}`)
      .then(res => res.json())
      .then(data => {
        setComplaints(data);
        setLoading(false);
      });
  }, [user.id]);

  const stats = {
    pending: complaints.filter(c => c.status === 'pending').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    total: complaints.length
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <section className="relative overflow-hidden rounded-3xl bg-secondary p-8 text-white">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4">
            Welcome back, <span className="text-primary">{user.name.split(' ')[0]}</span>!
          </h1>
          <p className="text-slate-300 text-lg mb-8">
            Your contributions are helping Madurai climb the Swachh Survekshan rankings.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Reported</p>
              <p className="text-2xl font-display font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Resolved</p>
              <p className="text-2xl font-display font-bold text-primary">{stats.resolved}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10 hidden sm:block">
              <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Rank</p>
              <p className="text-2xl font-display font-bold text-accent">#124</p>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 right-10 opacity-10">
          <Trash2 className="w-48 h-48" />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-primary" />
          Quick Report
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickActionLink to="/report?type=garbage" icon={<Trash2 />} label="Garbage Dump" color="bg-emerald-50 text-emerald-600" />
          <QuickActionLink to="/report?type=missed_pickup" icon={<HomeIcon />} label="Missed Pickup" color="bg-blue-50 text-blue-600" />
          <QuickActionLink to="/report?type=dead_animal" icon={<Skull />} label="Dead Animal" color="bg-red-50 text-red-600" />
          <QuickActionLink to="/chatbot" icon={<MessageSquare />} label="Ask AI" color="bg-amber-50 text-amber-600" />
        </div>
      </section>

      {/* Recent Complaints */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Recent Reports</h2>
          <Link to="/reports" className="text-sm text-primary font-semibold hover:underline">View All</Link>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-2xl"></div>)}
          </div>
        ) : complaints.length > 0 ? (
          <div className="space-y-4">
            {complaints.slice(0, 5).map((complaint) => (
              <ComplaintCard key={complaint.id} complaint={complaint} />
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No reports yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">
              Start by reporting a cleanliness issue in your neighborhood.
            </p>
            <Link to="/report" className="btn-primary inline-flex mt-6">Report Now</Link>
          </div>
        )}
      </section>
    </div>
  );
}

function QuickActionLink({ to, icon, label, color }: { to: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link to={to} className="card p-4 hover:border-primary transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${color}`}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" }) : icon}
      </div>
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <ChevronRight className="w-4 h-4 text-slate-400 mt-1" />
    </Link>
  );
}

function ComplaintCard({ complaint }: { complaint: any }) {
  const statusConfig = {
    pending: { icon: <Clock className="w-4 h-4" />, color: "bg-amber-100 text-amber-700", label: "Pending" },
    verified: { icon: <ShieldCheck className="w-4 h-4" />, color: "bg-blue-100 text-blue-700", label: "Verified" },
    assigned: { icon: <TrendingUp className="w-4 h-4" />, color: "bg-indigo-100 text-indigo-700", label: "Assigned" },
    resolved: { icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-emerald-100 text-emerald-700", label: "Resolved" }
  };

  const config = statusConfig[complaint.status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <Link to={`/complaint/${complaint.id}`} className="card p-4 flex gap-4 hover:border-primary transition-all">
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
        {complaint.photo_before ? (
          <img src={complaint.photo_before} alt="Complaint" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Trash2 className="w-8 h-8" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-slate-900 truncate capitalize">
            {complaint.type.replace('_', ' ')}: {complaint.category || 'General'}
          </h3>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${config.color}`}>
            {config.icon}
            {config.label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-xs mb-2">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{complaint.address || 'Location captured'}</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Reported {formatDistanceToNow(new Date(complaint.created_at))} ago
        </p>
      </div>
    </Link>
  );
}
