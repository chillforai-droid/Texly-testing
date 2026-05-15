import React, { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { BASE_URL } from './config';

// Lazy load pages for performance
const HomePage = lazy(() => import('./pages/Home'));
const ToolPage = lazy(() => import('./pages/ToolDetail'));
const BlogList = lazy(() => import('./pages/BlogList').then(module => ({ default: module.default })));
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
const SnapchatTagGenerator = lazy(() => import('./pages/tools/SnapchatTagGenerator'));
const AIToolPlaceholder = lazy(() => import('./pages/tools/AIToolPlaceholder'));

import { ALL_TOOLS, CATEGORIES } from './data/tools';
import DynamicIcon from './components/LucideIcon';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CategoryModal from './components/CategoryModal';
import { 
  Trash2, 
  RefreshCw, 
  BarChart3, 
  Wrench, 
  ArrowRight, 
  Search, 
  FileText, 
  Sparkles,
  Zap
} from 'lucide-react';

import ErrorBoundary from './components/ErrorBoundary';
import CookieBanner from './components/CookieBanner';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Language } from './data/translations';
import { Navigate, useParams } from 'react-router-dom';

function NavigateWithParams() {
  const { slug } = useParams();
  return <Navigate to={`/tool/${slug}`} replace />;
}

function ToolRouteWrapper() {
  const { slug } = useParams();
  const tool = useMemo(() => ALL_TOOLS.find(t => t.slug === slug), [slug]);

  if (tool && (tool.category === 'ai' || tool.category === 'generator')) {
    return <Navigate to={`/tools/${slug}`} replace />;
  }

  return <ToolPage />;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const getToolPath = (tool: any) => {
  if (tool.category === 'ai' || tool.category === 'generator') {
    return `/tools/${tool.slug}`;
  }
  return `/tool/${tool.slug}`;
};

function AppContent() {
  const { t } = useLanguage();
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const filteredTools = useMemo(() => {
    if (!directorySearch.trim()) return ALL_TOOLS;
    const search = directorySearch.toLowerCase();
    return ALL_TOOLS.filter(tool => 
      tool.name.toLowerCase().includes(search) || 
      tool.shortDescription.toLowerCase().includes(search) ||
      (t.toolNames[tool.id as keyof typeof t.toolNames] || '').toLowerCase().includes(search)
    );
  }, [directorySearch, t.toolNames]);

  // JSON-LD for the Directory
  const directorySchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Texly ${t.directory.title}`,
    "description": t.directory.description,
    "itemListElement": ALL_TOOLS.map((tool, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${BASE_URL}${getToolPath(tool)}`,
      "name": tool.name
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col overflow-x-hidden transition-colors duration-300">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(directorySchema)}
        </script>
      </Helmet>
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        <Suspense fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/ai-tools" element={<AITools />} />
            <Route path="/tools/face-swap" element={<FaceSwap />} />
            <Route path="/tools/bg-remover" element={<BackgroundRemover />} />
            <Route path="/tools/enhancer" element={<ImageEnhancer />} />
            <Route path="/tools/compressor" element={<ImageCompressor />} />
            <Route path="/tools/image-upscale" element={<ImageUpscale />} />
            <Route path="/tools/image-generator" element={<ImageGenerator />} />
            <Route path="/tools/snapchat-tag-generator" element={<SnapchatTagGenerator />} />
            <Route path="/tools/:slug" element={<ToolPage />} />
            <Route path="/tool/:slug" element={<ToolRouteWrapper />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {/* All Tools Directory - Enhanced for UI & SEO */}
      <section aria-labelledby="directory-heading" className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 sm:py-24 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 id="directory-heading" className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
              {t.directory.title}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10">
              {t.directory.description}
            </p>

            {/* Directory Search */}
            <div className="relative max-w-md mx-auto group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder={t.directory.searchPlaceholder}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white"
                value={directorySearch}
                onChange={(e) => setDirectorySearch(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
            {CATEGORIES.map(category => {
              const categoryTools = filteredTools.filter(t => t.category === category.id);
              if (categoryTools.length === 0) return null;

              const CategoryIcon = {
                cleaning: Trash2,
                converter: RefreshCw,
                analysis: BarChart3,
                utility: Wrench,
                pdf: FileText,
                generator: Sparkles
              }[category.id] || Zap;

              const categoryThemes: Record<string, {
                border: string,
                bg: string,
                text: string,
                hoverBg: string,
                hoverText: string,
                arrow: string,
                hoverArrow: string
              }> = {
                cleaning: {
                  border: 'border-emerald-100 dark:border-emerald-900/30',
                  bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                  text: 'text-emerald-700 dark:text-emerald-400',
                  hoverBg: 'group-hover:bg-emerald-600',
                  hoverText: 'group-hover:text-white',
                  arrow: 'text-emerald-300 dark:text-emerald-700',
                  hoverArrow: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                },
                converter: {
                  border: 'border-blue-100 dark:border-blue-900/30',
                  bg: 'bg-blue-50 dark:bg-blue-900/20',
                  text: 'text-blue-700 dark:text-blue-400',
                  hoverBg: 'group-hover:bg-blue-600',
                  hoverText: 'group-hover:text-white',
                  arrow: 'text-blue-300 dark:text-blue-700',
                  hoverArrow: 'group-hover:text-blue-600 dark:group-hover:text-blue-400'
                },
                analysis: {
                  border: 'border-amber-100 dark:border-amber-900/30',
                  bg: 'bg-amber-50 dark:bg-amber-900/20',
                  text: 'text-amber-700 dark:text-amber-400',
                  hoverBg: 'group-hover:bg-amber-600',
                  hoverText: 'group-hover:text-white',
                  arrow: 'text-amber-300 dark:text-amber-700',
                  hoverArrow: 'group-hover:text-amber-600 dark:group-hover:text-amber-400'
                },
                utility: {
                  border: 'border-slate-100 dark:border-slate-800',
                  bg: 'bg-slate-50 dark:bg-slate-900/20',
                  text: 'text-slate-700 dark:text-slate-400',
                  hoverBg: 'group-hover:bg-slate-600',
                  hoverText: 'group-hover:text-white',
                  arrow: 'text-slate-300 dark:text-slate-700',
                  hoverArrow: 'group-hover:text-slate-600 dark:group-hover:text-slate-400'
                },
                pdf: {
                  border: 'border-rose-100 dark:border-rose-900/30',
                  bg: 'bg-rose-50 dark:bg-rose-900/20',
                  text: 'text-rose-700 dark:text-rose-400',
                  hoverBg: 'group-hover:bg-rose-600',
                  hoverText: 'group-hover:text-white',
                  arrow: 'text-rose-300 dark:text-rose-700',
                  hoverArrow: 'group-hover:text-rose-600 dark:group-hover:text-rose-400'
                },
                generator: {
                  border: 'border-purple-100 dark:border-purple-900/30',
                  bg: 'bg-purple-50 dark:bg-purple-900/20',
                  text: 'text-purple-700 dark:text-purple-400',
                  hoverBg: 'group-hover:bg-purple-600',
                  hoverText: 'group-hover:text-white',
                  arrow: 'text-purple-300 dark:text-purple-700',
                  hoverArrow: 'group-hover:text-purple-600 dark:group-hover:text-purple-400'
                }
              };

              const theme = categoryThemes[category.id] || categoryThemes.converter;

              return (
                <div key={category.id} className="space-y-8">
                  <div 
                    className={`flex items-center gap-3 pb-4 border-b-2 ${theme.border} cursor-pointer group/header`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    <div className={`w-12 h-12 ${theme.bg} rounded-2xl flex items-center justify-center ${theme.text} shadow-sm group-hover/header:scale-110 transition-transform`}>
                      <CategoryIcon className="w-6 h-6" />
                    </div>
                    <h3 className={`font-black text-slate-900 dark:text-white text-xl uppercase tracking-widest group-hover/header:text-blue-600 transition-colors`}>
                      {(t.categories as any)[category.id]}
                    </h3>
                  </div>
                  <ul className="space-y-6" role="list">
                    {categoryTools.map(toolItem => {
                      const isExternal = !!toolItem.externalUrl;
                      const content = (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-lg ${theme.bg} flex items-center justify-center ${theme.hoverBg} transition-all`}>
                                <DynamicIcon name={toolItem.icon} className={`w-3 h-3 ${theme.text} ${theme.hoverText} transition-colors`} />
                              </div>
                              <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t.toolNames[toolItem.id] || toolItem.name}</span>
                            </div>
                            <ArrowRight className={`w-4 h-4 ${theme.arrow} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 ${theme.hoverArrow} transition-all`} />
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors pl-8">
                            {t.toolDescriptions[toolItem.id] || toolItem.shortDescription}
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
          <div className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t.directory.whyTitle}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {t.directory.whyDesc1}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.directory.whyDesc2}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">{t.directory.popularTools}</h4>
                <div className="flex flex-wrap gap-2">
                  {ALL_TOOLS.slice(0, 15).map(toolItem => (
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
        </div>
      </section>

      <CategoryModal 
        isOpen={!!selectedCategory}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory ? {
          id: selectedCategory.id,
          name: selectedCategory.name,
          icon: {
            cleaning: 'Trash2',
            converter: 'RefreshCw',
            analysis: 'BarChart3',
            utility: 'Wrench',
            pdf: 'FileText',
            generator: 'Sparkles'
          }[selectedCategory.id as string] || 'Zap',
          description: (t.categories as any)[`${selectedCategory.id}Desc`]
        } : null}
        tools={ALL_TOOLS.filter(t => t.category === selectedCategory?.id)}
        theme={(() => {
          const categoryThemes: Record<string, any> = {
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
            }
          };
          return selectedCategory ? (categoryThemes[selectedCategory.id] || categoryThemes.converter) : categoryThemes.converter;
        })()}
      />

      <Footer />
      <CookieBanner />
    </div>
  );
}

function App() {
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
