export default function InvestmentAccountComparison() {
  return (
    <div className="py-20 bg-[#062832] border-t-2 border-[#0a7f8f]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Investment Account VS Stocks and Shares ISA
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-[#083d47] p-8 border-l-2 border-[#0a7f8f]">
            <h3 className="text-2xl font-bold text-white mb-6">Investment Account</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-white mt-2 flex-shrink-0"></div>
                <p className="text-gray-200">You can invest an unlimited amount</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-white mt-2 flex-shrink-0"></div>
                <p className="text-gray-200">You may need to pay tax on any income or gains you make</p>
              </li>
            </ul>
          </div>

          <div className="bg-[#083d47] p-8 border-l-2 border-[#0a7f8f]">
            <h3 className="text-2xl font-bold text-white mb-6">Stocks and Shares ISA</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-white mt-2 flex-shrink-0"></div>
                <p className="text-gray-200">You can invest up to €20,000 per tax year</p>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-white mt-2 flex-shrink-0"></div>
                <p className="text-gray-200">You pay no income or capital gains tax on any returns you make</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
