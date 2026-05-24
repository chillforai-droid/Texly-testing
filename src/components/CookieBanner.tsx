import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('texly_cookies_accepted');
    if (!accepted) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem('texly_cookies_accepted', 'true');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('texly_cookies_accepted', 'false');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t border-slate-200 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-grow">
          <p className="text-slate-700 text-sm font-semibold mb-1">🍪 We use cookies</p>
          <p className="text-slate-500 text-xs leading-relaxed">
            We use cookies to improve your experience and display relevant ads (via Google AdSense). 
            By clicking "Accept All", you consent to the use of cookies as described in our{' '}
            <a href="/privacy-policy" className="text-blue-600 font-semibold underline hover:text-blue-700">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none px-4 py-2 text-sm text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Decline
          </button>
          <a
            href="/privacy-policy"
            className="flex-1 sm:flex-none px-4 py-2 text-sm text-center text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Learn More
          </a>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none px-6 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-bold shadow-sm"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
