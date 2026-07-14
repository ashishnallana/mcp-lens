import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';


export default function History() {
  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => fetch('/api/history').then(res => res.json()),
    refetchInterval: 3000
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading history...</div>;
  const history = data?.history || [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Request History</h1>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Tool</th>
              <th className="p-4">Status</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((req: any) => (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 text-slate-600">{new Date(req.timestamp).toLocaleString()}</td>
                <td className="p-4 font-medium text-slate-800">{req.tool_name}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${req.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {req.status}
                  </span>
                </td>
                <td className="p-4 text-slate-600">{req.duration_ms.toFixed(2)} ms</td>
                <td className="p-4">
                  <button 
                    onClick={() => {
                      alert(`Replay Payload:\n\n${JSON.stringify(req.arguments, null, 2)}`);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 text-xs font-medium bg-indigo-50 px-3 py-1.5 rounded transition-colors"
                  >
                    <Play size={14} /> Replay
                  </button>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">No executions recorded yet. Try running a tool!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
