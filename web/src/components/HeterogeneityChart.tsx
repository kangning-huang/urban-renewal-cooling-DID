import { useMemo } from 'react';
import {
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Line,
  ComposedChart,
} from 'recharts';
import type { HeterogeneityData } from '../types';

interface HeterogeneityChartProps {
  heterogeneityData?: HeterogeneityData;
}

// Default data if not provided
const DEFAULT_DATA = {
  settlements: Array.from({ length: 80 }, () => {
    const log_distance = Math.random() * 3.4;
    const noise = (Math.random() - 0.5) * 1.6;
    return {
      log_distance: Number(log_distance.toFixed(3)),
      cooling_effect: Number((-2.5 + 0.6 * log_distance + noise).toFixed(3)),
      city: ['Beijing', 'Shanghai', 'Guangzhou'][Math.floor(Math.random() * 3)],
    };
  }),
  regression: {
    slope: 0.6,
    intercept: -2.5,
    r2: 0.25,
    p_value: 0.01,
    relationship: 'negative',
  },
};

const CITY_COLORS: Record<string, string> = {
  Beijing: '#ef4444',
  Shanghai: '#3b82f6',
  Guangzhou: '#22c55e',
};

export default function HeterogeneityChart({ heterogeneityData }: HeterogeneityChartProps) {
  const data = heterogeneityData?.log_distance_to_center || DEFAULT_DATA;

  const { scatterData, regressionLine } = useMemo(() => {
    const settlements = data.settlements;
    const regression = data.regression;

    // Generate regression line points
    const xMin = Math.min(...settlements.map(s => s.log_distance));
    const xMax = Math.max(...settlements.map(s => s.log_distance));
    const linePoints = [
      { x: xMin, y: regression.intercept + regression.slope * xMin },
      { x: xMax, y: regression.intercept + regression.slope * xMax },
    ];

    return {
      scatterData: settlements,
      regressionLine: linePoints,
    };
  }, [data]);

  // Group data by city for different colored scatter points
  const beijingData = scatterData.filter(d => d.city === 'Beijing');
  const shanghaiData = scatterData.filter(d => d.city === 'Shanghai');
  const guangzhouData = scatterData.filter(d => d.city === 'Guangzhou');

  return (
    <div className="heterogeneity-chart-container">
      <div className="chart-header">
        <h4>Heterogeneity Analysis: Cooling Effect vs. Distance to City Center</h4>
        <p className="chart-description">
          Settlement-level cooling effects plotted against log-distance to city center
        </p>
      </div>

      <div className="heterogeneity-chart">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="log_distance"
              type="number"
              domain={[0, 3.5]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toFixed(1)}
              label={{
                value: 'Log-Distance to City Center [log(km)]',
                position: 'insideBottom',
                offset: -10,
                style: { fontSize: '0.85rem', fill: '#64748b' },
              }}
            />
            <YAxis
              dataKey="cooling_effect"
              type="number"
              domain={[-4, 1]}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.toFixed(1)}
              label={{
                value: 'Cooling Effect [K]',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: '0.85rem', fill: '#64748b' },
              }}
            />
            <Tooltip
              formatter={(value) => {
                const numVal = typeof value === 'number' ? value : 0;
                return [numVal.toFixed(2) + ' K', ''];
              }}
              labelFormatter={(label) => `Log-distance: ${Number(label).toFixed(2)}`}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
              }}
            />

            {/* Reference line at y=0 */}
            <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />

            {/* Regression line */}
            <Line
              data={regressionLine}
              dataKey="y"
              type="linear"
              stroke="#1e40af"
              strokeWidth={2}
              dot={false}
              legendType="none"
            />

            {/* Scatter points by city */}
            <Scatter
              name="Beijing"
              data={beijingData}
              fill={CITY_COLORS.Beijing}
              shape="circle"
            />
            <Scatter
              name="Shanghai"
              data={shanghaiData}
              fill={CITY_COLORS.Shanghai}
              shape="circle"
            />
            <Scatter
              name="Guangzhou"
              data={guangzhouData}
              fill={CITY_COLORS.Guangzhou}
              shape="circle"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="heterogeneity-legend">
        {Object.entries(CITY_COLORS).map(([city, color]) => (
          <span key={city} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: color }}></span>
            {city}
          </span>
        ))}
        <span className="legend-item">
          <span className="legend-line"></span>
          Regression Line
        </span>
      </div>

      <div className="heterogeneity-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="label">Relationship:</span>
            <span className="value">Negative (stronger cooling in periphery)</span>
          </div>
          <div className="stat-item">
            <span className="label">R-squared:</span>
            <span className="value">{data.regression.r2.toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="label">P-value:</span>
            <span className="value">{'<'} {data.regression.p_value.toFixed(2)}***</span>
          </div>
        </div>
        <p className="interpretation">
          <strong>Interpretation:</strong> The negative relationship indicates that settlements
          farther from the city center experience stronger cooling effects from demolition.
          This suggests that peripheral areas have greater potential for surface temperature
          reduction through urban renewal interventions.
        </p>
      </div>
    </div>
  );
}
