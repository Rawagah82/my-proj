import { Language, DICTIONARY } from '../types';
import { Globe, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface HeaderProps {
  currentLang: Language;
  onLanguageToggle: () => void;
  onSubmitCount: number;
  onToggleHistory: () => void;
  showHistory: boolean;
}

export default function Header({
  currentLang,
  onLanguageToggle,
  onSubmitCount,
  onToggleHistory,
  showHistory,
}: HeaderProps) {
  const d = DICTIONARY[currentLang];

  return (
    <header className="sticky top-0 z-50 w-full bg-brand-bg/85 backdrop-blur-md border-b border-brand-teal/10 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            {/* Pulsing hex glow background */}
            <div className="absolute -inset-1 rounded-full bg-brand-gold/10 opacity-75 blur-sm group-hover:bg-brand-gold/25 transition duration-300 pointer-events-none" />
            <svg
              className="relative w-10 h-10 transition-transform duration-500 group-hover:rotate-180"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              id="madar-hex-logo"
            >
              <polygon
                points="50,5 90,28 90,72 50,95 10,72 10,28"
                stroke="var(--color-brand-gold)"
                strokeWidth="5"
                fill="rgba(13, 21, 38, 0.9)"
              />
              <polygon
                points="50,15 82,33 82,67 50,85 18,67 18,33"
                stroke="var(--color-brand-teal)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                fill="none"
              />
              <text
                x="50"
                y="61"
                fill="var(--color-brand-gold)"
                fontSize="38"
                fontWeight="900"
                fontFamily="system-ui, sans-serif"
                textAnchor="middle"
              >
                M
              </text>
            </svg>
          </div>

          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-serif font-extrabold tracking-widest text-brand-gold">
              {d.brand}
            </span>
            <span className="text-[9px] uppercase tracking-wider font-mono text-brand-teal/80">
              {currentLang === 'en' ? 'Industrial Portal' : 'البوابة الصناعية'}
            </span>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Secure Admin Portal button */}
          <motion.button
            id="btn-toggle-records"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleHistory}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all duration-200 cursor-pointer ${
              showHistory
                ? 'bg-brand-gold/20 text-brand-gold border-brand-gold shadow-lg shadow-brand-gold/10'
                : 'bg-brand-card/90 text-brand-text/80 border-brand-teal/20 hover:border-brand-gold/50 hover:bg-brand-teal/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
            <span className="font-semibold uppercase tracking-wider">
              {currentLang === 'en'
                ? `Admin Panel (${onSubmitCount})`
                : `بوابة التحكم للمشرف (${onSubmitCount})`}
            </span>
          </motion.button>

          {/* LANGUAGE SWITCHER */}
          <motion.button
            id="btn-lang-switcher"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLanguageToggle}
            className="flex items-center gap-2 px-4 py-2 rounded border border-brand-gold bg-transparent text-brand-gold font-sans text-xs md:text-sm font-semibold uppercase tracking-wider transition duration-300 cursor-pointer shadow-lg shadow-brand-bg/50"
            title={currentLang === 'en' ? 'تحويل للغة العربية' : 'Switch to English'}
          >
            <Globe className="w-4 h-4 text-brand-gold animate-spin-slow" />
            <span>{currentLang === 'en' ? 'عربي' : 'English'}</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
