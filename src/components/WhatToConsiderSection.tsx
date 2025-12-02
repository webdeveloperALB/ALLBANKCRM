export default function WhatToConsiderSection() {
  const considerations = [
    {
      image: "https://images.pexels.com/photos/6772076/pexels-photo-6772076.jpeg?auto=compress&cs=tinysrgb&w=400",
      title: "Most popular investments",
      description: "Here, you'll find a list of the most popular funds, shares, ETFs, and investment trusts as chosen by our investors, and the top fund picks depending on the type of account – whether an ISA, or SIPP. The details of our most popular funds are updated monthly."
    },
    {
      image: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=400",
      title: "Funds, ETFs and Investment Trusts",
      description: "If you're starting to build your portfolio, these often low-cost options can help make sure you're sufficiently diversified from the outset."
    },
    {
      image: "https://images.pexels.com/photos/8370752/pexels-photo-8370752.jpeg?auto=compress&cs=tinysrgb&w=400",
      title: "Shares",
      description: "Shares suit a wide variety of investment strategies, although they can carry higher risks than funds. Because of this, they're more suitable for experienced investors."
    },
    {
      image: "https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=400",
      title: "Cash and bonds",
      description: "Whether you view your money as nothing more than the means to an end or the ultimate security blanket, one thing's for sure, you need to look after it."
    }
  ];

  return (
    <div className="bg-[#083d47] py-20 border-t-2 border-[#0a7f8f]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          What to consider
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {considerations.map((item, index) => (
            <div key={index} className="bg-[#0a5f6d] overflow-hidden hover:bg-[#0a7f8f] transition-colors border-l-2 border-[#14bfd8]">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
