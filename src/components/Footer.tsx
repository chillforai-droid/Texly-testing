import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ALL_TOOLS } from '../data/tools';
import { Zap, Twitter, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  const getToolPath = (tool: any) => {
    if (tool.category === 'ai' || tool.category === 'generator') {
      return `/tools/${tool.slug}`;
    }
    return `/tool/${tool.slug}`;
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">TEXLY</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t.footer.description}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest">{t.footer.cleaning}</h4>
            <ul className="space-y-4">
              {ALL_TOOLS.filter(toolItem => toolItem.category === 'cleaning').slice(0, 5).map(toolItem => (
                <li key={toolItem.id}>
                  <Link to={getToolPath(toolItem)} className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    {t.toolNames[toolItem.id as keyof typeof t.toolNames] || toolItem.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest">{t.footer.converters}</h4>
            <ul className="space-y-4">
              {ALL_TOOLS.filter(toolItem => toolItem.category === 'converter').slice(0, 5).map(toolItem => (
                <li key={toolItem.id}>
                  <Link to={getToolPath(toolItem)} className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                    {t.toolNames[toolItem.id as keyof typeof t.toolNames] || toolItem.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest">{t.footer.resources}</h4>
            <ul className="space-y-4">
              <li><Link to="/blog" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">{t.navbar.blog}</Link></li>
              <li><Link to="/about-us" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">{t.footer.aboutUs}</Link></li>
              <li><Link to="/contact-us" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">{t.footer.contactUs}</Link></li>
              <li><a href="/sitemap.xml" className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">Sitemap</a></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-widest">Connect</h4>
            <div className="flex gap-4 mb-6">
              <a 
                href="https://twitter.com/texly_tools" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Twitter" 
                className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-sans"
              >
                <Twitter className="w-5 h-5" aria-hidden="true" />
              </a>
              <a 
                href="https://github.com/texly" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Github" 
                className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all font-sans"
              >
                <Github className="w-5 h-5" aria-hidden="true" />
              </a>
              <a 
                href="mailto:support@texly.online" 
                aria-label="Email" 
                className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all font-sans"
              >
                <Mail className="w-5 h-5" aria-hidden="true" />
              </a>
            </div>
            
            {/* Author / Trust Signal */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-[10px]">TX</div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Texly Editorial</p>
                  <p className="text-[9px] text-slate-500 dark:text-slate-500 uppercase tracking-tighter mt-1">AI & Text Experts</p>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Every tool is manually verified and regularly updated for accuracy and performance.</p>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6" aria-label="Footer Navigation">
            <Link to="/privacy-policy" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">{t.footer.privacyPolicy}</Link>
            <Link to="/terms-and-conditions" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">{t.footer.termsOfService}</Link>
            <Link to="/about-us" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">{t.footer.aboutUs}</Link>
            <Link to="/contact-us" className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">{t.footer.contactUs}</Link>
          </nav>
          <p className="text-xs text-slate-400 dark:text-slate-500 italic">{t.footer.madeWith}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
