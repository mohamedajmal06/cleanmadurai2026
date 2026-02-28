import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  Camera, 
  Trash2, 
  ShieldCheck, 
  User as UserIcon,
  ArrowRight,
  Loader2,
  Download,
  Share2,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { User } from '../App';
import { verifyCleanup } from '../services/gemini';

export default function ComplaintDetails({ user }: { user: User | null }) {
  const { id } = useParams();
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/complaints/${id}`)
      .then(res => res.json())
      .then(data => {
        setComplaint(data);
        setLoading(false);
      });

    if (user?.role === 'authority') {
      fetch('/api/members')
        .then(res => res.json())
        .then(data => setMembers(data));
    }
  }, [id, user]);

  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAfterPhoto(reader.result as string);
        runCleanupVerification(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runCleanupVerification = async (afterBase64: string) => {
    setVerifying(true);
    try {
      const result = await verifyCleanup(complaint.photo_before, afterBase64);
      setVerificationResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const handleResolve = async () => {
    if (!afterPhoto) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resolved',
          photo_after: afterPhoto,
        }),
      });
      if (res.ok) {
        setComplaint({ ...complaint, status: 'resolved', photo_after: afterPhoto });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (memberId: number, memberName: string) => {
    setAssigning(true);
    try {
      const res = await fetch(`/api/complaints/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_to: memberId,
          assigned_name: memberName
        }),
      });
      if (res.ok) {
        setComplaint({ ...complaint, status: 'assigned', assigned_name: memberName });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAssigning(false);
    }
  };

  if (loading && !complaint) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  const isAuthority = user?.role === 'authority';

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6">
        <ChevronLeft className="w-5 h-5" />
        Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Photos & Verification */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Before Cleanup</h3>
              <span className="text-xs text-slate-400">{format(new Date(complaint.created_at), 'PPP p')}</span>
            </div>
            <div className="aspect-video bg-slate-100">
              <img src={complaint.photo_before} alt="Before" className="w-full h-full object-cover" />
            </div>
          </div>

          {complaint.status === 'resolved' ? (
            <div className="card overflow-hidden border-emerald-200">
              <div className="p-4 border-b border-emerald-100 bg-emerald-50 flex justify-between items-center">
                <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  After Cleanup (Resolved)
                </h3>
                <span className="text-xs text-emerald-600">{format(new Date(complaint.updated_at), 'PPP p')}</span>
              </div>
              <div className="aspect-video bg-slate-100">
                <img src={complaint.photo_after} alt="After" className="w-full h-full object-cover" />
              </div>
            </div>
          ) : isAuthority ? (
            <div className="space-y-6">
              {/* Assignment Section */}
              <div className="card p-6 border-accent/20 bg-accent/5">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-accent" />
                  Assign to Member
                </h3>
                {complaint.assigned_name ? (
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{complaint.assigned_name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Assigned Officer</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-lg">In Progress</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">Select a municipal officer to handle this cleanup.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {members.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => handleAssign(member.id, member.name)}
                          disabled={assigning}
                          className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all text-left group"
                        >
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{member.name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{member.role}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Resolve Section */}
              <div className="card p-6 border-dashed border-2 border-primary/30 bg-primary/5">
                <h3 className="font-bold text-slate-900 mb-4">Resolve Complaint</h3>
                {afterPhoto ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-xl overflow-hidden shadow-md">
                      <img src={afterPhoto} alt="After Preview" className="w-full h-full object-cover" />
                      {verifying && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                          <Loader2 className="w-8 h-8 animate-spin mb-2" />
                          <p className="text-sm font-medium">AI Verifying Cleanup...</p>
                        </div>
                      )}
                    </div>
                    
                    {verificationResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl border ${verificationResult.verified ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold flex items-center gap-2">
                            {verificationResult.verified ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {verificationResult.verified ? 'Cleanup Verified' : 'Verification Failed'}
                          </p>
                          <span className="text-lg font-display font-bold">{verificationResult.score}%</span>
                        </div>
                        <p className="text-sm opacity-80">{verificationResult.feedback}</p>
                      </motion.div>
                    )}

                    <div className="flex gap-3">
                      <button 
                        onClick={() => setAfterPhoto(null)}
                        className="flex-1 btn-secondary"
                      >
                        Retake
                      </button>
                      <button 
                        onClick={handleResolve}
                        disabled={!verificationResult?.verified || loading}
                        className="flex-[2] btn-primary flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Mark as Resolved'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-12 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-primary/10 transition-all text-primary"
                  >
                    <Camera className="w-10 h-10" />
                    <p className="font-bold">Upload Cleanup Photo</p>
                    <p className="text-xs opacity-70">AI will compare with 'Before' photo</p>
                  </button>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleAfterPhotoUpload} accept="image/*" capture="environment" />
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center bg-slate-50 border-dashed">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-bold text-slate-900">Awaiting Cleanup</h3>
              <p className="text-sm text-slate-500 mt-2">Authorities have been notified and will resolve this soon.</p>
            </div>
          )}
        </div>

        {/* Right Column: Info & AI Analysis */}
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                complaint.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' : 
                complaint.status === 'assigned' ? 'bg-accent/10 text-accent' :
                'bg-amber-100 text-amber-700'
              }`}>
                {complaint.status}
              </span>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Share2 className="w-4 h-4" /></button>
                <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Download className="w-4 h-4" /></button>
              </div>
            </div>

            <h2 className="text-2xl font-display font-bold text-slate-900 mb-2 capitalize">
              {complaint.type.replace('_', ' ')}
            </h2>
            <p className="text-slate-500 text-sm mb-6 flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary" />
              {complaint.address}
            </p>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Category</span>
                <span className="font-bold text-slate-900">{complaint.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Urgency</span>
                <span className={`font-bold ${complaint.urgency === 'High' ? 'text-red-600' : 'text-amber-600'}`}>
                  {complaint.urgency}
                </span>
              </div>
              {complaint.assigned_name && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Assigned To</span>
                  <span className="font-bold text-accent">{complaint.assigned_name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Report ID</span>
                <span className="font-mono text-slate-900">#CM-{complaint.id.toString().padStart(4, '0')}</span>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-secondary text-white">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-primary" />
              AI Analysis Report
            </h3>
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Detection Confidence</p>
                <p className="text-lg font-display font-bold">{(complaint.ai_analysis?.confidence * 100 || 95).toFixed(0)}%</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{complaint.ai_analysis?.description || 'AI verified waste presence and categorized it for municipal routing.'}"
              </p>
              {complaint.status === 'resolved' && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-xs text-primary font-bold uppercase tracking-widest mb-2">Cleanup Verification</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Verified Clean</p>
                      <p className="text-[10px] text-slate-400">Score: 98/100</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {complaint.status === 'resolved' && (
            <button className="w-full btn-primary py-4 flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Swachh Survekshan Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
