import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function FeedbackFooter() {
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="bg-[#083d47] py-12 border-t-2 border-[#0a7f8f]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          {feedback === null ? (
            <>
              <h2 className="text-white text-2xl font-bold mb-4">
                Was this helpful?
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Your feedback helps us improve your experience.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setFeedback('yes')}
                  className="flex items-center gap-2 text-white font-semibold border-2 border-[#14bfd8] px-8 py-3 hover:bg-[#0a7f8f] hover:text-white transition-colors"
                >
                  Yes <ThumbsUp className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setFeedback('no')}
                  className="flex items-center gap-2 text-white font-semibold border-2 border-[#14bfd8] px-8 py-3 hover:bg-[#0a7f8f] hover:text-white transition-colors"
                >
                  No <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <p className="text-white text-xl">
              {feedback === 'yes'
                ? "We're happy you found this helpful."
                : "We're sorry you didn't find this helpful."}
            </p>
          )}
        </div>
      </div>

      <div className="bg-[#e8e8e8] py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <button
            onClick={handleScrollToTop}
            className="text-gray-700 font-semibold hover:text-gray-900 transition-colors duration-300 underline"
          >
            Return to top
          </button>
        </div>
      </div>
    </>
  );
}
