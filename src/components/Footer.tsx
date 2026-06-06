import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ALL_TOOLS } from '../data/tools';
import { Zap, Twitter, Github, Mail, ArrowUpRight, Download, Smartphone } from 'lucide-react';

// YouTube SVG icon
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

// Facebook SVG icon
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Footer: React.FC = () => {
  const { t } = useLanguage();

  const getToolPath = (tool: any) => {
    if (tool.category === 'ai' || tool.category === 'generator') return `/tools/${tool.slug}`;
    return `/tool/${tool.slug}`;
  };

  const cleaningTools = ALL_TOOLS.filter(t => t.category === 'cleaning').slice(0, 5);
  const converterTools = ALL_TOOLS.filter(t => t.category === 'converter').slice(0, 5);

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">

        {/* Main grid */}
        <div className="py-12 sm:py-16 grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-10">

          {/* Brand col — 3 cols on md */}
          <div className="col-span-2 md:col-span-3">
            <Link to="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">TEXLY</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              {t.footer.description}
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/texly_tools"
                target="_blank" rel="noopener noreferrer"
                aria-label="Follow Texly on Twitter"
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                style={{ minHeight: 'unset', minWidth: 'unset' }}
              >
                <Twitter className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Follow Texly on Twitter</span>
              </a>
              <a
                href="https://github.com/chillforai/Texly"
                target="_blank" rel="noopener noreferrer"
                aria-label="Texly on GitHub"
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-colors"
                style={{ minHeight: 'unset', minWidth: 'unset' }}
              >
                <Github className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Texly on GitHub</span>
              </a>
              <a
                href="mailto:texlyonline@gmail.com"
                aria-label="Email Texly Support"
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                style={{ minHeight: 'unset', minWidth: 'unset' }}
              >
                <Mail className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">Email Texly Support</span>
              </a>
              <a
                href="https://youtube.com/@texlytools"
                target="_blank" rel="noopener noreferrer"
                aria-label="Texly on YouTube"
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                style={{ minHeight: 'unset', minWidth: 'unset' }}
              >
                <YouTubeIcon aria-hidden="true" />
                <span className="sr-only">Texly on YouTube</span>
              </a>
              <a
                href="https://www.facebook.com/share/1A7BuUGmSm/"
                target="_blank" rel="noopener noreferrer"
                aria-label="Texly on Facebook"
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
                style={{ minHeight: 'unset', minWidth: 'unset' }}
              >
                <FacebookIcon aria-hidden="true" />
                <span className="sr-only">Texly on Facebook</span>
              </a>
            </div>

            {/* 📱 APK Download Card → /download page */}
            <div className="mt-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-bold text-green-700 dark:text-green-400">Android App</span>
                <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full font-semibold">Free</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                100+ tools in one app — faster, offline-ready!
              </p>
              <Link
                to="/download"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-bold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-200 dark:hover:shadow-green-900"
              >
                <Download className="w-4 h-4" />
                Download Free APK
              </Link>
            </div>
          </div>

          {/* Text Cleaning — 2 cols */}
          <div className="col-span-1 md:col-span-2 md:col-start-5">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-5">
              {t.footer.cleaning}
            </h4>
            <ul className="space-y-3">
              {cleaningTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={getToolPath(tool)}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug block"
                  >
                    {t.toolNames[tool.id as keyof typeof t.toolNames] || tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Converters — 2 cols */}
          <div className="col-span-1 md:col-span-2 md:col-start-7">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-5">
              {t.footer.converters}
            </h4>
            <ul className="space-y-3">
              {converterTools.map(tool => (
                <li key={tool.id}>
                  <Link
                    to={getToolPath(tool)}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-snug block"
                  >
                    {t.toolNames[tool.id as keyof typeof t.toolNames] || tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources — 2 cols */}
          <div className="col-span-1 md:col-span-2 md:col-start-9">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-5">
              {t.footer.resources}
            </h4>
            <ul className="space-y-3">
              <li><Link to="/blog" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">{t.navbar.blog}</Link></li>
              <li><Link to="/ai-tools" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">AI Tools</Link></li>
              <li><Link to="/ai-automation" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">AI Automation</Link></li>
              <li><Link to="/about-us" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">{t.footer.aboutUs}</Link></li>
              <li><Link to="/contact-us" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block">{t.footer.contactUs}</Link></li>
            </ul>
          </div>

          {/* Trust card — 2 cols */}
          <div className="col-span-1 md:col-span-2 md:col-start-11">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-5">
              Trust
            </h4>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-[10px] shrink-0">TX</div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Texly Editorial</p>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-tight mt-0.5">AI &amp; Text Experts</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Every tool is manually verified and regularly updated for accuracy and performance.
              </p>
              <a
                href="/about-us"
                className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Learn more <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            {/* Sitemap link */}
            <a
              href="/sitemap.xml"
              className="mt-4 block text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Sitemap →
            </a>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <nav className="flex flex-wrap justify-center sm:justify-start gap-x-5 gap-y-2" aria-label="Footer Legal Navigation">
            <Link to="/privacy-policy" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              {t.footer.privacyPolicy}
            </Link>
            <Link to="/terms-and-conditions" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              {t.footer.termsOfService}
            </Link>
            <Link to="/about-us" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              {t.footer.aboutUs}
            </Link>
            <Link to="/contact-us" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              {t.footer.contactUs}
            </Link>
            <Link to="/about-us#editorial-policy" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              Editorial Policy
            </Link>
          </nav>
          <div className="flex flex-col items-center sm:items-end gap-1">
            <p className="text-xs text-slate-400 dark:text-slate-500 italic shrink-0">
              {t.footer.madeWith}
            </p>
            <address className="text-[10px] text-slate-300 dark:text-slate-600 not-italic">
              Texly · India · <a href="mailto:texlyonline@gmail.com" className="hover:text-slate-500 transition-colors">texlyonline@gmail.com</a>
            </address>
            <p className="text-[10px] text-slate-300 dark:text-slate-600">
              <span itemProp="author" itemScope itemType="https://schema.org/Organization">
                <span itemProp="name">Texly Team</span>
              </span>
              {' · '}
              <time dateTime="2024-01-01" itemProp="datePublished">Est. 2024</time>
              {' · '}
              <time dateTime={new Date().toISOString().split('T')[0]} itemProp="dateModified">Updated {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</time>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
