export default function CompareInvestmentAccountsSection() {
  return (
    <div className="w-full bg-[#062832] py-20 border-t-2 border-[#0a7f8f]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">Why choose Smart Investor?</h2>
          <p className="text-lg text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Smart Investor gives you the investment choice and research tools you need to help grow your money. Enjoy our award-winning accounts, expert insights and resources to help you work towards your financial goals.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-[#083d47] p-8 text-center hover:bg-[#0a5f6d] transition-colors border-l-2 border-[#0a7f8f]">
            <div className="mb-6 flex justify-center">
              <img
                src="https://www.barclays.co.uk/smart-investor/_jcr_content/root/body/content/section_862691177/sectionItem/sectionItem/section_item/sectionItem/grid/grid_item_copy_305989468/gridItem/tile/multimedia.coreimg.svg/1741084706858/investment-chart.svg"
                alt="Investment choice"
                className="w-20 h-20 object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Investment choice</h3>
            <p className="text-gray-300 text-sm">Over 8,000 different investments to choose from</p>
          </div>

          <div className="bg-[#083d47] p-8 text-center hover:bg-[#0a5f6d] transition-colors border-l-2 border-[#0a7f8f]">
            <div className="mb-6 flex justify-center">
              <img
                src="https://www.barclays.co.uk/smart-investor/_jcr_content/root/body/content/section_862691177/sectionItem/sectionItem/section_item/sectionItem/grid/grid_item_copy_1067860403/gridItem/tile/multimedia.coreimg.svg/1741084706905/hand-with-mobile.svg"
                alt="Accessible"
                className="w-20 h-20 object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Accessible</h3>
            <p className="text-gray-300 text-sm">Check your investments and trade anytime online or with the Barclays app</p>
          </div>

          <div className="bg-[#083d47] p-8 text-center hover:bg-[#0a5f6d] transition-colors border-l-2 border-[#0a7f8f]">
            <div className="mb-6 flex justify-center">
              <img
                src="https://www.barclays.co.uk/smart-investor/_jcr_content/root/body/content/section_862691177/sectionItem/sectionItem/section_item/sectionItem/grid/grid_item_copy/gridItem/tile/multimedia.coreimg.svg/1741084706950/headset.svg"
                alt="Expert guidance"
                className="w-20 h-20 object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Expert guidance</h3>
            <p className="text-gray-300 text-sm">Access professional insights and research tools to make informed investment decisions</p>
          </div>

          <div className="bg-[#083d47] p-8 text-center hover:bg-[#0a5f6d] transition-colors border-l-2 border-[#0a7f8f]">
            <div className="mb-6 flex justify-center">
              <img
                src="https://www.barclays.co.uk/adobe/dynamicmedia/deliver/urn:aaid:aem:53712606-5cab-42ef-a673-ad36d2795fd0/trophy.svg?width=1440&preferwebp=true"
                alt="Award-winning"
                className="w-20 h-20 object-cover"
              />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Award-winning</h3>
            <p className="text-gray-300 text-sm">'Best Stocks & Shares ISA Provider 2022' at the Online Money Awards and 'Best for Customer Service 2024' from Boring Money<sup>[1]</sup></p>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Our awards</h2>
          <div className="flex justify-center gap-6 mb-8 flex-wrap">
            <div className="bg-white w-36 h-36 overflow-hidden border-2 border-[#0a7f8f]">
              <img
                src="https://www.barclays.co.uk/content/experience-fragments/barclaysuk/common/sections/investments/collections/award-logos/master/_jcr_content/root/section_item/sectionItem/logo_group_copy/multimedia.coreimg.80.1440.png/1760972726057/money-facts-2025.png"
                alt="Moneyfacts Awards 2025 Winner"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white w-36 h-36 overflow-hidden border-2 border-[#0a7f8f]">
              <img
                src="https://www.barclays.co.uk/content/experience-fragments/barclaysuk/common/sections/investments/collections/award-logos/master/_jcr_content/root/section_item/sectionItem/logo_group_copy/item_1738600006152.coreimg.png/1758669058577/boring-money-best-customer-service-2025.png"
                alt="Boring Money Best For Customer Service 2025"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white w-36 h-36 overflow-hidden border-2 border-[#0a7f8f]">
              <img
                src="https://www.barclays.co.uk/content/experience-fragments/barclaysuk/common/sections/investments/collections/award-logos/master/_jcr_content/root/section_item/sectionItem/logo_group_copy/item_1738600009659.coreimg.png/1758669062702/boring-money-value-for-money-2025.png"
                alt="Consumer Rated Value for Money 2025"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <p className="text-gray-300 text-center max-w-4xl mx-auto text-sm leading-relaxed">
            We were named <span className="font-semibold">'Best Stocks & Shares ISA Provider'</span> at the Moneyfacts Investment Life & Pensions Awards 2025. We were also voted <span className="font-semibold">Best for Customer Service 2025</span> and <span className="font-semibold">Consumer Rated Value for Money 2025</span> from Boring Money.<sup>[2]</sup>
          </p>
        </div>

        <div className="mt-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">A simple, low-cost fee structure</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#083d47] p-8 text-center">
              <h3 className="text-gray-300 text-sm mb-4">Customer fee</h3>
              <p className="text-white text-4xl font-bold mb-4">0.25% p.a.</p>
              <p className="text-gray-400 text-sm mb-2">up to €200,000</p>
              <p className="text-gray-400 text-sm">and 0.05% on investments over €200,000</p>
            </div>

            <div className="bg-[#083d47] p-8 text-center">
              <h3 className="text-gray-300 text-sm mb-4">Buying and selling shares online*</h3>
              <p className="text-white text-4xl font-bold mb-4">€6</p>
              <p className="text-gray-400 text-sm mb-2">per trade**</p>
              <p className="text-gray-400 text-sm">Free to invest in funds online</p>
            </div>
          </div>

          <div className="bg-[#083d47] overflow-hidden">
            <div className="grid md:grid-cols-2 border-b border-gray-700">
              <div className="p-4 font-semibold text-white border-r border-gray-700">Activity</div>
              <div className="p-4 font-semibold text-white">Cost</div>
            </div>

            <div className="grid md:grid-cols-2 border-b border-gray-700">
              <div className="p-4 text-gray-300 border-r border-gray-700">Buying and selling funds online</div>
              <div className="p-4 text-gray-300">No charge**</div>
            </div>

            <div className="grid md:grid-cols-2 border-b border-gray-700">
              <div className="p-4 text-gray-300 border-r border-gray-700">Regular investments (including shares)</div>
              <div className="p-4 text-gray-300">No charge</div>
            </div>

            <div className="grid md:grid-cols-2 border-b border-gray-700">
              <div className="p-4 text-gray-300 border-r border-gray-700">Dividend reinvestment</div>
              <div className="p-4 text-gray-300">No charge</div>
            </div>

            <div className="grid md:grid-cols-2 border-b border-gray-700">
              <div className="p-4 text-gray-300 border-r border-gray-700">Holding cash</div>
              <div className="p-4 text-gray-300">No charge</div>
            </div>

            <div className="grid md:grid-cols-2 border-b border-gray-700">
              <div className="p-4 text-gray-300 border-r border-gray-700">Transferring investments</div>
              <div className="p-4 text-gray-300">No charge</div>
            </div>

            <div className="grid md:grid-cols-2">
              <div className="p-4 text-gray-300 border-r border-gray-700">Cash withdrawal and account closure</div>
              <div className="p-4 text-gray-300">No charge</div>
            </div>
          </div>

          <div className="mt-6 text-gray-400 text-xs">
            <p className="mb-2">*Including ETFs, investment trusts, bonds and gilts</p>
            <p>**€25 per trade by telephone. Taxes may apply when buying shares. A foreign exchange and an international brokerage fee will be charged when trading international shares.</p>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Choose your account</h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-[#083d47] p-8 hover:bg-[#252d45] transition-colors">
              <h3 className="text-2xl font-bold text-white mb-6">Investment ISA</h3>
              <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                Otherwise know as a Stocks and Shares ISA, this is the most popular account people choose when they start to invest.
              </p>
              <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                You can pay in up to €20,000 per tax year into our award winning ISA.
              </p>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                Any returns you make are tax free and you can withdraw cash when you like.
              </p>
              <a href="#" className="text-[#14bfd8] hover:text-white font-semibold text-sm inline-flex items-center group">
                Investment ISA
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </a>
            </div>

            <div className="bg-[#083d47] p-8 hover:bg-[#252d45] transition-colors">
              <h3 className="text-2xl font-bold text-white mb-6">Investment Account</h3>
              <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                A flexible account if you've already used your ISA allowance for the current tax year OR you're already paying into an ISA with another provider.
              </p>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                No limits on the amount you can invest and you can withdraw your cash at any time.
              </p>
              <a href="#" className="text-[#14bfd8] hover:text-white font-semibold text-sm inline-flex items-center group mt-auto">
                Investment Account
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </a>
            </div>
          </div>

          <p className="text-gray-300 text-center text-sm">
            If you have investment accounts elsewhere, you can{' '}
            <a href="#" className="text-[#14bfd8] hover:text-white font-semibold">
              transfer them to us
            </a>{' '}
            and benefit from having everything in one place. Transferring ISAs doesn't affect their tax-efficient status and with any transfer, you should make sure that you don't have to pay penalties or give up valuable benefits. Just let us know and we'll manage the transfer for you.
          </p>
        </div>

        <div className="mt-20">
          <h2 className="text-4xl font-bold text-white text-center mb-6">Fund your account</h2>
          <p className="text-gray-300 text-center max-w-4xl mx-auto mb-12 text-sm leading-relaxed">
            You have three ways to fund your Smart Investor account. Choose the option that best suits you and get started in minutes with your very own Investment Account (GIA) or Investment ISA.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#083d47] p-8 hover:bg-[#252d45] transition-colors">
              <h3 className="text-xl font-bold text-white mb-4">1. Setup a direct debit</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Setup a regular Direct Debit from your chosen UK Bank Account
              </p>
            </div>

            <div className="bg-[#083d47] p-8 hover:bg-[#252d45] transition-colors">
              <h3 className="text-xl font-bold text-white mb-4">2. Top up your account</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Top-up online or by phone using a Debit Card in your name
              </p>
            </div>

            <div className="bg-[#083d47] p-8 hover:bg-[#252d45] transition-colors">
              <h3 className="text-xl font-bold text-white mb-4">3. Transfer funds</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Transfer in by moving money from your Barclays account
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Choose investments that suit you</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#083d47] p-8 hover:bg-[#252d45] transition-colors flex flex-col">
              <h3 className="text-xl font-bold text-white mb-4">I'd like some inspiration</h3>
              <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                Choose from one of our five Ready-made Investment funds based on the level of return you're hoping for balanced against how you feel about taking investment risk
              </p>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Put together by our team of investment professionals, who monitor them regularly to make sure they stay true to their objectives
              </p>
              <a href="#" className="text-[#14bfd8] hover:text-white font-semibold text-sm inline-flex items-center group mt-auto">
                Ready-made Investments
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </a>
            </div>

            <div className="bg-[#083d47] p-8 hover:bg-[#252d45] transition-colors flex flex-col">
              <h3 className="text-xl font-bold text-white mb-4">I'd like to see the Barclays Funds List</h3>
              <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                See the Funds List that our experts have put together
              </p>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Use funds to help balance your risk across different industries, geographic locations and investment types
              </p>
              <a href="#" className="text-[#14bfd8] hover:text-white font-semibold text-sm inline-flex items-center group mt-auto">
                See our funds list
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </a>
            </div>

            <div className="bg-[#083d47] p-8 hover:bg-[#252d45] transition-colors flex flex-col">
              <h3 className="text-xl font-bold text-white mb-4">I know what I'm doing</h3>
              <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                Choose from thousands of investments including funds, shares, gilts and bonds
              </p>
              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Use the tools and insights in our Research Centre to make your own investment decisions
              </p>
              <a href="#" className="text-[#14bfd8] hover:text-white font-semibold text-sm inline-flex items-center group mt-auto">
                Show me all investments
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Get help or contact us</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#083d47] p-8 hover:bg-[#252d45] transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-white text-3xl">→</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Already have an account?</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    If you already have an account,{' '}
                    <a href="#" className="text-[#14bfd8] hover:text-white font-semibold">
                      log in to continue
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#083d47] p-8 hover:bg-[#252d45] transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-white text-3xl">📱</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">Call us</h3>
                  <p className="text-gray-300 text-sm">
                    If you have any questions, you can give us a call<sup>[3]</sup> on 0800 279 3667.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
