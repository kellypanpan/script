import React from 'react';
import { useParams } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore react-markdown types installed in prod build
import ReactMarkdown from 'react-markdown';
import { getPostBySlug } from '../utils/blog';
import SEOHead from '../components/SEOHead';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : null;

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <p className="text-center text-red-500">Post not found.</p>
      </div>
    );
  }

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.date,
    dateModified: post.date,
    image: post.image ? [post.image] : undefined,
    author: post.author ? [{ '@type': 'Person', name: post.author }] : [{ '@type': 'Organization', name: 'ReadyScriptPro' }],
    publisher: {
      '@type': 'Organization',
      name: 'ReadyScriptPro',
      logo: {
        '@type': 'ImageObject',
        url: 'https://readyscriptpro.com/images/og-image.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://readyscriptpro.com/blog/${post.slug}`
    },
    description: post.excerpt || post.content.slice(0, 160)
  } as Record<string, unknown>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 prose prose-lg prose-blue dark:prose-invert">
      <SEOHead 
        title={`${post.title} - ReadyScriptPro`}
        description={post.excerpt || post.content.slice(0, 160)}
        canonical={`https://readyscriptpro.com/blog/${post.slug}`}
        ogImage={post.image}
        jsonLd={articleJsonLd}
      />
      <h1>{post.title}</h1>
      <p className="text-sm text-gray-500">{new Date(post.date).toDateString()}</p>
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-64 object-cover rounded-xl mb-6"
        />
      )}
      <ReactMarkdown components={{ h1: () => null }}>{post.content}</ReactMarkdown>
      <div className="mt-12 border-t pt-8">
        <a
          href="https://ReadyScriptPro.com"
          className="block bg-blue-600 text-white text-center py-4 rounded-lg font-semibold"
        >
          🎬 Try ReadyScriptPro now →
        </a>
      </div>
    </div>
  );
} 