import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Camera, 
  MapPin, 
  Trash2, 
  Skull, 
  Home as HomeIcon, 
  AlertCircle, 
  Loader2, 
  CheckCircle2,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { analyzeWasteImage, analyzeDeadAnimalImage } from '../services/gemini';
import { User } from '../App';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ReportWaste({ user }: { user: User }) {
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') || 'garbage';
  
  const [type, setType] = useState(typeParam);
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const refreshLocation = () => {
    setLocating(true);
    setError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          // In a real app, we'd reverse geocode here. 
          // For now, we use a mock address but ensure coordinates are real.
          setLocation({ 
            lat: latitude, 
            lng: longitude, 
            address: `Live Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (Madurai City)` 
          });
          setLocating(false);
        },
        (err) => {
          setError('Location access denied or unavailable. Please enable GPS.');
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLocating(false);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
        runAIAnalysis(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAIAnalysis = async (base64: string) => {
    setAnalyzing(true);
    setAnalysis(null);
    setError('');
    
    try {
      let result;
      if (type === 'dead_animal') {
        result = await analyzeDeadAnimalImage(base64);
        if (!result.isDeadAnimal) {
          setError("AI could not detect a dead animal in this image. Please upload a clearer photo.");
        }
      } else {
        result = await analyzeWasteImage(base64);
        if (!result.isWaste) {
          setError("AI could not detect garbage in this image. Please upload a clearer photo.");
        }
      }
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("AI analysis failed. You can still submit, but it might take longer to verify.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!photo || !location) return;
    setLoading(true);

    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizen_id: user.id,
          type,
          category: category || analysis?.wasteType || analysis?.animalType || 'General',
          photo_before: photo,
          latitude: location.lat,
          longitude: location.lng,
          address: location.address,
          ai_analysis: analysis,
          urgency: analysis?.urgency || 'Medium'
        }),
      });

      if (res.ok) {
        navigate('/');
      }
    } catch (err) {
      setError('Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  const categories = {
    garbage: ['Overflowing Bin', 'Illegal Dumping', 'Street Litter', 'Industrial Waste'],
    missed_pickup: ['Household Waste', 'Recyclables', 'Commercial Waste'],
    dead_animal: ['Dog', 'Cat', 'Cow', 'Bird', 'Other']
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900">Report an Issue</h1>
        <p className="text-slate-500">Your report will be verified by AI and sent to authorities with your real-time GPS location.</p>
      </div>

      <div className="space-y-6">
        {/* Type Selection */}
        <div className="grid grid-cols-3 gap-3">
          <TypeButton 
            active={type === 'garbage'} 
            onClick={() => setType('garbage')} 
            icon={<Trash2 />} 
            label="Garbage" 
          />
          <TypeButton 
            active={type === 'missed_pickup'} 
            onClick={() => setType('missed_pickup')} 
            icon={<HomeIcon />} 
            label="Missed" 
          />
          <TypeButton 
            active={type === 'dead_animal'} 
            onClick={() => setType('dead_animal')} 
            icon={<Skull />} 
            label="Animal" 
          />
        </div>

        {/* Photo Upload */}
        <div className="card p-6">
          <label className="block text-sm font-bold text-slate-700 mb-4">Evidence Photo</label>
          
          {photo ? (
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200">
              <img src={photo} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => { setPhoto(null); setAnalysis(null); }}
                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              
              {analyzing && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-10 h-10 animate-spin mb-2" />
                  <p className="font-medium">AI is analyzing image...</p>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Camera className="w-8 h-8 text-slate-400 group-hover:text-primary" />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-700">Click to capture or upload</p>
                <p className="text-sm text-slate-500">Take a clear photo of the issue</p>
              </div>
            </button>
          )}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment"
            ref={fileInputRef} 
            className="hidden" 
            onChange={handlePhotoUpload}
          />
        </div>

        {/* AI Analysis Result */}
        <AnimatePresence>
          {analysis && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="card p-6 border-primary/30 bg-primary/5"
            >
              <div className="flex items-center gap-2 text-primary font-bold mb-3">
                <CheckCircle2 className="w-5 h-5" />
                AI Verification Successful
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Detected</p>
                  <p className="text-sm font-bold text-slate-900 capitalize">
                    {analysis.wasteType || analysis.animalType || 'Verified'}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Urgency</p>
                  <p className={cn(
                    "text-sm font-bold",
                    analysis.urgency === 'High' ? "text-red-600" : "text-amber-600"
                  )}>
                    {analysis.urgency}
                  </p>
                </div>
              </div>
              <p className="text-sm text-slate-600 mt-4 italic">"{analysis.description}"</p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Details */}
        <div className="card p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Select Category</option>
              {categories[type as keyof typeof categories].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-700">Location</label>
              <button 
                onClick={refreshLocation}
                disabled={locating}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <MapPin className="w-3 h-3" />}
                Refresh Location
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-sm text-slate-600 truncate">
                {locating ? 'Capturing live location...' : location ? location.address : 'Location not captured'}
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading || !photo || !location || !!error}
          className="w-full btn-primary py-4 text-lg font-bold flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Submit Report
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function TypeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
        active ? "border-primary bg-primary/5 text-primary" : "border-slate-200 bg-white text-slate-400 hover:border-slate-300"
      )}
    >
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6" }) : icon}
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
