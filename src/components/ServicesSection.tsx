import { Euro, CreditCard, FileText, TrendingUp, HelpCircle } from 'lucide-react';

export default function ServicesSection() {
  const services = [
    {
      icon: Euro,
      title: 'Bank Account',
      description: 'Lithuanian Crypto Central Bank Bank Account with flexible, rewarding banking.',
      buttonText: 'View bank account',
      link: '/bank-account'
    },
    {
      icon: FileText,
      title: 'Loans',
      description: 'Compare loans and find the best option for your needs.',
      buttonText: 'Compare loans',
      link: '/compare-loans'
    },
    {
      icon: CreditCard,
      title: 'Credit cards',
      description: 'Compare credit cards and understand the terms.',
      buttonText: 'Compare credit cards',
      link: '/compare-credit-cards'
    },
    {
      icon: TrendingUp,
      title: 'Investment accounts',
      description: 'Compare investment accounts, GIA, and SIPP options.',
      buttonText: 'View investments',
      link: '/compare-investment-accounts'
    },
    {
      icon: TrendingUp,
      title: 'General Investment Account',
      description: 'Flexible investing with easy access to your money.',
      buttonText: 'Learn more',
      link: '/general-investment-account'
    },
    {
      icon: TrendingUp,
      title: 'SIPP',
      description: 'Self-Invested Personal Pension for your retirement planning.',
      buttonText: 'Learn more',
      link: '/sipp'
    },
    {
      icon: HelpCircle,
      title: 'New to investing',
      description: 'Get started with investing and learn the basics.',
      buttonText: 'Get started',
      link: '/new-to-investing'
    },
    {
      icon: HelpCircle,
      title: 'Investment types explained',
      description: 'Understand different types of investments available.',
      buttonText: 'Learn more',
      link: '/investment-types-explained'
    },
    {
      icon: HelpCircle,
      title: 'Help and support',
      description: 'Get the help you need with our comprehensive support resources.',
      buttonText: 'Get help',
      link: '/help-support'
    }
  ];

  return (
    <div className="bg-[#083d47] py-16 border-t-2 border-[#0a7f8f]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-white text-5xl font-bold mb-6">
            Explore all Lithuanian Crypto Central Bank has to offer
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            See how we can help you with bank accounts, loans, credit cards, investments, and more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <a
                key={index}
                href={service.link}
                className="bg-[#0a5f6d] p-8 hover:bg-[#0a7f8f] transition-colors border-l-2 border-[#14bfd8] block"
              >
                <Icon className="text-white w-10 h-10 mb-4" />
                <h3 className="text-white text-2xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-300 text-base mb-6 min-h-[4.5rem]">{service.description}</p>
                <button className="text-white font-semibold border border-[#14bfd8] px-6 py-2 hover:bg-[#0a7f8f] hover:border-white transition-colors">
                  {service.buttonText}
                </button>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
