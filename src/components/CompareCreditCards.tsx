export default function CompareCreditCards() {
  const cardTypes = [
    {
      title: 'Rewards credit cards',
      description: 'Get rewarded for your everyday spending. Collect rewards to use on travel, shopping, entertainment, or cashback with our rewards card.',
      apr: '80.1% APR Representative (variable)',
      disclaimer: 'Subject to application, financial circumstances and borrowing history. T&Cs apply.',
      buttonText: 'Rewards credit cards',
    },
    {
      title: 'Purchase offer credit cards',
      description: 'Our purchase cards let you make purchases without paying any interest on the balance for a certain period. This means you can buy today, and spread the cost over time.',
      apr: '28.9% APR Representative (variable)',
      disclaimer: 'Subject to application, financial circumstances and borrowing history. T&Cs apply.',
      buttonText: 'Purchase offer cards',
    },
    {
      title: 'Credit building credit cards',
      description: 'If you\'re looking to improve your credit score or start building one from scratch, our cards could help.',
      apr: '33.9% APR Representative (variable)',
      disclaimer: 'Subject to application, financial circumstances and borrowing history. T&Cs apply.',
      buttonText: 'Credit building cards',
    },
    {
      title: 'Balance transfer credit cards',
      description: 'If you\'re paying interest on credit or store cards, you could consolidate what you owe with one of our balance transfer cards.',
      apr: '',
      disclaimer: '',
      buttonText: 'Balance transfer cards',
    },
  ];

  return (
    <div>
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[550px] overflow-hidden">
        <img
          src="https://wallpapercave.com/wp/wp6871290.jpg"
          alt="Professional managing credit card and finances"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="bg-white max-w-xl p-8 border-l-4 border-[#0a7f8f]">
              <h2 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Credit cards
              </h2>
              <p className="text-xl text-[#0a7f8f] leading-relaxed">
                Choice is the key to finding the right credit card
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#f8fafb] py-16 px-6 border-t-2 border-[#0a7f8f]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cardTypes.map((card, index) => (
              <div key={index} className="bg-white p-8 hover:bg-[#f8fafb] transition-colors flex flex-col h-full border-l-2 border-[#0a7f8f]">
                <h3 className="text-2xl font-bold text-[#0a7f8f] mb-4">
                  {card.title}
                </h3>

                <p className="text-gray-700 text-base leading-relaxed mb-6 flex-grow">
                  {card.description}
                </p>

                {card.apr && (
                  <div className="mb-6">
                    <p className="text-gray-900 font-semibold text-base mb-2">
                      {card.apr}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {card.disclaimer}
                    </p>
                  </div>
                )}

                <button className="w-full mt-auto bg-[#0a7f8f] hover:bg-[#086670] text-white py-3 px-8 text-base font-semibold transition-colors border border-[#14bfd8]">
                  {card.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
