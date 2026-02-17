import { useState, useEffect } from 'react';
import MapView from './components/MapView';
import DIDChart from './components/DIDChart';
import CitySelector from './components/CitySelector';
import MethodsPage from './components/MethodsPage';
import ImplicationsPage from './components/ImplicationsPage';
import type { SettlementsGeoJSON, CityMetadataMap, RegressionResults, CitySelection } from './types';
import './App.css';

type PageType = 'home' | 'methods' | 'implications';

function App() {
  const [settlements, setSettlements] = useState<SettlementsGeoJSON | null>(null);
  const [cities, setCities] = useState<CityMetadataMap | null>(null);
  const [regressionResults, setRegressionResults] = useState<RegressionResults | null>(null);
  const [selectedCity, setSelectedCity] = useState<CitySelection>('all');
  const [currentPage, setCurrentPage] = useState<PageType>('home');
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

  const renderPage = () => {
    switch (currentPage) {
      case 'methods':
        return <MethodsPage />;
      case 'implications':
        return <ImplicationsPage />;
      default:
        return (
          <>
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
          </>
        );
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Does Demolishing Informal Settlements Cause Urban Surface Cooling?</h1>
        <p className="subtitle">
          Interactive visualization of difference-in-differences analysis across Beijing, Shanghai, and Guangzhou (2002-2022)
        </p>
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentPage('home')}
          >
            Results
          </button>
          <button
            className={`nav-tab ${currentPage === 'methods' ? 'active' : ''}`}
            onClick={() => setCurrentPage('methods')}
          >
            Methods
          </button>
          <button
            className={`nav-tab ${currentPage === 'implications' ? 'active' : ''}`}
            onClick={() => setCurrentPage('implications')}
          >
            Implications
          </button>
        </nav>
      </header>

      {renderPage()}

      <footer className="footer">
        <div className="authors">
          <h4>Authors</h4>
          <div className="author-list">
            <div className="author">
              <span className="author-name">Yujie Sun</span>
              <span className="author-affiliation">New York University</span>
            </div>
            <div className="author">
              <span className="author-name">Xuyan Gao</span>
              <span className="author-affiliation">New York University</span>
            </div>
            <div className="author">
              <span className="author-name">Jiayong Liang</span>
              <span className="author-affiliation">New York University</span>
              <a href="mailto:jiayong.liang@nyu.edu" className="author-email">jiayong.liang@nyu.edu</a>
            </div>
            <div className="author">
              <a href="https://kangning-huang.github.io/main/" target="_blank" rel="noopener noreferrer" className="author-name author-link">
                Kangning Huang
              </a>
              <span className="author-affiliation">New York University</span>
            </div>
          </div>
        </div>
        <div className="citation-info">
          <p>
            <strong>Citation:</strong> Sun, Y., Gao, X., Liang, J., & Huang, K. (2025).
            <em> Unveiling Causality: Does Demolishing Informal Settlements Cause Urban Surface Cooling?</em>
          </p>
          <p>
            <a href="https://doi.org/10.21203/rs.3.rs-7288639/v1" target="_blank" rel="noopener noreferrer">
              DOI: 10.21203/rs.3.rs-7288639/v1
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
