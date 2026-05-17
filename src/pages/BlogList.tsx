import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BlogPost } from '../data/blog';
import { getBlogs } from '../utils/blogStorage';
import { translateBlogs } from '../services/translationService';
import { Calendar, User, Clock, ArrowRight, ChevronLeft, ChevronRight, Filter, Search, Mail, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';

const POSTS_PER_PAGE = 6;

const BlogList: React.FC = () => {
  const { t, language } = useLanguage();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (t?.blog?.allCategories) {
      setSelectedCategory(t.blog.allCategories);
    }
  }, [t?.blog?.allCategories]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const data = await getBlogs();
        
        if (language !== 'en') {
          const translated = await translateBlogs(data, language);
          setBlogs(translated);
        } else {
          setBlogs(data);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch blogs:', err);
        setError(err.message || 'Failed to load blogs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, [language]);

  // Reset to first page when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    return [t.blog.allCategories, ...Array.from(new Set(blogs.map(blog => blog.category)))];
  }, [blogs, t.blog.allCategories]);
  
  const filteredBlogs = useMemo(() => {
    let result = blogs;
    
    if (selectedCategory !== t.blog.allCategories && selectedCategory !== '') {
      result = result.filter(blog => blog.category === selectedCategory);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(blog => 
        blog.title.toLowerCase().includes(query) || 
        blog.excerpt.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [blogs, selectedCategory, searchQuery, t.blog.allCategories]);

  const featuredPost = useMemo(() => {
    if (filteredBlogs.length > 0 && selectedCategory === t.blog.allCategories && !searchQuery) {
      return filteredBlogs[0];
    }
    return null;
  }, [filteredBlogs, selectedCategory, searchQuery, t.blog.allCategories]);

  const gridBlogs = useMemo(() => {
    if (featuredPost) {
      return filteredBlogs.slice(1);
    }
    return filteredBlogs;
  }, [filteredBlogs, featuredPost]);

  const totalPages = Math.ceil(gridBlogs.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedBlogs = gridBlogs.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const gridElement = document.getElementById('blog-grid');
    if (gridElement) {
      gridElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'SEO': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
      'Productivity': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'Formatting': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
      'Tools': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      'Writing': 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
    };
    return colors[category] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50 dark:bg-slate-900/50">
        <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 dark:bg-blue-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200 dark:bg-indigo-900/20 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3 h-3" />
                <span>Texly Insights</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
                The <span className="text-blue-600 dark:text-blue-400">Texly</span> Blog
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                {t.blog.subtitle}
              </p>
            </motion.div>
          </div>

          {/* Search & Filter Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white dark:bg-slate-900 p-2 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.blog.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white font-medium placeholder:text-slate-400"
                />
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
              <div className="flex flex-wrap justify-center gap-2 px-2 py-2 md:py-0">
                {categories.slice(0, 5).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {isLoading ? (
          <div className="flex justify-center items-center py-40">
            <div className="relative w-20 h-20">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full" />
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-50 dark:bg-red-900/10 rounded-[40px] border border-red-100 dark:border-red-900/20 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Oops! Something went wrong</h3>
            <p className="text-red-600 dark:text-red-400 font-medium mb-8">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/30 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 shadow-sm rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t.blog.noSearchResults}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">We couldn't find any articles matching your current search or filter criteria.</p>
            <button 
              onClick={() => {
                setSelectedCategory(t.blog.allCategories);
                setSearchQuery('');
              }}
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/20"
            >
              {t.blog.viewAllPosts}
            </button>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && currentPage === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-24"
              >
                <Link to={`/blog/${featuredPost.slug}`} className="group relative block bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 hover:shadow-blue-200/30 dark:hover:shadow-blue-900/20 transition-all duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
                      <img 
                        src={featuredPost.image} 
                        alt={featuredPost.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-8 lg:p-16 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="px-4 py-1.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-full">
                          {t.blog.featured}
                        </span>
                        <span className={`px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full ${getCategoryColor(featuredPost.category)}`}>
                          {featuredPost.category}
                        </span>
                      </div>
                      <h2 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight group-hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 line-clamp-3 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-6 text-sm text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mb-10">
                        <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500" /> {featuredPost.date}</span>
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> {featuredPost.readTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black group-hover:gap-4 transition-all">
                        {t.blog.readMore} <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Blog Grid */}
            <div id="blog-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              <AnimatePresence>
                {paginatedBlogs.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group flex flex-col bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/50 transition-all duration-500"
                  >
                    <Link to={`/blog/${post.slug}`} className="flex flex-col h-full">
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 dark:text-slate-500 mb-4 font-black uppercase tracking-[0.2em]">
                          <span className="flex items-center gap-1.5">{post.date}</span>
                          <span className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full" />
                          <span className="flex items-center gap-1.5">{post.readTime}</span>
                        </div>
                        
                        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                          {post.title}
                        </h2>
                        
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 line-clamp-3 leading-relaxed flex-1">
                          {post.excerpt}
                        </p>
                        
                        <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                            {t.blog.readMore}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-12 h-12 rounded-2xl font-black transition-all ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 dark:shadow-blue-900/20'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-inherit transition-all"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Newsletter Section */}
      <section className="bg-slate-900 py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[50%] h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-full h-full bg-blue-500 rounded-full blur-[150px]" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-10">
            <Mail className="w-10 h-10" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight">
            {t.blog.newsletterTitle}
          </h2>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            {t.blog.newsletterDesc}
          </p>
          
          {isSubscribed ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[32px] text-emerald-400 font-bold"
            >
              Awesome! You're now subscribed to our newsletter.
            </motion.div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                required
                placeholder={t.blog.newsletterPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                {t.blog.subscribe}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default BlogList;
