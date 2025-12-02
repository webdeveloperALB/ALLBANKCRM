import { Star } from 'lucide-react';

export default function SIPPTestimonial() {
  return (
    <div className="bg-[#0a7f8f] py-16 border-t-2 border-[#14bfd8]">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400" />
          ))}
        </div>

        <blockquote className="text-white text-2xl italic leading-relaxed mb-6 max-w-4xl mx-auto">
          "I'm happier saving and investing with Lithuanian Crypto Central Bank because it's a bank I know and trust — trust and confidence is very important, particularly when it comes to my money and investing."
        </blockquote>

        <p className="text-white text-sm">
          - Graham, 60, Oxfordshire
        </p>
      </div>
    </div>
  );
}
