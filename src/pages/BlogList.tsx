import React from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../utils/blog';

export default function BlogList() {
  const posts = getAllPosts();

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      <ul className="space-y-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link to={`/blog/${post.slug}`} className="text-xl font-semibold text-blue-600 hover:underline">
              {post.title}
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(post.date).toLocaleDateString()}
            </p>
            <p className="text-gray-700 mt-2 line-clamp-2">
              {post.content.slice(0, 120)}...
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
} 