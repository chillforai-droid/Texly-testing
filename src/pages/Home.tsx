import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ArrowRight, Zap, Sparkles, Star,
  FileText, RefreshCw, Trash2, BarChart3, Wrench,
  Code2, Github, TrendingUp, Layers, Cpu, ArrowUpRight,
  Shield, Bolt
} from 'lucide-react';
import { ALL_TOOLS, CATEGORIES } from '../data/tools';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { BASE_URL } from '../config';
import CategoryModal from '../components/CategoryModal';
import DynamicIcon from '../components/LucideIcon';
import { useDesktopPerf } from '../hooks/useDesktopPerf';

const categoryThemes: Record<string, { gradient: string; iconBg: string; border: string; badge: string; glow: string }> = {
  cleaning:  { gradient: 'from-emerald-500 to-teal-500',   iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/40', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', glow: 'shadow-emerald-500/20' },
  converter: { gradient: 'from-blue-500 to-indigo-500',    iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',           border: 'border-blue-200 dark:border-blue-800/40',   badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', glow: 'shadow-blue-500/20' },
  analysis:  { gradient: 'from-amber-500 to-orange-500',   iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',         border: 'border-amber-200 dark:border-amber-800/40', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', glow: 'shadow-amber-500/20' },
  utility:   { gradient: 'from-slate-500 to-slate-700',    iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',            border: 'border-slate-200 dark:border-slate-700',    badge: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300', glow: 'shadow-slate-500/20' },
  pdf:       { gradient: 'from-rose-500 to-pink-500',      iconBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',             border: 'border-rose-200 dark:border-rose-800/40',   badge: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300', glow: 'shadow-rose-500/20' },
  ai:        { gradient: 'from-violet-500 to-purple-600',  iconBg: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',     border: 'border-violet-200 dark:border-violet-800/40', badge: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300', glow: 'shadow-violet-500/20' },
  generator: { gradient: 'from-purple-500 to-fuchsia-500', iconBg: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',     border: 'border-purple-200 dark:border-purple-800/40', badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', glow: 'shadow-purple-500/20' },
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

const VIRAL_IDS = ['invisible-text-suite', 'whatsapp-text-formatter', 'number-to-words'];

const STATS = [
  { value: '100+', label: 'Free Tools' },
  { value: '50K+', label: 'Daily Users' },
  { value: '0', label: 'Sign-ups Needed' },
  { value: '100%', label: 'Private & Fast' },
];

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

  const homeSchema = [
    {
      "@context": "https://schema.org", "@type": "WebSite",
      url: BASE_URL, name: "Texly",
      description: "Free online text tools for cleaning, formatting, and analyzing text.",
      potentialAction: { "@type": "SearchAction", target: `${BASE_URL}/?q={search_term_string}`, "query-input": "required name=search_term_string" }
    },
    {
      "@context": "https://schema.org", "@type": "Organization",
      name: "Texly", url: BASE_URL,
      logo: `${BASE_URL}/favicon-96x96.png`,
      description: "Texly provides 100+ free online text processing and AI tools — no signup required.",
      email: "texlyonline@gmail.com",
      address: { "@type": "PostalAddress", addressCountry: "IN" },
      sameAs: ["https://twitter.com/texly_tools", "https://github.com/chillforai/Texly"],
      foundingDate: "2024",
      knowsAbout: ["Text Processing", "AI Tools", "Online Text Utilities", "Web Development Tools"]
    }
  ];

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <SEO title={t.home.heroTitle} description={t.home.heroSubtitle} canonical="/" />
      <Helmet><script type="application/ld+json">{JSON.stringify(homeSchema)}</script></Helmet>

      {/* ═══════════════════════════════════════════════════════
          HERO — Dramatic split layout with floating orbs
      ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-28">

        {/* Ambient background — desktop only (prevents Android GPU glitch) */}
        <div className="hidden sm:block absolute inset-0 pointer-events-none -z-10" style={{ isolation: 'isolate' }}>
          {/* Top-left blue orb */}
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
          {/* Top-right violet orb */}
          <div className="absolute -top-16 right-0 w-[420px] h-[420px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />
          {/* Center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full"
            style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 60%)' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(rgba(100,116,139,1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center">

          {/* Trending pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/50 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">{t.home.trendingNow}</span>
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6">
            <span className="text-slate-900 dark:text-white">100+</span>
            {' '}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-violet-600">Free</span>
            </span>
            <br />
            <span className="text-slate-900 dark:text-white">AI Tools</span>
            {' '}
            <span className="text-slate-400 dark:text-slate-600">&</span>
            <br className="sm:hidden" />
            {' '}
            <span className="text-slate-900 dark:text-white">Text</span>
            {' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Utilities</span>
              {/* Underline accent */}
              <svg className="absolute -bottom-2 left-0 w-full hidden sm:block" height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
                <path d="M0 3 Q50 0 100 3 Q150 6 200 3" stroke="url(#ug)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <defs><linearGradient id="ug" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#d946ef"/></linearGradient></defs>
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-4 leading-relaxed font-medium">
            {t.home.heroSubtitle}
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-500" /> No Signup
            </span>
            <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Bolt className="w-3.5 h-3.5 text-amber-500" /> Instant & Private
            </span>
            <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              <Zap className="w-3.5 h-3.5 text-blue-500" /> 100% Free
            </span>
          </div>

          {/* Search bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none z-10" />
              <label htmlFor="tool-search" className="sr-only">{t.home.searchPlaceholder}</label>
              <input
                id="tool-search" type="text"
                placeholder={t.home.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-24 py-4 sm:py-5 text-base font-medium bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all dark:text-white placeholder:text-slate-400"
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors">
                  ESC
                </button>
              ) : (
                <span className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg items-center gap-1 select-none">
                  <kbd>ESC</kbd> to clear
                </span>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-2">
            {ALL_TOOLS.slice(0, 5).map(tool => (
              <Link key={tool.id} to={getToolPath(tool)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 hover:shadow-md transition-all">
                <DynamicIcon name={tool.icon} className="w-3.5 h-3.5" />
                {t.toolNames[tool.id as keyof typeof t.toolNames] || tool.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="max-w-4xl mx-auto px-4 mt-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 px-6 py-5 text-center">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-0.5">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">

        {/* ═══════════════════════════════════════════════════════
            TRENDING — Bold editorial cards
        ═══════════════════════════════════════════════════════ */}
        <section className="mb-20">
          {/* Section header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-lg shadow-red-500/30">
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">Trending Now</span>
              </div>
            </div>
            <Link to="/ai-tools" className="flex items-center gap-1 text-xs font-black text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors uppercase tracking-wide">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
            New &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Viral Tools</span>
          </h2>

          {/* Cards — horizontal scroll on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {viralTools.map((tool, idx) => (
              <Link key={tool.id} to={getToolPath(tool)}
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800/60 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-1">
                {/* Top accent line */}
                <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
                <div className="p-5">
                  {/* Badges row */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest">New</span>
                    <span className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest">Trending</span>
                  </div>
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-red-500/25 group-hover:scale-105 transition-transform">
                    <DynamicIcon name={tool.icon} className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{tool.name}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">{tool.shortDescription}</p>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-black text-red-500 opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1">
                    Use Tool <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}

            {/* DevStudio card */}
            <Link to="/devstudio"
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800/60 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">New</span>
                  <span className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-[10px] font-black uppercase tracking-widest">Hot</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">DevStudio — Online IDE</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">VS Code जैसा browser IDE — ZIP upload, Monaco editor, AI code, GitHub push।</p>
                <div className="mt-4 flex items-center gap-1 text-[11px] font-black text-emerald-600 opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1">
                  Open Studio <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>

            {/* GitHub Push card */}
            <Link to="/ai-automation"
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-2xl hover:shadow-slate-500/10 transition-all duration-300 hover:-translate-y-1">
              <div className="h-1 w-full bg-gradient-to-r from-slate-600 to-slate-900 dark:from-slate-400 dark:to-slate-600" />
              <div className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Free</span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">Fast</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mb-4 shadow-lg shadow-slate-500/20 group-hover:scale-105 transition-transform">
                  <Github className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Free GitHub File Push Tool</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">Browser से GitHub repo में files push करें। 100% free।</p>
                <div className="mt-4 flex items-center gap-1 text-[11px] font-black text-slate-500 opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1">
                  Push Files <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            DEV & SEO UTILITY TOOLS
        ═══════════════════════════════════════════════════════ */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">NEW</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <Wrench className="w-3 h-3" /> Developer &amp; SEO Tools
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                Dev <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">Utility</span> Tools
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Redirect Chain Checker */}
            <Link to="/tools/redirect-chain-checker"
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-1">Redirect Chain Checker</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Trace full redirect paths, detect loops &amp; check 301/302 status codes for SEO</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">SEO</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">HTTP</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Free</span>
              </div>
            </Link>

            {/* Robots.txt Tester */}
            <Link to="/tools/robots-txt-tester"
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 hover:border-teal-400 dark:hover:border-teal-600 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-1">Robots.txt Tester</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Test URLs against robots.txt rules — see if Googlebot is allowed or blocked</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">Crawler</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">SEO</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Free</span>
              </div>
            </Link>

            {/* AI Regex Explainer */}
            <Link to="/tools/regex-explainer"
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-1">AI Regex Explainer</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Token-by-token regex breakdown in plain English + live match highlighting</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">Regex</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Dev</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Free</span>
              </div>
            </Link>

            {/* JSON Path Finder */}
            <Link to="/tools/json-path-finder"
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-1">JSON Path Finder</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Interactive JSON tree viewer — click any value to copy its JSONPath instantly</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">JSON</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">API</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Free</span>
              </div>
            </Link>

            {/* Cron Expression Generator */}
            <Link to="/tools/cron-expression-generator"
              className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-lg transition-all duration-200">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-1">Cron Expression Generator</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Build cron schedules visually + human-readable explanations + 14 presets</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">Cron</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Scheduler</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">Free</span>
              </div>
            </Link>

            {/* Coming soon placeholder */}
            <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-5 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-slate-400 dark:text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">More Dev Tools Coming</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">JWT Decoder, SQL Formatter &amp; more</p>
              </div>
            </div>

          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            AI SECTION
        ═══════════════════════════════════════════════════════ */}
        <section className="mb-20 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #2e1065 100%)' }}>
          <div className="relative p-8 sm:p-10">
            <div className="hidden sm:block absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
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
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            CATEGORIES
        ═══════════════════════════════════════════════════════ */}
        {!searchQuery && (
          <section className="mb-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">{t.home.browseCategory}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Explore our collection of powerful text tools</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {CATEGORIES.map(cat => {
                const theme = categoryThemes[cat.id] || categoryThemes.utility;
                const toolCount = ALL_TOOLS.filter(t => t.category === cat.id).length;
                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat)}
                    aria-label={`Browse ${(t.categories as any)[cat.id]} tools`}
                    className={`group relative overflow-hidden p-4 bg-white dark:bg-slate-900 border ${theme.border} rounded-2xl text-left hover:shadow-xl hover:shadow-current/10 transition-all hover:-translate-y-1 cursor-pointer`}>
                    <div className={`hidden sm:block absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${theme.gradient} opacity-5 rounded-bl-3xl group-hover:opacity-10 transition-opacity`} />
                    <div className={`w-9 h-9 ${theme.iconBg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      {categoryIcons[cat.id]}
                    </div>
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-1.5">{(t.categories as any)[cat.id]}</p>
                    <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block ${theme.badge}`}>{toolCount} tools</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════
            TOOLS GRID — Redesigned cards
        ═══════════════════════════════════════════════════════ */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {searchQuery ? `${t.home.searchResults} (${filteredTools.length})` : t.home.popularTools}
                </h2>
                {!searchQuery && <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Most-used by our community</p>}
              </div>
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

          {/* Tool cards — new design */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(searchQuery ? filteredTools : popularTools).map(tool => {
              const theme = categoryThemes[tool.category] || categoryThemes.utility;
              const isExternal = !!tool.externalUrl;
              const inner = (
                <div className={`group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 hover:border-transparent hover:shadow-xl ${theme.glow} transition-all duration-300 hover:-translate-y-0.5`}>

                  {/* Top gradient bar */}
                  <div className={`h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${theme.gradient} transition-all duration-500`} />

                  {/* Card body */}
                  <div className="flex flex-col h-full p-5">
                    {/* Header row: icon + category badge */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 ${theme.iconBg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0`}>
                        <DynamicIcon name={tool.icon} className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${theme.badge}`}>
                        {(t.categories as any)[tool.category]}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 mb-1.5">
                      {t.toolNames[tool.id as keyof typeof t.toolNames] || tool.name}
                    </h3>

                    {/* Stars */}
                    <div className="flex items-center gap-0.5 mb-3">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
                      <span className="text-[9px] font-bold text-slate-400 ml-1">4.9</span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-grow mb-4">
                      {t.toolDescriptions[tool.id as keyof typeof t.toolDescriptions] || tool.shortDescription}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-black text-blue-600 dark:text-blue-400 group-hover:gap-2.5 transition-all">
                        {t.home.useTool} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-500 transition-all">
                        <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
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
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/10 text-sm">
                Load More Tools <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </section>

        {/* WHY CHOOSE */}
        <section className="mb-20 pt-10 border-t border-slate-100 dark:border-slate-800/60">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-3 text-center">{t.home.whyChoose}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xl mx-auto mb-10">{t.home.whyChooseDesc}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: <Zap className="w-6 h-6" />, bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400', title: t.home.freeTitle, desc: t.home.freeDesc },
              { icon: <RefreshCw className="w-6 h-6" />, bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', title: t.home.privacyTitle, desc: t.home.privacyDesc },
              { icon: <BarChart3 className="w-6 h-6" />, bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400', title: t.home.speedTitle, desc: t.home.speedDesc },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>{item.icon}</div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Social Share */}
        <section className="mb-16 text-center">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">Share Texly with your friends</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://twitter.com/intent/tweet?text=100%2B%20free%20online%20text%20%26%20AI%20tools%20%E2%80%94%20no%20signup%2C%20instant%20results!&url=https%3A%2F%2Fwww.texlyonline.in%2F"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share Texly on Twitter"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
              Share on X
            </a>
            <a
              href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.texlyonline.in%2F"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share Texly on Facebook"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Share on Facebook
            </a>
            <a
              href="https://wa.me/?text=100%2B%20free%20online%20text%20%26%20AI%20tools%20%E2%80%94%20no%20signup!%20https%3A%2F%2Fwww.texlyonline.in%2F"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Share Texly on WhatsApp"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Share on WhatsApp
            </a>
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

      {/* Page-level styles */}
      <style>{`
        @keyframes hero-fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
};

export default HomePage;
