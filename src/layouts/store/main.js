import ScrollToTop from '@/components/store/ScrollToTop';

export default function StoreMain({ children }) {
  return (
    <main className="flex-1 bg-gray-50">
      {children}
      <ScrollToTop />
    </main>
  )
}