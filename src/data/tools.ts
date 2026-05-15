export interface Tool {
  id: string;
  name: string;
  slug: string;
  category: 'cleaning' | 'converter' | 'analysis' | 'utility' | 'pdf' | 'generator' | 'ai';
  description: string;
  shortDescription: string;
  icon: string;
  keywords: string[];
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  example?: string;
  hook?: string;
  buttonText?: string;
  placeholder?: string;
  externalUrl?: string;
  isAI?: boolean;
  process: (input: string, options?: any) => string | Promise<string>;
}

export const CATEGORIES = [
  { id: 'pdf', name: 'PDF Tools', icon: 'FileText', description: 'Edit, convert, and manage your PDF documents online.' },
  { id: 'ai', name: 'AI Tools', icon: 'Sparkles', description: 'Powerful AI-powered image processing and generation tools.' },
  { id: 'cleaning', name: 'Text Cleaning', icon: 'Trash2', description: 'Remove unwanted characters, spaces, and formatting.' },
  { id: 'converter', name: 'Text Converter', icon: 'RefreshCw', description: 'Change text case and format instantly.' },
  { id: 'analysis', name: 'Text Analysis', icon: 'BarChart3', description: 'Get detailed statistics and insights about your text.' },
  { id: 'utility', name: 'Text Utility', icon: 'Wrench', description: 'Useful tools for everyday text manipulation.' },
  { id: 'generator', name: 'Generators', icon: 'Layout', description: 'Create custom assets like QR codes and color palettes.' },
];

