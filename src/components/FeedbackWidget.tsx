import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Star } from 'lucide-react';

interface FeedbackWidgetProps {
  className?: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'general'>('general');
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);

    try {
      // 这里可以集成实际的反馈API
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      
      console.log('Feedback submitted:', {
        type: feedbackType,
        rating,
        message,
        email,
        timestamp: new Date().toISOString()
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setMessage('');
        setEmail('');
        setRating(0);
        setFeedbackType('general');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: 'bug', label: '🐛 Bug Report', color: 'text-red-600' },
    { value: 'feature', label: '💡 Feature Request', color: 'text-blue-600' },
    { value: 'general', label: '💬 General Feedback', color: 'text-green-600' }
  ];

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mb-4 bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-80"
          >
            {!isSubmitted ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">发送反馈</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* 反馈类型选择 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      反馈类型
                    </label>
                    <div className="space-y-2">
                      {feedbackTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFeedbackType(type.value as typeof feedbackType)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            feedbackType === type.value
                              ? 'bg-blue-50 border-blue-500 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className={type.color}>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 评分 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      整体满意度 (可选)
                    </label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition-colors hover:scale-110 transform"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 反馈内容 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      反馈内容 *
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="请详细描述您的问题、建议或意见..."
                      required
                    />
                  </div>

                  {/* 邮箱 (可选) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      联系邮箱 (可选)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      如需回复，请留下邮箱
                    </p>
                  </div>

                  {/* 提交按钮 */}
                  <button
                    type="submit"
                    disabled={!message.trim() || isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>发送中...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>发送反馈</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  反馈已发送！
                </h3>
                <p className="text-gray-600 text-sm">
                  感谢您的反馈，我们会认真考虑您的建议
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 浮标按钮 */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors ${
          isOpen ? 'rotate-45' : ''
        }`}
        style={{ transition: 'all 0.3s ease' }}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </motion.button>
    </div>
  );
};

export default FeedbackWidget;