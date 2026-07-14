import { useQuery } from '@tanstack/react-query';
import { BarChart3, Clock, Activity, AlertTriangle } from 'lucide-react';

export default function Metrics() {
  const { data, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => fetch('/api/metrics').then(res => res.json())
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading metrics...</div>;

  const m = data || { total_requests: 0, average_latency: 0, success_rate: 100, error_rate: 0 };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Server Metrics</h1>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Invocations</p>
            <h3 className="text-2xl font-bold text-slate-800">{m.total_requests}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Average Latency</p>
            <h3 className="text-2xl font-bold text-slate-800">{m.average_latency} ms</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Success Rate</p>
            <h3 className="text-2xl font-bold text-slate-800">{m.success_rate}%</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Error Rate</p>
            <h3 className="text-2xl font-bold text-slate-800">{m.error_rate}%</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
