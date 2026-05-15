import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { BASE_URL } from '../config';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  keywords?: string[];
}

const SEO: React.FC<SEOProps> = ({
  title = 'Texly – Free Online Text Tools',
  description = 'Texly offers free online text tools for cleaning, formatting, and analyzing text. Fast, secure, and easy to use.',
  canonical,
  ogType = 'website',
  ogImage = `${BASE_URL}/og-image.png`,
  keywords = ['text tools', 'online text cleaner', 'format text', 'seo tools', 'texly']
}) => {
  const location = useLocation();
  const siteUrl = BASE_URL;
  const fullTitle = title.includes('Texly') ? title : `${title} | Texly`;
  
  // Auto-generate canonical if not provided
  let path = canonical || location.pathname;
  
  // Normalize path: lowercase, no trailing slash, ensure /tool/ instead of /tools/
  let normalizedPath = path.toLowerCase().trim();
  if (normalizedPath.startsWith('/tools/')) {
    normalizedPath = normalizedPath.replace('/tools/', '/tool/');
  }
  if (normalizedPath !== '/' && normalizedPath.endsWith('/')) {
    normalizedPath = normalizedPath.slice(0, -1);
  }
  
  // Always use www version for canonical
  const cleanSiteUrl = siteUrl.replace('http://', 'https://').replace('https://texlyonline.in', 'https://www.texlyonline.in');
  
  const canonicalUrl = normalizedPath.startsWith('http') 
    ? normalizedPath.replace('https://texlyonline.in', 'https://www.texlyonline.in')
    : `${cleanSiteUrl}${normalizedPath}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content="Texly" />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@texly_tools" />
      <meta name="twitter:creator" content="@texly_tools" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Robots */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Additional SEO */}
      <meta name="author" content="Texly" />
      <meta httpEquiv="content-language" content="en" />
      <link rel="alternate" hrefLang="en" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
    </Helmet>
  );
};

export default SEO;
