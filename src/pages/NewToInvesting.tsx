import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import InvestmentTimingVideo from '../components/InvestmentTimingVideo';
import WhatToConsider from '../components/WhatToConsider';
import WaysToInvest from '../components/WaysToInvest';

export default function NewToInvesting() {
  return (
    <div className="min-h-screen bg-[#062832]">
      <Navbar />

      <div className="w-full relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr]">
          <div className="bg-[#083d47] text-white p-12 md:p-16 flex flex-col justify-center border-l-4 border-[#14bfd8]">
            <div className="max-w-xl">
              <p className="text-sm font-semibold tracking-wider mb-4 text-[#14bfd8] border-l-2 border-[#14bfd8] pl-3">INVESTMENTS</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight">
                Principles of investing
              </h1>
              <p className="text-base md:text-lg leading-relaxed mb-6">
                If you're new to investing, knowing where to start can be a daunting task. Here, we guide you through your investment journey, from what to consider before you start, the different types of investment account, which might suit you, and the various asset classes.
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                You'll also learn why it's important to focus on the long-term as an investor, and create a diversified portfolio which includes a range of different investments.
              </p>
            </div>
          </div>

          <div className="relative h-[350px] md:h-[450px] lg:h-[490px]">
            <img
              src="https://thenewinvestorsguide.com/wp-content/uploads/2023/11/fb_image.png"
              alt="Family learning about investment options together"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="bg-[#062832] py-8 border-t-2 border-[#0a7f8f]">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-white text-center text-base leading-relaxed">
              The value of investments can fall as well as rise and you could get back less than you invest. If you're not sure about investing, seek independent advice.
            </p>
          </div>
        </div>
      </div>

      <InvestmentTimingVideo />

      <WhatToConsider />

      <WaysToInvest />

      <div className="bg-[#0a7f8f] py-16">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to start your investment journey?
          </h2>
          <p className="text-xl text-white mb-8 leading-relaxed">
            Explore our investment accounts and find the right option for your goals.
          </p>
          <button className="px-8 py-4 bg-white text-[#0a7f8f] text-lg font-semibold hover:bg-gray-100 transition-colors">
            Compare investment accounts
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
