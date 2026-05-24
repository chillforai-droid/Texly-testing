import React, { useEffect } from 'react';

const TermsAndConditions = () => {
  useEffect(() => {
    document.title = 'Terms and Conditions - Texly';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article className="prose prose-slate max-w-none">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Terms and Conditions</h1>
        <p className="text-slate-500 font-bold mb-8">Last updated: May 2026</p>

        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 mb-10">
          <p className="text-amber-800 mb-0 font-medium">
            Welcome to Texly. By accessing or using our website at <strong>texlyonline.in</strong>, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
          </p>
        </div>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing and using Texly, you accept and agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our website.</p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>Texly provides a collection of free online tools for text processing, PDF management, image editing, and AI-powered content generation. Our services are provided "as is" and are available for personal and commercial use subject to these terms.</p>
        </section>

        <section>
          <h2>3. Acceptable Use</h2>
          <p>You agree to use Texly only for lawful purposes. You must not use our service to:</p>
          <ul>
            <li>Process, upload, or generate illegal, harmful, defamatory, or obscene content</li>
            <li>Infringe on any third party's intellectual property rights</li>
            <li>Distribute malware, spam, or other harmful software</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use automated scripts to overload or abuse our services</li>
            <li>Violate any applicable local, national, or international laws or regulations</li>
          </ul>
        </section>

        <section>
          <h2>4. Intellectual Property</h2>
          <p>All content on Texly — including but not limited to text, graphics, logos, icons, and software — is the property of Texly and is protected by applicable intellectual property laws.</p>
          <p>You retain full ownership of any content you process through our tools. Texly does not claim any rights over your data.</p>
        </section>

        <section>
          <h2>5. Disclaimer of Warranties</h2>
          <p>Texly is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied. We do not warrant that:</p>
          <ul>
            <li>The service will be uninterrupted, error-free, or secure</li>
            <li>The results obtained from using the service will be accurate or reliable</li>
            <li>Any errors in the service will be corrected</li>
          </ul>
          <p>You use our service at your own risk. We strongly recommend keeping backups of important documents before processing them with any online tool.</p>
        </section>

        <section>
          <h2>6. Limitation of Liability</h2>
          <p>To the maximum extent permitted by law, Texly and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, profits, or business opportunities, arising from your use of our service.</p>
        </section>

        <section>
          <h2>7. Third-Party Links and Services</h2>
          <p>Our website may contain links to third-party websites or services. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party sites. We encourage you to review the privacy policies of any third-party services you visit.</p>
        </section>

        <section>
          <h2>8. Advertising</h2>
          <p>Texly displays advertisements through Google AdSense to support our free services. These ads are served by Google and are subject to Google's advertising policies. We are not responsible for the content of third-party advertisements displayed on our website.</p>
        </section>

        <section>
          <h2>9. Privacy</h2>
          <p>Your use of Texly is also governed by our <a href="/privacy-policy">Privacy Policy</a>, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices.</p>
        </section>

        <section>
          <h2>10. Changes to Terms</h2>
          <p>We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the website. Your continued use of Texly after any changes constitutes your acceptance of the new Terms.</p>
        </section>

        <section>
          <h2>11. Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with applicable laws. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the appropriate courts.</p>
        </section>

        <section>
          <h2>12. Contact Us</h2>
          <p>If you have any questions about these Terms and Conditions, please contact us:</p>
          <ul>
            <li><strong>Email:</strong> support@texlyonline.in</li>
            <li><strong>Website:</strong> <a href="/contact-us">texlyonline.in/contact-us</a></li>
          </ul>
        </section>

        <div className="mt-12 p-8 bg-slate-100 rounded-3xl text-center">
          <p className="text-slate-600 mb-0 font-bold">By using Texly, you acknowledge that you have read, understood, and agree to these Terms and Conditions.</p>
        </div>
      </article>
    </div>
  );
};

export default TermsAndConditions;
