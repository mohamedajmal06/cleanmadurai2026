import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  Leaf, 
  MapPin, 
  PlusCircle, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Bell, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  Camera,
  Home,
  Skull
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utils ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
export interface User {
  id: number;
  email: string;
  role: 'citizen' | 'authority';
  name: string;
}

// --- Components ---
const Navbar = ({ user, onLogout }: { user: User | null; onLogout: () => void }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      fetch(`/api/notifications/${user.id}`)
        .then(res => res.json())
        .then(data => setNotifications(data));
    }
  }, [user]);
  
  return (
    <nav className="sticky top-0 z-50 glass border-b border-slate-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-display font-bold text-slate-900">
            Clean <span className="text-primary">Madurai</span>
          </span>
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <Bell className="w-5 h-5" />
                {notifications.some(n => !n.is_read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 card shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <h3 className="font-bold text-sm">Notifications</h3>
                      <button className="text-[10px] text-primary font-bold uppercase">Mark all read</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map((n, i) => (
                        <div key={i} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                          <p className="text-sm text-slate-800">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{formatDistanceToNow(new Date(n.created_at))} ago</p>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-slate-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          <p className="text-xs">No notifications yet</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Link to="/login" className="btn-secondary text-sm">Login</Link>
            <Link to="/register" className="btn-primary text-sm">Join Us</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

// --- Layout ---
const Layout = ({ children, user, onLogout }: { children: React.ReactNode; user: User | null; onLogout: () => void }) => {
  const location = useLocation();
  const darkPages = ['/landing', '/login', '/register', '/authority-login'];
  const hideNav = darkPages.includes(location.pathname);
  const isDarkPage = darkPages.includes(location.pathname);

  return (
    <div className={cn("min-h-screen flex flex-col", isDarkPage ? "bg-[#010a05]" : "bg-slate-50")}>
      {!hideNav && <Navbar user={user} onLogout={onLogout} />}
      <main className={cn("flex-1 w-full", !isDarkPage && "max-w-7xl mx-auto px-4 py-6")}>
        {children}
      </main>
      
      {user && user.role === 'citizen' && !hideNav && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
          <Link 
            to="/chatbot" 
            className="w-14 h-14 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <MessageSquare className="w-6 h-6" />
          </Link>
          <Link 
            to="/report" 
            className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <PlusCircle className="w-6 h-6" />
          </Link>
        </div>
      )}
    </div>
  );
};

// --- Pages (Placeholders) ---
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenHome from './pages/CitizenHome';
import AuthorityDashboard from './pages/AuthorityDashboard';
import ReportWaste from './pages/ReportWaste';
import Chatbot from './pages/Chatbot';
import ComplaintDetails from './pages/ComplaintDetails';

import Landing from './pages/Landing';
import AuthorityLogin from './pages/AuthorityLogin';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={
            user ? (
              user.role === 'citizen' ? <CitizenHome user={user} /> : <AuthorityDashboard user={user} />
            ) : (
              <Navigate to="/landing" />
            )
          } />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/authority-login" element={<AuthorityLogin onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onLogin={handleLogin} />} />
          <Route path="/report" element={user?.role === 'citizen' ? <ReportWaste user={user} /> : <Navigate to="/" />} />
          <Route path="/chatbot" element={<Chatbot user={user} />} />
          <Route path="/complaint/:id" element={<ComplaintDetails user={user} />} />
        </Routes>
      </Layout>
    </Router>
  );
}
