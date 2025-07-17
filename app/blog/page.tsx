'use client';
import Link from 'next/link';
import { getAllPosts } from '../../lib/posts';
import { PostMeta } from '../../lib/posts';

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <ul className="space-y-8">
        {posts.map(({ meta }) => (
          <li key={meta.slug}>
            <Link href={`/blog/${meta.slug}`} className="text-xl font-semibold text-blue-600 hover:underline">
              {meta.title}
            </Link>
            <p className="text-sm text-gray-500 mt-1">{new Date(meta.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
} 