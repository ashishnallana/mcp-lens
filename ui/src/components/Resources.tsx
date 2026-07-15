import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Database, Play, ChevronDown, ChevronRight, Check, X, Search } from 'lucide-react';

export default function Resources() {
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [expandedServers, setExpandedServers] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="flex h-full" style={{ backgroundColor: '#0B0F14' }}>
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col h-full" style={{ backgroundColor: '#0B0F14', borderColor: '#1e293b' }}>
        <div className="p-4 border-b flex-shrink-0" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
          <h2 className="font-bold text-slate-300 mb-3">Resources Explorer</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-500" size={14} />
            <input 
              type="text" 
              placeholder="Search resources..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-shadow text-white"
              style={{ backgroundColor: '#0B0F14', borderColor: '#1e293b', borderWidth: 1 }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {serverNames.length === 0 && <div className="p-4 text-sm text-slate-500">No servers connected.</div>}
          
          {serverNames.map(serverName => {
            const rawResources = resourcesMap[serverName] || [];
            const serverResources = rawResources.filter((res: any) => 
              (res.name && res.name.toLowerCase().includes(searchQuery.toLowerCase())) || 
              (res.uri && res.uri.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            if (searchQuery && serverResources.length === 0) return null;

            const isExpanded = expandedServers[serverName] !== false;
            
            return (
              <div key={serverName} className="border-b last:border-b-0" style={{ borderColor: '#1e293b' }}>
                <div 
                  onClick={() => toggleServer(serverName)}
                  className="px-4 py-3 flex items-center justify-between cursor-pointer transition-colors sticky top-0 z-10 border-y"
                  style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}
                >
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-300 hover:text-white transition-colors">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span>{serverName}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400" style={{ backgroundColor: '#0B0F14' }}>{serverResources.length}</span>
                </div>
                
                {isExpanded && (
                  <div className="py-1">
                    {serverResources.map((res: any) => (
                      <div
                        key={res.uri}
                        onClick={() => { setSelectedResource({ ...res, serverName }); readMutation.reset(); }}
                        className={`px-4 py-3 cursor-pointer text-sm transition-colors border-l-4 ${
                          selectedResource?.uri === res.uri 
                            ? 'border-amber-500' 
                            : 'border-transparent hover:bg-slate-800/50'
                        }`}
                        style={{ backgroundColor: selectedResource?.uri === res.uri ? 'rgba(245,158,11,0.1)' : 'transparent' }}
                      >
                        <div className="font-medium text-slate-200">{res.name || res.uri.split('/').pop()}</div>
                        <div className="text-xs text-slate-500 truncate mt-1">{res.uri}</div>
                      </div>
                    ))}
                    {serverResources.length === 0 && (
                      <div className="px-4 py-3 text-xs text-slate-500 italic">No resources</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#0B0F14' }}>
        {selectedResource ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <div className="rounded-xl border overflow-hidden shadow-sm mb-8" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
                <div className="p-6 border-b" style={{ borderColor: '#1e293b' }}>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-white">{selectedResource.name || 'Unnamed Resource'}</h2>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20">
                      {selectedResource.serverName}
                    </span>
                  </div>
                  <p className="text-slate-400 mb-4">{selectedResource.description}</p>
                  
                  <div className="p-3 rounded text-xs font-mono mb-4 flex items-center gap-2 text-slate-300" style={{ backgroundColor: '#0B0F14' }}>
                    <Database size={14} className="text-amber-500" />
                    {selectedResource.uri}
                  </div>

                  <div className="mt-8 pt-6 border-t" style={{ borderColor: '#1e293b' }}>
                    <button 
                      onClick={handleRead}
                      disabled={readMutation.isPending}
                      className="w-full flex justify-center items-center gap-2 rounded-md font-bold text-base transition-colors shadow-sm disabled:opacity-50 text-slate-900 hover:opacity-90"
                      style={{ backgroundColor: '#F59E0B' }}
                    >
                      <Play size={18} />
                      {readMutation.isPending ? 'Reading...' : 'Read Resource'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Responses */}
              {readMutation.data && (
                <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
                   <div className="p-4 border-b" style={{ borderColor: '#1e293b', backgroundColor: '#0B0F14' }}>
                     <h3 className="font-bold text-white flex items-center gap-2">
                        {readMutation.data.error ? <X className="text-rose-500" size={18}/> : <Check className="text-emerald-500" size={18}/>}
                        {readMutation.data.error ? 'Error' : 'Resource Data'}
                     </h3>
                   </div>
                   <div className="p-6">
                     <div className="rounded-lg p-4 overflow-auto shadow-inner" style={{ backgroundColor: '#0B0F14' }}>
                       <pre className={`text-sm font-mono whitespace-pre-wrap ${readMutation.data.error ? 'text-rose-400' : 'text-amber-400'}`}>
                         {readMutation.data.error ? readMutation.data.error : (typeof readMutation.data.result === 'string' ? readMutation.data.result : JSON.stringify(readMutation.data.result, null, 2))}
                       </pre>
                     </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <Database size={48} className="mx-auto mb-4 opacity-20 text-slate-500" />
              <p>Select a resource from the sidebar to view its details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
