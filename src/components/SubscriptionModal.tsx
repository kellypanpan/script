import React from 'react';
import { X } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  feature = "premium features" 
}) => {
  if (!isOpen) return null;

  const handleUpgrade = (plan: 'pro' | 'studio') => {
    // 这里可以集成实际的支付系统
    window.open('/pricing', '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Upgrade to Pro to Unlock {feature}
          </h2>
          <p className="text-gray-600">
            Get access to premium AI script optimization features and take your writing to the next level
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">Pro Plan</h3>
              <span className="text-blue-600 font-bold">$9.99/month</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Unlimited AI script generation</li>
              <li>✅ Advanced script analysis</li>
              <li>✅ One-click suggestion application</li>
              <li>✅ Premium export formats</li>
              <li>✅ Priority customer support</li>
            </ul>
            <button
              onClick={() => handleUpgrade('pro')}
              className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Upgrade to Pro
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-800">Studio Plan</h3>
              <span className="text-purple-600 font-bold">$19.99/month</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ All Pro plan features</li>
              <li>✅ Advanced AI models</li>
              <li>✅ Team collaboration tools</li>
              <li>✅ Custom script templates</li>
              <li>✅ API access</li>
            </ul>
            <button
              onClick={() => handleUpgrade('studio')}
              className="w-full mt-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
            >
              Upgrade to Studio
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500 mb-3">
            30-day money-back guarantee • Cancel anytime
          </p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};