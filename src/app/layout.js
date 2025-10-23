import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/providers/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Electro Anbari - Laptop Store',
  description: 'Best laptops in town',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" className='dark'>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}