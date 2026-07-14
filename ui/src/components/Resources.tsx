import { useQuery } from '@tanstack/react-query';

export default function Resources() {
  const { data, isLoading } = useQuery({
    queryKey: ['resources'],
    queryFn: () => fetch('/api/resources').then(res => res.json())
  });

  if (isLoading) return <div className="p-8 text-slate-500">Loading resources...</div>;
  const resources = data?.resources || [];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Resource Explorer</h1>
      <div className="grid grid-cols-1 gap-4">
        {resources.map((res: any) => (
          <div key={res.uri} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors">
            <h3 className="font-bold text-lg text-slate-800">{res.name || res.uri}</h3>
            <p className="text-sm font-mono text-indigo-600 my-2 bg-indigo-50 px-2 py-1 rounded inline-block">{res.uri}</p>
            <p className="text-sm text-slate-600 mt-2">{res.description}</p>
            {res.mimeType && <span className="inline-block mt-3 text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded font-medium">{res.mimeType}</span>}
          </div>
        ))}
        {resources.length === 0 && (
          <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-400">
            No resources discovered.
          </div>
        )}
      </div>
    </div>
  );
}
