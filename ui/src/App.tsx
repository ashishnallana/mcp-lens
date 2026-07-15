import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient, useQuery } from '@tanstack/react-query';
import { LayoutDashboard, Wrench, Database, MessageSquare, History, Settings } from 'lucide-react';

const queryClient = new QueryClient();

function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Tools', path: '/tools', icon: <Wrench size={20} /> },
    { name: 'Resources', path: '/resources', icon: <Database size={20} /> },
    { name: 'Prompts', path: '/prompts', icon: <MessageSquare size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 border-r flex flex-col" style={{ backgroundColor: '#0B0F14', borderColor: '#1e293b' }}>
      <div className="p-6 flex items-center justify-center border-b" style={{ borderColor: '#1e293b' }}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="MCP Lens Logo" className="w-8 h-8 rounded-lg" />
          <span className="text-xl font-bold tracking-widest text-white uppercase">MCP Lens</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive 
                  ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 text-xs text-slate-500 border-t" style={{ borderColor: '#1e293b' }}>
        v0.1.0-alpha
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => fetch('/api/metrics').then(res => res.json()),
    refetchInterval: 2000
  });

  const { data: toolsData } = useQuery({
    queryKey: ['tools'],
    queryFn: () => fetch('/api/tools').then(res => res.json()),
  });

  const { data: resourcesData } = useQuery({
    queryKey: ['resources'],
    queryFn: () => fetch('/api/resources').then(res => res.json()),
  });

  const { data: promptsData } = useQuery({
    queryKey: ['prompts'],
    queryFn: () => fetch('/api/prompts').then(res => res.json()),
  });

  const totalServers = Object.keys(toolsData?.tools || {}).length;
  const totalTools = Object.values(toolsData?.tools || {}).reduce((acc: number, arr: any) => acc + arr.length, 0);
  const totalResources = Object.values(resourcesData?.resources || {}).reduce((acc: number, arr: any) => acc + arr.length, 0);
  const totalPrompts = Object.values(promptsData?.prompts || {}).reduce((acc: number, arr: any) => acc + arr.length, 0);

  return (
    <div className="p-8 h-full overflow-y-auto" style={{ backgroundColor: '#0B0F14' }}>
      <h1 className="text-2xl font-bold mb-6 text-white">Dashboard</h1>
      
      <h2 className="text-lg font-semibold text-slate-300 mb-4">Connected Context</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-xl shadow-sm border-l-4" style={{ backgroundColor: '#131B24', borderColor: '#F59E0B' }}>
          <h3 className="text-sm font-medium text-slate-400 mb-2">Connected Servers</h3>
          <p className="text-3xl font-bold text-white">{totalServers}</p>
        </div>
        <div className="p-6 rounded-xl shadow-sm border-l-4" style={{ backgroundColor: '#131B24', borderColor: '#FBBF24' }}>
          <h3 className="text-sm font-medium text-slate-400 mb-2">Active Tools</h3>
          <p className="text-3xl font-bold text-white">{totalTools}</p>
        </div>
        <div className="p-6 rounded-xl shadow-sm border-l-4" style={{ backgroundColor: '#131B24', borderColor: '#D97706' }}>
          <h3 className="text-sm font-medium text-slate-400 mb-2">Active Resources</h3>
          <p className="text-3xl font-bold text-white">{totalResources}</p>
        </div>
        <div className="p-6 rounded-xl shadow-sm border-l-4" style={{ backgroundColor: '#131B24', borderColor: '#F59E0B' }}>
          <h3 className="text-sm font-medium text-slate-400 mb-2">Active Prompts</h3>
          <p className="text-3xl font-bold text-white">{totalPrompts}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-slate-300 mb-4">Execution Metrics</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
          <h3 className="text-sm font-medium text-slate-400 mb-2">Total Requests</h3>
          <p className="text-3xl font-bold text-white">{metrics?.total_requests ?? 0}</p>
        </div>
        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
          <h3 className="text-sm font-medium text-slate-400 mb-2">Avg Latency</h3>
          <p className="text-3xl font-bold text-white">{metrics?.average_latency ?? 0} ms</p>
        </div>
        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
          <h3 className="text-sm font-medium text-slate-400 mb-2">Success Rate</h3>
          <p className="text-3xl font-bold text-emerald-400">{metrics?.success_rate ?? 100}%</p>
        </div>
        <div className="p-6 rounded-xl shadow-sm border" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
          <h3 className="text-sm font-medium text-slate-400 mb-2">Error Rate</h3>
          <p className="text-3xl font-bold text-rose-400">{metrics?.error_rate ?? 0}%</p>
        </div>
      </div>
    </div>
  );
}

import ToolExplorer from './components/ToolExplorer';
import HistoryPage from './components/History';
import Resources from './components/Resources';
import Prompts from './components/Prompts';
import SettingsPage from './components/Settings';

function AppContent() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const wsUrl = (window.location.protocol === 'https:' ? 'wss:' : 'ws:') + '//' + window.location.host + '/ws/events';
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = () => {
      // Refresh data globally when an event occurs
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['metrics'] });
    };

    return () => ws.close();
  }, [queryClient]);

  return (
        <div className="flex h-screen text-slate-200 font-sans" style={{ backgroundColor: '#0B0F14' }}>
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tools" element={<ToolExplorer />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/prompts" element={<Prompts />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router basename="/mcp">
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}
