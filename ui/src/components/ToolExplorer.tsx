import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Play, CheckCircle2, XCircle, Lock, Unlock, ChevronDown, ChevronRight, Search, Shield } from 'lucide-react';

export default function ToolExplorer() {
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Multi-Server Auth state
  const [authTokens, setAuthTokens] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('mcp_auth_tokens');
    return saved ? JSON.parse(saved) : {};
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [tempTokens, setTempTokens] = useState<Record<string, string>>({});

  // Accordion state
  const [expandedServers, setExpandedServers] = useState<Record<string, boolean>>({});

  const { data: toolsData, isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: () => fetch('/api/tools').then(res => res.json()),
  });

  const invokeMutation = useMutation({
    mutationFn: async (payload: any) => {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const serverToken = authTokens[selectedTool.serverName];
      if (serverToken) {
        headers['Authorization'] = `Bearer ${serverToken}`;
      }
      
      const res = await fetch('/api/invoke', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          server_name: selectedTool.serverName,
          tool_name: selectedTool.name,
          arguments: payload
        })
      });
      return res.json();
    }
  });

  // Default expand all servers on load
  useEffect(() => {
    if (toolsData?.tools) {
      const initial: Record<string, boolean> = {};
      Object.keys(toolsData.tools).forEach(k => initial[k] = true);
      setExpandedServers(initial);
    }
  }, [toolsData]);

  if (isLoading) return <div className="p-8 text-slate-500 font-medium">Loading tools...</div>;

  const servers = toolsData?.tools || {};
  const serverNames = Object.keys(servers);
  const totalTokens = Object.values(authTokens).filter(Boolean).length;

  const handleExecute = () => {
    const payload = { ...formValues };
    Object.keys(payload).forEach(key => {
      if (payload[key] === '') delete payload[key];
    });
    invokeMutation.mutate(payload);
  };

  const saveAuth = () => {
    setAuthTokens(tempTokens);
    localStorage.setItem('mcp_auth_tokens', JSON.stringify(tempTokens));
    setShowAuthModal(false);
  };

  const logoutAllAuth = () => {
    setAuthTokens({});
    localStorage.removeItem('mcp_auth_tokens');
    setShowAuthModal(false);
  };

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: '#0B0F14' }}>
      
      {/* Top Bar - Swagger Style */}
      <div className="border-b p-4 flex justify-between items-center shrink-0" style={{ borderColor: '#1e293b', backgroundColor: '#0B0F14' }}>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-sm font-mono text-slate-900" style={{ backgroundColor: '#F59E0B' }}>MCP</span>
          API Explorer
        </h1>
        <button 
          onClick={() => {
            setTempTokens({...authTokens});
            setShowAuthModal(true);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm border-2 transition-colors ${totalTokens > 0 ? 'border-amber-500 text-amber-500 hover:bg-amber-500/10' : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white'}`}
        >
          {totalTokens > 0 ? <Lock size={16} /> : <Unlock size={16} />}
          Authorize
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tool List Sidebar */}
        <div className="w-80 border-r flex flex-col h-full" style={{ borderColor: '#1e293b', backgroundColor: '#0B0F14' }}>
          <div className="p-4 border-b flex-shrink-0" style={{ borderColor: '#1e293b', backgroundColor: '#131B24' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-300">Tools Explorer</h2>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded transition-colors text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
              >
                <Shield size={14} /> Auth
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Search tools..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-shadow text-white"
                style={{ backgroundColor: '#0B0F14', borderColor: '#1e293b', borderWidth: 1 }}
              />
            </div>
          </div>
          <div className="divide-y flex-1 overflow-y-auto" style={{ borderColor: '#1e293b' }}>
            {serverNames.map((serverName) => {
              const toolsList = (servers[serverName] || []).filter((tool: any) => 
                tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()))
              );
              
              if (searchQuery && toolsList.length === 0) return null;
              
              const isExpanded = expandedServers[serverName];
              const hasAuth = !!authTokens[serverName];
              
              return (
                <div key={serverName}>
                  {/* Collapsible Header */}
                  <div 
                    onClick={() => setExpandedServers(prev => ({...prev, [serverName]: !isExpanded}))}
                    className="px-4 py-3 font-bold text-xs uppercase tracking-wider sticky top-0 border-b shadow-sm flex items-center justify-between cursor-pointer transition-colors z-10 text-slate-300 hover:text-white"
                    style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span>{serverName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasAuth && <span title="Authenticated"><Lock size={12} className="text-amber-500" /></span>}
                      <span className="px-1.5 py-0.5 rounded text-[10px] text-slate-400" style={{ backgroundColor: '#0B0F14' }}>{toolsList.length}</span>
                    </div>
                  </div>
                  
                  {/* Tools List */}
                  {isExpanded && toolsList.map((tool: any) => (
                    <div 
                      key={tool.name}
                      onClick={() => {
                        setSelectedTool({...tool, serverName});
                        setFormValues({});
                        invokeMutation.reset();
                      }}
                      className={`p-4 cursor-pointer transition-colors border-l-4 ${selectedTool?.name === tool.name && selectedTool?.serverName === serverName ? 'border-amber-500' : 'border-transparent hover:bg-slate-800/50'}`}
                      style={{ backgroundColor: selectedTool?.name === tool.name && selectedTool?.serverName === serverName ? 'rgba(245,158,11,0.1)' : 'transparent' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded uppercase text-slate-900" style={{ backgroundColor: '#FBBF24' }}>POST</span>
                        <h3 className="font-semibold text-slate-200 truncate">{tool.name}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">{tool.description}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {selectedTool ? (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Endpoint Header */}
              <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
                <div className="border-b p-4 flex items-center justify-between" style={{ backgroundColor: 'rgba(245,158,11,0.05)', borderColor: '#1e293b' }}>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded font-bold text-sm text-slate-900" style={{ backgroundColor: '#FBBF24' }}>POST</span>
                    <span className="font-mono font-semibold text-lg text-amber-500">/{selectedTool.name}</span>
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-bold uppercase text-amber-500 bg-amber-500/10 border border-amber-500/20">{selectedTool.serverName}</span>
                </div>
                <div className="p-6">
                  <p className="text-slate-300 text-base">{selectedTool.description}</p>
                </div>
              </div>

              {/* Parameters / Try it out */}
              <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
                <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#1e293b', backgroundColor: '#0B0F14' }}>
                  <h3 className="font-bold text-white text-lg">Parameters</h3>
                  
                  {selectedTool.inputSchema && (
                    <details className="relative group">
                      <summary className="text-sm font-bold cursor-pointer list-none flex items-center gap-1 px-3 py-1 rounded-md border transition-colors text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20">
                        Schema
                      </summary>
                      <div className="absolute right-0 top-full mt-2 p-4 rounded-lg shadow-2xl z-20 w-[500px] border hidden group-open:block" style={{ backgroundColor: '#0B0F14', borderColor: '#1e293b' }}>
                        <div className="text-slate-500 text-xs mb-2 font-bold uppercase tracking-wider">Input Schema JSON</div>
                        <pre className="text-xs font-mono whitespace-pre-wrap text-amber-400">
                          {JSON.stringify(selectedTool.inputSchema, null, 2)}
                        </pre>
                      </div>
                    </details>
                  )}
                </div>
                
                <div className="p-6">
                  {selectedTool.inputSchema?.properties && Object.keys(selectedTool.inputSchema.properties).length > 0 ? (
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b" style={{ borderColor: '#1e293b' }}>
                          <th className="py-3 text-slate-300 font-bold w-1/4">Name</th>
                          <th className="py-3 text-slate-300 font-bold">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedTool.inputSchema.properties).map(([key, schema]: [string, any]) => {
                          const isRequired = (selectedTool.inputSchema.required || []).includes(key);
                          return (
                            <tr key={key} className="border-b last:border-0" style={{ borderColor: '#1e293b' }}>
                              <td className="py-4 align-top pr-4">
                                <div className="font-bold text-white text-sm">
                                  {key}
                                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                                </div>
                                <div className="text-xs text-slate-500 font-mono mt-1">{schema.type}</div>
                              </td>
                              <td className="py-4 align-top">
                                <div className="text-slate-400 mb-2 font-medium">{schema.description || schema.title}</div>
                                <input
                                  type={schema.type === 'number' || schema.type === 'integer' ? 'number' : 'text'}
                                  className="w-full p-2.5 rounded-md focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm shadow-sm font-mono text-white placeholder-slate-600 transition-colors"
                                  style={{ backgroundColor: '#0B0F14', borderColor: '#1e293b', borderWidth: 1 }}
                                  placeholder={String(schema.default || '')}
                                  value={formValues[key] || ''}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setFormValues({...formValues, [key]: (schema.type === 'number' || schema.type === 'integer') ? (val ? Number(val) : '') : val})
                                  }}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-slate-500 italic py-4">No parameters required.</div>
                  )}

                  <div className="mt-8 pt-6 border-t" style={{ borderColor: '#1e293b' }}>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <details className="group cursor-pointer">
                          <summary className="text-sm font-bold text-slate-400 list-none flex items-center gap-2 hover:text-white transition-colors">
                            <ChevronRight size={16} className="group-open:hidden" />
                            <ChevronDown size={16} className="hidden group-open:block" />
                            Live Request Payload
                          </summary>
                          <div className="rounded-md p-3 shadow-inner mt-2 w-[832px]" style={{ backgroundColor: '#0B0F14' }}>
                            <pre className="text-xs font-mono whitespace-pre-wrap text-amber-200">
                              {(() => {
                                const completePayload: Record<string, any> = {};
                                if (selectedTool.inputSchema?.properties) {
                                  Object.keys(selectedTool.inputSchema.properties).forEach(key => {
                                    const schema = selectedTool.inputSchema.properties[key];
                                    if (formValues[key] !== undefined && formValues[key] !== '') {
                                      completePayload[key] = formValues[key];
                                    } else {
                                      completePayload[key] = schema.default !== undefined ? schema.default : null;
                                    }
                                  });
                                }
                                Object.keys(formValues).forEach(key => {
                                   if (formValues[key] !== '' && !completePayload.hasOwnProperty(key)) {
                                       completePayload[key] = formValues[key];
                                   }
                                });
                                return JSON.stringify(completePayload, null, 2);
                              })()}
                            </pre>
                          </div>
                        </details>
                      </div>
                    </div>

                    {authTokens[selectedTool.serverName] && (
                      <div className="flex items-center gap-2 text-xs font-bold p-3 rounded-md mb-4 border text-amber-500 bg-amber-500/10 border-amber-500/20">
                        <Lock size={14} />
                        <span>Using Bearer Token Authorization for {selectedTool.serverName}</span>
                      </div>
                    )}

                    <button 
                      onClick={handleExecute}
                      disabled={invokeMutation.isPending}
                      className="w-full flex justify-center items-center gap-2 rounded-md font-bold text-base transition-colors shadow-sm disabled:opacity-50 text-slate-900 hover:opacity-90"
                      style={{ backgroundColor: '#F59E0B' }}
                    >
                      <Play size={18} />
                      {invokeMutation.isPending ? 'Executing...' : 'Execute'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Responses */}
              {invokeMutation.data && (
                <div className="rounded-xl border overflow-hidden shadow-sm" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
                   <div className="p-4 border-b" style={{ borderColor: '#1e293b', backgroundColor: '#0B0F14' }}>
                    <h3 className="font-bold text-white text-lg">Server Response</h3>
                  </div>
                  <div className="p-6">
                    <div className={`p-4 rounded-md mb-4 flex items-center gap-2 border ${invokeMutation.data.error ? 'bg-red-950/30 text-red-400 border-red-900/50' : 'bg-green-950/30 text-green-400 border-green-900/50'}`}>
                      {invokeMutation.data.error ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                      <span className="font-bold">Code: {invokeMutation.data.error ? '500 Internal Server Error' : '200 OK'}</span>
                    </div>
                    <div className="rounded-lg p-4 overflow-x-auto shadow-inner" style={{ backgroundColor: '#0B0F14' }}>
                      <pre className="text-sm font-mono whitespace-pre-wrap text-amber-400">
                        {JSON.stringify(invokeMutation.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <div className="p-4 rounded-full mb-4" style={{ backgroundColor: '#131B24' }}>
                <Play size={32} className="text-slate-600 ml-1" />
              </div>
              <p className="text-lg font-medium text-slate-400">Select an endpoint to explore</p>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="rounded-xl shadow-xl w-[600px] overflow-hidden flex flex-col max-h-[80vh] border" style={{ backgroundColor: '#131B24', borderColor: '#1e293b' }}>
            <div className="border-b p-4 flex justify-between items-center shrink-0" style={{ backgroundColor: '#0B0F14', borderColor: '#1e293b' }}>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock size={20} className="text-amber-500" />
                Available authorizations
              </h2>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {serverNames.length === 0 ? (
                <div className="text-slate-500 italic text-center">No servers available to authorize.</div>
              ) : (
                serverNames.map((serverName) => (
                  <div key={serverName} className="border rounded-lg p-4" style={{ backgroundColor: '#0B0F14', borderColor: '#1e293b' }}>
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-bold text-white">{serverName}</h4>
                      {tempTokens[serverName] && <Lock size={14} className="text-amber-500" />}
                    </div>
                    <div className="space-y-1 mb-3">
                      <p className="text-xs text-amber-500 font-bold uppercase tracking-wider">Bearer Auth (OAuth2 / HTTP)</p>
                      <p className="text-xs text-slate-400">Token will be passed in the Authorization header specifically for this server.</p>
                    </div>
                    <div>
                      <input 
                        type="text"
                        placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                        value={tempTokens[serverName] || ''}
                        onChange={(e) => setTempTokens({...tempTokens, [serverName]: e.target.value})}
                        className="w-full p-2.5 rounded font-mono text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-white transition-colors"
                        style={{ backgroundColor: '#131B24', borderColor: '#1e293b', borderWidth: 1 }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t p-4 flex justify-end gap-3 shrink-0" style={{ backgroundColor: '#0B0F14', borderColor: '#1e293b' }}>
              {totalTokens > 0 && (
                <button 
                  onClick={logoutAllAuth}
                  className="px-4 py-2 font-bold rounded transition-colors mr-auto text-slate-300 hover:bg-slate-800"
                >
                  Logout All
                </button>
              )}
              <button 
                onClick={() => setShowAuthModal(false)}
                className="px-4 py-2 font-bold rounded transition-colors text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button 
                onClick={saveAuth}
                className="px-4 py-2 font-bold rounded shadow-sm transition-colors text-slate-900 hover:opacity-90"
                style={{ backgroundColor: '#F59E0B' }}
              >
                Authorize
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
