/**
 * App.tsx  –  Main application shell
 *
 * Key optimizations vs. original:
 *  1. Every lazy-loaded <Route> is wrapped in its own <RouteErrorBoundary>
 *     so one broken page can't blank the whole app.
 *  2. Framer Motion fully removed — replaced with CSS transitions to fix
 *     desktop dark mode GPU glitch (text repeat/overlap artifact on Chrome).
 *  3. TexlyAIAssistant (heavy Gradio dependency) is truly lazy – only
 *     imported after the first user interaction.
 *  4. TexlyAI floating button is deferred until after page is interactive.
 *  5. Suspense fallback is a simple CSS spinner with no JS dependencies.
 */

import React, {
  useEffect,
  useState,
  useMemo,
  lazy,
  Suspense,
  useCallback,
} from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
  useParams,
} from 'react-router-dom';
import { HelmetProvider, Helmet } from 'react-helmet-async';

import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

import { BASE_URL } from './config';
import { ALL_TOOLS, CATEGORIES } from './data/tools';
import { Language } from './data/translations';

import DynamicIcon from './components/LucideIcon';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CategoryModal from './components/CategoryModal';
import CookieBanner from './components/CookieBanner';
import ErrorBoundary, { RouteErrorBoundary } from './components/ErrorBoundary';
import { shouldReduceAnimations, isSamsungTV } from './utils/browserCompat';
import { useMobilePerf } from './hooks/useMobilePerf';
import { useDesktopPerf, shouldPrefetch } from './hooks/useDesktopPerf';
import pagesData from './data/pages.json';

