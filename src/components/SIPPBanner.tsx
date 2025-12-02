export default function SIPPBanner() {
  return (
    <div className="w-full bg-[#083d47] overflow-hidden border-l-4 border-[#14bfd8]">
      <div className="w-full">
        <div className="grid md:grid-cols-[1fr_1.3fr] gap-0">
            <div className="p-12 md:p-16 flex flex-col justify-center">
              <div className="text-[#14bfd8] text-xs font-semibold mb-4 tracking-wider border-l-2 border-[#14bfd8] pl-3">
                SELF-INVESTED PERSONAL PENSION (SIPP)
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Self-Invested Personal Pension (SIPP)
              </h1>
              <p className="text-lg md:text-xl text-white font-medium mb-8 leading-relaxed">
                What is a SIPP?
              </p>
              <p className="text-white text-base leading-relaxed">
              SIPPs (Self-Invested Personal Pension) offer tax advantages and investment options to help your money grow for your retirement. Tax rules can change and their effects on you will depend on your individual circumstances.
              </p>
            </div>

            <div className="relative h-[350px] md:h-[450px] lg:h-[550px]">
              <img
                src="https://xactaccountants.co.uk/wp-content/uploads/2025/08/Self-Invested-Personal-Pension-SIPP.webp"
                alt="Professional reviewing pension and retirement planning"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
      </div>
    </div>
  );
}
