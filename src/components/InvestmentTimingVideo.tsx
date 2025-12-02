import { useState, useRef } from 'react';
import { ChevronDown, Play } from 'lucide-react';

export default function InvestmentTimingVideo() {
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  return (
    <div className="bg-[#062832] py-20 border-t-2 border-[#0a7f8f]">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white mb-6 text-center">
          Why it's time in the market, not timing the market
        </h2>
        <p className="text-lg text-white text-center mb-12 max-w-3xl mx-auto">
          Watch Lithuanian Crypto Central Bank's Savings and Investments Director, Clare Francis, as she shares her thoughts on why there's no time like the present when it comes to investing.
        </p>

        <div className="max-w-4xl mx-auto">
          <div className="relative bg-black overflow-hidden border-2 border-[#0a7f8f]">
            <video
              ref={videoRef}
              controls
              controlsList="nodownload"
              className="w-full"
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
            >
              <source src="/invest.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer" onClick={handlePlayClick}>
                <div className="w-20 h-20 rounded-full bg-white/90 hover:bg-white transition-colors flex items-center justify-center">
                  <Play className="w-10 h-10 text-[#062832] ml-1" fill="currentColor" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
              className="flex items-center gap-2 text-[#14bfd8] hover:text-white transition-colors mx-auto"
            >
              <span className="text-lg font-medium">Transcript</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isTranscriptOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isTranscriptOpen && (
              <div className="mt-6 bg-white p-8 max-h-64 overflow-y-auto border-l-4 border-[#0a7f8f]">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    One of the most common things new investors wonder about when it comes to getting started, is whether or not it's a good time.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    As the saying goes – there's no time like the present.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Stock markets don't move in a straight line and without the help of a crystal ball, there's no way of choosing the best day to invest your money.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Even the professionals don't have the answer.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    What's important is whether it's the right time for you to invest, rather than worrying about what's happening in the wider economy.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    And the right time will be different for everybody.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    But as a rule of thumb, if you don't have credit cards debts or loans and you've got rainy-day savings to cover unexpected costs, and short-term goals – like holidays – and then you've got some money you can afford to put away for a few years – we suggest at least five – investing is worth considering.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Because the sooner you start, the longer your money has to grow.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Naturally, there will be ups and downs along the way and sometimes the value of your investments will fall.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    But this only matters if you want to sell your investments – otherwise, it's just a loss on paper.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    And even if you do need to sell, you will only lose money if the value is lower than the amount you'd invested.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you've been investing for a while and the value has gone up before it's fallen, you might still get back more than you'd put in.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Also, try and avoid knee-jerk reactions if stock markets start to fall.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Some of the worst performing days have been followed by some of the best.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    So if you panic and sell because share prices have fallen, you risk missing out on the recovery.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    It's time in the market that matters, and not timing the market.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Historically, over the long-term stock markets tend to produce better returns than cash, though there are of course no guarantees.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    By keeping your money invested and riding out difficult market cycles, it should have time to recover from any market downturns so you reap the longer-term benefits.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Once you feel you're ready to start investing, we offer lots of different ways to help you get started, allowing you to be as hands-on or hands-off as you like.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    But whichever option you choose, you can be confident knowing you're with an experienced provider.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
