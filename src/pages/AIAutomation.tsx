/**
 * AIAutomation.tsx — GitHub File Pusher Tool
 * Route: /ai-automation
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import GitHubTab from '../components/AutomationPanel/GitHubTab';

export default function AIAutomation() {
  return (
    <>
      <Helmet>
        <title>Free GitHub File Push Tool - Upload Files to GitHub Online | Texly</title>
        <meta name="description" content="Push files directly to GitHub repository online for free. No Git installation needed. Upload, commit and push files to any GitHub repo instantly from your browser. 100% free tool." />
        <meta name="keywords" content="github file push online, upload file to github, push to github without git, github uploader free, commit files to github online, github push tool, free git push, upload to github repo online, github file upload tool, push code to github browser" />
        <link rel="canonical" href="https://www.texlyonline.in/ai-automation" />

        {/* Open Graph */}
        <meta property="og:title" content="Free GitHub File Push Tool - Upload Files to GitHub Online | Texly" />
        <meta property="og:description" content="Push files directly to GitHub repository without installing Git. Upload and commit files to any GitHub repo from your browser. Completely free." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.texlyonline.in/ai-automation" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free GitHub File Push Tool - Upload Files to GitHub Online" />
        <meta name="twitter:description" content="Push files to GitHub repo online without installing Git. Free browser-based GitHub uploader tool." />

        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Free GitHub File Push Tool",
            "description": "Upload and push files directly to any GitHub repository online without installing Git. Free browser-based tool.",
            "url": "https://www.texlyonline.in/ai-automation",
            "applicationCategory": "DeveloperApplication",
            "operatingSystem": "All",
            "browserRequirements": "Requires JavaScript",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Push files to GitHub without Git installed",
              "Upload ZIP and extract to repository",
              "Commit directly from browser",
              "Supports multiple file upload",
              "Free to use"
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-950 text-white p-4">
        <GitHubTab />
      </div>
    </>
  );
}
