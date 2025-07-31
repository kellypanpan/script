import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const AIScriptGenerator: React.FC = () => {
  const [scriptType, setScriptType] = useState('short-film');
  const [genre, setGenre] = useState('drama');
  const [length, setLength] = useState('3-5');
  const [tone, setTone] = useState('dramatic');

  return (
    <>
      <Helmet>
        <title>AI Script Generator – Instantly Create Short Film & Video Scripts</title>
        <meta name="description" content="Generate professional short film scripts in seconds with ReadyScriptPro's free AI Script Generator. No sign-up needed. Perfect for TikTok, YouTube, and indie creators." />
        <meta name="keywords" content="AI script generator, short film scripts, video scripts, screenplay generator, script writing tool" />
        <meta property="og:title" content="AI Script Generator – Instantly Create Short Film & Video Scripts" />
        <meta property="og:description" content="Generate professional short film scripts in seconds with ReadyScriptPro's free AI Script Generator. No sign-up needed." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://readyscriptpro.com/ai-script-generator" />
        <link rel="canonical" href="https://readyscriptpro.com/ai-script-generator" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold text-indigo-600">
                  ReadyScriptPro
                </Link>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link to="/" className="text-gray-700 hover:text-indigo-600">Home</Link>
                <Link to="/script-generator" className="text-gray-700 hover:text-indigo-600">Generator</Link>
                <Link to="/blog" className="text-gray-700 hover:text-indigo-600">Blog</Link>
                <Link to="/pricing" className="text-gray-700 hover:text-indigo-600">Pricing</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Script Generator
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Looking for a fast, reliable way to write scripts? ReadyScriptPro's AI Script Generator helps creators of all levels produce camera-ready screenplays, complete with dialogue, scenes, and structure — in just one click.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/script-generator"
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Start Writing Free
              </Link>
              <button className="border border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-50 transition-colors">
                Watch Demo
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose Our AI Script Generator?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Professional-grade script generation with industry-standard formatting
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">Generate complete scripts in under 30 seconds</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sign-Up Required</h3>
                <p className="text-gray-600">Start generating scripts immediately, no registration needed</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Industry Standard</h3>
                <p className="text-gray-600">Proper screenplay formatting with dialogue and scene descriptions</p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Perfect for Every Creator
              </h2>
              <p className="text-lg text-gray-600">
                From TikTok influencers to indie filmmakers
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">TikTok Creators</h3>
                <p className="text-gray-600 text-sm">Quick, engaging scripts for viral content</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">YouTube Channels</h3>
                <p className="text-gray-600 text-sm">Structured scripts for educational and entertainment videos</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Indie Filmmakers</h3>
                <p className="text-gray-600 text-sm">Professional short film scripts with proper formatting</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Content Marketers</h3>
                <p className="text-gray-600 text-sm">Compelling ad scripts and promotional content</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-indigo-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Create Your First Script?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of creators who are already using AI to write better scripts faster
            </p>
            <Link
              to="/script-generator"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Start Writing Now - It's Free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">ReadyScriptPro</h3>
                <p className="text-gray-400">
                  The fastest AI script generator for creators worldwide.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/script-generator" className="hover:text-white">Script Generator</Link></li>
                  <li><Link to="/script-doctor" className="hover:text-white">Script Doctor</Link></li>
                  <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                  <li><Link to="/templates" className="hover:text-white">Templates</Link></li>
                  <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/about" className="hover:text-white">About</Link></li>
                  <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                  <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 ReadyScriptPro. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AIScriptGenerator; 