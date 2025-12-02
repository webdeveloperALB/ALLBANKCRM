import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TestimonialSection from '../components/TestimonialSection';
import InvestmentAccountComparison from '../components/InvestmentAccountComparison';
import WhyChooseInvestmentAccount from '../components/WhyChooseInvestmentAccount';
import InvestmentAccountTestimonial from '../components/InvestmentAccountTestimonial';
import InvestmentOptions from '../components/InvestmentOptions';
import InvestmentCalculator from '../components/InvestmentCalculator';

export default function GeneralInvestmentAccount() {
  return (
    <div className="min-h-screen bg-[#062832]">
      <Navbar />

      <div className="w-full bg-[#083d47] overflow-hidden border-l-4 border-[#14bfd8]">
        <div className="w-full">
          <div className="grid md:grid-cols-[1fr_1.3fr] gap-0">
              <div className="p-12 md:p-16 flex flex-col justify-center">
                <div className="text-white text-xs font-semibold mb-4 tracking-wider border-l-2 border-[#14bfd8] pl-3">INVESTMENTS</div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Investment Account</h1>
                <p className="text-xl md:text-2xl text-white font-semibold mb-6">Low-cost investing with no upper limit</p>
                <p className="text-white text-base md:text-lg mb-8 leading-relaxed">
                  A great choice for when you've used your ISA allowance. Enjoy unlimited investing and you can start from €50 with our low-cost Investment Account.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="px-6 md:px-8 py-3 bg-white text-[#0a7f8f] font-semibold hover:bg-gray-100 transition-colors text-sm md:text-base">
                    Log in to apply
                  </button>
                  <button className="px-6 md:px-8 py-3 border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors text-sm md:text-base">
                    No login? Apply here
                  </button>
                </div>
              </div>

              <div className="relative h-[350px] md:h-[450px] lg:h-[550px]">
                <img
                  src="https://media.licdn.com/dms/image/D4E12AQEWMFjy4NS4pQ/article-cover_image-shrink_720_1280/0/1681378486175?e=2147483647&v=beta&t=y1BdC57VkjcYu8DhJ2TCLJ8samzPY86QiY4ZGy_Mf7k"
                  alt="Person reviewing investment account on mobile device"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
        </div>
      </div>

      <div className="py-20 bg-[#062832]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-12">What is an Investment Account?</h2>

          <p className="text-gray-300 text-lg text-center max-w-5xl mx-auto mb-16 leading-relaxed">
            An Investment Account offers no upper limit on how much you can invest. This makes it a useful option if you've already used your ISA allowance.
            Unlike a Stocks and Shares ISA, any returns or income from your investments will be subject to tax. You can choose from a range of funds, shares,
            exchange-traded funds (ETFs), bonds and more. You can also withdraw your cash at any time.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-[#083d47] p-8 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-yellow-500 flex items-center justify-center">
                  <span className="text-4xl">€</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">No upper limit</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Help grow your money with no upper limit on how much you can invest in an Investment Account.
              </p>
            </div>

            <div className="bg-[#083d47] p-8 text-center">
              <div className="flex justify-center mb-6">
                 <img
                  src="https://www.barclays.co.uk/smart-investor/accounts/investment-account/_jcr_content/root/body/content/section_865590567_co/section_item/sectionItem/grid_copy_copy/item_1698213989130/gridItem/tile_copy_copy_copy_/multimedia.coreimg.svg/1740492320314/coins-arrow.svg"
                  alt="Person using mobile investment app"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Wide investment choice</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Choose from over 8,000 investments or if you're not sure where to invest or short on time, select from one of five{' '}
                <a href="#" className="text-[#14bfd8] hover:text-white">Ready-made Investment</a> options and leave the rest to us.
              </p>
            </div>

            <div className="bg-[#083d47] p-8 text-center">
              <div className="flex justify-center mb-6">
                <img
                  src="https://www.barclays.co.uk/smart-investor/accounts/investment-account/_jcr_content/root/body/content/section_865590567_co/section_item/sectionItem/grid_copy_copy/item_1698213995304/gridItem/tile_copy_copy_copy_/multimedia.coreimg.svg/1740492320374/hand-and-bank-notes.svg"
                  alt="Person using mobile investment app"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Withdraw your money at any time</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                You can sell investments and withdraw your cash at any time. There are no fees for withdrawing cash.
              </p>
            </div>

            <div className="bg-[#083d47] p-8 text-center">
              <div className="flex justify-center mb-6">
                 <img
                  src="https://www.barclays.co.uk/smart-investor/accounts/investment-account/_jcr_content/root/body/content/section_865590567_co/section_item/sectionItem/grid_copy_copy/item_1698213995304_c/gridItem/tile_copy_copy_copy_/multimedia.coreimg.svg/1749553905593/fscs.svg"
                  alt="Person using mobile investment app"
                />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Protected</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                As a FTSE 100 company with over 300 years' experience, we're committed to protecting your investments. We're also covered by the Financial Services Compensation Scheme.
              </p>
            </div>
          </div>
        </div>
      </div>

      <TestimonialSection />

      <InvestmentAccountComparison />

      <WhyChooseInvestmentAccount />

      <InvestmentAccountTestimonial />

      <InvestmentOptions />

      <InvestmentCalculator />

      <div className="py-20 bg-[#062832]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Get started today</h2>

          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Ready to start investing with no upper limit? Open your Investment Account today and start building your portfolio.
            </p>

            <div className="flex justify-center gap-4">
              <button className="px-8 py-4 bg-[#0a7f8f] hover:bg-[#096a78] text-white font-semibold transition-colors text-lg">
                Log in to apply
              </button>
              <button className="px-8 py-4 border-2 border-[#0a7f8f] text-[#0a7f8f] hover:bg-[#0a7f8f]/10 font-semibold transition-colors text-lg">
                No login? Apply here
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
