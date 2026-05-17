import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  UserCircle2, 
  Image as ImageIcon, 
  Maximize, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  MousePointer2
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import { TOOLS as ALL_TOOLS } from '../data/tools';
import DynamicIcon from '../components/LucideIcon';

const AI_TOOLS = ALL_TOOLS.filter(t => t.category === 'ai').map(tool => ({
  id: tool.id,
  name: tool.name.split(' - ')[0], // Get shorter name
  description: tool.shortDescription,
  icon: tool.icon,
  path: `/tools/${tool.slug}`,
  color: tool.slug === 'face-swap' ? 'from-blue-500 to-indigo-600' :
         tool.slug === 'bg-remover' ? 'from-purple-500 to-pink-600' :
         tool.slug === 'enhancer' ? 'from-emerald-500 to-teal-600' :
         'from-orange-500 to-red-600',
  badge: tool.slug === 'face-swap' ? 'Popular' : 
         tool.slug === 'bg-remover' ? 'New' : 
         tool.slug === 'enhancer' ? 'Free' : 'Fast'
}));

const AITools = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-blue-500/30 transition-colors duration-300">
      <Helmet>
        <title>AI Tools Hub - Free Online AI Image Processing | Texly</title>
        <meta name="description" content="Explore Texly's suite of free AI tools. Face swap, background removal, image enhancement, and smart compression. Professional-grade AI processing at your fingertips." />
        <meta name="keywords" content="ai tools, free ai image tools, face swap online, background remover, image enhancer, image compressor, texly ai" />
        <link rel="canonical" href="https://texly.online/ai-tools" />
        <meta property="og:title" content="AI Tools Hub - Free Online AI Image Processing | Texly" />
        <meta property="og:description" content="Professional-grade AI image processing tools. 100% free and secure." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://texly.online/ai-tools" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "AI Tools Hub",
            "description": "A collection of professional AI image processing tools.",
            "url": "https://texly.online/ai-tools",
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": AI_TOOLS.map((tool, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": tool.name,
                "url": `https://texly.online${tool.path}`
              }))
            }
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] rounded-full opacity-50 pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/5 dark:bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-8">
              <Sparkles className="w-4 h-4" />
              Next-Gen AI Platform
            </span>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-8 bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              Powerful AI Tools. <br />
              <span className="text-blue-600 dark:text-blue-500">100% Free.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
              Experience professional-grade AI image processing tools running locally on our servers. No subscriptions, no hidden costs, just pure open-source power.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-12 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {AI_TOOLS.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link 
                  to={tool.path}
                  className="group relative block h-full p-8 rounded-[2.5rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all duration-500 shadow-sm hover:shadow-xl dark:backdrop-blur-xl overflow-hidden"
                >
                  {/* Hover Glow */}
                  <div className={`absolute -inset-px bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                  
                  <div className="relative z-10 h-full flex flex-col">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-8 shadow-lg shadow-blue-500/10 group-hover:scale-110 transition-transform duration-500`}>
                      <DynamicIcon name={tool.icon} className="w-7 h-7 text-white" />
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {tool.name}
                      </h3>
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {tool.badge}
                      </span>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow font-medium">
                      {tool.description}
                    </p>

                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-black group-hover:gap-4 transition-all">
                      <span>Use Tool</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-500" />
              </div>
              <h4 className="text-xl font-black mb-4">Privacy First</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                Your images are processed locally and never stored on our servers permanently. We value your data privacy.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-purple-600 dark:text-purple-500" />
              </div>
              <h4 className="text-xl font-black mb-4">Blazing Fast</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                Optimized CPU-based processing ensures quick results without the need for expensive GPU infrastructure.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <MousePointer2 className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
              </div>
              <h4 className="text-xl font-black mb-4">No Login Required</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                Start using our AI tools immediately. No account creation, no credit cards, no hassle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 pb-32">
        <div className="max-w-4xl mx-auto px-4">
          <div className="p-12 rounded-[3rem] bg-gradient-to-br from-blue-600 to-indigo-700 text-center relative overflow-hidden shadow-2xl shadow-blue-600/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-6 text-white">Ready to transform your images?</h2>
              <p className="text-blue-100 mb-10 text-lg font-medium">
                Join thousands of users using Texly's free AI tools every day.
              </p>
              <Link 
                to="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl"
              >
                Explore All Tools
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AITools;
