export default function ProductSpecs({ specifications }) {
  const specEntries = Object.entries(specifications).filter(([_, value]) => value);

  if (specEntries.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Spécifications techniques</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {specEntries.map(([key, value]) => (
          <div key={key} className="border-b border-gray-100 pb-4 last:border-b-0">
            <dt className="text-sm font-medium text-gray-500 capitalize mb-1">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </dt>
            <dd className="text-gray-900">{value}</dd>
          </div>
        ))}
      </div>
    </div>
  );
}