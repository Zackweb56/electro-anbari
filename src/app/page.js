// src/app/page.js
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/home');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AiOutlineLoading3Quarters className="text-4xl text-blue-600 animate-spin" />
    </div>
  );
}