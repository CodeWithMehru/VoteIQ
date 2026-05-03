'use client';

import { useLanguage } from '@/lib/i18n';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'zh', label: '中文' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage, isTranslating } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <div className="flex items-center space-x-2">
      <svg
        className="w-5 h-5 text-gray-500 dark:text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <select
        value={language}
        onChange={handleLanguageChange}
        disabled={isTranslating}
        className="bg-transparent text-sm border border-gray-300 dark:border-gray-700 rounded-md py-1 px-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-800 dark:text-white disabled:opacity-50"
        aria-label="Select Language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
