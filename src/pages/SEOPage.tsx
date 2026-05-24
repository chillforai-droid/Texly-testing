/**
 * SEOPage.tsx
 * pages.json directly import करता है — कोई API call नहीं, instant load।
 * Route: /seo/:slug  OR  /:slug (canonical)
 */

import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../config";
import pagesData from "../data/pages.json";

// ── Types ──────────────────────────────────────────────────────────────────
interface FAQItem { question: string; answer: string; }
interface UseCaseItem { title: string; description: string; }
interface SEOPageData {
  slug: string; keyword: string; title: string; metaDescription: string;
  intro: string; faqList: FAQItem[]; useCases: UseCaseItem[];
  relatedTools: string[]; schemaMarkup: any; category: string;
  canonicalUrl: string; createdAt: string; updatedAt: string;
}

const ALL_PAGES: SEOPageData[] = pagesData as SEOPageData[];

// ── Main Component ───────────────────────────────────────────────────────────
export default function SEOPage() {
  const { slug } = useParams<{ slug: string }>();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const page = ALL_PAGES.find(p => p.slug === slug);

  // ── 404 ───────────────────────────────────────────────────────────────────
  if (!page) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-6xl">🔍</div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Page Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
          यह page अभी available नहीं है।
        </p>
        <Link to="/" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-sm">
          ← Home पर जाएं
        </Link>
      </div>
    );
  }

  const canonical = page.canonicalUrl || `${BASE_URL}/${page.slug}`;

  const faqSchema = page.faqList?.length > 0
    ? {
        "@context": "https://schema.org", "@type": "FAQPage",
        "mainEntity": page.faqList.map(f => ({
          "@type": "Question", "name": f.question,
          "acceptedAnswer": { "@type": "Answer", "text": f.answer }
        }))
      }
    : null;

  const pageSchema = page.schemaMarkup || {
    "@context": "https://schema.org", "@type": "WebPage",
    "name": page.title, "description": page.metaDescription, "url": canonical
  };

  return (
    <>
      <Helmet>
        <title>{page.title}</title>
        <meta name="description" content={page.metaDescription} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={page.title} />
        <meta property="og:description" content={page.metaDescription} />
        <meta property="og:url" content={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Texly" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={page.title} />
        <meta name="twitter:description" content={page.metaDescription} />
        <script type="application/ld+json">{JSON.stringify(pageSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      <article className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 space-y-14">

          {/* Hero */}
          <section className="text-center space-y-5">
            {page.category && (
              <span className="inline-block text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full">
                {page.category}
              </span>
            )}
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {page.title.split(" - ")[0]}
            </h1>
            {page.title.includes(" - ") && (
              <p className="text-base md:text-lg text-blue-600 dark:text-blue-400 font-medium">
                {page.title.split(" - ").slice(1).join(" - ")}
              </p>
            )}
            <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
              {page.intro}
            </p>
          </section>

          {/* Use Cases */}
          {page.useCases?.length > 0 && (
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-6">Key Use Cases</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {page.useCases.map((u, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md transition">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-3">
                      <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{i + 1}</span>
                    </div>
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-1.5">{u.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{u.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Texly पर try करें — 100% Free</h2>
            <p className="text-blue-100 text-sm mb-6">No login, no signup — browser में directly use करें।</p>
            <Link to="/" className="inline-block px-8 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition shadow-md text-sm">
              🚀 Texly Tools खोलें →
            </Link>
          </section>

          {/* FAQ */}
          {page.faqList?.length > 0 && (
            <section>
              <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {page.faqList.map((faq, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left px-5 py-4 flex justify-between items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                    >
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">{faq.question}</span>
                      <span className={`text-slate-400 text-xs flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}>▼</span>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Tools */}
          {page.relatedTools?.length > 0 && (
            <section className="border-t border-slate-200 dark:border-slate-800 pt-10">
              <h2 className="text-base font-bold text-slate-600 dark:text-slate-400 mb-4 uppercase tracking-wider text-sm">Related Tools on Texly</h2>
              <div className="flex flex-wrap gap-2">
                {page.relatedTools.map(rel => (
                  <Link key={rel} to={`/tool/${rel}`}
                    className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg border border-slate-200 dark:border-slate-700 font-mono transition">
                    /{rel}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Breadcrumb */}
          <nav className="text-xs text-slate-400 flex items-center gap-1.5">
            <Link to="/" className="hover:text-blue-500 transition">Home</Link>
            <span>›</span>
            <span className="text-slate-500">{page.category || "Tools"}</span>
            <span>›</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{page.slug}</span>
          </nav>
        </div>
      </article>
    </>
  );
}
