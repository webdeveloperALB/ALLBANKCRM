import Navbar from '../components/Navbar';
import CompareCreditCards from '../components/CompareCreditCards';
import BankAccountBenefits from '../components/BankAccountBenefits';
import Footer from '../components/Footer';

export default function CompareCreditCardsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CompareCreditCards />
      <BankAccountBenefits />
      <Footer />
    </div>
  );
}
