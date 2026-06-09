/**
 * src/utils/toolPaths.ts
 *
 * Helper to resolve the correct URL path for any tool.
 * Unifies linking to either dedicated premium standalone pages or 
 * specific pre-configured hub settings based on tool ID/category.
 */

// Tool IDs that have dedicated standalone, complex interactive pages outside of hubs
const STANDALONE_TOOL_IDS = new Set([
  'face-swap',
  'bg-remover',
  'enhancer',
  'compressor',
  'image-upscale',
  'image-generator',
  'ai-text-suite',
  'snapchat-tag-generator',
  'invisible-text-suite',
  'robots-txt-tester',
  'json-path-finder',
  'regex-explainer',
  'cron-expression-generator',
  'redirect-chain-checker',
  'image-size-reducer',
  'image-format-converter'  // dedicated page at /tools/image-format-converter
]);

// Categories map to their premium parent hub
const CATEGORY_HUBS: Record<string, string> = {
  pdf: '/tools/pdf-tools-hub',
  ai: '/tools/ai-tools-hub',
  cleaning: '/tools/text-cleaning-hub',
  converter: '/tools/text-converter-hub',
  analysis: '/tools/text-analysis-hub',
  utility: '/tools/text-utility-hub',
  generator: '/tools/generators-hub',
};

export const getToolPath = (tool: { id: string; slug: string; category: string; isDynamic?: boolean }) => {
  if (!tool) return '/';

  // Dynamic tools created via admin panel are served at root
  if (tool.isDynamic) {
    return `/${tool.slug}`;
  }

  // If it's a standalone tool, route directly
  if (STANDALONE_TOOL_IDS.has(tool.id)) {
    // Some are under /tool/, most under /tools/
    if (tool.id === 'image-size-reducer') {
      return `/tool/${tool.slug}`;
    }
    return `/tools/${tool.slug}`;
  }

  // Otherwise, route to parent hub with exact active option search param
  const hubUrl = CATEGORY_HUBS[tool.category];
  if (hubUrl) {
    return `${hubUrl}?tool=${tool.id}`;
  }

  // Ultimate fallback
  return `/tool/${tool.slug}`;
};
