/**
 * Navbar.tsx — framer-motion REMOVED from this file.
 *
 * WHY: Navbar is in the critical render path (loads on every page).
 * Directly importing framer-motion here caused it to land in vendor-common,
 * creating a circular chunk (vendor-common → vendor-react → vendor-common)
 * that prevented React from booting on mobile — resulting in a blank screen.
 *
 * Animations replaced with CSS transitions (same visual result, zero JS cost).
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Language } from '../data/translations';
import {
  Zap, Languages, Check, Sun, Moon, Menu, X, Sparkles, Code2, Bot,
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'hn', name: 'Hinglish' },
  ];

  return (
    <nav
      aria-label="Global Navigation"
      className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group" aria-label="Texly Home">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
            TEXLY
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-1">
            <Link
              to="/ai-tools"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {t.navbar.aiTools}
            </Link>
            <Link
              to="/blog"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-all"
            >
              {t.navbar.blog}
            </Link>
            {/* DevStudio link */}
            <Link
              to="/devstudio"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all"
            >
              <Code2 className="w-4 h-4" />
              DevStudio
            </Link>
            {/* GitHub Push link */}
            <Link
              to="/ai-automation"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
            >
              <Bot className="w-4 h-4" />
              GitHub Push
            </Link>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                aria-expanded={isLangOpen}
                aria-haspopup="listbox"
              >
                <Languages className="w-4 h-4" />
                <span className="uppercase text-xs">{language}</span>
              </button>

              {isLangOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsLangOpen(false)} />
                  <div
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden"
                    style={{ animation: 'texly-dropdown 0.15s ease-out' }}
                    role="listbox"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        role="option"
                        aria-selected={language === lang.code}
                      >
                        {lang.name}
                        {language === lang.code && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle Mobile Menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-200"
        style={{ maxHeight: isMobileMenuOpen ? '400px' : '0px', opacity: isMobileMenuOpen ? 1 : 0 }}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="p-4 space-y-2">
          <Link
            to="/ai-tools"
            className="flex items-center gap-3 p-3 min-h-[48px] rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Sparkles className="w-5 h-5" />
            {t.navbar.aiTools}
          </Link>
          <Link
            to="/blog"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t.navbar.blog}
          </Link>
          <Link
            to="/devstudio"
            className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Code2 className="w-5 h-5" />
            DevStudio
          </Link>
          <Link
            to="/ai-automation"
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Bot className="w-5 h-5" />
            GitHub Push
          </Link>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all ${
                    language === lang.code
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {lang.code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes texly-dropdown {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
