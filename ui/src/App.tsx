import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Activity, LayoutDashboard, Wrench, Database, MessageSquare, History, BarChart3, Settings } from 'lucide-react';

const queryClient = new QueryClient();

function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Tools', path: '/tools', icon: <Wrench size={20} /> },
    { name: 'Resources', path: '/resources', icon: <Database size={20} /> },
    { name: 'Prompts', path: '/prompts', icon: <MessageSquare size={20} /> },
    { name: 'History', path: '/history', icon: <History size={20} /> },
    { name: 'Metrics', path: '/metrics', icon: <BarChart3 size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col">
      <div className="p-6 flex items-center gap-3 text-indigo-600 border-b border-slate-100">
        <Activity size={28} />
        <span className="text-xl font-bold tracking-tight">MCP Lens</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors"
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 text-xs text-slate-400 border-t border-slate-100">
        v0.1.0-alpha
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';

function Dashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => fetch('/api/metrics').then(res => res.json()),
    refetchInterval: 2000
  });

  const { data: toolsData } = useQuery({
    queryKey: ['tools'],
    queryFn: () => fetch('/api/tools').then(res => res.json()),
    refetchInterval: 5000
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Total Requests</h3>
          <p className="text-3xl font-bold text-slate-800">{metrics?.total_requests ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Active Tools</h3>
          <p className="text-3xl font-bold text-slate-800">{toolsData?.tools?.length ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-medium text-slate-500 mb-2">Avg Latency</h3>
          <p className="text-3xl font-bold text-slate-800">{metrics?.average_latency ?? 0} ms</p>
        </div>
      </div>
    </div>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="p-8 flex items-center justify-center h-full">
      <div className="text-center text-slate-500">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p>Coming soon</p>
      </div>
    </div>
  );
}

import ToolExplorer from './components/ToolExplorer';
import HistoryPage from './components/History';
import Resources from './components/Resources';
import Prompts from './components/Prompts';

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
        <div className="flex h-screen bg-slate-50 font-sans">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tools" element={<ToolExplorer />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/prompts" element={<Prompts />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/metrics" element={<PlaceholderPage title="Metrics" />} />
              <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            </Routes>
          </main>
        </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}
