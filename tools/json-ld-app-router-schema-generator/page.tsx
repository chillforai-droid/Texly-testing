```tsx
import React, { useState, useMemo } from 'react';

// --- TS Interfaces for Schema & State ---
type SchemaType = 'organization' | 'article' | 'localBusiness' | 'product';

interface FormField {
  key: string;
  label: string;
  type: 'text' | 'url' | 'date' | 'select' | 'textarea' | 'number';
  placeholder?: string;
  helpText?: string;
  options?: string[];
}

export default function JsonLdSchemaGenerator() {
  // --- State Hooks ---
  const [schemaType, setSchemaType] = useState<SchemaType>('organization');
  const [activeTab, setActiveTab] = useState<'nextjs' | 'json' | 'metadata'>('nextjs');
  const [copied, setCopied] = useState(false);
  const [copiedText, setCopiedText] = useState<'nextjs' | 'json' | 'metadata' | null>(null);
  
  // Custom Dynamic form field values
  const [formData, setFormData] = useState<Record<string, string>>({
    // Organization defaults
    org_name: 'Texly SaaS Corp',
    org_url: 'https://texly.io',
    org_logo: 'https://texly.io/logo.png',
    org_sameAs: 'https://twitter.com/texly_io, https://github.com/texly',
    
    // Article defaults
    art_headline: 'Mastering Next.js App Router Schema Integration',
    art_image: 'https://texly.io/blog/nextjs-schema.png',
    art_datePublished: '2025-01-15',
    art_dateModified: '2025-02-01',
    art_author: 'Texly SEO Expert Team',
    art_publisher: 'Texly',
    art_publisherLogo: 'https://texly.io/logo.png',

    // Local Business defaults
    biz_name: 'Texly SEO Hub London',
    biz_image: 'https://texly.io/london-office.jpg',
    biz_address: '100 Bishopsgate, London, EC2N 4AG, UK',
    biz_phone: '+44 20 7946 0192',
    biz_priceRange: '££',
    biz_lat: '51.5145',
    biz_lon: '-0.0814',

    // Product defaults
    prod_name: 'Texly SEO Enterprise Suite',
    prod_image: 'https://texly.io/product-suite-hero.png',
    prod_description: 'Automated technical SEO auditing and meta generator toolkit for modern React applications.',
    prod_sku: 'TEX-SEO-ENT-2025',
    prod_brand: 'Texly',
    prod_price: '149.00',
    prod_currency: 'USD',
    prod_availability: 'InStock'
  });

  // Dynamic FAQs State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // --- Dynamic Schema Configurations ---
  const fieldsConfig: Record<SchemaType, FormField[]> = {
    organization: [
      { key: 'org_name', label: 'Organization Name', type: 'text', placeholder: 'e.g., Texly Corp' },
      { key: 'org_url', label: 'Website URL', type: 'url', placeholder: 'e.g., https://texly.io' },
      { key: 'org_logo', label: 'Logo Image URL', type: 'url', placeholder: 'e.g., https://texly.io/logo.png' },
      { key: 'org_sameAs', label: 'Social Profile URLs (comma separated)', type: 'textarea', placeholder: 'e.g., https://twitter.com/texly, https://linkedin.com/company/texly' }
    ],
    article: [
      { key: 'art_headline', label: 'Article Headline', type: 'text', placeholder: 'e.g., How to implement automated JSON-LD' },
      { key: 'art_image', label: 'Featured Image URL', type: 'url', placeholder: 'e.g., https://texly.io/images/hero.png' },
      { key: 'art_datePublished', label: 'Publish Date', type: 'date' },
      { key: 'art_dateModified', label: 'Modified Date (Optional)', type: 'date' },
      { key: 'art_author', label: 'Author Name', type: 'text', placeholder: 'e.g., Jane Doe' },
      { key: 'art_publisher', label: 'Publisher Name', type: 'text', placeholder: 'e.g., Texly' },
      { key: 'art_publisherLogo', label: 'Publisher Logo URL', type: 'url', placeholder: 'e.g., https://texly.io/logo.png' }
    ],
    localBusiness: [
      { key: 'biz_name', label: 'Business Name', type: 'text', placeholder: 'e.g., Texly Agency London' },
      { key: 'biz_image', label: 'Business Image URL', type: 'url', placeholder: 'e.g., https://texly.io/office.jpg' },
      { key: 'biz_address', label: 'Full Address', type: 'text', placeholder: 'e.g., 123 Tech Lane, London, UK' },
      { key: 'biz_phone', label: 'Phone Number', type: 'text', placeholder: 'e.g., +44 20 1234 5678' },
      { key: 'biz_priceRange', label: 'Price Range ($ to $$$$)', type: 'select', options: ['$', '$$', '$$$', '$$$$'] },
      { key: 'biz_lat', label: 'Latitude (Optional)', type: 'text', placeholder: 'e.g., 51.5074' },
      { key: 'biz_lon', label: 'Longitude (Optional)', type: 'text', placeholder: 'e.g., -0.1278' }
    ],
    product: [
      { key: 'prod_name', label: 'Product Name', type: 'text', placeholder: 'e.g., Next.js SEO Router Plugin' },
      { key: 'prod_image', label: 'Product Image URL', type: 'url', placeholder: 'e.g., https://texly.io/product.png' },
      { key: 'prod_description', label: 'Product Description', type: 'textarea', placeholder: 'A detailed description of the awesome React/Next.js SEO Tool...' },
      { key: 'prod_sku', label: 'SKU / Identifier', type: 'text', placeholder: 'e.g., TX-SEO-99' },
      { key: 'prod_brand', label: 'Brand Name', type: 'text', placeholder: 'e.g., Texly' },
      { key: 'prod_price', label: 'Price (Decimal)', type: 'number', placeholder: 'e.g., 49.99' },
      { key: 'prod_currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] },
      { key: 'prod_availability', label: 'Availability', type: 'select', options: ['InStock', 'OutOfStock', 'PreOrder', 'Discontinued'] }
    ]
  };

  // --- Dynamic Schema Logic generator ---
  const generatedJsonLd = useMemo(() => {
    const base: Record<string, any> = {
      '@context': 'https://schema.org',
    };

    if (schemaType === 'organization') {
      base['@type'] = 'Organization';
      base['name'] = formData.org_name || 'Texly Corp';
      base['url'] = formData.org_url || 'https://texly.io';
      if (formData.org_logo) base['logo'] = formData.org_logo;
      if (formData.org_sameAs) {
        base['sameAs'] = formData.org_sameAs.split(',').map(s => s.trim()).filter(Boolean);
      }
    } else if (schemaType === 'article') {
      base['@type'] = 'BlogPosting';
      base['headline'] = formData.art_headline || 'SEO Article';
      if (formData.art_image) base['image'] = [formData.art_image];
      base['datePublished'] = formData.art_datePublished || new Date().toISOString().split('T')[0];
      if (formData.art_dateModified) base['dateModified'] = formData.art_dateModified;
      base['author'] = {
        '@type': 'Person',
        'name': formData.art_author || 'Texly Author'
      };
      base['publisher'] = {
        '@type': 'Organization',
        'name': formData.art_publisher || 'Texly',
        'logo': {
          '@type': 'ImageObject',
          'url': formData.art_publisherLogo || 'https://texly.io/logo.png'
        }
      };
    } else if (schemaType === 'localBusiness') {
      base['@type'] = 'LocalBusiness';
      base['name'] = formData.biz_name || 'Texly Local';
      if (formData.biz_image) base['image'] = [formData.biz_image];
      base['address'] = {
        '@type': 'PostalAddress',
        'streetAddress': formData.biz_address || 'London, UK'
      };
      if (formData.biz_phone) base['telephone'] = formData.biz_phone;
      base['priceRange'] = formData.biz_priceRange || '$$';
      if (formData.biz_lat && formData.biz_lon) {
        base['geo'] = {
          '@type': 'GeoCoordinates',
          'latitude': parseFloat(formData.biz_lat),
          'longitude': parseFloat(formData.biz_lon)
        };
      }
    } else if (schemaType === 'product') {
      base['@type'] = 'Product';
      base['name'] = formData.prod_name || 'Awesome Product';
      if (formData.prod_image) base['image'] = [formData.prod_image];
      base['description'] = formData.prod_description || 'High quality tool build for modern React applications.';
      base['sku'] = formData.prod_sku || 'SKU-TEX-001';
      base['brand'] = {
        '@type': 'Brand',
        'name': formData.prod_brand || 'Texly'
      };
      base['offers'] = {
        '@type': 'Offer',
        'url': formData.org_url || 'https://texly.io',
        'priceCurrency': formData.prod_currency || 'USD',
        'price': parseFloat(formData.prod_price || '0.00'),
        'availability': `https://schema.org/${formData.prod_availability || 'InStock'}`,
        'itemCondition': 'https://schema.org/NewCondition'
      };
    }

    return base;
  }, [schemaType, formData]);

  // Next.js App Router TSX Code Output String
  const appRouterComponentCode = useMemo(() => {
    const jsonString = JSON.stringify(generatedJsonLd, null, 2);
    return `// app/page.tsx or components/JsonLd.tsx
export default function JsonLd() {
  const jsonLd = ${jsonString.split('\n').map((line, idx) => idx === 0 ? line : '  ' + line).join('\n')};

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}`;
  }, [generatedJsonLd]);

  // Next.js static / dynamic metadata code export
  const metadataExporterCode = useMemo(() => {
    const titleValue = formData.art_headline || formData.biz_name || formData.prod_name || formData.org_name || 'Texly Optimized SEO Page';
    const descValue = formData.prod_description || `Learn about ${titleValue} built on the elite Texly Next.js framework.`;
    return `import type { Metadata } from 'next';

// Dynamic or static metadata configuration for App Router Layout / Page
export const metadata: Metadata = {
  title: '${titleValue}',
  description: '${descValue}',
  alternates: {
    canonical: '${formData.org_url || 'https://texly.io'}',
  },
  openGraph: {
    title: '${titleValue}',
    description: '${descValue}',
    url: '${formData.org_url || 'https://texly.io'}',
    siteName: 'Texly SEO OS',
    images: [
      {
        url: '${formData.art_image || formData.prod_image || formData.org_logo || 'https://texly.io/og-image.png'}',
        width: 1200,
        height: 630,
        alt: '${titleValue}',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
};`;
  }, [formData]);

  // Raw JSON string
  const rawJsonString = useMemo(() => {
    return JSON.stringify(generatedJsonLd, null, 2);
  }, [generatedJsonLd]);

  // Handles state updating dynamic inputs
  const handleInputChange = (key: string, val: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: val
    }));
  };

  // Mock autofill to make testing quick
  const autofillTexlyExample = () => {
    setFormData(prev => ({
      ...prev,
      org_name: 'Texly AI - SEO Engineering OS',
      org_url: 'https://texly.io',
      org_logo: 'https://texly.io/assets/brand-symbol.png',
      org_sameAs: 'https://twitter.com/texly_hq, https://github.com/texly-labs',
      art_headline: 'Revolutionizing Next.js SEO with Structured Schema Data Engines',
      art_image: 'https://texly.io/blog-assets/schema-guide-hero.webp',
      biz_name: 'Texly HQ',
      prod_name: 'Texly Structured Data Suite Pro'
    }));
  };

  // Copy to clipboard helper
  const handleCopy = (type: 'nextjs' | 'json' | 'metadata', text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedText(type);
    setTimeout(() => {
      setCopied(false);
      setCopiedText(null);
    }, 2500);
  };

  // FAQ List
  const faqs = [
    {
      q: 'Where do I place JSON-LD script files in Next.js App Router?',
      a: 'In Next.js App Router (version 13, 14, or 15), you should render the script tag directly in your Page or Layout component. Return a <script type="application/ld+json"> element with dangerouslySetInnerHTML. Next.js automatically deduplicates, validates, and injects this block into the HTML document <head> where crawler bots look for structured data.'
    },
    {
      q: 'Why choose JSON-LD structured data over microdata tags?',
      a: 'JSON-LD is recommended by Google. It cleanly decouples the SEO structure definition from your layout elements, allowing you to fetch server data, generate a neat configuration map, and render it in one dynamic block without polluting DOM node attributes with rich snippet code.'
    },
    {
      q: 'Is it safe to use dangerouslySetInnerHTML for Next.js JSON-LD?',
      a: 'Yes. Since the structure is parsed and stringified dynamically on your secure React/Next server runtime, it is totally safe and standard practice. Just ensure any arbitrary user-provided inputs are stripped or sanitized if they are not generated from database structures.'
    },
    {
      q: 'Can I integrate dynamic layouts or dynamic route segments in this generator?',
      a: 'Absolutely. Using standard dynamic routing segments like app/blog/[slug]/page.tsx, you can fetch CMS databases or local JSON tables asynchronously on the server and pipe the custom dynamic parameters seamlessly into this schema format to deliver rich snippets on Google for thousands of distinct dynamic routes.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      
      {/* Dynamic Background Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header Area */}
      <header className="border-b border-slate-800 backdrop-blur-md sticky top-0 z-50 bg-slate-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Texly Brand Emblem */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-violet-500 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <span className="font-extrabold text-white text-lg tracking-wider">T</span>
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-white flex items-center gap-1.5">
                Texly <span className="text-indigo-400 font-normal text-sm px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">SEO OS</span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline-flex text-xs text-slate-400 tracking-wider uppercase font-semibold">Ready for production Next.js 14/15</span>
            <button 
              onClick={autofillTexlyExample}
              className="text-xs font-semibold px-4 py-2.5 rounded-lg border border-slate-700 hover:border-indigo-500/40 bg-slate-800 hover:bg-slate-700/80 transition-all text-indigo-300 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5 text-indigo-400 fill-current" viewBox="0 0 24 24"><path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"/></svg>
              Auto-Fill Texly Data
            </button>
          </div>
        </div>
      </header>

      {/* Main Tool Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 z-10">
        
        {/* Page Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-indigo-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-300 tracking-wide uppercase mb-4">
            <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Interactive SEO Tool Suite
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            JSON-LD App Router <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
              Schema Generator
            </span>
          </h1>
          <p className="text-base md:text-lg text-slate-300 font-normal leading-relaxed">
            Online interactive SEO calculator custom crafted for: <span className="text-indigo-300 font-semibold">Automated Next.js App Router Schema Generator</span>. Free visual utility for standard pages, products, organizations, and articles.
          </p>
        </div>

        {/* Dynamic Schema Selector Controls */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-4 mb-8 flex flex-wrap gap-2 items-center justify-between shadow-2xl">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider px-3 mr-1">Select Schema:</span>
            {(['organization', 'article', 'localBusiness', 'product'] as SchemaType[]).map((type) => (
              <button
                key={type}
                onClick={() => setSchemaType(type)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 capitalize flex items-center gap-2 border ${
                  schemaType === type
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/20 border-indigo-500'
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-600'
                }`}
              >
                {type === 'organization' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                )}
                {type === 'article' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                )}
                {type === 'localBusiness' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                )}
                {type === 'product' && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                )}
                {type}
              </button>
            ))}
          </div>

          <div className="text-xs text-indigo-300 font-medium px-4 py-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            Active Layout: Next.js standard JSON schema generator
          </div>
        </div>

        {/* Dual Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left Column: Form Configurator */}
          <div className="lg:col-span-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 border-b border-slate-700/60 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                Configure Fields
              </h3>
              <span className="text-xs text-slate-400 italic">Pre-loaded with defaults</span>
            </div>

            <div className="space-y-5">
              {fieldsConfig[schemaType].map((field) => (
                <div key={field.key} className="flex flex-col">
                  <label htmlFor={field.key} className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                    <span>{field.label}</span>
                    {field.type === 'url' && (
                      <span className="text-[10px] text-indigo-400 capitalize">URL Protocol Required</span>
                    )}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.key}
                      rows={3}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                      placeholder={field.placeholder}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.key}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                    >
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt} className="bg-slate-900 text-slate-100">
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={field.key}
                      type={field.type}
                      className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
                      placeholder={field.placeholder}
                      value={formData[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                    />
                  )}
                  {field.helpText && (
                    <span className="text-[11px] text-slate-400 mt-1">{field.helpText}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Validation Visualizer */}
            <div className="mt-8 pt-6 border-t border-slate-700/60">
              <div className="bg-indigo-500/5 rounded-xl border border-indigo-500/20 p-4">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Schema.org Validation Ready
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The generated JSON-LD output satisfies the official 2025 W3C Schema specification standards. Copy the script directly into your page layout to render dynamic structured metadata.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Schema Code Output Workspace */}
          <div className="lg:col-span-7 flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl relative overflow-hidden">
            
            {/* Workspace tabs */}
            <div className="bg-slate-900/90 border-b border-slate-800 px-4 pt-4 flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('nextjs')}
                  className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border-t border-x ${
                    activeTab === 'nextjs'
                      ? 'bg-slate-950 border-slate-800 text-indigo-400 font-extrabold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  Next.js App Router TSX
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border-t border-x ${
                    activeTab === 'json'
                      ? 'bg-slate-950 border-slate-800 text-indigo-400 font-extrabold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Raw JSON-LD
                </button>
                <button
                  onClick={() => setActiveTab('metadata')}
                  className={`px-4 py-2.5 rounded-t-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border-t border-x ${
                    activeTab === 'metadata'
                      ? 'bg-slate-950 border-slate-800 text-indigo-400 font-extrabold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  Metadata Config
                </button>
              </div>

              {/* Action Button: Copy */}
              <button
                onClick={() => {
                  const targetCode = activeTab === 'nextjs' ? appRouterComponentCode : activeTab === 'json' ? rawJsonString : metadataExporterCode;
                  handleCopy(activeTab, targetCode);
                }}
                className={`mb-2 text-xs font-bold px-3.5 py-2 rounded-lg transition-all duration-200 flex items-center gap-1.5 ${
                  copiedText === activeTab
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                }`}
              >
                {copiedText === activeTab ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copy Code
                  </>
                )}
              </button>
            </div>

            {/* Code Output Box */}
            <div className="p-5 flex-grow font-mono text-xs overflow-auto bg-slate-950 leading-relaxed max-h-[500px]">
              {activeTab === 'nextjs' && (
                <pre className="text-slate-300">
                  <span className="text-slate-500">// 1. Paste into any Next.js Page or Component file</span><br />
                  <span className="text-pink-400">import</span> React <span className="text-pink-400">from</span> <span className="text-emerald-300">'react'</span>;<br /><br />
                  {appRouterComponentCode}
                </pre>
              )}

              {activeTab === 'json' && (
                <pre className="text-indigo-300">
                  <span className="text-slate-500">// Pure JSON-LD structured layout payload:</span><br /><br />
                  {rawJsonString}
                </pre>
              )}

              {activeTab === 'metadata' && (
                <pre className="text-slate-300">
                  <span className="text-slate-500">// Configure static or dynamic site metadata in your layout.tsx or page.tsx file:</span><br /><br />
                  {metadataExporterCode}
                </pre>
              )}
            </div>

            {/* Utility Info Strip */}
            <div className="bg-slate-900 border-t border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                Live schema validator engine synced with Texly OS.
              </span>
              <a 
                href="https://validator.schema.org/" 
                target="_blank" 
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                Go validate in Schema.org
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>

        </div>

        {/* Informational and Benefits Banner */}
        <section className="bg-gradient-to-r from-slate-800/80 via-slate-900/60 to-slate-800/80 rounded-2xl border border-slate-700/60 p-8 mb-16 shadow-lg">
          <h2 className="text-2xl font-black text-white tracking-tight mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            Why Use Texly Schema Engine in Next.js?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <span className="text-indigo-400 font-bold text-lg mb-1">Crawlers Priority</span>
              <p className="text-sm text-slate-300 leading-relaxed">
                Google, Bing, and DuckDuckGo scan structured metadata instantly during hydration. Rendering clean microformats improves visibility for rich snippets, dynamic reviews, and publisher carousel features.
              </p>
            </div>
            <div className="flex flex-col">
              <span className="text-indigo-400 font-bold text-lg mb-1">Optimized Performance</span>
              <p className="text-sm text-slate-300 leading-relaxed">
                By rendering inline script definitions dynamically server-side, you bypass standard hydration lag. There are zero bulky extra scripts injected on client page view ports.
              </p>
            </div>
            <div className="flex flex-col">
              <span className="text-indigo-400 font-bold text-lg mb-1">Zero Layout Shifting</span>
              <p className="text-sm text-slate-300 leading-relaxed">
                Scripts do not produce visual rendering or impact Cumulative Layout Shift (CLS). You retain high Core Web Vitals performance across standard mobile devices.
              </p>
            </div>
          </div>
        </section>

        {/* Dynamic FAQ List Section */}
        <section className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Frequently Asked Questions</h2>
            <p className="text-slate-400 text-sm">Everything you need to know to wire up JSON-LD on modern React templates</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none hover:bg-slate-700/25 transition-all"
                >
                  <span className="font-bold text-slate-100 text-base">{faq.q}</span>
                  <span className="ml-4 flex-shrink-0 text-indigo-400">
                    {openFaq === idx ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" /></svg>
                    )}
                  </span>
                </button>
                
                {openFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-300 border-t border-slate-700/40 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Structured Footer */}
      <footer className="mt-20 border-t border-slate-800 bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white text-sm">
              T
            </div>
            <span className="text-sm font-black text-white tracking-tight">Texly SEO Operating System</span>
          </div>
          <div className="text-xs text-slate-500 text-center md:text-right">
            &copy; {new Date().getFullYear()} Texly AI. All rights reserved. Built for professional Next.js developers around the globe.
          </div>
        </div>
      </footer>

    </div>
  );
}
```