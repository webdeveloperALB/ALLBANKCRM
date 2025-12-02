import { Phone, Search, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [isAccountsDropdownOpen, setIsAccountsDropdownOpen] = useState(false);
  const [isLoansDropdownOpen, setIsLoansDropdownOpen] = useState(false);
  const [isCreditCardsDropdownOpen, setIsCreditCardsDropdownOpen] = useState(false);
  const [isInvestmentsDropdownOpen, setIsInvestmentsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const dropdownTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const closeAllDropdowns = () => {
    setIsAccountsDropdownOpen(false);
    setIsLoansDropdownOpen(false);
    setIsCreditCardsDropdownOpen(false);
    setIsInvestmentsDropdownOpen(false);
    Object.keys(dropdownTimers.current).forEach(key => {
      clearTimeout(dropdownTimers.current[key]);
    });
  };

  const handleMouseEnter = (dropdown: string, setter: (value: boolean) => void) => {
    closeAllDropdowns();
    if (dropdownTimers.current[dropdown]) {
      clearTimeout(dropdownTimers.current[dropdown]);
    }
    setter(true);
  };

  const handleMouseLeave = (dropdown: string, setter: (value: boolean) => void) => {
    dropdownTimers.current[dropdown] = setTimeout(() => {
      setter(false);
    }, 300);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-[#062832] text-white border-b-2 border-[#0a7f8f]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-8">
            <Link to="/">
              <img
                src="/lcb.svg"
                alt="LCC Logo"
                className="h-20 w-auto mt-2 cursor-pointer"
              />
            </Link>

            <div className="flex gap-8">
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('accounts', setIsAccountsDropdownOpen)}
                onMouseLeave={() => handleMouseLeave('accounts', setIsAccountsDropdownOpen)}
              >
                <a href="#" className="text-base hover:text-[#14bfd8] transition-colors">Accounts</a>

                {isAccountsDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-8 z-50"
                    onMouseEnter={() => handleMouseEnter('accounts', setIsAccountsDropdownOpen)}
                    onMouseLeave={() => handleMouseLeave('accounts', setIsAccountsDropdownOpen)}
                  >
                    <div className="bg-[#062832] border-2 border-[#0a7f8f] shadow-lg min-w-[300px]">
                      <div className="p-6">
                        <h3 className="text-sm font-semibold text-[#14bfd8] mb-3 pb-2 border-b border-[#0a7f8f]/30">Accounts</h3>
                        <div className="space-y-2">
                          <Link to="/bank-account" className="block text-base text-white hover:text-[#14bfd8] transition-colors">Lithuanian Crypto Central Bank Bank Account</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('loans', setIsLoansDropdownOpen)}
                onMouseLeave={() => handleMouseLeave('loans', setIsLoansDropdownOpen)}
              >
                <a href="#" className="text-base hover:text-[#14bfd8] transition-colors">Loans</a>

                {isLoansDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-8 z-50"
                    onMouseEnter={() => handleMouseEnter('loans', setIsLoansDropdownOpen)}
                    onMouseLeave={() => handleMouseLeave('loans', setIsLoansDropdownOpen)}
                  >
                    <div className="bg-[#062832] border-2 border-[#0a7f8f] shadow-lg min-w-[300px]">
                      <div className="p-6">
                        <h3 className="text-sm font-semibold text-[#14bfd8] mb-3 pb-2 border-b border-[#0a7f8f]/30">Loans</h3>
                        <div className="space-y-2">
                          <Link to="/compare-loans" className="block text-base text-white hover:text-[#14bfd8] transition-colors">Compare loans</Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('creditcards', setIsCreditCardsDropdownOpen)}
                onMouseLeave={() => handleMouseLeave('creditcards', setIsCreditCardsDropdownOpen)}
              >
                <a href="#" className="text-base hover:text-[#14bfd8] transition-colors">Credit cards</a>

                {isCreditCardsDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-8 z-50"
                    onMouseEnter={() => handleMouseEnter('creditcards', setIsCreditCardsDropdownOpen)}
                    onMouseLeave={() => handleMouseLeave('creditcards', setIsCreditCardsDropdownOpen)}
                  >
                    <div className="bg-[#062832] border-2 border-[#0a7f8f] shadow-lg min-w-[400px]">
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-semibold text-[#14bfd8] mb-3 pb-2 border-b border-[#0a7f8f]/30">Credit cards</h3>
                            <div className="space-y-2">
                              <Link to="/compare-credit-cards" className="block text-base text-white hover:text-[#14bfd8] transition-colors">Compare credit cards</Link>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-[#14bfd8] mb-3 pb-2 border-b border-[#0a7f8f]/30">Help</h3>
                            <div className="space-y-2">
                              <Link to="/credit-card-terms" className="block text-base text-white hover:text-[#14bfd8] transition-colors">Credit card terms explained</Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('investments', setIsInvestmentsDropdownOpen)}
                onMouseLeave={() => handleMouseLeave('investments', setIsInvestmentsDropdownOpen)}
              >
                <a href="#" className="text-base hover:text-[#14bfd8] transition-colors">Investments</a>

                {isInvestmentsDropdownOpen && (
                  <div
                    className="absolute top-full left-0 mt-8 z-50"
                    onMouseEnter={() => handleMouseEnter('investments', setIsInvestmentsDropdownOpen)}
                    onMouseLeave={() => handleMouseLeave('investments', setIsInvestmentsDropdownOpen)}
                  >
                    <div className="bg-[#062832] border-2 border-[#0a7f8f] shadow-lg min-w-[500px]">
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-semibold text-[#14bfd8] mb-3 pb-2 border-b border-[#0a7f8f]/30">Investment accounts</h3>
                            <div className="space-y-2">
                              <Link to="/compare-investment-accounts" className="block text-base text-white hover:text-[#14bfd8] transition-colors">Compare investment accounts</Link>
                              <Link to="/general-investment-account" className="block text-base text-white hover:text-[#14bfd8] transition-colors">General Investment Account</Link>
                              <Link to="/sipp" className="block text-base text-white hover:text-[#14bfd8] transition-colors">Self-Invested Personal Pension (SIPP)</Link>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-[#14bfd8] mb-3 pb-2 border-b border-[#0a7f8f]/30">Help</h3>
                            <div className="space-y-2">
                              <Link to="/new-to-investing" className="block text-base text-white hover:text-[#14bfd8] transition-colors">New to investing</Link>
                              <Link to="/investment-types-explained" className="block text-base text-white hover:text-[#14bfd8] transition-colors">Investment types explained</Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Link to="/help-support" className="text-base hover:text-[#14bfd8] transition-colors">
                Help and support
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 hover:text-[#14bfd8] transition-colors">
              <Phone className="w-5 h-5" />
              <span className="text-base">Contact us</span>
            </button>

            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex items-center gap-2 hover:text-[#14bfd8] transition-colors"
            >
              <Search className="w-5 h-5" />
              <span className="text-base">Search</span>
            </button>

            <button className="px-6 py-2 bg-[#0a7f8f] hover:bg-[#086670] text-base font-semibold transition-colors border border-[#14bfd8]">
              Log in
            </button>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white shadow-2xl w-full max-w-2xl mx-4 animate-slide-down">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Search</h3>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for accounts, loans, credit cards, investments..."
                    className="w-full px-4 py-3 pr-12 border-2 border-gray-300 focus:border-[#0a7f8f] focus:outline-none text-gray-900"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-[#0a7f8f] text-white hover:bg-[#096a78] transition-colors"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </form>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {['Bank Account', 'Credit Cards', 'Loans', 'SIPP', 'Investments', 'Help'].map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        setSearchQuery(term);
                        navigate(`/search?q=${encodeURIComponent(term)}`);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
