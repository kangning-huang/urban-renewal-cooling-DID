import PlaceboChart from './PlaceboChart';
import HeterogeneityChart from './HeterogeneityChart';

export default function MethodsPage() {
  return (
    <div className="page-content">
      <h2>Methods</h2>

      <section className="method-section">
        <h3>Difference-in-Differences Framework</h3>
        <p>
          We assessed the causal impact of informal settlement demolition on Land Surface Temperature (LST)
          using a difference-in-differences (DiD) framework. This quasi-experimental approach compares
          LST changes in demolished settlements (treatment group) to those in non-demolished settlements
          (control group) before and after the intervention, controlling for time-invariant unobserved
          heterogeneity and observed time-varying covariates.
        </p>

        <div className="equation-box">
          <h4>Baseline DiD Model</h4>
          <div className="equation">
            LST<sub>it</sub> = β<sub>0</sub> + β<sub>1</sub>DiD<sub>it</sub> + γX<sub>it</sub> + δ<sub>i</sub> + δ<sub>t</sub> + ε<sub>it</sub>
          </div>
          <p className="equation-note">
            where DiD<sub>it</sub> = group<sub>i</sub> × time<sub>t</sub>
          </p>
          <ul className="variable-list">
            <li><strong>LST<sub>it</sub></strong>: Land surface temperature for settlement i in year t</li>
            <li><strong>group<sub>i</sub></strong>: Indicator for demolished (treatment) settlement</li>
            <li><strong>time<sub>t</sub></strong>: Indicator for post-demolition period</li>
            <li><strong>X<sub>it</sub></strong>: Vector of control variables</li>
            <li><strong>δ<sub>i</sub></strong>: Settlement fixed effects</li>
            <li><strong>δ<sub>t</sub></strong>: Year fixed effects</li>
            <li><strong>β<sub>1</sub></strong>: Average treatment effect of demolition on LST</li>
          </ul>
        </div>
      </section>

      <section className="method-section">
        <h3>Land Surface Temperature Retrieval</h3>
        <p>
          LST was retrieved using Landsat satellite thermal imagery processed in Google Earth Engine.
          The retrieval algorithm uses top-of-atmosphere (TOA) radiance and surface reflectance,
          integrating atmospheric water vapor and surface emissivity data.
        </p>

        <div className="equation-box">
          <h4>Fractional Vegetation Cover (FVC)</h4>
          <div className="equation">
            FVC = ((NDVI - NDVI<sub>bare</sub>) / (NDVI<sub>veg</sub> - NDVI<sub>bare</sub>))<sup>2</sup>
          </div>
        </div>

        <div className="equation-box">
          <h4>Surface Emissivity</h4>
          <div className="equation">
            ε<sub>b</sub> = ε<sub>b,veg</sub> × FVC + ε<sub>b,bare</sub> × (1 - FVC)
          </div>
        </div>

        <div className="equation-box">
          <h4>Statistical Mono-Window (SMW) Algorithm</h4>
          <div className="equation">
            LST = A<sub>i</sub>(T<sub>b</sub>/ε) + B<sub>i</sub>(1/ε) + C<sub>i</sub>
          </div>
          <p className="equation-note">
            where T<sub>b</sub> is TOA brightness temperature, ε is surface emissivity,
            and A<sub>i</sub>, B<sub>i</sub>, C<sub>i</sub> are calibration coefficients.
          </p>
        </div>
      </section>

      <section className="method-section">
        <h3>Control Variables</h3>
        <p>
          Four city-level time-varying covariates were included to isolate the demolition effect:
        </p>
        <table className="data-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Purpose</th>
              <th>Data Source</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Urban Population</td>
              <td>Controls for agglomeration intensity and anthropogenic heat flux</td>
              <td>CSMAR Database</td>
            </tr>
            <tr>
              <td>Air Temperature</td>
              <td>Accounts for background climate variability (e.g., El Niño, heat waves)</td>
              <td>C3S Climate Data Store</td>
            </tr>
            <tr>
              <td>Urban Construction Land Area</td>
              <td>Proxy for impervious surface expansion and UHI intensification</td>
              <td>CSMAR Database</td>
            </tr>
            <tr>
              <td>Nighttime Light Intensity</td>
              <td>Proxy for economic activity and energy consumption</td>
              <td>Harmonized NTL Dataset</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="method-section">
        <h3>Robustness Checks</h3>

        <div className="robustness-item">
          <h4>1. Parallel Trends Test</h4>
          <p>
            The DiD design requires that treatment and control groups would have followed parallel
            temperature trajectories absent the intervention. Pre-intervention coefficients (years -7 to -1)
            were tightly centered on zero, indicating the groups were on identical thermal paths before demolition.
          </p>
        </div>

        <div className="robustness-item">
          <h4>2. Model Specification Tests</h4>
          <p>
            Stepwise regression was used to test robustness of the core DiD coefficient:
          </p>
          <table className="data-table specification-table">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Model 1</th>
                <th>Model 2</th>
                <th>Model 3</th>
                <th>Model 4</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Urban Renewal Effect</strong></td>
                <td>-1.419***</td>
                <td>-1.429***</td>
                <td>-1.248***</td>
                <td>-1.467***</td>
              </tr>
              <tr>
                <td>Urban Population</td>
                <td>0.003***</td>
                <td>0.003***</td>
                <td>0.003***</td>
                <td>0.001***</td>
              </tr>
              <tr>
                <td>Air Temperature</td>
                <td>-</td>
                <td>0.637***</td>
                <td>0.653***</td>
                <td>0.586***</td>
              </tr>
              <tr>
                <td>Construction Land Area</td>
                <td>-</td>
                <td>-</td>
                <td>0.001***</td>
                <td>0.001***</td>
              </tr>
              <tr>
                <td>Nighttime Light</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>1.52e-5***</td>
              </tr>
              <tr>
                <td>R²</td>
                <td>0.361</td>
                <td>0.365</td>
                <td>0.391</td>
                <td>0.402</td>
              </tr>
            </tbody>
          </table>
          <p className="table-note">*** p {'<'} 0.01. Standard errors clustered at settlement level.</p>
        </div>

        <div className="robustness-item">
          <h4>3. Placebo Test</h4>
          <p>
            Demolition years were randomly assigned 500 times to generate a null distribution.
            The actual DiD estimates fell far in the left tail of all placebo distributions,
            confirming effects are unlikely due to random chance:
          </p>
          <PlaceboChart />
        </div>

        <div className="robustness-item">
          <h4>4. Heterogeneity Analysis</h4>
          <p>Spatial heterogeneity was examined through interaction terms:</p>
          <table className="data-table">
            <thead>
              <tr>
                <th>Factor</th>
                <th>Relationship</th>
                <th>R²</th>
                <th>p-value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Log-distance to city center</td>
                <td>Negative (stronger cooling in periphery)</td>
                <td>0.25</td>
                <td>{'<'} 0.01</td>
              </tr>
              <tr>
                <td>Log-settlement area</td>
                <td>No significant relationship</td>
                <td>0.004</td>
                <td>{'>'} 0.1</td>
              </tr>
            </tbody>
          </table>
          <HeterogeneityChart />
        </div>
      </section>

      <section className="method-section">
        <h3>Main Results Summary</h3>
        <table className="data-table results-table">
          <thead>
            <tr>
              <th>City</th>
              <th>Cooling Effect (K)</th>
              <th>Std. Error</th>
              <th>p-value</th>
              <th>95% CI</th>
              <th>R²</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>All Cities</td>
              <td><strong>-1.47</strong></td>
              <td>0.25</td>
              <td>{'<'} 0.01***</td>
              <td>[-1.97, -0.97]</td>
              <td>0.40</td>
            </tr>
            <tr>
              <td>Beijing</td>
              <td><strong>-3.04</strong></td>
              <td>0.37</td>
              <td>{'<'} 0.01***</td>
              <td>[-3.77, -2.30]</td>
              <td>0.87</td>
            </tr>
            <tr>
              <td>Shanghai</td>
              <td><strong>-1.09</strong></td>
              <td>0.27</td>
              <td>{'<'} 0.01***</td>
              <td>[-1.62, -0.56]</td>
              <td>0.75</td>
            </tr>
            <tr>
              <td>Guangzhou</td>
              <td><strong>-1.23</strong></td>
              <td>0.36</td>
              <td>{'<'} 0.05**</td>
              <td>[-1.95, -0.52]</td>
              <td>0.61</td>
            </tr>
          </tbody>
        </table>
        <p className="table-note">***, ** denote significance at 1% and 5% levels. Year and settlement fixed effects included.</p>
      </section>
    </div>
  );
}
