import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  // Tutup dropdown secara otomatis kalau user klik di luar kotak menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Tombol Utama */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 items-center gap-1 rounded-xl px-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-ally-primary sm:px-3"
      >
        <Globe size={19} />
        <span className="hidden sm:inline ml-1 uppercase">{i18n.language || 'en'}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Kotak Pilihan Bahasa (Dropdown) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 overflow-hidden">
          <button
            onClick={() => changeLanguage('en')}
            className={`w-full text-left px-4 py-2 text-sm transition hover:bg-slate-50 ${
              i18n.language === 'en' ? 'text-ally-primary font-bold bg-slate-50' : 'text-slate-600 font-medium'
            }`}
          >
            English
          </button>
          <button
            onClick={() => changeLanguage('id')}
            className={`w-full text-left px-4 py-2 text-sm transition hover:bg-slate-50 ${
              i18n.language === 'id' ? 'text-ally-primary font-bold bg-slate-50' : 'text-slate-600 font-medium'
            }`}
          >
            Indonesia
          </button>
        </div>
      )}
    </div>
  );
}