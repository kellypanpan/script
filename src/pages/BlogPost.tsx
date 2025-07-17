import React from 'react';
import { useParams } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore react-markdown types installed in prod build
import ReactMarkdown from 'react-markdown';
import { getPostBySlug } from '../utils/blog';

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

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 prose prose-lg dark:prose-invert">
      <h1>{post.title}</h1>
      <p className="text-sm text-gray-500">{new Date(post.date).toDateString()}</p>
      <ReactMarkdown>{post.content}</ReactMarkdown>
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