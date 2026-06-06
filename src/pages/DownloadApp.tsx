/**
 * DownloadApp.tsx
 * ================
 * Texly Android App — Full SEO Download Page
 * High CTR Title + Meta + FAQ + Steps + Schema.org JSON-LD
 */

import React, { useState } from 'react';
import SEO from '../components/SEO';
import { BASE_URL } from '../config';

// ─── 🔴 CHANGE THIS to your actual GitHub APK link ────────────────────────────
const APK_URL = 'https://github.com/chillforai-droid/TexlyApp/releases/download/v1.0.0/texly.apk';
const APK_VERSION = '1.0.0';
const APK_SIZE = '14.9 MB';
const APK_UPDATED = 'June 2025';
const APK_MIN_ANDROID = '6.0';
const SITE_URL = 'https://www.texlyonline.in';

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: 'Is the Texly App free to download?',
    a: 'Yes! Texly App is 100% free to download and use. No subscription, no hidden charges, no sign-up required. All 100+ tools are completely free.',
  },
  {
    q: 'Why do I need to enable "Unknown Sources" or "Install Unknown Apps"?',
    a: 'Since Texly APK is not on Google Play Store yet, Android requires you to allow installation from sources outside the Play Store. This is a one-time permission you can disable after installation. The app is safe and virus-free.',
  },
  {
    q: 'Is the Texly APK safe? Does it contain viruses?',
    a: 'Absolutely safe! The APK is built from our open-source codebase and does not contain any malware, spyware, or viruses. It does not access your contacts, SMS, or personal data.',
  },
  {
    q: 'What Android version is required?',
    a: `Texly App requires Android ${APK_MIN_ANDROID} (Marshmallow) or higher. This covers almost all Android phones made after 2015.`,
  },
  {
    q: 'Can I use the app without internet?',
    a: 'Most text tools (Word Counter, Case Converter, Text Cleaner etc.) work fully offline. AI-powered tools require an internet connection since they use cloud-based AI models.',
  },
  {
    q: 'How do I update the app when a new version releases?',
    a: 'Simply download the latest APK from this page and install it. Android will automatically update the existing app without removing your data.',
  },
  {
    q: 'Will Texly be available on Google Play Store?',
    a: 'Yes! We are working on publishing Texly on Google Play Store. Until then, you can download the APK directly from this page for free.',
  },
  {
    q: 'The app is not installing — what should I do?',
    a: 'Check that: (1) You have enabled "Install Unknown Apps" in Settings, (2) You have enough storage space, (3) Your Android version is 6.0 or above. If the issue persists, try re-downloading the APK.',
  },
];

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🔤', title: '100+ Free Tools', desc: 'Word counter, case converter, text cleaner, fancy text, and more — all free.' },
  { icon: '🤖', title: 'AI-Powered', desc: 'Built-in Texly AI Assistant that guides you, suggests tools, and answers questions.' },
  { icon: '📶', title: 'Works Offline', desc: 'Core text tools work without internet. Use anytime, anywhere.' },
  { icon: '🖼️', title: 'Image Tools', desc: 'Background remover, image compressor, face swap, image enhancer — all in one app.' },
  { icon: '📄', title: 'PDF Tools', desc: 'Merge, split, compress PDFs right from your Android phone.' },
  { icon: '⚡', title: 'Blazing Fast', desc: 'Lightweight app — just ' + APK_SIZE + '. No bloat, no lag, instant load.' },
  { icon: '🌙', title: 'Dark Mode', desc: 'Full dark mode support for comfortable use at night.' },
  { icon: '🔒', title: 'Privacy First', desc: 'No account needed. No data collection. Your files stay on your device.' },
];

// ─── Steps to install ─────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    title: 'Download the APK',
    desc: 'Tap the green "Download APK" button on this page. The file will download to your phone\'s Downloads folder.',
    icon: '⬇️',
  },
  {
    num: '02',
    title: 'Allow Unknown Sources',
    desc: 'Go to Settings → Security (or Apps & Notifications) → Special App Access → Install Unknown Apps → Select your browser → Toggle ON.',
    icon: '⚙️',
    isSettings: true,
  },
  {
    num: '03',
    title: 'Open the APK File',
    desc: 'Open your notification panel or Files/Downloads app. Tap on "texly.apk" to begin installation.',
    icon: '📂',
  },
  {
    num: '04',
    title: 'Tap "Install"',
    desc: 'Android will show an installation screen. Tap "Install" and wait a few seconds. Done! 🎉',
    icon: '✅',
  },
];

