import React, { useEffect } from 'react';
import { Zap, Shield, Heart, Users, Globe, Award, Mail, CheckCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const AboutUs = () => {
  useEffect(() => {
    document.title = 'About Us - Texly | Free Online Text & Image Tools';
  }, []);

  return (
    <>
      <Helmet>
        <meta name="description" content="Learn about Texly — the free, fast, and privacy-focused platform with 50+ text tools, PDF tools, and AI-powered utilities. No signup required." />
        <link rel="canonical" href="https://www.texlyonline.in/about-us" />
      </Helmet>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <article className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">About Texly</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Texly is a free, fast, and privacy-focused collection of online tools for text processing, 
            PDF management, image editing, and AI-powered content generation — all in one place, 
            available to anyone without any signup or subscription.
          </p>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-300">
              We believe powerful tools should be accessible to everyone — for free, without sign-ups, 
              without subscriptions, and without your data ever leaving your browser. Texly was built 
              for students, writers, developers, designers, content creators, and anyone who works 
              with text and images on a daily basis.
            </p>
            <p className="text-slate-600 dark:text-slate-300">
              With over <strong>50+ free tools</strong> covering everything from basic text formatting 
              to AI-powered content enhancement and PDF management, Texly is your one-stop platform 
              for everyday productivity.
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10 not-prose">
            {[
              { icon: Zap, color: 'blue', title: 'Lightning Fast', desc: 'Most tools run entirely in your browser — no waiting for server responses. Instant results, always.' },
              { icon: Shield, color: 'emerald', title: 'Privacy First', desc: 'Your text never leaves your device. We process everything client-side wherever possible, keeping your data safe.' },
              { icon: Users, color: 'purple', title: 'Built for Everyone', desc: 'No account required. No premium paywalls. Every single tool is 100% free for every user, forever.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm`}>
                <div className={`w-12 h-12 bg-${color}-50 dark:bg-${color}-900/30 text-${color}-600 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">What We Offer</h2>
            <p className="text-slate-600 dark:text-slate-300">Texly provides tools across 6 major categories:</p>
            <ul className="text-slate-600 dark:text-slate-300 space-y-2 mt-4">
              <li><strong>Text Tools:</strong> Case conversion, whitespace removal, word count, character count, duplicate line removal, and 30+ more text utilities for writers, developers, and content professionals.</li>
              <li><strong>PDF Tools:</strong> Merge PDFs, split PDFs, compress PDFs, convert PDF to text, rotate pages — all running securely in your browser without uploading to third-party servers.</li>
              <li><strong>Image Tools:</strong> Background remover, image compressor, image enhancer, upscaler, face swap, and AI-powered image generation for designers and content creators.</li>
              <li><strong>AI Tools:</strong> AI-powered text processing using advanced language models — from text humanization and grammar fixing to creative rewrites and professional formatting.</li>
              <li><strong>Code & Developer Tools:</strong> JSON formatter, Base64 encoder/decoder, URL encoder, JWT decoder, SQL formatter, and more tools loved by developers worldwide.</li>
              <li><strong>Generator Tools:</strong> QR code generator, password generator, Lorem Ipsum generator, color palette generator, and unique content creation utilities.</li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Why Users Trust Texly</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 not-prose">
              {[
                { icon: CheckCircle, text: 'No account or signup required — ever' },
                { icon: CheckCircle, text: 'All tools are completely free to use' },
                { icon: CheckCircle, text: 'Text processing happens in your browser' },
                { icon: CheckCircle, text: 'No ads that interrupt your workflow' },
                { icon: CheckCircle, text: 'Works on all devices — mobile & desktop' },
                { icon: CheckCircle, text: 'Available in multiple languages' },
                { icon: CheckCircle, text: 'New tools added regularly based on feedback' },
                { icon: CheckCircle, text: 'Fast, lightweight, and always available' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/40">
                  <Icon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{text}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Our Story</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Texly was created out of a simple frustration: having to visit dozens of different websites 
              to perform basic text operations. Each site had pop-ups, paywalls, forced signups, or slow 
              servers that wasted valuable time. We decided to build the solution we always wanted — 
              a single, beautiful, fast platform where every tool just works.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              Since our launch, Texly has helped hundreds of thousands of users across the globe — 
              from students cleaning up copied text, to developers formatting JSON, to marketers 
              creating fancy social media content. We're constantly adding new tools and improving 
              existing ones based on user feedback.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">How We're Funded</h2>
            <p className="text-slate-600 dark:text-slate-300">
              Texly is free for all users and will remain free. We sustain operations through 
              non-intrusive advertising via <strong>Google AdSense</strong>. These ads help us cover 
              server costs, development time, and continuous improvement of the platform. We are 
              committed to keeping ads minimal and non-disruptive to your workflow.
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-4">
              We do not sell your personal data. We do not track the text you enter into our tools. 
              Our business model is simple: provide valuable free tools, earn a small amount through 
              ads, and reinvest in making the platform better.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Get In Touch</h2>
            <p className="text-slate-600 dark:text-slate-300">
              We love hearing from our users! Whether you have a feature request, found a bug, 
              or just want to say hello — we'd love to hear from you.
            </p>
            <div className="mt-6 not-prose">
              <a
                href="/contact-us"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </a>
            </div>
          </section>
        </article>
      </div>
    </>
  );
};

export default AboutUs;
