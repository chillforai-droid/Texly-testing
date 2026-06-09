import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ArrowRight, Zap, Sparkles, Star,
  FileText, RefreshCw, Trash2, BarChart3, Wrench,
  Code2, Github, Layers, Cpu, ArrowUpRight,
  Shield, Bolt, Mail, BookOpen, CheckCircle2,
  Globe, LightbulbIcon, Clock, MousePointerClick, User,
} from 'lucide-react';
import { ALL_TOOLS, CATEGORIES } from '../data/tools';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';
import { BASE_URL } from '../config';
import CategoryModal from '../components/CategoryModal';
import DynamicIcon from '../components/LucideIcon';
import { useDesktopPerf } from '../hooks/useDesktopPerf';
import { BlogPost } from '../data/blog';
import { getBlogs } from '../utils/blogStorage';
import { Calendar, Clock as ClockIcon } from 'lucide-react';
import SocialShare from '../components/SocialShare';
import {
  RecentlyAddedTools,
  MostUsedAITools,
  MostUsedSEOTools,
  MostUsedTextTools,
  WhyChooseTexlyExpanded,
  WhoCanUseTexly,
  HowTexlyProtectsPrivacy,
  OurMission,
  ExpandedFAQ,
  AboutTexlyOnline,
  EEATSignals,
  faqSchema,
} from './HomepageNewSections';

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

// ✅ FIXED: Removed unverifiable "50K+ Daily Users" claim
const STATS = [
  { value: '100+', label: 'Free Tools' },
  { value: '0',    label: 'Sign-ups Needed' },
  { value: '100%', label: 'Private & Fast' },
  { value: '2024', label: 'Founded' },
];