import {
  Trash2,
  RefreshCw,
  BarChart3,
  Wrench,
  ArrowRight,
  Search,
  FileText,
  Sparkles,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// ─── Lazy pages ───────────────────────────────────────────────────────────────
const HomePage = lazy(() => import('./pages/Home'));
const ToolPage = lazy(() => import('./pages/ToolDetail'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const PrivacyPolicy = lazy(() => import('./legal/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./legal/TermsAndConditions'));
const AboutUs = lazy(() => import('./legal/AboutUs'));
const ContactUs = lazy(() => import('./legal/ContactUs'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AITools = lazy(() => import('./pages/AITools'));
const FaceSwap = lazy(() => import('./pages/tools/FaceSwap'));
const BackgroundRemover = lazy(() => import('./pages/tools/BackgroundRemover'));
const ImageEnhancer = lazy(() => import('./pages/tools/ImageEnhancer'));
const ImageCompressor = lazy(() => import('./pages/tools/ImageCompressor'));
const ImageUpscale = lazy(() => import('./pages/tools/ImageUpscale'));
const ImageGenerator = lazy(() => import('./pages/tools/ImageGenerator'));
const SnapchatTagGenerator = lazy(
  () => import('./pages/tools/SnapchatTagGenerator')
);
const AIToolPlaceholder = lazy(() => import('./pages/tools/AIToolPlaceholder'));
const AITextSuite = lazy(() => import('./pages/tools/AITextSuite'));
const InvisibleTextSuite = lazy(() => import('./pages/tools/InvisibleTextSuite'));
const TextToListConverter = lazy(() => import('./pages/tools/TextToListConverter'));
const RemoveSpecialCharacters = lazy(() => import('./pages/tools/RemoveSpecialCharacters'));
const TopToolsLanding = lazy(() => import('./pages/TopToolsLanding'));
const RemoveSpecialCharactersLanding = lazy(() => import('./pages/RemoveSpecialCharactersLanding'));
const WordCounterPage = lazy(() => import('./pages/tools/WordCounterPage'));
const DownloadApp = lazy(() => import('./pages/DownloadApp'));
const DevStudioPage = lazy(() => import('./components/DevStudio'));
const AIAutomation = lazy(() => import('./pages/AIAutomation'));
// AI SEO Automation Panel द्वारा push किए गए programmatic landing pages
const SEOPage = lazy(() => import('./pages/SEOPage'));

// ─── Dev Utility Tools (5 new) ────────────────────────────────────────────────
const RobotsTxtTester         = lazy(() => import('./pages/tools/RobotsTxtTester'));
const JsonPathFinder          = lazy(() => import('./pages/tools/JsonPathFinder'));
const RegexExplainer          = lazy(() => import('./pages/tools/RegexExplainer'));
const CronExpressionGenerator = lazy(() => import('./pages/tools/CronExpressionGenerator'));
const RedirectChainChecker    = lazy(() => import('./pages/tools/RedirectChainChecker'));

// ─── Loading spinner (pure CSS, zero JS deps) ─────────────────────────────────
function PageLoader() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(37,99,235,0.1)',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'texly-spin 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes texly-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ─── Router helpers ───────────────────────────────────────────────────────────
function NavigateWithParams() {
  const { slug } = useParams();
  return <Navigate to={`/tool/${slug}`} replace />;
}

function ToolRouteWrapper() {
  const { slug } = useParams();
  // Hardcoded special tools jo /tools/ path pe hain
  const HARDCODED_AI_SLUGS = new Set([
    'face-swap', 'bg-remover', 'enhancer', 'compressor', 'image-upscale',
    'image-generator', 'ai-text-suite', 'invisible-text-suite',
    'snapchat-tag-generator', 'robots-txt-tester', 'json-path-finder',
    'regex-explainer', 'cron-expression-generator', 'redirect-chain-checker',
  ]);

  if (slug && HARDCODED_AI_SLUGS.has(slug)) {
    return <ToolPage />;
  }

  // Dynamic tools ab /{slug} direct path se handle hote hain
  // /tools/:slug se /{slug} redirect
  if (slug) {
    return <Navigate to={`/${slug}`} replace />;
  }
  return <ToolPage />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    } catch (_) {
      // Fallback for TVs that don't support ScrollToOptions
      window.scrollTo(0, 0);
    }
  }, [pathname]);
  return null;
}

const getToolPath = (tool: any) =>
  tool.category === 'ai' || tool.category === 'generator'
    ? `/tools/${tool.slug}`
    : `/tool/${tool.slug}`;

// ─── Category themes (extracted so it's not recreated on every render) ────────
const CATEGORY_THEMES: Record<
  string,
  {
    border: string;
    bg: string;
    text: string;
    hoverBg: string;
    hoverText: string;
    arrow: string;
    hoverArrow: string;
  }
> = {
  cleaning: {
    border: 'border-emerald-100 dark:border-emerald-900/30',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    hoverBg: 'group-hover:bg-emerald-600',
    hoverText: 'group-hover:text-white',
    arrow: 'text-emerald-300 dark:text-emerald-700',
    hoverArrow:
      'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
  },
  converter: {
    border: 'border-blue-100 dark:border-blue-900/30',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    hoverBg: 'group-hover:bg-blue-600',
    hoverText: 'group-hover:text-white',
    arrow: 'text-blue-300 dark:text-blue-700',
    hoverArrow: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
  },
  analysis: {
    border: 'border-amber-100 dark:border-amber-900/30',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    hoverBg: 'group-hover:bg-amber-600',
    hoverText: 'group-hover:text-white',
    arrow: 'text-amber-300 dark:text-amber-700',
    hoverArrow: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
  },
  utility: {
    border: 'border-slate-100 dark:border-slate-800',
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    text: 'text-slate-700 dark:text-slate-400',
    hoverBg: 'group-hover:bg-slate-600',
    hoverText: 'group-hover:text-white',
    arrow: 'text-slate-300 dark:text-slate-700',
    hoverArrow: 'group-hover:text-slate-600 dark:group-hover:text-slate-400',
  },
  pdf: {
    border: 'border-rose-100 dark:border-rose-900/30',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    text: 'text-rose-700 dark:text-rose-400',
    hoverBg: 'group-hover:bg-rose-600',
    hoverText: 'group-hover:text-white',
    arrow: 'text-rose-300 dark:text-rose-700',
    hoverArrow: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
  },
  generator: {
    border: 'border-purple-100 dark:border-purple-900/30',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
    hoverBg: 'group-hover:bg-purple-600',
    hoverText: 'group-hover:text-white',
    arrow: 'text-purple-300 dark:text-purple-700',
    hoverArrow: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
  },
};

const MODAL_THEMES: Record<string, any> = {
  cleaning: {
    primary: 'emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/30',
  },
  converter: {
    primary: 'blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/30',
  },
  analysis: {
    primary: 'amber-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/30',
  },
  utility: {
    primary: 'slate-600',
    bg: 'bg-slate-50 dark:bg-slate-900/20',
    iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    border: 'border-slate-100 dark:border-slate-800',
  },
  pdf: {
    primary: 'rose-600',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    iconBg: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-900/30',
  },
  generator: {
    primary: 'purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/30',
  },
};

// ─── Deferred AI Assistant ────────────────────────────────────────────────────
// Load TexlyAIAssistant only after the user has interacted with the page.
// This prevents the 634 KB ai-image chunk from blocking initial render.
const LazyTexlyAI = lazy(() => import('./components/TexlyAI'));
const ImageSizeReducerPage = lazy(() => import('./pages/tools/generated/image-size-reducer'));

function DeferredTexlyAI() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // On Samsung TVs skip the AI assistant entirely (memory pressure)
    if (isSamsungTV()) return;

    const isDesktop = window.innerWidth >= 1024;
    const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
    const mount = () => {
      setMounted(true);
      events.forEach((e) => window.removeEventListener(e, mount));
    };
    // Desktop: mount faster (2s) — users expect instant interaction
    // Mobile: wait longer (5s) to not block main thread during scroll
    const delay = isDesktop ? 2000 : 5000;
    const timer = setTimeout(mount, delay);
    events.forEach((e) => window.addEventListener(e, mount, { once: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, mount));
    };
  }, []);

  if (!mounted) return null;
  return (
    <ErrorBoundary inline>
      <Suspense fallback={null}>
        <LazyTexlyAI />
      </Suspense>
    </ErrorBoundary>
  );
}

