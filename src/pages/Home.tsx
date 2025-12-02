import Navbar from '../components/Navbar';
import HeroBanner from '../components/HeroBanner';
import ServicesSection from '../components/ServicesSection';
import MortgageSupport from '../components/MortgageSupport';
import FirstHomeBanner from '../components/FirstHomeBanner';
import JoinBanner from '../components/JoinBanner';
import FeedbackFooter from '../components/FeedbackFooter';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <HeroBanner />
      <ServicesSection />
      <MortgageSupport />
      <FirstHomeBanner />
      <JoinBanner />
      <FeedbackFooter />
      <Footer />
    </div>
  );
}