export const TOOLS: Tool[] = [
  // AI TOOLS
  {
    id: 'face-swap',
    name: 'Free AI Face Swap Online - Instant 1-Click Face Swapper ⚡',
    slug: 'face-swap',
    category: 'ai',
    shortDescription: 'Swap faces between two images instantly using advanced AI. No login, 100% free.',
    description: 'Transform your photos with Texly\'s Free AI Face Swap tool. Our advanced neural networks allow you to swap faces between any two images instantly with professional-grade realism. No login required, 100% free, and completely secure.',
    icon: 'UserCircle2',
    keywords: ['ai face swap online free', 'face swapper tool', 'swap faces in photos ai', 'free face swap no login', 'instant face swap online', 'best ai face swapper'],
    process: (s) => s
  },
  {
    id: 'bg-remover',
    name: 'Free AI Background Remover - Remove BG Instantly ⚡',
    slug: 'bg-remover',
    category: 'ai',
    shortDescription: 'Remove image backgrounds in 1 click with Texly\'s AI Background Remover.',
    description: 'Remove image backgrounds in 1 click with Texly\'s AI Background Remover. Our powerful AI automatically detects subjects and removes backgrounds with hair-level precision. Perfect for e-commerce, social media, and professional design.',
    icon: 'ImageIcon',
    keywords: ['remove background from image ai', 'free bg remover online', 'transparent background maker', 'ai photo editor', 'instant bg removal', 'remove background 1 click'],
    process: (s) => s
  },
  {
    id: 'enhancer',
    name: 'AI Image Enhancer - Boost Photo Quality Online Free ⚡',
    slug: 'enhancer',
    category: 'ai',
    shortDescription: 'Fix blurry photos and upscale images with Texly\'s AI Image Enhancer.',
    description: 'Fix blurry photos and upscale images with Texly\'s AI Image Enhancer. Our AI-powered tool sharpens details, reduces noise, and improves overall clarity to give your old or low-quality photos a professional look instantly.',
    icon: 'Maximize',
    keywords: ['enhance image quality ai', 'photo sharpener online', 'ai image upscaler free', 'fix blurry photos', 'upscale image ai free', 'sharpen image online'],
    process: (s) => s
  },
  {
    id: 'compressor',
    name: 'AI Image Compressor - Reduce Photo Size Without Quality Loss ⚡',
    slug: 'compressor',
    category: 'ai',
    shortDescription: 'Optimize your images for the web with Texly\'s AI Image Compressor.',
    description: 'Optimize your images for the web with Texly\'s AI Image Compressor. Reduce file sizes by up to 90% while maintaining professional visual quality. Perfect for faster website loading and saving storage space.',
    icon: 'Zap',
    keywords: ['compress image without losing quality', 'ai image compressor online', 'reduce photo size free', 'smart image optimizer', 'compress image 90 percent', 'image optimizer for seo'],
    process: (s) => s
  },
  {
    id: 'image-upscale',
    name: 'Image Upscale AI - Enhance Image Quality Online Free ⚡',
    slug: 'image-upscale',
    category: 'ai',
    shortDescription: 'Upscale your images and enhance quality with Texly\'s AI Image Upscaler.',
    description: 'Upscale your images and enhance quality with Texly\'s AI Image Upscaler. Our AI-powered tool sharpens details, reduces noise, and improves overall clarity to give your old or low-quality photos a professional look instantly.',
    icon: 'Maximize',
    keywords: ['ai image upscaler free', 'enhance image quality online', 'upscale photo ai', 'image resolution booster', 'fix blurry images online'],
    process: (s) => s
  },
  {
    id: 'image-generator',
    name: 'Free AI Image Generator - Create Stunning Art from Text ⚡',
    slug: 'image-generator',
    category: 'ai',
    shortDescription: 'Generate high-quality images from text descriptions instantly using AI.',
    description: 'Create stunning artwork and realistic photos from simple text prompts with Texly\'s Free AI Image Generator. Our advanced AI models understand your descriptions to produce high-resolution, professional-grade images in seconds. 100% free, no sign-up required.',
    icon: 'Palette',
    keywords: ['free ai image generator', 'text to image ai online', 'generate art from text', 'ai photo generator free', 'best free ai art generator', 'create images with ai'],
    process: (s) => s
  },
  {
    id: 'snapchat-tag-generator',
    name: 'Restored from Snapchat Tag Generator - Add Snapchat Overlays ⚡',
    slug: 'snapchat-tag-generator',
    category: 'ai',
    shortDescription: 'Add "Restored from Snapchat" or "Restored from Camera Roll" tags to your images instantly.',
    description: 'Protect your aesthetics or recreate that classic Snapchat vibe. Add "Restored from Snapchat" or "Restored from Camera Roll" tags to your photos instantly with Texly\'s Snapchat Tag Generator. Our tool perfectly replicates the authentic Snapchat font and style for a seamless look.',
    icon: 'MessageSquare',
    keywords: ['snapchat tag generator', 'restored from snapchat tag', 'add restored from snapchat to photo', 'snapchat overlay tool', 'camera roll tag generator'],
    process: (s) => s
  },
  // CLEANING
  {
    id: 'remove-extra-spaces',
    name: 'Remove Extra Spaces Instantly (1-Click Text Cleaner ⚡)',
    slug: 'remove-extra-spaces-online',
    category: 'cleaning',
    shortDescription: 'Remove extra spaces online free. Clean up your text by removing multiple spaces and trimming edges.',
    description: 'Remove extra spaces online for free. This tool helps you fix messy text online by removing double spaces, tabs, and trailing whitespace instantly. Use our remove unwanted spaces tool to clean up any text.',
    icon: 'Space',
    keywords: ['remove extra spaces online free without registration', 'fix messy text formatting online', 'remove redundant whitespace tool', 'clean up text for copy paste', 'trim whitespace from text online'],
    primaryKeyword: 'remove extra spaces online free without registration',
    secondaryKeywords: ['fix messy text formatting online', 'remove redundant whitespace tool'],
    example: 'This    is    a    text    with    too    many    spaces.',
    hook: 'Paste your messy text below and fix it instantly.',
    buttonText: 'Clean My Text',
    placeholder: 'Paste your text with extra spaces here...',
    process: (input) => input.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'remove-line-breaks',
    name: 'Remove Line Breaks Instantly (Fix Messy Text ⚡)',
    slug: 'remove-line-breaks-tool',
    category: 'cleaning',
    shortDescription: 'Remove line breaks online. Instantly remove all line breaks from your text to make it a single line.',
    description: 'Remove line breaks online for free. Perfect for cleaning up copied text from PDFs or emails. Fix broken text formatting and remove line breaks instantly.',
    icon: 'CornerDownLeft',
    keywords: ['remove line breaks from pdf text online', 'fix broken text formatting from email', 'merge lines into single paragraph tool', 'text to single line converter free', 'newline remover online'],
    primaryKeyword: 'remove line breaks from pdf text online',
    secondaryKeywords: ['fix broken text formatting from email', 'merge lines into single paragraph tool'],
    example: 'This is a text\nwith multiple\nline breaks.',
    hook: 'Turn messy paragraphs into a single line in one click.',
    buttonText: 'Fix My Text',
    placeholder: 'Paste text with line breaks here...',
    process: (input) => input.replace(/[\r\n]+/g, ' '),
  },
  {
    id: 'remove-duplicate-lines',
    name: 'Remove Duplicate Lines Instantly (1-Click Tool ⚡)',
    slug: 'remove-duplicate-lines-tool',
    category: 'cleaning',
    shortDescription: 'Remove duplicate lines tool. Find and remove all duplicate lines from your list or text.',
    description: 'Remove duplicate lines tool free. Clean up lists, logs, or any repetitive text data. Remove repeated lines text and keep only unique lines.',
    icon: 'CopyMinus',
    keywords: ['remove duplicate lines from list online free', 'deduplicate text lines tool', 'clean up repetitive text data', 'unique lines only extractor', 'remove repeated lines from text file'],
    primaryKeyword: 'remove duplicate lines from list online free',
    secondaryKeywords: ['deduplicate text lines tool', 'clean up repetitive text data'],
    example: 'Apple\nBanana\nApple\nOrange\nBanana',
    hook: 'Clean your list and remove all duplicates instantly.',
    buttonText: 'Clean My List',
    placeholder: 'Paste your list with duplicate lines here...',
    process: (input) => Array.from(new Set(input.split(/\r?\n/))).join('\n'),
  },
  {
    id: 'remove-empty-lines',
    name: 'Remove Empty Lines',
    slug: 'remove-empty-lines-online',
    category: 'cleaning',
    shortDescription: 'Remove empty lines online. Quickly strip out all blank or empty lines from your text.',
    description: 'Remove empty lines online for free. This tool makes your text compact and clean. Delete blank lines text tool to remove all blank or empty lines instantly.',
    icon: 'Rows',
    keywords: ['remove empty lines from text online free', 'delete blank lines from document tool', 'strip blank lines from text file', 'compact text by removing empty lines', 'clean up text formatting online'],
    primaryKeyword: 'remove empty lines from text online free',
    secondaryKeywords: ['delete blank lines from document tool', 'strip blank lines from text file'],
    example: 'Line 1\n\nLine 2\n\n\nLine 3',
    hook: 'Make your text clean and compact by removing empty lines.',
    buttonText: 'Clean My Text',
    placeholder: 'Paste text with empty lines here...',
    process: (input) => input.split(/\r?\n/).filter(line => line.trim() !== '').join('\n'),
  },
  {
    id: 'remove-numbers',
    name: 'Remove Numbers',
    slug: 'remove-numbers-from-text',
    category: 'cleaning',
    shortDescription: 'Strip all numerical digits from your text content instantly.',
    description: 'Remove numbers from text easily for free. This tool is perfect for extracting only words from data sets, cleaning up text for analysis, or removing dates and phone numbers from your content.',
    icon: 'Hash',
    keywords: ['remove numbers from text online free', 'strip digits from text tool', 'extract only words from data', 'clean numbers from text file', 'remove all digits from string'],
    primaryKeyword: 'remove numbers from text online free',
    secondaryKeywords: ['strip digits from text tool', 'extract only words from data'],
    example: 'My phone number is 123-456-7890.',
    hook: 'Instantly remove all numbers from your text.',
    buttonText: 'Remove Numbers',
    placeholder: 'Paste text with numbers here...',
    process: (input) => input.replace(/[0-9]/g, ''),
  },
  {
    id: 'military-alphabet-converter',
    name: 'Military Alphabet Converter',
    slug: 'military-alphabet-converter',
    category: 'converter',
    shortDescription: 'Military alphabet converter online. Convert text to NATO phonetic alphabet and back instantly.',
    description: 'Free military alphabet converter online. Convert any text to NATO phonetic alphabet (Alpha, Bravo, Charlie) or decode NATO phonetic code back to plain text. Perfect for clear communication.',
    icon: 'Mic2',
    keywords: ['military alphabet converter online free', 'nato phonetic alphabet translator', 'text to alpha bravo charlie converter', 'nato code decoder online', 'phonetic alphabet generator'],
    primaryKeyword: 'military alphabet converter online free',
    secondaryKeywords: ['nato phonetic alphabet translator', 'text to alpha bravo charlie converter'],
    example: 'Texly',
    hook: 'Convert your text to clear military phonetic code instantly.',
    buttonText: 'Convert Now',
    placeholder: 'Enter text or NATO code (e.g., Alpha Bravo)...',
    process: (input, options) => {
      const natoMap: Record<string, string> = {
        'a': 'Alpha', 'b': 'Bravo', 'c': 'Charlie', 'd': 'Delta', 'e': 'Echo', 'f': 'Foxtrot', 'g': 'Golf', 'h': 'Hotel', 'i': 'India', 'j': 'Juliet', 'k': 'Kilo', 'l': 'Lima', 'm': 'Mike', 'n': 'November', 'o': 'Oscar', 'p': 'Papa', 'q': 'Quebec', 'r': 'Romeo', 's': 'Sierra', 't': 'Tango', 'u': 'Uniform', 'v': 'Victor', 'w': 'Whiskey', 'x': 'X-ray', 'y': 'Yankee', 'z': 'Zulu',
        '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine',
        ' ': '(space)'
      };
      const reverseNatoMap: Record<string, string> = Object.fromEntries(
        Object.entries(natoMap).map(([k, v]) => [v.toLowerCase(), k])
      );
      
      const mode = options?.mode || 'text-to-nato';
      if (mode === 'text-to-nato') {
        return input.toLowerCase().split('').map(char => natoMap[char] || char).join(' ');
      } else {
        return input.split(/\s+/).map(word => {
          const lowerWord = word.toLowerCase();
          if (lowerWord === '(space)') return ' ';
          return reverseNatoMap[lowerWord] || word;
        }).join('');
      }
    },
  },
  {
    id: 'remove-special-characters',
    name: 'Remove Special Characters Online - Free & Instant ⚡',
    slug: 'remove-special-characters-online',
    category: 'cleaning',
    shortDescription: 'Remove all symbols (@#$%!) from text instantly. Free, no login, works in browser.',
    description: 'Remove special characters online for free in 1 click. Strip symbols, @#$%, punctuation and more from any text. Perfect for database entries, filenames, URLs and data cleaning. No signup required.',
    icon: 'ShieldAlert',
    keywords: ['remove special characters online free', 'alphanumeric text only tool', 'clean text symbols and icons', 'sanitize text for database', 'remove non-alphanumeric characters'],
    primaryKeyword: 'remove special characters online free',
    secondaryKeywords: ['alphanumeric text only tool', 'clean text symbols and icons'],
    example: 'Hello! How are you? (I am fine @ home).',
    hook: 'Clean your text by removing all special characters and symbols.',
    buttonText: 'Clean My Text',
    placeholder: 'Paste text with special characters here...',
    process: (input) => input.replace(/[^a-zA-Z0-9\s]/g, ''),
  },
  {
    id: 'remove-html-tags',
    name: 'Remove HTML Tags Online - Strip HTML Free ⚡',
    slug: 'remove-html-tags-online',
    category: 'cleaning',
    shortDescription: 'Strip all HTML tags from your code to get clean plain text.',
    description: 'Remove HTML tags online free. Convert HTML to plain text instantly by stripping out all tags, scripts, and styles. Ideal for extracting content from web pages.',
    icon: 'Code',
    keywords: ['remove html tags online free', 'html to plain text converter', 'strip html tags from code', 'clean html text tool', 'extract text from html string'],
    primaryKeyword: 'remove html tags online free',
    secondaryKeywords: ['html to plain text converter', 'strip html tags from code'],
    example: '<p>Visit <a href="https://texlyonline.in">Texly</a> for free text tools.</p>',
    hook: 'Strip all HTML tags and keep only the plain text.',
    buttonText: 'Clean My HTML',
    placeholder: 'Paste HTML code here...',
    process: (input) => input.replace(/<[^>]*>/g, ''),
  },

  // CONVERTERS
  {
    id: 'upper-case',
    name: 'Upper Case Converter: Change Text Case Instantly (Free Tool ⚡)',
    slug: 'upper-case-converter',
    category: 'converter',
    shortDescription: 'Convert text to uppercase online. Change all your text to capital letters.',
    description: 'Convert text to uppercase online for free. Our uppercase converter makes your text stand out with all caps instantly. Perfect for headings, warnings, or emphasis.',
    icon: 'Type',
    keywords: ['convert text to uppercase online free', 'uppercase converter tool', 'all caps text generator', 'capitalize all letters online', 'make text uppercase instantly'],
    primaryKeyword: 'convert text to uppercase online free',
    secondaryKeywords: ['uppercase converter tool', 'all caps text generator'],
    example: 'convert this text to uppercase',
    process: (input) => input.toUpperCase(),
  },
  {
    id: 'lower-case',
    name: 'Lower Case Converter: Change Text Case Instantly (Free Tool ⚡)',
    slug: 'lower-case-converter',
    category: 'converter',
    shortDescription: 'Convert text to lowercase online. Change all your text to small letters.',
    description: 'Convert text to lowercase online for free. Use our lowercase converter tool to quickly change any text to small letters. Great for normalizing data or fixing accidental caps lock.',
    icon: 'Type',
    keywords: ['convert text to lowercase online free', 'lowercase converter tool', 'small letters text generator', 'make text lowercase instantly', 'fix caps lock text online'],
    primaryKeyword: 'convert text to lowercase online free',
    secondaryKeywords: ['lowercase converter tool', 'small letters text generator'],
    example: 'CONVERT THIS TEXT TO LOWERCASE',
    process: (input) => input.toLowerCase(),
  },
  {
    id: 'title-case',
    name: 'Title Case Converter: Change Text Case Instantly (Free Tool ⚡)',
    slug: 'title-case-converter',
    category: 'converter',
    shortDescription: 'Capitalize the first letter of every word for professional titles.',
    description: 'Title case converter online. Perfect for headings, book titles, and professional documents. Automatically capitalizes the first letter of each word.',
    icon: 'Heading',
    keywords: ['title case converter online free', 'capitalize headings and titles', 'proper case text tool', 'title capitalization tool online', 'format book titles online'],
    primaryKeyword: 'title case converter online free',
    secondaryKeywords: ['capitalize headings and titles', 'proper case text tool'],
    example: 'the quick brown fox jumps over the lazy dog',
    process: (input) => input.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
  },
  {
    id: 'slug-generator',
    name: 'Slug Generator',
    slug: 'slug-generator-online-free',
    category: 'converter',
    shortDescription: 'Slug generator online free. Create SEO-friendly URL slugs from any text.',
    description: 'Slug generator online free. Create SEO friendly URLs by converting titles into clean, hyphenated URL paths. Perfect for bloggers, developers, and SEO experts.',
    icon: 'Link',
    keywords: ['slug generator online free', 'create seo friendly url slug', 'url slug creator tool', 'convert title to slug online', 'clean url generator for blog'],
    primaryKeyword: 'slug generator online free',
    secondaryKeywords: ['create seo friendly url slug', 'url slug creator tool'],
    example: 'How to use Texlyonline.in for free text tools',
    hook: 'Create SEO-friendly URL slugs for your blog or website instantly.',
    buttonText: 'Generate Slug',
    placeholder: 'Paste your title or phrase here...',
    process: (input) => input.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, ''),
  },
  {
    id: 'binary-to-text',
    name: 'Binary to Text',
    slug: 'binary-to-text-converter',
    category: 'converter',
    shortDescription: 'Decode binary code (0101) into readable text instantly.',
    description: 'Binary to text converter online. Translate binary strings back to English for free. Perfect for decoding hidden messages or learning how binary works.',
    icon: 'Binary',
    keywords: ['binary to text converter online free', 'decode binary to english tool', 'binary code translator', 'convert 0101 to text online', 'binary string decoder'],
    primaryKeyword: 'binary to text converter online free',
    secondaryKeywords: ['decode binary to english tool', 'binary code translator'],
    example: '01001000 01100101 01101100 01101100 01101111',
    process: (input) => input.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join(''),
  },
  {
    id: 'text-to-binary',
    name: 'Text to Binary',
    slug: 'text-to-binary-converter',
    category: 'converter',
    shortDescription: 'Convert any text into binary code (0s and 1s) online.',
    description: 'Text to binary converter online for free. Encode your messages into binary format instantly. Great for computer science students and encoding secret notes.',
    icon: 'Binary',
    keywords: ['text to binary converter online free', 'encode text to binary tool', 'english to binary translator', 'convert text to 0101 online', 'binary code encoder'],
    primaryKeyword: 'text to binary converter online free',
    secondaryKeywords: ['encode text to binary tool', 'english to binary translator'],
    example: 'Hello',
    process: (input) => input.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' '),
  },

  // ANALYSIS
  {
    id: 'word-counter',
    name: 'Word Counter Online: Get Instant Stats (100% Free ⚡)',
    slug: 'word-counter-online-free',
    category: 'analysis',
    shortDescription: 'Word counter online free. Count words, characters, and sentences in your text.',
    description: 'Word counter online free. Count words in text and get accurate character statistics with our text word count tool. Perfect for writers, students, and content creators.',
    icon: 'FileText',
    keywords: ['word counter online free', 'count words in text', 'text word count tool', 'character counter online', 'text statistics generator'],
    primaryKeyword: 'word counter online free',
    secondaryKeywords: ['count words in text', 'text word count tool'],
    example: 'This is a sample text for word counting.',
    process: (input) => {
      const words = input.trim() ? input.trim().split(/\s+/).length : 0;
      const chars = input.length;
      const lines = input.split(/\r?\n/).length;
      return `Words: ${words}\nCharacters: ${chars}\nLines: ${lines}`;
    },
  },
  {
    id: 'character-counter',
    name: 'Character Counter',
    slug: 'character-counter-tool',
    category: 'analysis',
    shortDescription: 'Character counter tool. Count characters with and without spaces.',
    description: 'Character counter tool online for free. Get the exact character count of your text instantly. Useful for social media posts, Meta descriptions, and SMS limits.',
    icon: 'Type',
    keywords: ['character counter tool online', 'count characters in text', 'letter count tool', 'character count with spaces', 'text length checker'],
    primaryKeyword: 'character counter tool online',
    secondaryKeywords: ['count characters in text', 'letter count tool'],
    example: 'How many characters are in this sentence?',
    process: (input) => {
      const withSpaces = input.length;
      const withoutSpaces = input.replace(/\s/g, '').length;
      return `Characters (with spaces): ${withSpaces}\nCharacters (without spaces): ${withoutSpaces}`;
    },
  },
  {
    id: 'text-cleaner',
    name: 'Text Cleaner',
    slug: 'clean-text-online-free',
    category: 'cleaning',
    shortDescription: 'Clean text online free. Fix messy text formatting and remove unwanted characters.',
    description: 'Clean text online for free. Our text cleaner tool removes unwanted formatting, extra spaces, and line breaks to give you perfectly polished text.',
    icon: 'Eraser',
    keywords: ['clean text online free', 'text formatting cleaner', 'remove formatting from text', 'fix text spacing online', 'clean up messy text tool'],
    primaryKeyword: 'clean text online free',
    secondaryKeywords: ['text formatting cleaner', 'remove formatting from text'],
    example: '  This   text   has   too   many   spaces.  ',
    process: (input) => input.replace(/\s+/g, ' ').trim(),
  },
  {
    id: 'reading-time',
    name: 'Reading Time Calculator',
    slug: 'reading-time-calculator-online',
    category: 'analysis',
    shortDescription: 'Reading time calculator online. Estimate how long it takes to read your text.',
    description: 'Reading time calculator online for free. Estimate the reading time of your articles, blog posts, or essays based on average reading speed.',
    icon: 'Clock',
    keywords: ['reading time calculator online', 'estimate reading time for blog', 'text reading speed tool', 'how long to read this text', 'article reading time estimator'],
    primaryKeyword: 'reading time calculator online',
    secondaryKeywords: ['estimate reading time for blog', 'text reading speed tool'],
    example: 'Paste your long article here to see how long it takes to read.',
    process: (input) => {
      const words = input.trim() ? input.trim().split(/\s+/).length : 0;
      const minutes = Math.ceil(words / 200);
      return `Estimated Reading Time: ${minutes} minute${minutes !== 1 ? 's' : ''} (based on 200 wpm)`;
    },
  },

  // UTILITY
  {
    id: 'text-reverser',
    name: 'Text Reverser',
    slug: 'text-reverser-online',
    category: 'utility',
    shortDescription: 'Flip your text backwards or reverse word order instantly.',
    description: 'Text reverser online for free. Reverse characters, words, or entire paragraphs for fun, puzzles, or coding challenges. A simple yet powerful text flipper.',
    icon: 'RotateCcw',
    keywords: ['text reverser online free', 'backward text generator', 'reverse words in sentence', 'flip text backwards tool', 'mirror text online'],
    primaryKeyword: 'text reverser online free',
    secondaryKeywords: ['backward text generator', 'reverse words in sentence'],
    example: 'Check out https://texlyonline.in for more tools!',
    process: (input) => input.split('').reverse().join(''),
  },
  {
    id: 'text-repeater',
    name: 'Text Repeater',
    slug: 'text-repeater-tool',
    category: 'utility',
    shortDescription: 'Repeat a piece of text as many times as you want online.',
    description: 'Text repeater tool online for free. Generate repetitive text for testing, social media, or fun. Simply enter your text and the number of repetitions.',
    icon: 'Repeat',
    keywords: ['text repeater tool online', 'duplicate text multiple times', 'text multiplier generator', 'repeat text 1000 times', 'spam text generator'],
    primaryKeyword: 'text repeater tool online',
    secondaryKeywords: ['duplicate text multiple times', 'text multiplier generator'],
    example: 'Repeat me!',
    process: (input, options) => {
      const count = options?.count || 10;
      return new Array(Number(count)).fill(input).join('\n');
    },
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    slug: 'lorem-ipsum-generator-online',
    category: 'utility',
    shortDescription: 'Generate placeholder text for your designs and layouts online.',
    description: 'Lorem ipsum generator online for free. Create dummy text in paragraphs, sentences, or words for your web design and layout projects instantly.',
    icon: 'FileJson',
    keywords: ['lorem ipsum generator online free', 'placeholder text generator', 'dummy text for web design', 'generate filler text online', 'latin text generator'],
    primaryKeyword: 'lorem ipsum generator online free',
    secondaryKeywords: ['placeholder text generator', 'dummy text for web design'],
    example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    process: () => "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  },
  {
    id: 'find-replace',
    name: 'Find and Replace',
    slug: 'find-and-replace-text-online',
    category: 'utility',
    shortDescription: 'Search for specific text and replace it with something else online.',
    description: 'Find and replace text online for free. Bulk replace words or phrases in your content instantly. Perfect for editing long documents or code snippets.',
    icon: 'Search',
    keywords: ['find and replace text online free', 'bulk replace words in text', 'text search and replace tool', 'find and replace string online', 'mass replace text tool'],
    primaryKeyword: 'find and replace text online free',
    secondaryKeywords: ['bulk replace words in text', 'text search and replace tool'],
    example: 'The quick brown fox jumps over the lazy dog.',
    process: (input, options) => {
      if (!options?.find) return input;
      const regex = new RegExp(options.find, 'g');
      return input.replace(regex, options.replace || '');
    },
  },
  {
    id: 'sort-lines',
    name: 'Sort Lines',
    slug: 'sort-lines-alphabetically',
    category: 'utility',
    shortDescription: 'Sort your list or lines of text alphabetically (A-Z or Z-A) online.',
    description: 'Sort lines alphabetically online for free. Organize your lists, names, or data points instantly with our easy-to-use text sorter tool.',
    icon: 'SortAsc',
    keywords: ['sort lines alphabetically online free', 'alphabetize list tool', 'text sorter online', 'sort lines a to z', 'organize list alphabetically'],
    primaryKeyword: 'sort lines alphabetically online free',
    secondaryKeywords: ['alphabetize list tool', 'text sorter online'],
    example: 'Zebra\nApple\nMonkey\nBanana',
    process: (input) => input.split(/\r?\n/).sort().join('\n'),
  },
];

