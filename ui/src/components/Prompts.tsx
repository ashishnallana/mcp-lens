import { useQuery } from '@tanstack/react-query';

export default function Prompts() {
  const { data, isLoading } = useQuery({
    queryKey: ['prompts'],
    queryFn: () => fetch('/api/prompts').then(res => res.json())
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading prompts...</div>;
  const prompts = data?.prompts || [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Prompt Explorer</h1>
      <div className="grid grid-cols-1 gap-4">
        {prompts.map((p: any) => (
          <div key={p.name} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors">
            <h3 className="font-bold text-lg text-slate-800">{p.name}</h3>
            <p className="text-sm text-slate-600 my-2">{p.description}</p>
            {p.arguments && p.arguments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold uppercase text-slate-400 mb-2 tracking-wider">Arguments</h4>
                <ul className="space-y-1">
                  {p.arguments.map((arg: any) => (
                    <li key={arg.name} className="text-sm text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100 flex items-center">
                      <span className="font-mono font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{arg.name}</span>
                      {arg.required && <span className="text-rose-500 ml-1.5 text-xs font-bold" title="Required">*</span>}
                      {arg.description && <span className="text-slate-500 ml-2 text-xs border-l border-slate-300 pl-2">{arg.description}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {prompts.length === 0 && (
          <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-400">
            No prompts discovered.
          </div>
        )}
      </div>
    </div>
  );
}
