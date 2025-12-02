export interface SearchContent {
  id: string;
  title: string;
  description: string;
  content: string[];
  category: string;
  path: string;
  keywords: string[];
}

export const searchIndex: SearchContent[] = [
  {
    id: 'bank-account',
    title: 'Lithuanian Crypto Central Bank Bank Account',
    description: 'Flexible, rewarding banking with our bank account',
    content: [
      'Current account with flexible banking options',
      'Earn rewards on your everyday spending',
      'No monthly fees',
      'Easy online and mobile banking',
      'Instant notifications for transactions',
      'Contactless payments',
      'Overdraft facilities available',
      'Direct debit management',
      'Standing orders',
      'International payments'
    ],
    category: 'Accounts',
    path: '/bank-account',
    keywords: ['bank', 'account', 'current', 'banking', 'rewards', 'spending', 'transactions']
  },
  {
    id: 'compare-loans',
    title: 'Compare Loans',
    description: 'Find the best loan option for your needs',
    content: [
      'Personal loans comparison',
      'Car loans with competitive rates',
      'Home improvement loans',
      'Debt consolidation loans',
      'Wedding loans',
      'Flexible repayment terms',
      'Quick approval process',
      'Competitive interest rates',
      'Loan calculator available',
      'No hidden fees'
    ],
    category: 'Loans',
    path: '/compare-loans',
    keywords: ['loan', 'loans', 'personal', 'car', 'wedding', 'home', 'improvement', 'debt', 'consolidation', 'borrow', 'credit']
  },
  {
    id: 'compare-credit-cards',
    title: 'Compare Credit Cards',
    description: 'Find the right credit card for you',
    content: [
      'Credit card comparison tool',
      'Rewards credit cards',
      'Cashback credit cards',
      'Travel credit cards',
      'Balance transfer cards',
      '0% introductory APR offers',
      'Purchase protection',
      'Extended warranty',
      'Travel insurance included',
      'Fraud protection',
      'Contactless payments',
      'Mobile wallet compatible'
    ],
    category: 'Credit Cards',
    path: '/compare-credit-cards',
    keywords: ['credit', 'card', 'cards', 'rewards', 'cashback', 'travel', 'balance', 'transfer', 'APR', 'purchases']
  },
  {
    id: 'credit-card-terms',
    title: 'Credit Card Terms Explained',
    description: 'Understand credit card terminology',
    content: [
      'APR - Annual Percentage Rate explained',
      'Balance transfer terms',
      'Minimum payment requirements',
      'Credit limit information',
      'Interest-free periods',
      'Cash advance fees',
      'Foreign transaction fees',
      'Late payment charges',
      'Over-limit fees',
      'Credit score impact',
      'Statement date vs due date',
      'Grace period explained'
    ],
    category: 'Credit Cards',
    path: '/credit-card-terms',
    keywords: ['credit', 'card', 'terms', 'APR', 'interest', 'fees', 'balance', 'payment', 'limit', 'explained']
  },
  {
    id: 'compare-investment-accounts',
    title: 'Compare Investment Accounts',
    description: 'Find the right investment account for your goals',
    content: [
      'Investment account comparison',
      'General Investment Account (GIA)',
      'Self-Invested Personal Pension (SIPP)',
      'ISA accounts',
      'Tax-efficient investing',
      'Flexible withdrawal options',
      'Wide range of investment options',
      'Stocks and shares',
      'Funds and ETFs',
      'Bonds and gilts',
      'Low fees and charges',
      'Expert investment guidance'
    ],
    category: 'Investments',
    path: '/compare-investment-accounts',
    keywords: ['investment', 'accounts', 'compare', 'GIA', 'SIPP', 'ISA', 'pension', 'stocks', 'shares', 'funds']
  },
  {
    id: 'general-investment-account',
    title: 'General Investment Account',
    description: 'Flexible investing with easy access to your money',
    content: [
      'General Investment Account overview',
      'Flexible investment options',
      'No contribution limits',
      'Easy access to your money',
      'Wide range of investments',
      'Stocks, bonds, and funds',
      'Tax considerations',
      'Capital gains tax applies',
      'Dividend tax implications',
      'Portfolio management tools',
      'Regular investing options',
      'Lump sum investments'
    ],
    category: 'Investments',
    path: '/general-investment-account',
    keywords: ['GIA', 'general', 'investment', 'account', 'flexible', 'stocks', 'bonds', 'funds', 'tax', 'portfolio']
  },
  {
    id: 'sipp',
    title: 'Self-Invested Personal Pension (SIPP)',
    description: 'Take control of your retirement planning',
    content: [
      'SIPP pension account',
      'Self-Invested Personal Pension',
      'Tax-efficient retirement saving',
      'Tax relief on contributions',
      'Wide investment choice',
      'Stocks and shares',
      'Funds and ETFs',
      'Investment trusts',
      'Flexible retirement options',
      'Pension drawdown',
      'Lump sum withdrawal',
      'Annual allowance information',
      'Lifetime allowance details'
    ],
    category: 'Investments',
    path: '/sipp',
    keywords: ['SIPP', 'pension', 'retirement', 'tax', 'relief', 'self-invested', 'drawdown', 'allowance', 'contributions']
  },
  {
    id: 'new-to-investing',
    title: 'New to Investing',
    description: 'Get started with investing',
    content: [
      'Beginner investment guide',
      'What is investing',
      'Why invest your money',
      'Investment basics explained',
      'Risk and return',
      'Diversification explained',
      'Investment timeframes',
      'Short-term vs long-term investing',
      'Investment goals setting',
      'Understanding fees',
      'Getting started steps',
      'Investment account types',
      'How to choose investments'
    ],
    category: 'Investments',
    path: '/new-to-investing',
    keywords: ['new', 'beginner', 'investing', 'start', 'basics', 'guide', 'learn', 'risk', 'return', 'diversification']
  },
  {
    id: 'investment-types-explained',
    title: 'Investment Types Explained',
    description: 'Understand different types of investments',
    content: [
      'Investment types overview',
      'Stocks and shares explained',
      'Bonds and gilts',
      'Mutual funds',
      'Exchange-traded funds (ETFs)',
      'Investment trusts',
      'Index funds',
      'Property investments',
      'Commodities',
      'Cash investments',
      'Risk levels by investment type',
      'Liquidity considerations',
      'Tax implications by type'
    ],
    category: 'Investments',
    path: '/investment-types-explained',
    keywords: ['investment', 'types', 'stocks', 'bonds', 'funds', 'ETF', 'trust', 'explained', 'property', 'cash']
  },
  {
    id: 'help-support',
    title: 'Help and Support',
    description: 'Get the help you need',
    content: [
      'Customer support services',
      'Contact us information',
      'Frequently asked questions',
      'Account help',
      'Technical support',
      'Security and fraud',
      'Complaints procedure',
      'Opening hours',
      'Phone support',
      'Email support',
      'Live chat available',
      'Branch locations',
      'Online help center'
    ],
    category: 'Support',
    path: '/help-support',
    keywords: ['help', 'support', 'contact', 'FAQ', 'assistance', 'customer', 'service', 'phone', 'email', 'chat']
  }
];

export function searchContent(query: string): SearchContent[] {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const lowerQuery = query.toLowerCase().trim();
  const queryWords = lowerQuery.split(/\s+/);

  return searchIndex
    .map(item => {
      let score = 0;

      if (item.title.toLowerCase().includes(lowerQuery)) {
        score += 100;
      }

      if (item.description.toLowerCase().includes(lowerQuery)) {
        score += 50;
      }

      queryWords.forEach(word => {
        if (item.title.toLowerCase().includes(word)) {
          score += 30;
        }

        if (item.keywords.some(keyword => keyword.includes(word))) {
          score += 20;
        }

        if (item.content.some(c => c.toLowerCase().includes(word))) {
          score += 10;
        }

        if (item.category.toLowerCase().includes(word)) {
          score += 15;
        }
      });

      return { ...item, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);
}
