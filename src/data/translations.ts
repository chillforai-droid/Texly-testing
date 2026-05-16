// Ensure translations object is correctly structured with language keys
// Assumed structure: { en: { hello: 'Hello' }, de: { hello: 'Hallo' } }
export const translations: Record<string, Record<string, string>> = {
  en: {
    hello: 'Hello',
    welcome: 'Welcome to Texly',
    // ... add all other keys as needed
  },
  de: {
    hello: 'Hallo',
    welcome: 'Willkommen bei Texly',
    // ...
  }
};
