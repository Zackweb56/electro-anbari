// src/app/admin/layout.js
import AuthProvider from '@/components/providers/AuthProvider';
import './admin.css';

export const metadata = {
  title: 'Electro Anbari - Admin',
  description: 'Administration dashboard',
}

export default function AdminLayout({ children }) {
  // Do not render <html> or <body> here; the root layout controls those.
  // Wrap admin content in a container with the `dark` class so Tailwind's
  // dark variants apply only to the admin area.
  return (
    <AuthProvider>
      <div className="dark flex flex-col min-h-screen">
        <main className="flex-1">{children}</main>
      </div>
    </AuthProvider>
  );
}