import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

export default function SIPPAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const accordionData: AccordionItem[] = [
    {
      title: 'Tax relief on pension contributions',
      content: (
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            When you pay into a personal pension your provider will automatically claim basic rate tax relief at 20% from HM Revenue & Customs (HMRC) and add it to your pension pot. This means if you pay €8,000 into a SIPP you'll receive a further €2,000 from the government, boosting your pot to €10,000.
          </p>
          <p>
            As you may expect there are some restrictions. Firstly, it's limited to 100% of your annual UK earnings. Even if you don't pay Income Tax you can still contribute up to 100% of your earnings. And, while you can benefit if you don't have any earnings, you'll only get tax relief on the first €2,880 you pay into a pension each tax year – topped up by HMRC by €720 to give you €3,600 (6 April to 5 April).
          </p>
          <p>
            If you pay Income Tax above the basic rate you can claim additional tax relief on your Self-Assessment tax return to bring the total relief to either 40% or 45%.
          </p>
        </div>
      ),
    },
    {
      title: 'Topping up your SIPP',
      content: (
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            You can top up your existing Lithuanian Crypto Central Bank SIPP using a debit card, by making a bank transfer, by setting up a Direct Debit or with a cheque.
          </p>
          <p>
            To use your debit card simply log in to Smart Investor and go to the 'pay in' section where you'll find a link which takes you to the website of the SIPP administrator AJ Bell, and they'll process your contribution. You'll be asked for your SIPP Account number and your date of birth.
          </p>
          <p>
            Please note it will take up to five working days for the money to be available to invest in your SIPP.
          </p>
        </div>
      ),
    },
    {
      title: 'Limits on paying into a pension',
      content: (
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            There's a limit on the amount you can contribute to your pensions each tax year which attracts tax relief – known as your Annual Allowance. For most people this is €60,000 per tax year, or 100% of your UK earnings, whichever is lower.
          </p>
          <p>
            Pensions also offer the unique benefit of being able to 'carry forward' any unused annual allowances from the previous three tax years. The amount you carry forward is reduced by your annual allowance usage during those tax years.
          </p>
          <p>
            If you exceed the Annual Allowance, you will normally face a tax charge, as any excess contribution will be subject to your marginal rate of income tax.
          </p>
          <p className="font-semibold text-white">Your Annual Allowance will be reduced if:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              You've drawn a taxable sum from a defined contribution pension, in which case the amount you can pay into Defined Contribution or Money Purchase pensions (excluding Defined Benefit pensions) and receive tax relief reduces to €10,000 per tax year or 100% of your income, whichever is lower (and you can also no longer make payments in relation to previous tax years).
            </li>
            <li>
              If your total income is above €200,000 and your income and pension contributions made on your behalf exceed €260,000 your Annual Allowance will be tapered.(1)
            </li>
          </ul>
          <p className="text-sm italic">
            We don't offer tailored financial advice, so if you're not sure about investing or how a pension works, seek independent advice. Tax rules can change and their effects on you will depend on your individual circumstances.
          </p>
        </div>
      ),
    },
    {
      title: 'Transferring pensions into a SIPP',
      content: (
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            If you already have a Lithuanian Crypto Central Bank SIPP you'll just need to complete a SIPP transfer form. This form can be found by logging in to My hub and selecting 'SIPP' from the list of your accounts available, then click on the link to 'Transfer in investments'.
          </p>
          <p>
            Transferring is simple and usually takes around a month if you want to keep your investments exactly as they are in your current pension. Transfers can be faster if you sell and transfer your pension as a cash sum, but you will miss any growth in the market while the transfer takes place.
          </p>
          <p>
            Before transferring your pensions, please check you wouldn't be giving up any benefits of your existing pensions. Benefits might include loyalty bonuses, guaranteed annuity rates or spousal pensions.
          </p>
          <p>
            We cannot accept transfers from defined benefit pension schemes into the Lithuanian Crypto Central Bank SIPP as it's unlikely to be in your best interests.
          </p>
          <p>
            If you have any doubts whether you should transfer a pension, please seek advice from a financial adviser.
          </p>
          <p>
            For more information on SIPP transfers and possible penalties read our factsheet [PDF, 1.3MB].
          </p>
          <p>
            Once you've decided to go ahead simply complete and return the form and we'll take care of the transfer legwork for you.
          </p>
        </div>
      ),
    },
    {
      title: 'Your options at retirement',
      content: (
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p>
            When you reach retirement age (usually 55 rising to 57 from 2028) you can:
          </p>
          <ul className="list-disc pl-6 space-y-3">
            <li>
              Take up to 25% of your savings tax-free and then draw a taxed income as you need to.
            </li>
            <li>
              Take a lump sum or even the whole fund at once and 25% will be tax-free. Beware, taking money out of one or more of your pensions in this way may increase your income in a given tax year significantly and result in you paying more tax than you would do if you drew an income gradually.
            </li>
            <li>
              You can buy an annuity to receive a guaranteed income for the rest of your life.
            </li>
            <li>
              Take smaller amounts as and when you like with 25% of each withdrawal being tax-free.
            </li>
            <li>
              You can also use a combination of these options.
            </li>
          </ul>
          <p className="text-sm italic">
            This minimum age for drawing pension benefits is set by the government and may rise in future. All amounts drawn above the 25% tax-free lump sum will be taxed at your marginal rate at the time.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-[#062832] py-20 border-t-2 border-[#0a7f8f]">
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Learn more about our Self-Invested Personal Pensions (SIPP)
        </h2>

        <div className="space-y-4">
          {accordionData.map((item, index) => (
            <div
              key={index}
              className="bg-[#083d47] overflow-hidden border-l-2 border-[#0a7f8f]"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[#0a5f6d] transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-4">
                  {item.title}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-white flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? 'max-h-[2000px] opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 pt-2">
                  {item.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
