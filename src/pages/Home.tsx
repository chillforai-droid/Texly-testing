import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Heart, 
  Sparkles, 
  ChevronRight,
  ChevronLeft,
  Star,
  FileText,
  RefreshCw,
  Trash2,
  BarChart3,
  Wrench
} from 'lucide-react';
import { ALL_TOOLS, CATEGORIES } from '../data/tools';

import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import AdPlaceholder from '../components/AdPlaceholder';
import { useLanguage } from '../context/LanguageContext';
import { BASE_URL } from '../config';

import CategoryModal from '../components/CategoryModal';
import DynamicIcon from '../components/LucideIcon';

const HomePage = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  useEffect(() => {
    document.title = `Texly – ${t.home.heroTitle}`;
  }, [t.home.heroTitle]);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return ALL_TOOLS;
    const search = searchQuery.toLowerCase();
    return ALL_TOOLS.filter(tool => 
      tool.name.toLowerCase().includes(search) || 
      tool.category.toLowerCase().includes(search) ||
      tool.keywords.some(k => k.toLowerCase().includes(search)) ||
      (t.toolNames[tool.id as keyof typeof t.toolNames] || '').toLowerCase().includes(search)
    );
  }, [searchQuery, t.toolNames]);

  const [displayCount, setDisplayCount] = useState(12);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setDisplayCount(6);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const popularTools = useMemo(() => ALL_TOOLS.slice(0, displayCount), [displayCount]);

  // JSON-LD for Home
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": BASE_URL,
    "name": "Texly",
    "description": "Free online text tools for cleaning, formatting, and analyzing text.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${BASE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  const categoryIcons: any = {
    cleaning: <Trash2 className="w-5 h-5" />,
    converter: <RefreshCw className="w-5 h-5" />,
    analysis: <BarChart3 className="w-5 h-5" />,
    utility: <Wrench className="w-5 h-5" />,
    pdf: <FileText className="w-5 h-5" />,
    ai: <Sparkles className="w-5 h-5" />,
    generator: <Sparkles className="w-5 h-5" />,
  };

  const getToolPath = (tool: any) => {
    if (tool.category === 'ai' || tool.category === 'generator') {
      return `/tools/${tool.slug}`;
    }
    return `/tool/${tool.slug}`;
  };

  const categoryThemes: Record<string, { 
    primary: string, 
    bg: string, 
    border: string, 
    iconBg: string,
    text: string,
    gradient: string,
    hoverShadow: string
  }> = {
    cleaning: { 
      primary: 'emerald-600', 
      bg: 'bg-emerald-50/50 dark:bg-emerald-900/10', 
      border: 'border-emerald-100 dark:border-emerald-800/50', 
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      text: 'text-emerald-900 dark:text-emerald-100',
      gradient: 'from-emerald-500 to-teal-600',
      hoverShadow: 'hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20'
    },
    converter: { 
      primary: 'blue-600', 
      bg: 'bg-blue-50/50 dark:bg-blue-900/10', 
      border: 'border-blue-100 dark:border-blue-800/50', 
      iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      text: 'text-blue-900 dark:text-blue-100',
      gradient: 'from-blue-500 to-indigo-600',
      hoverShadow: 'hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20'
    },
    analysis: { 
      primary: 'amber-600', 
      bg: 'bg-amber-50/50 dark:bg-amber-900/10', 
      border: 'border-amber-100 dark:border-amber-800/50', 
      iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      text: 'text-amber-900 dark:text-amber-100',
      gradient: 'from-amber-500 to-orange-600',
      hoverShadow: 'hover:shadow-amber-500/10 dark:hover:shadow-amber-500/20'
    },
    utility: { 
      primary: 'slate-600', 
      bg: 'bg-slate-50/50 dark:bg-slate-900/10', 
      border: 'border-slate-100 dark:border-slate-800/50', 
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
      text: 'text-slate-900 dark:text-slate-100',
      gradient: 'from-slate-500 to-slate-700',
      hoverShadow: 'hover:shadow-slate-500/10 dark:hover:shadow-slate-500/20'
    },
    pdf: { 
      primary: 'rose-600', 
      bg: 'bg-rose-50/50 dark:bg-rose-900/10', 
      border: 'border-rose-100 dark:border-rose-800/50', 
      iconBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
      text: 'text-rose-900 dark:text-rose-100',
      gradient: 'from-rose-500 to-pink-600',
      hoverShadow: 'hover:shadow-rose-500/10 dark:hover:shadow-rose-500/20'
    },
    ai: { 
      primary: 'blue-600', 
      bg: 'bg-blue-50/50 dark:bg-blue-900/10', 
      border: 'border-blue-100 dark:border-blue-800/50', 
      iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      text: 'text-blue-900 dark:text-blue-100',
      gradient: 'from-blue-500 to-indigo-600',
      hoverShadow: 'hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20'
    },
    generator: { 
      primary: 'purple-600', 
      bg: 'bg-purple-50/50 dark:bg-purple-900/10', 
      border: 'border-purple-100 dark:border-purple-800/50', 
      iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      text: 'text-purple-900 dark:text-purple-100',
      gradient: 'from-purple-500 to-fuchsia-600',
      hoverShadow: 'hover:shadow-purple-500/10 dark:hover:shadow-purple-500/20'
    }
  };

  return (
    <main className="relative min-h-screen">
      <SEO 
        title={t.home.heroTitle}
        description={t.home.heroSubtitle}
        canonical="/"
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(homeSchema)}
        </script>
      </Helmet>
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[10%] left-[20%] w-[25%] h-[25%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
      <section className="text-center mb-16" aria-labelledby="hero-title">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-bold mb-8 border border-blue-100 dark:border-blue-800"
        >
          <Sparkles className="w-4 h-4" />
          <span>{t.home.trendingNow}</span>
        </div>
        <h1 
          id="hero-title"
          className="text-3xl sm:text-4xl md:text-7xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]"
        >
          {t.home.heroTitle.split(' ').map((word: string, i: number) => (
            <span key={i} className={i === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600' : ''}>
              {word}{' '}
            </span>
          ))}
        </h1>
        <p 
          className="text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          {t.home.heroSubtitle}
        </p>

        <div className="relative max-w-2xl mx-auto group">
          <label htmlFor="tool-search" className="sr-only">{t.home.searchPlaceholder}</label>
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-blue-600 transition-colors" aria-hidden="true" />
          <input
            id="tool-search"
            type="text"
            placeholder={t.home.searchPlaceholder}
            className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-xl shadow-blue-500/5 focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all text-xl font-medium dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <kbd className="font-sans">ESC</kbd>
            <span>to clear</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">
          {ALL_TOOLS.slice(0, 5).map(tool => (
            <Link 
              key={tool.id} 
              to={getToolPath(tool)}
              className="px-3 py-2 sm:px-5 sm:py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-500/10 transition-all flex items-center gap-2"
            >
              <DynamicIcon name={tool.icon} className="w-4 h-4" />
              {t.toolNames[tool.id] || tool.name}
            </Link>
          ))}
        </div>
      </section>

            {/* 🔥 New Viral Tools Section */}
      <section className="py-12 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-current" />
              🔥 Trending Now
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-8">
            New & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Viral Tools</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ALL_TOOLS.filter(t => ['whatsapp-text-formatter', 'number-to-words'].includes(t.id)).map((tool) => (
              <Link
                key={tool.id}
                to={`/tool/${tool.slug}`}
                className="group flex items-start gap-4 p-5 bg-white dark:bg-slate-900 border-2 border-red-100 dark:border-red-900/20 rounded-2xl hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
                  <DynamicIcon name={tool.icon} className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-black text-red-500 uppercase tracking-wide">New</span>
                    <span className="text-xs bg-red-50 dark:bg-red-900/20 text-red-600 px-2 py-0.5 rounded-full font-bold">🔥 Trending</span>
                  </div>
                  <h3 className="font-black text-slate-900 dark:text-white text-sm leading-snug group-hover:text-red-600 transition-colors line-clamp-2">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {tool.shortDescription}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

{/* AI Tools Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3" />
                New: AI-Powered Tools
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                Experience Next-Gen AI Processing
              </h2>
            </div>
            <Link 
              to="/ai-tools"
              className="group flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
            >
              Explore AI Hub
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ALL_TOOLS.filter(t => t.category === 'ai').slice(0, 4).map((tool, index) => (
              <div
                key={tool.id}
              >
                <Link 
                  to={getToolPath(tool)}
                  className="group block p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-xl"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <DynamicIcon name={tool.icon} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {tool.shortDescription}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

        {/* Ad Slot 1 */}
        <div className="max-w-6xl mx-auto px-4 mb-16">
          <AdPlaceholder slot="Home Top" />
        </div>

      {/* Categories */}
      {!searchQuery && (
        <section className="mb-12 sm:mb-24" aria-labelledby="categories-title">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 id="categories-title" className="text-3xl font-black text-slate-900 dark:text-white mb-2">{t.home.browseCategory}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Explore our collection of powerful text tools</p>
            </div>
            <div className="hidden md:flex gap-2">
              <button 
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 cursor-not-allowed opacity-50"
                aria-label="Previous Category"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 cursor-not-allowed opacity-50"
                aria-label="Next Category"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6" role="list">
            {CATEGORIES.map((cat) => {
              const theme = categoryThemes[cat.id] || categoryThemes.utility;
              return (
                <div 
                  key={cat.id} 
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative group bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border ${theme.border} dark:border-slate-800 shadow-sm transition-all overflow-hidden cursor-pointer hover:-translate-y-2`} 
                  role="listitem"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${theme.gradient} opacity-[0.03] dark:opacity-[0.05] rounded-bl-[5rem] group-hover:opacity-[0.08] transition-opacity`} />
                  
                  <div className={`w-14 h-14 ${theme.iconBg} dark:bg-slate-800 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500`} aria-hidden="true">
                    {categoryIcons[cat.id]}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{(t.categories as any)[cat.id]}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">{(t.categories as any)[`${cat.id}Desc`]}</p>
                  
                  <div className="space-y-3">
                    {ALL_TOOLS.filter(toolItem => toolItem.category === cat.id).slice(0, 3).map(toolItem => {
                      const isExternal = !!toolItem.externalUrl;
                      const content = (
                        <>
                          <span className="truncate pr-2">{t.toolNames[toolItem.id] || toolItem.name}</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all shrink-0" aria-hidden="true" />
                        </>
                      );
                      const className = "flex items-center justify-between text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 group/link transition-colors";

                      return isExternal ? (
                        <a 
                          key={toolItem.id} 
                          href={toolItem.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                        >
                          {content}
                        </a>
                      ) : (
                        <Link 
                          key={toolItem.id} 
                          to={getToolPath(toolItem)} 
                          className={className}
                        >
                          {content}
                        </Link>
                      );
                    })}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(cat);
                      }}
                      className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest pt-2 hover:gap-3 transition-all"
                    >
                      <span>{t.navbar.viewAll.split(' ')[0]} {t.navbar.viewAll.split(' ')[1]}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

        {/* Ad Slot 2 */}
        <div className="max-w-6xl mx-auto px-4 mt-12 sm:mt-24 mb-16">
          <AdPlaceholder slot="Home Bottom" />
        </div>

      {/* Tools Grid */}
      <section aria-labelledby="tools-title" className="mb-12 sm:mb-24">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <h2 id="tools-title" className="text-3xl font-black text-slate-900 dark:text-white">
              {searchQuery ? `${t.home.searchResults} (${filteredTools.length})` : t.home.popularTools}
            </h2>
          </div>
          {!searchQuery && (
            <div className="flex items-center space-x-3 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600"></span>
              </span>
              <span className="text-sm font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">{t.home.trendingNow}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
          {(searchQuery ? filteredTools : popularTools).map((tool, idx) => {
            const theme = categoryThemes[tool.category] || categoryThemes.utility;
            const isExternal = !!tool.externalUrl;
            const cardClassName = `group relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border ${theme.border} dark:border-slate-800 shadow-sm hover:border-transparent ${theme.hoverShadow} hover:shadow-2xl transition-all flex flex-col h-full overflow-hidden`;
            
            const cardContent = (
              <>
                {/* Category Badge */}
                <div className={`absolute top-6 right-6 px-3 py-1 ${theme.bg} dark:bg-slate-800 ${theme.text} dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border ${theme.border} dark:border-slate-700`}>
                  {(t.categories as any)[tool.category]}
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-16 h-16 ${theme.iconBg} dark:bg-slate-800 dark:text-blue-400 rounded-[1.25rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-sm`} aria-hidden="true">
                    <DynamicIcon name={tool.icon} className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-tight">{t.toolNames[tool.id] || tool.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="text-[10px] font-bold text-slate-400 ml-1">4.9/5</span>
                    </div>
                  </div>
                </div>

                <p className="text-slate-500 dark:text-slate-400 line-clamp-3 mb-10 flex-grow leading-relaxed font-medium">
                  {t.toolDescriptions[tool.id] || tool.shortDescription}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                  <div className={`flex items-center gap-2 ${theme.text} dark:text-blue-400 text-sm font-black group-hover:translate-x-2 transition-transform`}>
                    <span>{t.home.useTool}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="flex -space-x-2">
                    {[
                      'bg-gradient-to-br from-blue-400 to-blue-600',
                      'bg-gradient-to-br from-purple-400 to-purple-600',
                      'bg-gradient-to-br from-green-400 to-green-600',
                    ].map((grad, i) => (
                      <div key={i} className={`w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 ${grad}`} />
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white">
                      +1k
                    </div>
                  </div>
                </div>
              </>
            );

            return (
              <div
                key={tool.id}
              >
                {isExternal ? (
                  <a 
                    href={tool.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cardClassName}
                    role="listitem"
                  >
                    {cardContent}
                  </a>
                ) : (
                  <Link 
                    to={getToolPath(tool)}
                    className={cardClassName}
                    role="listitem"
                  >
                    {cardContent}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        
        {!searchQuery && ALL_TOOLS.length > displayCount && (
          <div className="mt-16 text-center">
            <button
              onClick={() => setDisplayCount(prev => prev + 12)}
              className="px-10 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] font-black text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-lg hover:shadow-2xl active:scale-95"
            >
              Load More Tools
            </button>
          </div>
        )}
      </section>

      {/* SEO Footer Content */}
      <section className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800" aria-labelledby="why-choose-title">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h2 id="why-choose-title" className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">{t.home.whyChoose}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 text-center max-w-3xl mx-auto mb-16">
            {t.home.whyChooseDesc}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-8">
            <div className="text-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 shadow-sm">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t.home.freeTitle}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{t.home.freeDesc}</p>
            </div>
            <div className="text-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                <RefreshCw className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t.home.privacyTitle}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{t.home.privacyDesc}</p>
            </div>
            <div className="text-center p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 shadow-sm">
              <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-6" aria-hidden="true">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t.home.speedTitle}</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{t.home.speedDesc}</p>
            </div>
          </div>
        </div>
      </section>
      
      <CategoryModal 
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        tools={ALL_TOOLS.filter(t => t.category === selectedCategory?.id)}
        theme={selectedCategory ? (categoryThemes[selectedCategory.id] || categoryThemes.utility) : categoryThemes.utility}
      />
    </div>
  </main>
  );
};

export default HomePage;
