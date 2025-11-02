"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaWhatsapp, FaSpinner } from 'react-icons/fa';

export default function WhatsAppOrderButton({ 
  label = "Commander via WhatsApp",
  message = "",
  className = "",
  disabled = false,
  iconOnly = false,
  size = "md"
}) {
  const [whatsappUrl, setWhatsappUrl] = useState('#');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchWhatsAppNumber = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/public/config');
        const data = await response.json();

        if (data.success && data.config?.whatsappNumber1) {
          const whatsappNumber = data.config.whatsappNumber1;
          const encodedMessage = encodeURIComponent(message);
          const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
          setWhatsappUrl(`https://wa.me/${cleanNumber}?text=${encodedMessage}`);
          setError(false);
        } else {
          console.error('WhatsApp number not found in config');
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching WhatsApp config:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (message) {
      fetchWhatsAppNumber();
    }
  }, [message]);

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Base button classes
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    bg-green-600 hover:bg-green-700 
    text-white font-semibold rounded-xl
    transition-colors shadow-lg shadow-green-600/30
    disabled:opacity-50 disabled:cursor-not-allowed
    ${sizeClasses[size]}
    ${className}
  `;

  // If still loading
  if (loading) {
    return (
      <button
        disabled
        className={baseClasses}
      >
        <FaSpinner className={`${iconSizes[size]} animate-spin`} />
        {!iconOnly && <span>Chargement...</span>}
      </button>
    );
  }

  // If error loading config
  if (error) {
    return (
      <button
        disabled
        className={`${baseClasses} bg-gray-400 hover:bg-gray-400`}
        title="Erreur de configuration WhatsApp"
      >
        <FaWhatsapp className={iconSizes[size]} />
        {!iconOnly && <span>{label}</span>}
      </button>
    );
  }

  // Normal button
  return (
    <Link
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${disabled ? 'pointer-events-none' : ''}`}
      aria-label={label}
    >
      <FaWhatsapp className={iconSizes[size]} />
      {!iconOnly && <span>{label}</span>}
    </Link>
  );
}