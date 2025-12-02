export default function SmartInvestorBanner() {
  return (
    <div className="w-full">
      <div className="w-full bg-[#083d47] overflow-hidden border-l-4 border-[#14bfd8]">
        <div className="grid md:grid-cols-[1fr_1.3fr] gap-0 items-stretch">
              <div className="p-12 md:p-16 flex flex-col justify-center">
                <p className="text-white text-xs font-bold mb-3 uppercase tracking-wider border-l-2 border-[#14bfd8] pl-3">
                  INVESTMENTS
                </p>
                <h1 className="text-white text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  Smart Investor
                </h1>
                <p className="text-white text-lg md:text-xl font-semibold mb-4 leading-tight">
                  Find a Ready-made Investment that works for you
                </p>
                <p className="text-white text-sm md:text-base mb-6 leading-relaxed">
                  Discover simple investing with Ready-made Investments. Choose from our five funds and leave the rest to us. From low to higher risk, you can select what's best for you. Capital at risk.
                </p>
                <div>
                  <button className="bg-[#0a7f8f] text-white px-6 py-3 text-sm md:text-base font-semibold hover:bg-[#086670] transition-colors border border-[#14bfd8]">
                    Choose your fund
                  </button>
                </div>
              </div>

              <div className="relative h-[350px] md:h-[450px] lg:h-[550px]">
                <img
                  src="https://daulat.co.in/wp-content/uploads/2023/10/b1-1.jpeg"
                  alt="Couple reviewing investment portfolio together"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            </div>
      </div>

      <div className="w-full bg-[#062832] px-6 py-6 text-center border-t-2 border-[#0a7f8f]">
        <p className="text-white text-xs leading-relaxed">
          The value of investments can fall as well as rise so you may get back less than you invest. Tax rules can change and their effects vary depending on your individual circumstances. Please check the costs involved before transferring.
        </p>
      </div>
    </div>
  );
}
