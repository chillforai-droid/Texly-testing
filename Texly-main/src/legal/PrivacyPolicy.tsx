import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy - Texly';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article className="prose prose-slate max-w-none">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-slate-500 font-bold mb-8">Last updated: May 2026</p>

        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-10">
          <p className="text-blue-800 mb-0 font-medium">
            At Texly (<strong>texlyonline.in</strong>), your privacy is our priority. This Privacy Policy explains how we collect, use, and protect your information when you use our website.
          </p>
        </div>

        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect the following types of information:</p>
          <ul>
            <li><strong>Usage Data:</strong> Pages visited, time spent, browser type, device type, IP address, and referring URLs — collected automatically via analytics tools.</li>
            <li><strong>Cookies:</strong> Small text files stored in your browser to remember your preferences and improve your experience.</li>
            <li><strong>Contact Form Data:</strong> If you contact us, we collect your name, email address, and message content solely to respond to your inquiry.</li>
          </ul>
          <p>We do <strong>not</strong> collect any text you enter into our tools. All text processing happens entirely in your browser and is never sent to our servers.</p>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To improve and optimize website performance and user experience</li>
            <li>To understand how visitors use our tools</li>
            <li>To display relevant advertisements via Google AdSense</li>
            <li>To respond to your contact form submissions</li>
            <li>To monitor website security and prevent abuse</li>
          </ul>
        </section>

        <section>
          <h2>3. Google AdSense & Advertising</h2>
          <p>We use <strong>Google AdSense</strong> to display advertisements on our website. Google AdSense uses cookies to serve ads based on your prior visits to our website and other sites on the internet.</p>
          <ul>
            <li>Google may use the DoubleClick cookie to serve ads based on your interests.</li>
            <li>You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>
            <li>You can also opt out via <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info</a>.</li>
          </ul>
          <p>For more information on how Google uses data, visit: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google's Advertising Privacy Policy</a>.</p>
        </section>

        <section>
          <h2>4. Cookies Policy</h2>
          <p>Texly uses the following types of cookies:</p>
          <ul>
            <li><strong>Essential Cookies:</strong> Required for the website to function properly (e.g., remembering language preferences).</li>
            <li><strong>Analytics Cookies:</strong> Google Analytics uses cookies to help us understand how visitors interact with our website. Data is anonymized and aggregated.</li>
            <li><strong>Advertising Cookies:</strong> Google AdSense uses cookies to display relevant advertisements.</li>
          </ul>
          <p>You can control or disable cookies through your browser settings. Note that disabling cookies may affect website functionality.</p>
        </section>

        <section>
          <h2>5. Third-Party Services</h2>
          <p>We use the following third-party services that may collect data:</p>
          <ul>
            <li><strong>Google Analytics</strong> — Website usage analytics (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
            <li><strong>Google AdSense</strong> — Advertising (<a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
            <li><strong>Microsoft Clarity</strong> — Heatmaps and session recordings (<a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
            <li><strong>Supabase</strong> — Blog content storage (<a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
          </ul>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>We retain personal data only as long as necessary for the purposes described in this policy. Analytics data is retained for 26 months. Contact form data is deleted after we resolve your inquiry.</p>
        </section>

        <section>
          <h2>7. Your Rights (GDPR & CCPA)</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li><strong>Right to Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> Request correction of inaccurate data.</li>
            <li><strong>Right to Erasure:</strong> Request deletion of your personal data.</li>
            <li><strong>Right to Object:</strong> Object to our processing of your personal data.</li>
            <li><strong>Do Not Sell (CCPA):</strong> We do not sell your personal information to any third party.</li>
          </ul>
          <p>To exercise any of these rights, email us at <strong>support@texlyonline.in</strong>.</p>
        </section>

        <section>
          <h2>8. Children's Privacy</h2>
          <p>Texly is not directed to children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us immediately and we will delete it.</p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the "Last updated" date at the top of this page. We encourage you to review this policy periodically.</p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <ul>
            <li><strong>Email:</strong> support@texlyonline.in</li>
            <li><strong>Website:</strong> <a href="https://texlyonline.in/contact-us">texlyonline.in/contact-us</a></li>
          </ul>
        </section>

        <div className="mt-12 p-8 bg-slate-100 rounded-3xl text-center">
          <p className="text-slate-600 mb-0 font-bold">By using Texly, you consent to this Privacy Policy and agree to its terms.</p>
        </div>
      </article>
    </div>
  );
};

export default PrivacyPolicy;
