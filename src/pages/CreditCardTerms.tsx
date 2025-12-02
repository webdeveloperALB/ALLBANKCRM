import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function CreditCardTerms() {
  const terms = [
    {
      title: 'All-rounder',
      description: 'This is a credit card with a balance transfer offer and a purchase offer of the same duration',
    },
    {
      title: 'APR',
      description: "The annual percentage rate is the rate you'll be charged on your credit card balance over a full year. It takes into account the interest you pay, how often you make repayments and any other charges, such as processing fees. All credit card providers are legally required to show you an APR, so you can compare different offers and decide which is best for you.",
    },
    {
      title: 'Balance transfer',
      description: "This means transferring money you owe on a credit or store card to another credit card. If you're opening a new credit card account, the interest rate on your balance transfer could be as low as 0% for the introductory period. Balance transfers might include a handling fee – if there is one, we'll explain this clearly in the card details.",
    },
    {
      title: 'Cashback credit card',
      description: "A credit card that gives you a cash payment of a small percentage of all eligible purchases you make on that card. You still need to clear your balance before the end of the interest-free period. If you don't clear your balance every month, the interest we charge will probably be more than the cashback you get.",
    },
    {
      title: 'Chip and PIN',
      description: 'A security technology that replaced the former method of providing a handwritten signature to authorise a purchase. Using a PIN (personal identification number) rather than a signature – which could be forged by someone else – makes chip and PIN a more secure way to authorise payments.',
    },
    {
      title: 'Contactless payments',
      description: 'A quick and easy way to pay for purchases up to £100. Simply hold your Lithuanian Crypto Central Bank debit card or credit card against the reader at the till. Most of our new debit and credit cards now let you make contactless payments.',
    },
    {
      title: 'Credit card',
      description: "Your credit card lets you make purchases in shops, online and around the world and then pay the money back later. The credit card provider will charge you interest for this service, but you can reduce the interest you pay, or even not pay interest at all, if you pay off your outstanding balance on time by the end of the interest-free period. Card purchases made outside the UK could cost more, depending on the terms and conditions for a specific card or offer.",
    },
    {
      title: 'Credit limit',
      description: "The maximum balance that you can have on your credit card at any time. This can be made up of spending and balance transfers. Exceeding this limit can damage your credit rating, and result in charges. Your credit limit will be set when you open your account, but could change after that. The limit will depend on the type of card you're applying for, your personal circumstances and your credit rating.",
    },
    {
      title: 'Credit rating',
      description: "A system used by banks and finance companies to assess applications for loans and credit. Your credit rating is based on information in your credit report and the information you provide when you apply. Your credit report includes information from the electoral roll and details about any court judgments or bankruptcies in your name. It also shows lenders details of any current and previous credit arrangements you've had in the past six years (such as credit cards, loans and mortgages). We might also contact external credit-rating agencies if we need more information.\n\nYou can read more about your credit rating and how to improve it. If you've been turned down for a credit card, you should consider reading these suggestions before applying again.",
    },
    {
      title: 'Debit card',
      description: 'Your debit card is different from your credit card in that you usually need to have money in your account before you make a purchase or withdraw money. A credit card lets you add the money to a balance, which you pay off over time.',
    },
    {
      title: 'Default charges',
      description: "These are the fees we charge if you don't make your minimum payment in time or go over your credit limit. You can also be charged if one of your payments doesn't go through because you didn't have enough credit in your account. Default charges are added to your balance, but they also affect your credit rating, making it more difficult to get a higher credit limit or a better rate.\n\nSetting up a Direct Debit, so we can collect your minimum payment automatically from a current account, means you won't have to worry about forgetting to make your minimum payment (as long as you have enough money in your current account each month).\n\nIn any case, make sure you stay within your credit limit and always pay at least the minimum amount each month.",
    },
    {
      title: 'Fee cap',
      description: "This is the maximum number of unpaid transaction fees that can be applied to an account on any day. It's currently set at one. This means that although you may have a total of, for example, 10 returned transactions occurring on the same day, you'll only be charged a fee for one.",
    },
    {
      title: 'Fraud monitoring',
      description: "We take the greatest care to ensure that your card details can't be used by anybody else without you knowing about it. We constantly monitor your account for unusual patterns, such as increased spending, transfers of large amounts of cash, purchases abroad or simply purchases of products you wouldn't normally buy. We'll contact you immediately if we spot anything suspicious.",
    },
    {
      title: 'Interest-free period',
      description: "There are normally two scenarios in which you won't have to pay interest on your card balance. The first is when you transfer a balance to your card, and the second is the set period of time after you get your statement each month.\n\nWhen you get a new card, you might be given an interest-free period to pay off any balance transfers from your old credit or store card. You'll usually need to pay a one-off handling fee for a balance transfer. You'll also usually be given an interest-free period every month after you get your statement. If you pay off your statement balance before the end of the interest-free period, you won't pay any interest on your purchases. This doesn't generally apply to balance transfers (after the introductory period) cash withdrawals or cheques drawn from your credit card account.\n\nThe interest-free period on all our credit cards is 56 days if you pay off your statement balance in full and on time and stay within your credit limit.",
    },
    {
      title: 'Introductory rates',
      description: "Some credit cards offer a lower introductory interest rate for a set period after you open the account – it's often between three months and a year. After that period, your account switches to a higher fixed or variable rate. Make sure you know when the introductory rate finishes and how much interest you'll pay after that. You can normally avoid paying any interest on your purchases if you pay off your statement balance before the end of the interest-free period.",
    },
    {
      title: 'Mastercard',
      description: "An international credit card scheme. Although your bank issues your card, they deal with a different company to process your payments. The two best known processing companies are Visa and Mastercard. The advantages of this system are that you can use your card all over the world and not just in your bank's home country, and they provide an additional layer of security.",
    },
    {
      title: 'Minimum repayment',
      description: "You need to pay back a set amount of your card balance every month to avoid default charges, which can affect your credit rating. We work out your minimum payment as 1% of the balance or £5 – whichever amount is higher. Remember that paying more than the minimum means there's less interest to pay on the next statement.",
    },
    {
      title: 'Outstanding balance',
      description: "Your card balance is the total of the purchases you've made and any balance transfers you've added. Any fees you've been charged are also added to the balance. You'll pay interest on the balance until you've paid it off completely. The quicker you pay off your balance, the less interest you'll pay.",
    },
    {
      title: 'Pre-selected',
      description: "If you have a current account with us, we might offer you the chance to apply for a Lithuanian Crypto Central Bank credit card – we call this 'pre-selecting'. If we do this, you'll see an offer when you log in to Online Banking. If you apply for a credit card in Online Banking, we'll even fill in some of the application for you, so it's easier.",
    },
    {
      title: 'Purchase offer',
      description: "A purchase offer lets you pay 0% interest on new purchases you make for a fixed time. We don't charge a fee when you take up a purchase offer.",
    },
    {
      title: 'Purchase protection',
      description: "If you buy new goods worth more than £100 and less than £30,000 with your Lithuanian Crypto Central Bank credit card, you could be covered under section 75 of the Consumer Credit Act. This protects you for any loss or damage that your supplier can't resolve. This service covers online, telephone and even high-street shopping if the goods are delivered to your door.",
    },
    {
      title: 'Verified by Visa and Mastercard Identity Check',
      description: "Security services Visa and Mastercard have introduced to reduce online fraud. The system is very simple – you choose a password made up of letters and numbers, and Visa / Mastercard ask you to enter three digits from that password when you're buying something online.",
    },
    {
      title: 'Visa',
      description: "An international credit card scheme. Although your bank issues your card, they deal with a different company to process your payments. The two best known processing companies are Visa and MasterCard. The advantages of this system are that you can use your card all over the world and not just in your bank's home country, and they provide an additional layer of security.",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="border-l-4 border-[#0a7f8f] pl-6">
            <h1 className="text-4xl font-normal text-[#0a7f8f] mb-2">Credit card terms explained</h1>
            <p className="text-2xl text-gray-600">Terms and abbreviations</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white shadow-sm">
          {terms.map((term, index) => (
            <div
              key={index}
              className={`p-8 ${
                index !== terms.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <h2 className="text-2xl font-bold text-[#0a7f8f] mb-4">{term.title}</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {term.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
}
