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
  content: string;
}

// Load all markdown files under src/content/blog at build time (Vite glob eager)
const modules = import.meta.glob('../content/blog/*.md', { as: 'raw', eager: true });

const posts: BlogPost[] = Object.entries(modules).map(([path, raw]) => {
  const { data, content } = matter(raw as string);
  const slug = data.slug || path.split('/').pop()?.replace(/\.md$/, '') || '';
  return {
    slug,
    title: data.title || slug,
    date: data.date || '1970-01-01',
    content,
  } as BlogPost;
}).sort((a, b) => (a.date > b.date ? -1 : 1));

export function getAllPosts() {
  return posts;
}

export function getPostBySlug(slug: string) {
  return posts.find(p => p.slug === slug);
} 