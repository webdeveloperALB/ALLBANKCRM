export default function Footer() {
  return (
    <footer className="bg-[#062832] text-white pt-16 pb-8 border-t-2 border-[#0a7f8f]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 mb-12">
          <div>
            <h3 className="text-base font-bold mb-4 text-[#14bfd8]">Accounts</h3>
            <ul className="space-y-2.5 mb-12">
              <li>
                <a href="/bank-account" className="text-sm hover:text-[#14bfd8] transition-colors">
                  Lithuanian Crypto Central Bank Bank Account
                </a>
              </li>
            </ul>
            <img
              src="/lcb.svg"
              alt="Lithuanian Crypto Central Bank"
              className="h-28 w-auto"
            />
          </div>

          <div>
            <h3 className="text-base font-bold mb-4 text-[#14bfd8]">Loans</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="/compare-loans" className="text-sm hover:text-[#14bfd8] transition-colors">
                  Compare loans
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold mb-4 text-[#14bfd8]">Credit cards</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="/compare-credit-cards" className="text-sm hover:text-[#14bfd8] transition-colors">
                  Compare credit cards
                </a>
              </li>
            </ul>
            <h3 className="text-base font-bold mb-4 mt-6 text-white/80">Help</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="/credit-card-terms" className="text-sm hover:text-[#14bfd8] transition-colors">
                  Credit card terms explained
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold mb-4 text-[#14bfd8]">Investment accounts</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="/compare-investment-accounts" className="text-sm hover:text-[#14bfd8] transition-colors">
                  Compare investment accounts
                </a>
              </li>
              <li>
                <a href="/general-investment-account" className="text-sm hover:text-[#14bfd8] transition-colors">
                  General Investment Account
                </a>
              </li>
              <li>
                <a href="/sipp" className="text-sm hover:text-[#14bfd8] transition-colors">
                  Self-Invested Personal Pension (SIPP)
                </a>
              </li>
            </ul>
            <h3 className="text-base font-bold mb-4 mt-6 text-white/80">Help</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="/new-to-investing" className="text-sm hover:text-[#14bfd8] transition-colors">
                  New to investing
                </a>
              </li>
              <li>
                <a href="/investment-types-explained" className="text-sm hover:text-[#14bfd8] transition-colors">
                  Investment types explained
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-bold mb-4 text-[#14bfd8]">Help and support</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="/help-support" className="text-sm hover:text-[#14bfd8] transition-colors">
                  Help and support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8">
          <div className="text-gray-400 text-sm space-y-4">
            <p>
              Lithuanian Crypto Central Bank PLC and Lithuanian Crypto Central Bank PLC are each authorised by the Prudential Regulation Authority and regulated by the Financial Conduct Authority and the Prudential Regulation Authority.
            </p>
            <p>
              Lithuanian Crypto Central Bank Investment Solutions Limited is authorised and regulated by the Financial Conduct Authority.
            </p>
            <p>
              Registered office for all: 1 Churchill Place, London E14 5HP
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
