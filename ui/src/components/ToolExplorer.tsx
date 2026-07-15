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
    <div className="flex h-full flex-col bg-slate-50">
      
      {/* Top Bar - Swagger Style */}
      <div className="bg-white border-b border-slate-200 p-4 flex justify-between items-center shrink-0">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-emerald-500 text-white px-2 py-0.5 rounded text-sm font-mono">MCP</span>
          API Explorer
        </h1>
        <button 
          onClick={() => {
            setTempTokens({...authTokens});
            setShowAuthModal(true);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm border-2 transition-colors ${totalTokens > 0 ? 'border-emerald-500 text-emerald-600 hover:bg-emerald-50' : 'border-indigo-500 text-indigo-600 hover:bg-indigo-50'}`}
        >
          {totalTokens > 0 ? <Lock size={16} /> : <Unlock size={16} />}
          Authorize
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Tool List Sidebar */}
        <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-700">Tools Explorer</h2>
              <button 
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded transition-colors"
              >
                <Shield size={14} /> Auth
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search tools..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              />
            </div>
          </div>
          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
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
                    className="bg-slate-100 px-4 py-3 font-bold text-slate-700 text-xs uppercase tracking-wider sticky top-0 border-b border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:bg-slate-200 transition-colors z-10"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      <span>{serverName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasAuth && <span title="Authenticated"><Lock size={12} className="text-emerald-500" /></span>}
                      <span className="bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">{toolsList.length}</span>
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
                      className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedTool?.name === tool.name && selectedTool?.serverName === serverName ? 'bg-slate-50 border-l-4 border-emerald-500' : 'border-l-4 border-transparent'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">POST</span>
                        <h3 className="font-semibold text-slate-800 truncate">{tool.name}</h3>
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
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-blue-50 border-b border-blue-100 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded font-bold text-sm">POST</span>
                    <span className="font-mono text-slate-700 font-semibold text-lg">/{selectedTool.name}</span>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold uppercase">{selectedTool.serverName}</span>
                </div>
                <div className="p-6">
                  <p className="text-slate-600 text-base">{selectedTool.description}</p>
                </div>
              </div>

              {/* Parameters / Try it out */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800 text-lg">Parameters</h3>
                  
                  {selectedTool.inputSchema && (
                    <details className="relative group">
                      <summary className="text-sm font-bold text-indigo-600 cursor-pointer list-none flex items-center gap-1 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-md border border-indigo-100 transition-colors">
                        Schema
                      </summary>
                      <div className="absolute right-0 top-full mt-2 bg-slate-900 p-4 rounded-lg shadow-2xl z-20 w-[500px] border border-slate-700 hidden group-open:block">
                        <div className="text-slate-400 text-xs mb-2 font-bold uppercase tracking-wider">Input Schema JSON</div>
                        <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
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
                        <tr className="border-b border-slate-200">
                          <th className="py-3 text-slate-800 font-bold w-1/4">Name</th>
                          <th className="py-3 text-slate-800 font-bold">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(selectedTool.inputSchema.properties).map(([key, schema]: [string, any]) => {
                          const isRequired = (selectedTool.inputSchema.required || []).includes(key);
                          return (
                            <tr key={key} className="border-b border-slate-100 last:border-0">
                              <td className="py-4 align-top pr-4">
                                <div className="font-bold text-slate-800 text-sm">
                                  {key}
                                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                                </div>
                                <div className="text-xs text-slate-500 font-mono mt-1">{schema.type}</div>
                              </td>
                              <td className="py-4 align-top">
                                <div className="text-slate-600 mb-2 font-medium">{schema.description || schema.title}</div>
                                <input
                                  type={schema.type === 'number' || schema.type === 'integer' ? 'number' : 'text'}
                                  className="w-full p-2.5 border border-slate-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm shadow-sm font-mono"
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

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <details className="group cursor-pointer">
                          <summary className="text-sm font-bold text-slate-700 list-none flex items-center gap-2 hover:text-slate-900 transition-colors">
                            <ChevronRight size={16} className="group-open:hidden" />
                            <ChevronDown size={16} className="hidden group-open:block" />
                            Live Request Payload
                          </summary>
                          <div className="bg-slate-900 rounded-md p-3 shadow-inner mt-2 w-[832px]">
                            <pre className="text-xs font-mono text-blue-400 whitespace-pre-wrap">
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
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 p-3 rounded-md mb-4 border border-emerald-100">
                        <Lock size={14} />
                        <span>Using Bearer Token Authorization for {selectedTool.serverName}</span>
                      </div>
                    )}

                    <button 
                      onClick={handleExecute}
                      disabled={invokeMutation.isPending}
                      className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-bold text-base transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Play size={18} />
                      {invokeMutation.isPending ? 'Executing...' : 'Execute'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Responses */}
              {invokeMutation.data && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                   <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-800 text-lg">Server Response</h3>
                  </div>
                  <div className="p-6">
                    <div className={`p-4 rounded-md mb-4 flex items-center gap-2 ${invokeMutation.data.error ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                      {invokeMutation.data.error ? <XCircle size={20} /> : <CheckCircle2 size={20} />}
                      <span className="font-bold">Code: {invokeMutation.data.error ? '500 Internal Server Error' : '200 OK'}</span>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto shadow-inner">
                      <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap">
                        {JSON.stringify(invokeMutation.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <div className="bg-slate-200 p-4 rounded-full mb-4">
                <Play size={32} className="text-slate-400 ml-1" />
              </div>
              <p className="text-lg font-medium text-slate-500">Select an endpoint to explore</p>
            </div>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[600px] overflow-hidden flex flex-col max-h-[80vh]">
            <div className="border-b border-slate-200 p-4 flex justify-between items-center bg-slate-50 shrink-0">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Lock size={20} className="text-slate-500" />
                Available authorizations
              </h2>
              <button onClick={() => setShowAuthModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              {serverNames.length === 0 ? (
                <div className="text-slate-500 italic text-center">No servers available to authorize.</div>
              ) : (
                serverNames.map((serverName) => (
                  <div key={serverName} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center gap-2 mb-3">
                      <h4 className="font-bold text-slate-800">{serverName}</h4>
                      {tempTokens[serverName] && <Lock size={14} className="text-emerald-500" />}
                    </div>
                    <div className="space-y-1 mb-3">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Bearer Auth (OAuth2 / HTTP)</p>
                      <p className="text-xs text-slate-400">Token will be passed in the Authorization header specifically for this server.</p>
                    </div>
                    <div>
                      <input 
                        type="text"
                        placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                        value={tempTokens[serverName] || ''}
                        onChange={(e) => setTempTokens({...tempTokens, [serverName]: e.target.value})}
                        className="w-full p-2.5 border border-slate-300 rounded font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-200 p-4 flex justify-end gap-3 bg-slate-50 shrink-0">
              {totalTokens > 0 && (
                <button 
                  onClick={logoutAllAuth}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded transition-colors mr-auto"
                >
                  Logout All
                </button>
              )}
              <button 
                onClick={() => setShowAuthModal(false)}
                className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveAuth}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded shadow-sm transition-colors"
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
