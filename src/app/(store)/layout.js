import StoreHeader from '@/layouts/store/header'
import StoreFooter from '@/layouts/store/footer'
import StoreMain from '@/layouts/store/main'
import './store.css' 

export const metadata = {
  title: 'Electro Anbari - Accueil',
  description: 'Bienvenue sur notre boutique en ligne.',
}

export default function StoreLayout({ children }) {
  return (
    <div className="bg-white text-gray-900">
        <StoreHeader />
        <StoreMain>{children}</StoreMain>
        <StoreFooter />
    </div>
  )
}