// ─── Phone-specific settings guide ───────────────────────────────────────────
const PHONE_SETTINGS = [
  {
    brand: 'Samsung',
    icon: '📱',
    color: '#1428A0',
    bg: '#EEF2FF',
    steps: 'Settings → Apps → Special Access → Install Unknown Apps → Select browser → Allow',
  },
  {
    brand: 'Xiaomi / Redmi',
    icon: '📲',
    color: '#FF6900',
    bg: '#FFF3E8',
    steps: 'Settings → Privacy Protection → Special Permissions → Install Unknown Apps → Enable for browser',
  },
  {
    brand: 'OnePlus',
    icon: '🔴',
    color: '#F5010C',
    bg: '#FFF0F0',
    steps: 'Settings → Security → Install Unknown Apps → Select your browser → Allow',
  },
  {
    brand: 'Realme / OPPO',
    icon: '🟡',
    color: '#FFD700',
    bg: '#FFFDE8',
    steps: 'Settings → Additional Settings → Privacy → Install Apps from External Sources → Enable',
  },
  {
    brand: 'Vivo',
    icon: '🔵',
    color: '#415FFF',
    bg: '#EEF0FF',
    steps: 'Settings → Security → Permission to Install External Sources → Turn ON',
  },
  {
    brand: 'Google Pixel',
    icon: '🌈',
    color: '#4285F4',
    bg: '#EAF1FB',
    steps: 'Settings → Apps → Special app access → Install unknown apps → Chrome → Allow',
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DownloadApp() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(APK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // JSON-LD Schema for SEO
  const schemaJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Texly — Free Online Tools App',
        operatingSystem: 'Android',
        applicationCategory: 'UtilitiesApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          'Texly Android App — 100+ free online tools including AI tools, text tools, image tools, and PDF tools. Download the free APK now.',
        softwareVersion: APK_VERSION,
        fileSize: APK_SIZE,
        downloadUrl: APK_URL,
        url: `${SITE_URL}/download`,
        publisher: {
          '@type': 'Organization',
          name: 'Texly',
          url: SITE_URL,
        },
        screenshot: `${SITE_URL}/og-image.png`,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '120',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Download App', item: `${SITE_URL}/download` },
        ],
      },
    ],
  });

  return (
    <>
      {/* ─── SEO ─────────────────────────────────────────────────────────── */}
      <SEO
        title="Download Texly App Free — 100+ AI & Text Tools for Android (APK)"
        description="Download Texly Android App for free! Get 100+ free tools — AI tools, text tools, image compressor, PDF tools & more. Lightweight 12MB APK. No Play Store needed. Safe & virus-free."
        canonical={`${SITE_URL}/download`}
        ogType="website"
        keywords={[
          'texly app download',
          'texly apk download',
          'free text tools android app',
          'ai tools app android',
          'online tools app free download',
          'pdf tools android',
          'image tools android apk',
          'texly android app',
          'free apk download',
          'text utility app android',
        ]}
      />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: schemaJsonLd }}
      />

      <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white">

        {/* ─── HERO ──────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-green-950 to-emerald-950 pt-16 pb-20 px-4">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-green-400/10 rounded-full blur-3xl" />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Free Download · No Sign-up Required
            </div>

            {/* App Icon */}
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-[28px] flex items-center justify-center text-5xl mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
              ⚡
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
              Download <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Texly App</span><br />
              <span className="text-3xl md:text-4xl font-bold text-slate-300">Free for Android</span>
            </h1>

            <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              100+ free tools in one app — AI tools, text tools, image compressor, PDF tools & more.
              Lightweight, offline-capable, completely free. No Play Store needed.
            </p>

            {/* App info pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              {[
                { label: 'Version', val: APK_VERSION },
                { label: 'Size', val: APK_SIZE },
                { label: 'Android', val: `${APK_MIN_ANDROID}+` },
                { label: 'Updated', val: APK_UPDATED },
                { label: 'Price', val: 'Free' },
                { label: 'Rating', val: '⭐ 4.8' },
              ].map((pill) => (
                <div key={pill.label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                  <span className="text-xs text-slate-400">{pill.label}:</span>
                  <span className="text-sm font-bold text-white">{pill.val}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={APK_URL}
                download
                className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/40"
              >
                <span className="text-2xl">⬇️</span>
                Download Free APK ({APK_SIZE})
              </a>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-4 rounded-2xl transition-all"
              >
                {copied ? '✅ Copied!' : '🔗 Copy Link'}
              </button>
            </div>

            <p className="text-xs text-slate-500 mt-4">
              ✅ 100% Safe · No Virus · No Malware · No Hidden Charges
            </p>
          </div>
        </section>

        {/* ─── FEATURES ──────────────────────────────────────────────────── */}
        <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-3">
              Everything You Need,<br />
              <span className="text-green-600 dark:text-green-400">In One Free App</span>
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-10 max-w-xl mx-auto">
              No more switching between 10 different apps and websites. Texly has it all.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg hover:shadow-green-100 dark:hover:shadow-green-900/20 transition-all group"
                >
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <div className="font-bold text-sm mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{f.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── INSTALL STEPS ─────────────────────────────────────────────── */}
        <section className="py-16 px-4" id="how-to-install">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-3">
              How to Install Texly APK
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-10">
              Simple 4-step process. Takes less than 2 minutes.
            </p>

            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <div
                  key={step.num}
                  className="flex gap-5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-green-300 dark:hover:border-green-700 transition-all"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-200 dark:shadow-emerald-900">
                    {step.num}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{step.icon}</span>
                      <span className="font-bold text-base">{step.title}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                    {step.isSettings && (
                      <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                        💡 <strong>Tip:</strong> See phone-specific guide below ↓
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Download again CTA */}
            <div className="text-center mt-10">
              <a
                href={APK_URL}
                download
                className="inline-flex items-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black text-base px-8 py-4 rounded-2xl shadow-lg transition-all hover:-translate-y-0.5"
              >
                ⬇️ Download Texly APK Free
              </a>
            </div>
          </div>
        </section>

        {/* ─── PHONE SETTINGS ────────────────────────────────────────────── */}
        <section className="py-16 px-4 bg-slate-50 dark:bg-slate-900/50" id="phone-settings">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-3">
              Phone-Specific Settings Guide
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-10">
              Enable "Install Unknown Apps" on your Android phone:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PHONE_SETTINGS.map((phone) => (
                <div
                  key={phone.brand}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{phone.icon}</span>
                    <span className="font-black text-base">{phone.brand}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono leading-relaxed border border-slate-200 dark:border-slate-700">
                    {phone.steps}
                  </div>
                </div>
              ))}
            </div>

            {/* Safety note */}
            <div className="mt-8 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-6">
              <div className="flex gap-3">
                <span className="text-2xl flex-shrink-0">🔒</span>
                <div>
                  <div className="font-bold text-green-800 dark:text-green-300 mb-1">Your Phone is Safe</div>
                  <p className="text-sm text-green-700 dark:text-green-400 leading-relaxed">
                    Enabling "Unknown Sources" is safe for trusted apps like Texly. We recommend
                    turning it back OFF after installation for extra security. Texly APK does not
                    request access to your contacts, SMS, call logs, or personal data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FAQ ───────────────────────────────────────────────────────── */}
        <section className="py-16 px-4" id="faq">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-center mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-10">
              Everything you need to know about Texly App
            </p>

            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:border-green-300 dark:hover:border-green-700 transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-bold text-sm hover:text-green-600 dark:hover:text-green-400 transition-colors"
                    aria-expanded={openFaq === i}
                  >
                    <span>{faq.q}</span>
                    <span className={`flex-shrink-0 text-lg transition-transform duration-200 ${openFaq === i ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: openFaq === i ? '300px' : '0px' }}
                  >
                    <p className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── BOTTOM CTA ────────────────────────────────────────────────── */}
        <section className="py-16 px-4 bg-gradient-to-br from-green-600 to-emerald-700">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-5xl mb-4">📱</div>
            <h2 className="text-3xl font-black text-white mb-3">
              Ready to Download?
            </h2>
            <p className="text-green-100 mb-8 leading-relaxed">
              Join thousands of users who use Texly daily — on desktop and mobile.
              Free forever. No ads. No sign-up.
            </p>
            <a
              href={APK_URL}
              download
              className="inline-flex items-center gap-3 bg-white text-green-700 font-black text-lg px-8 py-4 rounded-2xl shadow-2xl hover:bg-green-50 transition-all hover:-translate-y-1"
            >
              ⬇️ Download Texly APK Free ({APK_SIZE})
            </a>
            <p className="text-green-200 text-xs mt-4">
              Version {APK_VERSION} · Android {APK_MIN_ANDROID}+ · Updated {APK_UPDATED}
            </p>
          </div>
        </section>

      </div>
    </>
  );
}
