'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  FaFacebookF, 
  FaInstagram, 
  FaYoutube, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaTruck,
  FaExchangeAlt,
  FaSpinner
} from 'react-icons/fa'

export default function StoreFooter() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const currentYear = new Date().getFullYear()

  // Charger la configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/public/config')
        const data = await response.json()
        if (data.success) {
          setConfig(data.config)
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error)
      } finally {
        setLoading(false)
      }
    }

      if (config) {
    console.log('Latitude:', config.latitude, 'Longitude:', config.longitude);
  }

    fetchConfig()
  }, [config]);

  // Liens sociaux avec les URLs de la config
  const socialLinks = [
    {
      name: 'Facebook',
      href: config?.socialMedia?.facebook || '#',
      icon: FaFacebookF,
      show: config?.socialMedia?.facebook
    },
    {
      name: 'Instagram',
      href: config?.socialMedia?.instagram || '#',
      icon: FaInstagram,
      show: config?.socialMedia?.instagram
    },
    {
      name: 'YouTube',
      href: config?.socialMedia?.youtube || '#',
      icon: FaYoutube,
      show: config?.socialMedia?.youtube
    }
  ].filter(link => link.show)

  // Générer l'URL de la carte Google Maps
  const getMapUrl = () => {
    if (!config?.latitude || !config?.longitude) return null;
    return `https://maps.google.com/maps?q=${config.latitude},${config.longitude}&z=17&output=embed`;
  }

  const mapUrl = getMapUrl()

  if (loading) {
    return (
      <footer className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2 text-neutral-400 text-sm">
              <FaSpinner className="animate-spin" />
              <span>Chargement...</span>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 3 Colonnes principales */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Colonne 1: Informations de contact */}
          <div className="text-center lg:text-left">
            <Link href="/" className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">EA</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {config?.storeName || 'EliteShop'}
              </span>
            </Link>
            
            <p className="text-neutral-300 text-sm mb-4">
              {config?.storeDescription || 'Votre magasin de confiance'}
            </p>
            
            {/* Contact info */}
            <div className="text-neutral-400 text-sm space-y-3">
              {config?.contactPhone && (
                <div className="flex items-center space-x-3">
                  <FaPhone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>{config.contactPhone}</span>
                </div>
              )}
              {config?.contactEmail && (
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>{config.contactEmail}</span>
                </div>
              )}
              {config?.address && (
                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>{config.address}</span>
                </div>
              )}
            </div>

            {/* Liens sociaux */}
            {socialLinks.length > 0 && (
              <div className="flex justify-center lg:justify-start space-x-3 mt-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-neutral-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 transform group"
                      title={social.name}
                    >
                      <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Colonne 2: Politiques et informations */}
          <div className="text-center lg:text-left">
            <h3 className="text-lg font-semibold mb-4 text-white">Informations</h3>
            
            {/* Politiques */}
            <div className="text-neutral-400 text-sm space-y-4">
              {config?.shippingPolicy && (
                <div className="flex items-start space-x-3">
                  <FaTruck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-medium text-neutral-300">Livraison</p>
                    <p className="text-sm">{config.shippingPolicy}</p>
                  </div>
                </div>
              )}
              {config?.returnPolicy && (
                <div className="flex items-start space-x-3">
                  <FaExchangeAlt className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="font-medium text-neutral-300">Retours</p>
                    <p className="text-sm">{config.returnPolicy}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Liens rapides */}
            {/* <div className="mt-6">
              <h4 className="font-medium text-neutral-300 mb-3">Liens rapides</h4>
              <div className="flex flex-col space-y-2 text-sm text-neutral-400">
                <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
                <Link href="/store" className="hover:text-white transition-colors">Boutique</Link>
                <Link href="/about" className="hover:text-white transition-colors">À propos</Link>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div> */}
          </div>

          {/* Colonne 3: Carte Google Maps */}
          <div className="text-center lg:text-left">
            <h3 className="text-lg font-semibold mb-4 text-white">Nous trouver</h3>
            
            {mapUrl ? (
              <div className="relative bg-neutral-800 rounded-xl overflow-hidden shadow-xl border border-neutral-700">
                {/* Address in top-right corner */}
                <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <FaMapMarkerAlt className="w-3 h-3 text-red-500 flex-shrink-0" />
                    <span className="text-gray-800 text-xs font-semibold max-w-[140px] truncate">
                      {config.address}
                    </span>
                  </div>
                </div>

                {/* Map */}
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation du magasin"
                  className="w-full h-48 lg:h-56"
                />

                {/* Simple bottom action */}
                <div className="p-3 bg-neutral-900 border-t border-neutral-700">
                  <button 
                    onClick={() => window.open(`https://maps.google.com/?q=${config.latitude},${config.longitude}`, '_blank')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <FaMapMarkerAlt className="w-3 h-3" />
                    <span>Voir sur Google Maps</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-800 rounded-xl p-6 text-center border border-neutral-700">
                <FaMapMarkerAlt className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-400 text-sm">Localisation à configurer</p>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-neutral-700 text-center">
          <p className="text-neutral-400 text-sm">
            &copy; {currentYear} {config?.storeName || 'EliteShop'}. Tous droits réservés.
          </p>
          <p className="text-neutral-500 text-xs mt-1">
            Développé par <span className="text-blue-400">zackwebdev</span>
          </p>
        </div>
      </div>
    </footer>
  )
}