import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Download,
  Calendar,
  ChevronDown,
  Copy, 
  Check, 
  Trash2, 
  Play, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Heart,
  ChevronRight,
  Sparkles,
  Image as ImageIcon,
  Upload,
  Loader2,
  Wrench,
  Twitter,
  Facebook,
  MessageCircle
} from 'lucide-react';
import DynamicIcon from '../components/LucideIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/SEO';
import { ALL_TOOLS } from '../data/tools';
import { getSEOContent, getJSONLD, getSEOData } from '../data/seo';
import { useLanguage } from '../context/LanguageContext';
import { BASE_URL } from '../config';
import { getRelatedBlogs, injectInternalLinks } from '../utils/seoLinking';
import { getBlogs } from '../utils/blogStorage';
import { BlogPost } from '../data/blog';
import Tesseract from 'tesseract.js';
import { QRCodeCanvas } from 'qrcode.react';

const PDFToolWorkspace = lazy(() => import('../components/PDFToolWorkspace').then(m => ({ default: m.PDFToolWorkspace })));
import AdPlaceholder from '../components/AdPlaceholder';
import AIPanel from '../components/AIPanel';
import RatingSystem from '../components/RatingSystem';
import CommentSection from '../components/CommentSection';

import { shareOnTwitter, shareOnFacebook, shareOnLinkedin, shareOnWhatsApp } from '../utils/share';

