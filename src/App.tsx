import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BankAccount from './pages/BankAccount';
import CompareLoans from './pages/CompareLoans';
import CompareCreditCards from './pages/CompareCreditCards';
import CreditCardTerms from './pages/CreditCardTerms';
import CompareInvestmentAccounts from './pages/CompareInvestmentAccounts';
import GeneralInvestmentAccount from './pages/GeneralInvestmentAccount';
import SIPP from './pages/SIPP';
import NewToInvesting from './pages/NewToInvesting';
import InvestmentTypesExplained from './pages/InvestmentTypesExplained';
import HelpAndSupport from './pages/HelpAndSupport';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bank-account" element={<BankAccount />} />
        <Route path="/compare-loans" element={<CompareLoans />} />
        <Route path="/compare-credit-cards" element={<CompareCreditCards />} />
        <Route path="/credit-card-terms" element={<CreditCardTerms />} />
        <Route path="/compare-investment-accounts" element={<CompareInvestmentAccounts />} />
        <Route path="/general-investment-account" element={<GeneralInvestmentAccount />} />
        <Route path="/sipp" element={<SIPP />} />
        <Route path="/new-to-investing" element={<NewToInvesting />} />
        <Route path="/investment-types-explained" element={<InvestmentTypesExplained />} />
        <Route path="/help-support" element={<HelpAndSupport />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </Router>
  );
}

export default App;
