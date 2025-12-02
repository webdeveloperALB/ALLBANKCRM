import { TrendingUp, Target } from 'lucide-react';

export default function InvestmentOptions() {
  return (
    <div className="bg-[#062832] py-20 border-t-2 border-[#0a7f8f]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white text-center mb-8">
          Choose how you want to invest
        </h2>

        <p className="text-gray-300 text-center max-w-4xl mx-auto mb-16 leading-relaxed">
          Are you interested in opening an Investment Account but not sure what to invest your money in? Well, we offer more than 8,000 investments including UK and international shares and over 2,400 funds, meaning you can build a portfolio to fit your exact goals. You can also leave the hard work to us by choosing from five Ready-made Investment funds.
        </p>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-[#083d47] p-8 border-l-2 border-[#0a7f8f]">
            <div className="mb-6">
              <div className="w-16 h-16 bg-transparent flex items-center justify-center">
                 <img
                  src="https://www.barclays.co.uk/smart-investor/accounts/investment-account/_jcr_content/root/body/content/section_1695399351_c/section_item/sectionItem/grid_copy_copy/item_1698213989130/gridItem/tile_copy_copy_copy/multimedia.coreimg.svg/1740492321611/coloured-shapes.svg"
                  alt="Person using mobile investment app"
                />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Ready-made Investments</h3>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Leave the decision-making to the experts when you choose one of our five Ready-made Investments ranging from low to higher risk. It's an ideal choice if you want your money to grow but you're new to investing or short on time.
            </p>
            <button className="border-2 border-[#14bfd8] text-[#14bfd8] hover:bg-[#0a7f8f] hover:text-white px-6 py-3 font-semibold transition-colors">
              Ready-made Investments
            </button>
          </div>

          <div className="bg-[#083d47] p-8 border-l-2 border-[#0a7f8f]">
            <div className="mb-6">
              <div className="w-16 h-16 bg-transparent flex items-center justify-center">
                <img
                  src="https://www.barclays.co.uk/smart-investor/accounts/investment-account/_jcr_content/root/body/content/section_1695399351_c/section_item/sectionItem/grid_copy_copy/item_1698213995304/gridItem/tile_copy_copy/multimedia.coreimg.svg/1740492321702/target-yellow.svg"
                  alt="Person using mobile investment app"
                />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Pick your own</h3>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Choose from thousands of investments such as funds, shares (including US shares), ETFs, bonds and more. You can dive into our in-depth insights and research that can help you make the right choice.
            </p>
            <button className="border-2 border-[#14bfd8] text-[#14bfd8] hover:bg-[#0a7f8f] hover:text-white px-6 py-3 font-semibold transition-colors">
              Explore all investments
            </button>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Earn interest on cash
          </h2>

          <p className="text-gray-300 max-w-3xl mx-auto mb-4 leading-relaxed">
            When you open an Investment Account, you'll gain access to our Investment Saver service. This means you can earn interest on any uninvested cash you hold in your Investment Account. <a href="#" className="text-[#14bfd8] hover:text-white underline">Find out more about the Investment Saver</a>.
          </p>

          <p className="text-white text-lg font-semibold mb-8">
            Any cash held in your Investment Saver will earn:
          </p>

          <div className="bg-[#083d47] p-8 max-w-md mx-auto border-2 border-[#0a7f8f]">
            <div className="text-5xl font-bold text-white mb-2">1.06% AER</div>
            <p className="text-gray-400 text-sm">per year variable for balances from £1</p>
          </div>
        </div>
      </div>
    </div>
  );
}
