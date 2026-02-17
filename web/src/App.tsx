import { useState, useEffect } from 'react';
import MapView from './components/MapView';
import DIDChart from './components/DIDChart';
import CitySelector from './components/CitySelector';
import type { SettlementsGeoJSON, CityMetadataMap, RegressionResults, CitySelection } from './types';
import './App.css';

function App() {
  const [settlements, setSettlements] = useState<SettlementsGeoJSON | null>(null);
  const [cities, setCities] = useState<CityMetadataMap | null>(null);
  const [regressionResults, setRegressionResults] = useState<RegressionResults | null>(null);
  const [selectedCity, setSelectedCity] = useState<CitySelection>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [settlementsRes, citiesRes, regressionRes] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}data/settlements.geojson`),
          fetch(`${import.meta.env.BASE_URL}data/cities.json`),
          fetch(`${import.meta.env.BASE_URL}data/regression_results.json`),
        ]);

        if (!settlementsRes.ok || !citiesRes.ok || !regressionRes.ok) {
          throw new Error('Failed to load data files');
        }

        const [settlementsData, citiesData, regressionData] = await Promise.all([
          settlementsRes.json(),
          citiesRes.json(),
          regressionRes.json(),
        ]);

        setSettlements(settlementsData);
        setCities(citiesData);
        setRegressionResults(regressionData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error loading data</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Does Demolishing Informal Settlements Cause Urban Surface Cooling?</h1>
        <p className="subtitle">
          Interactive visualization of difference-in-differences analysis across Beijing, Shanghai, and Guangzhou (2002-2022)
        </p>
      </header>

      <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />

      <main className="main-content">
        <div className="map-panel">
          <h2>Settlement Locations</h2>
          {settlements && cities && (
            <MapView
              settlements={settlements}
              cities={cities}
              selectedCity={selectedCity}
            />
          )}
          <div className="map-legend">
            <div className="legend-item">
              <span className="legend-color control"></span>
              <span>Control (Not Demolished)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color treatment"></span>
              <span>Treatment (Demolished)</span>
            </div>
          </div>
        </div>

        <div className="chart-panel">
          <h2>DiD Regression Results</h2>
          {regressionResults && (
            <DIDChart
              regressionResults={regressionResults}
              selectedCity={selectedCity}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <p>
          Based on: Sun, Y., Gao, X., Liang, J., & Huang, K. (2025).
          <em> Unveiling Causality: Does Demolishing Informal Settlements Cause Urban Surface Cooling?</em>
        </p>
        <p>
          <a href="https://doi.org/10.21203/rs.3.rs-7288639/v1" target="_blank" rel="noopener noreferrer">
            DOI: 10.21203/rs.3.rs-7288639/v1
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
