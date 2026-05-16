**Title:** Fix missing `viewport-fit=cover` for notched display support  

**Description:**  
The website currently lacks the `viewport-fit=cover` attribute in the viewport meta tag. This causes content to be incorrectly inset on devices with notched displays (e.g., iPhone X and later). The fix adds `viewport-fit=cover` to the existing viewport meta tag in `public/index.html` to ensure the viewport fills the entire screen, including the safe area behind the notch and rounded corners.  

**Code Patch (React app):**  

File: `public/index.html`  

**Before:**  
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

**After:**  
```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
```