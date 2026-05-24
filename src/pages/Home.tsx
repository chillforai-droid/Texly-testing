import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, ArrowRight, Zap, Sparkles, Star,
  FileText, RefreshCw, Trash2, BarChart3, Wrench,
  Code2, Github, TrendingUp, Layers, Cpu
} from 'lucide-react';
import { ALL_TOOLS, CATEGORIES } from '../data/tools';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { BASE_URL } from '../config';
import CategoryModal from '../components/CategoryModal';
import DynamicIcon from '../components/LucideIcon';
import { useDesktopPerf } from '../hooks/useDesktopPerf';

const categoryThemes: Record<string, { gradient: string; iconBg: string; border: string; badge: string }> = {
  cleaning:  { gradient: 'from-emerald-500 to-teal-500',   iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/40', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  converter: { gradient: 'from-blue-500 to-indigo-500',    iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',           border: 'border-blue-200 dark:border-blue-800/40',   badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  analysis:  { gradient: 'from-amber-500 to-orange-500',   iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',         border: 'border-amber-200 dark:border-amber-800/40', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  utility:   { gradient: 'from-slate-500 to-slate-700',    iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',            border: 'border-slate-200 dark:border-slate-700',    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  pdf:       { gradient: 'from-rose-500 to-pink-500',      iconBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',             border: 'border-rose-200 dark:border-rose-800/40',   badge: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
  ai:        { gradient: 'from-violet-500 to-purple-600',  iconBg: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',     border: 'border-violet-200 dark:border-violet-800/40', badge: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  generator: { gradient: 'from-purple-500 to-fuchsia-500', iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',     border: 'border-purple-200 dark:border-purple-800/40', badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
};

const categoryIcons: Record<string, React.ReactNode> = {
  cleaning: <Trash2 className="w-4 h-4" />,
  converter: <RefreshCw className="w-4 h-4" />,
  analysis: <BarChart3 className="w-4 h-4" />,
  utility: <Wrench className="w-4 h-4" />,
  pdf: <FileText className="w-4 h-4" />,
  ai: <Cpu className="w-4 h-4" />,
  generator: <Layers className="w-4 h-4" />,
};

const VIRAL_IDS = ['whatsapp-text-formatter', 'number-to-words'];

const HomePage = () => {
  const { t } = useLanguage();
  const { initialToolCount, isDesktop, isLargeScreen } = useDesktopPerf();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [displayCount, setDisplayCount] = useState(initialToolCount);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return ALL_TOOLS;
    const s = searchQuery.toLowerCase();
    return ALL_TOOLS.filter(tool =>
      tool.name.toLowerCase().includes(s) ||
      tool.category.toLowerCase().includes(s) ||
      tool.keywords.some(k => k.toLowerCase().includes(s)) ||
      (t.toolNames[tool.id as keyof typeof t.toolNames] || '').toLowerCase().includes(s)
    );
  }, [searchQuery, t.toolNames]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchQuery(''); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const popularTools = useMemo(() => ALL_TOOLS.slice(0, displayCount), [displayCount]);
  const viralTools = useMemo(() => ALL_TOOLS.filter(t => VIRAL_IDS.includes(t.id)), []);
  const aiTools = useMemo(() => ALL_TOOLS.filter(t => t.category === 'ai').slice(0, 4), []);

  const getToolPath = (tool: any) =>
    tool.category === 'ai' || tool.category === 'generator' ? `/tools/${tool.slug}` : `/tool/${tool.slug}`;

  const homeSchema = {
    "@context": "https://schema.org", "@type": "WebSite",
    url: BASE_URL, name: "Texly",
    description: "Free online text tools for cleaning, formatting, and analyzing text.",
    potentialAction: { "@type": "SearchAction", target: `${BASE_URL}/?q={search_term_string}`, "query-input": "required name=search_term_string" }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <SEO title={t.home.heroTitle} description={t.home.heroSubtitle} canonical="/" />
      <Helmet><script type="application/ld+json">{JSON.stringify(homeSchema)}</script></Helmet>

      {/* HERO */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="hidden sm:block absolute inset-0 pointer-events-none overflow-hidden -z-10" style={{ isolation: 'isolate' }}>
          <div className="absolute top-[-15%] left-[-10%] w-[45%] h-[60%] bg-blue-500/6 dark:bg-blue-500/10 rounded-full blur-[80px]" />
          <div className="absolute top-[10%] right-[-8%] w-[35%] h-[50%] bg-violet-500/5 dark:bg-violet-500/8 rounded-full blur-[70px]" />
        </div>
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold mb-7">
            <TrendingUp className="w-3.5 h-3.5" />{t.home.trendingNow}
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.08] tracking-tight mb-5">
            100+{' '}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">Free</span>{' '}AI Tools &amp;<br className="hidden sm:block" /> Text Utilities
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            {t.home.heroSubtitle}
          </p>
          <div className="relative max-w-2xl mx-auto">
            <label htmlFor="tool-search" className="sr-only">{t.home.searchPlaceholder}</label>
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              id="tool-search" type="text"
              placeholder={t.home.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 sm:pl-14 pr-20 py-4 sm:py-5 text-base sm:text-lg font-medium bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-none focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white placeholder:text-slate-400"
            />
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">ESC</button>
            ) : (
              <span className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg items-center gap-1 select-none"><kbd>ESC</kbd> to clear</span>
            )}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {ALL_TOOLS.slice(0, 5).map(tool => (
              <Link key={tool.id} to={getToolPath(tool)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md transition-all">
                <DynamicIcon name={tool.icon} className="w-3.5 h-3.5" />
                {t.toolNames[tool.id as keyof typeof t.toolNames] || tool.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">

        {/* VIRAL TOOLS */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400 text-[11px] font-black uppercase tracking-widest">
              <Zap className="w-3 h-3 fill-current" /> Trending Now
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-6">
            New &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Viral Tools</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {viralTools.map(tool => (
              <Link key={tool.id} to={`/tool/${tool.slug}`}
                className="group flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border-2 border-red-100 dark:border-red-900/30 rounded-2xl hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10 transition-all">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0 shadow-md shadow-red-500/20">
                  <DynamicIcon name={tool.icon} className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-black text-red-500 uppercase">New</span>
                    <span className="text-[10px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded-full font-bold">Trending</span>
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">{tool.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{tool.shortDescription}</p>
                </div>
              </Link>
            ))}
            <Link to="/devstudio"
              className="group flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-2xl hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 transition-all">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black text-emerald-600 uppercase">New</span>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">Hot</span>
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors leading-snug">DevStudio — Online IDE</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">VS Code जैसा browser IDE — ZIP upload, Monaco editor, AI code, GitHub push।</p>
              </div>
            </Link>
            <Link to="/ai-automation"
              className="group flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-400 hover:shadow-lg transition-all">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shrink-0 shadow-md">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Free</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold">Fast</span>
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-slate-600 transition-colors leading-snug">Free GitHub File Push Tool</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">Browser से GitHub repo में files push करें। 100% free।</p>
              </div>
            </Link>
          </div>
        </section>

        {/* AI SECTION */}
        <section className="mb-16 relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 p-8 sm:p-10">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/15 rounded-full blur-[60px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/15 rounded-full blur-[50px]" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-widest mb-3">
                  <Sparkles className="w-3 h-3" /> New: AI-Powered Tools
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Experience Next-Gen AI Processing</h2>
              </div>
              <Link to="/ai-tools" className="shrink-0 flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold text-sm transition-all backdrop-blur-sm">
                Explore AI Hub <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {aiTools.map(tool => (
                <Link key={tool.id} to={getToolPath(tool)}
                  className="group p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <DynamicIcon name={tool.icon} className="w-5 h-5 text-blue-300" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors line-clamp-2 leading-snug">{tool.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{tool.shortDescription}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        {!searchQuery && (
          <section className="mb-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-1">{t.home.browseCategory}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Explore our collection of powerful text tools</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {CATEGORIES.map(cat => {
                const theme = categoryThemes[cat.id] || categoryThemes.utility;
                const toolCount = ALL_TOOLS.filter(t => t.category === cat.id).length;
                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat)}
                    className={`group relative overflow-hidden p-4 bg-white dark:bg-slate-900 border ${theme.border} rounded-2xl text-left hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer`}>
                    <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${theme.gradient} opacity-5 group-hover:opacity-10 rounded-bl-3xl transition-opacity`} />
                    <div className={`w-9 h-9 ${theme.iconBg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      {categoryIcons[cat.id]}
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-1">{(t.categories as any)[cat.id]}</p>
                    <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block ${theme.badge}`}>{toolCount} tools</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* TOOLS GRID */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {searchQuery ? `${t.home.searchResults} (${filteredTools.length})` : t.home.popularTools}
              </h2>
            </div>
            {!searchQuery && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                </span>
                {t.home.trendingNow}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {(searchQuery ? filteredTools : popularTools).map(tool => {
              const theme = categoryThemes[tool.category] || categoryThemes.utility;
              const isExternal = !!tool.externalUrl;
              const inner = (
                <div className={`group relative flex flex-col h-full bg-white dark:bg-slate-900 border ${theme.border} rounded-2xl p-5 hover:shadow-xl hover:border-transparent transition-all overflow-hidden`}>
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${theme.gradient} opacity-[0.04] group-hover:opacity-[0.08] rounded-bl-[2rem] transition-opacity`} />
                  <span className={`absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${theme.badge}`}>
                    {(t.categories as any)[tool.category]}
                  </span>
                  <div className="flex items-center gap-3 mb-4 mt-1">
                    <div className={`w-12 h-12 ${theme.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                      <DynamicIcon name={tool.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                        {t.toolNames[tool.id as keyof typeof t.toolNames] || tool.name}
                      </h3>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
                        <span className="text-[9px] font-bold text-slate-400 ml-1">4.9</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 flex-grow mb-4">
                    {t.toolDescriptions[tool.id as keyof typeof t.toolDescriptions] || tool.shortDescription}
                  </p>
                  <div className="flex items-center gap-1 text-xs font-black text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    {t.home.useTool} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
              return isExternal ? (
                <a key={tool.id} href={tool.externalUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col h-full">{inner}</a>
              ) : (
                <Link key={tool.id} to={getToolPath(tool)} className="flex flex-col h-full">{inner}</Link>
              );
            })}
          </div>

          {!searchQuery && ALL_TOOLS.length > displayCount && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setDisplayCount(prev => prev + (isLargeScreen ? 18 : isDesktop ? 12 : 6))}
                className="px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm hover:shadow-lg text-sm">
                Load More Tools
              </button>
            </div>
          )}
        </section>

        {/* WHY CHOOSE */}
        <section className="mb-16 pt-10 border-t border-slate-100 dark:border-slate-800/60">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 text-center">{t.home.whyChoose}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xl mx-auto mb-10">{t.home.whyChooseDesc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-6 h-6" />, bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', title: t.home.freeTitle, desc: t.home.freeDesc },
              { icon: <RefreshCw className="w-6 h-6" />, bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', title: t.home.privacyTitle, desc: t.home.privacyDesc },
              { icon: <BarChart3 className="w-6 h-6" />, bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', title: t.home.speedTitle, desc: t.home.speedDesc },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>{item.icon}</div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      <CategoryModal
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        tools={ALL_TOOLS.filter(t => t.category === selectedCategory?.id)}
        theme={selectedCategory ? (categoryThemes[selectedCategory.id] || categoryThemes.utility) : categoryThemes.utility}
      />
    </main>
  );
};

export default HomePage;
