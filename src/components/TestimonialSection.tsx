import { Star } from 'lucide-react';

export default function TestimonialSection() {
  return (
    <div className="py-16 bg-[#0a7f8f] border-t-2 border-[#14bfd8]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-8">
            <img
              src="https://www.barclays.co.uk/smart-investor/accounts/investment-account/_jcr_content/root/body/content/micro_theme_19044431_1526543210/microtheme/section_copy/section_item/sectionItem/grid_copy_copy_copy_/grid_item/gridItem/section_item/sectionItem/tile/multimedia.coreimg.80.1440.png/1749569984946/pavenpreet-profile-150x150.png"
              alt="Customer testimonial"
              className="w-24 h-24 md:w-32 md:h-32 object-cover border-4 border-[#14bfd8] rounded-full"
            />
          </div>

          <div className="flex gap-1 mb-8">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400 opacity-50" />
          </div>

          <blockquote className="text-white text-2xl italic mb-8 leading-relaxed max-w-3xl">
            "Opening my Investment Account was very straightforward. I've invested in some funds and shares – it's so easy to do on my phone that I don't feel I need to put a lot of time aside for it."
          </blockquote>

          <p className="text-white/90 text-base">
            – Pavenpreet, 33, Worcestershire
          </p>
        </div>
      </div>
    </div>
  );
}
