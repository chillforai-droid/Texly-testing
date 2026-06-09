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
        <title>Free GitHub File Push Tool - Upload Files to GitHub Online without Git | Texly</title>
        <meta name="description" content="Push files and folders directly to any GitHub repository online. Upload ZIP files with auto-extraction and nesting fixes. No command line or Git installation required. Secure personal access token (PAT) authentication." />
        <meta name="keywords" content="github file push online, upload file to github, push code without git, github browser uploader, online repo committer, free git uploader tool, upload folder to github web, push zip to github, commit online github tool" />
        <link rel="canonical" href="https://www.texlyonline.in/ai-automation" />

        {/* Open Graph */}
        <meta property="og:title" content="Free GitHub File Push Tool - Upload Files to GitHub Online without Git | Texly" />
        <meta property="og:description" content="Push files and folders directly to any GitHub repository online. Upload ZIP files with auto-extraction and nesting fixes. Secure & completely free." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.texlyonline.in/ai-automation" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free GitHub File Push Tool - Upload to GitHub Online" />
        <meta name="twitter:description" content="Easily commit and push files to any GitHub repository instantly in your web browser. Completely free tool." />

        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Free GitHub File Push Tool",
            "description": "Upload and push files directly to any GitHub repository online without installing Git. Free browser-based tool with automated ZIP extraction.",
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
              "Push files to GitHub without Local Git installer",
              "Upload and extract ZIP recursively to repository",
              "Smart Automated Nested Folder flattening",
              "Direct secure browser-to-GitHub-API commits",
              "Supports multiple files upload"
            ]
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I push files to GitHub without installing Git?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can use Texly's Free GitHub File Push Tool. Simply connect your Personal Access Token (PAT), select your repository, drop files or choose a ZIP archive (which we auto-extract and flatten), write a commit message, and click Push. We talk directly to GitHub's REST API, eliminating the need for Git command-line utilities."
                }
              },
              {
                "@type": "Question",
                "name": "Is my GitHub Personal Access Token safe here?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, completely! Texly runs entirely locally in your web browser sandbox. Your personal access token (PAT) and file contents are sent directly to the official secure GitHub API. No intermediate backend serves as a proxy, and your keys are never stored on external tracking servers."
                }
              },
              {
                "@type": "Question",
                "name": "Does the tool support folder uploads?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! The easiest way to push entire folder hierarchies is to bundle them as a ZIP archive (.zip). Our tool automatically decompresses the zip, analyzes the internal files, fixes redundant nested directory layouts, and commits the full hierarchy straight to the root of your remote target branch."
                }
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white py-6 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Main Interactive Tool Container */}
          <section className="bg-white dark:bg-[#09090b] shadow-xl rounded-3xl border border-slate-200/80 dark:border-zinc-900/80 p-5 md:p-8">
            <GitHubTab />
          </section>

          {/* Deep Informative Article for first-page Google SEO Ranking */}
          <article className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-zinc-300 leading-relaxed space-y-8 border-t border-slate-200 dark:border-zinc-900 pt-10">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                How to Push Files and Folders to GitHub Online without Git Command Line
              </h1>
              <p className="mt-3 text-slate-500 dark:text-zinc-400 text-sm md:text-base">
                Have you ever wanted to quickly update a repository or upload a brand-new project to GitHub, but found yourself stuck on a device without Git installed? Setting up Git, configuring SSH keys, cloning a branch, committing, and pushing can be tedious for quick updates. 
                Our <strong>Free GitHub File Push Tool</strong> provides an absolute, browser-instant solution. Just drop your files, write a commit message, and deploy files straight to your remote main, master, or any custom branch instantly!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-5 bg-white dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-900/60 rounded-2xl">
                <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                  <span>💡</span> Why Use GitHub Web Pusher?
                </h3>
                <ul className="mt-3 space-y-2 text-xs list-disc pl-4 text-justify">
                  <li><strong>Zero Installs:</strong> Absolutely no Node.js, git bash terminal, or binary packages needed on your device.</li>
                  <li><strong>ZIP Auto-Extraction:</strong> Drag-and-drop a folder bundled as `.zip`, and our tool decompresses files inside with recursive file tree indexing.</li>
                  <li><strong>Nesting Auto-Fix:</strong> If your zipped project resides inside nested repeating parent directories (e.g. `Project/Project/src/...`), the tool auto-detects and flattens directory paths instantly to root level.</li>
                  <li><strong>Completely Free & Safe:</strong> Runs entirely local in client-side memory. Your confidential tokens and payloads connect strictly with the official GitHub API.</li>
                </ul>
              </div>

              <div className="p-5 bg-white dark:bg-zinc-900/40 border border-slate-200/60 dark:border-zinc-900/60 rounded-2xl">
                <h3 className="text-base font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                  <span>🛠</span> Standard 5-Step Online Committer Guide
                </h3>
                <ol className="mt-3 space-y-2 text-xs list-decimal pl-4 text-justify">
                  <li>Generate your personal access token (PAT) with <code className="bg-slate-100 dark:bg-zinc-800 px-1 rounded dark:text-cyan-400">repo</code> permissions from settings in GitHub.</li>
                  <li>Enter the token and click connect; this lists all your personal & organization repositories instantly.</li>
                  <li>Select your destination repository along with your target branch (e.g., <em className="text-cyan-400 font-mono">main</em> or <em className="text-cyan-400 font-mono">gh-pages</em>).</li>
                  <li>Drag the projects files, standalone HTML/JS files, or structured folders in ZIP format.</li>
                  <li>Verify the file structure, enter your Custom commit notes, and click <strong>"Commit & Push"</strong>. Get your live commit url branch link back within seconds!</li>
                </ol>
              </div>
            </div>

            {/* Comprehensive SEO FAQ list */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-zinc-900 pb-2">
                Frequently Asked Google Questions (FAQs)
              </h2>

              <div className="space-y-4">
                <div className="border border-slate-200 dark:border-zinc-900 rounded-xl p-4 bg-white dark:bg-zinc-950/40">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wide">
                    Q: Is setting up a Classic Personal Access Token safe?
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed text-justify">
                    Yes! Since Texly is a static web platform, your token stays only inside your device's sandbox browser localStorage. We do not transmit, capture, or save your credential data outside the local context. It is used strictly for authentication prompts to GitHub's official endpoint network layer.
                  </p>
                </div>

                <div className="border border-slate-200 dark:border-zinc-900 rounded-xl p-4 bg-white dark:bg-zinc-950/40">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wide">
                    Q: Can I push code to private repositories with this uploader?
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Yes, as long as your Personal Access Token (PAT) has standard <code className="bg-slate-100 dark:bg-zinc-800 px-1 rounded dark:text-cyan-400">repo</code> scope checked, you can push, pull, commit, and edit files to private repositories and public organizations without restriction.
                  </p>
                </div>

                <div className="border border-slate-200 dark:border-zinc-900 rounded-xl p-4 bg-white dark:bg-zinc-950/40">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-100 uppercase tracking-wide">
                    Q: What file types are supported?
                  </h4>
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Our online tool supports all standard text files like HTML, JavaScript, JSX, TypeScript, CSS, JSON, Markdown, and Python, along with binaries and standard `.zip` files. You can upload ZIP archives up to 25MB for quick extraction and upload.
                  </p>
                </div>
              </div>
            </div>

            {/* Closing banner */}
            <div className="p-6 bg-slate-100 dark:bg-zinc-900 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-slate-900 dark:text-white font-bold text-sm">Need a full terminal environment & editor?</p>
                <p className="text-slate-500 dark:text-zinc-400 text-xs">Try our completely integrated browser-based DevStudio Online IDE with full terminal, Monaco code highlights, and push integrations.</p>
              </div>
              <a href="/devstudio" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow cursor-pointer whitespace-nowrap">
                Open DevStudio IDE →
              </a>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
