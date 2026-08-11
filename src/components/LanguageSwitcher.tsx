import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  // Tambahkan tipe React.ChangeEvent<HTMLSelectElement> untuk event
  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <select 
      onChange={changeLanguage} 
      value={i18n.language}
      className="bg-transparent border-none outline-none cursor-pointer font-semibold text-gray-700 mr-4"
    >
      <option value="en">EN</option>
      <option value="id">ID</option>
    </select>
  );
}