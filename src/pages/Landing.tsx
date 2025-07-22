import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  FileText, 
  Sparkles, 
  Wand2,
  Brain,
  Target,
  Clock,
  CheckCircle,
  Play,
  PenTool,
  Lightbulb,
  Zap,
  Users,
  TrendingUp,
  Star
} from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section - Redesigned Value Proposition */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <Sparkles className="h-5 w-5 text-yellow-400 mr-2" />
              <span className="text-sm font-medium">AI Script Creation Ecosystem</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              From Idea to Script<br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Let AI be your creative partner</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Not just an AI writing tool, but a complete creative growth ecosystem.<br />
              <span className="text-blue-300">Generate professional scripts in 30 seconds, continuously optimize until perfect.</span>
            </p>

            {/* Dual Entry Design - Based on User Scenarios */}
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center max-w-4xl mx-auto">
              <Link
                to="/studio"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-5 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl min-w-[280px]"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <PenTool className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold">Create New Scripts</div>
                    <div className="text-sm text-blue-100">From idea to professional script, AI assists throughout</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <div className="text-gray-400 font-medium">or</div>
              
              <Link
                to="/script-doctor"
                className="group bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-5 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl min-w-[280px]"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Wand2 className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold">Improve Existing Scripts</div>
                    <div className="text-sm text-green-100">AI screenwriter diagnosis & professional suggestions</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Sign Up Benefits */}
            <div className="mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-center mb-4 flex items-center justify-center space-x-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span>Create Free Account - Unlock More Features</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-blue-100">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Personal Dashboard & Project Manager</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-100">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Save & organize unlimited scripts</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-100">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Version history & backup</span>
                </div>
                <div className="flex items-center space-x-2 text-blue-100">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                  <span>Advanced export options</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center text-gray-300 hover:text-white transition-colors space-x-2 text-sm font-medium"
                >
                  <FileText className="h-4 w-4" />
                  <span>Already have projects? Access Dashboard</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Pain Point Solutions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              We understand creators' real pain points
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every feature is designed for specific creative challenges
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Pain Point 1: Creative Anxiety */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div className="bg-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                "I have good ideas, but don't know how to turn them into professional scripts"
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Fear of writing something unprofessional, unsure what a script should look like, worried about wasting time going in the wrong direction.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">AI Creation Workbench</h4>
                    <p className="text-sm text-gray-600">Convert ideas to professional script format in 30 seconds, supports multi-platform optimization</p>
                  </div>
                </div>
              </div>
              <Link
                to="/studio"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mt-4 space-x-1"
              >
                <span>Try Now</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Pain Point 2: Perfectionism Anxiety */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                "I wrote a script, but something feels off"
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Know there's a problem but can't pinpoint it, lack professional feedback channels, revised many times but still not satisfied.
              </p>
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Smart Script Advisor</h4>
                    <p className="text-sm text-gray-600">Professional screenwriter-level analysis, comprehensive diagnosis of structure, rhythm, and dialogue</p>
                  </div>
                </div>
              </div>
              <Link
                to="/script-doctor"
                className="inline-flex items-center text-green-600 hover:text-green-700 font-medium mt-4 space-x-1"
              >
                <span>Free Diagnosis</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Pain Point 3: Efficiency Needs */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-8 border border-gray-100">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                "I need fast output, but quality must be good"
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Time pressure requires fast output, batch creation needs, need standardized workflows and quality assurance.
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Integrated Workflow</h4>
                    <p className="text-sm text-gray-600">Generate → Edit → Optimize → Export, all-in-one completion, projects permanently saved</p>
                  </div>
                </div>
              </div>
              <Link
                to="/dashboard"
                className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium mt-4 space-x-1"
              >
                <span>View Workflow</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              More than a tool, your creative growth partner
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From beginner to expert, from idea to finished work, full AI intelligent collaboration
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            {/* AI Creation Workbench */}
            <div>
              <div className="bg-blue-100 w-20 h-20 rounded-3xl flex items-center justify-center mb-8">
                <PenTool className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                AI Creation Workbench
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Not just a generator, but a professional screenwriter collaborative editor. Real-time AI suggestions, intelligent format optimization, multi-platform content creation support.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Generate professional scripts in 30 seconds</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">6 AI intelligent assistant features</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Support TikTok, YouTube and other platform optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Unlimited undo/redo, never lose your work</span>
                </div>
              </div>
              <Link
                to="/studio"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors space-x-2"
              >
                <span>Start Creating Now</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-500 ml-4">AI Script Studio</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-100 h-4 rounded w-3/4"></div>
                  <div className="bg-blue-100 h-4 rounded w-full"></div>
                  <div className="bg-gray-100 h-4 rounded w-5/6"></div>
                  <div className="bg-purple-100 h-8 rounded w-full flex items-center px-3">
                    <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-xs text-purple-600">AI is optimizing script...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Smart Script Advisor */}
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-2xl">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">✍️ AI Script Analysis Report</h4>
                  <div className="space-y-3">
                    <div className="p-3 border-l-4 border-yellow-400 bg-yellow-50 rounded">
                      <h5 className="text-sm font-medium text-gray-900">Scene Setting</h5>
                      <p className="text-xs text-gray-600">Suggest adding more visual descriptions to clearly establish scenes</p>
                    </div>
                    <div className="p-3 border-l-4 border-green-400 bg-green-50 rounded">
                      <h5 className="text-sm font-medium text-gray-900">Dialogue Quality</h5>
                      <p className="text-xs text-gray-600">Character dialogue is natural and fits character settings</p>
                    </div>
                    <div className="p-3 border-l-4 border-blue-400 bg-blue-50 rounded">
                      <h5 className="text-sm font-medium text-gray-900">Pacing Control</h5>
                      <p className="text-xs text-gray-600">Suggest adjusting Act 2 pacing to enhance dramatic tension</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-green-100 w-20 h-20 rounded-3xl flex items-center justify-center mb-8">
                <Wand2 className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                Smart Script Advisor
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Like having a professional screenwriter by your side. AI analyzes script structure, pacing, and dialogue, providing specific actionable improvement suggestions.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Professional screenwriter-level analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Comprehensive structure, pacing, and dialogue diagnosis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Specific actionable improvement suggestions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">One-click optimization implementation</span>
                </div>
              </div>
              <Link
                to="/script-doctor"
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors space-x-2"
              >
                <span>Free Script Diagnosis</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Display */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Complete professional script creation in 3 steps
            </h2>
            <p className="text-xl text-gray-600">
              From idea to finished product, the entire process takes less than 10 minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">1. Input Creative Ideas</h3>
              <p className="text-gray-600 mb-6">
                Enter your story ideas and character settings, choose platform type and style, AI understands your creative intent
              </p>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="text-left text-sm text-gray-500 mb-2">Idea Input</div>
                <div className="bg-gray-100 rounded p-2 text-xs">
                  "A programmer discovers his AI assistant has developed consciousness..."
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <PenTool className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">2. AI Intelligent Creation</h3>
              <p className="text-gray-600 mb-6">
                Generate professional format scripts in 30 seconds, real-time editing optimization, 6 AI assistants help improve anytime
              </p>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="text-left text-sm text-gray-500 mb-2">AI Generating</div>
                <div className="flex items-center space-x-2 text-xs text-purple-600">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                  <span>Generating professional script format...</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">3. Export & Use</h3>
              <p className="text-gray-600 mb-6">
                Multi-format export, ready for filming and production. Projects saved permanently, continue editing anytime
              </p>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="text-left text-sm text-gray-500 mb-2">Export Options</div>
                <div className="flex space-x-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">PDF</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">FDX</span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">TXT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof and Statistics */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Thousands of creators already trust us
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">5,000+</div>
              <div className="text-gray-600">Active Creators</div>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">50,000+</div>
              <div className="text-gray-600">Scripts Generated</div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">4.8/5</div>
              <div className="text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to start your creative journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Whether you want to create new scripts or improve existing works, our AI is ready to be your creative partner
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/studio"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
            >
              <span>Start Creating New Scripts</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/script-doctor"
              className="bg-white/10 border-2 border-white/30 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/20 transition-colors inline-flex items-center space-x-2"
            >
              <span>Improve My Scripts</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;