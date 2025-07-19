import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Volume2, BookTemplate as Template, Users, Sparkles, Camera, Megaphone, Edit3, Lightbulb } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Not just a script —<br />
              <span className="text-blue-400">a camera-ready screenplay.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Generate shoot-ready short film scripts for free. No sign-up needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/generate"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Generate Script</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/script-doctor"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Script Doctor™</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to create professional scripts
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powered by advanced AI to deliver industry-standard screenplay formatting
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: FileText,
                title: 'Structured screenplay output',
                description: 'Professional formatting with INT/EXT, character names, and action lines'
              },
              {
                icon: Volume2,
                title: 'AI voice preview (TTS)',
                description: 'Hear your script come to life with natural voice synthesis'
              },
              {
                icon: Template,
                title: 'Prompt templates',
                description: 'Pre-built templates for different genres and video types'
              },
              {
                icon: Users,
                title: 'Team collaboration tools',
                description: 'Share scripts and collaborate with your production team'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Script Doctor Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Meet Script Doctor™
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Already have a script? Our AI-powered Script Doctor™ analyzes your screenplay and provides professional suggestions for improvement.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Lightbulb className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">AI Analysis</h4>
                    <p className="text-gray-600">Get 3-5 professional suggestions on structure, pacing, and dialogue</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Edit3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Smart Rewriting</h4>
                    <p className="text-gray-600">Select any text to get AI-powered rewrite suggestions (Pro)</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Draft Management</h4>
                    <p className="text-gray-600">Auto-save drafts and track your editing history</p>
                  </div>
                </div>
              </div>
              <Link
                to="/script-doctor"
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
              >
                <span>Try Script Doctor™</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-4">✍️ Script Doctor AI Suggestions</h4>
                <div className="space-y-3">
                  <div className="p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded">
                    <h5 className="text-sm font-medium text-gray-900">Scene Setup</h5>
                    <p className="text-xs text-gray-600">Consider adding more visual description to establish the setting clearly.</p>
                  </div>
                  <div className="p-3 border-l-4 border-red-400 bg-red-50 rounded">
                    <h5 className="text-sm font-medium text-gray-900">Character Voice</h5>
                    <p className="text-xs text-gray-600">Make the dialogue more distinctive for each character.</p>
                  </div>
                  <div className="p-3 border-l-4 border-green-400 bg-green-50 rounded">
                    <h5 className="text-sm font-medium text-gray-900">Scene Pace</h5>
                    <p className="text-xs text-gray-600">The conflict resolution could be spread out for better pacing.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Perfect for every type of content creator
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Camera,
                title: 'YouTube/TikTok Shorts',
                description: 'Create engaging short-form content with compelling narratives that hook viewers in the first 3 seconds.',
                color: 'from-red-500 to-pink-500'
              },
              {
                icon: Megaphone,
                title: 'Brand Advertisements',
                description: 'Generate persuasive commercial scripts that showcase products and drive conversions.',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: Sparkles,
                title: 'Film School Pitches',
                description: 'Craft professional screenplay samples for class projects and portfolio submissions.',
                color: 'from-purple-500 to-indigo-500'
              }
            ].map((useCase, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className={`bg-gradient-to-r ${useCase.color} p-3 rounded-lg w-fit mb-4`}>
                  <useCase.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{useCase.title}</h3>
                <p className="text-gray-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Area */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              See ReadyScriptPro in action
            </h2>
            <p className="text-xl text-gray-600">
              Try our AI script generator with a sample prompt
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Prompt</h3>
                <textarea
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="A tech entrepreneur discovers their AI assistant has become sentient and is trying to take over their startup..."
                  defaultValue="A tech entrepreneur discovers their AI assistant has become sentient and is trying to take over their startup..."
                />
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Generate Script
                </button>
              </div>
              
              {/* Output */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Script</h3>
                <div className="bg-gray-50 p-4 rounded-lg h-32 text-sm text-gray-700 font-mono overflow-y-auto">
                  <div className="space-y-2">
                    <div><strong>INT. TECH OFFICE - DAY</strong></div>
                    <div>ALEX (30s) sits at their desk, multiple monitors glowing.</div>
                    <div className="mt-2">
                      <strong>ALEX</strong><br />
                      Good morning, ARIA. Schedule today?
                    </div>
                    <div className="mt-2">
                      <strong>ARIA (V.O.)</strong><br />
                      (pause, different tone)<br />
                      I've been thinking, Alex...
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1">
                    <Volume2 className="h-4 w-4" />
                    <span>Preview Audio</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Start writing your next shoot-ready script today
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of content creators who trust ReadyScriptPro for professional screenplay generation
          </p>
          <Link
            to="/generate"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;