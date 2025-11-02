"use client";
import { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      try {
        setVisible(window.scrollY > 300);
      } catch (e) {
        // ignore during SSR hydration issues
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // check initial position
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      aria-label="Scroll to top"
      onClick={handleClick}
      className={`fixed z-50 bottom-6 right-6 sm:bottom-8 sm:right-8 p-3 rounded-full shadow-lg text-white flex items-center justify-center transition-opacity duration-300 ease-in-out ${
        visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      } bg-blue-600 hover:bg-blue-700 focus:outline-none`}
      title="Haut de page"
    >
      <FaArrowUp className="w-4 h-4" />
    </button>
  );
}
