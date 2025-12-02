import { FileText, Smartphone, DollarSign, Shield } from 'lucide-react';

export default function WhyChooseInvestmentAccount() {
  return (
    <div className="py-20 bg-[#062832] border-t-2 border-[#0a7f8f]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Why choose our Investment Account?
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-[#083d47] w-16 h-16 flex items-center justify-center mx-auto mb-6 border-2 border-[#0a7f8f]">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Low fees</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              One low annual fee, flat rate share dealing and no charge for many of our services
            </p>
          </div>

          <div className="text-center">
            <div className="bg-[#083d47] w-16 h-16 flex items-center justify-center mx-auto mb-6 border-2 border-[#0a7f8f]">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Easy to manage</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Starting an Investment Account with Smart Investor is easy. You can place a trade and check your investments anytime within Online Banking or the app
            </p>
          </div>

          <div className="text-center">
            <div className="bg-[#083d47] w-16 h-16 flex items-center justify-center mx-auto mb-6 border-2 border-[#0a7f8f]">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Earn interest</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Earn interest on cash held in your Investment Account
            </p>
          </div>

          <div className="text-center">
            <div className="bg-[#083d47] w-16 h-16 flex items-center justify-center mx-auto mb-6 border-2 border-[#0a7f8f]">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-4">Secure</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              We are a FTSE 100 listed business with 48 million customers worldwide. We're the first bank to achieve BSI KITEMARK™ for Secure Digital Banking.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-[#0a7f8f] hover:bg-[#086670] text-white font-semibold px-8 py-3 transition-colors border border-[#14bfd8]">
            Log in to apply
          </button>
          <button className="bg-transparent hover:bg-[#083d47] text-white font-semibold px-8 py-3 border-2 border-white transition-colors">
            No login? Apply here
          </button>
        </div>
      </div>
    </div>
  );
}
