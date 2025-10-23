export default function AdminMain({ children }) {
  return (
    <main className="flex-1 overflow-auto">
      <div className="p-4 lg:p-6">
        {children}
      </div>
    </main>
  );
}