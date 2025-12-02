import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowUpLeft, MessageSquare, CreditCard, Shield, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function BankAccount() {
  const [isOverdraftInfoOpen, setIsOverdraftInfoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="w-full bg-[#083d47] overflow-hidden border-l-4 border-[#14bfd8]">
        <div className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] items-center">
              <div className="p-12 md:p-16 flex flex-col justify-center">
                <p className="text-white text-xs font-bold mb-4 tracking-widest uppercase border-l-2 border-[#14bfd8] pl-3">
                  CURRENT ACCOUNTS
                </p>
                <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                  Lithuanian Crypto Central Bank
                </h1>
                <p className="text-white text-lg md:text-xl mb-4 leading-relaxed font-semibold">
                  Flexible, rewarding banking
                </p>
                <p className="text-white text-base md:text-lg mb-2">
                  No monthly fee
                </p>
                <p className="text-white text-sm mb-10">
                  Eligibility, terms and conditions apply
                </p>
                <button className="bg-white text-[#083d47] px-8 md:px-10 py-3 md:py-4 font-bold text-base md:text-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-lg">
                  Apply for a bank account
                </button>
              </div>

              <div className="h-[350px] md:h-[450px] lg:h-[550px]">
                <img
                  src="https://ltccbank.com/img/building.jpg"
                  alt="Happy customer using digital banking services"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
        </div>
      </div>

      <div className="bg-[#062832] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-12 text-center">More Lithuanian Crypto Central Bank Account features</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <ArrowUpLeft className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Optional overdraft</h3>
              <p className="text-gray-300 leading-relaxed">
                Set up an arranged overdraft to suit your needs. Subject to application, financial circumstances and borrowing history.
              </p>
            </div>

            <div>
              <MessageSquare className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Instant spending notifications</h3>
              <p className="text-gray-300 leading-relaxed">
                See what you've spent at a glance.
              </p>
            </div>

            <div>
              <CreditCard className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Personalise your card</h3>
              <p className="text-gray-300 leading-relaxed">
                Bring your card to life with a photo to make you smile.
              </p>
            </div>

            <div>
              <Shield className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Insurance packs</h3>
              <p className="text-gray-300 leading-relaxed">
                Add travel insurance, RAC cover and gadget insurance to your account for an additional fee. You'll need to have an eligible current account with us. Terms, conditions and exclusions apply.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#062832] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-8 text-center">Please open and read the general information about overdrafts before you apply</h2>

          <div className="bg-[#083d47] overflow-hidden">
            <button
              onClick={() => setIsOverdraftInfoOpen(!isOverdraftInfoOpen)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-[#0a5f6d] transition-colors"
            >
              <span className="text-xl font-semibold">Useful information about overdrafts</span>
              <ChevronDown
                className={`w-6 h-6 transition-transform ${isOverdraftInfoOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isOverdraftInfoOpen && (
              <div className="p-6 pt-0 space-y-8 text-gray-200">
                <div>
                  <h3 className="text-2xl font-bold mb-3">What is an overdraft?</h3>
                  <p className="mb-4">An overdraft is a short-term way to borrow money through your current account.</p>
                  <p className="mb-4">There are two types of overdraft – arranged and unarranged. We explain what these mean below.</p>
                  <ul className="space-y-4 list-disc pl-6">
                    <li>
                      <strong>An arranged overdraft</strong> is an overdraft limit we agree with you. It lets you borrow money through your current account up to your arranged overdraft limit. It can be a safety net to cover unexpected short-term outgoings, like an unexpected bill. Interest is calculated for each day you're overdrawn, on the amount you've used up to your overdraft limit. If any part of your overdraft is interest-free, we won't charge interest on that part of your overdraft balance.
                    </li>
                    <li>
                      <strong>An unarranged overdraft</strong> is when you haven't agreed an arranged overdraft limit with us, but you spend more money than you have in your current account, or you go over your arranged overdraft limit. We won't charge any interest on any amounts that take you into an unarranged overdraft.
                    </li>
                  </ul>
                  <p className="mt-4">If you're relying on your overdraft a lot, get in touch with us and we can see if there are more appropriate borrowing options for you.</p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-3">What happens if I go over my arranged overdraft limit?</h3>
                  <p className="mb-4">You should make sure you have enough money in your current account to make payments without going over your arranged overdraft limit. If you want to make a payment that would take you over your arranged overdraft limit, we can refuse to make the payment.</p>
                  <p className="mb-4">Very rarely, we might not be able to refuse to make a payment (for example, because the payment has been made offline on a flight). If this happens, you might go over your arranged overdraft limit.</p>
                  <p className="mb-4">We won't charge any interest on any amounts that are over your limit. Going over your arranged overdraft limit might negatively affect your credit score. This may make it harder to get credit in the future.</p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-3">Does having an overdraft affect my credit score?</h3>
                  <p>We may send information about your account to credit reference agencies. As with any debt or borrowing, this may affect your credit score.</p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-3">Can I change my arranged overdraft limit?</h3>
                  <p className="mb-4">You can tell us to reduce the overdraft limit to a lower amount that's at or above the amount of your existing overdraft balance. If you tell us you want to remove your arranged overdraft limit, you'll need to pay us everything you owe us. You can tell us you want to reduce or remove your arranged overdraft limit on our app, online, by visiting a branch or by calling us. To maintain a quality service, we may monitor and record calls.</p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold mb-3">What alerts will you send me?</h3>
                  <p className="mb-4">If we hold a valid mobile number for you, we'll automatically register you for relevant alerts about your overdraft and any payments we've refused to make. This is to help you avoid paying extra interest and other charges. You can also choose to receive other alerts to help you manage your finances. These include alerts if your current account balance is low, or if a large payment has gone through. You can choose which alerts you receive online, on our app, by phone or in branch.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#062832] py-16">
        <div className="max-w-6xl mx-auto px-6">

          <div className="bg-[#083d47] text-white p-8">
            <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
            <p className="text-lg mb-6">
              Open your Lithuanian Crypto Central Bank account today in just a few simple steps.
            </p>
            <button className="bg-[#0a7f8f] text-white px-10 py-4 font-bold text-lg hover:bg-[#0096ad] transition-all hover:scale-105 shadow-lg">
              Apply now
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
