import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ALL_TOOLS } from '../data/tools';
import { Zap, Twitter, Github, Mail, ArrowUpRight } from 'lucide-react';

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
                aria-label="Twitter"
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                style={{ minHeight: 'unset', minWidth: 'unset' }}
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://github.com/texly"
                target="_blank" rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-colors"
                style={{ minHeight: 'unset', minWidth: 'unset' }}
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:texlyonline@gmail.com"
                aria-label="Email"
                className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                style={{ minHeight: 'unset', minWidth: 'unset' }}
              >
                <Mail className="w-4 h-4" />
              </a>
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
          </nav>
          <p className="text-xs text-slate-400 dark:text-slate-500 italic shrink-0">
            {t.footer.madeWith}
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
