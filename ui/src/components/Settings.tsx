import { useQuery } from '@tanstack/react-query';
import { Server, Zap } from 'lucide-react';

export default function Settings() {
  const { data, isLoading } = useQuery({
    queryKey: ['server'],
    queryFn: () => fetch('/api/server').then(res => res.json())
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading settings...</div>;

  return (
    <div className="p-8 h-full overflow-y-auto" style={{ backgroundColor: '#0B0F14' }}>
      <h1 className="text-2xl font-bold mb-6 text-white">Settings & Info</h1>
      <div className="rounded-xl border shadow-sm overflow-hidden max-w-2xl" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
        <div className="p-6 border-b flex items-center gap-3" style={{ borderColor: '#1e293b', backgroundColor: '#0B0F14' }}>
          <Server className="text-amber-500" />
          <h2 className="text-lg font-bold text-white">Server Configuration</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1e293b' }}>
            <span className="text-slate-400 font-medium">Server Name</span>
            <span className="text-white font-semibold">{data?.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1e293b' }}>
            <span className="text-slate-400 font-medium">Version</span>
            <span className="text-white font-semibold">{data?.version}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#1e293b' }}>
            <span className="text-slate-400 font-medium">Transport Protocol</span>
            <span className="text-white font-semibold uppercase">{data?.transport || 'stdio'}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-400 font-medium">Lens UI Status</span>
            <span className="flex items-center gap-1.5 font-semibold text-sm px-2 py-1 rounded text-amber-500 bg-amber-500/10 border border-amber-500/20">
              <Zap size={14} /> Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
