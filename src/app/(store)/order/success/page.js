// src/app/(store)/order/success/page.js
'use client';

import { useEffect, Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaPhone, FaCheckCircle, FaShippingFast, FaMoneyBillWave, FaHome, FaStore, FaClock, FaUserCheck, FaTruck } from 'react-icons/fa';

// Composant principal avec Suspense
function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [config, setConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const orderNumber = searchParams.get('orderNumber');

  // Fetch config for dynamic phone number and opening hours
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/public/config');
        const data = await response.json();
        if (data.success) {
          setConfig(data.config);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoadingConfig(false);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    if (!orderNumber) {
      router.push('/');
      return;
    }
  }, [orderNumber, router]);

  const supportPhone = config?.contactPhone || '+212760045325';
  const openingHours = config?.openingHours || 'Lun - Ven: 9h-18h';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-2xl">
        {/* Success Card */}
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-lg mx-auto mb-4 sm:mb-6">
          <CardContent className="p-4 sm:p-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <FaCheckCircle className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
              </div>
              <h1 className="text-[20px] sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight">
                Commande Confirmée
              </h1>
              <p className="text-gray-600 text-[13px] sm:text-lg leading-relaxed max-w-md mx-auto">
                Votre commande a été enregistrée avec succès. Notre équipe vous contactera sous 24 heures.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Details Card - Premium Design */}
        <Card className="shadow-xl border-0 bg-white mx-auto overflow-hidden">
          <CardHeader className="pb-3 sm:pb-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-[18px] sm:text-2xl font-bold text-gray-900">
              Détails de la Commande
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-8 space-y-4 sm:space-y-6">
            {/* Order Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-100">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] sm:text-xs font-bold">N°</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Référence
                      </p>
                      <p className="text-[14px] sm:text-lg font-mono font-bold text-gray-900 tracking-wide">
                        {orderNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 sm:p-4 border border-amber-100">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FaClock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] sm:text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Statut
                      </p>
                      <div className="inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-amber-100 border border-amber-200">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full mr-1.5 sm:mr-2 animate-pulse"></div>
                        <span className="text-[11px] sm:text-sm font-semibold text-amber-800">
                          En attente de confirmation
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Process Timeline */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-3 sm:p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 text-[15px] sm:text-lg mb-3 sm:mb-4 flex items-center">
                  <FaUserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2" />
                  Prochaines étapes
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] sm:text-sm font-bold">1</span>
                      </div>
                      <div className="w-0.5 h-6 sm:h-8 bg-gray-300 mt-1"></div>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="font-semibold text-gray-900 text-[12px] sm:text-sm mb-1">Contact initial</p>
                      <p className="text-gray-600 text-[10px] sm:text-xs leading-relaxed">
                        Notre équipe vous contacte sous 24h pour confirmer les détails
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] sm:text-sm font-bold">2</span>
                      </div>
                      <div className="w-0.5 h-6 sm:h-8 bg-gray-300 mt-1"></div>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="font-semibold text-gray-900 text-[12px] sm:text-sm mb-1">Validation</p>
                      <p className="text-gray-600 text-[10px] sm:text-xs leading-relaxed">
                        Confirmation des disponibilités et préparation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] sm:text-sm font-bold">3</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="font-semibold text-gray-900 text-[12px] sm:text-sm mb-1">Livraison</p>
                      <p className="text-gray-600 text-[10px] sm:text-xs leading-relaxed">
                        Organisation de la livraison selon votre localisation
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
              <Button asChild className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 sm:py-3 h-auto text-[13px] sm:text-base font-semibold shadow-lg">
                <Link href="/" className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <FaHome className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Retour à l&apos;accueil</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 py-2.5 sm:py-3 h-auto text-[13px] sm:text-base font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50">
                <Link href="/store" className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <FaStore className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Continuer les achats</span>
                </Link>
              </Button>
            </div>

            {/* Contact Information */}
            <div className="text-center pt-3 sm:pt-4 border-t border-gray-100">
              <p className="text-[12px] sm:text-sm text-gray-500 mb-2 sm:mb-3">
                Questions concernant votre commande ?
              </p>
              <div className="inline-flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 bg-blue-50 rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-blue-200">
                <div className="flex items-center space-x-2">
                  <FaPhone className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                  <span className="text-[14px] sm:text-lg font-bold text-gray-900">
                    {loadingConfig ? 'Chargement...' : supportPhone}
                  </span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-blue-300"></div>
                <span className="text-[11px] sm:text-sm text-blue-700 font-medium">Support Client</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-2 sm:mt-3">
                {loadingConfig ? 'Chargement des horaires...' : openingHours}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Page principale avec Suspense
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-[14px] sm:text-lg font-medium">Chargement de votre commande...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}