import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const AIShortFilmScriptGenerator: React.FC = () => {
  const [genre, setGenre] = useState('drama');
  const [length, setLength] = useState('5-10');
  const [tone, setTone] = useState('dramatic');

  return (
    <>
      <Helmet>
        <title>AI Short Film Script Generator – Free, Fast, No Sign-Up</title>
        <meta name="description" content="Write compelling short film scripts with AI. Get full dialogue, scene breakdowns, and export options. Try it free now on ReadyScriptPro." />
        <meta name="keywords" content="AI short film script generator, short film scripts, screenplay generator, film script writing" />
        <meta property="og:title" content="AI Short Film Script Generator – Free, Fast, No Sign-Up" />
        <meta property="og:description" content="Write compelling short film scripts with AI. Get full dialogue, scene breakdowns, and export options." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://readyscriptpro.com/ai-short-film-script-generator" />
        <link rel="canonical" href="https://readyscriptpro.com/ai-short-film-script-generator" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold text-purple-600">
                  ReadyScriptPro
                </Link>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link to="/" className="text-gray-700 hover:text-purple-600">Home</Link>
                <Link to="/script-generator" className="text-gray-700 hover:text-purple-600">Generator</Link>
                <Link to="/blog" className="text-gray-700 hover:text-purple-600">Blog</Link>
                <Link to="/pricing" className="text-gray-700 hover:text-purple-600">Pricing</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Short Film Script Generator
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Whether you're a student filmmaker or indie director, our AI short film script generator delivers structured, shootable scripts tailored to your concept. Free and unlimited for all users.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/script-generator"
                className="bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Generate Short Film Script
              </Link>
              <button className="border border-purple-600 text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-colors">
                View Examples
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Professional Short Film Scripts in Minutes
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Industry-standard formatting with proper scene structure and dialogue
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Scene Breakdowns</h3>
                <p className="text-gray-600">Detailed scene descriptions with camera directions</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Natural Dialogue</h3>
                <p className="text-gray-600">Realistic conversations that drive the story forward</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Options</h3>
                <p className="text-gray-600">PDF, Final Draft, and plain text formats</p>
              </div>
            </div>
          </div>
        </section>

        {/* Genres Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                All Genres Supported
              </h2>
              <p className="text-lg text-gray-600">
                From drama to comedy, horror to romance
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Drama</h3>
                <p className="text-gray-600 text-sm">Emotional depth and character development</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Comedy</h3>
                <p className="text-gray-600 text-sm">Witty dialogue and humorous situations</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Horror</h3>
                <p className="text-gray-600 text-sm">Suspenseful and atmospheric storytelling</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Romance</h3>
                <p className="text-gray-600 text-sm">Heartfelt connections and emotional journeys</p>
              </div>
            </div>
          </div>
        </section>

        {/* Length Options */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Perfect Lengths for Every Project
              </h2>
              <p className="text-lg text-gray-600">
                From micro-shorts to festival submissions
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">1-3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Micro Shorts</h3>
                <p className="text-gray-600">Perfect for social media and quick concepts</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">5-10</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Standard Shorts</h3>
                <p className="text-gray-600">Ideal for film festivals and portfolio pieces</p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">15-20</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Extended Shorts</h3>
                <p className="text-gray-600">For deeper storytelling and character arcs</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Your Short Film Today
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of filmmakers creating compelling short films with AI
            </p>
            <Link
              to="/script-generator"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Generate Your Script - Free
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
                  The fastest AI script generator for filmmakers worldwide.
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

export default AIShortFilmScriptGenerator; 