import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  // OTP States
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  useEffect(() => {
    document.title = `${t.footer.contactUs} - Texly`;
  }, [t.footer.contactUs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send message');

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">{t.legal.contactTitle}</h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">{t.legal.contactSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div>
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm mb-10 hover:shadow-xl transition-all">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center shadow-inner">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">{t.legal.emailUs}</h3>
                <p className="text-slate-500 dark:text-slate-500 text-xs font-bold uppercase tracking-tighter">{t.legal.emailDesc}</p>
              </div>
            </div>
            <a href="mailto:support@texly.online" className="text-2xl font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors break-all">
              support@texly.online
            </a>
          </div>

          <div className="prose prose-slate dark:prose-invert">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">{t.legal.otherWays}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{t.legal.otherDesc}</p>
            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-blue-400 shadow-sm">
                  <span className="font-black text-sm">𝕏</span>
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-bold">@TexlyTools</span>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-900 dark:text-white shadow-sm">
                  <span className="font-black text-sm">GH</span>
                </div>
                <span className="text-slate-700 dark:text-slate-300 font-bold">Texly-Project</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-blue-600/5 rounded-full blur-2xl" />
          
          {submitted ? (
            <div className="text-center py-16 relative z-10">
              <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{t.legal.formSuccess}</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8 font-medium leading-relaxed">{t.legal.formSuccessDesc}</p>
              <button 
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                }}
                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                {t.legal.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl text-sm font-bold">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">{t.legal.formName}</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 dark:text-white"
                  placeholder={t.legal.formPlaceholderName}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">{t.legal.formEmail}</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 dark:text-white"
                  placeholder={t.legal.formPlaceholderEmail}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">{t.legal.formSubject}</label>
                <select 
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option>General Inquiry</option>
                  <option>Bug Report</option>
                  <option>Tool Suggestion</option>
                  <option>Business Collaboration</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest">{t.legal.formMessage}</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold text-slate-900 dark:text-white resize-none"
                  placeholder={t.legal.formPlaceholderMessage}
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {t.legal.formSubmit}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
