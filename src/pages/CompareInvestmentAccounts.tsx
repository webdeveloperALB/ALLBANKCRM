import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SmartInvestorBanner from '../components/SmartInvestorBanner';
import CompareInvestmentAccountsSection from '../components/CompareInvestmentAccountsSection';

export default function CompareInvestmentAccounts() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <SmartInvestorBanner />

      <CompareInvestmentAccountsSection />

      <Footer />
    </div>
  );
}
