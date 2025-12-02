export default function WaysToInvest() {
  const investmentOptions = [
    {
      image: "https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800",
      title: "Ready-made Investments",
      description: "A straight-forward way to invest.",
      hasImage: true
    },
    {
      image: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=800",
      title: "Smart Investor",
      description: "To choose and manage your own investments from a range of funds, shares, ETFs and bonds, get started today by simply opening up an Investment (Stocks & Shares) ISA, Investment Account or SIPP Account with Smart Investor.",
      hasImage: true
    }
  ];

  return (
    <div className="bg-[#062832] py-20 border-t-2 border-[#0a7f8f]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Ways to invest
        </h2>
        <p className="text-gray-300 text-center mb-16 text-lg">
          Always remember that investments can fall in value. You may get back less than you invest.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {investmentOptions.map((option, index) => (
            <div key={index} className="bg-[#083d47] overflow-hidden border-l-4 border-[#0a7f8f]">
              {option.hasImage && (
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={option.image}
                    alt={option.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  {option.title}
                </h3>
                <p className="text-gray-300 text-base leading-relaxed">
                  {option.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
