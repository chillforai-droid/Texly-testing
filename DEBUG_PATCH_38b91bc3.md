## Title: Add robots.txt to public/ for search engine crawl instructions

## Description
The website is missing a `robots.txt` file, which means search engines cannot determine which paths should be crawled or ignored. This can lead to inefficient crawling or unintended indexing of private/test pages. For a testing environment, it's common to allow all crawl directives, but a `robots.txt` file should still exist to avoid ambiguity.

## Steps to Fix
1. Create a file named `robots.txt` in the `public/` directory of your React project.
2. Add standard rules. For a testing/staging site, it's advisable to disallow all crawling to prevent search engines from indexing test content. However, if the site is live and you want indexing, use "Allow: /" for all user-agents.
3. Ensure the file is served at the root URL (e.g., `https://www.texlyonline.in/robots.txt`).

Below is a suggested patch.

## Code Patch (`public/robots.txt`)

```diff
--- /dev/null
+++ b/public/robots.txt
@@ -0,0 +1,5 @@
+User-agent: *
+Disallow: /
+
+# If you want search engines to index your site, replace the lines above with:
+# User-agent: *
+# Allow: /
```

## Additional Notes
- After adding the file, rebuild your React app (`npm run build` or equivalent) to include it in the production build.
- Verify the file is accessible by visiting `https://www.texlyonline.in/robots.txt` in a browser.
- Remember to adjust the rules according to your requirements (e.g., allow only specific paths like `/blog`, `/about`).