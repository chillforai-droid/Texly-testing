import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  HelpCircle, 
  Lightbulb, 
  Rocket, 
  ShieldCheck, 
  Star,
  ChevronRight
} from 'lucide-react';
import { getSEOData } from '../data/seo';

interface AIToolSEOContentProps {
  toolId: string;
}

const AIToolSEOContent: React.FC<AIToolSEOContentProps> = ({ toolId }) => {
  const seoData = getSEOData(toolId);

  if (!seoData) return null;

  return (
    <div className="mt-24 space-y-24">
      {/* How It Works */}
      {seoData.howToUse && (
        <section aria-labelledby="how-it-works-title">
          <div className="text-center mb-12">
            <h2 id="how-it-works-title" className="text-3xl font-black text-slate-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-400">Follow these simple steps to get professional results in seconds.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {seoData.howToUse.map((step, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-8 rounded-3xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm"
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/20">
                  {index + 1}
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{step}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Benefits & Use Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Benefits */}
        {seoData.benefits && (
          <section aria-labelledby="benefits-title" className="p-10 rounded-[3rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 dark:border-blue-500/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Star className="w-6 h-6" />
              </div>
              <h2 id="benefits-title" className="text-2xl font-black text-slate-900 dark:text-white">Key Benefits</h2>
            </div>
            <ul className="space-y-4">
              {seoData.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="font-medium">{benefit}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Use Cases */}
        {seoData.useCases && (
          <section aria-labelledby="use-cases-title" className="p-10 rounded-[3rem] bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-500/10 dark:border-purple-500/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Rocket className="w-6 h-6" />
              </div>
              <h2 id="use-cases-title" className="text-2xl font-black text-slate-900 dark:text-white">Real-Life Use Cases</h2>
            </div>
            <ul className="space-y-4">
              {seoData.useCases.map((useCase, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="font-medium">{useCase}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* FAQ Section */}
      {seoData.faqs && (
        <section aria-labelledby="faq-title" className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 id="faq-title" className="text-3xl font-black text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-600 dark:text-slate-400">Everything you need to know about our {seoData.h1}.</p>
          </div>
          <div className="space-y-4">
            {seoData.faqs.map((faq, index) => (
              <details key={index} className="group p-6 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 open:bg-slate-50 dark:open:bg-slate-900 transition-all shadow-sm">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <div className="flex items-center gap-4">
                    <HelpCircle className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-slate-900 dark:text-white group-open:text-blue-600 dark:group-open:text-blue-400 transition-colors">{faq.q}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="mt-4 pl-9 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Extra Info / Blog Content */}
      {seoData.extraInfo && (
        <section className="prose prose-slate dark:prose-invert max-w-none p-12 rounded-[3rem] bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div dangerouslySetInnerHTML={{ __html: seoData.extraInfo }} />
        </section>
      )}

      {/* Trust Badges */}
      <section className="py-12 border-t border-slate-200 dark:border-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center p-6">
            <ShieldCheck className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">100% Secure</h3>
            <p className="text-sm text-slate-500">Your data is processed securely and never stored permanently.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <Star className="w-10 h-10 text-amber-500 mb-4" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">High Quality</h3>
            <p className="text-sm text-slate-500">Professional-grade AI models for the best possible results.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6">
            <Rocket className="w-10 h-10 text-purple-500 mb-4" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">Instant Results</h3>
            <p className="text-sm text-slate-500">Fast cloud-based processing means no waiting in long queues.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIToolSEOContent;
