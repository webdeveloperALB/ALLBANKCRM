import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';

interface CalculationResult {
  betterMarkets: number;
  normalMarkets: number;
  worseMarkets: number;
  contribution: number;
}

export default function InvestmentCalculator() {
  const [growthRate, setGrowthRate] = useState<3 | 6 | 8>(3);
  const [initialInvestment, setInitialInvestment] = useState(5000);
  const [monthlyInvestment, setMonthlyInvestment] = useState(50);
  const [investmentPeriod, setInvestmentPeriod] = useState(10);
  const [targetGoal, setTargetGoal] = useState(0);
  const [results, setResults] = useState<CalculationResult | null>(null);

  const calculateInvestment = (
    initial: number,
    monthly: number,
    years: number,
    rate: number
  ): number => {
    const monthlyRate = rate / 100 / 12;
    const months = years * 12;

    const futureValueInitial = initial * Math.pow(1 + monthlyRate, months);

    const futureValueMonthly = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    return futureValueInitial + futureValueMonthly;
  };

  const performCalculation = () => {
    const baseRate = growthRate;
    const betterRate = baseRate + 2;
    const worseRate = Math.max(baseRate - 2, 1);

    const betterMarkets = calculateInvestment(
      initialInvestment,
      monthlyInvestment,
      investmentPeriod,
      betterRate
    );

    const normalMarkets = calculateInvestment(
      initialInvestment,
      monthlyInvestment,
      investmentPeriod,
      baseRate
    );

    const worseMarkets = calculateInvestment(
      initialInvestment,
      monthlyInvestment,
      investmentPeriod,
      worseRate
    );

    const contribution = initialInvestment + (monthlyInvestment * investmentPeriod * 12);

    setResults({
      betterMarkets: Math.round(betterMarkets),
      normalMarkets: Math.round(normalMarkets),
      worseMarkets: Math.round(worseMarkets),
      contribution: Math.round(contribution),
    });
  };

  useEffect(() => {
    performCalculation();
  }, [growthRate, initialInvestment, monthlyInvestment, investmentPeriod]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const downloadCSV = () => {
    if (!results) return;

    const csvContent = [
      ['Scenario', 'Value'],
      ['In better markets', formatCurrency(results.betterMarkets)],
      ['In normal markets', formatCurrency(results.normalMarkets)],
      ['In worse markets', formatCurrency(results.worseMarkets)],
      ['Total Contribution', formatCurrency(results.contribution)],
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'investment-projection.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#062832] py-20 border-t-2 border-[#0a7f8f]">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Work out your investment future
        </h2>
        <p className="text-gray-300 text-center max-w-3xl mx-auto mb-12">
          Wondering where investing could take you? Use our handy calculator to see what your investments could be worth in the future.
        </p>

        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="bg-[#083d47] p-6 border-l-2 border-[#0a7f8f]">
              <div className="flex items-center gap-2 mb-4">
                <label className="text-white font-semibold">Example growth rate</label>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="growthRate"
                    checked={growthRate === 3}
                    onChange={() => setGrowthRate(3)}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-300">Low - 3%</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="growthRate"
                    checked={growthRate === 6}
                    onChange={() => setGrowthRate(6)}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-300">Medium - 6%</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="growthRate"
                    checked={growthRate === 8}
                    onChange={() => setGrowthRate(8)}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-300">High - 8%</span>
                </label>
              </div>
            </div>

            <div className="bg-[#083d47] p-6 border-l-2 border-[#0a7f8f]">
              <div className="flex items-center gap-2 mb-4">
                <label className="text-white font-semibold">Initial investment</label>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">£</span>
                <input
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(Number(e.target.value))}
                  className="w-full bg-[#0f1424] text-white px-4 py-3 pl-8 border border-gray-600 focus:border-[#0a7f8f] focus:outline-none"
                />
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="100"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-gray-400 text-sm mt-2">
                <span>0</span>
                <span>100,000</span>
              </div>
            </div>

            <div className="bg-[#083d47] p-6 border-l-2 border-[#0a7f8f]">
              <div className="flex items-center gap-2 mb-4">
                <label className="text-white font-semibold">Monthly investment</label>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">£</span>
                <input
                  type="number"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                  className="w-full bg-[#0f1424] text-white px-4 py-3 pl-8 border border-gray-600 focus:border-[#0a7f8f] focus:outline-none"
                />
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="10"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-gray-400 text-sm mt-2">
                <span>0</span>
                <span>2,000</span>
              </div>
            </div>

            <div className="bg-[#083d47] p-6 border-l-2 border-[#0a7f8f]">
              <div className="flex items-center gap-2 mb-4">
                <label className="text-white font-semibold">Investment period</label>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <div className="relative mb-4">
                <input
                  type="number"
                  value={investmentPeriod}
                  onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                  className="w-full bg-[#0f1424] text-white px-4 py-3 border border-gray-600 focus:border-[#0a7f8f] focus:outline-none"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">years</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={investmentPeriod}
                onChange={(e) => setInvestmentPeriod(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-gray-400 text-sm mt-2">
                <span>1</span>
                <span>20</span>
              </div>
            </div>

            <div className="bg-[#083d47] p-6 border-l-2 border-[#0a7f8f]">
              <div className="flex items-center gap-2 mb-4">
                <label className="text-white font-semibold">Target goal (optional)</label>
                <Info className="w-4 h-4 text-gray-400" />
              </div>
              <div className="relative mb-4">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">£</span>
                <input
                  type="number"
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(Number(e.target.value))}
                  className="w-full bg-[#0f1424] text-white px-4 py-3 pl-8 border border-gray-600 focus:border-[#0a7f8f] focus:outline-none"
                />
              </div>
              <input
                type="range"
                min="0"
                max="5000000"
                step="10000"
                value={targetGoal}
                onChange={(e) => setTargetGoal(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-gray-400 text-sm mt-2">
                <span>0</span>
                <span>5,000,000</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#083d47] p-8 h-[400px] flex items-center justify-center relative border-2 border-[#0a7f8f]">
              {results && (() => {
                const maxValue = Math.max(results.betterMarkets, targetGoal || 0);
                const chartHeight = 250;
                const chartWidth = 500;
                const years = investmentPeriod;
                const stepX = chartWidth / years;

                const generateChartPoints = (rate: number) => {
                  const points = [];
                  for (let year = 0; year <= years; year++) {
                    const value = calculateInvestment(initialInvestment, monthlyInvestment, year, rate);
                    const y = 300 - (value / maxValue) * chartHeight;
                    const x = 50 + (year / years) * chartWidth;
                    points.push(`${x},${y}`);
                  }
                  return points.join(' ');
                };

                const betterRate = growthRate + 2;
                const worseRate = Math.max(growthRate - 2, 1);

                const contributionPoints = [];
                for (let year = 0; year <= years; year++) {
                  const contribution = initialInvestment + (monthlyInvestment * year * 12);
                  const y = 300 - (contribution / maxValue) * chartHeight;
                  const x = 50 + (year / years) * chartWidth;
                  contributionPoints.push(`${x},${y}`);
                }

                const yAxisLabels = [];
                for (let i = 0; i <= 5; i++) {
                  const value = (maxValue / 5) * (5 - i);
                  const y = 50 + (chartHeight / 5) * i;
                  yAxisLabels.push({ y, value });
                }

                return (
                  <svg className="w-full h-full" viewBox="0 0 600 350">
                    <line x1="50" y1="300" x2="550" y2="300" stroke="#374151" strokeWidth="2" />
                    <line x1="50" y1="50" x2="50" y2="300" stroke="#374151" strokeWidth="2" />

                    {yAxisLabels.map((label, idx) => (
                      <text key={idx} x="25" y={label.y + 5} fill="#9ca3af" fontSize="11" textAnchor="end">
                        £{(label.value / 1000).toFixed(0)}k
                      </text>
                    ))}

                    {Array.from({ length: years + 1 }, (_, i) => i).map((year) => (
                      <text key={year} x={50 + (year / years) * chartWidth} y="320" fill="#9ca3af" fontSize="12" textAnchor="middle">
                        {year}
                      </text>
                    ))}

                    <text x="300" y="345" fill="#9ca3af" fontSize="14" textAnchor="middle">Years</text>
                    <text x="20" y="180" fill="#9ca3af" fontSize="14" transform="rotate(-90, 20, 180)">Value</text>

                    <polyline
                      points={generateChartPoints(betterRate)}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                    />
                    <polyline
                      points={generateChartPoints(growthRate)}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2"
                    />
                    <polyline
                      points={generateChartPoints(worseRate)}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                    <polyline
                      points={contributionPoints.join(' ')}
                      fill="none"
                      stroke="#9ca3af"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                  </svg>
                );
              })()}
            </div>

            <button
              onClick={downloadCSV}
              className="text-[#14bfd8] hover:text-white text-sm underline"
            >
              Download Data (CSV)
            </button>

            {results && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#083d47] p-6 border-l-2 border-[#0a7f8f]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-1 bg-[#10b981]"></div>
                    <h3 className="text-white font-semibold text-sm">In better markets</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{formatCurrency(results.betterMarkets)}</p>
                </div>

                <div className="bg-[#083d47] p-6 border-l-2 border-[#0a7f8f]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-1 bg-[#3b82f6]"></div>
                    <h3 className="text-white font-semibold text-sm">In normal markets</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{formatCurrency(results.normalMarkets)}</p>
                </div>

                <div className="bg-[#083d47] p-6 border-l-2 border-[#0a7f8f]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-1 bg-[#ef4444]"></div>
                    <h3 className="text-white font-semibold text-sm">In worse markets</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{formatCurrency(results.worseMarkets)}</p>
                </div>

                <div className="bg-[#083d47] p-6 border-l-2 border-[#0a7f8f]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-1 bg-gray-400 opacity-50" style={{ borderTop: '2px dashed' }}></div>
                    <h3 className="text-white font-semibold text-sm">Contribution</h3>
                  </div>
                  <p className="text-3xl font-bold text-white">{formatCurrency(results.contribution)}</p>
                </div>
              </div>
            )}

            <div className="bg-[#083d47] p-6 border-l-2 border-[#0a7f8f]">
              <h3 className="text-white font-semibold mb-3">Calculating the return</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                This calculator is an illustration based on the growth rate you selected and not a projection of what your investments will be worth. The stock market fluctuates daily and the graph does not reflect the ups and downs you should expect when investing. Each line above gives an illustration of a range of returns depending on whether markets perform better or worse than expected, in reality any actual returns will depend on the performance of the individual investments chosen, which cannot be reliably predicted. Results do not take account of inflation or charges. The value of investments can fall as well as rise so you may get back less than you invest.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