// ─── Desktop Route Prefetcher ──────────────────────────────────────────────────
function DesktopPrefetcher() {
  useEffect(() => {
    if (!shouldPrefetch()) return;

    const run = () => {
      // Silently prefetch — errors are intentionally swallowed
      // (chunk may already be cached, or network may be slow)
      Promise.allSettled([
        import('./pages/ToolDetail'),
        import('./pages/BlogList'),
        import('./pages/AITools'),
      ]);
    };

    let cleanup: (() => void) | undefined;
    if ('requestIdleCallback' in window) {
      const id = (window as any).requestIdleCallback(run, { timeout: 4000 });
      cleanup = () => (window as any).cancelIdleCallback(id);
    } else {
      const t = setTimeout(run, 4000);
      cleanup = () => clearTimeout(t);
    }
    return cleanup;
  }, []);

  return null;
}

// ─── SEOPage या NotFound — /:slug route के लिए ────────────────────────────
// pages.json directly import — कोई API call नहीं, instant check।
const SEO_SLUGS = new Set((pagesData as Array<{ slug: string }>).map(p => p.slug));

function SEOPageOrNotFound() {
  const { slug } = useParams<{ slug: string }>();
  const [checking, setChecking] = useState(true);
  const [isDynamicTool, setIsDynamicTool] = useState(false);

  useEffect(() => {
    if (!slug || SEO_SLUGS.has(slug)) {
      setChecking(false);
      return;
    }
    // SEO page nahi mila — Supabase mein dynamic tool dhundho
    import('./utils/toolStorage').then(({ getToolBySlug }) => {
      getToolBySlug(slug).then((tool) => {
        setIsDynamicTool(!!tool);
        setChecking(false);
      });
    });
  }, [slug]);

  if (checking) return <PageLoader />;

  if (slug && SEO_SLUGS.has(slug)) {
    return (
      <Suspense fallback={<PageLoader />}>
        <SEOPage />
      </Suspense>
    );
  }

  if (isDynamicTool) {
    return (
      <Suspense fallback={<PageLoader />}>
        <ToolPage />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <NotFound />
    </Suspense>
  );
}


// /tool/:slug — hardcoded tools render karo, dynamic tools ko /{slug} redirect karo
function ToolPageOrRedirect() {
  const { slug } = useParams<{ slug: string }>();

  // Hardcoded tool hai toh directly render karo (backward compat + SEO redirects)
  if (slug && ALL_TOOLS.find((t) => t.slug === slug)) {
    return <ToolPage />;
  }

  // Dynamic Supabase tool — canonical /{slug} path pe redirect
  if (slug) {
    return <Navigate to={`/${slug}`} replace />;
  }

  return <ToolPage />;
}

function AppContent() {
  const { t } = useLanguage();
  const { isMobile, shouldReduceMotion } = useMobilePerf();
  const { pathname } = useLocation();
  const isDevStudio = pathname === '/devstudio';
  // Desktop perf hook — used by DesktopPrefetcher (rendered below)
  // AppContent itself doesn't need desktop flags directly
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [directoryOpen, setDirectoryOpen] = useState(false);

  const filteredTools = useMemo(() => {
    if (!directorySearch.trim()) return ALL_TOOLS;
    const search = directorySearch.toLowerCase();
    return ALL_TOOLS.filter(
      (tool) =>
        tool.name.toLowerCase().includes(search) ||
        tool.shortDescription.toLowerCase().includes(search) ||
        (t.toolNames[tool.id as keyof typeof t.toolNames] || '')
          .toLowerCase()
          .includes(search)
    );
  }, [directorySearch, t.toolNames]);

  // PERF FIX: useMemo prevents ALL_TOOLS.map() on every render → reduces forced reflow
  const directorySchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Texly ${t.directory.title}`,
    description: t.directory.description,
    itemListElement: ALL_TOOLS.map((tool, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BASE_URL}${getToolPath(tool)}`,
      name: tool.name,
    })),
  }), [t.directory.title, t.directory.description]);

  const handleCategoryClose = useCallback(() => setSelectedCategory(null), []);

  // DevStudio: full-screen IDE — Navbar, Footer, Directory सब hide
  if (isDevStudio) {
    return (
      <Suspense fallback={<div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100dvh', background:'#1e1e1e', color:'#ccc', fontSize:14 }}>DevStudio load हो रहा है...</div>}>
        <DevStudioPage />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col overflow-x-hidden transition-colors duration-300">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(directorySchema)}
        </script>
      </Helmet>

      <Navbar />

      {/* ── Routes ─────────────────────────────────────────────────────────── */}
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/"
              element={
                <RouteErrorBoundary>
                  <HomePage />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/ai-tools"
              element={
                <RouteErrorBoundary>
                  <AITools />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/face-swap"
              element={
                <RouteErrorBoundary>
                  <FaceSwap />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/bg-remover"
              element={
                <RouteErrorBoundary>
                  <BackgroundRemover />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/enhancer"
              element={
                <RouteErrorBoundary>
                  <ImageEnhancer />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/compressor"
              element={
                <RouteErrorBoundary>
                  <ImageCompressor />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/image-upscale"
              element={
                <RouteErrorBoundary>
                  <ImageUpscale />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/image-generator"
              element={
                <RouteErrorBoundary>
                  <ImageGenerator />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/ai-text-suite"
              element={
                <RouteErrorBoundary>
                  <AITextSuite />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/snapchat-tag-generator"
              element={
                <RouteErrorBoundary>
                  <SnapchatTagGenerator />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/invisible-text-suite"
              element={
                <RouteErrorBoundary>
                  <InvisibleTextSuite />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/best-free-text-tools-online"
              element={
                <RouteErrorBoundary>
                  <TopToolsLanding />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/remove-special-characters-online"
              element={
                <RouteErrorBoundary>
                  <RemoveSpecialCharactersLanding />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tool/word-counter-online-free"
              element={
                <RouteErrorBoundary>
                  <WordCounterPage />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tool/character-counter-tool"
              element={<Navigate to="/tool/word-counter-online-free" replace />}
            />
            <Route
              path="/tool/text-to-list-converter"
              element={
                <RouteErrorBoundary>
                  <TextToListConverter />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tool/remove-special-characters-online"
              element={
                <RouteErrorBoundary>
                  <RemoveSpecialCharacters />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/ai-automation"
              element={
                <RouteErrorBoundary>
                  <AIAutomation />
                </RouteErrorBoundary>
              }
            />
            {/* ── Dev Utility Tools ── */}
            <Route
              path="/tools/robots-txt-tester"
              element={
                <RouteErrorBoundary>
                  <RobotsTxtTester />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/json-path-finder"
              element={
                <RouteErrorBoundary>
                  <JsonPathFinder />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/regex-explainer"
              element={
                <RouteErrorBoundary>
                  <RegexExplainer />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/cron-expression-generator"
              element={
                <RouteErrorBoundary>
                  <CronExpressionGenerator />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/redirect-chain-checker"
              element={
                <RouteErrorBoundary>
                  <RedirectChainChecker />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tools/:slug"
              element={
                <RouteErrorBoundary>
                  <ToolPage />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/tool/:slug"
              element={
                <RouteErrorBoundary>
                  <ToolPageOrRedirect />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/blog"
              element={
                <RouteErrorBoundary>
                  <BlogList />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/blog/:slug"
              element={
                <RouteErrorBoundary>
                  <BlogDetail />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/privacy-policy"
              element={
                <RouteErrorBoundary>
                  <PrivacyPolicy />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/terms-and-conditions"
              element={
                <RouteErrorBoundary>
                  <TermsAndConditions />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/about-us"
              element={
                <RouteErrorBoundary>
                  <AboutUs />
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/contact-us"
              element={
                <RouteErrorBoundary>
                  <ContactUs />
                </RouteErrorBoundary>
              }
            />

            {/* ── AI SEO Automation: Programmatic Landing Pages ─────────────── */}
            {/* /seo/:slug — legacy route (backward compat) */}
            <Route
              path="/seo/:slug"
              element={
                <RouteErrorBoundary>
                  <SEOPage />
                </RouteErrorBoundary>
              }
            />
            {/* Download App Page */}
            <Route
              path="/download"
              element={
                <RouteErrorBoundary>
                  <DownloadApp />
                </RouteErrorBoundary>
              }
            />

            {/* /:slug — canonical URLs (pages.json में जो URLs हैं वो directly work करें) */}
            <Route
              path="/:slug"
              element={
                <RouteErrorBoundary>
                  <SEOPageOrNotFound />
                </RouteErrorBoundary>
              }
            />

            {/* * wildcard हटाया — /:slug route ऊपर NotFound handle करता है */}
          <Route path="/tool/image-size-reducer" element={<RouteErrorBoundary><ImageSizeReducerPage /></RouteErrorBoundary>} />
          </Routes>
        </Suspense>
      </main>

      {/* ── All Tools Directory ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="directory-heading"
        className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 sm:py-16 transition-colors duration-300 below-fold"
      >
        <div className="max-w-6xl mx-auto px-4">

          {/* ── Toggle Button ── */}
          <div className="flex justify-center mb-4">
            <button
              onClick={() => setDirectoryOpen(prev => !prev)}
              aria-expanded={directoryOpen}
              aria-controls="directory-body"
              className="group inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-base sm:text-lg shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 select-none"
            >
              <Sparkles className="w-5 h-5 opacity-90" />
              <span>{t.directory.title}</span>
              {directoryOpen
                ? <ChevronUp className="w-5 h-5 transition-transform duration-300" />
                : <ChevronDown className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5" />
              }
            </button>
          </div>

          {/* ── Description always visible ── */}
          <p className="text-center text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            {t.directory.description}
          </p>

          {/* ── Collapsible Body ── */}
          <div
            id="directory-body"
            style={{ maxHeight: directoryOpen ? '9999px' : '0px', opacity: directoryOpen ? 1 : 0 }}
            className="overflow-hidden transition-all duration-500 ease-in-out"
          >
          <div className="text-center mb-16 max-w-3xl mx-auto mt-10">
            <h2 id="directory-heading" className="sr-only">
              {t.directory.title}
            </h2>

            <div className="relative max-w-md mx-auto group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <label htmlFor="directory-search" className="sr-only">{t.directory.searchPlaceholder}</label>
              <input
                id="directory-search"
                type="text"
                placeholder={t.directory.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3.5 sm:py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white min-h-[44px]"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-x-8 sm:gap-x-10 lg:gap-x-12 gap-y-10 sm:gap-y-12 lg:gap-y-16">
            {CATEGORIES.map((category) => {
              const categoryTools = filteredTools.filter(
                (t) => t.category === category.id
              );
              if (categoryTools.length === 0) return null;

              const CategoryIcon =
                {
                  cleaning: Trash2,
                  converter: RefreshCw,
                  analysis: BarChart3,
                  utility: Wrench,
                  pdf: FileText,
                  generator: Sparkles,
                }[category.id] || Zap;

              const theme =
                CATEGORY_THEMES[category.id] || CATEGORY_THEMES.converter;

              return (
                <div key={category.id} className="space-y-8">
                  <div
                    className={`flex items-center gap-3 pb-4 border-b-2 ${theme.border} cursor-pointer group/header`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div
                      className={`w-12 h-12 ${theme.bg} rounded-2xl flex items-center justify-center ${theme.text} shadow-sm group-hover/header:scale-110 transition-transform`}
                    >
                      <CategoryIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white text-xl uppercase tracking-widest group-hover/header:text-blue-600 transition-colors">
                      {(t.categories as any)[category.id]}
                    </h3>
                  </div>

                  <ul className="space-y-6" role="list">
                    {categoryTools.map((toolItem) => {
                      const isExternal = !!toolItem.externalUrl;
                      const content = (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-lg ${theme.bg} flex items-center justify-center ${theme.hoverBg} transition-all`}
                              >
                                <DynamicIcon
                                  name={toolItem.icon}
                                  className={`w-3 h-3 ${theme.text} ${theme.hoverText} transition-colors`}
                                />
                              </div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {t.toolNames[toolItem.id] || toolItem.name}
                              </span>
                            </div>
                            <ArrowRight
                              className={`w-4 h-4 ${theme.arrow} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${theme.hoverArrow} transition-all`}
                            />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors pl-8">
                            {t.toolDescriptions[toolItem.id] ||
                              toolItem.shortDescription}
                          </p>
                        </>
                      );

                      return (
                        <li key={toolItem.id}>
                          {isExternal ? (
                            <a
                              href={toolItem.externalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group block"
                            >
                              {content}
                            </a>
                          ) : (
                            <Link
                              to={getToolPath(toolItem)}
                              className="group block"
                            >
                              {content}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* SEO Footer for Directory */}
          <div className="mt-12 sm:mt-16 md:mt-24 pt-10 sm:pt-12 md:pt-16 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  {t.directory.whyTitle}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {t.directory.whyDesc1}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.directory.whyDesc2}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">
                  {t.directory.popularTools}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {ALL_TOOLS.slice(0, 15).map((toolItem) => (
                    <Link
                      key={toolItem.id}
                      to={getToolPath(toolItem)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                    >
                      {t.toolNames[toolItem.id] || toolItem.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </div>{/* end collapsible body */}
        </div>
      </section>

      {/* Category modal */}
      <CategoryModal
        isOpen={!!selectedCategory}
        onClose={handleCategoryClose}
        category={
          selectedCategory
            ? {
                id: selectedCategory.id,
                name: selectedCategory.name,
                icon:
                  ({
                    cleaning: 'Trash2',
                    converter: 'RefreshCw',
                    analysis: 'BarChart3',
                    utility: 'Wrench',
                    pdf: 'FileText',
                    generator: 'Sparkles',
                  }[selectedCategory.id as string] ?? 'Zap'),
                description: (t.categories as any)[
                  `${selectedCategory.id}Desc`
                ],
              }
            : null
        }
        tools={ALL_TOOLS.filter((t) => t.category === selectedCategory?.id)}
        theme={
          selectedCategory
            ? (MODAL_THEMES[selectedCategory.id] ?? MODAL_THEMES.converter)
            : MODAL_THEMES.converter
        }
      />

      <Footer />
      <CookieBanner />

      {/* Deferred AI Assistant – loads after interaction, skipped on TVs */}
      <DeferredTexlyAI />

      {/* Desktop route prefetcher – runs on idle, desktop + fast network only */}
      <DesktopPrefetcher />
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  // shouldReduceAnimations() = Samsung TV, prefers-reduced-motion, या low-end device
  // reducedMotion=true होने पर framer-motion सभी animations instantly complete करेगा
  // यह large screen blank fix करता है जहाँ whileInView viewport से बाहर था
  const reducedMotion = shouldReduceAnimations();

  return (
    <ErrorBoundary>
      <HelmetProvider>
        <LanguageProvider>
          <ThemeProvider>
              <Router>
                <ScrollToTop />
                <AppContent />
              </Router>
          </ThemeProvider>
        </LanguageProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
