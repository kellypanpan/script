import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const AIScreenplayGenerator: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>AI Screenplay Generator – Write Camera-Ready Scripts Instantly</title>
        <meta name="description" content="Use AI to write professional-quality screenplays with structure, pacing, and realistic dialogue. Designed for indie creators and filmmakers." />
        <meta name="keywords" content="AI screenplay generator, screenplay writing, film scripts, movie scripts, script writing tool" />
        <meta property="og:title" content="AI Screenplay Generator – Write Camera-Ready Scripts Instantly" />
        <meta property="og:description" content="Use AI to write professional-quality screenplays with structure, pacing, and realistic dialogue." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://readyscriptpro.com/ai-screenplay-generator" />
        <link rel="canonical" href="https://readyscriptpro.com/ai-screenplay-generator" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link to="/" className="text-2xl font-bold text-orange-600">
                  ReadyScriptPro
                </Link>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link to="/" className="text-gray-700 hover:text-orange-600">Home</Link>
                <Link to="/script-generator" className="text-gray-700 hover:text-orange-600">Generator</Link>
                <Link to="/blog" className="text-gray-700 hover:text-orange-600">Blog</Link>
                <Link to="/pricing" className="text-gray-700 hover:text-orange-600">Pricing</Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              AI Screenplay Generator
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Skip the blank page. Our AI screenplay generator helps you create industry-style scripts with acts, beats, and rich dialogue for your short films and creative projects.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/script-generator"
                className="bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Write Screenplay
              </Link>
              <button className="border border-orange-600 text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-50 transition-colors">
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
                Professional Screenplay Features
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Industry-standard formatting with proper structure and pacing
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Three-Act Structure</h3>
                <p className="text-gray-600">Proper setup, confrontation, and resolution</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Realistic Dialogue</h3>
                <p className="text-gray-600">Natural conversations that reveal character</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Generation</h3>
                <p className="text-gray-600">Complete screenplays in under 60 seconds</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-orange-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Start Writing Your Screenplay
            </h2>
            <p className="text-xl text-orange-100 mb-8">
              Join filmmakers worldwide using AI to create compelling screenplays
            </p>
            <Link
              to="/script-generator"
              className="bg-white text-orange-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Write Screenplay - Free
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
                  The fastest AI screenplay generator for filmmakers worldwide.
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

export default AIScreenplayGenerator; 