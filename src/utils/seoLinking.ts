import { TOOLS, PDF_TOOLS, Tool } from '../data/tools';
import { BlogPost } from '../data/blog';

const ALL_TOOLS = [...TOOLS, ...PDF_TOOLS];

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'when', 'at', 'from', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing'
]);

/**
 * Normalizes text for keyword matching
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Extracts meaningful keywords from text
 */
export const extractKeywords = (text: string): string[] => {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');
  return words.filter(word => word.length > 2 && !STOP_WORDS.has(word));
};

/**
 * Calculates a relevance score for a tool against a blog post
 */
const calculateToolRelevance = (tool: Tool, blogTitle: string, blogContent: string): number => {
  let score = 0;
  const normalizedTitle = normalizeText(blogTitle);
  const normalizedContent = normalizeText(blogContent);
  
  // 1. Match tool name (High weight)
  const toolName = normalizeText(tool.name);
  if (normalizedTitle.includes(toolName)) score += 50;
  if (normalizedContent.includes(toolName)) {
    const occurrences = (normalizedContent.match(new RegExp(toolName, 'g')) || []).length;
    score += Math.min(occurrences * 10, 40);
  }

  // 2. Match primary keyword (High weight)
  if (tool.primaryKeyword) {
    const primary = normalizeText(tool.primaryKeyword);
    if (normalizedTitle.includes(primary)) score += 40;
    if (normalizedContent.includes(primary)) score += 20;
  }

  // 3. Match secondary keywords (Medium weight)
  if (tool.secondaryKeywords) {
    tool.secondaryKeywords.forEach(kw => {
      const normalizedKw = normalizeText(kw);
      if (normalizedTitle.includes(normalizedKw)) score += 20;
      if (normalizedContent.includes(normalizedKw)) score += 10;
    });
  }

  // 4. Match general keywords (Low weight)
  if (tool.keywords) {
    tool.keywords.forEach(kw => {
      const normalizedKw = normalizeText(kw);
      if (normalizedContent.includes(normalizedKw)) score += 5;
    });
  }

  return score;
};

/**
 * Calculates a relevance score for a blog post against a tool
 */
const calculateBlogRelevance = (blog: BlogPost, tool: Tool): number => {
  let score = 0;
  const normalizedTitle = normalizeText(blog.title);
  const normalizedContent = normalizeText(blog.content);
  const toolName = normalizeText(tool.name);
  const toolSlug = tool.slug.replace(/-/g, ' ');

  // 1. Match tool name in title
  if (normalizedTitle.includes(toolName)) score += 50;
  
  // 2. Match tool slug keywords in title
  const slugKeywords = extractKeywords(toolSlug);
  slugKeywords.forEach(kw => {
    if (normalizedTitle.includes(kw)) score += 10;
  });

  // 3. Match tool keywords in content
  if (tool.keywords) {
    tool.keywords.forEach(kw => {
      const normalizedKw = normalizeText(kw);
      if (normalizedContent.includes(normalizedKw)) score += 5;
    });
  }

  // 4. Category match
  if (blog.category.toLowerCase().includes(tool.category.toLowerCase())) {
    score += 15;
  }

  return score;
};

/**
 * Gets related tools for a blog post content
 */
export const getRelatedTools = (content: string, title = '', limit = 5): Tool[] => {
  const scoredTools = ALL_TOOLS.map(tool => ({
    tool,
    score: calculateToolRelevance(tool, title, content)
  }));

  return scoredTools
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.tool);
};

/**
 * Gets related blogs for a tool slug
 */
export const getRelatedBlogs = (toolSlug: string, blogs: BlogPost[], limit = 5): BlogPost[] => {
  const tool = ALL_TOOLS.find(t => t.slug === toolSlug);
  if (!tool) return [];

  const scoredBlogs = blogs.map(blog => ({
    blog,
    score: calculateBlogRelevance(blog, tool)
  }));

  return scoredBlogs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.blog);
};

/**
 * Injects internal links into HTML content
 */
export const injectInternalLinks = (htmlContent: string, tools: Tool[]): string => {
  if (!htmlContent) return '';
  let processedContent = htmlContent;
  const linkedTools = new Set<string>();
  let totalLinks = 0;

  // Sort tools by name length descending to match longer phrases first
  const sortedTools = [...tools].sort((a, b) => b.name.length - a.name.length);

  for (const tool of sortedTools) {
    if (totalLinks >= 5) break;
    if (!tool.name || !tool.slug) continue;
    
    // Escape regex special characters in tool name
    const escapedName = tool.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const toolUrl = `/tool/${tool.slug}`;
    
    // Match the tool name as a whole word
    const regex = new RegExp(`(\\b${escapedName}\\b)`, 'gi');
    
    let matchCount = 0;
    
    // Split content by HTML tags to avoid replacing inside tags or attributes
    const parts = processedContent.split(/(<[^>]+>)/g);
    let inLink = false;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;

      if (part.startsWith('<')) {
        const lowerPart = part.toLowerCase();
        if (lowerPart.startsWith('<a')) inLink = true;
        if (lowerPart.startsWith('</a')) inLink = false;
        continue;
      }
      
      if (inLink) continue;
      if (totalLinks >= 5) break;

      parts[i] = part.replace(regex, (match) => {
        if (matchCount < 1 && !linkedTools.has(tool.slug) && totalLinks < 5) {
          matchCount++;
          totalLinks++;
          linkedTools.add(tool.slug);
          return `<a href="${toolUrl}" class="text-blue-600 hover:underline font-semibold">${match}</a>`;
        }
        return match;
      });
    }
    
    processedContent = parts.join('');
  }

  return processedContent;
};
