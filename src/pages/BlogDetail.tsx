import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import { BlogPost } from '../data/blog';
import { getBlogs, getBlogBySlug } from '../utils/blogStorage';
import { translateBlog, translateBlogs } from '../services/translationService';
import { getRelatedTools, injectInternalLinks } from '../utils/seoLinking';
import { ALL_TOOLS, Tool } from '../data/tools';
import DynamicIcon from '../components/LucideIcon';
import { 
  Calendar, 
  User, 
  Clock, 
  ArrowLeft, 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Plus, 
  ChevronUp,
  List,
  ArrowRight,
  Sparkles,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import AdPlaceholder from '../components/AdPlaceholder';
import CommentSection from '../components/CommentSection';
import { useLanguage } from '../context/LanguageContext';
import { shareOnTwitter, shareOnFacebook, shareOnLinkedin } from '../utils/share';

const BlogDetail: React.FC = () => {
  const { t, language } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedTools, setRelatedTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [toc, setToc] = useState<{id: string, text: string, level: number}[]>([]);

  useEffect(() => {
    if (post && post.contentType !== 'html') {
      const headings = post.content.match(/^#{1,3} .+/gm);
      if (headings) {
        const tocItems = headings.map(h => {
          const level = h.split(' ')[0].length;
          const text = h.replace(/^#{1,3} /, '');
          const id = text.toLowerCase().replace(/[^\w]+/g, '-');
          return { id, text, level };
        });
        setToc(tocItems);
      }
    }
  }, [post]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setReadingProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the specific post
        const foundPost = await getBlogBySlug(slug);
        
        if (foundPost) {
          if (language !== 'en') {
            const translated = await translateBlog(foundPost, language);
            setPost(translated);
          } else {
            setPost(foundPost);
          }
          
          // Get related tools based on original content for better matching
          const tools = getRelatedTools(foundPost.content, foundPost.title, 4);
          setRelatedTools(tools);
        }
        
        // Fetch other blogs for "Recent Posts" section
        const allBlogs = await getBlogs();
        if (language !== 'en') {
          const translated = await translateBlogs(allBlogs, language);
          setBlogs(translated);
        } else {
          setBlogs(allBlogs);
        }
      } catch (err: any) {
        console.error('Failed to fetch blog post:', err);
        setError(err.message || 'Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, language]);

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const url = window.location.href;
    const title = post?.title || '';
    
    if (platform === 'twitter') shareOnTwitter(title, url);
    else if (platform === 'facebook') shareOnFacebook(url);
    else if (platform === 'linkedin') shareOnLinkedin(title, url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 p-4 text-center">
        <p className="text-red-600 dark:text-red-400 font-bold mb-4">Error: {error}</p>
        <Link to="/blog" className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all">
          Back to Blog
        </Link>
      </div>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Inject internal links into the content
  const processedContent = injectInternalLinks(post.content, ALL_TOOLS);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 py-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 z-[100] bg-slate-100 dark:bg-slate-900">
        <motion.div 
          className="h-full bg-blue-600"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      <SEO 
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        canonical={`/blog/${post.slug}`}
        ogType="article"
        ogImage={post.image}
        keywords={[
          ...(post.metaKeywords ? post.metaKeywords.split(',').map(k => k.trim()) : []),
          post.category, 
          'blog', 
          'text tools', 
          'texly'
        ]}
      />
      
      {/* Back to Top Button */}
      <AnimatePresence>
        {readingProgress > 20 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 w-14 h-14 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center justify-center z-50 hover:bg-blue-600 transition-all group"
            aria-label="Back to top"
          >
            <ChevronUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-12 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t.blog.backToBlog}
        </Link>

        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-4 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-6">
              <span>{post.category}</span>
              <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
              <span>{post.readTime}</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-10 leading-[0.95]">
              {post.title}
            </h1>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-y border-slate-100 dark:border-slate-800 py-6 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{post.author}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-widest">{post.date}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest sm:hidden">Share:</span>
                <button 
                  onClick={() => handleShare('twitter')}
                  className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  title="Share on Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleShare('facebook')}
                  className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-blue-700 hover:text-white transition-all"
                  title="Share on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleShare('linkedin')}
                  className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-blue-600 hover:text-white transition-all"
                  title="Share on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </header>

        {/* Ad Slot 1 */}
        <div className="mb-16">
          <AdPlaceholder slot="Top of Article" />
        </div>

        {/* Table of Contents */}
        {toc.length > 0 && (
          <div className="mb-16 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <List className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Table of Contents
            </h3>
            <nav className="space-y-3">
              {toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`block text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium ${
                    item.level === 2 ? 'pl-0' : 'pl-4 text-sm'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(item.id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16 rounded-3xl overflow-hidden shadow-2xl"
        >
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-auto"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </motion.div>

        <article className="prose prose-slate dark:prose-invert prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-3xl prose-img:shadow-xl">
          {post.contentType === 'html' ? (
            <div dangerouslySetInnerHTML={{ __html: processedContent }} />
          ) : post.contentType === 'text' ? (
            <div className="whitespace-pre-wrap font-serif leading-loose text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/30 p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm text-lg sm:text-xl">
              {processedContent}
            </div>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSlug]}>
              {processedContent}
            </ReactMarkdown>
          )}
        </article>

        {/* Ad Slot 2 */}
        <div className="my-16">
          <AdPlaceholder slot="Bottom of Article" />
        </div>

        {/* Related Tools Section */}
        {relatedTools.length > 0 && (
          <section className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">Try These Tools</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.slug}
                  to={`/tool/${tool.slug}`}
                  className="group p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-slate-950/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                    <DynamicIcon name={tool.icon} className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{tool.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{tool.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recent Posts Section */}
        <section className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">{t.blog.recentArticles}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs.filter(p => p.id !== post.id).slice(0, 2).map(recentPost => (
              <Link key={recentPost.id} to={`/blog/${recentPost.slug}`} className="group">
                <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                  <img 
                    src={recentPost.image} 
                    alt={recentPost.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
                  {recentPost.title}
                </h3>
              </Link>
            ))}
            {blogs.length <= 1 && (
              <div className="col-span-2 text-center py-12 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 dark:text-slate-500 font-medium">More articles coming soon!</p>
              </div>
            )}
          </div>
        </section>

        {/* Comment Section */}
        <CommentSection 
          targetId={post.id} 
          targetType="blog" 
          theme={{ 
            primary: 'blue-600', 
            bg: 'blue-50', 
            border: 'slate-100', 
            iconBg: 'bg-blue-50' 
          }} 
        />

        <footer className="mt-24 pt-16 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-900 dark:bg-slate-900/80 p-10 sm:p-16 rounded-[40px] text-center relative overflow-hidden border border-slate-800">
            <div className="absolute top-0 right-0 w-[50%] h-full opacity-10 pointer-events-none">
              <div className="absolute top-[-20%] right-[-10%] w-full h-full bg-blue-500 rounded-full blur-[100px]" />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-4xl font-black text-white mb-4 tracking-tight">{t.blog.newsletterTitle}</h3>
              <p className="text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">{t.blog.newsletterDesc}</p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder={t.blog.newsletterPlaceholder} 
                  className="flex-grow px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
                  required
                />
                <button 
                  type="submit" 
                  className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                  {t.blog.subscribe}
                </button>
              </form>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
};

export default BlogDetail;
