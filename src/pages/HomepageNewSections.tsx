import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Zap, CheckCircle2,
  Globe, Cpu, FileText, Sparkles,
  Lock, Target, Award, ChevronDown, ChevronUp,
  BookOpen, Code2, TrendingUp, RefreshCw, Search,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   1. RECENTLY ADDED TOOLS
───────────────────────────────────────────────────────────────── */
export const RecentlyAddedTools = () => (
  <section className="mb-10 sm:mb-16 pt-6 sm:pt-10 border-t border-slate-100 dark:border-slate-800/60">
    <div className="flex items-center justify-between mb-6">
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-widest mb-2">
          <Sparkles className="w-3 h-3" /> Just Launched
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Recently Added Tools</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Brand-new tools added to the Texly collection</p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { name: 'Cron Expression Generator', slug: '/tools/cron-expression-generator', desc: 'Build cron schedules visually with human-readable explanations and 14 presets.', badge: 'Developer' },
        { name: 'JSON Path Finder', slug: '/tools/json-path-finder', desc: 'Interactive JSON tree viewer — click any value to copy its JSONPath instantly.', badge: 'Developer' },
        { name: 'AI Regex Explainer', slug: '/tools/regex-explainer', desc: 'Token-by-token regex breakdown in plain English with live match highlighting.', badge: 'AI' },
        { name: 'Robots.txt Tester', slug: '/tools/robots-txt-tester', desc: 'Test URLs against robots.txt rules and see if Googlebot is allowed or blocked.', badge: 'SEO' },
        { name: 'Redirect Chain Checker', slug: '/tools/redirect-chain-checker', desc: 'Trace full redirect paths, detect loops and check 301/302 HTTP status codes.', badge: 'SEO' },
        { name: 'Snapchat Tag Generator', slug: '/tools/snapchat-tag-generator', desc: 'Generate trending Snapchat-style hashtags for maximum reach and engagement.', badge: 'Social' },
      ].map(tool => (
        <Link key={tool.slug} to={tool.slug}
          className="group flex items-start gap-4 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg transition-all duration-200">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">New</span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest">{tool.badge}</span>
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug mb-1">{tool.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{tool.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────
   2. MOST USED AI TOOLS
───────────────────────────────────────────────────────────────── */
export const MostUsedAITools = () => (
  <section className="mb-10 sm:mb-16">
    <div className="flex items-center justify-between mb-6">
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-[10px] font-black uppercase tracking-widest mb-2">
          <Cpu className="w-3 h-3" /> Powered by AI
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Most Used AI Tools</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Our most popular AI-powered tools — free, instant, no signup</p>
      </div>
      <Link to="/ai-tools" className="flex items-center gap-1 text-xs font-black text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors uppercase tracking-wide">
        All AI Tools <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {[
        { name: 'AI Image Generator', slug: '/tools/image-generator', desc: 'Create stunning images from text prompts using AI.' },
        { name: 'AI Background Remover', slug: '/tools/bg-remover', desc: 'Remove image backgrounds instantly — no Photoshop needed.' },
        { name: 'AI Face Swap', slug: '/tools/face-swap', desc: 'Swap faces in photos realistically with one click.' },
        { name: 'AI Text Suite', slug: '/tools/ai-text-suite', desc: 'Rewrite, summarize, humanize and paraphrase text with AI.' },
        { name: 'AI Image Enhancer', slug: '/tools/enhancer', desc: 'Boost photo quality and sharpness using AI enhancement.' },
        { name: 'AI Image Compressor', slug: '/tools/compressor', desc: 'Reduce image file size without visible quality loss.' },
        { name: 'Image Upscaler AI', slug: '/tools/image-upscale', desc: 'Enlarge low-res images to high resolution using AI.' },
        { name: 'AI Regex Explainer', slug: '/tools/regex-explainer', desc: 'Understand any regex pattern in plain English instantly.' },
      ].map(tool => (
        <Link key={tool.slug} to={tool.slug}
          className="group p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700/60 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Cpu className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors leading-snug mb-1">{tool.name}</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{tool.desc}</p>
        </Link>
      ))}
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────
   3. MOST USED SEO TOOLS
───────────────────────────────────────────────────────────────── */
export const MostUsedSEOTools = () => (
  <section className="mb-10 sm:mb-16">
    <div className="flex items-center justify-between mb-6">
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-[10px] font-black uppercase tracking-widest mb-2">
          <TrendingUp className="w-3 h-3" /> SEO & Dev
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Most Used SEO Tools</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Free SEO and developer tools used by thousands of professionals</p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { name: 'Redirect Chain Checker', slug: '/tools/redirect-chain-checker', desc: 'Instantly trace redirect chains, detect loops, and verify 301/302 HTTP status codes for SEO audits.', badge: 'Technical SEO' },
        { name: 'Robots.txt Tester', slug: '/tools/robots-txt-tester', desc: 'Test any URL against your robots.txt rules to verify Googlebot crawl access and indexability.', badge: 'Crawl Audit' },
        { name: 'Slug Generator', slug: '/tools/text-converter-hub?tool=slug-generator', desc: 'Generate clean, SEO-friendly URL slugs from any title or heading in one click.', badge: 'On-Page SEO' },
        { name: 'Word Counter', slug: '/tools/text-analysis-hub?tool=word-counter', desc: 'Count words, characters, sentences, paragraphs and estimated reading time for SEO content planning.', badge: 'Content' },
        { name: 'Find and Replace', slug: '/tools/text-converter-hub?tool=find-replace', desc: 'Bulk find and replace text across large content — perfect for updating meta descriptions or anchor text.', badge: 'Content' },
        { name: 'Remove HTML Tags', slug: '/tools/text-cleaning-hub?tool=remove-html-tags', desc: 'Strip all HTML tags from content to get clean plain text — ideal for CMS migrations and audits.', badge: 'Technical' },
      ].map(tool => (
        <Link key={tool.slug} to={tool.slug}
          className="group flex flex-col p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60 hover:shadow-lg transition-all duration-200">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Search className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">{tool.name}</h3>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{tool.badge}</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tool.desc}</p>
          <div className="mt-3 flex items-center gap-1 text-[11px] font-black text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Open Free Tool <ArrowRight className="w-3 h-3" />
          </div>
        </Link>
      ))}
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────
   4. MOST USED TEXT TOOLS
───────────────────────────────────────────────────────────────── */
export const MostUsedTextTools = () => (
  <section className="mb-10 sm:mb-16">
    <div className="flex items-center justify-between mb-6">
      <div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-widest mb-2">
          <FileText className="w-3 h-3" /> Text Tools
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Most Used Text Tools</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">The text tools our community uses most — every day, for free</p>
      </div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {[
        { name: 'Remove Extra Spaces', slug: '/tools/text-cleaning-hub?tool=remove-extra-spaces' },
        { name: 'Remove Duplicate Lines', slug: '/tools/text-cleaning-hub?tool=remove-duplicate-lines' },
        { name: 'Remove Line Breaks', slug: '/tools/text-cleaning-hub?tool=remove-line-breaks' },
        { name: 'Upper Case Converter', slug: '/tools/text-converter-hub?tool=upper-case' },
        { name: 'Lower Case Converter', slug: '/tools/text-converter-hub?tool=lower-case' },
        { name: 'Title Case Converter', slug: '/tools/text-converter-hub?tool=title-case' },
        { name: 'Word Counter', slug: '/tools/text-analysis-hub?tool=word-counter' },
        { name: 'Character Counter', slug: '/tools/text-analysis-hub?tool=character-counter' },
        { name: 'Text Reverser', slug: '/tools/text-utility-hub?tool=text-reverser' },
        { name: 'Text Repeater', slug: '/tools/text-utility-hub?tool=text-repeater' },
        { name: 'Sort Lines', slug: '/tools/text-utility-hub?tool=sort-lines' },
        { name: 'Remove Special Characters', slug: '/tools/text-cleaning-hub?tool=remove-special-characters' },
        { name: 'Remove HTML Tags', slug: '/tools/text-cleaning-hub?tool=remove-html-tags' },
        { name: 'Lorem Ipsum Generator', slug: '/tools/generators-hub?tool=lorem-ipsum' },
        { name: 'Reading Time Calculator', slug: '/tools/text-analysis-hub?tool=reading-time' },
      ].map(tool => (
        <Link key={tool.slug} to={tool.slug}
          className="group flex items-center gap-2 px-3.5 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/60 hover:shadow-md transition-all text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300">
          <FileText className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="leading-snug">{tool.name}</span>
        </Link>
      ))}
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────
   5. WHY CHOOSE TEXLY (expanded)
───────────────────────────────────────────────────────────────── */
export const WhyChooseTexlyExpanded = () => (
  <section className="mb-10 sm:mb-16 pt-6 sm:pt-10 border-t border-slate-100 dark:border-slate-800/60">
    <div className="text-center mb-8">
      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
        Why Choose Texly Instead of Other Online Tool Websites?
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
        There are hundreds of online tool websites. Here's what makes Texly genuinely different — not just in words, but in how every single tool is built.
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[
        { icon: <Shield className="w-5 h-5" />, bg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400', title: 'Privacy Built Into Every Tool', desc: "Most tool websites claim to be private but process everything on their servers. Texly is different — the majority of our tools run entirely inside your browser using JavaScript. Your text, your files, your data never travel to any server. Not ours, not anyone else's. What you type stays with you." },
        { icon: <Zap className="w-5 h-5" />, bg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400', title: 'No Signup. Ever.', desc: "We mean it. There's no free plan with hidden limits, no email capture form, no account required — for any tool. Open the tool, use it, leave. That's it. We believe your time is more valuable than our email list." },
        { icon: <Award className="w-5 h-5" />, bg: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400', title: '100+ Tools, One Platform', desc: "Instead of bookmarking 30 different websites for text tools, PDF tools, image tools, AI tools, and developer utilities — Texly puts everything in one clean, fast, mobile-friendly platform. Search for a tool in seconds and get to work." },
        { icon: <Cpu className="w-5 h-5" />, bg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400', title: 'Real AI, Not Just a Label', desc: "Our AI tools — background remover, image enhancer, face swap, AI text suite — use actual machine learning models, not simple filters or scripts. The results are genuinely high quality, and they're completely free. No watermarks, no limits." },
        { icon: <RefreshCw className="w-5 h-5" />, bg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400', title: 'New Tools Added Regularly', desc: "Texly is actively developed. We add new tools every month based on what users ask for. Our recent additions — Redirect Chain Checker, Robots.txt Tester, JSON Path Finder, Cron Expression Generator — all came from real user requests." },
        { icon: <Globe className="w-5 h-5" />, bg: 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400', title: 'Works on Any Device, Anywhere', desc: "Texly is fully responsive and optimized for every screen size — mobile phones, tablets, and desktops. Tools load fast even on slow connections. Our Android app is also available for offline access to all 100+ tools." },
      ].map(item => (
        <div key={item.title} className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
          <div className={`w-11 h-11 ${item.bg} rounded-xl flex items-center justify-center mb-4`}>{item.icon}</div>
          <h3 className="text-base font-black text-slate-900 dark:text-white mb-2">{item.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────
   6. WHO CAN USE TEXLY
───────────────────────────────────────────────────────────────── */
export const WhoCanUseTexly = () => (
  <section className="mb-10 sm:mb-16">
    <div className="text-center mb-8">
      <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">Who Can Use Texly?</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">
        Texly is built for everyone who works with text, images, code, or digital content. Here's how different people use Texly every day.
      </p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[
        { emoji: '🎓', title: 'Students', desc: 'Students use Texly to clean up copied research text, remove special characters from PDFs, count essay words, generate Lorem Ipsum for design projects, and convert numbers to words for assignments — all without installing anything.', tools: ['Word Counter', 'Remove Special Characters', 'Lorem Ipsum Generator'] },
        { emoji: '✍️', title: 'Bloggers & Content Writers', desc: 'Bloggers use Texly to clean pasted content from Google Docs, remove HTML tags from CMS exports, generate URL slugs from headlines, count characters for meta descriptions, and use the AI Text Suite to rewrite content faster.', tools: ['Slug Generator', 'Remove HTML Tags', 'AI Text Suite'] },
        { emoji: '💻', title: 'Developers & Programmers', desc: 'Developers use our JSON Path Finder, AI Regex Explainer, Cron Expression Generator, Binary to Text converter, and Base64 tools for daily coding tasks — all in one place, without switching between browser tabs.', tools: ['JSON Path Finder', 'Regex Explainer', 'Cron Generator'] },
        { emoji: '📈', title: 'SEO Experts', desc: "SEO professionals use Texly's Redirect Chain Checker and Robots.txt Tester for technical SEO audits, the Slug Generator for clean URLs, and our text tools to format, clean, and analyze page content efficiently.", tools: ['Redirect Chain Checker', 'Robots.txt Tester', 'Slug Generator'] },
        { emoji: '🏢', title: 'Business Owners', desc: 'Small business owners use Texly to generate QR codes for menus and print materials, compress images for websites, remove backgrounds from product photos, and merge PDF documents for professional presentations.', tools: ['QR Code Generator', 'Image Compressor', 'AI Background Remover'] },
        { emoji: '📱', title: 'Social Media Managers', desc: "Social media managers use Texly's Snapchat Tag Generator, Fancy Text Generator, Invisible Text tool, and WhatsApp Text Formatter to create eye-catching bios, posts, and captions that stand out on every platform.", tools: ['Fancy Text Generator', 'WhatsApp Formatter', 'Invisible Text'] },
      ].map(item => (
        <div key={item.title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-lg transition-shadow">
          <span className="text-4xl mb-4 block">{item.emoji}</span>
          <h3 className="text-base font-black text-slate-900 dark:text-white mb-3">{item.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{item.desc}</p>
          <div className="flex flex-wrap gap-1.5">
            {item.tools.map(t => (
              <span key={t} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{t}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────
   7. HOW TEXLY PROTECTS YOUR PRIVACY
───────────────────────────────────────────────────────────────── */
export const HowTexlyProtectsPrivacy = () => (
  <section className="mb-10 sm:mb-16 rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/40 border border-slate-200 dark:border-slate-800 p-6 sm:p-10">
    <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
      <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/25">
        <Lock className="w-7 h-7 text-white" />
      </div>
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">How Texly Protects Your Privacy</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-2xl">
          Privacy is not an afterthought at Texly — it's a core design principle baked into every tool we build. Here's exactly how we keep your data safe.
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {[
        { icon: <Globe className="w-4 h-4" />, color: 'emerald', title: 'Browser-Side Processing', desc: 'The vast majority of Texly tools — all text tools, most utility tools, and converter tools — run completely inside your browser using JavaScript. Your content is processed locally on your device and never transmitted to any server.' },
        { icon: <Shield className="w-4 h-4" />, color: 'blue', title: 'No Data Storage', desc: 'Texly does not store, log, or retain any text you enter into our tools. When you close the tab, your data is gone. We have no database of user-generated content — there is nothing to leak, breach, or sell.' },
        { icon: <CheckCircle2 className="w-4 h-4" />, color: 'violet', title: 'No Personal Data Collection', desc: 'We do not ask for your name, email address, or phone number to use any tool. We use standard anonymous analytics (page views, tool usage counts) to understand what to build next — no personally identifiable information.' },
        { icon: <Zap className="w-4 h-4" />, color: 'amber', title: 'AI Tool Privacy', desc: 'Our AI-powered tools do process content on our servers temporarily to produce results. However, this data is processed in real-time and immediately discarded — we do not retain AI inputs or outputs after your session ends.' },
        { icon: <Code2 className="w-4 h-4" />, color: 'teal', title: 'Open Source on GitHub', desc: "Texly's codebase is openly available on GitHub. Anyone can inspect how tools work, verify our privacy claims, and confirm that no hidden data collection exists. Transparency is the best privacy policy." },
        { icon: <Award className="w-4 h-4" />, color: 'rose', title: 'AdSense Ads, Not Your Data', desc: "We sustain Texly through minimal Google AdSense ads — not by selling user data. Ads are clearly labeled and non-intrusive. We chose advertising over data monetization because we believe your privacy has more value than ad revenue." },
      ].map(item => (
        <div key={item.title} className="flex items-start gap-4 p-4 bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/60">
          <div className={`w-9 h-9 rounded-xl bg-${item.color}-100 dark:bg-${item.color}-900/40 text-${item.color}-600 dark:text-${item.color}-400 flex items-center justify-center flex-shrink-0 mt-0.5`}>
            {item.icon}
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-1">{item.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────
   8. OUR MISSION
───────────────────────────────────────────────────────────────── */
export const OurMission = () => (
  <section className="mb-10 sm:mb-16">
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 p-6 sm:p-10 text-white">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/5 rounded-full" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full" />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-[10px] font-black uppercase tracking-widest mb-5">
          <Target className="w-3 h-3" /> Our Mission
        </div>
        <h2 className="text-3xl sm:text-4xl font-black mb-5 leading-tight">Free, Powerful Tools for Every Person on the Internet</h2>
        <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-5">
          Texly was founded on a simple belief: powerful digital tools shouldn't be locked behind paywalls, accounts, or subscriptions. The internet is most useful when its tools are open to everyone — students in rural areas, freelancers in developing economies, professionals who just need something that works without friction.
        </p>
        <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-8">
          Our mission is to build and maintain a growing library of free, fast, privacy-respecting tools that help people do their best work — whether that's writing better content, building better software, optimizing for search, processing images, or anything in between. Every tool we add, we ask: does this actually save someone real time? If yes, we build it and make it free.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[{ value: '100+', label: 'Free Tools Available' }, { value: '0', label: 'Accounts Required' }, { value: '100%', label: 'Privacy Focused' }].map(stat => (
            <div key={stat.label} className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-blue-200 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────
   9. EXPANDED FAQ (20 questions, accordion, schema export)
───────────────────────────────────────────────────────────────── */
export const FAQ_ITEMS = [
  { q: 'Are all Texly tools completely free to use?', a: 'Yes — every single tool on Texly is 100% free with no hidden charges, premium tiers, or usage limits. We sustain the platform through minimal, clearly labeled Google AdSense advertisements. You will never hit a paywall or be asked to upgrade.' },
  { q: 'Do I need to create an account or sign up to use Texly?', a: 'No account is ever required. You can use every tool on Texly — including all AI tools, PDF tools, image tools, and developer utilities — without creating an account, entering an email address, or sharing any personal information. Just open a tool and start immediately.' },
  { q: 'Is my data safe and private when I use Texly tools?', a: 'Absolutely. The large majority of Texly tools process your text entirely inside your browser using JavaScript — your content never leaves your device. For AI-powered tools that require server processing, your input is processed in real-time and immediately discarded. We do not store, log, or retain any user content.' },
  { q: 'How many tools does Texly offer?', a: 'Texly currently offers over 100 free tools across 7 major categories: AI Tools, Text Cleaning, Text Converter, Text Analysis, Text Utility, PDF Tools, Image Tools, and Generator Tools. We add new tools every month based on user feedback and trending needs.' },
  { q: 'Does Texly work on mobile phones and tablets?', a: 'Yes. Texly is fully responsive and optimized for all screen sizes — Android and iOS smartphones, tablets, and desktop computers. All tools are tested on mobile browsers. We also offer a free Texly Android App for those who prefer a native experience.' },
  { q: 'What types of AI tools does Texly offer?', a: 'Texly offers a growing suite of AI-powered tools including: AI Background Remover, AI Image Enhancer, AI Image Generator (text to image), AI Face Swap, AI Image Upscaler, AI Image Compressor, AI Text Suite (rewrite, summarize, humanize, paraphrase), and AI Regex Explainer. All are completely free.' },
  { q: 'What SEO tools are available on Texly?', a: 'Texly offers several powerful SEO and technical tools: Redirect Chain Checker (trace redirect paths, detect loops, verify status codes), Robots.txt Tester (verify crawl access for Googlebot), Slug Generator (SEO-friendly URLs), Word Counter (content length analysis), Remove HTML Tags (content extraction), and more being added regularly.' },
  { q: 'What developer tools can I find on Texly?', a: "Developers will find: JSON Path Finder, AI Regex Explainer, Cron Expression Generator, Binary to Text Converter, Text to Binary Converter, Sort Lines, Find & Replace, DevStudio (browser-based IDE with Monaco editor), and a GitHub File Push Tool. All are browser-based — no installation needed." },
  { q: 'Are Texly tools safe from viruses and malware?', a: 'Yes. Texly is a pure web application — there are no downloads, executable files, or browser extensions involved. All tools run inside your web browser. The codebase is open on GitHub for anyone to inspect. We do not inject scripts or run hidden background processes.' },
  { q: 'Can I use Texly tools for commercial projects?', a: 'Yes. All outputs generated by Texly tools are yours to use freely — for personal, academic, and commercial purposes. There are no watermarks on any output. The only exception would be AI-generated content, where you should review the terms of the underlying AI model used.' },
  { q: 'Does Texly offer PDF tools?', a: 'Yes. Texly includes a range of PDF tools such as PDF Merger, PDF Splitter, PDF Compressor, Image to PDF, and PDF to Image conversion. All PDF processing happens in your browser — your files are never uploaded to any external server.' },
  { q: 'What image tools are available on Texly?', a: 'Texly offers AI-powered image tools including: Background Remover, Image Enhancer, Image Compressor, Image Upscaler (AI), Face Swap, and Image Generator (text to image). These tools work directly in your browser with no downloads required and produce high-quality output at no cost.' },
  { q: 'How does the Texly AI Text Suite work?', a: 'The AI Text Suite is a 5-in-1 writing tool that lets you rewrite, paraphrase, summarize, humanize (make AI text sound natural), and improve any text using AI. It is powered by advanced language models and works completely free without any word limits or signup requirements.' },
  { q: 'How often are new tools added to Texly?', a: "We add new tools to Texly every month. Recent additions include the Cron Expression Generator, JSON Path Finder, AI Regex Explainer, Robots.txt Tester, and Redirect Chain Checker. If there's a tool you'd like to see, email us at texlyonline@gmail.com — many of our tools came directly from user suggestions." },
  { q: 'Can I suggest a tool I want Texly to build?', a: "Absolutely! We love user suggestions. Many of the tools we have built were requested by real users. Just email us at texlyonline@gmail.com with your idea and we will add it to our roadmap. We prioritize requests that help the most people." },
  { q: 'Does Texly show ads? Are they intrusive?', a: 'Texly does show minimal Google AdSense advertisements to cover server and development costs. We use standard display ads only — no pop-ups, no autoplaying video ads, no interstitials that block content. Ads are clearly labeled and placed so they never interfere with your tool usage.' },
  { q: 'Is there a Texly mobile app?', a: 'Yes! There is a free Texly Android App available for download that gives you access to all 100+ tools in a clean, fast native experience. It also works offline for many tools. You can find the download link in the website header or visit texlyonline.in/download.' },
  { q: 'What is DevStudio on Texly?', a: "DevStudio is Texly's browser-based code editor — think VS Code in your browser. It supports ZIP file upload, Monaco editor (the same editor used in VS Code), AI-assisted code editing, and direct file push to GitHub repositories. It's completely free and requires no installation." },
  { q: 'How is Texly different from other online tool websites?', a: 'Texly differs in three key ways: (1) Privacy-first — most tools run entirely in your browser with zero server-side data processing. (2) No signup, ever — not for basic tools, not for AI tools, not for anything. (3) Genuine quality — we build tools that actually work well, not just exist. We also actively maintain and update our tools based on user feedback rather than abandoning them after launch.' },
  { q: 'Who built Texly and who maintains it?', a: 'Texly was built by Mahendra Mirdha, an independent developer and SEO enthusiast based in India. It started as a personal project to solve the frustration of needing multiple websites for common digital tasks. Mahendra personally reads every user email (texlyonline@gmail.com) and maintains all tools. Texly is a solo indie project built with a genuine focus on quality and user experience.' },
];

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": FAQ_ITEMS.map(item => ({
    "@type": "Question",
    "name": item.q,
    "acceptedAnswer": { "@type": "Answer", "text": item.a },
  })),
};

export const ExpandedFAQ = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="mb-10 sm:mb-16 pt-6 sm:pt-10 border-t border-slate-100 dark:border-slate-800/60">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">Frequently Asked Questions</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xl mx-auto">Everything you need to know about Texly, our tools, privacy policy, and how we work.</p>
      </div>
      <div className="max-w-3xl mx-auto space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              aria-expanded={open === i}
            >
              <span className="text-sm font-black text-slate-900 dark:text-white leading-snug">{item.q}</span>
              <span className="flex-shrink-0 text-slate-400">
                {open === i ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            {open === i && (
              <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-4">{item.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

/* ─────────────────────────────────────────────────────────────────
   10. ABOUT TEXLY ONLINE (~1000 words SEO content)
───────────────────────────────────────────────────────────────── */
export const AboutTexlyOnline = () => (
  <section className="mb-10 sm:mb-16 pt-6 sm:pt-10 border-t border-slate-100 dark:border-slate-800/60">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
          <BookOpen className="w-3.5 h-3.5" /> About Texly Online
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">What Is Texly? Everything You Need to Know</h2>
      </div>
      <div className="space-y-5 text-sm text-slate-600 dark:text-slate-400 leading-[1.85]">
        <p><strong className="text-slate-900 dark:text-white">Texly Online</strong> is a free, all-in-one digital tools platform offering over 100 utilities for text processing, AI-powered image editing, SEO auditing, PDF management, developer tasks, and content generation — all accessible directly from your browser with no account required. Whether you need to clean up messy text, remove a background from an image, generate a cron expression, or analyze redirect chains on a website, Texly has a dedicated tool for it.</p>
        <p>The platform was created because accessing useful digital tools online had become unnecessarily complicated. Most tool websites require account creation, charge monthly fees, add watermarks to outputs, or bury their tools behind advertising-heavy interfaces designed to maximize clicks rather than help users. Texly was built as the antidote to all of that — a clean, fast, no-friction environment where every tool is free, every result is yours to keep, and your privacy is protected by design.</p>
        <h3 className="text-xl font-black text-slate-900 dark:text-white pt-4">How Texly Tools Work</h3>
        <p>The majority of Texly tools are built using client-side JavaScript — meaning all processing happens inside your browser on your own device. When you paste text into the Remove Extra Spaces tool or the Case Converter, that text is processed locally and never sent to any server. This approach is both faster (no network latency) and more private (no data transmission). For our AI-powered tools — like the Background Remover, Image Enhancer, and AI Text Suite — a temporary server call is required to run the machine learning models, but inputs are processed in real-time and never stored or logged after your session ends.</p>
        <h3 className="text-xl font-black text-slate-900 dark:text-white pt-4">AI Tools That Actually Deliver</h3>
        <p>Texly's <strong className="text-slate-800 dark:text-slate-200">free AI tools</strong> use real machine learning models — not basic filters or simple algorithms labeled as "AI." The <strong className="text-slate-800 dark:text-slate-200">AI Background Remover</strong> uses computer vision to detect and separate subjects from backgrounds with high accuracy. The <strong className="text-slate-800 dark:text-slate-200">AI Image Generator</strong> creates original artwork and graphics from text descriptions. The <strong className="text-slate-800 dark:text-slate-200">AI Text Suite</strong> lets you rewrite, paraphrase, summarize, and humanize text using advanced language models. The <strong className="text-slate-800 dark:text-slate-200">AI Regex Explainer</strong> breaks down complex regular expressions token by token in plain English with live match highlighting. All of these AI tools are free, with no watermarks and no usage caps.</p>
        <h3 className="text-xl font-black text-slate-900 dark:text-white pt-4">SEO Tools for Modern Professionals</h3>
        <p>Texly's <strong className="text-slate-800 dark:text-slate-200">free SEO tools</strong> are built for real technical SEO work. The <strong className="text-slate-800 dark:text-slate-200">Redirect Chain Checker</strong> lets you enter any URL and trace its full redirect path — identifying unnecessary hops, redirect loops, and incorrect status codes (301, 302, 307) that harm your crawl budget and link equity. The <strong className="text-slate-800 dark:text-slate-200">Robots.txt Tester</strong> validates your robots.txt rules and tells you whether Googlebot or any other crawler is allowed or blocked from crawling specific URLs. The <strong className="text-slate-800 dark:text-slate-200">Slug Generator</strong> creates clean, lowercase, hyphenated URL slugs from any title — essential for on-page SEO.</p>
        <h3 className="text-xl font-black text-slate-900 dark:text-white pt-4">Text Tools for Everyday Tasks</h3>
        <p>Texly's <strong className="text-slate-800 dark:text-slate-200">free text tools</strong> are the most widely used part of the platform. Tools like <strong className="text-slate-800 dark:text-slate-200">Remove Extra Spaces</strong>, <strong className="text-slate-800 dark:text-slate-200">Remove Duplicate Lines</strong>, <strong className="text-slate-800 dark:text-slate-200">Remove Line Breaks</strong>, <strong className="text-slate-800 dark:text-slate-200">Remove Special Characters</strong>, and <strong className="text-slate-800 dark:text-slate-200">Remove HTML Tags</strong> are used by writers, editors, developers, and students to clean up messy text from PDFs, CMS exports, spreadsheets, and copied web content. Converter tools like Upper Case, Lower Case, and Title Case converters handle formatting in seconds. Analysis tools like the Word Counter, Character Counter, and Reading Time Calculator help content creators optimize their work for search engines and audiences.</p>
        <h3 className="text-xl font-black text-slate-900 dark:text-white pt-4">Developer Utilities That Save Hours</h3>
        <p>For developers, Texly offers practical utilities that speed up daily workflows. The <strong className="text-slate-800 dark:text-slate-200">JSON Path Finder</strong> provides an interactive tree viewer where you can click any value and instantly copy its JSONPath expression. The <strong className="text-slate-800 dark:text-slate-200">Cron Expression Generator</strong> lets you build cron schedules visually and generates a human-readable explanation of exactly when the job will run. <strong className="text-slate-800 dark:text-slate-200">DevStudio</strong> — Texly's browser-based IDE — uses the Monaco editor (same as VS Code) and supports direct GitHub file pushes, all in a browser tab without any installation.</p>
        <h3 className="text-xl font-black text-slate-900 dark:text-white pt-4">For Students, Bloggers, Developers, and Marketers</h3>
        <p><strong className="text-slate-800 dark:text-slate-200">Students</strong> use Texly to clean up copied research text, remove formatting artifacts from PDFs, count essay words against assignment limits, and generate placeholder text for design projects. <strong className="text-slate-800 dark:text-slate-200">Bloggers and content writers</strong> rely on the AI Text Suite for faster content production, the Slug Generator for SEO-friendly URLs, and the Word Counter to hit optimal article lengths. <strong className="text-slate-800 dark:text-slate-200">Developers</strong> use the technical utilities daily. <strong className="text-slate-800 dark:text-slate-200">Digital marketers and SEO experts</strong> audit websites with the Redirect Checker and Robots.txt Tester. Texly is designed to serve every person who works with digital content — regardless of technical background or budget.</p>
        <h3 className="text-xl font-black text-slate-900 dark:text-white pt-4">Privacy First, Always</h3>
        <p>Texly does not sell your data, build advertising profiles, or track your tool usage in any personally identifiable way. We use standard anonymous analytics to understand which tools are most popular — nothing more. Most tools process your content entirely on your device. We sustain the platform through minimal Google AdSense ads, not through data monetization. This is a deliberate choice — we believe a free tool platform can be sustainable without compromising user privacy.</p>
        <p>Texly is actively developed and maintained by its founder, who personally reads and responds to every user email. If you have a feature suggestion, a bug report, or just want to share how you use Texly, reach out at <strong className="text-slate-800 dark:text-slate-200">texlyonline@gmail.com</strong>. Every tool on this platform exists because someone needed it — and that's the standard we hold ourselves to.</p>
      </div>
    </div>
  </section>
);

/* ─────────────────────────────────────────────────────────────────
   11. E-E-A-T SIGNALS
───────────────────────────────────────────────────────────────── */
export const EEATSignals = () => (
  <section className="mb-10 sm:mb-16">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">How Every Texly Tool Is Built</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">Every tool on Texly starts with a real user need. Before launch, each tool is:</p>
        <ul className="space-y-2">
          {['Tested manually on mobile, tablet, and desktop', 'Verified to produce accurate, consistent outputs', 'Reviewed for privacy — no unnecessary data transmission', 'Checked for accessibility and keyboard navigation', 'Documented with a clear description of what it does'].map(item => (
            <li key={item} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{item}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white">Our Update Policy</h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-3">Texly is actively maintained. We are committed to:</p>
        <ul className="space-y-2">
          {['Adding at least 2–4 new tools every month', 'Updating AI tools when better models become available', 'Fixing reported bugs within 48 hours of notification', 'Keeping all tool interfaces current with modern browsers', 'Never abandoning a tool after launch — every tool is maintained'].map(item => (
            <li key={item} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{item}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:col-span-2">
        <h3 className="text-base font-black text-slate-900 dark:text-white mb-5">Why Thousands of Tasks Are Processed on Texly Every Day</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { icon: <Shield className="w-5 h-5" />, label: 'No Signup Required', sub: 'Open and use instantly', color: 'emerald' },
            { icon: <Lock className="w-5 h-5" />, label: 'Privacy First', sub: 'Browser-side processing', color: 'blue' },
            { icon: <Zap className="w-5 h-5" />, label: 'Instant Results', sub: 'No wait times, no queues', color: 'amber' },
            { icon: <Globe className="w-5 h-5" />, label: 'Works Everywhere', sub: 'Mobile, tablet, desktop', color: 'violet' },
            { icon: <Award className="w-5 h-5" />, label: 'Actively Updated', sub: 'New tools every month', color: 'rose' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className={`w-10 h-10 bg-${item.color}-100 dark:bg-${item.color}-900/40 text-${item.color}-600 dark:text-${item.color}-400 rounded-xl flex items-center justify-center mb-3`}>
                {item.icon}
              </div>
              <div className="text-xs font-black text-slate-900 dark:text-white mb-1">{item.label}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
