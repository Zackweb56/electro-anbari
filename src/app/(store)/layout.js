import StoreHeader from '@/layouts/store/header'
import StoreFooter from '@/layouts/store/footer'
import StoreMain from '@/layouts/store/main'
import './store.css' // optional custom css for store theme
import { Toaster } from 'sonner';

export const metadata = {
  title: 'MyStore - Accueil',
  description: 'Bienvenue sur notre boutique en ligne.',
}

export default function StoreLayout({ children }) {
  return (
    <div className="bg-white text-gray-900">
        <StoreHeader />
        <StoreMain>{children}</StoreMain>
        <Toaster 
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
        <StoreFooter />
    </div>
  )
}
