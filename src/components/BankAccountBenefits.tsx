import { CheckCircle } from 'lucide-react';

export default function BankAccountBenefits() {
  const benefits = [
    {
      title: 'A safe and easy way to log in',
      description: 'Use facial recognition, your fingerprint or a passcode, depending on which one your device supports.',
    },
    {
      title: 'Manage all your accounts',
      description: 'If you have a current account with us, you can manage it alongside your bank account.',
    },
    {
      title: 'Shop online safely',
      description: 'You can authorise payments for online purchases in a few steps.',
    },
  ];

  return (
    <div className="bg-white py-16 px-6 border-t-2 border-[#0a7f8f]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="aspect-[4/3] overflow-hidden">
            <img
              src="https://ltccbank.com/img/building.jpg"
              alt="Woman using mobile banking app securely"
              className="w-full h-full object-cover shadow-lg"
            />
          </div>

          <div>
            <h2 className="text-4xl font-bold text-[#0a7f8f] mb-6 leading-tight">
              More value with Lithuanian Crypto Central Bank
            </h2>

            <p className="text-gray-700 text-lg mb-8 leading-relaxed">
              If you already have a Lithuanian Crypto Central Bank account, you can use online banking to manage your bank account, or access it through our mobile banking platform to enjoy these benefits.
            </p>

            <div className="space-y-6 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-[#0a7f8f]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-700 text-base leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="bg-[#0a7f8f] hover:bg-[#086670] text-white py-3 px-8 text-base font-semibold transition-colors border border-[#14bfd8]">
              Learn more
            </button>

            <p className="text-xs text-gray-600 mt-8 leading-relaxed">
              You must have a Lithuanian Crypto Central Bank account, have a mobile number and be aged 18 or over to use online banking. Terms and conditions apply.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
