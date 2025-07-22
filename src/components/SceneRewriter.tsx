import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  Wand2, 
  Check, 
  X, 
  Loader2,
  ArrowLeft,
  ArrowRight 
} from 'lucide-react';
import { useAuthWithFallback } from './AuthProvider';

interface SceneRewriterProps {
  sceneText: string;
  sceneIndex: number;
  genre: string;
  tone: string;
  onRewriteAccept: (newText: string) => void;
  onRewriteReject: () => void;
}

type RewriteType = 'improve' | 'shorten' | 'expand' | 'change_tone';

interface RewriteResult {
  originalText: string;
  rewrittenText: string;
  suggestions: string[];
  tokensUsed: number;
}

export const SceneRewriter: React.FC<SceneRewriterProps> = ({
  sceneText,
  sceneIndex,
  genre,
  tone,
  onRewriteAccept,
  onRewriteReject,
}) => {
  const { canUseFeature } = useAuthWithFallback();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rewriteType, setRewriteType] = useState<RewriteType>('improve');
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canRewrite = canUseFeature('canRewriteScenes');

  const handleRewrite = async () => {
    if (!canRewrite) {
      setError('Scene rewriting is not available in your plan');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rewrite-scene', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Plan': 'free', // TODO: Get from user context
        },
        body: JSON.stringify({
          sceneText,
          genre,
          tone,
          rewriteType,
          preserveStructure: true,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Rewrite failed');
      }

      setResult({
        originalText: data.originalText,
        rewrittenText: data.rewrittenText,
        suggestions: data.suggestions || [],
        tokensUsed: data.tokensUsed || 0,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rewrite scene');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (result) {
      onRewriteAccept(result.rewrittenText);
      setIsOpen(false);
      setResult(null);
    }
  };

  const handleReject = () => {
    onRewriteReject();
    setResult(null);
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  if (!canRewrite) {
    return (
      <button
        disabled
        className="text-gray-400 hover:text-gray-500 p-1 rounded opacity-50 cursor-not-allowed"
        title="Upgrade to use scene rewriting"
      >
        <Wand2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
        title="Rewrite this scene"
      >
        <Wand2 className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Rewrite Scene {sceneIndex + 1}
                  </h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {!result ? (
                  /* Rewrite Options */
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Rewrite Type
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'improve', label: 'Improve', desc: 'Enhance clarity and impact' },
                          { value: 'shorten', label: 'Shorten', desc: 'Make more concise' },
                          { value: 'expand', label: 'Expand', desc: 'Add more detail' },
                          { value: 'change_tone', label: 'Change Tone', desc: 'Adjust emotional tone' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setRewriteType(option.value as RewriteType)}
                            className={`p-4 border rounded-lg text-left transition-colors ${
                              rewriteType === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Scene
                      </label>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                          {sceneText}
                        </pre>
                      </div>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="text-red-800 text-sm">{error}</div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRewrite}
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        <span>{isLoading ? 'Rewriting...' : 'Rewrite Scene'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Rewrite Result */
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <ArrowLeft className="h-4 w-4 text-gray-500" />
                          <label className="text-sm font-medium text-gray-700">
                            Original
                          </label>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                            {result.originalText}
                          </pre>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <ArrowRight className="h-4 w-4 text-green-500" />
                          <label className="text-sm font-medium text-gray-700">
                            Rewritten
                          </label>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                            {result.rewrittenText}
                          </pre>
                        </div>
                      </div>
                    </div>

                    {result.suggestions.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Suggestions Applied
                        </label>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <ul className="text-sm text-blue-800 space-y-1">
                            {result.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <Check className="h-3 w-3" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Tokens used: {result.tokensUsed}
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleReset}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={handleReject}
                          className="px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors flex items-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                        <button
                          onClick={handleAccept}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        >
                          <Check className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};