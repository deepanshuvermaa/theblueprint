import React, { useState, useMemo } from 'react';
import './CompoundInterestCalculator.css';

interface YearData {
  year: number;
  startBalance: number;
  interest: number;
  endBalance: number;
  totalContributions: number;
  totalInterest: number;
}

const CompoundInterestCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState('10000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [annualRate, setAnnualRate] = useState('7');
  const [years, setYears] = useState('20');
  const [compoundFrequency, setCompoundFrequency] = useState<'monthly' | 'quarterly' | 'annually'>('monthly');

  const calculateCompoundInterest = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const pmt = parseFloat(monthlyContribution) || 0;
    const r = (parseFloat(annualRate) || 0) / 100;
    const t = parseInt(years) || 0;

    if (p < 0 || pmt < 0 || r < 0 || t <= 0) {
      return { yearlyData: [], finalBalance: 0, totalContributions: 0, totalInterest: 0 };
    }

    const n = compoundFrequency === 'monthly' ? 12 : compoundFrequency === 'quarterly' ? 4 : 1;
    const yearlyData: YearData[] = [];
    let balance = p;
    let totalContributions = p;

    for (let year = 1; year <= t; year++) {
      const startBalance = balance;

      // Calculate compound interest with monthly contributions
      for (let period = 1; period <= n; period++) {
        const contributionThisPeriod = pmt * (12 / n);

        balance = balance * (1 + r / n) + contributionThisPeriod;
        totalContributions += contributionThisPeriod;
      }

      const interest = balance - startBalance - (pmt * 12);
      const totalInterest = balance - totalContributions;

      yearlyData.push({
        year,
        startBalance,
        interest,
        endBalance: balance,
        totalContributions,
        totalInterest
      });
    }

    return {
      yearlyData,
      finalBalance: balance,
      totalContributions,
      totalInterest: balance - totalContributions
    };
  }, [principal, monthlyContribution, annualRate, years, compoundFrequency]);

  const { yearlyData, finalBalance, totalContributions, totalInterest } = calculateCompoundInterest;

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getMaxBalance = () => {
    return Math.max(...yearlyData.map(d => d.endBalance), 0);
  };

  return (
    <div className="compound-calculator">
      <div className="calculator-header">
        <h3>Compound Interest Calculator</h3>
        <p className="calculator-subtitle">Project your investment growth with compound interest</p>
      </div>

      <div className="calculator-inputs">
        <div className="input-group">
          <label className="input-label">Initial Investment</label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              className="calculator-input"
              min="0"
              step="1000"
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Monthly Contribution</label>
          <div className="input-with-prefix">
            <span className="input-prefix">$</span>
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              className="calculator-input"
              min="0"
              step="100"
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Annual Interest Rate</label>
          <div className="input-with-suffix">
            <input
              type="number"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
              className="calculator-input"
              min="0"
              max="100"
              step="0.1"
            />
            <span className="input-suffix">%</span>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Time Period (Years)</label>
          <input
            type="number"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="calculator-input"
            min="1"
            max="50"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Compound Frequency</label>
          <div className="frequency-selector">
            <button
              className={`frequency-btn ${compoundFrequency === 'monthly' ? 'active' : ''}`}
              onClick={() => setCompoundFrequency('monthly')}
            >
              Monthly
            </button>
            <button
              className={`frequency-btn ${compoundFrequency === 'quarterly' ? 'active' : ''}`}
              onClick={() => setCompoundFrequency('quarterly')}
            >
              Quarterly
            </button>
            <button
              className={`frequency-btn ${compoundFrequency === 'annually' ? 'active' : ''}`}
              onClick={() => setCompoundFrequency('annually')}
            >
              Annually
            </button>
          </div>
        </div>
      </div>

      <div className="results-summary">
        <div className="summary-card primary">
          <div className="summary-label">Final Balance</div>
          <div className="summary-value">{formatCurrency(finalBalance)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Contributions</div>
          <div className="summary-value">{formatCurrency(totalContributions)}</div>
        </div>
        <div className="summary-card success">
          <div className="summary-label">Total Interest Earned</div>
          <div className="summary-value">{formatCurrency(totalInterest)}</div>
        </div>
      </div>

      {yearlyData.length > 0 && (
        <>
          <div className="growth-chart">
            <h4>Growth Visualization</h4>
            <div className="chart-area">
              {yearlyData.map((data, idx) => {
                const contributionsHeight = (data.totalContributions / getMaxBalance()) * 100;
                const interestHeight = (data.totalInterest / getMaxBalance()) * 100;
                const totalHeight = contributionsHeight + interestHeight;

                return (
                  <div key={idx} className="chart-bar-wrapper">
                    <div className="chart-bar" style={{ height: `${Math.max(totalHeight, 2)}%` }}>
                      <div
                        className="bar-segment contributions"
                        style={{ height: `${(contributionsHeight / totalHeight) * 100}%` }}
                        title={`Contributions: ${formatCurrency(data.totalContributions)}`}
                      />
                      <div
                        className="bar-segment interest"
                        style={{ height: `${(interestHeight / totalHeight) * 100}%` }}
                        title={`Interest: ${formatCurrency(data.totalInterest)}`}
                      />
                    </div>
                    {(idx === 0 || idx === yearlyData.length - 1 || idx % 5 === 4) && (
                      <div className="chart-label">Y{data.year}</div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color contributions"></div>
                <span>Your Contributions</span>
              </div>
              <div className="legend-item">
                <div className="legend-color interest"></div>
                <span>Interest Earned</span>
              </div>
            </div>
          </div>

          <div className="yearly-breakdown">
            <h4>Yearly Breakdown</h4>
            <div className="breakdown-table">
              <div className="table-header">
                <div className="table-cell">Year</div>
                <div className="table-cell">Starting</div>
                <div className="table-cell">Interest</div>
                <div className="table-cell">Ending</div>
              </div>
              <div className="table-body">
                {yearlyData.map((data) => (
                  <div key={data.year} className="table-row">
                    <div className="table-cell">{data.year}</div>
                    <div className="table-cell">{formatCurrency(data.startBalance)}</div>
                    <div className="table-cell interest-cell">+{formatCurrency(data.interest)}</div>
                    <div className="table-cell">{formatCurrency(data.endBalance)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="calculator-tips">
        <h4>Investment Tips:</h4>
        <ul>
          <li><strong>Start Early:</strong> Time is your most powerful asset. Even small amounts grow significantly over decades.</li>
          <li><strong>Be Consistent:</strong> Regular monthly contributions compound faster than lump sums.</li>
          <li><strong>Reinvest Dividends:</strong> Maximize compound growth by reinvesting all returns.</li>
          <li><strong>Tax-Advantaged Accounts:</strong> Use 401(k), IRA, or Roth IRA to grow investments tax-free.</li>
          <li><strong>Realistic Returns:</strong> Stock market averages 7-10% annually. Adjust expectations accordingly.</li>
        </ul>
      </div>
    </div>
  );
};

export default CompoundInterestCalculator;
