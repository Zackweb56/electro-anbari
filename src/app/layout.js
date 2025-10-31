import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner';

import AuthProvider from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Electro Anbari Store',
  description: 'Store layout for Electro Anbari',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster 
            position="top-right"
            richColors
            closeButton
            duration={4000}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
