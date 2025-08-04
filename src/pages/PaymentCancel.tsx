import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';

const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full mx-4 text-center">
        <XCircle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Cancelled
        </h1>
        <p className="text-gray-600 mb-6">
          No worries! Your payment was cancelled and no charges were made to your account. 
          You can try again anytime or continue using our free plan.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Free Plan Still Available:</h3>
          <ul className="text-sm text-blue-700 space-y-1 text-left">
            <li>• 3 scripts per day</li>
            <li>• Basic script formatting</li>
            <li>• TXT export</li>
            <li>• Community support</li>
            <li>• Basic templates</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <CreditCard className="h-5 w-5" />
            <span>Try Payment Again</span>
          </button>
          <button
            onClick={() => navigate('/studio')}
            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Continue with Free Plan
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancel;