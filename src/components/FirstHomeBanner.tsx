export default function FirstHomeBanner() {
  return (
    <div className="w-full bg-[#0a5f6d] border-t-2 border-[#0a7f8f]">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] items-center">
          {/* Image Section */}
          <div className="w-full h-[350px] md:h-[450px] lg:h-[550px] overflow-hidden">
            <img
              src="https://www.windowworld.com/uploads/images/news/Family-showing-the-keys-to-their-new-home_window-world_hero-1920x1280.jpg"
              alt="Couple celebrating their first home purchase"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="px-12 py-16 lg:py-20">
            <h2 className="text-white text-5xl font-bold mb-6 leading-tight">
              Ready for your first home?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl leading-relaxed">
              Whether you're saving for a deposit or have found your next home, we can help you start your journey today.
            </p>
            <button className="text-white font-semibold border border-[#14bfd8] px-8 py-3 text-base hover:bg-[#0a7f8f] transition-colors">
              Buying your first home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
