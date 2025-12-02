export default function WhatToConsider() {
  const considerations = [
    {
      image: "https://images.pexels.com/photos/6863515/pexels-photo-6863515.jpeg?auto=compress&cs=tinysrgb&w=1200",
      title: "Before you start",
      description: "Tempting as it may be to plunge straight into investing, you may need to address other aspects of your personal finances first. In this section, you'll learn more about some of the things you should take into consideration before putting your money to work."
    },
    {
      image: "https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=1200",
      title: "Your first steps",
      description: "Once you're confident your finances are in order, you need to start planning your investments. Get started by setting financial goals. Are you investing for growth? Or income? We'll help you answer these questions and more in this section."
    },
    {
      image: "https://images.pexels.com/photos/6120214/pexels-photo-6120214.jpeg?auto=compress&cs=tinysrgb&w=1200",
      title: "Reducing unnecessary risk",
      description: "You need to decide how much risk you're willing to take when you invest. This will largely depend on your financial goals, how prepared you are to accept losses, and how soon you need your money. In this section, we'll help you understand how to manage risk when investing."
    },
    {
      image: "https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1200",
      title: "Staying invested",
      description: "You must learn the art of patience if you want to give your investments the best chance of earning returns. By committing to long-term investments, you give your money the greatest chance to grow. In this section, we take a look at some slightly more advanced strategies to help you stay invested and manage your portfolio's performance."
    }
  ];

  return (
    <div className="bg-[#062832] py-20 border-t-2 border-[#0a7f8f]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          What to consider
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {considerations.map((item, index) => (
            <div key={index} className="bg-[#083d47] overflow-hidden hover:bg-[#0a5f6d] transition-colors border-l-2 border-[#0a7f8f]">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">
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
