import { useState, useEffect } from 'react';

export default function HeroBanner() {
  const [currentImage, setCurrentImage] = useState(0);

  const images = [
    {
      url: 'https://images.pexels.com/photos/4968630/pexels-photo-4968630.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Professional using banking app on smartphone'
    },
    {
      url: 'https://images.pexels.com/photos/6772076/pexels-photo-6772076.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Digital payment and financial technology'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#083d47] overflow-hidden border-l-4 border-[#14bfd8]">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.3fr]">
            <div className="p-12 md:p-16 flex flex-col justify-center">
              <p className="text-[#14bfd8] text-sm font-semibold mb-6 tracking-wide uppercase border-l-2 border-[#14bfd8] pl-3">
                DIGITAL BANKING
              </p>
              <h1
                className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                Empowering Your<br />Financial Freedom
              </h1>
              <p className="text-white/90 text-base md:text-lg mb-10 leading-relaxed">
                Manage crypto and traditional currencies with ease. Open your account with
                Lithuanian Crypto Central Bank and experience secure, fast, and borderless
                transactions powered by advanced blockchain technology.
              </p>
              <button className="bg-[#0a7f8f] text-white px-8 md:px-10 py-3 md:py-4 font-semibold text-base hover:bg-[#086670] transition-colors border-2 border-[#0a7f8f] hover:border-[#14bfd8]">
                Open an Account
              </button>
            </div>

            <div className="relative h-[350px] md:h-[450px] lg:h-[550px]">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.alt}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 border-t-4 border-[#0a7f8f] ${
                    index === currentImage ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`w-2 h-2 transition-all ${
                      index === currentImage ? 'bg-[#14bfd8] w-8' : 'bg-white/50'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}
