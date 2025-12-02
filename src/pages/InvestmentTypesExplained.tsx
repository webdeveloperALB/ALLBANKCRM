import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatToConsiderSection from '../components/WhatToConsiderSection';

export default function InvestmentTypesExplained() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="w-full bg-[#083d47] text-white py-20 border-l-4 border-[#14bfd8]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-wider mb-4 text-[#14bfd8]">INVESTMENTS</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Investments explained</h1>

          <div className="space-y-6 text-base md:text-lg">
            <p>
              You can choose from thousands of investments to build a portfolio to match
              your needs, and with our expert insight, tools, tips and more, we can help
              guide you on your investment journey, although we can't advise you on
              investments that might be suitable for you.
            </p>

            <p>
              If you're not sure what to do first, or would like information on your
              options, <span className="underline">then understanding what investments Smart Investor has to
              offer</span> could be a great place to start.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#062832] text-white py-8 border-t-2 border-[#0a7f8f]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-base">
            The value of investments can fall as well as rise and you could get back less than you invest.
            If you're not sure about investing, seek independent advice.
          </p>
        </div>
      </div>

      <WhatToConsiderSection />

      <Footer />
    </div>
  );
}
