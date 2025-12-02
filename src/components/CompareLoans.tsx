import { ChevronRight } from 'lucide-react';
import ContactSection from './ContactSection';

export default function CompareLoans() {
  const loanOptions = [
    {
      icon: '/car.svg',
      title: 'Need a new car?',
      description: 'Having the money in your pocket could help you get a better deal.',
      linkText: 'Get a car loan',
      linkHref: '#'
    },
    {
      icon: '/briefcase.svg',
      title: 'How to consolidate your debt',
      description: 'Consolidating could help you take control of your money – you\'ll have all your debts in one place, with one fixed monthly payment.',
      linkText: 'Consolidate your debt',
      linkHref: '#'
    },
    {
      icon: '/chair.svg',
      title: 'Home improvement loan',
      description: 'Get more from your home – whether it\'s a brand new bathroom or sprucing up your lounge.',
      linkText: 'Improve your home',
      linkHref: '#'
    },
    {
      icon: '/luggage.svg',
      title: 'Holiday loans',
      description: 'A holiday loan is when you take out a personal loan to cover the cost of your next break, so you don\'t have to worry about paying for your trip all at once.',
      linkText: 'Pay for your holiday',
      linkHref: '#'
    },
    {
      icon: '/weeding.svg',
      title: 'Wedding loans',
      description: 'A wedding loan means you can pay your wedding costs in one go, giving you peace of mind that everything\'s covered for your special day. Then you\'ll pay us back monthly, over a set period of time.',
      linkText: 'Pay for your perfect day',
      linkHref: '#'
    },
    {
      icon: '/energy.svg',
      title: 'Making energy-efficiency improvements to your home?',
      description: 'Take out a personal loan for energy-efficiency home improvements and you could get up to £250 cashback. ',
      additionalInfo: '6.2% APR Representative on loans of £7,500 – £15,000 over 2-5 years, (your rate may differ*)',
      linkText: 'Greener Home Loan',
      linkHref: '#',
      hasTerms: true
    }
  ];

  return (
    <div>
      <div className="w-full bg-[#083d47] overflow-hidden border-l-4 border-[#14bfd8]">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr]">
              <div className="p-12 md:p-16 flex flex-col justify-center">
                <p className="text-[#14bfd8] text-sm font-semibold tracking-wider mb-4 border-l-2 border-[#14bfd8] pl-3">
                  LOANS
                </p>

                <h2 className="text-white text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Compare our loans
                </h2>

                <h3 className="text-white text-xl md:text-2xl font-semibold mb-6 leading-normal">
                  Focus on the future with a personal loan
                </h3>

                <p className="text-white text-base leading-relaxed">
                  Get your loan rate before you apply, without it affecting your credit score. Subject to application, financial circumstances and borrowing history.
                </p>
              </div>

              <div className="relative h-[350px] md:h-[450px] lg:h-[550px]">
                <img
                  src="https://www.advisoryexcellence.com/wp-content/uploads/2022/02/CASH-LOAN-PHOTO.jpg"
                  alt="Couple planning loan and financial future together"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
        </div>
      </div>

      <div className="bg-[#062832] py-16 px-6 border-t-2 border-[#0a7f8f]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-white text-5xl font-bold mb-6 leading-tight">Borrowing to suit you</h2>
            <p className="text-white text-lg max-w-4xl mx-auto leading-relaxed">
              Whether you'd like a loan to consolidate debts or buy something special, we've got lending options to suit you. Subject to application, financial circumstances and borrowing history.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {loanOptions.map((option, index) => (
              <div
                key={index}
                className="bg-[#083d47] p-8 hover:bg-[#0a5f6d] transition-colors border-l-2 border-[#0a7f8f]"
              >
                <div className="mb-6">
                  <img src={option.icon} alt={option.title} className="w-16 h-16" />
                </div>

                <h3 className="text-white text-2xl font-bold mb-4">{option.title}</h3>

                <p className="text-gray-300 text-base mb-4 leading-relaxed">
                  {option.description}
                  {option.hasTerms && (
                    <span className="text-[#14bfd8]"> Terms and conditions apply.</span>
                  )}
                </p>

                {option.additionalInfo && (
                  <p className="text-white text-sm mb-4 font-semibold">
                    {option.additionalInfo}
                  </p>
                )}

                <a
                  href={option.linkHref}
                  className="inline-flex items-center text-[#14bfd8] hover:text-white transition-colors text-base font-medium"
                >
                  {option.linkText}
                  <ChevronRight className="ml-1 w-5 h-5" />
                </a>
              </div>
            ))}
          </div>

          <div className="text-center space-y-4">
            <p className="text-gray-300 text-sm">
              All loans are subject to your financial circumstances and borrowing history at the time you apply.
            </p>
            <p className="text-gray-300 text-sm">
              *The rate you're offered may differ from the Representative APR shown and will be based on your personal circumstances, the loan amount and the repayment term.
            </p>
          </div>
        </div>
      </div>

      <ContactSection />
    </div>
  );
}
