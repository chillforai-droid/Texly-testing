import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy — Texly Official Legal Agreement';
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <article className="prose prose-slate max-w-none dark:prose-invert">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Privacy Policy</h1>
        <p className="text-slate-500 dark:text-slate-400 font-bold mb-8">Last updated: June 2026</p>

        <div className="bg-blue-50/50 dark:bg-slate-900 p-6 rounded-2xl border border-blue-100 dark:border-slate-800 mb-10">
          <p className="text-blue-900 dark:text-slate-300 mb-0 font-medium leading-relaxed text-sm">
            At Texly (operating via <strong>https://www.texlyonline.in</strong> and its subdomains), we maintain an absolute commitment to trust, user data security, and transparent privacy practices. This Privacy Policy governs your access to our suites and tools, clarifying what information is collected, how we leverage third-party advertising services like Google AdSense, and your rights under global protection legislations including GDPR and CCPA.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-8 mb-4">1. Scope of Agreement and Consent</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            By visiting, accessing, or employing any text utilities, calculators, encoders, PDF tools, generators, or custom dashboards offered on Texly, you explicitly acknowledge and consent to the data operations, cookie configurations, and tracking models disclosed inside this policy page. If you do not agree with any clause or requirement outlined herein, you must immediately terminate usage of our website and services.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-8 mb-4">2. Zero-Retention Client-Side Processing Pledge</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
            Texly operates under a strict Zero-Retention Local Execution framework. 
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            All text formatting, case conversions, regex executions, directory tree compilations, cryptographic hash generations, or PDF operations are executed entirely within your browser's volatile client-side memory partitions. None of your raw input text payload, paragraphs, files, or sensitive document registries are transmitted to, buffered on, index-sorted on, or permanently written to Texly's persistent servers. Once you close your active browser window or reset the terminal workspace, all processed data states are permanently erased.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-8 mb-4">3. Information We Collect Automatically</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            While we prevent input text collection, our service platforms rely on automated telemetry and telemetry logs to maintain technical health, support responsive layouts, and verify regional traffic categories. This telemetry includes:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-2">
            <li><strong>Device and Client Parameters:</strong> Your internet protocol (IP) address, operating system version (Windows, macOS, Linux, iOS, Android), browser agent configurations, screen density ratios, and system language settings.</li>
            <li><strong>Engagement Telemetry:</strong> Referral sources (organic search engines, direct paths, social networks), individual tool engagement counts, timestamps of interactions, scroll depths, and navigational paths.</li>
            <li><strong>Interactive Choices:</strong> Non-personal preferences including active tool IDs, selected dark or light theme settings, and tool options toggles.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-8 mb-4">4. Google AdSense Clear Disclosures & DoubleClick Cookies</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            We use **Google AdSense** as an external commercial vendor to distribute targeted and high-quality advertisement units to visitors. To support dynamic matches, Google makes use of proprietary cookies and web beacons.
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
            Important AdSense Disclosures for GDPR, CPRA, and CCPA Compliance:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-2">
            <li>Google's use of advertising cookies enables it and its network partners to serve custom advertisements to our visitors based on their previous clicks across our website and other directories on the internet.</li>
            <li>Google makes use of the <strong>DoubleClick cookie</strong> to monitor visitor flows and coordinate advertisements across different networks. This helps Google limit how many times you see the same banner ad and matches suggestions to your interests.</li>
            <li><strong>How to Opt-Out:</strong> You may fully opt out of Google's personalized behavioral advertising arrays by visiting the official <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Ads Settings Panel</a>.</li>
            <li>Alternatively, visitors can systematically disable any third-party advertising cookies by adjusting their options at the <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Digital Advertising Alliance Consumer Choice Portal</a>.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-8 mb-4">5. Cookies and Local Browser Storage</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Texly utilizes standard, lightweight cookies and HTML5 local storage keys to deliver highly responsive features:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-2">
            <li><strong>Functional / Essential Key Storage:</strong> Handled locally to persist choices like code themes or preferred options. For instance, we track your AI tool daily limit count inside browser-confined variables storage.</li>
            <li><strong>Third-Party Analytics:</strong> Google Analytics establishes tracking cookies to parse anonymized user movements. This helps us locate slow-loading layouts and resolve responsive glitches.</li>
            <li><strong>Preferences Customization:</strong> Resolves rendering flicker by remembering whether you prefer Dark Mode or Light Mode locally.</li>
          </ul>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            If you wish to reject or strip these local assets, configure your web browser's options to block or wipe all cookies related to our domain. Note that disabling cookies will cause loss of some local theme states and reset custom configurations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-8 mb-4">6. Authorized Third-Party Integrations</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            To coordinate platform analytical measurements, marketing performance, and content delivery, our services integrate with selective, audited third-party service providers:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-2">
            <li><strong>Google Analytics (UA / GA4):</strong> Provides deep visibility on traffic patterns under standard privacy terms. Reading details is fully aggregated. (<a href="https://policies.google.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>).</li>
            <li><strong>Microsoft Clarity:</strong> Records mouse trails, click coordinates, scrolling interactions, and webpage heatmaps. This assists our team in optimizing layouts for smartphone and desktop viewports. (<a href="https://privacy.microsoft.com/en-us/privacystatement" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Microsoft Privacy Statement</a>).</li>
            <li><strong>Supabase API Engine:</strong> Manages clean data pipelines and renders static blog posts efficiently. (<a href="https://supabase.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Supabase Privacy Agreement</a>).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-8 mb-4">7. European Union User Rights (GDPR Declaration)</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Under the General Data Protection Regulation (GDPR), visitors originating from the European Economic Area (EEA) have complete sovereign command over any personal data handled by Texly. Since our platform maintains a no-retention local framework for tool processing, our core footprint remains exceptionally minimal. However, to the extent that any telemetry records represent personal data:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-2">
            <li><strong>Right of Access & Correction:</strong> You may request full transcripts detailing any telemetry logs mapped to your client parameters.</li>
            <li><strong>Right to Erasure ('Right to be Forgotten'):</strong> Request immediate, perm-delete wipeouts of any history, telemetry logs, or analytical variables.</li>
            <li><strong>Right to Restrict Data Processing:</strong> Limit our analytical monitoring tools from mapping your sessions.</li>
            <li><strong>Right to Object:</strong> Oppose advertising trackers or marketing analytics configurations.</li>
          </ul>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            To submit formal requests or exercise GDPR rights, email our compliance officer directly at <strong>texlyonline@gmail.com</strong>.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-8 mb-4">8. California Consumer Privacy Disclosures (CCPA & CPRA)</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            This section addresses rights provided under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA).
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
            "Do Not Sell My Personal Information":
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Texly has **never** sold, rented, leased, or commercialized any visitor’s personal information or telemetry logs to physical or legal brokers. Google AdSense and marketing partners may collect cookies strictly for personalized advertisements based on user permissions, which California residents can customize using browser cookie restrictions.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-8 mb-4">9. Minor Children Safety Measures</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Protecting children online is an essential component of our legal responsibilities. Texly does not targetedly market to, collect, or structure profiles for minors under 13 years of age. If a parent or guardian discovers that a child has bypassed limits to submit contact info, email us right away and we will permanently delete those logs.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-950 dark:text-white mt-8 mb-4">10. Contacting Our Compliance Unit</h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            If you have questions about our zero-retention tools philosophy, cookies settings, compliance audits, or Google AdSense integration, please reach out to us:
          </p>
          <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-300 space-y-1">
            <li><strong>Primary Support Email:</strong> texlyonline@gmail.com</li>
            <li><strong>Official Legal Portal:</strong> <Link to="/contact-us" className="text-blue-600 underline">texlyonline.in/contact-us</Link></li>
          </ul>
        </section>

        <div className="mt-12 p-8 bg-slate-100 dark:bg-slate-900 rounded-3xl text-center border border-slate-200 dark:border-slate-800">
          <p className="text-slate-650 dark:text-slate-300 mb-0 font-bold text-sm">
            Consent and Agreement: By proceeding to use Texly web applications, you understand and agree in full to this Privacy Policy.
          </p>
        </div>
      </article>
    </div>
  );
};

export default PrivacyPolicy;
