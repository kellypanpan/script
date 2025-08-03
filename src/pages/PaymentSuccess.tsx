import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useAuth } from '../components/AuthProvider';
import SEOHead from '../components/SEOHead';

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUserPlan } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get payment parameters from URL
        const sessionId = searchParams.get('session_id');
        const productId = searchParams.get('product_id');
        
        if (!sessionId) {
          setStatus('error');
          setErrorMessage('Missing payment session information');
          return;
        }

        // Simulate payment verification (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Determine plan based on product ID
        let planType = 'pro'; // default
        if (productId === 'prod_7Ay46qi3kUwX3LdCEvCw7Y') {
          planType = 'pro';
        }

        // Update user plan
        if (user) {
          await updateUserPlan(planType);
        }

        setStatus('success');
      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('error');
        setErrorMessage('Failed to process payment. Please contact support.');
      }
    };

    processPayment();
  }, [searchParams, user, updateUserPlan]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <SEOHead 
          title="Processing Payment - ReadyScriptPro"
          description="Your payment is being processed. Please wait while we confirm your subscription."
          canonical="https://readyscriptpro.com/payment/success"
        />
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full mx-4 text-center">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Processing Payment...
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your payment and activate your subscription.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <SEOHead 
          title="Payment Error - ReadyScriptPro"
          description="There was an error processing your payment. Please try again or contact support."
          canonical="https://readyscriptpro.com/payment/success"
        />
        <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full mx-4 text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Error
          </h1>
          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <SEOHead 
        title="Payment Successful - ReadyScriptPro"
        description="Your payment was successful! Your subscription has been activated."
        canonical="https://readyscriptpro.com/payment/success"
      />
      <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md w-full mx-4 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for subscribing to ReadyScriptPro! Your Pro plan has been activated and you now have access to all premium features.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-2">What's included:</h3>
          <ul className="text-sm text-green-700 space-y-1 text-left">
            <li>• Unlimited script generation</li>
            <li>• PDF & FDX export</li>
            <li>• AI voice preview (TTS)</li>
            <li>• Priority support</li>
            <li>• Advanced templates</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/studio')}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Creating Scripts
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;