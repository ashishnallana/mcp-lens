import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle2, XCircle } from 'lucide-react';

export default function ToolExplorer() {
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [editorValue, setEditorValue] = useState('{\n  \n}');

  const { data: toolsData, isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: () => fetch('/api/tools').then(res => res.json()),
  });

  const invokeMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool_name: selectedTool.name,
          arguments: payload
        })
      });
      return res.json();
    }
  });

  if (isLoading) return <div className="p-8">Loading tools...</div>;

  const tools = toolsData?.tools || [];

  const handleExecute = () => {
    try {
      const payload = JSON.parse(editorValue);
      invokeMutation.mutate(payload);
    } catch (e) {
      alert("Invalid JSON payload");
    }
  };

  return (
    <div className="flex h-full">
      {/* Tool List Sidebar */}
      <div className="w-1/3 border-r border-slate-200 bg-white overflow-y-auto">
        <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-slate-700">
          Available Tools ({tools.length})
        </div>
        <div className="divide-y divide-slate-100">
          {tools.map((tool: any) => (
            <div 
              key={tool.name}
              onClick={() => {
                setSelectedTool(tool);
                setEditorValue('{\n  \n}');
                invokeMutation.reset();
              }}
              className={`p-4 cursor-pointer hover:bg-indigo-50 transition-colors ${selectedTool?.name === tool.name ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'}`}
            >
              <h3 className="font-medium text-slate-800">{tool.name}</h3>
              <p className="text-xs text-slate-500 mt-1 truncate">{tool.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedTool ? (
          <>
            <div className="p-6 bg-white border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800 mb-2">{selectedTool.name}</h2>
              <p className="text-sm text-slate-600 mb-4">{selectedTool.description}</p>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Input Schema</h4>
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                  {JSON.stringify(selectedTool.inputSchema, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
              <div className="flex-1 min-h-[200px] border border-slate-200 rounded-lg overflow-hidden bg-white flex flex-col">
                 <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Arguments (JSON)</span>
                    <button 
                      onClick={handleExecute}
                      disabled={invokeMutation.isPending}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Play size={16} />
                      {invokeMutation.isPending ? 'Executing...' : 'Execute'}
                    </button>
                 </div>
                 <div className="flex-1">
                   <Editor
                      height="100%"
                      defaultLanguage="json"
                      value={editorValue}
                      onChange={(val) => setEditorValue(val || '')}
                      options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        lineNumbers: 'off',
                        folding: false
                      }}
                    />
                 </div>
              </div>

              {/* Result Area */}
              {invokeMutation.data && (
                <div className="flex-1 border border-slate-200 rounded-lg bg-white overflow-hidden flex flex-col min-h-[200px]">
                  <div className={`p-3 border-b border-slate-200 flex items-center gap-2 ${invokeMutation.data.error ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    {invokeMutation.data.error ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    <span className="text-sm font-medium">Execution Result</span>
                  </div>
                  <div className="flex-1 p-4 overflow-auto">
                    <pre className="text-sm font-mono text-slate-800 whitespace-pre-wrap">
                      {JSON.stringify(invokeMutation.data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            Select a tool to explore and test
          </div>
        )}
      </div>
    </div>
  );
}
