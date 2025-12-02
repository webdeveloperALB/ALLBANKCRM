import { Star, Briefcase, TrendingUp, Monitor } from 'lucide-react';

export default function InvestmentAccountTestimonial() {
  return (
    <div className="bg-[#062832]">
      <div className="bg-[#0a7f8f] py-12 border-t-2 border-[#14bfd8]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            ))}
          </div>

          <div className="mb-6">
            <img
              src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
              alt="Customer testimonial"
              className="w-20 h-20 mx-auto mb-4 object-cover border-4 border-[#14bfd8] rounded-full"
            />
          </div>

          <blockquote className="text-white text-xl md:text-2xl font-light italic mb-6 leading-relaxed">
            "I opened a general investment account because I'd already used my ISA allowance. It was so easy to do via the app."
          </blockquote>

          <p className="text-white/90 text-sm">— Martin, 55, Surrey</p>
        </div>
      </div>

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            How to open an Investment Account
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#083d47] p-8 border-l-2 border-[#0a7f8f]">
              <div className="bg-[#0a5f6d] w-16 h-16 flex items-center justify-center mb-6 border-2 border-[#0a7f8f]">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">1. Choose your account</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                The Investment Account has no upper limit and no restrictions on withdrawals. This account is popular with investors who have used their ISA allowance.
              </p>
            </div>

            <div className="bg-[#083d47] p-8 border-l-2 border-[#0a7f8f]">
              <div className="bg-[#0a5f6d] w-16 h-16 flex items-center justify-center mb-6 border-2 border-[#0a7f8f]">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">2. Decide how much to invest</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Get started with just £50 and set up a monthly Direct Debit. There's no charge to add to your account or make withdrawals from an Investment Account.
              </p>
            </div>

            <div className="bg-[#083d47] p-8 border-l-2 border-[#0a7f8f]">
              <div className="bg-[#0a5f6d] w-16 h-16 flex items-center justify-center mb-6 border-2 border-[#0a7f8f]">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">3. Pick your investments</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                It's easy to choose from over 8,000 investment options or let the experts give you a hand with our Ready-made Investment options.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
