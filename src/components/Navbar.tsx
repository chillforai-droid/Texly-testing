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
  Zap, Languages, Check, Sun, Moon, Menu, X, Sparkles, Code2, Bot, Download, ChevronDown, BookOpen,
} from 'lucide-react';

const hubTranslations: Record<Language, {
  trigger: string;
  cleaning: string;
  converter: string;
  analysis: string;
  utility: string;
  pdf: string;
  ai: string;
  generator: string;
}> = {
  en: {
    trigger: "Premium Hubs",
    cleaning: "🧹 Text Cleaners Suite",
    converter: "🔄 Text Converter Suite",
    analysis: "📊 Text Analysis Suite",
    utility: "🔧 Text Utility Suite",
    pdf: "📄 PDF Tools Suite",
    ai: "🌌 AI Text & Tools Hub",
    generator: "⚡ Generators Suite"
  },
  hi: {
    trigger: "प्रीमियम हब",
    cleaning: "🧹 टेक्स्ट क्लीनर सूट",
    converter: "🔄 टेक्स्ट कनवर्टर सूट",
    analysis: "📊 टेक्स्ट एनालिसिस सूट",
    utility: "🔧 टेक्स्ट यूटिलिटी सूट",
    pdf: "📄 पीडीएफ टूल्स सूट",
    ai: "🌌 एआई टेक्स्ट और टूल्स",
    generator: "⚡ जनरेटर सूट"
  },
  hn: {
    trigger: "Premium Hubs",
    cleaning: "🧹 Text Cleaner Suite",
    converter: "🔄 Text Converter Suite",
    analysis: "📊 Text Analysis Suite",
    utility: "🔧 Text Utility Suite",
    pdf: "📄 PDF Tools Suite",
    ai: "🌌 AI Text & Tools Hub",
    generator: "⚡ Generators Suite"
  }
};

const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isHubsOpen, setIsHubsOpen] = useState(false);
  const [isMobileHubsOpen, setIsMobileHubsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Safe fallback list in case language is none of the defined
  const activeLang: Language = (language === 'hi' || language === 'hn') ? language : 'en';
  const hubTrans = hubTranslations[activeLang];

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

            {/* Premium Hubs Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsHubsOpen(!isHubsOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition-all select-none"
                aria-expanded={isHubsOpen}
                aria-haspopup="listbox"
              >
                <span>{hubTrans.trigger}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isHubsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isHubsOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsHubsOpen(false)} />
                  <div
                    className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
                  >
                    <Link
                      to="/tools/text-cleaning-hub"
                      onClick={() => setIsHubsOpen(false)}
                      className="flex items-center px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {hubTrans.cleaning}
                    </Link>
                    <Link
                      to="/tools/text-converter-hub"
                      onClick={() => setIsHubsOpen(false)}
                      className="flex items-center px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {hubTrans.converter}
                    </Link>
                    <Link
                      to="/tools/text-analysis-hub"
                      onClick={() => setIsHubsOpen(false)}
                      className="flex items-center px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {hubTrans.analysis}
                    </Link>
                    <Link
                      to="/tools/text-utility-hub"
                      onClick={() => setIsHubsOpen(false)}
                      className="flex items-center px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {hubTrans.utility}
                    </Link>
                    <Link
                      to="/tools/pdf-tools-hub"
                      onClick={() => setIsHubsOpen(false)}
                      className="flex items-center px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {hubTrans.pdf}
                    </Link>
                    <Link
                      to="/tools/ai-tools-hub"
                      onClick={() => setIsHubsOpen(false)}
                      className="flex items-center px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {hubTrans.ai}
                    </Link>
                    <Link
                      to="/tools/generators-hub"
                      onClick={() => setIsHubsOpen(false)}
                      className="flex items-center px-4 py-2.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {hubTrans.generator}
                    </Link>
                  </div>
                </>
              )}
            </div>

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
            {/* APK Download Button → /download page */}
            <Link
              to="/download"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl transition-all shadow-sm hover:shadow-green-200 dark:hover:shadow-green-900 hover:-translate-y-0.5"
              title="Download Texly Android App"
            >
              <Download className="w-4 h-4" />
              <span>App Download</span>
            </Link>

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
        className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto transition-all duration-200"
        style={{ maxHeight: isMobileMenuOpen ? '600px' : '0px', opacity: isMobileMenuOpen ? 1 : 0 }}
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

          {/* Collapsible Mobile Hubs */}
          <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800/50">
            <button
              onClick={() => setIsMobileHubsOpen(!isMobileHubsOpen)}
              className="w-full flex items-center justify-between p-3 min-h-[48px] text-slate-700 dark:text-white font-bold text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
            >
              <div className="flex items-center gap-3 text-sm">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <span>{hubTrans.trigger}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMobileHubsOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMobileHubsOpen && (
              <div className="px-3 pb-3 space-y-1 bg-white/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to="/tools/text-cleaning-hub"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-2 text-xs font-black text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {hubTrans.cleaning}
                </Link>
                <Link
                  to="/tools/text-converter-hub"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-2 text-xs font-black text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {hubTrans.converter}
                </Link>
                <Link
                  to="/tools/text-analysis-hub"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-2 text-xs font-black text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {hubTrans.analysis}
                </Link>
                <Link
                  to="/tools/text-utility-hub"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-2 text-xs font-black text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {hubTrans.utility}
                </Link>
                <Link
                  to="/tools/pdf-tools-hub"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-2 text-xs font-black text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {hubTrans.pdf}
                </Link>
                <Link
                  to="/tools/ai-tools-hub"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-2 text-xs font-black text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {hubTrans.ai}
                </Link>
                <Link
                  to="/tools/generators-hub"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block p-2 text-xs font-black text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {hubTrans.generator}
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/blog"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <BookOpen className="w-5 h-5 text-blue-500" />
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

          {/* APK Download — Mobile → /download page */}
          <Link
            to="/download"
            className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Download className="w-5 h-5" />
            <div>
              <div className="text-sm font-bold">📱 App Download</div>
              <div className="text-xs font-normal opacity-70">Free Android APK</div>
            </div>
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
                  onClick={() => { setLanguage(lang.code); setIsMobileMenuOpen(false); }}
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
    </nav>
  );
};

export default Navbar;
