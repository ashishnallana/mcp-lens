import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MessageSquare, Play, ChevronDown, ChevronRight, Check, X, Search } from 'lucide-react';

export default function Prompts() {
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [expandedServers, setExpandedServers] = useState<Record<string, boolean>>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const { data: promptsData, isLoading } = useQuery({
    queryKey: ['prompts'],
    queryFn: () => fetch('/api/prompts').then(res => res.json()),
  });

  const getMutation = useMutation({
    mutationFn: async (req: {server_name: string, prompt_name: string, arguments: any}) => {
      const response = await fetch('/api/prompt/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req)
      });
      return response.json();
    }
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading prompts...</div>;

  const promptsMap = promptsData?.prompts || {};
  const serverNames = Object.keys(promptsMap);

  const toggleServer = (server: string) => {
    setExpandedServers(prev => ({ ...prev, [server]: prev[server] === false ? true : false }));
  };

  const handleExecute = () => {
    if (!selectedPrompt) return;
    getMutation.mutate({ 
      server_name: selectedPrompt.serverName, 
      prompt_name: selectedPrompt.name,
      arguments: formValues
    });
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex-shrink-0">
          <h2 className="font-bold text-slate-700 mb-3">Prompts Explorer</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search prompts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {serverNames.length === 0 && <div className="p-4 text-sm text-slate-500">No servers connected.</div>}
          
          {serverNames.map(serverName => {
            const rawPrompts = promptsMap[serverName] || [];
            const serverPrompts = rawPrompts.filter((prompt: any) => 
              prompt.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              (prompt.description && prompt.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            if (searchQuery && serverPrompts.length === 0) return null;

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
                  <span className="bg-slate-300 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">{serverPrompts.length}</span>
                </div>
                
                {isExpanded && (
                  <div className="py-1">
                    {serverPrompts.map((prompt: any) => (
                      <div
                        key={prompt.name}
                        onClick={() => { 
                          setSelectedPrompt({ ...prompt, serverName }); 
                          setFormValues({});
                          getMutation.reset(); 
                        }}
                        className={`px-4 py-3 cursor-pointer text-sm transition-colors border-l-4 ${
                          selectedPrompt?.name === prompt.name 
                            ? 'bg-blue-50 border-blue-500' 
                            : 'border-transparent hover:bg-slate-50'
                        }`}
                      >
                        <div className="font-medium text-slate-800">{prompt.name}</div>
                        <div className="text-xs text-slate-500 truncate mt-1">{prompt.description}</div>
                      </div>
                    ))}
                    {serverPrompts.length === 0 && (
                      <div className="px-4 py-3 text-xs text-slate-400 italic">No prompts</div>
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
        {selectedPrompt ? (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm mb-8">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-slate-800">{selectedPrompt.name}</h2>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {selectedPrompt.serverName}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-6">{selectedPrompt.description}</p>
                  
                  {/* Arguments Form */}
                  <div className="mb-6">
                    <h3 className="font-bold text-slate-700 mb-4 border-b pb-2">Prompt Arguments</h3>
                    {selectedPrompt.arguments?.length > 0 ? (
                      <div className="space-y-4">
                        {selectedPrompt.arguments.map((arg: any) => (
                          <div key={arg.name}>
                            <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                              {arg.name}
                              {arg.required && <span className="text-rose-500 text-xs">*</span>}
                            </label>
                            {arg.description && (
                              <p className="text-xs text-slate-500 mb-2">{arg.description}</p>
                            )}
                            <input
                              type="text"
                              value={formValues[arg.name] || ''}
                              onChange={(e) => setFormValues(prev => ({...prev, [arg.name]: e.target.value}))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                              placeholder={arg.required ? "Required" : "Optional"}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-500 italic py-4">No arguments required.</div>
                    )}
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <button 
                      onClick={handleExecute}
                      disabled={getMutation.isPending}
                      className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md font-bold text-base transition-colors shadow-sm disabled:opacity-50"
                    >
                      <Play size={18} />
                      {getMutation.isPending ? 'Generating...' : 'Get Prompt'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Responses */}
              {getMutation.data && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                   <div className="p-4 border-b border-slate-200 bg-slate-50">
                     <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        {getMutation.data.error ? <X className="text-rose-500" size={18}/> : <Check className="text-emerald-500" size={18}/>}
                        {getMutation.data.error ? 'Error' : 'Rendered Prompt'}
                     </h3>
                   </div>
                   <div className="p-6">
                     <div className="bg-slate-900 rounded-lg p-4 overflow-auto shadow-inner">
                       <pre className={`text-sm font-mono whitespace-pre-wrap ${getMutation.data.error ? 'text-rose-400' : 'text-emerald-400'}`}>
                         {getMutation.data.error ? getMutation.data.error : JSON.stringify(getMutation.data.result, null, 2)}
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
              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p>Select a prompt from the sidebar to view its details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
