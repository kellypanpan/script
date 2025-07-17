import React from 'react';
import { Check, Crown, Zap, Building } from 'lucide-react';

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for trying out ReadyScriptPro',
      icon: Zap,
      features: [
        '3 scripts per day',
        'Basic script formatting',
        'TXT export',
        'Community support',
        'Basic templates',
        'Character limit: 5 per script'
      ],
      limitations: [
        'No PDF/FDX export',
        'No voice preview',
        'No collaboration tools',
        'Limited script length'
      ],
      cta: 'Start for Free',
      ctaStyle: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      period: 'per month',
      description: 'For serious content creators and filmmakers',
      icon: Crown,
      features: [
        'Unlimited scripts',
        'Professional formatting',
        'PDF & FDX export',
        'AI voice preview (TTS)',
        'Advanced templates',
        'Unlimited characters',
        'Script analytics',
        'Priority support',
        'Custom branding',
        'Export to Final Draft'
      ],
      limitations: [],
      cta: 'Upgrade to Pro',
      ctaStyle: 'bg-blue-600 text-white hover:bg-blue-700',
      popular: true
    },
    {
      name: 'Studio',
      price: '$79',
      period: 'per month',
      description: 'For production teams and studios',
      icon: Building,
      features: [
        'Everything in Pro',
        '3 team seats included',
        'Real-time collaboration',
        'Team script library',
        'API access',
        'Advanced analytics',
        'Custom integrations',
        'Dedicated support',
        'White-label options',
        'Enterprise security'
      ],
      limitations: [],
      cta: 'Contact Sales',
      ctaStyle: 'bg-slate-800 text-white hover:bg-slate-900',
      popular: false
    }
  ];

  const features = [
    {
      category: 'Script Generation',
      items: [
        { name: 'Scripts per day', free: '3', pro: 'Unlimited', studio: 'Unlimited' },
        { name: 'Script length', free: 'Short (2-3 pages)', pro: 'Unlimited', studio: 'Unlimited' },
        { name: 'Characters per script', free: '5', pro: 'Unlimited', studio: 'Unlimited' },
        { name: 'AI-powered generation', free: '✓', pro: '✓', studio: '✓' },
        { name: 'Genre templates', free: 'Basic', pro: 'Advanced', studio: 'Advanced + Custom' }
      ]
    },
    {
      category: 'Export & Formats',
      items: [
        { name: 'TXT export', free: '✓', pro: '✓', studio: '✓' },
        { name: 'PDF export', free: '✗', pro: '✓', studio: '✓' },
        { name: 'FDX (Final Draft)', free: '✗', pro: '✓', studio: '✓' },
        { name: 'Audio export (TTS)', free: '✗', pro: '✓', studio: '✓' },
        { name: 'Custom branding', free: '✗', pro: '✓', studio: '✓' }
      ]
    },
    {
      category: 'Collaboration',
      items: [
        { name: 'Personal workspace', free: '✓', pro: '✓', studio: '✓' },
        { name: 'Team collaboration', free: '✗', pro: '✗', studio: '✓' },
        { name: 'Real-time editing', free: '✗', pro: '✗', studio: '✓' },
        { name: 'Shared script library', free: '✗', pro: '✗', studio: '✓' },
        { name: 'Team seats', free: '1', pro: '1', studio: '3+' }
      ]
    },
    {
      category: 'Support & Analytics',
      items: [
        { name: 'Community support', free: '✓', pro: '✗', studio: '✗' },
        { name: 'Priority support', free: '✗', pro: '✓', studio: '✓' },
        { name: 'Dedicated support', free: '✗', pro: '✗', studio: '✓' },
        { name: 'Script analytics', free: '✗', pro: '✓', studio: '✓' },
        { name: 'API access', free: '✗', pro: '✗', studio: '✓' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Choose your creative plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From individual creators to production studios, we have the perfect plan 
            to power your screenplay generation needs.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-sm border-2 p-8 relative ${
                plan.popular 
                  ? 'border-blue-500 transform scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              } transition-all duration-200`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="bg-gray-100 p-3 rounded-lg w-fit mx-auto mb-4">
                  <plan.icon className="h-8 w-8 text-gray-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${plan.ctaStyle}`}>
                  {plan.cta}
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <span className="w-5 h-5 text-gray-400 text-sm mt-0.5">×</span>
                          <span className="text-gray-500 text-sm">{limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="text-xl font-semibold text-gray-900">Compare all features</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Features</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Free</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900 bg-blue-50">Pro</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Studio</th>
                </tr>
              </thead>
              <tbody>
                {features.map((category, categoryIdx) => (
                  <React.Fragment key={categoryIdx}>
                    <tr className="bg-gray-50">
                      <td colSpan={4} className="py-3 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wide">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, itemIdx) => (
                      <tr key={itemIdx} className="border-b border-gray-100">
                        <td className="py-4 px-6 text-gray-700">{item.name}</td>
                        <td className="py-4 px-6 text-center text-gray-600">{item.free}</td>
                        <td className="py-4 px-6 text-center text-gray-600 bg-blue-50">{item.pro}</td>
                        <td className="py-4 px-6 text-center text-gray-600">{item.studio}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {[
              {
                question: 'Can I change plans anytime?',
                answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
              },
              {
                question: 'Do you offer refunds?',
                answer: 'We offer a 30-day money-back guarantee for all paid plans. No questions asked.'
              },
              {
                question: 'What formats can I export?',
                answer: 'Free users get TXT format. Pro and Studio users can export to PDF, FDX (Final Draft), and audio files.'
              },
              {
                question: 'Is there an API available?',
                answer: 'API access is available with Studio plans. Perfect for integrating ScriptProShot into your workflow.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to create amazing scripts?</h3>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of creators who trust ScriptProShot for their screenplay needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <button className="border-2 border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:border-white/60 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;