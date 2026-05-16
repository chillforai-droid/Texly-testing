This issue occurs because modern mobile devices with notches or "hole-punch" cameras (like iPhone X and later, or many modern Android devices) require the `viewport-fit=cover` attribute in the viewport meta tag to utilize the entire screen area. Without it, the browser may add letterboxing or white bars to avoid the notch.

### Title
Fix: Add `viewport-fit=cover` to viewport meta tag for notched displays

### Description
The application currently lacks the `viewport-fit=cover` attribute in its viewport configuration. This results in suboptimal rendering on modern mobile devices where the UI does not extend into the "safe area" (the space behind notches or dynamic islands). 

Adding this attribute ensures that the application can render edge-to-edge. Note: This change works best when combined with CSS `env(safe-area-inset-*)` values for padding if content gets hidden behind the notch, but the primary requirement is the meta tag update.

### Code Patch

In a standard React project, the viewport meta tag is located in the `public/index.html` file.

```diff
--- a/public/index.html
+++ b/public/index.html
@@ -8,7 +8,7 @@
     <meta
       name="viewport"
-      content="width=device-width, initial-scale=1"
+      content="width=device-width, initial-scale=1, viewport-fit=cover"
     />
     <meta name="theme-color" content="#000000" />
     <meta
```

---

### Additional Recommendation (Optional)
To ensure your UI doesn't actually get cut off by the physical notch after applying the patch above, you should ensure your main container (or header/footer) uses CSS safe area insets:

```css
/* Add this to your global CSS if content overlaps the notch */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```