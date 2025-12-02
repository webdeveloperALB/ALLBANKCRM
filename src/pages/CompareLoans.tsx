import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CompareLoans from '../components/CompareLoans';

export default function CompareLoansPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <CompareLoans />
      <Footer />
    </div>
  );
}
