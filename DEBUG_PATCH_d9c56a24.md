To resolve the missing `robots.txt` issue for the Texly website, we need to add a configuration file that guides search engine crawlers (like Googlebot) on how to index the site.

In a React project, static files like `robots.txt` must be placed in the `public/` directory. When the project is built, files in this folder are moved to the root of the server, making the file accessible at `https://www.texlyonline.in/robots.txt`.

### Title
**SEO: Add robots.txt for search engine crawler instructions**

### Description
Currently, the website is missing a `robots.txt` file. This prevents search engines from receiving explicit instructions on which parts of the site should be crawled or ignored. Adding this file improves SEO and ensures that crawlers prioritize important pages while potentially ignoring private or administrative routes.

This patch adds a standard `robots.txt` that:
1. Allows all search engines to crawl the site.
2. Points to the location of the XML sitemap (standard practice for SEO).

---

### Code Patch

**File to create:** `public/robots.txt`

```text
# https://www.robotstxt.org/robotstxt.html

# Allow all crawlers
User-agent: *
Allow: /

# Host
Host: https://www.texlyonline.in/

# Sitemaps
Sitemap: https://www.texlyonline.in/sitemap.xml
```

---

### Implementation Steps

1.  Navigate to the `public/` folder in your repository.
2.  Create a new file named `robots.txt`.
3.  Paste the content provided above into the file.
4.  Commit and push the changes.

### Verification
Once deployed, you can verify the fix by navigating to:
`https://www.texlyonline.in/robots.txt`

The browser should display the text content of the file, and tools like Google Search Console will now be able to detect and parse your crawling instructions.