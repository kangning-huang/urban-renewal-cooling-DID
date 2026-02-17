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
          <a
            href="https://github.com/kangning-huang/urban-renewal-cooling-DID"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            title="View source on GitHub"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
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