const ToolPage: React.FC = () => {
  const { t } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const tool = ALL_TOOLS.find(t => t.slug === slug);
  
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogPost[]>([]);

  const getToolPath = (tool: any) => {
    if (tool.category === 'ai' || tool.category === 'generator') {
      return `/tools/${tool.slug}`;
    }
    return `/tool/${tool.slug}`;
  };

  const toolSEO = useMemo(() => {
    if (!tool) return null;
    return getSEOData(tool.id);
  }, [tool]);

  // Related tools
  const relatedTools = useMemo(() => {
    if (!tool) return [];
    
    // Prioritize manually defined related tools
    if (toolSEO?.relatedTools && toolSEO.relatedTools.length > 0) {
      return ALL_TOOLS.filter(t => toolSEO.relatedTools?.includes(t.id));
    }

    // Fallback to category-based related tools
    return ALL_TOOLS
      .filter(t => t.category === tool.category && t.id !== tool.id)
      .slice(0, 4);
  }, [tool, toolSEO]);

  // Live Preview Effect
  useEffect(() => {
    if (tool && input && !tool.isAI) {
      const result = tool.process(input, options);
      if (typeof result === 'string') {
        setOutput(result);
      }
    } else if (!input) {
      setOutput('');
    }
  }, [input, tool, options]);

  // Fetch related blogs
  useEffect(() => {
    const fetchRelatedBlogs = async () => {
      if (!slug) return;
      try {
        const allBlogs = await getBlogs();
        const related = getRelatedBlogs(slug, allBlogs, 3);
        setRelatedBlogs(related);
      } catch (error) {
        console.error('Error fetching related blogs:', error);
      }
    };
    fetchRelatedBlogs();
  }, [slug]);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t.tool.toolNotFound}</h1>
          <Link to="/" className="text-blue-600 hover:underline">{t.tool.goBackHome}</Link>
        </div>
      </div>
    );
  }

  const toolName = t.toolNames[tool.id] || tool.name;
  const primaryKeyword = tool.primaryKeyword || tool.keywords[0] || tool.name.toLowerCase();

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tool.slug}-result.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp') => {
    const url = window.location.href;
    const title = `Check out this free ${toolName} tool on Texly!`;
    
    if (platform === 'twitter') shareOnTwitter(title, url);
    else if (platform === 'facebook') shareOnFacebook(url);
    else if (platform === 'linkedin') shareOnLinkedin(title, url);
    else if (platform === 'whatsapp') shareOnWhatsApp(title, url);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleLoadExample = () => {
    if (tool.example) {
      setInput(tool.example);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOcr = async () => {
    if (!imagePreview) return;
    setLoading(true);
    try {
      const result = await Tesseract.recognize(
        imagePreview,
        'eng',
        { logger: m => console.log(m) }
      );
      setOutput(result.data.text || t.tool.noTextFound);
    } catch (error) {
      console.error('OCR Error:', error);
      setOutput(t.tool.ocrError);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async () => {
    if (tool.id === 'image-to-text') {
      handleOcr();
      return;
    }

    setLoading(true);
    try {
      const result = await tool.process(input, options);
      setOutput(result);
    } catch (error) {
      console.error('Processing error:', error);
      setOutput('Error processing request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Category Theme Mapping
  const categoryThemes: Record<string, { 
    primaryText: string, 
    secondaryText: string, 
    bg: string, 
    border: string, 
    iconBg: string,
    text: string,
    gradient: string,
    darkBg: string,
    darkBorder: string,
    darkText: string,
    darkSecondaryText: string,
    shadow: string,
    darkShadow: string,
    hoverShadow: string,
    darkHoverShadow: string
  }> = {
    cleaning: { 
      primaryText: 'text-emerald-600', 
      secondaryText: 'text-emerald-500', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-100', 
      iconBg: 'bg-emerald-100 text-emerald-600',
      text: 'text-emerald-900',
      gradient: 'from-emerald-500 to-teal-600',
      darkBg: 'dark:bg-emerald-900/10',
      darkBorder: 'dark:border-emerald-800/50',
      darkText: 'dark:text-emerald-100',
      darkSecondaryText: 'dark:text-emerald-400',
      shadow: 'shadow-emerald-600/20',
      darkShadow: 'dark:shadow-emerald-500/20',
      hoverShadow: 'hover:shadow-emerald-600/30',
      darkHoverShadow: 'dark:hover:shadow-emerald-500/30'
    },
    converter: { 
      primaryText: 'text-blue-600', 
      secondaryText: 'text-blue-500', 
      bg: 'bg-blue-50', 
      border: 'border-blue-100', 
      iconBg: 'bg-blue-100 text-blue-700',
      text: 'text-blue-900',
      gradient: 'from-blue-500 to-indigo-600',
      darkBg: 'dark:bg-blue-900/10',
      darkBorder: 'dark:border-blue-800/50',
      darkText: 'dark:text-blue-100',
      darkSecondaryText: 'dark:text-blue-400',
      shadow: 'shadow-blue-600/20',
      darkShadow: 'dark:shadow-blue-500/20',
      hoverShadow: 'hover:shadow-blue-600/30',
      darkHoverShadow: 'dark:hover:shadow-blue-500/30'
    },
    analysis: { 
      primaryText: 'text-amber-600', 
      secondaryText: 'text-amber-500', 
      bg: 'bg-amber-50', 
      border: 'border-amber-100', 
      iconBg: 'bg-amber-100 text-amber-600',
      text: 'text-amber-900',
      gradient: 'from-amber-500 to-orange-600',
      darkBg: 'dark:bg-amber-900/10',
      darkBorder: 'dark:border-amber-800/50',
      darkText: 'dark:text-amber-100',
      darkSecondaryText: 'dark:text-amber-400',
      shadow: 'shadow-amber-600/20',
      darkShadow: 'dark:shadow-amber-500/20',
      hoverShadow: 'hover:shadow-amber-600/30',
      darkHoverShadow: 'dark:hover:shadow-amber-500/30'
    },
    utility: { 
      primaryText: 'text-slate-600', 
      secondaryText: 'text-slate-500', 
      bg: 'bg-slate-50', 
      border: 'border-slate-100', 
      iconBg: 'bg-slate-100 text-slate-600',
      text: 'text-slate-900',
      gradient: 'from-slate-500 to-slate-700',
      darkBg: 'dark:bg-slate-900/10',
      darkBorder: 'dark:border-slate-800/50',
      darkText: 'dark:text-slate-100',
      darkSecondaryText: 'dark:text-slate-400',
      shadow: 'shadow-slate-600/20',
      darkShadow: 'dark:shadow-slate-500/20',
      hoverShadow: 'hover:shadow-slate-600/30',
      darkHoverShadow: 'dark:hover:shadow-slate-500/30'
    },
    pdf: { 
      primaryText: 'text-rose-600', 
      secondaryText: 'text-rose-500', 
      bg: 'bg-rose-50', 
      border: 'border-rose-100', 
      iconBg: 'bg-rose-100 text-rose-600',
      text: 'text-rose-900',
      gradient: 'from-rose-500 to-pink-600',
      darkBg: 'dark:bg-rose-900/10',
      darkBorder: 'dark:border-rose-800/50',
      darkText: 'dark:text-rose-100',
      darkSecondaryText: 'dark:text-rose-400',
      shadow: 'shadow-rose-600/20',
      darkShadow: 'dark:shadow-rose-500/20',
      hoverShadow: 'hover:shadow-rose-600/30',
      darkHoverShadow: 'dark:hover:shadow-rose-500/30'
    },
    generator: { 
      primaryText: 'text-purple-600', 
      secondaryText: 'text-purple-500', 
      bg: 'bg-purple-50', 
      border: 'border-purple-100', 
      iconBg: 'bg-purple-100 text-purple-600',
      text: 'text-purple-900',
      gradient: 'from-purple-500 to-fuchsia-600',
      darkBg: 'dark:bg-purple-900/10',
      darkBorder: 'dark:border-purple-800/50',
      darkText: 'dark:text-purple-100',
      darkSecondaryText: 'dark:text-purple-400',
      shadow: 'shadow-purple-600/20',
      darkShadow: 'dark:shadow-purple-500/20',
      hoverShadow: 'hover:shadow-purple-600/30',
      darkHoverShadow: 'dark:hover:shadow-purple-500/30'
    },
    ai: { 
      primaryText: 'text-blue-600', 
      secondaryText: 'text-blue-500', 
      bg: 'bg-blue-50', 
      border: 'border-blue-100', 
      iconBg: 'bg-blue-100 text-blue-700',
      text: 'text-blue-900',
      gradient: 'from-blue-600 to-indigo-600',
      darkBg: 'dark:bg-blue-900/10',
      darkBorder: 'dark:border-blue-800/50',
      darkText: 'dark:text-blue-100',
      darkSecondaryText: 'dark:text-blue-400',
      shadow: 'shadow-blue-600/20',
      darkShadow: 'dark:shadow-blue-500/20',
      hoverShadow: 'hover:shadow-blue-600/30',
      darkHoverShadow: 'dark:hover:shadow-blue-500/30'
    }
  };

  const theme = categoryThemes[tool.category] || categoryThemes.utility;

  // Stats calculation
  const stats = useMemo(() => ({
    chars: input.length,
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    lines: input ? input.split(/\n/).length : 0
  }), [input]);

  return (
    <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <SEO 
        title={toolSEO?.title || toolName}
        description={toolSEO?.metaDescription || t.toolDescriptions[tool.id] || t.tool.defaultHook}
        canonical={`${BASE_URL}/tool/${tool.slug}`}
        keywords={[...(tool.keywords || []), ...(tool.secondaryKeywords || []), 'text tools', 'online tools', 'texly']}
      />
      
      {/* JSON-LD for Search Engines */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(getJSONLD(toolName, tool.slug, primaryKeyword, t))}
        </script>
      </Helmet>

      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-10">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{t.navbar.home}</Link>
          <ChevronRight className="w-4 h-4 opacity-50" aria-hidden="true" />
          <span className="text-slate-900 dark:text-white font-semibold" aria-current="page">{tool.name}</span>
        </nav>

        {/* Enhanced Header Section */}
        <div className="relative mb-16 overflow-hidden rounded-[3rem]">
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full blur-3xl -z-10" />
          
          <div className="text-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full ${theme.bg} ${theme.darkBg} ${theme.text} ${theme.darkSecondaryText} text-xs font-black uppercase tracking-widest mb-6 border ${theme.border} ${theme.darkBorder} shadow-sm`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tool.hook || t.tool.defaultHook}</span>
            </motion.div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-[1.1]">
              {toolSEO?.h1 || tool.name}
              <span className={`block text-transparent bg-clip-text bg-gradient-to-r ${theme.gradient} mt-2`}>
                {t.tool.freeOnlineTool}
              </span>
            </h1>
            
            <p 
              className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: injectInternalLinks(toolSEO?.intro || t.toolDescriptions[tool.id] || t.tool.defaultHook, ALL_TOOLS) }}
            />
            
            <div className="flex flex-wrap justify-center gap-4" role="list">
              {[
                { icon: Heart, text: t.tool.freeForever, color: 'text-rose-500' },
                { icon: ShieldCheck, text: t.tool.noSignup, color: 'text-emerald-500' },
                { icon: Zap, text: t.tool.instantResult, color: 'text-amber-500' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                  role="listitem"
                >
                  <item.icon className={`w-4 h-4 ${item.color}`} aria-hidden="true" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Social Sharing Buttons */}
            <div className="flex items-center justify-center gap-3 mt-10">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mr-2">Share Tool:</span>
              <button 
                onClick={() => handleShare('twitter')}
                className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm hover:shadow-md"
                title="Share on Twitter"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-blue-700 hover:text-white transition-all shadow-sm hover:shadow-md"
                title="Share on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleShare('whatsapp')}
                className="w-10 h-10 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm hover:shadow-md"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tool Workspace - Professional Redesign */}
        <div className="relative group mb-16">
          <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-[0.03] dark:opacity-[0.05] rounded-[3rem] blur-2xl group-hover:opacity-[0.05] dark:group-hover:opacity-[0.08] transition-opacity`} />
          
          <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[3rem] shadow-2xl shadow-slate-200/60 dark:shadow-slate-950/60 border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-8 md:p-12">
              {tool.externalUrl ? (
                <div className="w-full aspect-[4/5] sm:aspect-[16/9] min-h-[700px]">
                  <iframe 
                    src={tool.externalUrl} 
                    className="w-full h-full border-0 rounded-2xl dark:bg-slate-800"
                    title={tool.name}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : tool.category === 'pdf' ? (
                <Suspense fallback={<div className="flex items-center justify-center p-20"><div className="w-10 h-10 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div></div>}><PDFToolWorkspace toolId={tool.id} toolName={tool.name} /></Suspense>
              ) : (
                <div className="grid grid-cols-1 gap-10">
                  {/* Input Section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${theme.iconBg} ${theme.darkBg} ${theme.darkSecondaryText}`}>
                          <DynamicIcon name={tool.icon} size={20} />
                        </div>
                        <label htmlFor="tool-input" className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                          {t.tool.input}
                        </label>
                      </div>
                      <div className="flex items-center space-x-3">
                        {tool.example && (
                          <button
                            onClick={handleLoadExample}
                            className={`text-xs font-black uppercase tracking-widest ${theme.primaryText} ${theme.darkSecondaryText} hover:opacity-80 transition-opacity`}
                            aria-label={t.tool.loadExample}
                          >
                            {t.tool.loadExample}
                          </button>
                        )}
                        <button
                          onClick={handleClear}
                          className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors flex items-center space-x-1.5"
                          aria-label={t.tool.clear}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{t.tool.clear}</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative">
                      {tool.id === 'image-to-text' ? (
                        <div 
                          className={`relative border-2 border-dashed rounded-[2rem] p-8 sm:p-12 transition-all ${
                            imagePreview ? `${theme.border.replace('border-', 'border-')} ${theme.bg.replace('bg-', 'bg-')}/30 ${theme.darkBg}` : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-slate-50/50 dark:bg-slate-950/30'
                          }`}
                        >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              aria-label={t.tool.uploadImage}
                            />
                            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                              {imagePreview ? (
                                <div className="relative w-full max-w-sm aspect-video rounded-2xl overflow-hidden border border-blue-200 dark:border-blue-800 shadow-xl">
                                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain bg-white dark:bg-slate-800" loading="lazy" />
                                </div>
                              ) : (
                                <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-lg">
                                  <Upload className={`w-10 h-10 ${theme.primaryText} ${theme.darkText}`} />
                                </div>
                              )}
                              <div>
                                <p className="text-lg font-black text-slate-900 dark:text-white">
                                  {imagePreview ? t.tool.changeImage : t.tool.clickOrDrag}
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                  {t.tool.imageSupport}
                                </p>
                              </div>
                            </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <textarea
                            id="tool-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={tool.placeholder || t.tool.defaultPlaceholder}
                            className={`w-full h-64 p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 transition-all resize-none font-mono text-slate-700 dark:text-slate-300 text-lg leading-relaxed shadow-inner`}
                            aria-multiline="true"
                          />
                          {/* Real-time Stats Overlay */}
                          <div className="absolute bottom-4 right-6 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                            <span>{stats.chars} Chars</span>
                            <span>{stats.words} Words</span>
                            <span>{stats.lines} Lines</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ad Slot 1 */}
        <div className="mb-12">
          <AdPlaceholder slot="Top of Tool" />
        </div>

        {/* Tool Specific Options - Styled as Cards */}
                    {Object.keys(options).length > 0 || ['text-repeater', 'invisible-text', 'add-prefix', 'text-steganography', 'password-gen-strength', 'find-replace', 'qr-code-generator', 'unit-converter', 'color-palette-generator', 'base64-image-converter', 'age-calculator', 'military-alphabet-converter', 'whatsapp-text-formatter', 'number-to-words'].includes(tool.id) ? (
                      <div className="grid grid-cols-1 gap-4">
                        {tool.id === 'qr-code-generator' && (
                          <div className={`flex flex-col items-center p-8 ${theme.bg} ${theme.darkBg} rounded-[2rem] border ${theme.border} ${theme.darkBorder}`}>
                            <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl shadow-xl mb-6">
                              <QRCodeCanvas 
                                id="qr-code-canvas"
                                value={input || BASE_URL} 
                                size={256}
                                level="H"
                                includeMargin={true}
                              />
                            </div>
                            <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">QR Code Preview</p>
                          </div>
                        )}

                        {tool.id === 'unit-converter' && (
                          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 ${theme.bg} ${theme.darkBg} rounded-2xl border ${theme.border} ${theme.darkBorder}`}>
                            <div>
                              <label htmlFor="unit-from" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">From</label>
                              <select 
                                id="unit-from"
                                className={`w-full p-3 bg-white dark:bg-slate-900 border ${theme.border} ${theme.darkBorder} rounded-xl font-black ${theme.primaryText} ${theme.darkSecondaryText} focus:ring-2 focus:ring-blue-500/20 outline-none`}
                                value={options.from || 'km'}
                                onChange={(e) => setOptions({...options, from: e.target.value})}
                              >
                                <option value="km">Kilometers</option>
                                <option value="miles">Miles</option>
                                <option value="kg">Kilograms</option>
                                <option value="lbs">Pounds</option>
                                <option value="c">Celsius</option>
                                <option value="f">Fahrenheit</option>
                                <option value="m">Meters</option>
                                <option value="ft">Feet</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="unit-to" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">To</label>
                              <select 
                                id="unit-to"
                                className={`w-full p-3 bg-white dark:bg-slate-900 border ${theme.border} ${theme.darkBorder} rounded-xl font-black ${theme.primaryText} ${theme.darkSecondaryText} focus:ring-2 focus:ring-blue-500/20 outline-none`}
                                value={options.to || 'miles'}
                                onChange={(e) => setOptions({...options, to: e.target.value})}
                              >
                                <option value="miles">Miles</option>
                                <option value="km">Kilometers</option>
                                <option value="lbs">Pounds</option>
                                <option value="kg">Kilograms</option>
                                <option value="f">Fahrenheit</option>
                                <option value="c">Celsius</option>
                                <option value="ft">Feet</option>
                                <option value="m">Meters</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {tool.id === 'color-palette-generator' && output && (
                          <div className={`grid grid-cols-2 sm:grid-cols-5 gap-2 p-5 ${theme.bg} ${theme.darkBg} rounded-2xl border ${theme.border} ${theme.darkBorder}`}>
                            {output.split(',').map((color, i) => (
                              <div key={i} className="flex flex-col items-center gap-2">
                                <div 
                                  className="w-full aspect-square rounded-xl shadow-md border border-white dark:border-slate-800 cursor-pointer hover:scale-105 transition-transform"
                                  style={{ backgroundColor: color }}
                                  onClick={() => {
                                    navigator.clipboard.writeText(color);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                  }}
                                />
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">{color}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {tool.id === 'base64-image-converter' && (
                          <div className={`grid grid-cols-1 gap-4 p-5 ${theme.bg} ${theme.darkBg} rounded-2xl border ${theme.border} ${theme.darkBorder}`}>
                            <div className="flex items-center justify-between">
                              <label htmlFor="base64-mode" className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Mode</label>
                              <select 
                                id="base64-mode"
                                className={`p-2.5 bg-white dark:bg-slate-900 border ${theme.border} ${theme.darkBorder} rounded-xl font-black ${theme.primaryText} ${theme.darkSecondaryText} focus:ring-2 focus:ring-blue-500/20 outline-none`}
                                value={options.mode || 'image-to-base64'}
                                onChange={(e) => setOptions({...options, mode: e.target.value})}
                              >
                                <option value="image-to-base64">Image to Base64</option>
                                <option value="base64-to-image">Base64 to Image</option>
                              </select>
                            </div>
                            {options.mode === 'image-to-base64' && (
                              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 bg-white/50 dark:bg-slate-900/50 text-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setInput(reader.result as string);
                                        setOutput(reader.result as string);
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Click to upload image</p>
                              </div>
                            )}
                            {options.mode === 'base64-to-image' && input.startsWith('data:image') && (
                              <div className="flex justify-center p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                <img src={input} alt="Base64 Preview" className="max-h-48 rounded-lg shadow-sm" loading="lazy" />
                              </div>
                            )}
                          </div>
                        )}


                        {tool.id === 'whatsapp-text-formatter' && (
                          <div className="flex flex-col gap-4">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Choose formatting style:</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {[
                                { label: '**Bold**', symbol: '*', desc: 'Bold', color: 'blue' },
                                { label: '_Italic_', symbol: '_', desc: 'Italic', color: 'purple' },
                                { label: '~Strike~', symbol: '~', desc: 'Strikethrough', color: 'red' },
                                { label: '`Mono`', symbol: '`', desc: 'Monospace', color: 'green' },
                              ].map(({ label, symbol, desc, color }) => (
                                <button
                                  key={symbol}
                                  onClick={() => setOutput(input ? `${symbol}${input}${symbol}` : '')}
                                  className={`p-3 rounded-xl border-2 border-${color}-100 dark:border-${color}-900/30 bg-${color}-50 dark:bg-${color}-900/10 text-${color}-700 dark:text-${color}-300 font-bold text-sm hover:scale-105 transition-all`}
                                >
                                  <div className="text-lg mb-1">{label}</div>
                                  <div className="text-xs opacity-70">{desc}</div>
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Tip: Select a style above, then click "Format Text" — or just type in the box and use buttons</p>
                          </div>
                        )}
                        {tool.id === 'number-to-words' && (
                          <div className="flex flex-col gap-3">
                            <p className="text-sm text-slate-500 font-medium">Enter any number to convert:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {['1000', '100000', '1000000', '10000000'].map(num => (
                                <button
                                  key={num}
                                  onClick={() => setInput(num)}
                                  className="p-2 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-all"
                                >
                                  {parseInt(num).toLocaleString('en-IN')}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-slate-400">Click a number above to try it, or type your own number</p>
                          </div>
                        )}
                        {tool.id === 'age-calculator' && (
                          <div className={`flex flex-col p-5 ${theme.bg} ${theme.darkBg} rounded-2xl border ${theme.border} ${theme.darkBorder}`}>
                            <label htmlFor="birth-date" className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3">Select Birth Date</label>
                            <input 
                              id="birth-date"
                              type="date" 
                              className={`w-full p-4 bg-white dark:bg-slate-900 border ${theme.border} ${theme.darkBorder} rounded-xl font-black ${theme.primaryText} ${theme.darkSecondaryText} focus:ring-2 focus:ring-blue-500/20 outline-none`}
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                            />
                          </div>
                        )}

                        {tool.id === 'text-repeater' && (
                          <div className={`flex items-center justify-between p-5 ${theme.bg} ${theme.darkBg} rounded-2xl border ${theme.border} ${theme.darkBorder}`}>
                            <label htmlFor="repeat-count" className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Repeat Count</label>
                            <input 
                              id="repeat-count"
                              type="number" 
                              className={`w-24 p-2.5 bg-white dark:bg-slate-900 border ${theme.border} ${theme.darkBorder} rounded-xl font-black ${theme.primaryText} ${theme.darkSecondaryText} text-center focus:ring-2 focus:ring-blue-500/20 outline-none`}
                              value={options.count || 10}
                              onChange={(e) => setOptions({...options, count: parseInt(e.target.value) || 1})}
                            />
                          </div>
                        )}

                        {tool.id === 'military-alphabet-converter' && (
                          <div className="flex flex-col gap-4">
                            <div className={`flex items-center justify-between p-5 ${theme.bg} ${theme.darkBg} rounded-2xl border ${theme.border} ${theme.darkBorder}`}>
                              <label htmlFor="military-mode" className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Conversion Mode</label>
                              <select 
                                id="military-mode"
                                className={`p-2.5 bg-white dark:bg-slate-900 border ${theme.border} ${theme.darkBorder} rounded-xl font-black ${theme.primaryText} ${theme.darkSecondaryText} focus:ring-2 focus:ring-blue-500/20 outline-none`}
                                value={options.mode || 'text-to-nato'}
                                onChange={(e) => setOptions({...options, mode: e.target.value})}
                              >
                                <option value="text-to-nato">Text to NATO</option>
                                <option value="nato-to-text">NATO to Text</option>
                              </select>
                            </div>
                            <button
                              onClick={() => {
                                const example = options.mode === 'nato-to-text' 
                                  ? 'Tango Echo X-ray Lima Yankee' 
                                  : 'Texly Online Tools';
                                setInput(example);
                              }}
                              className={`w-full py-3 px-4 bg-white dark:bg-slate-900 border ${theme.border} ${theme.darkBorder} rounded-2xl text-sm font-bold ${theme.primaryText} ${theme.darkSecondaryText} hover:${theme.bg} ${theme.darkBg} transition-colors flex items-center justify-center gap-2`}
                            >
                              <Zap size={16} />
                              Load Example
                            </button>
                          </div>
                        )}

                        {tool.id === 'invisible-text' && (
                          <div className={`flex items-center justify-between p-5 ${theme.bg} ${theme.darkBg} rounded-2xl border ${theme.border} ${theme.darkBorder}`}>
                            <label htmlFor="invisible-count" className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Character Count</label>
                            <input 
                              id="invisible-count"
                              type="number" 
                              className={`w-24 p-2.5 bg-white dark:bg-slate-900 border ${theme.border} ${theme.darkBorder} rounded-xl font-black ${theme.primaryText} ${theme.darkSecondaryText} text-center focus:ring-2 focus:ring-blue-500/20 outline-none`}
                              value={options.count || 10}
                              onChange={(e) => setOptions({...options, count: parseInt(e.target.value) || 1})}
                            />
                          </div>
                        )}

                        {tool.id === 'add-prefix' && (
                          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 ${theme.bg} ${theme.darkBg} rounded-2xl border ${theme.border} ${theme.darkBorder}`}>
                            <div>
                              <label htmlFor="prefix-text" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Prefix</label>
                              <input 
                                id="prefix-text"
                                type="text" 
                                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                placeholder="Add to start..."
                                value={options.prefix || ''}
                                onChange={(e) => setOptions({...options, prefix: e.target.value})}
                              />
                            </div>
                            <div>
                              <label htmlFor="suffix-text" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Suffix</label>
                              <input 
                                id="suffix-text"
                                type="text" 
                                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-blue-500/20 outline-none"
                                placeholder="Add to end..."
                                value={options.suffix || ''}
                                onChange={(e) => setOptions({...options, suffix: e.target.value})}
                              />
                            </div>
                          </div>
                        )}

                        {tool.id === 'text-steganography' && (
                          <div className={`flex items-center justify-between p-5 ${theme.bg} ${theme.darkBg} rounded-2xl border ${theme.border} ${theme.darkBorder}`}>
                            <label htmlFor="steg-mode" className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Processing Mode</label>
                            <select 
                              id="steg-mode"
                              className={`p-2.5 bg-white dark:bg-slate-900 border ${theme.border} ${theme.darkBorder} rounded-xl font-black ${theme.primaryText} ${theme.darkSecondaryText} focus:ring-2 focus:ring-blue-500/20 outline-none`}
                              value={options.mode || 'encode'}
                              onChange={(e) => {
                                setOptions({...options, mode: e.target.value});
                                if (e.target.value === 'encode') {
                                  setInput('Cover Text: This is a normal message.\nSecret: Meet me at 5pm.');
                                } else {
                                  setInput('');
                                }
                              }}
                            >
                              <option value="encode">Encode (Hide)</option>
                              <option value="decode">Decode (Reveal)</option>
                            </select>
                          </div>
                        )}

                        {tool.id === 'password-gen-strength' && (
                          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 ${theme.bg} ${theme.darkBg} rounded-2xl border ${theme.border} ${theme.darkBorder}`}>
                            <div>
                              <label htmlFor="pass-mode" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Action</label>
                              <select 
                                id="pass-mode"
                                className={`w-full p-3 bg-white dark:bg-slate-900 border ${theme.border} ${theme.darkBorder} rounded-xl font-black ${theme.primaryText} ${theme.darkSecondaryText} focus:ring-2 focus:ring-blue-500/20 outline-none`}
                                value={options.mode || 'check'}
                                onChange={(e) => setOptions({...options, mode: e.target.value})}
                              >
                                <option value="check">Check Strength</option>
                                <option value="generate">Generate New</option>
                              </select>
                            </div>
                            {options.mode === 'generate' && (
                              <div>
                                <label htmlFor="pass-length" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Length</label>
                                <input 
                                  id="pass-length"
                                  type="number" 
                                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300 outline-none"
                                  value={options.length || 16}
                                  onChange={(e) => setOptions({...options, length: parseInt(e.target.value) || 8})}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {tool.id === 'find-replace' && (
                          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 ${theme.bg} ${theme.darkBg} rounded-2xl border ${theme.border} ${theme.darkBorder}`}>
                            <div>
                              <label htmlFor="find-text" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Find</label>
                              <input 
                                id="find-text"
                                type="text" 
                                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300 outline-none"
                                placeholder="Text to find..."
                                value={options.find || ''}
                                onChange={(e) => setOptions({...options, find: e.target.value})}
                              />
                            </div>
                            <div>
                              <label htmlFor="replace-text" className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Replace with</label>
                              <input 
                                id="replace-text"
                                type="text" 
                                className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-300 outline-none"
                                placeholder="New text..."
                                value={options.replace || ''}
                                onChange={(e) => setOptions({...options, replace: e.target.value})}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>

                  {/* Action Button - Large & Prominent */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleProcess}
                      disabled={loading || (tool.id === 'image-to-text' ? !imagePreview : !input)}
                      className={`group relative inline-flex items-center space-x-3 sm:space-x-4 px-6 py-4 sm:px-12 sm:py-5 bg-gradient-to-r ${theme.gradient} text-white rounded-[1.5rem] sm:rounded-[2rem] font-black text-base sm:text-lg ${theme.hoverShadow} ${theme.darkHoverShadow} transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 ${theme.shadow} ${theme.darkShadow} w-full sm:w-auto justify-center`}
                    >
                      {loading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <Play className="w-6 h-6 fill-current" />
                      )}
                      <span className="uppercase tracking-widest">{loading ? t.tool.processing : (tool.buttonText || t.tool.process)}</span>
                      {!loading && <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />}
                    </button>
                  </div>

                  {/* Output Section - Professional Look */}
                  <AnimatePresence>
                    {(output || loading) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="space-y-6 pt-10 border-t border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                              <Check className="w-5 h-5" />
                            </div>
                            <label htmlFor="tool-output" className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                              {t.tool.result}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <button
                              onClick={handleDownload}
                              className="flex items-center space-x-2 px-3 py-2 sm:px-6 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                              title="Download as .txt"
                              aria-label="Download Result"
                            >
                              <Download className="w-4 h-4" aria-hidden="true" />
                              <span className="hidden sm:inline">Download</span>
                            </button>
                            <button
                              onClick={handleCopy}
                              aria-live="polite"
                              aria-label="Copy Result"
                              className={`flex items-center space-x-2 px-3 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest transition-all ${
                                copied 
                                  ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/30' 
                                  : `bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-xl shadow-slate-900/20 dark:shadow-white/10`
                              }`}
                            >
                              {copied ? (
                                <>
                                  <Check className="w-4 h-4" aria-hidden="true" />
                                  <span>{t.tool.copied}</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4" aria-hidden="true" />
                                  <span>{t.tool.copy}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="relative group">
                          <pre 
                            id="tool-output"
                            aria-live="polite"
                            className={`w-full min-h-[150px] p-8 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] font-mono text-slate-800 dark:text-slate-200 text-lg whitespace-pre-wrap break-all overflow-auto shadow-inner`}
                          >
                            {output || t.tool.processing}
                          </pre>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Enhancement Panel - powered by HuggingFace Gradio */}
        {['text-repeater', 'remove-special-characters', 'text-to-list', 'find-replace', 'morse-code', 'fancy-text', 'remove-extra-spaces', 'paraphrase', 'text-cleaner', 'whatsapp-text-formatter'].includes(tool.id) && (
          <AIPanel toolId={tool.id} input={input} />
        )}

        {/* Rating System */}
        <RatingSystem toolId={tool.id} theme={theme} />

        {/* Ad Slot 2 */}
        <div className="mt-12">
          <AdPlaceholder slot="Bottom of Tool" />
        </div>

        {/* SEO Content Section - Enhanced Professional Layout */}
        <div className="rounded-[3rem] p-10 sm:p-16 border border-slate-100 dark:border-slate-800 mb-16 prose prose-slate dark:prose-invert max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: getSEOContent(
                tool.id, 
                t.toolNames[tool.id] || tool.name, 
                tool.primaryKeyword || tool.keywords[0] || tool.name.toLowerCase(),
                t,
                tool.secondaryKeywords
              ) 
            }} 
          />
        </div>

        {/* Related Tools - Enhanced Cards */}
        {relatedTools.length > 0 && (
          <section className="mt-32 pt-20 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Related Tools</h2>
              <Link to="/" className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:opacity-70 transition-opacity">View All</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedTools.map((t) => {
                const tTheme = categoryThemes[t.category] || categoryThemes.utility;
                return (
                  <Link
                    key={t.slug}
                    to={`/tool/${t.slug}`}
                    className="group p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                  >
                    <div className={`w-14 h-14 ${tTheme.iconBg} ${tTheme.darkBg} ${tTheme.darkSecondaryText} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      <DynamicIcon name={t.icon} size={28} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">{t.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{t.shortDescription}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Related Blogs Section - Enhanced Cards */}
        {relatedBlogs.length > 0 && (
          <section className="mt-32 pt-20 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-12 tracking-tight">Expert Guides & Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {relatedBlogs.map((blog) => (
                <Link
                  key={blog.slug}
                  to={`/blog/${blog.slug}`}
                  className="group flex flex-col bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="px-5 py-2.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] shadow-xl">
                        {blog.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-10 flex flex-col flex-grow">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                      {blog.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-3 mb-8 leading-relaxed">
                      {blog.excerpt}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{blog.date}</span>
                      </div>
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2 group-hover:gap-3 transition-all">
                        Read More <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Use Cases & Benefits - Mobile Optimized */}
        {(toolSEO?.useCases || toolSEO?.benefits) && (
          <section className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-10">
              {toolSEO?.useCases && (
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">{t.seo.useCases}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {toolSEO.useCases.map((useCase, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
                        <Check className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-snug">{useCase}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {toolSEO?.benefits && (
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">{t.seo.benefits}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {toolSEO.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                        <div className="w-2 h-2 shrink-0 rounded-full bg-blue-600" />
                        <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 flex items-center gap-4">
                    <ShieldCheck className="w-6 h-6 shrink-0 text-blue-600" />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">{t.seo.secure}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.seo.isSafeAns}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* AI Explanation / Technical Section - Mobile Optimized */}
        {tool.isAI && (
          <section className="mt-16 p-6 sm:p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white overflow-hidden relative">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                <Zap className="w-3 h-3" />
                <span>AI Powered</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black mb-3 tracking-tight">{t.seo.technicalDeepDive}</h2>
              <p className="text-white/90 text-sm sm:text-base leading-relaxed mb-5" dangerouslySetInnerHTML={{ __html: injectInternalLinks(toolSEO?.extraInfo || `${toolName} uses state-of-the-art machine learning models to process your data in seconds. Our neural networks are trained on millions of data points to ensure high accuracy and professional results every single time.`, ALL_TOOLS) }} />
              <div className="flex flex-wrap gap-2">
                {['Neural Networks', 'GPU Processing', 'End-to-End Encryption'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-white/20 rounded-lg text-xs font-bold">{tag}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* How to Use & FAQ Section */}
        <section className="mt-32 pt-20 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">How to use {toolName}</h2>
              <div className="space-y-6">
                {(toolSEO?.howToUse || [
                  'Input your text: Paste your text into the input area above or use the "Load Example" button to see how it works.',
                  'Configure options: If the tool has options (like count or search terms), adjust them to your needs.',
                  'Get instant results: The tool processes your text in real-time. You can see the result in the output box immediately.',
                  'Copy or Download: Once you\'re happy with the result, click the "Copy" button or download the text for later use.'
                ]).map((step, i) => (
                  <div key={i} className="flex gap-6">
                    <div className={`w-10 h-10 shrink-0 rounded-xl ${theme.iconBg} ${theme.darkBg} ${theme.darkSecondaryText} flex items-center justify-center font-black text-lg shadow-sm`}>
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                        {typeof step === 'string' ? step.split(':')[0] : `Step ${i + 1}`}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                        {typeof step === 'string' ? (step.includes(':') ? step.split(':')[1] : step) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {(toolSEO?.faqs || [
                  { q: `Is this ${toolName} tool free?`, a: `Yes, all tools on Texly are 100% free to use without any registration or hidden costs.` },
                  { q: `Is my data secure?`, a: `Absolutely. All processing happens locally in your browser. We never store or transmit your text data to our servers.` },
                  { q: `Can I use this on mobile?`, a: `Yes, Texly is fully responsive and works perfectly on all devices, including smartphones and tablets.` },
                  { q: `What is the maximum text limit?`, a: `There is no hard limit, but very large texts (several megabytes) might slow down your browser's performance.` }
                ]).map((item, i) => (
                  <details key={i} className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-slate-900 dark:text-white">
                      <span>{item.q}</span>
                      <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-6 pb-6 text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Related Tools Section */}
        {relatedTools.length > 0 && (
          <section className="mt-32 pt-20 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Related Tools</h2>
              <Link to="/" className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 group">
                View All Tools <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTools.map((relTool) => (
                <Link
                  key={relTool.id}
                  to={getToolPath(relTool)}
                  className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className={`w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors mb-4`}>
                    <DynamicIcon name={relTool.icon} size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {t.toolNames[relTool.id] || relTool.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {t.toolDescriptions[relTool.id] || relTool.shortDescription}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Comment Section */}
        <CommentSection targetId={tool.id} targetType="tool" theme={theme} />

        {/* Footer CTA */}
        <div className="mt-32 text-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-3 px-8 py-4 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-800 transition-all active:scale-95"
            aria-label={t.tool.tryAnother}
          >
            <span>{t.tool.tryAnother}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ToolPage;
