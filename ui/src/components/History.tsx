import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Play } from 'lucide-react';

export default function History() {
  const queryClient = useQueryClient();
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => fetch('/api/history').then(res => res.json()),
    refetchInterval: 3000
  });

  const invokeMutation = useMutation({
    mutationFn: async (req: any) => {
      const response = await fetch('/api/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          server_name: req.server_name,
          tool_name: req.tool_name,
          arguments: req.arguments,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
      alert('Replay executed! Check the newest entry in the history.');
    },
  });

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) return <div className="p-8 text-slate-500">Loading history...</div>;
  const history = data?.history || [];

  return (
    <div className="p-8 h-full overflow-y-auto" style={{ backgroundColor: '#0B0F14' }}>
      <h1 className="text-2xl font-bold mb-6 text-white">Request History</h1>
      <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
        <table className="w-full text-left text-sm">
          <thead className="border-b font-medium" style={{ backgroundColor: '#0B0F14', borderColor: '#1e293b', color: '#94a3b8' }}>
            <tr>
              <th className="p-4 w-10"></th>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Server</th>
              <th className="p-4">Tool</th>
              <th className="p-4">Status</th>
              <th className="p-4">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: '#1e293b' }}>
            {history.map((req: any) => (
              <React.Fragment key={req.id}>
                <tr 
                  onClick={() => toggleRow(req.id)}
                  className="cursor-pointer transition-colors hover:bg-slate-800/50 text-slate-300"
                >
                  <td className="p-4 text-slate-500">
                    {expandedRows[req.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </td>
                  <td className="p-4 text-slate-400">{new Date(req.timestamp).toLocaleString()}</td>
                  <td className="p-4 font-bold text-amber-500">{req.server_name || 'Unknown'}</td>
                  <td className="p-4 font-bold text-white">{req.tool_name}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${req.status === 'success' ? 'bg-emerald-950/30 text-emerald-500' : 'bg-rose-950/30 text-rose-500'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{req.duration_ms.toFixed(2)} ms</td>
                </tr>
                
                {/* Expanded Details Row */}
                {expandedRows[req.id] && (
                  <tr className="border-t" style={{ backgroundColor: '#0B0F14', borderColor: '#1e293b' }}>
                    <td colSpan={6} className="p-6">
                      <div className="grid grid-cols-2 gap-6">
                        
                        {/* Inputs */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Arguments (Input)</h4>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                invokeMutation.mutate(req);
                              }}
                              disabled={invokeMutation.isPending}
                              className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded transition-colors disabled:opacity-50 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20"
                            >
                              <Play size={14} /> Replay
                            </button>
                          </div>
                          <div className="rounded-lg p-4 h-64 overflow-auto shadow-inner" style={{ backgroundColor: '#131B24' }}>
                            <pre className="text-xs font-mono whitespace-pre-wrap text-amber-200">
                              {JSON.stringify(req.arguments, null, 2)}
                            </pre>
                          </div>
                        </div>

                        {/* Outputs */}
                        <div>
                          <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">Result (Output)</h4>
                          <div className={`rounded-lg p-4 h-64 overflow-auto shadow-inner border ${req.status === 'error' ? 'border-rose-900/50' : 'border-emerald-900/50'}`} style={{ backgroundColor: '#131B24' }}>
                            <pre className={`text-xs font-mono whitespace-pre-wrap ${req.status === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {req.status === 'error' ? req.error : JSON.stringify(req.response, null, 2)}
                            </pre>
                          </div>
                        </div>

                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            
            {history.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">No executions recorded yet. Try running a tool!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
