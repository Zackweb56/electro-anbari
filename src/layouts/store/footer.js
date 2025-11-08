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
  FaSpinner,
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

    fetchConfig()
  }, [])

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
    return `https://maps.google.com/maps?q=${config.latitude},${config.longitude}&z=16&output=embed`;
  }

  const mapUrl = getMapUrl()

  if (loading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <FaSpinner className="animate-spin" />
              <span>Chargement...</span>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 4 Colonnes principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Colonne 1: Logo et contact */}
          <div className="text-center md:text-left">
            <Link href="/" className="flex items-center justify-center md:justify-start space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">EA</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {config?.storeName || 'Electro Anbari'}
              </span>
            </Link>
            
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              {config?.storeDescription || 'Votre magasin de confiance pour des produits technologiques premium.'}
            </p>
            
            {/* Contact info */}
            <div className="text-gray-400 text-sm space-y-4 text-center md:text-left">
              {config?.contactPhone && (
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <FaPhone className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="hover:text-white transition-colors cursor-pointer">{config.contactPhone}</span>
                </div>
              )}
              {config?.contactEmail && (
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <FaEnvelope className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="hover:text-white transition-colors cursor-pointer">{config.contactEmail}</span>
                </div>
              )}
            </div>

            {/* Liens sociaux */}
            {socialLinks.length > 0 && (
              <div className="flex justify-center md:justify-start space-x-3 mt-6">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 transform group border border-gray-700"
                      title={social.name}
                    >
                      <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Colonne 2: Liens rapides */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-6 text-white">Navigation</h3>
            
            <div className="flex flex-col space-y-3 text-sm text-gray-400">
              <Link href="/home" className="hover:text-white transition-colors py-1 hover:translate-x-1 transform duration-200">Accueil</Link>
              <Link href="/store" className="hover:text-white transition-colors py-1 hover:translate-x-1 transform duration-200">Boutique</Link>
              <Link href="/about" className="hover:text-white transition-colors py-1 hover:translate-x-1 transform duration-200">À propos</Link>
              <Link href="/contact" className="hover:text-white transition-colors py-1 hover:translate-x-1 transform duration-200">Contact</Link>
            </div>
          </div>

          {/* Colonne 3: Politiques et services */}
          {(config?.shippingPolicy || config?.returnPolicy) && (
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold mb-6 text-white">Services</h3>
              
              <div className="text-gray-400 text-sm space-y-4">
                {config?.shippingPolicy && (
                  <div className="flex items-start space-x-3 group cursor-pointer">
                    <FaTruck className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-gray-300 group-hover:text-white transition-colors">Livraison</p>
                      <p className="text-sm">{config.shippingPolicy}</p>
                    </div>
                  </div>
                )}
                {config?.returnPolicy && (
                  <div className="flex items-start space-x-3 group cursor-pointer">
                    <FaExchangeAlt className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <p className="font-medium text-gray-300 group-hover:text-white transition-colors">Retours</p>
                      <p className="text-sm">{config.returnPolicy}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Colonne 4: Carte Google Maps premium */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold mb-6 text-white">Nous Visiter</h3>
            
            {mapUrl ? (
              <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 group">
                {/* Carte avec badge d'adresse */}
                <div className="relative h-48 overflow-hidden">
                  <iframe
                    src={mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localisation du magasin"
                    className="group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Badge d'adresse en haut à gauche */}
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                    <div className="flex items-center space-x-2">
                      <FaMapMarkerAlt className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <span className="text-white text-xs font-medium max-w-[140px] truncate">
                        {config.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700 hover:border-gray-600 transition-colors">
                <FaMapMarkerAlt className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm mb-2">Localisation à configurer</p>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} {config?.storeName || 'Electro Anbari'}. Tous droits réservés.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Développé par{' '}
            <a 
              href="https://wa.me/212771615622" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
            >
              zackwebdev
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}