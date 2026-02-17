# Urban Renewal Cooling Effect - Interactive Visualization

Interactive web visualization showing the causal effect of demolishing informal settlements on urban surface temperatures, based on difference-in-differences (DiD) analysis across Beijing, Shanghai, and Guangzhou (2002-2022).

**Live Demo:** [https://kangning-huang.github.io/urban-renewal-cooling-DID/](https://kangning-huang.github.io/urban-renewal-cooling-DID/)

## About the Research

This visualization accompanies the paper:

> Sun, Y., Gao, X., Liang, J., & Huang, K. (2025). *Unveiling Causality: Does Demolishing Informal Settlements Cause Urban Surface Cooling?*
>
> DOI: [10.21203/rs.3.rs-7288639/v1](https://doi.org/10.21203/rs.3.rs-7288639/v1)

### Key Findings

Using a difference-in-differences framework with 77 demolished informal settlements and 584 control sites:

| City | Cooling Effect | 95% CI | R² |
|------|----------------|--------|-----|
| All Cities | -1.47 K | [-1.97, -0.97] | 0.40 |
| Beijing | -3.04 K | [-3.77, -2.30] | 0.87 |
| Shanghai | -1.09 K | [-1.62, -0.56] | 0.75 |
| Guangzhou | -1.23 K | [-1.95, -0.52] | 0.61 |

## Features

- **Interactive Map**: View locations of informal settlements (control) and demolished settlements (treatment) across three major Chinese cities
- **City Selection**: Filter by city or view all cities together
- **DiD Regression Results**: Visualize parallel trends and coefficient estimates
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React** + **TypeScript** - UI framework
- **Vite** - Build tool
- **MapLibre GL** + **deck.gl** - Map visualization
- **Recharts** - Chart visualization
- **GitHub Pages** - Hosting

## Development

```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Data Sources

- Settlement polygons: Manually digitized from high-resolution satellite imagery and government policy documents
- Land Surface Temperature: Landsat thermal imagery (2002-2022) via Google Earth Engine
- Control variables: China Stock Market & Accounting Research Database (CSMAR)

## License

This project is licensed under the MIT License.

## Citation

If you use this visualization or the underlying research, please cite:

```bibtex
@article{sun2025unveiling,
  title={Unveiling Causality: Does Demolishing Informal Settlements Cause Urban Surface Cooling?},
  author={Sun, Yujie and Gao, Xuyan and Liang, Jiayong and Huang, Kangning},
  journal={Research Square Preprint},
  year={2025},
  doi={10.21203/rs.3.rs-7288639/v1}
}
```
