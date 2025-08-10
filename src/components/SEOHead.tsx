import React from 'react';
import { useLocation } from 'react-router-dom';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'ReadyScriptPro – AI Script Generator',
  description = 'Instantly generate camera-ready scripts for TikTok, YouTube, and short films. Get professional, ready-to-shoot scripts in seconds.',
  keywords = 'AI script generator, short film scripts, TikTok scripts, YouTube scripts, screenplay generator',
  canonical,
  ogImage = 'https://readyscriptpro.com/images/og-image.png',
  jsonLd
}) => {
  const location = useLocation();
  const baseUrl = 'https://readyscriptpro.com';
  const canonicalUrl = canonical || `${baseUrl}${location.pathname}`;

  React.useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Update keywords (optional)
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);

    // Update Open Graph and Twitter tags
    const ogTags: Record<string, string> = {
      'og:title': title,
      'og:description': description,
      'og:url': canonicalUrl,
      'og:image': ogImage,
      'twitter:title': title,
      'twitter:description': description,
      'twitter:image': ogImage
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`) || 
                   document.querySelector(`meta[name="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property.startsWith('og:')) {
          metaTag.setAttribute('property', property);
        } else {
          metaTag.setAttribute('name', property);
        }
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    });

    // Inject JSON-LD structured data if provided
    // Remove any previous injected json-ld nodes by this component
    const prevJsonLdNodes = document.querySelectorAll('script[type="application/ld+json"][data-seo-jsonld="1"]');
    prevJsonLdNodes.forEach((n) => n.parentNode?.removeChild(n));

    if (jsonLd) {
      const jsonArray = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      jsonArray.forEach((obj) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo-jsonld', '1');
        try {
          script.text = JSON.stringify(obj);
        } catch {
          // ignore serialization error silently
        }
        document.head.appendChild(script);
      });
    }
  }, [title, description, keywords, canonicalUrl, ogImage, jsonLd]);

  return null;
};

export default SEOHead; 