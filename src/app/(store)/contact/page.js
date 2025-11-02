"use client"

import { useEffect, useState } from 'react'
import ContactInfo from '@/components/store/ContactInfo'
import { FaMapMarkerAlt, FaHome } from 'react-icons/fa'
import Link from 'next/link'

export default function ContactPage() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/public/config')
        const data = await res.json()
        if (data.success) setConfig(data.config)
      } catch (err) {
        console.error('Failed to load config for contact page', err)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [])

  const mapUrl = config?.latitude && config?.longitude
    ? `https://maps.google.com/maps?q=${config.latitude},${config.longitude}&z=16&output=embed`
    : null

  return (
    <main className="min-h-screen bg-white">
      {/* Enhanced Hero with Pattern Background */}
      <section className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black py-16 lg:py-20 overflow-hidden">
        {/* Diagonal Pattern Background */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,rgba(59,130,246,0.05)_50%,transparent_51%)] bg-[size:10px_10px]"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Link href="/home" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                <FaHome className="w-3 h-3" />
                Accueil
              </Link>
              <span className="opacity-50">/</span>
              <span className="text-blue-400 font-medium">Contact</span>
            </nav>

            {/* Title */}
            <div className="mb-6">
              <div className="relative inline-block">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-bold text-white mb-2 tracking-tight">
                  Contactez-Nous
                </h1>
                {/* Decorative underline */}
                <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
              </div>
            </div>

          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
      </section>

      {/* Contact Info Cards - Elevated Design */}
      <section className="relative -mt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-900/10 p-6 sm:p-8 lg:p-10 border border-gray-100">
            <ContactInfo />
          </div>
        </div>
      </section>

      {/* Map Section with Enhanced Design */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Notre Localisation
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Retrouvez-nous facilement grâce à notre carte interactive
            </p>
          </div>

          {/* Map Container */}
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
            {loading ? (
              <div className="bg-gray-50 py-20 text-center">
                <div className="inline-flex flex-col items-center space-y-4">
                  <svg 
                    className="animate-spin h-10 w-10 text-blue-600" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  <span className="text-gray-600 font-medium">Chargement de la carte…</span>
                </div>
              </div>
            ) : mapUrl ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={mapUrl}
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0, minHeight: '450px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation du magasin"
                />
              </div>
            ) : (
              <div className="bg-gray-50 py-20 text-center">
                <div className="flex flex-col items-center space-y-4 max-w-md mx-auto px-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <FaMapMarkerAlt className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Localisation non disponible
                    </h3>
                    <p className="text-gray-600 text-sm">
                      La localisation n&apos;est pas configurée. Veuillez ajouter les coordonnées dans l&apos;administration.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Besoin d&apos;aide pour choisir ?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Notre équipe d&apos;experts est disponible pour vous conseiller et vous aider à trouver le produit parfait
          </p>
          <Link
            href="/store"
            className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Découvrir nos produits
          </Link>
        </div>
      </section>
    </main>
  )
}