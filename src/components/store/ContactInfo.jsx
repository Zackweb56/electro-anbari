'use client';

import { useState, useEffect } from 'react';
import { 
  FaPhone, 
  FaEnvelope, 
  FaClock, 
  FaMapMarkerAlt,
  FaSpinner
} from 'react-icons/fa';

export default function ContactInfo() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger la configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/public/config');
        const data = await response.json();
        if (data.success) {
          setConfig(data.config);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  // Default values if config is not loaded
  const contactInfo = {
    phone: config?.contactPhone || '+212 6 00 00 00 00',
    email: config?.contactEmail || 'contact@electro-anbari.com',
    address: config?.address || 'Fequih ben saleh, Maroc',
    hours: 'Lun - Ven: 9h-18h' // You can also move this to config if needed
  };

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Contactez-Nous</h2>
          <div className="flex justify-center">
            <div className="text-center">
              <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Chargement des informations de contact...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Contactez-Nous</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {/* Téléphone */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FaPhone className="text-2xl text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Téléphone</h3>
            <p className="text-gray-600 hover:text-blue-600 transition-colors">
              <a href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}>
                {contactInfo.phone}
              </a>
            </p>
          </div>

          {/* Email */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FaEnvelope className="text-2xl text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Email</h3>
            <p className="text-gray-600 hover:text-blue-600 transition-colors">
              <a href={`mailto:${contactInfo.email}`}>
                {contactInfo.email}
              </a>
            </p>
          </div>

          {/* Horaires */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FaClock className="text-2xl text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Horaires</h3>
            <p className="text-gray-600">{contactInfo.hours}</p>
            <p className="text-sm text-gray-500 mt-1">Sam: 9h-13h</p>
          </div>

          {/* Adresse */}
          <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FaMapMarkerAlt className="text-2xl text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Adresse</h3>
            <p className="text-gray-600">{contactInfo.address}</p>
            {config?.latitude && config?.longitude && (
              <button 
                onClick={() => window.open(`https://maps.google.com/?q=${config.latitude},${config.longitude}`, '_blank')}
                className="text-sm text-blue-600 hover:text-blue-700 mt-2 hover:underline"
              >
                Voir sur la carte
              </button>
            )}
          </div>
        </div>

        {/* Additional Contact Info */}
        {(config?.whatsappNumber1 || config?.whatsappNumber2) && (
        <div className="mt-12 text-center">
            <div className="bg-gray-50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Besoin d&apos;aide ?
            </h3>
            <p className="text-gray-600 mb-4">
                Notre équipe est à votre disposition pour répondre à toutes vos questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* WhatsApp Number 1 */}
                {config?.whatsappNumber1 && (
                <a
                    href={`https://wa.me/${config.whatsappNumber1.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center justify-center flex-1 sm:flex-none min-w-[160px]"
                >
                    <FaPhone className="mr-2" />
                    WhatsApp 1
                </a>
                )}
                
                {/* WhatsApp Number 2 */}
                {config?.whatsappNumber2 && (
                <a
                    href={`https://wa.me/${config.whatsappNumber2.replace(/\s/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center justify-center flex-1 sm:flex-none min-w-[160px]"
                >
                    <FaPhone className="mr-2" />
                    WhatsApp 2
                </a>
                )}
                
                {/* Regular Phone Call */}
                <a
                href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center flex-1 sm:flex-none min-w-[160px]"
                >
                <FaPhone className="mr-2" />
                Appeler maintenant
                </a>
            </div>
            
            {/* WhatsApp numbers display */}
            <div className="mt-4 text-sm text-gray-500">
                {config?.whatsappNumber1 && config?.whatsappNumber2 && (
                <p>Disponible sur deux numéros WhatsApp</p>
                )}
                {config?.whatsappNumber1 && !config?.whatsappNumber2 && (
                <p>Disponible sur WhatsApp: {config.whatsappNumber1}</p>
                )}
                {!config?.whatsappNumber1 && config?.whatsappNumber2 && (
                <p>Disponible sur WhatsApp: {config.whatsappNumber2}</p>
                )}
            </div>
            </div>
        </div>
        )}
      </div>
    </section>
  );
}