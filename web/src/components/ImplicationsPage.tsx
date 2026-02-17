export default function ImplicationsPage() {
  return (
    <div className="page-content">
      <h2>Policy Implications</h2>

      <section className="implication-section">
        <h3>Key Finding: Causal Cooling Effect</h3>
        <p>
          This study provides the <strong>first robust causal evidence</strong> that demolishing dense
          informal settlements leads to significant reductions in land surface temperatures. Using a
          difference-in-differences framework with 77 demolished settlements and 584 controls across
          Beijing, Shanghai, and Guangzhou (2002-2022), we found:
        </p>
        <ul className="key-points">
          <li>Average cooling effect of <strong>1.47 K</strong> across all cities</li>
          <li>Strongest effect in Beijing (<strong>3.04 K</strong>) due to semi-arid climate enhancing evapotranspiration</li>
          <li>Consistent effects in humid cities: Shanghai (1.09 K) and Guangzhou (1.23 K)</li>
        </ul>
      </section>

      <section className="implication-section">
        <h3>Local vs. City-Wide Effects</h3>
        <div className="highlight-box warning">
          <p>
            The cooling effects are <strong>mostly local</strong>. The total demolished area (~7.7 km²)
            represents less than 1% of city land—far below the 15-30% land-cover change threshold needed
            to shift city-wide temperatures.
          </p>
        </div>
        <p>
          City-wide temperature reductions require redevelopment to be orchestrated as part of a
          coherent greening and ventilation corridor strategy, rather than isolated demolition projects.
        </p>
        <p className="citation">
          Related research:{' '}
          <a href="https://doi.org/10.1021/acs.est.3c09108" target="_blank" rel="noopener noreferrer">
            Xu et al. (2024) - Green space coverage vs. spatial distribution
          </a>
        </p>
      </section>

      <section className="implication-section">
        <h3>Urban Renewal as Climate Adaptation</h3>
        <p>
          Informal settlement renewal can be reframed not just as land management or aesthetic improvement,
          but as a <strong>concrete strategy for climate adaptation</strong>. The observed cooling is
          consistent with Chinese planning regulations that mandate:
        </p>
        <ul className="regulation-list">
          <li>Minimum greenspace ratios (25-35%)</li>
          <li>Building spacing requirements for sunlight and ventilation</li>
          <li>Upper limits on building density</li>
        </ul>
        <p className="citation">
          Source:{' '}
          <a href="https://www.mohurd.gov.cn/" target="_blank" rel="noopener noreferrer">
            MHURD Standard for Urban Residential Areas (GB 50180-2018)
          </a>
        </p>
      </section>

      <section className="implication-section">
        <h3>Spatial Heterogeneity</h3>
        <p>
          Cooling effects are <strong>especially pronounced in peripheral urban areas</strong>, where
          redevelopment more often includes green space or open land. This distance-dependent pattern
          reflects land economics: lower peripheral land prices enable developers to reduce building
          coverage ratios, while central redevelopments prioritize higher density.
        </p>
        <p className="citation">
          Economic framework:{' '}
          <a href="https://mitpress.mit.edu/9780262514712/urban-economic-theory/" target="_blank" rel="noopener noreferrer">
            Fujita (1989) - Urban Economic Theory
          </a>
        </p>
      </section>

      <section className="implication-section">
        <h3>Equity Concerns</h3>
        <div className="highlight-box critical">
          <h4>The Cooling-Displacement Paradox</h4>
          <p>
            The thermal benefits of demolition are <strong>not automatic nor universally equitable</strong>.
            Without supportive policy frameworks, demolition risks displacing populations most vulnerable
            to heat, pushing them toward peripheral areas with worse access to jobs, infrastructure, and
            often more extreme environmental exposure.
          </p>
        </div>

        <div className="case-study">
          <h4>Evidence from Hangzhou</h4>
          <ul>
            <li>29.2% of displaced migrant workers spend over 30% of income on rent</li>
            <li>14.1% plan to return to rural areas due to housing pressures</li>
            <li>Relocation increases commute distances and durations significantly</li>
          </ul>
          <p className="citation">
            <a href="https://doi.org/10.1016/j.cities.2019.05.026" target="_blank" rel="noopener noreferrer">
              Zeng et al. (2019) - Urban village demolition and migrant housing in Hangzhou
            </a>
          </p>
        </div>

        <p>
          <strong>Policy solutions</strong> to address this paradox include:
        </p>
        <ul>
          <li>Inclusionary zoning requirements</li>
          <li>On-site affordable housing provisions</li>
          <li>Tenant protections ensuring displaced residents can return or remain nearby</li>
        </ul>
        <p className="citation">
          Policy frameworks:{' '}
          <a href="https://doi.org/10.1080/14649357.2020.1757891" target="_blank" rel="noopener noreferrer">
            Porter et al. (2020) - Climate justice in a climate changed world
          </a>
          ;{' '}
          <a href="https://doi.org/10.1080/02697459.2015.1008793" target="_blank" rel="noopener noreferrer">
            Mukhija et al. (2015) - Tradeoffs of inclusionary zoning
          </a>
        </p>
      </section>

      <section className="implication-section">
        <h3>Global South Relevance</h3>
        <p>
          While this study centers on China, the findings carry broader relevance for the Global South,
          where cities face similar trade-offs between cooling dense settlements and protecting vulnerable
          populations. Informal settlements in many cities exhibit similar characteristics:
        </p>
        <div className="global-examples">
          <div className="example">
            <strong>Nairobi's Kibera</strong>
            <span>Extreme density, poor ventilation</span>
          </div>
          <div className="example">
            <strong>Mumbai's Dharavi</strong>
            <span>Impervious materials, high thermal exposure</span>
          </div>
          <div className="example">
            <strong>São Paulo's Favelas</strong>
            <span>Limited green space, narrow alleys</span>
          </div>
        </div>
        <p>
          However, many cities lack governance capacity for resettlement or compensation. In these cases,
          <strong> in-situ upgrading</strong>—through green buffers, cool roofs, or ventilation corridors—may
          be more feasible and socially sustainable.
        </p>
        <p className="citation">
          Cool roofs research:{' '}
          <a href="https://doi.org/10.1016/j.rser.2022.112183" target="_blank" rel="noopener noreferrer">
            Nutkiewicz et al. (2022) - Cool roofs for informal settlement dwellers
          </a>
        </p>
      </section>

      <section className="implication-section">
        <h3>Future Research Directions</h3>
        <ol className="future-directions">
          <li>
            <strong>Ground-truth validation:</strong> Link LST changes to physiological heat exposure
            (core body temperature, heat-related morbidity) and behavioral adaptation patterns
          </li>
          <li>
            <strong>Health outcomes:</strong> Integrate wearable temperature sensors or survey residents
            about heat-related symptoms
          </li>
          <li>
            <strong>Alternative interventions:</strong> Apply DiD framework to evaluate cool roofs,
            tree planting, and green infrastructure programs
          </li>
          <li>
            <strong>Policy evolution:</strong> As China shifts toward incremental "micro-renewal"
            approaches, evaluate which strategies yield greatest thermal relief with least social disruption
          </li>
        </ol>
        <p className="citation">
          Health-climate linkages:{' '}
          <a href="https://doi.org/10.1016/S0140-6736(21)01787-6" target="_blank" rel="noopener noreferrer">
            Romanello et al. (2021) - Lancet Countdown on health and climate change
          </a>
        </p>
      </section>

      <section className="implication-section conclusion">
        <h3>Conclusion</h3>
        <p>
          Urban climate adaptation strategies should treat informal settlements not just as risks to
          be managed, but as <strong>opportunities for transformative, inclusive change</strong>.
          For cooling benefits to translate into broader urban resilience, demolition must be accompanied
          by policies that mitigate social displacement and ensure vulnerable populations share in
          environmental gains.
        </p>
      </section>
    </div>
  );
}