// Add more tools to reach 50+
const additionalTools: Tool[] = [
  { id: 'camel-case', name: 'Camel Case', slug: 'camel-case-converter', category: 'converter', shortDescription: 'Convert text to camelCase online.', description: 'Camel case converter online for free. Transform your text into camelCase format instantly, perfect for programming variable names and coding standards.', icon: 'Type', keywords: ['camel case converter online free', 'convert text to camelcase', 'camelcase generator tool', 'code variable name formatter', 'programming text converter'], primaryKeyword: 'camel case converter online free', secondaryKeywords: ['convert text to camelcase', 'camelcase generator tool'], example: 'hello world', process: (s) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w, i) => i === 0 ? w.toLowerCase() : w.toUpperCase()).replace(/\s+/g, '') },
  { id: 'snake-case', name: 'Snake Case', slug: 'snake-case-converter', category: 'converter', shortDescription: 'Convert text to snake_case online.', description: 'Snake case converter online for free. Transform your text into snake_case format instantly, ideal for database fields, filenames, and backend development.', icon: 'Type', keywords: ['snake case converter online free', 'convert text to snake_case', 'snake_case generator tool', 'database field name formatter', 'underscore text converter'], primaryKeyword: 'snake case converter online free', secondaryKeywords: ['convert text to snake_case', 'snake_case generator tool'], example: 'hello world', process: (s) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('_') || '' },
  { id: 'kebab-case', name: 'Kebab Case', slug: 'kebab-case-converter', category: 'converter', shortDescription: 'Convert text to kebab-case online.', description: 'Kebab case converter online for free. Transform your text into kebab-case format instantly, perfect for SEO-friendly URLs and CSS class names.', icon: 'Type', keywords: ['kebab case converter online free', 'convert text to kebab-case', 'kebab-case generator tool', 'seo url slug creator', 'hyphenated text converter'], primaryKeyword: 'kebab case converter online free', secondaryKeywords: ['convert text to kebab-case', 'kebab-case generator tool'], example: 'hello world', process: (s) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toLowerCase()).join('-') || '' },
  { id: 'pascal-case', name: 'Pascal Case', slug: 'pascal-case-converter', category: 'converter', shortDescription: 'Convert text to PascalCase online.', description: 'Pascal case converter online for free. Transform your text into PascalCase format instantly, often used for class names in object-oriented programming.', icon: 'Type', keywords: ['pascal case converter online free', 'convert text to pascalcase', 'pascalcase generator tool', 'programming class name formatter', 'capitalized word converter'], primaryKeyword: 'pascal case converter online free', secondaryKeywords: ['convert text to pascalcase', 'pascalcase generator tool'], example: 'hello world', process: (s) => s.replace(/(?:^\w|[A-Z]|\b\w)/g, (w) => w.toUpperCase()).replace(/\s+/g, '') },
  { id: 'constant-case', name: 'Constant Case', slug: 'constant-case-converter', category: 'converter', shortDescription: 'Convert text to CONSTANT_CASE online.', description: 'Constant case converter online for free. Transform your text into CONSTANT_CASE format instantly, used for constants in many programming languages.', icon: 'Type', keywords: ['constant case converter online free', 'convert text to constant_case', 'constant_case generator tool', 'programming constant formatter', 'uppercase underscore converter'], primaryKeyword: 'constant case converter online free', secondaryKeywords: ['convert text to constant_case', 'constant_case generator tool'], example: 'hello world', process: (s) => s.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.map(x => x.toUpperCase()).join('_') || '' },
  { id: 'alternating-case', name: 'Alternating Case', slug: 'alternating-case-converter', category: 'converter', shortDescription: 'Convert text to AlTeRnAtInG CaSe online.', description: 'Alternating case converter online for free. Create a fun and unique AlTeRnAtInG CaSe effect for your text, often used for sarcastic or mocking tones online.', icon: 'Type', keywords: ['alternating case converter online free', 'sarcastic text generator', 'mocking spongebob text generator', 'sticky caps text tool', 'funny text case converter'], primaryKeyword: 'alternating case converter online free', secondaryKeywords: ['sarcastic text generator', 'mocking spongebob text generator'], example: 'hello world', process: (s) => s.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('') },
  { id: 'inverse-case', name: 'Inverse Case', slug: 'inverse-case-converter', category: 'converter', shortDescription: 'Invert the case of each character online.', description: 'Inverse case converter online for free. Flip uppercase to lowercase and vice-versa for every character in your text instantly. Great for fixing accidental caps lock usage.', icon: 'Type', keywords: ['inverse case converter online free', 'case flipper tool', 'invert text case online', 'swap case of characters', 'reverse text capitalization'], primaryKeyword: 'inverse case converter online free', secondaryKeywords: ['case flipper tool', 'invert text case online'], example: 'Hello World', process: (s) => s.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join('') },
  { id: 'sentence-case', name: 'Sentence Case Converter: Fix Text Formatting Instantly (Free ⚡)', slug: 'sentence-case-converter', category: 'converter', shortDescription: 'Messy text? Convert to Sentence case instantly. Our free tool fixes capitalization for you in 1 click. No signup, 100% free & fast!', description: 'Sentence case converter online for free. Automatically capitalize the first letter of every sentence in your text, making it grammatically correct and readable.', icon: 'Type', keywords: ['sentence case converter online free', 'capitalize sentences in text', 'proper sentence case tool', 'fix sentence capitalization online', 'sentence case formatter'], primaryKeyword: 'sentence case converter online free', secondaryKeywords: ['capitalize sentences in text', 'proper sentence case tool'], example: 'hello world. this is a test.', process: (s) => s.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase()) },
  { id: 'remove-accents', name: 'Remove Accents & Diacritics Online - Free Tool ⚡', slug: 'remove-accents-from-text', category: 'cleaning', shortDescription: 'Strip accents and diacritics from characters online.', description: 'Remove accents from text online for free. Convert accented characters like é, à, ö into their plain versions (e, a, o) instantly. Ideal for data normalization and search indexing.', icon: 'Type', keywords: ['remove accents from text online free', 'strip diacritics from characters', 'normalize accented text tool', 'remove special marks from letters', 'convert accented to plain text'], primaryKeyword: 'remove accents from text online free', secondaryKeywords: ['strip diacritics from characters', 'normalize accented text tool'], example: 'Crème brûlée', process: (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "") },
  { id: 'remove-emojis', name: 'Remove Emojis from Text Online - Clean Text Free ⚡', slug: 'remove-emojis-online', category: 'cleaning', shortDescription: 'Strip all emojis and graphical symbols from text online.', description: 'Remove emojis online for free. Clean your text by removing all graphical emojis and symbols, leaving only plain text and numbers. Perfect for professional documents.', icon: 'Smile', keywords: ['remove emojis from text online free', 'strip emojis from string tool', 'text only without emojis generator', 'clean emojis from content', 'remove graphical symbols from text'], primaryKeyword: 'remove emojis from text online free', secondaryKeywords: ['strip emojis from string tool', 'text only without emojis generator'], example: 'Hello 🌍! How are you? 😊', process: (s) => s.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDDFF])/g, '') },
  { id: 'remove-punctuation', name: 'Remove Punctuation Online - Strip Symbols Free ⚡', slug: 'remove-punctuation-tool', category: 'cleaning', shortDescription: 'Strip all punctuation marks and symbols from text online.', description: 'Remove punctuation tool online for free. Strip commas, periods, exclamation marks, and other symbols from your text instantly. Great for text analysis and data cleaning.', icon: 'Type', keywords: ['remove punctuation from text online free', 'strip punctuation marks tool', 'text without symbols generator', 'clean punctuation from string', 'remove special characters from text'], primaryKeyword: 'remove punctuation from text online free', secondaryKeywords: ['strip punctuation marks tool', 'text without symbols generator'], example: 'Hello, world! (This is a test.)', process: (s) => s.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "") },
  { id: 'base64-encode', name: 'Base64 Encode', slug: 'base64-encode-online', category: 'converter', shortDescription: 'Encode text to Base64 format online.', description: 'Base64 encode online for free. Convert plain text into Base64 encoded strings instantly for secure data transmission and storage.', icon: 'Shield', keywords: ['base64 encode online free', 'convert text to base64 tool', 'base64 encoder online', 'string to base64 converter', 'encode data to base64'], primaryKeyword: 'base64 encode online free', secondaryKeywords: ['convert text to base64 tool', 'base64 encoder online'], example: 'Hello World', process: (s) => btoa(s) },
  { id: 'base64-decode', name: 'Base64 Decode', slug: 'base64-decode-online', category: 'converter', shortDescription: 'Decode Base64 strings to text online.', description: 'Base64 decode online for free. Convert Base64 encoded strings back into readable plain text instantly. Perfect for developers and data analysis.', icon: 'Shield', keywords: ['base64 decode online free', 'base64 to text converter', 'base64 decoder tool', 'decode base64 string online', 'base64 to plain text'], primaryKeyword: 'base64 decode online free', secondaryKeywords: ['base64 to text converter', 'base64 decoder tool'], example: 'SGVsbG8gV29ybGQ=', process: (s) => { try { return atob(s); } catch(e) { return "Invalid Base64"; } } },
  { id: 'url-encode', name: 'URL Encode', slug: 'url-encode-online', category: 'converter', shortDescription: 'Encode URL characters online.', description: 'URL encoder online for free. Convert special characters in URLs into a safe format for internet transmission (percent-encoding).', icon: 'Globe', keywords: ['url encode online free', 'percent encoding tool', 'url encoder online', 'encode url parameters', 'safe url character converter'], primaryKeyword: 'url encode online free', secondaryKeywords: ['percent encoding tool', 'url encoder online'], example: 'https://texlyonline.in/search?q=text tools', process: (s) => encodeURIComponent(s) },
  { id: 'url-decode', name: 'URL Decode', slug: 'url-decode-online', category: 'converter', shortDescription: 'Decode percent-encoded URLs online.', description: 'URL decoder online for free. Convert percent-encoded URLs back to readable text instantly. Great for analyzing URL parameters.', icon: 'Globe', keywords: ['url decode online free', 'percent decoding tool', 'url decoder online', 'decode url string', 'readable url converter'], primaryKeyword: 'url decode online free', secondaryKeywords: ['percent decoding tool', 'url decoder online'], example: 'https%3A%2F%2Ftexlyonline.in%2Fsearch%3Fq%3Dtext%20tools', process: (s) => decodeURIComponent(s) },
  { id: 'rot13', name: 'ROT13 Cipher - Encode & Decode Text Online Free ⚡', slug: 'rot13-cipher-online', category: 'converter', shortDescription: 'Encode or decode text using ROT13 cipher online.', description: 'ROT13 cipher online for free. A simple substitution cipher that replaces a letter with the 13th letter after it. Fun for puzzles and basic encryption.', icon: 'Lock', keywords: ['rot13 cipher online free', 'rot13 encoder tool', 'rot13 decoder online', 'simple substitution cipher', 'caesar cipher rot13'], primaryKeyword: 'rot13 cipher online free', secondaryKeywords: ['rot13 encoder tool', 'rot13 decoder online'], example: 'Hello World', process: (s) => s.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = code <= 90 ? 65 : 97;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  }) },
  { id: 'morse-code', name: 'Morse Code Translator', slug: 'morse-code-translator', category: 'converter', shortDescription: 'Translate text to Morse code online.', description: 'Morse code translator online for free. Convert any text into international Morse code dots and dashes instantly. Educational and fun for all ages.', icon: 'Radio', keywords: ['morse code translator online', 'text to morse code converter', 'morse code encoder tool', 'learn morse code online', 'international morse code translator'], primaryKeyword: 'morse code translator online', secondaryKeywords: ['text to morse code converter', 'morse code encoder tool'], example: 'Hello', process: (s) => {
    const map: any = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/' };
    return s.toUpperCase().split('').map(c => map[c] || '').join(' ');
  }},
  { id: 'upside-down', name: 'Upside Down Text', slug: 'upside-down-text-generator', category: 'utility', shortDescription: 'Flip your text upside down online.', description: 'Upside down text generator online for free. Create flipped and reversed text instantly for social media, fun messages, or unique profile names.', icon: 'RotateCw', keywords: ['upside down text generator online free', 'flip text online tool', 'inverted text creator', 'upside down letters generator', 'reverse text upside down'], primaryKeyword: 'upside down text generator online free', secondaryKeywords: ['flip text online tool', 'inverted text creator'], example: 'Hello World', process: (s) => {
    const map: any = { 'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z', 'A': '∀', 'B': 'B', 'C': 'Ɔ', 'D': 'D', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': 'פ', 'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ᴚ', 'S': 'S', 'T': '┴', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0', '.': '˙', ',': "'", "'": ',', '"': '„', '?': '¿', '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', '_': '‾' };
    return s.split('').map(c => map[c] || c).reverse().join('');
  }},
  { id: 'mirror-text', name: 'Mirror Text Generator - Reverse & Flip Text Online ⚡', slug: 'mirror-text-generator', category: 'utility', shortDescription: 'Create a mirror image of your text online.', description: 'Mirror text generator online for free. Flip your text horizontally to create a mirrored effect instantly. Great for creative designs and fun messages.', icon: 'Columns', keywords: ['mirror text generator online free', 'reverse text online tool', 'mirrored writing creator', 'horizontal text flipper', 'backwards text generator'], primaryKeyword: 'mirror text generator online free', secondaryKeywords: ['reverse text online tool', 'mirrored writing creator'], example: 'Hello World', process: (s) => s.split('').reverse().join('') },
  {
    id: 'qr-code-generator',
    name: 'QR Code Generator',
    slug: 'qr-code-generator-online',
    category: 'generator',
    shortDescription: 'Generate custom QR codes for URLs, text, and more instantly.',
    description: 'QR code generator online for free. Create custom QR codes for your website, contact info, or any text instantly. Download your QR code as a high-quality image.',
    icon: 'QrCode',
    keywords: ['qr code generator online', 'create qr code free', 'custom qr code maker', 'qr code for url', 'download qr code image'],
    example: 'https://texlyonline.in',
    process: (s) => s
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    slug: 'unit-converter-online',
    category: 'converter',
    shortDescription: 'Convert between length, weight, temperature, and other units.',
    description: 'Unit converter online for free. Convert between metric and imperial units for length, weight, temperature, area, and volume instantly.',
    icon: 'Scale',
    keywords: ['unit converter online', 'length converter free', 'weight converter online', 'temperature converter tool', 'metric to imperial converter'],
    example: '10',
    process: (s, opts) => {
      const val = parseFloat(s);
      if (isNaN(val)) return "Invalid Number";
      const from = opts?.from || 'km';
      const to = opts?.to || 'miles';
      
      const conversions: any = {
        'km-miles': val * 0.621371,
        'miles-km': val / 0.621371,
        'kg-lbs': val * 2.20462,
        'lbs-kg': val / 2.20462,
        'c-f': (val * 9/5) + 32,
        'f-c': (val - 32) * 5/9,
        'm-ft': val * 3.28084,
        'ft-m': val / 3.28084
      };
      
      const key = `${from}-${to}`;
      return conversions[key] ? conversions[key].toFixed(4) : "Conversion not supported";
    }
  },
  {
    id: 'color-palette-generator',
    name: 'Color Palette Generator',
    slug: 'color-palette-generator-online',
    category: 'generator',
    shortDescription: 'Generate beautiful color palettes and schemes online.',
    description: 'Color palette generator online for free. Create stunning color schemes for your website or design project. Explore trending palettes and export hex codes.',
    icon: 'Palette',
    keywords: ['color palette generator', 'color scheme maker', 'trending color palettes', 'hex code generator', 'design color tool'],
    example: 'Click generate to get a new palette.',
    process: () => {
      const genColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      return Array.from({length: 5}, genColor).join(',');
    }
  },
  {
    id: 'base64-image-converter',
    name: 'Base64 Image Converter',
    slug: 'base64-to-image-converter',
    category: 'converter',
    shortDescription: 'Convert images to Base64 strings or vice versa.',
    description: 'Base64 image converter online for free. Convert your images to Base64 data strings or decode Base64 back into images instantly.',
    icon: 'Image',
    keywords: ['base64 image converter', 'image to base64 online', 'base64 to image tool', 'convert photo to base64', 'base64 data uri generator'],
    example: 'Upload an image or paste Base64 string.',
    process: (s) => s
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    slug: 'age-calculator-online',
    category: 'analysis',
    shortDescription: 'Calculate your exact age in years, months, and days.',
    description: 'Age calculator online for free. Find out your exact age from your birth date. Get detailed breakdown in years, months, weeks, and days.',
    icon: 'Calendar',
    keywords: ['age calculator online', 'calculate age from birth date', 'exact age calculator', 'how old am i tool', 'age in days calculator'],
    example: '1990-01-01',
    process: (s) => {
      if (!s) return "Enter birth date";
      const birth = new Date(s);
      const now = new Date();
      if (isNaN(birth.getTime())) return "Invalid Date";
      
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      let days = now.getDate() - birth.getDate();
      
      if (days < 0) {
        months--;
        days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }
      
      return `Age: ${years} Years, ${months} Months, ${days} Days`;
    }
  },
  { id: 'line-counter', name: 'Line Counter', slug: 'line-counter-online', category: 'analysis', shortDescription: 'Count the number of lines in your text online.', description: 'Line counter online for free. Quickly find out exactly how many lines are in your document, list, or code snippet instantly.', icon: 'List', keywords: ['line counter online free', 'count lines in text tool', 'text line count analyzer', 'online line number counter', 'how many lines in text'], primaryKeyword: 'line counter online free', secondaryKeywords: ['count lines in text tool', 'text line count analyzer'], example: 'Line 1\nLine 2\nLine 3', process: (s) => `Lines: ${s.split(/\r?\n/).length}` },
  { id: 'sentence-counter', name: 'Sentence Counter', slug: 'sentence-counter-online', category: 'analysis', shortDescription: 'Count the number of sentences online.', description: 'Sentence counter online for free. Analyze your text to find the total number of sentences instantly. Perfect for writers and students.', icon: 'Type', keywords: ['sentence counter online free', 'count sentences in text tool', 'text analysis sentence count', 'online sentence number counter', 'how many sentences in text'], primaryKeyword: 'sentence counter online free', secondaryKeywords: ['count sentences in text tool', 'text analysis sentence count'], example: 'Hello world. This is a test! How are you?', process: (s) => `Sentences: ${s.split(/[\.\!\?]+/).filter(Boolean).length}` },
  { id: 'paragraph-counter', name: 'Paragraph Counter', slug: 'paragraph-counter-online', category: 'analysis', shortDescription: 'Count the number of paragraphs online.', description: 'Paragraph counter online for free. Get an accurate count of paragraphs in your content instantly. Ideal for blog posts and essays.', icon: 'AlignLeft', keywords: ['paragraph counter online free', 'count paragraphs in text tool', 'text structure analysis tool', 'online paragraph number counter', 'how many paragraphs in text'], primaryKeyword: 'paragraph counter online free', secondaryKeywords: ['count paragraphs in text tool', 'text structure analysis tool'], example: 'Paragraph 1\n\nParagraph 2', process: (s) => `Paragraphs: ${s.split(/\n\s*\n/).filter(Boolean).length}` },
  { id: 'text-to-list', name: 'Text to List', slug: 'text-to-list-converter', category: 'utility', shortDescription: 'Convert lines of text into a bulleted list online.', description: 'Text to list converter online for free. Automatically add bullet points or numbering to every line of your text instantly. Great for organizing notes.', icon: 'List', keywords: ['text to list converter online free', 'bullet point generator tool', 'list maker online free', 'convert lines to list', 'automatic list creator'], primaryKeyword: 'text to list converter online free', secondaryKeywords: ['bullet point generator tool', 'list maker online free'], example: 'Item 1\nItem 2\nItem 3', process: (s) => s.split(/\r?\n/).map(line => `• ${line}`).join('\n') },
  { id: 'add-prefix', name: 'Add Prefix/Suffix', slug: 'add-prefix-suffix-to-lines', category: 'utility', shortDescription: 'Add text to the beginning or end of each line online.', description: 'Add prefix or suffix to lines online for free. Bulk add characters, words, or symbols to the start or end of every line instantly.', icon: 'Plus', keywords: ['add prefix to lines online free', 'add suffix to lines tool', 'bulk text adder online', 'prefix suffix generator', 'line prefix suffix tool'], primaryKeyword: 'add prefix to lines online free', secondaryKeywords: ['add suffix to lines tool', 'bulk text adder online'], example: 'Line 1\nLine 2', process: (s, opts) => s.split(/\r?\n/).map(line => `${opts?.prefix || ''}${line}${opts?.suffix || ''}`).join('\n') },
  { id: 'random-string', name: 'Random String Generator', slug: 'random-string-generator-online', category: 'utility', shortDescription: 'Generate a random string of characters online.', description: 'Random string generator online for free. Create secure, random strings for passwords, testing, or unique identifiers instantly.', icon: 'Shuffle', keywords: ['random string generator online free', 'password generator tool', 'random text creator online', 'secure string generator', 'random character generator'], primaryKeyword: 'random string generator online free', secondaryKeywords: ['password generator tool', 'random text creator online'], example: 'Click generate to get a random string.', process: (_, opts) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = opts?.length || 16;
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
  }},
  { id: 'remove-all-whitespace', name: 'Remove All Whitespace', slug: 'remove-all-whitespace-online', category: 'cleaning', shortDescription: 'Remove all spaces and tabs from text online.', description: 'Remove all whitespace online for free. Strip every single space, tab, and newline from your content instantly for clean data.', icon: 'Minimize', keywords: ['remove all whitespace online free', 'strip all spaces from text', 'no space text generator', 'clean whitespace from string', 'remove spaces and tabs'], primaryKeyword: 'remove all whitespace online free', secondaryKeywords: ['strip all spaces from text', 'no space text generator'], example: 'This is a text with spaces.', process: (s) => s.replace(/\s/g, '') },
  { id: 'text-density', name: 'Text Density Analyzer', slug: 'text-density-analyzer', category: 'analysis', shortDescription: 'Analyze word frequency and density online.', description: 'Text density analyzer online for free. Find the most frequently used words in your text for SEO analysis and content optimization.', icon: 'BarChart', keywords: ['text density analyzer online free', 'word frequency counter tool', 'keyword density tool online', 'analyze text density', 'content optimization tool'], primaryKeyword: 'text density analyzer online free', secondaryKeywords: ['word frequency counter tool', 'keyword density tool online'], example: 'The quick brown fox jumps over the lazy dog. The dog was lazy.', process: (s) => {
    const words = s.toLowerCase().match(/\w+/g) || [];
    const freq: any = {};
    words.forEach(w => freq[w] = (freq[w] || 0) + 1);
    return Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10).map(([w, f]) => `${w}: ${f}`).join('\n');
  }},
  { id: 'case-distribution', name: 'Case Distribution', slug: 'case-distribution-analyzer', category: 'analysis', shortDescription: 'Analyze the distribution of character cases online.', description: 'Case distribution analyzer online for free. Get detailed statistics on uppercase, lowercase, and numeric characters in your text instantly.', icon: 'PieChart', keywords: ['case distribution analyzer online free', 'text case stats tool', 'character analysis online', 'case distribution statistics', 'analyze text capitalization'], primaryKeyword: 'case distribution analyzer online free', secondaryKeywords: ['text case stats tool', 'character analysis online'], example: 'Hello World 123', process: (s) => {
    const upper = (s.match(/[A-Z]/g) || []).length;
    const lower = (s.match(/[a-z]/g) || []).length;
    const nums = (s.match(/[0-9]/g) || []).length;
    return `Uppercase: ${upper}\nLowercase: ${lower}\nNumbers: ${nums}`;
  }},
  { id: 'json-formatter', name: 'JSON Formatter', slug: 'json-formatter-online', category: 'utility', shortDescription: 'Format and prettify JSON code online.', description: 'JSON formatter online for free. Prettify messy JSON strings into a readable, indented format instantly. Essential tool for developers and data engineers.', icon: 'Braces', keywords: ['json formatter online free', 'prettify json online', 'json beautifier tool', 'format json string', 'readable json generator'], primaryKeyword: 'json formatter online free', secondaryKeywords: ['prettify json online', 'json beautifier tool'], example: '{"name":"John","age":30,"city":"New York"}', process: (s) => { try { return JSON.stringify(JSON.parse(s), null, 2); } catch(e) { return "Invalid JSON"; } } },
  { id: 'csv-to-json', name: 'CSV to JSON', slug: 'csv-to-json-converter', category: 'utility', shortDescription: 'Convert CSV data to JSON format online.', description: 'CSV to JSON converter online for free. Transform comma-separated values into structured JSON objects instantly. Perfect for data migration and analysis.', icon: 'Table', keywords: ['csv to json converter online', 'csv to json online free', 'convert csv to json tool', 'csv to json array generator', 'data format converter'], primaryKeyword: 'csv to json converter online', secondaryKeywords: ['csv to json online free', 'convert csv to json tool'], example: 'name,age,city\nJohn,30,New York\nJane,25,Los Angeles', process: (s) => {
    const lines = s.split('\n');
    const headers = lines[0].split(',');
    const result = lines.slice(1).map(line => {
      const data = line.split(',');
      return headers.reduce((obj: any, header, i) => {
        obj[header.trim()] = data[i]?.trim();
        return obj;
      }, {});
    });
    return JSON.stringify(result, null, 2);
  }},
  { id: 'extract-emails', name: 'Extract Emails', slug: 'extract-emails-from-text', category: 'analysis', shortDescription: 'Pull all email addresses from text online.', description: 'Extract emails from text online for free. Find and list all email addresses from any content instantly. Great for lead generation and data mining.', icon: 'Mail', keywords: ['extract emails from text online', 'email extractor tool free', 'find emails in text online', 'bulk email finder', 'email address scraper'], primaryKeyword: 'extract emails from text online', secondaryKeywords: ['email extractor tool free', 'find emails in text online'], example: 'Contact us at support@texly.online or info@example.com', process: (s) => (s.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi) || []).join('\n') },
  { id: 'extract-urls', name: 'Extract URLs', slug: 'extract-urls-from-text', category: 'analysis', shortDescription: 'Pull all website links from text online.', description: 'Extract URLs from text online for free. Find and list all website links and URLs from any content instantly. Useful for SEO and research.', icon: 'Link', keywords: ['extract urls from text online', 'url extractor tool free', 'find links in text online', 'bulk url finder', 'website link scraper'], primaryKeyword: 'extract urls from text online', secondaryKeywords: ['url extractor tool free', 'find links in text online'], example: 'Visit https://texlyonline.in and http://google.com', process: (s) => (s.match(/https?:\/\/[^\s]+/g) || []).join('\n') },
  { id: 'hex-encode', name: 'Text to Hex Converter - Convert Text to HEX Free ⚡', slug: 'text-to-hex-converter', category: 'converter', shortDescription: 'Convert plain text into hexadecimal format online.', description: 'Text to hex converter online for free. Transform your text into its hexadecimal representation instantly. Useful for debugging and data encoding.', icon: 'Binary', keywords: ['text to hex converter online', 'hex encoder tool free', 'string to hex online', 'convert text to hexadecimal', 'hexadecimal text generator'], primaryKeyword: 'text to hex converter online', secondaryKeywords: ['hex encoder tool free', 'string to hex online'], example: 'Hello', process: (s) => s.split('').map(c => c.charCodeAt(0).toString(16)).join(' ') },
  { id: 'hex-decode', name: 'Hex to Text Converter - Decode HEX to Text Free ⚡', slug: 'hex-to-text-converter', category: 'converter', shortDescription: 'Convert hexadecimal code back to text online.', description: 'Hex to text converter online for free. Decode hexadecimal strings back into readable plain text instantly. Perfect for developers and analysts.', icon: 'Binary', keywords: ['hex to text converter online', 'hex decoder tool free', 'hex to string online', 'decode hexadecimal text', 'hex to plain text converter'], primaryKeyword: 'hex to text converter online', secondaryKeywords: ['hex decoder tool free', 'hex to string online'], example: '48 65 6c 6c 6f', process: (s) => s.split(' ').map(h => String.fromCharCode(parseInt(h, 16))).join('') },
  { id: 'html-encode', name: 'HTML Entity Encoder', slug: 'html-entity-encoder', category: 'converter', shortDescription: 'Encode special characters into HTML entities online.', description: 'HTML entity encoder online for free. Convert special characters like <, >, and & into their HTML entity equivalents instantly for safe web display.', icon: 'Code', keywords: ['html entity encoder online', 'html escape tool free', 'encode html characters', 'html entity generator', 'safe html text converter'], primaryKeyword: 'html entity encoder online', secondaryKeywords: ['html escape tool free', 'encode html characters'], example: 'Hello & World < >', process: (s) => s.replace(/[\u00A0-\u9999<>\&]/g, (i) => '&#' + i.charCodeAt(0) + ';') },
  { id: 'html-decode', name: 'HTML Entity Decoder', slug: 'html-entity-decoder', category: 'converter', shortDescription: 'Decode HTML entities back to characters online.', description: 'HTML entity decoder online for free. Convert HTML entities like &#38; back into their original characters instantly. Essential for web developers.', icon: 'Code', keywords: ['html entity decoder online', 'html unescape tool free', 'decode html entities', 'html entity to text', 'readable html converter'], primaryKeyword: 'html entity decoder online', secondaryKeywords: ['html unescape tool free', 'decode html entities'], example: 'Hello &#38; World &#60; &#62;', process: (s) => {
    if (typeof DOMParser !== 'undefined') {
      const doc = new DOMParser().parseFromString(s, "text/html");
      return doc.documentElement.textContent || '';
    }
    return s.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
            .replace(/&[a-z]+;/gi, (match) => {
              const entities: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
              return entities[match] || match;
            });
  }},
  { id: 'remove-duplicate-words', name: 'Remove Duplicate Words Online - Clean Text Free ⚡', slug: 'remove-duplicate-words-online', category: 'cleaning', shortDescription: 'Remove repeating words from your text online.', description: 'Remove duplicate words online for free. Clean up your sentences by removing consecutive or redundant words instantly for better readability.', icon: 'Trash', keywords: ['remove duplicate words online free', 'deduplicate words in text', 'text cleaner duplicate words', 'remove repeating words tool', 'clean redundant words online'], primaryKeyword: 'remove duplicate words online free', secondaryKeywords: ['deduplicate words in text', 'text cleaner duplicate words'], example: 'This is is a a test test.', process: (s) => s.split(/\s+/).filter((w, i, a) => a.indexOf(w) === i).join(' ') },
  { id: 'zalgo-text', name: 'Zalgo Text Generator', slug: 'zalgo-text-generator', category: 'utility', shortDescription: 'Generate glitchy, distorted Zalgo text online.', description: 'Zalgo text generator online for free. Create creepy, distorted, and glitchy text effects instantly for fun, social media, or unique online identities.', icon: 'Zap', keywords: ['zalgo text generator online free', 'glitch text creator online', 'creepy text generator free', 'distorted text tool online', 'void text generator'], primaryKeyword: 'zalgo text generator online free', secondaryKeywords: ['glitch text creator online', 'creepy text generator free'], example: 'Zalgo is coming', process: (s) => {
    const zalgo_up = ['\u030d', '\u030e', '\u0304', '\u0305', '\u033f', '\u0311', '\u0306', '\u0310', '\u0352', '\u033c', '\u0351', '\u0307', '\u0308', '\u030a', '\u0342', '\u0343', '\u0344', '\u034a', '\u034b', '\u034c', '\u0303', '\u0302', '\u030c', '\u0350', '\u0300', '\u0301', '\u030b', '\u030f', '\u0312', '\u0313', '\u0314', '\u033d', '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b', '\u036c', '\u036d', '\u036e', '\u036f', '\u033e', '\u035b', '\u0346', '\u031a'];
    return s.split('').map(c => {
      let res = c;
      for(let i=0; i<3; i++) res += zalgo_up[Math.floor(Math.random()*zalgo_up.length)];
      return res;
    }).join('');
  }},
  { id: 'nato-phonetic', name: 'NATO Phonetic Alphabet', slug: 'nato-phonetic-alphabet-translator', category: 'converter', shortDescription: 'Convert text to NATO phonetic alphabet online.', description: 'NATO phonetic alphabet translator online for free. Convert letters into their corresponding code words (Alpha, Bravo, Charlie...) instantly for clear communication.', icon: 'Radio', keywords: ['nato phonetic alphabet translator', 'phonetic alphabet converter online', 'spelling alphabet tool free', 'alpha bravo charlie translator', 'military phonetic alphabet online'], primaryKeyword: 'nato phonetic alphabet translator', secondaryKeywords: ['phonetic alphabet converter online', 'spelling alphabet tool free'], example: 'Hello', process: (s) => {
    const map: any = { 'A': 'Alpha', 'B': 'Bravo', 'C': 'Charlie', 'D': 'Delta', 'E': 'Echo', 'F': 'Foxtrot', 'G': 'Golf', 'H': 'Hotel', 'I': 'India', 'J': 'Juliet', 'K': 'Kilo', 'L': 'Lima', 'M': 'Mike', 'N': 'November', 'O': 'Oscar', 'P': 'Papa', 'Q': 'Quebec', 'R': 'Romeo', 'S': 'Sierra', 'T': 'Tango', 'U': 'Uniform', 'V': 'Victor', 'W': 'Whiskey', 'X': 'X-ray', 'Y': 'Yankee', 'Z': 'Zulu' };
    return s.toUpperCase().split('').map(c => map[c] || c).join(' ');
  }},
  { id: 'text-to-ascii-banner', name: 'ASCII Banner Generator', slug: 'ascii-banner-generator', category: 'utility', shortDescription: 'Create simple ASCII art banners online.', description: 'ASCII banner generator online for free. Transform your text into large, stylized ASCII art banners instantly for comments, code headers, or fun.', icon: 'Layout', keywords: ['ascii banner generator online free', 'ascii art text creator', 'text to ascii banner tool', 'large text ascii generator', 'stylized text banner online'], primaryKeyword: 'ascii banner generator online free', secondaryKeywords: ['ascii art text creator', 'text to ascii banner tool'], example: 'Hello', process: (s) => s.split('').map(c => c.toUpperCase()).join('  ') },
  { id: 'remove-whitespace-trim', name: 'Trim Text Online - Remove Leading & Trailing Spaces ⚡', slug: 'trim-text-online', category: 'cleaning', shortDescription: 'Remove whitespace from both ends of text online.', description: 'Trim text online for free. Quickly remove all leading and trailing spaces from your content instantly for clean data formatting.', icon: 'Scissors', keywords: ['trim text online free', 'remove leading spaces tool', 'strip trailing whitespace online', 'clean text ends tool', 'text trimmer online free'], primaryKeyword: 'trim text online free', secondaryKeywords: ['remove leading spaces tool', 'strip trailing whitespace online'], example: '   Trim me   ', process: (s) => s.trim() },
  { id: 'whitespace-remover', name: 'Whitespace Remover', slug: 'whitespace-remover-online', category: 'cleaning', shortDescription: 'Remove all spaces and tabs from text online.', description: 'Whitespace remover online for free. Remove all spaces from text instantly for clean data, code, or formatting needs.', icon: 'Minimize', keywords: ['whitespace remover online free', 'remove all spaces from text tool', 'strip whitespace online free', 'clean spaces from string', 'no space text generator'], primaryKeyword: 'whitespace remover online free', secondaryKeywords: ['remove all spaces from text tool', 'strip whitespace online free'], example: 'This is a text with spaces.', process: (s) => s.replace(/\s/g, '') },
  { id: 'text-to-json', name: 'Text to JSON', slug: 'text-to-json-converter-online', category: 'utility', shortDescription: 'Convert plain text into a JSON string online.', description: 'Text to JSON converter online for free. Wrap your text in a JSON object instantly for easy data transfer and programming needs.', icon: 'Braces', keywords: ['text to json converter online free', 'convert text to json tool', 'json creator online free', 'string to json object generator', 'text data to json'], primaryKeyword: 'text to json converter online free', secondaryKeywords: ['convert text to json tool', 'json creator online free'], example: 'Hello World', process: (s) => JSON.stringify({ text: s }, null, 2) },
  { id: 'json-to-text', name: 'JSON to Text', slug: 'json-to-text-converter', category: 'utility', shortDescription: 'Extract text from a JSON object online.', description: 'JSON to text converter online for free. Extract readable text from JSON data structures instantly. Perfect for developers and data analysts.', icon: 'FileJson', keywords: ['json to text converter online free', 'extract text from json tool', 'json parser online free', 'json to plain text converter', 'readable json text extractor'], primaryKeyword: 'json to text converter online free', secondaryKeywords: ['extract text from json tool', 'json parser online free'], example: '{"text": "Hello World"}', process: (s) => { try { const obj = JSON.parse(s); return obj.text || s; } catch(e) { return s; } } },
    { id: 'char-frequency', name: 'Character Frequency', slug: 'character-frequency-counter', category: 'analysis', shortDescription: 'Count the frequency of each character online.', description: 'Character frequency counter online for free. Get a detailed breakdown of how many times each character appears in your text instantly.', icon: 'BarChart', keywords: ['character frequency counter online free', 'char count stats tool', 'text analysis character frequency', 'online character distribution counter', 'how many times each letter appears'], primaryKeyword: 'character frequency counter online free', secondaryKeywords: ['char count stats tool', 'text analysis character frequency'], example: 'Hello World', process: (s) => {
    const freq: any = {};
    s.split('').forEach(c => freq[c] = (freq[c] || 0) + 1);
    return Object.entries(freq).sort((a: any, b: any) => b[1] - a[1]).map(([c, f]) => `'${c}': ${f}`).join('\n');
  }},
  { id: 'word-length-stats', name: 'Word Length Stats', slug: 'word-length-statistics', category: 'analysis', shortDescription: 'Calculate average word length and statistics online.', description: 'Word length statistics tool online for free. Analyze your text to find average word length and total word count instantly.', icon: 'Activity', keywords: ['word length statistics online free', 'average word length tool', 'text stats word length', 'online word length analyzer', 'word count and length statistics'], primaryKeyword: 'word length statistics online free', secondaryKeywords: ['average word length tool', 'text stats word length'], example: 'The quick brown fox jumps over the lazy dog.', process: (s) => {
    const words = s.match(/\w+/g);
    if (!words || words.length === 0) return "No words found.";
    const total = words.reduce((acc: number, w: string) => acc + w.length, 0);
    return `Average Word Length: ${(total / words.length).toFixed(2)}\nTotal Words: ${words.length}`;
  }},
  { id: 'markdown-to-plain', name: 'Markdown to Plain Text Converter - Strip MD Free ⚡', slug: 'markdown-to-plain-text', category: 'cleaning', shortDescription: 'Convert Markdown to plain text online.', description: 'Markdown to plain text converter online for free. Strip all markdown syntax (bold, italic, links) to get the raw text instantly.', icon: 'FileText', keywords: ['markdown to plain text online free', 'strip markdown syntax tool', 'markdown cleaner online free', 'convert md to txt online', 'plain text from markdown generator'], primaryKeyword: 'markdown to plain text online free', secondaryKeywords: ['strip markdown syntax tool', 'markdown cleaner online free'], example: '# Heading\nThis is **bold** and *italic*. [Link](https://texlyonline.in)', process: (s) => s.replace(/(\*\*|__)(.*?)\1/g, '$2').replace(/(\*|_)(.*?)\1/g, '$2').replace(/\[(.*?)\]\(.*?\)/g, '$1').replace(/^#+\s+/gm, '') },
  { id: 'image-to-text', name: 'Image to Text Extractor - Free OCR Online Tool ⚡', slug: 'image-to-text-extractor', category: 'analysis', shortDescription: 'Extract text from images using OCR online.', description: 'Image to text extractor online for free. Upload an image and extract all readable text instantly using advanced OCR technology in your browser.', icon: 'Image', keywords: ['image to text extract online free', 'ocr online free tool', 'extract text from image online', 'picture to text converter', 'online ocr scanner'], primaryKeyword: 'image to text extract online free', secondaryKeywords: ['ocr online free tool', 'extract text from image online'], example: 'Upload an image to see the extracted text here.', process: (s) => s },
  {
    id: 'pregnancy-due-date-calculator',
    name: 'Pregnancy Due Date Calculator',
    slug: 'pregnancy-due-date-calculator',
    category: 'utility',
    shortDescription: 'Calculate your pregnancy due date based on your last menstrual period online.',
    description: 'Pregnancy due date calculator online for free. Find out your estimated due date and track your pregnancy progress easily with our accurate calculator.',
    icon: 'Baby',
    keywords: ['pregnancy due date calculator online', 'estimated due date calculator free', 'pregnancy tracker online tool', 'calculate baby due date', 'pregnancy week by week calculator'],
    primaryKeyword: 'pregnancy due date calculator online',
    secondaryKeywords: ['estimated due date calculator free', 'pregnancy tracker online tool'],
    // externalUrl removed - external iframe violates AdSense policy
    process: (s) => s,
  },
  { 
    id: 'text-steganography', 
    name: 'Text Steganography', 
    slug: 'text-steganography-hidden-message', 
    category: 'utility', 
    shortDescription: 'Hide secret messages inside plain text online.', 
    description: 'Text steganography online for free. Hide secret messages inside normal-looking text using invisible characters instantly. Perfect for private communication and secure notes.', 
    icon: 'EyeOff', 
    keywords: ['text steganography online free', 'hide text in text tool', 'invisible secret message generator', 'hidden text in text online', 'secure text steganography tool'], 
    primaryKeyword: 'text steganography online free',
    secondaryKeywords: ['hide text in text tool', 'invisible secret message generator'],
    example: 'Cover Text: This is a normal message.\nSecret: Meet me at 5pm.', 
    process: (s, opts) => {
      const mode = opts?.mode || 'encode';
      if (mode === 'encode') {
        const parts = s.split('\nSecret: ');
        if (parts.length < 2) return "Error: Please use the format 'Cover Text: ...\\nSecret: ...'";
        const cover = parts[0].replace('Cover Text: ', '');
        const secret = parts[1];
        const binary = secret.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
        const encoded = binary.split('').map(b => b === '0' ? '\u200C' : '\u200D').join('');
        return cover[0] + encoded + cover.slice(1);
      } else {
        const hidden = s.match(/[\u200C\u200D]+/g);
        if (!hidden) return "No hidden message found.";
        const binary = hidden[0].split('').map(c => c === '\u200C' ? '0' : '1').join('');
        const chars = [];
        for (let i = 0; i < binary.length; i += 8) {
          chars.push(String.fromCharCode(parseInt(binary.substr(i, 8), 2)));
        }
        return chars.join('');
      }
    } 
  },
  { 
    id: 'password-gen-strength', 
    name: 'Password Generator & Strength', 
    slug: 'password-generator-strength-meter', 
    category: 'utility', 
    shortDescription: 'Generate secure passwords and test their strength online.', 
    description: 'Password generator and strength meter online for free. Create strong, secure passwords and see their entropy and estimated crack time instantly.', 
    icon: 'Key', 
    keywords: ['password generator online free', 'password strength meter tool', 'secure password creator online', 'password entropy calculator', 'test password strength online'], 
    primaryKeyword: 'password generator online free',
    secondaryKeywords: ['password strength meter tool', 'secure password creator online'],
    example: 'Click generate to test strength or create new.', 
    process: (s, opts) => {
      if (opts?.mode === 'generate') {
        const length = opts?.length || 16;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let retVal = "";
        for (let i = 0; i < length; ++i) {
          retVal += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return retVal;
      }
      const len = s.length;
      if (len === 0) return "Enter a password to check strength.";
      let pool = 0;
      if (/[a-z]/.test(s)) pool += 26;
      if (/[A-Z]/.test(s)) pool += 26;
      if (/[0-9]/.test(s)) pool += 10;
      if (/[^a-zA-Z0-9]/.test(s)) pool += 32;
      const entropy = Math.log2(Math.pow(pool, len));
      let strength = "Very Weak";
      if (entropy > 128) strength = "Extremely Strong";
      else if (entropy > 80) strength = "Strong";
      else if (entropy > 60) strength = "Medium";
      else if (entropy > 40) strength = "Weak";
      return `Entropy: ${entropy.toFixed(2)} bits\nStrength: ${strength}\nPool Size: ${pool} characters`;
    } 
  },
  { 
    id: 'jwt-decoder', 
    name: 'JWT Decoder', 
    slug: 'jwt-decoder-online', 
    category: 'analysis', 
    shortDescription: 'Decode JSON Web Tokens (JWT) instantly online.', 
    description: 'JWT decoder online for free. Decode your JSON Web Tokens locally in your browser instantly. See header, payload, and signature details without sending data to a server.', 
    icon: 'ShieldCheck', 
    keywords: ['jwt decoder online free', 'decode jwt online tool', 'json web token parser online', 'jwt payload decoder free', 'online jwt debugger'], 
    primaryKeyword: 'jwt decoder online free',
    secondaryKeywords: ['decode jwt online tool', 'json web token parser online'],
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoyNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c', 
    process: (s) => {
      try {
        const parts = s.split('.');
        if (parts.length !== 3) return "Invalid JWT format. Should have 3 parts separated by dots.";
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        return `Header:\n${JSON.stringify(header, null, 2)}\n\nPayload:\n${JSON.stringify(payload, null, 2)}`;
      } catch (e) {
        return "Error decoding JWT: " + (e as Error).message;
      }
    } 
  },
  { 
    id: 'sql-formatter', 
    name: 'SQL Formatter', 
    slug: 'sql-formatter-online', 
    category: 'utility', 
    shortDescription: 'Prettify and format your SQL queries online.', 
    description: 'SQL formatter online for free. Clean up messy SQL queries with proper indentation and keyword capitalization instantly. Format SQL, MySQL, PostgreSQL, and more.', 
    icon: 'Database', 
    keywords: ['sql formatter online free', 'prettify sql online tool', 'sql beautifier online', 'format sql query free', 'online sql query cleaner'], 
    primaryKeyword: 'sql formatter online free',
    secondaryKeywords: ['prettify sql online tool', 'sql beautifier online'],
    example: 'SELECT * FROM users WHERE id = 1 AND status = "active" ORDER BY created_at DESC', 
    process: (s) => {
      return s
        .replace(/\s+/g, ' ')
        .replace(/\b(SELECT|FROM|WHERE|AND|OR|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|GROUP BY|ORDER BY|HAVING|LIMIT|INSERT INTO|UPDATE|DELETE|SET|VALUES|CREATE TABLE|ALTER TABLE|DROP TABLE)\b/gi, '\n$1')
        .trim();
    } 
  },
  { 
    id: 'json-to-csv', 
    name: 'JSON to CSV', 
    slug: 'json-to-csv-converter-online', 
    category: 'utility', 
    shortDescription: 'Convert JSON data to CSV format online.', 
    description: 'JSON to CSV converter online for free. Transform structured JSON arrays into comma-separated values for spreadsheets instantly. Perfect for data analysis and export.', 
    icon: 'FileSpreadsheet', 
    keywords: ['json to csv converter online', 'json to csv free tool', 'convert json to spreadsheet online', 'json to csv online free', 'json to csv data tool'], 
    primaryKeyword: 'json to csv converter online',
    secondaryKeywords: ['json to csv free tool', 'convert json to spreadsheet online'],
    example: '[\n  {"name": "John", "age": 30},\n  {"name": "Jane", "age": 25}\n]', 
    process: (s) => {
      try {
        const arr = JSON.parse(s);
        if (!Array.isArray(arr)) return "Input must be a JSON array of objects.";
        const headers = Object.keys(arr[0]);
        const csv = [
          headers.join(','),
          ...arr.map(row => headers.map(h => JSON.stringify(row[h])).join(','))
        ].join('\n');
        return csv;
      } catch (e) {
        return "Invalid JSON: " + (e as Error).message;
      }
    } 
  },
  { 
    id: 'invisible-text', 
    name: 'Invisible Text Generator', 
    slug: 'invisible-text-generator', 
    category: 'utility', 
    shortDescription: 'Generate invisible characters for copy-paste online.', 
    description: 'Invisible text generator online for free. Create zero-width characters that are invisible but can be copied. Useful for adding hidden watermarks and special formatting instantly.', 
    icon: 'Ghost', 
    keywords: ['invisible text generator online', 'zero width space generator', 'hidden characters copy paste tool', 'invisible text for social media', 'generate blank text online'], 
    primaryKeyword: 'invisible text generator online',
    secondaryKeywords: ['zero width space generator', 'hidden characters copy paste tool'],
    example: 'Click generate to get invisible text.', 
    process: (_, opts) => {
      const count = opts?.count || 10;
      return '\u200B'.repeat(count);
    } 
  },
  { 
    id: 'yt-timestamp-formatter', 
    name: 'YouTube Timestamp Formatter', 
    slug: 'youtube-timestamp-generator', 
    category: 'utility', 
    shortDescription: 'Format YouTube video timestamps for descriptions online.', 
    description: 'YouTube timestamp generator online for free. Clean up and format your video chapters for YouTube descriptions easily. Create clickable timestamps for your videos instantly.', 
    icon: 'Youtube', 
    keywords: ['youtube timestamp generator online', 'video chapters creator tool', 'yt description formatter free', 'youtube timestamp creator online', 'format youtube chapters free'], 
    primaryKeyword: 'youtube timestamp generator online',
    secondaryKeywords: ['video chapters creator tool', 'yt description formatter free'],
    example: '00:00 Intro\n01:30 Setup\n05:00 Demo\n10:00 Conclusion', 
    process: (s) => {
      return s.split('\n')
        .map(line => line.trim())
        .filter(line => /^\d{1,2}:\d{2}/.test(line))
        .join('\n');
    } 
  },
  {
    id: 'fancy-text',
    name: 'Fancy Text Generator',
    slug: 'fancy-text-generator-online',
    category: 'utility',
    shortDescription: 'Convert normal text into fancy unicode fonts online.',
    description: 'Fancy text generator online for free. Create stylish and cool looking text for social media bios, names, and posts using unicode characters instantly. Stand out with unique fonts.',
    icon: 'Sparkles',
    keywords: ['fancy text generator online', 'cool fonts online free', 'stylish text creator tool', 'fancy fonts for instagram', 'cool text generator for social media'],
    primaryKeyword: 'fancy text generator online',
    secondaryKeywords: ['cool fonts online free', 'stylish text creator tool'],
    example: 'Hello World',
    process: (s) => {
      const map: any = {
        'a': '𝕒', 'b': '𝕓', 'c': '𝕔', 'd': '𝕕', 'e': '𝕖', 'f': '𝕗', 'g': '𝕘', 'h': '𝕙', 'i': '𝕚', 'j': '𝕛', 'k': '𝕜', 'l': '𝕝', 'm': '𝕞', 'n': '𝕟', 'o': '𝕠', 'p': '𝕡', 'q': '𝕢', 'r': '𝕣', 's': '𝕤', 't': '𝕥', 'u': '𝕦', 'v': '𝕧', 'w': '𝕨', 'x': '𝕩', 'y': '𝕪', 'z': '𝕫',
        'A': '𝔸', 'B': '𝔹', 'C': 'ℂ', 'D': '𝔻', 'E': '𝔼', 'F': '𝔽', 'G': '𝔾', 'H': 'ℍ', 'I': '𝕀', 'J': '𝕁', 'K': '𝕂', 'L': '𝕃', 'M': '𝕄', 'N': 'ℕ', 'O': '𝕆', 'P': 'ℙ', 'Q': 'ℚ', 'R': 'ℝ', 'S': '𝕊', 'T': '𝕋', 'U': '𝕌', 'V': '𝕍', 'W': '𝕎', 'X': '𝕏', 'Y': '𝕐', 'Z': 'ℤ'
      };
      return s.split('').map(c => map[c] || c).join('');
    }
  },
  {
    id: 'braille-translator',
    name: 'Braille Translator',
    slug: 'braille-translator-online',
    category: 'converter',
    shortDescription: 'Translate text into Braille characters online.',
    description: 'Braille translator online for free. Convert English text into Braille dots for accessibility and learning instantly. Accurate text to Braille conversion tool.',
    icon: 'Type',
    keywords: ['braille translator online free', 'text to braille tool', 'braille alphabet converter online', 'translate english to braille free', 'online braille generator'],
    primaryKeyword: 'braille translator online free',
    secondaryKeywords: ['text to braille tool', 'braille alphabet converter online'],
    example: 'Hello',
    process: (s) => {
      const map: any = {
        'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚', 'k': '⠇', 'l': '⠸', 'm': '⠵', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵',
        ' ': ' ', '1': '⠂', '2': '⠆', '3': '⠒', '4': '⠲', '5': '⠢', '6': '⠖', '7': '⠶', '8': '⠦', '9': '⠔', '0': '⠴'
      };
      return s.toLowerCase().split('').map(c => map[c] || c).join('');
    }
  },
  {
    id: 'text-diff',
    name: 'Text Diff Checker',
    slug: 'text-diff-checker-online',
    category: 'analysis',
    shortDescription: 'Compare two texts and find differences online.',
    description: 'Text diff checker online for free. Compare two versions of text side-by-side to find additions, deletions, and changes instantly. Best tool for comparing code or documents.',
    icon: 'Columns',
    keywords: ['text diff checker online free', 'compare text online tool', 'diff tool online free', 'text comparison tool online', 'check differences between two texts'],
    primaryKeyword: 'text diff checker online free',
    secondaryKeywords: ['compare text online tool', 'diff tool online free'],
    example: 'Original: Hello World\nModified: Hello Texly',
    process: (s) => {
      const parts = s.split('\nModified: ');
      if (parts.length < 2) return "Error: Use format 'Original: ...\\nModified: ...'";
      const original = parts[0].replace('Original: ', '').split(' ');
      const modified = parts[1].split(' ');
      const diff = [];
      const max = Math.max(original.length, modified.length);
      for (let i = 0; i < max; i++) {
        if (original[i] === modified[i]) {
          diff.push(original[i]);
        } else {
          if (original[i]) diff.push(`[-${original[i]}-]`);
          if (modified[i]) diff.push(`[+${modified[i]}+]`);
        }
      }
      return diff.join(' ');
    }
  }
,
  {
    id: 'whatsapp-text-formatter',
    name: 'WhatsApp Text Formatter – Bold, Italic & Strikethrough Free ⚡',
    slug: 'whatsapp-text-formatter',
    category: 'utility',
    shortDescription: 'Format WhatsApp text with bold, italic, strikethrough & monospace in 1 click. Free & instant.',
    description: 'Format your WhatsApp messages with bold (*text*), italic (_text_), strikethrough (~text~), and monospace (\`text\`) styling in just one click. No app needed — works instantly in your browser. Perfect for making your WhatsApp chats stand out!',
    icon: 'MessageCircle',
    keywords: [
      'whatsapp bold text online', 'how to bold text in whatsapp', 'whatsapp text formatter free',
      'whatsapp italic text generator', 'whatsapp strikethrough text', 'whatsapp font style changer',
      'bold text for whatsapp', 'whatsapp message formatter online', 'whatsapp text style generator',
      'whatsapp monospace text', 'format text for whatsapp', 'whatsapp text effects free'
    ],
    primaryKeyword: 'whatsapp bold text online',
    secondaryKeywords: ['how to bold text in whatsapp', 'whatsapp text formatter free'],
    example: 'Hello! This is my message.',
    placeholder: 'Type your WhatsApp message here...',
    hook: 'Make your WhatsApp messages stand out with bold, italic & more — instantly!',
    buttonText: 'Format Text',
    process: (s: string) => s
  },
  {
    id: 'number-to-words',
    name: 'Number to Words Converter – Indian & International Format Free ⚡',
    slug: 'number-to-words-converter',
    category: 'converter',
    shortDescription: 'Convert numbers to words in Indian format (Lakh, Crore) or International (Million, Billion). Free!',
    description: 'Convert any number to words instantly — supports Indian format (Lakh, Crore) and International format (Million, Billion). Perfect for writing cheques, legal documents, academic assignments, and financial reports. Works for numbers up to 999 crore.',
    icon: 'Hash',
    keywords: [
      'number to words converter online', 'numbers in words indian format', 'convert number to words in hindi',
      'lakh crore words converter', '1 crore in words', 'number to words in english free',
      'amount in words converter', 'cheque amount in words', 'figure to words converter online',
      'number spelling online', 'convert digits to words free', '10 lakh in words'
    ],
    primaryKeyword: 'number to words converter online',
    secondaryKeywords: ['numbers in words indian format', 'lakh crore words converter'],
    example: '10000000',
    placeholder: 'Enter a number (e.g. 10000000)...',
    hook: 'Convert any number to words in Indian or International format — instantly free!',
    buttonText: 'Convert to Words',
    process: (s: string) => {
      const num = parseInt(s.replace(/,/g, '').trim());
      if (isNaN(num)) return 'Please enter a valid number';
      
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
        'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      
      const convertBelow1000 = (n: number): string => {
        if (n === 0) return '';
        if (n < 20) return ones[n];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertBelow1000(n % 100) : '');
      };

      if (num === 0) return 'Zero';
      
      // Indian format
      let indianResult = '';
      let n = num;
      if (n >= 10000000) { indianResult += convertBelow1000(Math.floor(n / 10000000)) + ' Crore '; n %= 10000000; }
      if (n >= 100000) { indianResult += convertBelow1000(Math.floor(n / 100000)) + ' Lakh '; n %= 100000; }
      if (n >= 1000) { indianResult += convertBelow1000(Math.floor(n / 1000)) + ' Thousand '; n %= 1000; }
      if (n > 0) { indianResult += convertBelow1000(n); }
      
      // International format
      let intlResult = '';
      let m = num;
      if (m >= 1000000000) { intlResult += convertBelow1000(Math.floor(m / 1000000000)) + ' Billion '; m %= 1000000000; }
      if (m >= 1000000) { intlResult += convertBelow1000(Math.floor(m / 1000000)) + ' Million '; m %= 1000000; }
      if (m >= 1000) { intlResult += convertBelow1000(Math.floor(m / 1000)) + ' Thousand '; m %= 1000; }
      if (m > 0) { intlResult += convertBelow1000(m); }

      return `🇮🇳 Indian: ${indianResult.trim()} Rupees Only\n🌍 International: ${intlResult.trim()} Only`;
    }
  },
];

export const PDF_TOOLS: Tool[] = [
  {
    id: 'pdf-editor',
    name: 'PDF Editor',
    slug: 'pdf-editor-online',
    category: 'pdf',
    shortDescription: 'Edit PDF files online for free. Add text, images, and shapes to your PDF documents.',
    description: 'Edit PDF files online for free. Our PDF editor allows you to modify your PDF documents directly in your browser. Add text, images, and annotations easily.',
    icon: 'Edit',
    keywords: ['pdf editor online free', 'edit pdf files online', 'modify pdf documents', 'add text to pdf', 'online pdf annotator'],
    process: (s) => s
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    slug: 'image-to-pdf-converter',
    category: 'pdf',
    shortDescription: 'Convert images to PDF online. Support for JPG, PNG, and more.',
    description: 'Convert images to PDF online for free. Easily transform your photos and images into high-quality PDF documents instantly.',
    icon: 'Image',
    keywords: ['image to pdf converter', 'jpg to pdf online', 'png to pdf free', 'convert photos to pdf', 'image to pdf tool'],
    process: (s) => s
  },
  {
    id: 'pdf-to-image',
    name: 'PDF to Image',
    slug: 'pdf-to-image-converter',
    category: 'pdf',
    shortDescription: 'Convert PDF pages to high-quality images online.',
    description: 'Convert PDF to image online for free. Extract pages from your PDF and save them as JPG or PNG images instantly.',
    icon: 'FileImage',
    keywords: ['pdf to image converter', 'pdf to jpg online', 'pdf to png free', 'extract images from pdf', 'pdf page to image'],
    process: (s) => s
  },
  {
    id: 'generate-pdf',
    name: 'Generate PDF',
    slug: 'generate-pdf-online',
    category: 'pdf',
    shortDescription: 'Create PDF documents from scratch online.',
    description: 'Generate PDF online for free. Create professional PDF documents from text, HTML, or images easily using our PDF generator.',
    icon: 'FilePlus',
    keywords: ['generate pdf online', 'create pdf document', 'pdf generator tool', 'make pdf online free', 'text to pdf creator'],
    process: (s) => s
  },
  {
    id: 'pdf-compress',
    name: 'PDF Compress',
    slug: 'compress-pdf-online',
    category: 'pdf',
    shortDescription: 'Compress PDF files online to reduce file size.',
    description: 'Compress PDF online for free. Reduce the file size of your PDF documents without losing quality. Perfect for email attachments.',
    icon: 'Minimize2',
    keywords: ['compress pdf online free', 'reduce pdf file size', 'pdf compressor tool', 'shrink pdf document', 'optimize pdf for web'],
    process: (s) => s
  },
  {
    id: 'pdf-size-reduce',
    name: 'PDF Size Reduce',
    slug: 'reduce-pdf-size-online',
    category: 'pdf',
    shortDescription: 'Reduce PDF size online for free.',
    description: 'Reduce PDF size online for free. Optimize your PDF documents for faster sharing and storage with our PDF size reducer.',
    icon: 'Minimize2',
    keywords: ['reduce pdf size online', 'pdf size reducer', 'optimize pdf file', 'shrink pdf size free', 'pdf file optimizer'],
    process: (s) => s
  },
  {
    id: 'pdf-password-remover',
    name: 'PDF Password Remover',
    slug: 'remove-pdf-password-online',
    category: 'pdf',
    shortDescription: 'Remove password protection from PDF files online.',
    description: 'Remove PDF password online for free. Unlock protected PDF documents and remove security restrictions instantly.',
    icon: 'Unlock',
    keywords: ['pdf password remover', 'unlock pdf online', 'remove pdf security', 'decrypt pdf file', 'pdf unlocker free'],
    process: (s) => s
  },
  {
    id: 'pdf-excel',
    name: 'PDF to Excel',
    slug: 'pdf-to-excel-converter',
    category: 'pdf',
    shortDescription: 'Convert PDF tables to Excel spreadsheets online.',
    description: 'Convert PDF to Excel online for free. Extract data and tables from your PDF documents and save them as editable XLSX files.',
    icon: 'FileSpreadsheet',
    keywords: ['pdf to excel converter', 'pdf to xlsx online', 'extract tables from pdf', 'pdf to spreadsheet free', 'convert pdf data to excel'],
    process: (s) => s
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    slug: 'excel-to-pdf-converter',
    category: 'pdf',
    shortDescription: 'Convert Excel spreadsheets to PDF online.',
    description: 'Convert Excel to PDF online for free. Transform your XLSX and CSV files into professional PDF documents instantly.',
    icon: 'FileText',
    keywords: ['excel to pdf converter', 'xlsx to pdf online', 'csv to pdf free', 'convert spreadsheet to pdf', 'excel to pdf tool'],
    process: (s) => s
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    slug: 'word-to-pdf-converter',
    category: 'pdf',
    shortDescription: 'Convert Word documents to PDF online.',
    description: 'Convert Word to PDF online for free. Transform your DOCX and DOC files into high-quality PDF documents easily.',
    icon: 'FileText',
    keywords: ['word to pdf converter', 'docx to pdf online', 'doc to pdf free', 'convert word doc to pdf', 'word to pdf tool'],
    process: (s) => s
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    slug: 'pdf-to-word-converter',
    category: 'pdf',
    shortDescription: 'Convert PDF documents to editable Word files online.',
    description: 'Convert PDF to Word online for free. Transform your PDF documents into editable DOCX files instantly while preserving formatting.',
    icon: 'FileText',
    keywords: ['pdf to word converter', 'pdf to docx online', 'convert pdf to editable word', 'pdf to word free tool', 'pdf to doc converter'],
    process: (s) => s
  },
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    slug: 'merge-pdf-online',
    category: 'pdf',
    shortDescription: 'Merge multiple PDF files into one online.',
    description: 'Merge PDF files online for free. Combine multiple PDF documents into a single file easily and securely.',
    icon: 'Combine',
    keywords: ['merge pdf online', 'combine pdf files', 'join pdf documents', 'pdf merger tool free', 'online pdf joiner'],
    process: (s) => s
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    slug: 'split-pdf-online',
    category: 'pdf',
    shortDescription: 'Split PDF files into multiple documents online.',
    description: 'Split PDF online for free. Extract pages from your PDF or divide it into multiple files easily.',
    icon: 'Scissors',
    keywords: ['split pdf online', 'extract pages from pdf', 'pdf splitter tool free', 'divide pdf document', 'online pdf extractor'],
    process: (s) => s
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    slug: 'rotate-pdf-online',
    category: 'pdf',
    shortDescription: 'Rotate PDF pages online for free.',
    description: 'Rotate PDF online for free. Permanently rotate your PDF pages clockwise or counter-clockwise easily.',
    icon: 'RotateCw',
    keywords: ['rotate pdf online', 'rotate pdf pages free', 'pdf rotator tool', 'fix pdf orientation', 'online pdf page rotator'],
    process: (s) => s
  }
];

const AI_TEXT_TOOLS: Tool[] = [];


export const ALL_TOOLS = [...TOOLS, ...additionalTools, ...AI_TEXT_TOOLS, ...PDF_TOOLS];