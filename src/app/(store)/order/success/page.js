// src/app/(store)/order/success/page.js
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaPhone, FaCheckCircle, FaShippingFast, FaMoneyBillWave } from 'react-icons/fa';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    if (!orderNumber) {
      router.push('/');
      return;
    }
  }, [orderNumber, router]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              Commande Passée avec Succès!
            </h1>
            <p className="text-green-600">
              Merci pour votre commande. Nous vous contacterons dans les 24 heures pour confirmer les détails.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Détails de la Commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Numéro de Commande</p>
              <p className="font-medium text-lg">{orderNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Statut</p>
              <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                En Attente de Confirmation
              </div>
            </div>
          </div>

          {/* Professional Next Steps Section */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaPhone className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900 text-sm">Contact sous 24h</p>
                  <p className="text-sm text-blue-700">Nous vous contacterons par téléphone ou WhatsApp pour confirmer votre commande</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button asChild className="flex-1 bg-neutral-900 hover:bg-neutral-800 text-white">
              <Link href="/">
                Retour à la Boutique
              </Link>
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-4">
            Vous avez des questions? Contactez-nous au <strong>+212 771 615 622</strong>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}