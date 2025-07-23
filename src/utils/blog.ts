// Ensure Buffer exists in browser before any library uses it
import { Buffer as PolyBuffer } from 'buffer';
if (typeof globalThis.Buffer === 'undefined') {
  // @ts-ignore
  globalThis.Buffer = PolyBuffer;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore gray-matter types installed at runtime
import matter from 'gray-matter';

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  image?: string;
  content: string;
  excerpt?: string;
  category?: string;
  readTime?: number;
  author?: string;
  tags?: string[];
}

// Load all markdown files under src/content/blog at build time (Vite glob eager)
const modules = import.meta.glob('../content/blog/*.md', { as: 'raw', eager: true });

// Calculate reading time (approximate 200 words per minute)
const calculateReadTime = (content: string): number => {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
};

const posts: BlogPost[] = Object.entries(modules).map(([path, raw]) => {
  const { data, content } = matter(raw as string);
  const slug = data.slug || path.split('/').pop()?.replace(/\.md$/, '') || '';
  
  return {
    slug,
    title: data.title || slug,
    date: data.date || '1970-01-01',
    image: data.image || '/images/blog/default-post.jpg',
    content,
    excerpt: data.excerpt || content.slice(0, 160) + '...',
    category: data.category || 'Script Writing',
    readTime: calculateReadTime(content),
    author: data.author || 'ReadyScript Team',
    tags: data.tags || [],
  } as BlogPost;
}).sort((a, b) => (a.date > b.date ? -1 : 1));

export function getAllPosts() {
  return posts;
}

export function getPostBySlug(slug: string) {
  return posts.find(p => p.slug === slug);
}

export function getAllCategories() {
  const categories = new Set(posts.map(p => p.category).filter(Boolean));
  return Array.from(categories);
}

export function getPostsByCategory(category: string) {
  return posts.filter(p => p.category === category);
}

export function getFeaturedPosts(limit = 3) {
  return posts.slice(0, limit);
}

export function getRecentPosts(limit = 6) {
  return posts.slice(0, limit);
} 