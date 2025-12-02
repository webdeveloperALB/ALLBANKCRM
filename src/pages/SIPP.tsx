import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SIPPBanner from '../components/SIPPBanner';
import SIPPTestimonial from '../components/SIPPTestimonial';
import SIPPAccordion from '../components/SIPPAccordion';

export default function SIPP() {
  return (
    <div className="min-h-screen bg-[#0f1424]">
      <Navbar />
      <SIPPBanner />
      <SIPPTestimonial />
      <SIPPAccordion />
      <Footer />
    </div>
  );
}
