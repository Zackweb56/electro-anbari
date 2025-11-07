'use client';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if already authenticated or block access
  useEffect(() => {
    if (status === 'loading') return;

    // Setup is disabled - redirect to login
    router.push('/admin/login');
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Accès refusé</h1>
        <p className="text-muted-foreground">La fonctionnalité de configuration est désactivée pour des raisons de sécurité.</p>
      </div>
    </div>
  );
}