const HomePage = () => {
  const { t } = useLanguage();
  const { initialToolCount, isDesktop, isLargeScreen } = useDesktopPerf();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [displayCount, setDisplayCount] = useState(initialToolCount);
  const [recentBlogs, setRecentBlogs] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);

  useEffect(() => {
    getBlogs()
      .then(data => setRecentBlogs(data.slice(0, 4)))
      .catch(() => setRecentBlogs([]))
      .finally(() => setBlogsLoading(false));
  }, []);

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
      description: "Free online text tools, AI tools, SEO tools, image tools and developer utilities — no signup required.",
      potentialAction: { "@type": "SearchAction", target: `${BASE_URL}/?q={search_term_string}`, "query-input": "required name=search_term_string" }
    },
    {
      "@context": "https://schema.org", "@type": "Organization",
      name: "Texly", url: BASE_URL,
      logo: { "@type": "ImageObject", url: `${BASE_URL}/favicon-96x96.png`, width: 96, height: 96 },
      description: "Texly provides 100+ free online text processing, AI, SEO, and developer tools — no signup required.",
      email: "texlyonline@gmail.com",
      address: { "@type": "PostalAddress", addressCountry: "IN" },
      sameAs: [
        "https://twitter.com/texly_tools",
        "https://github.com/chillforai/Texly",
        "https://www.youtube.com/@texlytools",
        "https://www.facebook.com/texlytools"
      ],
      foundingDate: "2024",
      founder: { "@type": "Person", name: "Mahendra Mirdha" },
      knowsAbout: ["Text Processing", "AI Tools", "Online Text Utilities", "Web Development Tools", "PDF Tools", "SEO Tools", "Writing Assistance"],
      slogan: "Free tools for everyone — instant, private, no account needed."
    },
    {
      "@context": "https://schema.org", "@type": "WebPage",
      url: BASE_URL,
      name: "Texly — 100+ Free AI Tools, Text Tools & SEO Utilities Online",
      description: "Access 100+ free online tools for text cleaning, AI writing, PDF conversion, SEO auditing, image editing and developer tasks. No signup, works in any browser.",
      datePublished: "2024-01-01",
      dateModified: new Date().toISOString().split('T')[0],
      author: { "@type": "Person", name: "Mahendra Mirdha" },
      publisher: { "@type": "Organization", name: "Texly", url: BASE_URL, logo: { "@type": "ImageObject", url: `${BASE_URL}/favicon-96x96.png` } },
      inLanguage: "en",
      isAccessibleForFree: true
    },
    {
      "@context": "https://schema.org", "@type": "SoftwareApplication",
      name: "Texly — Free Online Text & AI Tools",
      url: BASE_URL,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web Browser",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    faqSchema,
  ];

  return (
    <main id="main-content" className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <SEO title={t.home.heroTitle} description={t.home.heroSubtitle} canonical="/" />
      <Helmet><script type="application/ld+json">{JSON.stringify(homeSchema)}</script></Helmet>

      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20 sm:pb-28">
        <div className="hidden sm:block absolute inset-0 pointer-events-none -z-10" style={{ isolation: 'isolate' }}>
          <div className="absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
          <div className="absolute -top-16 right-0 w-[420px] h-[420px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 60%)' }} />
          <div className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(100,116,139,1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,1) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        </div>

        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/50 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-xs font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">{t.home.trendingNow}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] tracking-tight mb-4 sm:mb-6">
            <span className="text-slate-900 dark:text-white">100+</span>{' '}
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-600 to-violet-600">Free</span>
            </span>
            <br />
            <span className="text-slate-900 dark:text-white">AI Tools</span>{' '}
            <span className="text-slate-400 dark:text-slate-600">&</span>
            <br className="sm:hidden" />{' '}
            <span className="text-slate-900 dark:text-white">Text</span>{' '}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Utilities</span>
              <svg className="absolute -bottom-2 left-0 w-full hidden sm:block" height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
                <path d="M0 3 Q50 0 100 3 Q150 6 200 3" stroke="url(#ug)" strokeWidth="3" fill="none" strokeLinecap="round"/>
                <defs><linearGradient id="ug" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#d946ef"/></linearGradient></defs>
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-4 leading-relaxed font-medium">{t.home.heroSubtitle}</p>

          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400"><Shield className="w-3.5 h-3.5 text-emerald-500" /> No Signup</span>
            <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400"><Bolt className="w-3.5 h-3.5 text-amber-500" /> Instant & Private</span>
            <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400"><Zap className="w-3.5 h-3.5 text-blue-500" /> 100% Free</span>
            <span className="w-px h-3 bg-slate-300 dark:bg-slate-700" />
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400"><CheckCircle2 className="w-3.5 h-3.5 text-violet-500" /> Trusted Since 2024</span>
          </div>

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
                <button onClick={() => setSearchQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl transition-colors">ESC</button>
              ) : (
                <span className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg items-center gap-1 select-none"><kbd>ESC</kbd> to clear</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {ALL_TOOLS.slice(0, 5).map(tool => (
              <Link key={tool.id} to={getToolPath(tool)} className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-700 dark:hover:text-blue-400 hover:shadow-md transition-all">
                <DynamicIcon name={tool.icon} className="w-3.5 h-3.5" />
                {t.toolNames[tool.id as keyof typeof t.toolNames] || tool.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 mt-8 sm:mt-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
            {STATS.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 px-6 py-5 text-center">
                <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-0.5">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Share Texly</span>
            <SocialShare url={BASE_URL} title="Texly — 100+ Free AI &amp; Text Tools Online | No Signup" className="inline-flex" />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4">

        {/* ═══ TRENDING ═══ */}
        <section className="mb-10 sm:mb-16">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {viralTools.map(tool => (
              <Link key={tool.id} to={getToolPath(tool)} className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-800/60 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-1">
                <div className="h-1 w-full bg-gradient-to-r from-red-500 to-orange-500" />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest">New</span>
                    <span className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest">Trending</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg shadow-red-500/25 group-hover:scale-105 transition-transform">
                    <DynamicIcon name={tool.icon} className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{tool.name}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">{tool.shortDescription}</p>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-black text-red-500 opacity-0 group-hover:opacity-100 transition-all">Use Tool <ArrowRight className="w-3 h-3" /></div>
                </div>
              </Link>
            ))}
            <Link to="/devstudio" className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800/60 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
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
                <div className="mt-4 flex items-center gap-1 text-[11px] font-black text-emerald-600 opacity-0 group-hover:opacity-100 transition-all">Open Studio <ArrowRight className="w-3 h-3" /></div>
              </div>
            </Link>
            <Link to="/ai-automation" className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-2xl hover:shadow-slate-500/10 transition-all duration-300 hover:-translate-y-1">
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
                <div className="mt-4 flex items-center gap-1 text-[11px] font-black text-slate-500 opacity-0 group-hover:opacity-100 transition-all">Push Files <ArrowRight className="w-3 h-3" /></div>
              </div>
            </Link>
          </div>
        </section>

        {/* ═══ DEV & SEO UTILITY TOOLS ═══ */}
        <section className="mb-10 sm:mb-16">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[
              { to: '/tools/redirect-chain-checker', color: 'blue', icon: <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />, title: 'Redirect Chain Checker', desc: 'Trace full redirect paths, detect loops & check 301/302 status codes for SEO', tags: ['SEO', 'HTTP', 'Free'] },
              { to: '/tools/robots-txt-tester', color: 'teal', icon: <Search className="w-5 h-5 text-teal-600 dark:text-teal-400" />, title: 'Robots.txt Tester', desc: 'Test URLs against robots.txt rules — see if Googlebot is allowed or blocked', tags: ['Crawler', 'SEO', 'Free'] },
              { to: '/tools/regex-explainer', color: 'rose', icon: <Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />, title: 'AI Regex Explainer', desc: 'Token-by-token regex breakdown in plain English + live match highlighting', tags: ['Regex', 'Dev', 'Free'] },
              { to: '/tools/json-path-finder', color: 'indigo', icon: <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />, title: 'JSON Path Finder', desc: 'Interactive JSON tree viewer — click any value to copy its JSONPath instantly', tags: ['JSON', 'API', 'Free'] },
              { to: '/tools/cron-expression-generator', color: 'emerald', icon: <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />, title: 'Cron Expression Generator', desc: 'Build cron schedules visually + human-readable explanations + 14 presets', tags: ['Cron', 'Scheduler', 'Free'] },
              { to: '/tools/snapchat-tag-generator', color: 'yellow', icon: <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />, title: 'Snapchat Tag Generator', desc: 'Generate trending Snapchat-style hashtags and tags for maximum reach & engagement', tags: ['Social', 'Free'] },
            ].map(item => (
              <Link key={item.to} to={item.to} className={`group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-5 hover:border-${item.color}-400 dark:hover:border-${item.color}-600 hover:shadow-lg transition-all duration-200`}>
                <div className="flex items-start gap-3 sm:gap-4 mb-3">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{tag}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══ AI SECTION ═══ */}
        <section className="mb-10 sm:mb-16 rounded-2xl sm:rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #2e1065 100%)' }}>
          <div className="relative p-4 sm:p-8">
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
                  <Link key={tool.id} to={getToolPath(tool)} className="group p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 transition-all">
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

        {/* ═══ CATEGORIES ═══ */}
        {!searchQuery && (
          <section className="mb-10 sm:mb-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-1">{t.home.browseCategory}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Explore our collection of powerful free online tools</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {CATEGORIES.map(cat => {
                const theme = categoryThemes[cat.id] || categoryThemes.utility;
                const toolCount = ALL_TOOLS.filter(t => t.category === cat.id).length;
                return (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat)} aria-label={`Browse ${(t.categories as any)[cat.id]} tools`}
                    className={`group relative overflow-hidden p-4 bg-white dark:bg-slate-900 border ${theme.border} rounded-2xl text-left hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer`}>
                    <div className={`hidden sm:block absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${theme.gradient} opacity-5 rounded-bl-3xl group-hover:opacity-10 transition-opacity`} />
                    <div className={`w-9 h-9 ${theme.iconBg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>{categoryIcons[cat.id]}</div>
                    <p className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-1.5">{(t.categories as any)[cat.id]}</p>
                    <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block ${theme.badge}`}>{toolCount} tools</p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ═══ TOOLS GRID ═══ */}
        <section className="mb-10 sm:mb-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {searchQuery ? `${t.home.searchResults} (${filteredTools.length})` : t.home.popularTools}
                </h2>
                {!searchQuery && <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Most-used free online tools by our community</p>}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {(searchQuery ? filteredTools : popularTools).map(tool => {
              const theme = categoryThemes[tool.category] || categoryThemes.utility;
              const isExternal = !!tool.externalUrl;
              const inner = (
                <div className={`group relative flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 hover:border-transparent hover:shadow-xl ${theme.glow} transition-all duration-300 hover:-translate-y-0.5`}>
                  <div className={`h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${theme.gradient} transition-all duration-500`} />
                  <div className="flex flex-col h-full p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 ${theme.iconBg} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0`}>
                        <DynamicIcon name={tool.icon} className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${theme.badge}`}>{(t.categories as any)[tool.category]}</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2 mb-1.5">
                      {t.toolNames[tool.id as keyof typeof t.toolNames] || tool.name}
                    </h3>
                    <div className="flex items-center gap-0.5 mb-3">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
                      <span className="text-[9px] font-bold text-slate-400 ml-1">4.9</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-grow mb-4">
                      {t.toolDescriptions[tool.id as keyof typeof t.toolDescriptions] || tool.shortDescription}
                    </p>
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
            <div className="mt-6 sm:mt-8 text-center">
              <button onClick={() => setDisplayCount(prev => prev + (isLargeScreen ? 18 : isDesktop ? 12 : 6))}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl font-black text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm hover:shadow-xl text-sm">
                Load More Tools <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </section>

        {/* ═══ HOW TO USE ═══ */}
        <section className="mb-10 sm:mb-16 pt-6 sm:pt-10 border-t border-slate-100 dark:border-slate-800/60">
          <div className="text-center mb-5 sm:mb-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-widest mb-4">
              <BookOpen className="w-3.5 h-3.5" /> Guide
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">How to Use Texly Free Online Tools</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm leading-relaxed">
              Texly tools are designed to be simple, fast, and intuitive. Here's how you can get the most out of our platform in just a few clicks.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { step: '01', icon: <Search className="w-5 h-5" />, color: 'blue', title: 'Search or Browse', desc: 'Use the search bar to find any tool instantly, or browse by category — Text, PDF, Image, AI, Dev, or Generator tools.' },
              { step: '02', icon: <MousePointerClick className="w-5 h-5" />, color: 'violet', title: 'Click & Open', desc: 'Click on any tool card to open it. All tools load instantly in your browser — no installation, no downloads, no waiting.' },
              { step: '03', icon: <FileText className="w-5 h-5" />, color: 'emerald', title: 'Paste Your Content', desc: 'Enter or paste your text, upload your image or PDF, and let the tool process it — everything happens privately on your device.' },
              { step: '04', icon: <ArrowUpRight className="w-5 h-5" />, color: 'amber', title: 'Copy & Use', desc: 'Copy the result with one click or download it directly. All outputs are clean, ready-to-use, and completely free with no watermarks.' },
            ].map(item => (
              <div key={item.step} className="relative flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-shadow">
                <span className={`text-5xl font-black text-${item.color}-100 dark:text-${item.color}-900/50 absolute top-4 right-5 select-none`}>{item.step}</span>
                <div className={`w-11 h-11 bg-${item.color}-100 dark:bg-${item.color}-900/40 text-${item.color}-600 dark:text-${item.color}-400 rounded-xl flex items-center justify-center mb-4`}>{item.icon}</div>
                <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ NEW SECTIONS ═══ */}
        <RecentlyAddedTools />
        <MostUsedAITools />
        <MostUsedSEOTools />
        <MostUsedTextTools />
        <WhyChooseTexlyExpanded />
        <WhoCanUseTexly />
        <HowTexlyProtectsPrivacy />
        <OurMission />

        {/* ═══ FOUNDER ═══ */}
        <section className="mb-10 sm:mb-16">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950 p-5 sm:p-8">
            <div className="hidden sm:block absolute -top-10 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="hidden sm:block absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-[50px] pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-blue-500/30">MM</div>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                </div>
              </div>
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-black uppercase tracking-widest mb-3">
                  <User className="w-3 h-3" /> Meet the Creator
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Mahendra Mirdha</h2>
                <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-xl">
                  Hi! I'm Mahendra, the founder and developer behind Texly. I built this platform because I was tired of jumping between dozens of websites for basic text, image, and developer tasks. My goal is simple — give everyone access to powerful, free tools that just work, without any signup, paywall, or nonsense.
                </p>
                <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-xl">
                  I'm passionate about web development, SEO, and building tools that make people's lives easier. Texly is a solo passion project, and every feature is handcrafted with care. If you have feedback, suggestions, or just want to say hi — I personally read every email!
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="mailto:texlyonline@gmail.com" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold text-sm transition-all backdrop-blur-sm">
                    <Mail className="w-4 h-4" /> texlyonline@gmail.com
                  </a>
                  <Link to="/about-us" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl font-bold text-sm transition-all">
                    <Globe className="w-4 h-4" /> About Texly
                  </Link>
                </div>
              </div>
              <div className="hidden lg:flex flex-col gap-3 flex-shrink-0">
                {[{ text: 'Indie Developer' }, { text: 'SEO Enthusiast' }, { text: '100+ Tools Built' }, { text: 'Privacy Advocate' }].map(item => (
                  <div key={item.text} className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /><span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ExpandedFAQ />

        {/* ═══ BLOG ═══ */}
        <section className="mb-10 sm:mb-16 pt-6 sm:pt-10 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-violet-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span></span>
                <span className="text-xs font-black text-violet-600 dark:text-violet-400 uppercase tracking-widest">Latest Articles</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                From the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">Blog</span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tips, guides and tutorials to get more out of Texly tools</p>
            </div>
            <Link to="/blog" className="flex-shrink-0 flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors uppercase tracking-wide group">
              All Posts <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          {blogsLoading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse overflow-hidden">
                  <div className="h-40 bg-slate-200 dark:bg-slate-700" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {!blogsLoading && recentBlogs.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {recentBlogs.map((blog, idx) => (
                <Link key={blog.id} to={`/blog/${blog.slug}`}
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:border-violet-300 dark:hover:border-violet-800/60 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-[16/9] flex-shrink-0">
                    {blog.image ? (
                      <img src={blog.image} alt={blog.title} loading={idx < 2 ? 'eager' : 'lazy'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${blog.id}/400/225`; }} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/40 dark:to-fuchsia-900/40 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-violet-400" />
                      </div>
                    )}
                    {blog.category && <span className="absolute top-2 left-2 text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-600/90 text-white backdrop-blur-sm uppercase tracking-wide">{blog.category}</span>}
                  </div>
                  <div className="flex flex-col flex-1 p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {blog.date && <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500"><Calendar className="w-2.5 h-2.5" /><span className="hidden sm:inline">{blog.date}</span><span className="sm:hidden">{blog.date.split(' ').slice(0,2).join(' ')}</span></span>}
                      {blog.readTime && <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500"><ClockIcon className="w-2.5 h-2.5" />{blog.readTime}</span>}
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug line-clamp-2 mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{blog.title}</h3>
                    {blog.excerpt && <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 flex-grow mb-3">{blog.excerpt}</p>}
                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="flex items-center gap-1 text-[11px] font-black text-violet-600 dark:text-violet-400 group-hover:gap-2 transition-all">Read More <ArrowRight className="w-3 h-3" /></span>
                      {blog.author && <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400"><User className="w-2.5 h-2.5" />{blog.author.split(' ')[0]}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {!blogsLoading && recentBlogs.length === 0 && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No blog posts yet. Check back soon!</p>
            </div>
          )}
          {!blogsLoading && recentBlogs.length > 0 && (
            <div className="mt-8 text-center">
              <Link to="/blog" className="inline-flex items-center gap-2 px-7 py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black text-sm text-slate-700 dark:text-slate-300 hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all shadow-sm hover:shadow-xl group">
                <BookOpen className="w-4 h-4" /> View All Blog Posts <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </section>

        {/* ═══ ABOUT + E-E-A-T (before footer) ═══ */}
        <AboutTexlyOnline />
        <EEATSignals />

        {/* ═══ SOCIAL SHARE ═══ */}
        <section className="mb-8 sm:mb-12 text-center">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">Share Texly with your friends</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href="https://twitter.com/intent/tweet?text=100%2B%20free%20online%20text%20%26%20AI%20tools%20%E2%80%94%20no%20signup%2C%20instant%20results!&url=https%3A%2F%2Fwww.texlyonline.in%2F" target="_blank" rel="noopener noreferrer" aria-label="Share Texly on Twitter" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
              Share on X
            </a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fwww.texlyonline.in%2F" target="_blank" rel="noopener noreferrer" aria-label="Share Texly on Facebook" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Share on Facebook
            </a>
            <a href="https://wa.me/?text=100%2B%20free%20online%20text%20%26%20AI%20tools%20%E2%80%94%20no%20signup!%20https%3A%2F%2Fwww.texlyonline.in%2F" target="_blank" rel="noopener noreferrer" aria-label="Share Texly on WhatsApp" className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-600 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
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
    </main>
  );
};

export default HomePage;
