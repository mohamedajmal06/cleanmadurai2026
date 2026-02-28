import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  MapPin, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Filter, 
  Search, 
  ArrowUpRight,
  TrendingUp,
  Users,
  Map as MapIcon,
  List as ListIcon,
  Skull,
  Home as HomeIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { User } from '../App';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

// Fix Leaflet marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function AuthorityDashboard({ user }: { user: User }) {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, aRes] = await Promise.all([
        fetch('/api/complaints'),
        fetch('/api/analytics')
      ]);
      setComplaints(await cRes.json());
      setAnalytics(await aRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(c => 
    filter === 'all' ? true : c.status === filter
  );

  const stats = [
    { label: 'Total Reports', value: complaints.length, icon: <Trash2 className="text-blue-600" />, color: 'bg-blue-50' },
    { label: 'Pending', value: complaints.filter(c => c.status === 'pending').length, icon: <Clock className="text-amber-600" />, color: 'bg-amber-50' },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, icon: <CheckCircle2 className="text-emerald-600" />, color: 'bg-emerald-50' },
    { label: 'Avg Response', value: '4.2h', icon: <TrendingUp className="text-indigo-600" />, color: 'bg-indigo-50' },
  ];

  const chartData = analytics?.typeStats.map((s: any) => ({
    name: s.type.replace('_', ' '),
    value: s.count
  })) || [];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  const MapContainerAny = MapContainer as any;
  const TileLayerAny = TileLayer as any;
  const MarkerAny = Marker as any;
  const PopupAny = Popup as any;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Municipal Dashboard</h1>
          <p className="text-slate-500">Madurai City Cleanliness Monitoring System</p>
        </div>
        <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <button 
            onClick={() => setView('list')}
            className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${view === 'list' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <ListIcon className="w-4 h-4" />
            List View
          </button>
          <button 
            onClick={() => setView('map')}
            className={`p-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${view === 'map' ? 'bg-primary text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <MapIcon className="w-4 h-4" />
            Map View
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="card p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-display font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {view === 'map' ? (
            <div className="card h-[600px] relative z-0">
              <MapContainerAny center={[9.9252, 78.1198]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
                <TileLayerAny
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {complaints.map((c) => (
                  <MarkerAny key={c.id} position={[c.latitude || 9.9252, c.longitude || 78.1198]}>
                    <PopupAny>
                      <div className="p-2">
                        <h3 className="font-bold text-sm mb-1 capitalize">{c.type.replace('_', ' ')}</h3>
                        <p className="text-xs text-slate-500 mb-2">{c.address}</p>
                        <Link to={`/complaint/${c.id}`} className="text-xs text-primary font-bold hover:underline">View Details</Link>
                      </div>
                    </PopupAny>
                  </MarkerAny>
                ))}
              </MapContainerAny>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {['all', 'pending', 'assigned', 'resolved'].map(f => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search complaints..." 
                    className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredComplaints.map((c) => (
                  <Link key={c.id} to={`/complaint/${c.id}`} className="card p-4 flex items-center gap-4 hover:border-primary transition-all group">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img src={c.photo_before} alt="Before" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 truncate capitalize">{c.type.replace('_', ' ')}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.urgency === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {c.urgency}
                        </span>
                        {c.assigned_name && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-accent/10 text-accent flex items-center gap-1">
                            <Users className="w-2 h-2" />
                            {c.assigned_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {c.address}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-slate-900 mb-1 capitalize">{c.status}</p>
                      <p className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(c.created_at))} ago</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Waste Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {chartData.map((d: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-slate-600 capitalize">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-bold mb-4">Swachh Survekshan Goal</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-500">City Cleanliness Score</span>
                  <span className="font-bold text-primary">78%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '78%' }}></div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Madurai is currently ranked #124. Resolve 45 more pending issues this week to reach the Top 100.
              </p>
              <button className="w-full btn-secondary text-xs py-2">Download Report</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
