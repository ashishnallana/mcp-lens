import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Database, Play, ChevronDown, ChevronRight, Check, X } from 'lucide-react';

export default function Resources() {
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [expandedServers, setExpandedServers] = useState<Record<string, boolean>>({});

  const { data: resourcesData, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => fetch('/api/resources').then(res => res.json()),
  });

  const readMutation = useMutation({
    mutationFn: async (req: {server_name: string, uri: string}) => {
      const response = await fetch('/api/resource/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      return response.json();
    }
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading resources...</div>;

  const resourcesMap = resourcesData?.resources || {};
  const serverNames = Object.keys(resourcesMap);

  const toggleServer = (server: string) => {
    setExpandedServers(prev => ({ ...prev, [server]: prev[server] === false ? true : false }));
  };

  const handleRead = () => {
    if (!selectedResource) return;
    readMutation.mutate({ server_name: selectedResource.serverName, uri: selectedResource.uri });
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-700">Resources Explorer</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {serverNames.length === 0 && <div className="p-4 text-sm text-slate-500">No servers connected.</div>}
          
          {serverNames.map(serverName => {
            const serverResources = resourcesMap[serverName] || [];
            const isExpanded = expandedServers[serverName] !== false;
            
            return (
              <div key={serverName} className="border-b border-slate-100 last:border-b-0">
                <div 
                  onClick={() => toggleServer(serverName)}
                  className="px-4 py-3 bg-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors sticky top-0 z-10 border-y border-slate-200"
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-700">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>{serverName}</span>
                  </div>
                  <span className="bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">{serverResources.length}</span>
                </div>
                
                {isExpanded && (
                  <div className="py-1">
                    {serverResources.map((res: any) => (
                      <div
                        key={res.uri}
                        onClick={() => { setSelectedResource({ ...res, serverName }); readMutation.reset(); }}
                        className={`px-4 py-3 cursor-pointer text-sm transition-colors border-l-4 ${
                          selectedResource?.uri === res.uri 
                            ? 'bg-blue-50 border-blue-500' 
                            : 'border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-medium text-slate-800">{res.name || res.uri.split('/').pop()}</div>
                        <div className="text-xs text-slate-500 truncate mt-1">{res.uri}</div>
                      </div>
                    ))}
                    {serverResources.length === 0 && (
                      <div className="px-4 py-3 text-xs text-slate-400 italic">No resources</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-50 flex flex-col h-full overflow-hidden">
        {selectedResource ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-8">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-slate-800">{selectedResource.name || 'Unnamed Resource'}</h2>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {selectedResource.serverName}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-4">{selectedResource.description}</p>
                  
                  <div className="bg-slate-100 p-3 rounded text-xs font-mono text-slate-700 mb-4 flex items-center gap-2">
                    <Database size={14} className="text-slate-400" />
                    {selectedResource.uri}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <button 
                      onClick={handleRead}
                      disabled={readMutation.isPending}
                      className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-bold text-base transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Play size={18} />
                      {readMutation.isPending ? 'Reading...' : 'Read Resource'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Responses */}
              {readMutation.data && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                   <div className="p-4 border-b border-slate-200 bg-slate-50">
                     <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        {readMutation.data.error ? <X className="text-rose-500" size={18}/> : <Check className="text-emerald-500" size={18}/>}
                        {readMutation.data.error ? 'Error' : 'Resource Data'}
                     </h3>
                   </div>
                   <div className="p-6">
                     <div className="bg-slate-900 rounded-lg p-4 overflow-auto shadow-inner">
                       <pre className={`text-sm font-mono whitespace-pre-wrap ${readMutation.data.error ? 'text-rose-400' : 'text-emerald-400'}`}>
                         {readMutation.data.error ? readMutation.data.error : JSON.stringify(readMutation.data.result, null, 2)}
                       </pre>
                     </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <Database size={48} className="mx-auto mb-4 opacity-20" />
              <p>Select a resource from the sidebar to view its details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
