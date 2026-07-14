import { useQuery } from '@tanstack/react-query';
import { Server, Zap } from 'lucide-react';

export default function Settings() {
  const { data, isLoading } = useQuery({
    queryKey: ['server'],
    queryFn: () => fetch('/api/server').then(res => res.json())
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading settings...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Settings & Info</h1>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Server className="text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-800">Server Configuration</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-slate-500 font-medium">Server Name</span>
            <span className="text-slate-800 font-semibold">{data?.name}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-slate-500 font-medium">Version</span>
            <span className="text-slate-800 font-semibold">{data?.version}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-slate-50">
            <span className="text-slate-500 font-medium">Transport Protocol</span>
            <span className="text-slate-800 font-semibold uppercase">{data?.transport}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-500 font-medium">Lens UI Status</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm bg-emerald-50 px-2 py-1 rounded">
              <Zap size={14} /> Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
