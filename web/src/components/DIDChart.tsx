import { useMemo } from 'react';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from 'recharts';
import type { RegressionResults, CitySelection } from '../types';

interface DIDChartProps {
  regressionResults: RegressionResults;
  selectedCity: CitySelection;
}

export default function DIDChart({ regressionResults, selectedCity }: DIDChartProps) {
  const cityKey = selectedCity === 'all' ? 'all' : selectedCity;

  const parallelTrendsData = useMemo(() => {
    return regressionResults.parallel_trends[cityKey];
  }, [regressionResults, cityKey]);

  const didResult = useMemo(() => {
    return regressionResults.did_coefficients[cityKey];
  }, [regressionResults, cityKey]);

  const cityLabel = selectedCity === 'all' ? 'All Cities' : selectedCity;

  return (
    <div className="did-chart">
      <div className="chart-header">
        <h3>Parallel Trends Test: {cityLabel}</h3>
        <p className="chart-description">
          LST change relative to year -1 (one year before demolition)
        </p>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart
            data={parallelTrendsData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="year"
              label={{
                value: 'Time Since Demolition [Year]',
                position: 'insideBottom',
                offset: -10,
              }}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => (value >= 0 ? `+${value}` : `${value}`)}
            />
            <YAxis
              label={{
                value: 'LST Change [K]',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
              }}
              domain={[-6, 4]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value) => {
                const numVal = typeof value === 'number' ? value : 0;
                return [`${numVal.toFixed(2)} K`, 'Coefficient'];
              }}
              labelFormatter={(label) =>
                `Year ${Number(label) >= 0 ? '+' : ''}${label} (relative to demolition)`
              }
            />

            {/* Reference lines */}
            <ReferenceLine y={0} stroke="#666" strokeWidth={1} />
            <ReferenceLine
              x={0}
              stroke="#e74c3c"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: 'Demolition',
                position: 'top',
                fill: '#e74c3c',
                fontSize: 11,
              }}
            />

            {/* Confidence interval area */}
            <Area
              type="monotone"
              dataKey="ci_upper"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0}
            />
            <Area
              type="monotone"
              dataKey="ci_lower"
              stroke="none"
              fill="#3b82f6"
              fillOpacity={0.15}
            />

            {/* Main coefficient line */}
            <Line
              type="monotone"
              dataKey="coef"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#1d4ed8' }}
            />

            {/* CI lines (dashed) */}
            <Line
              type="monotone"
              dataKey="ci_lower"
              stroke="#93c5fd"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="ci_upper"
              stroke="#93c5fd"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="did-summary">
        <h4>DiD Coefficient Summary</h4>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">Cooling Effect:</span>
            <span className="value effect">
              {didResult.effect.toFixed(2)} K
            </span>
          </div>
          <div className="summary-item">
            <span className="label">95% CI:</span>
            <span className="value">
              [{didResult.ci_lower.toFixed(2)}, {didResult.ci_upper.toFixed(2)}]
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Std. Error:</span>
            <span className="value">{didResult.se.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <span className="label">p-value:</span>
            <span className="value">
              {'<'}{didResult.p_value.toFixed(2)}
              {didResult.p_value <= 0.01 ? '***' : didResult.p_value <= 0.05 ? '**' : '*'}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">R²:</span>
            <span className="value">{didResult.r2.toFixed(2)}</span>
          </div>
        </div>

        <p className="interpretation">
          {selectedCity === 'all' ? (
            <>
              Across all three cities, demolishing informal settlements resulted in an average
              land surface temperature reduction of <strong>{Math.abs(didResult.effect).toFixed(2)} K</strong>.
            </>
          ) : (
            <>
              In {selectedCity}, demolishing informal settlements caused a
              land surface temperature reduction of <strong>{Math.abs(didResult.effect).toFixed(2)} K</strong>.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
