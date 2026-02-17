#!/usr/bin/env python3
"""
Prepare web data from raw shapefiles and panel data for the interactive website.
Outputs GeoJSON files for settlements and JSON for regression results.
"""

import geopandas as gpd
import pandas as pd
import json
import os
from pathlib import Path

# Paths
DATA_DIR = Path("/Users/kangninghuang/Library/CloudStorage/GoogleDrive-kh3657@nyu.edu/My Drive/Research_Projects/2026_UHI_deslum")
OUTPUT_DIR = Path("/Users/kangninghuang/Documents/repos/urban-renewal-cooling-DID/web/public/data")

def load_settlements():
    """Load all settlement shapefiles and combine into GeoJSON."""
    settlements = []

    # City configurations
    cities = {
        'Beijing': {
            'code': 'BJ',
            'slums_path': DATA_DIR / 'Data_local/slums_polygons_2023/city_slums_shp/BJ/BJ_slum_2023.shp',
            'deslums_path': DATA_DIR / 'Data_local/slums_polygons_2023/de_slums_shp/BJ/BJ_de_slums.shp',
            'center': [116.4074, 39.9042],
            'zoom': 10
        },
        'Shanghai': {
            'code': 'SH',
            'slums_path': DATA_DIR / 'Data_local/slums_polygons_2023/city_slums_shp/SH/SH_slum_2023.shp',
            'deslums_path': DATA_DIR / 'Data_local/slums_polygons_2023/de_slums_shp/SH/SH_de_slums.shp',
            'center': [121.4737, 31.2304],
            'zoom': 10
        },
        'Guangzhou': {
            'code': 'GZ',
            'slums_path': None,  # Will use combined gpkg
            'deslums_path': DATA_DIR / 'Data_local/slums_polygons_2023/de_slums_shp/GZ/GZ_de_slums.shp',
            'gpkg_path': DATA_DIR / 'Data_local/slums_polygons_2023/GZ_combined_slums.gpkg',
            'center': [113.2644, 23.1291],
            'zoom': 10
        }
    }

    all_features = []
    city_metadata = {}

    for city_name, config in cities.items():
        print(f"Processing {city_name}...")
        city_features = []

        # Load slums (control group)
        if config.get('gpkg_path'):
            # Guangzhou uses combined gpkg
            slums_gdf = gpd.read_file(config['gpkg_path'])
            slums_gdf = slums_gdf.to_crs(epsg=4326)
        else:
            slums_gdf = gpd.read_file(config['slums_path'])
            slums_gdf = slums_gdf.to_crs(epsg=4326)

        for idx, row in slums_gdf.iterrows():
            centroid = row.geometry.centroid
            feature = {
                'type': 'Feature',
                'geometry': json.loads(row.geometry.to_json()) if hasattr(row.geometry, 'to_json') else row.geometry.__geo_interface__,
                'properties': {
                    'id': f"{config['code']}_slum_{idx}",
                    'name': str(row.get('Name', f'Settlement {idx}')),
                    'city': city_name,
                    'type': 'control',
                    'demolished': False,
                    'area_km2': row.get('Shape_Area', 0) / 1e6 if row.get('Shape_Area') else None,
                    'centroid': [centroid.x, centroid.y]
                }
            }
            city_features.append(feature)

        # Load de-slums (treatment group)
        try:
            deslums_gdf = gpd.read_file(config['deslums_path'])
            deslums_gdf = deslums_gdf.to_crs(epsg=4326)

            for idx, row in deslums_gdf.iterrows():
                centroid = row.geometry.centroid
                feature = {
                    'type': 'Feature',
                    'geometry': json.loads(row.geometry.to_json()) if hasattr(row.geometry, 'to_json') else row.geometry.__geo_interface__,
                    'properties': {
                        'id': f"{config['code']}_deslum_{idx}",
                        'name': str(row.get('Name', f'Demolished {idx}')),
                        'city': city_name,
                        'type': 'treatment',
                        'demolished': True,
                        'area_km2': row.get('Shape_Area', 0) / 1e6 if row.get('Shape_Area') else None,
                        'centroid': [centroid.x, centroid.y]
                    }
                }
                city_features.append(feature)
        except Exception as e:
            print(f"  Warning: Could not load de-slums for {city_name}: {e}")

        all_features.extend(city_features)

        # Calculate city bounds
        all_city_gdf = gpd.GeoDataFrame.from_features(city_features)
        bounds = all_city_gdf.total_bounds  # [minx, miny, maxx, maxy]

        city_metadata[city_name] = {
            'code': config['code'],
            'center': config['center'],
            'zoom': config['zoom'],
            'bounds': bounds.tolist(),
            'slums_count': len([f for f in city_features if not f['properties']['demolished']]),
            'deslums_count': len([f for f in city_features if f['properties']['demolished']])
        }

        print(f"  Loaded {city_metadata[city_name]['slums_count']} slums, {city_metadata[city_name]['deslums_count']} de-slums")

    # Create GeoJSON FeatureCollection
    geojson = {
        'type': 'FeatureCollection',
        'features': all_features
    }

    return geojson, city_metadata


def load_panel_data():
    """Load panel data and compute parallel trends coefficients."""
    panel_path = DATA_DIR / 'Data_local/DID Calculation Data/panel.dta'
    df = pd.read_stata(panel_path)

    print(f"Panel data shape: {df.shape}")
    print(f"Columns: {df.columns.tolist()}")

    # Compute relative time to treatment
    df['rel_time'] = df['year'] - df['treatment_year']

    # Identify treated vs control
    df['treated'] = df['treatment_year'].notna()

    # For parallel trends, we need the mean LST by relative time for treated group
    # This is a simplified version - the actual DiD coefficients would need proper regression

    # Get treated observations only
    treated = df[df['treated']].copy()

    # Group by relative time and compute mean LST
    parallel_trends = treated.groupby('rel_time')['Y'].agg(['mean', 'std', 'count']).reset_index()
    parallel_trends.columns = ['rel_time', 'mean_lst', 'std_lst', 'n']

    # Filter to reasonable range (-7 to +7 years as in Figure 2)
    parallel_trends = parallel_trends[(parallel_trends['rel_time'] >= -7) & (parallel_trends['rel_time'] <= 7)]

    # Compute 90% CI (1.645 * SE)
    parallel_trends['se'] = parallel_trends['std_lst'] / (parallel_trends['n'] ** 0.5)
    parallel_trends['ci_lower'] = parallel_trends['mean_lst'] - 1.645 * parallel_trends['se']
    parallel_trends['ci_upper'] = parallel_trends['mean_lst'] + 1.645 * parallel_trends['se']

    return parallel_trends


def create_regression_results():
    """Create regression results data from paper Table 2 and Figure 2."""

    # DiD coefficients from Table 2 (paper results)
    did_results = {
        'all': {
            'effect': -1.47,
            'se': 0.25,
            'p_value': 0.01,
            'ci_lower': -1.97,
            'ci_upper': -0.97,
            'r2': 0.40
        },
        'Beijing': {
            'effect': -3.04,
            'se': 0.37,
            'p_value': 0.01,
            'ci_lower': -3.77,
            'ci_upper': -2.30,
            'r2': 0.87
        },
        'Shanghai': {
            'effect': -1.09,
            'se': 0.27,
            'p_value': 0.01,
            'ci_lower': -1.62,
            'ci_upper': -0.56,
            'r2': 0.75
        },
        'Guangzhou': {
            'effect': -1.23,
            'se': 0.36,
            'p_value': 0.05,
            'ci_lower': -1.95,
            'ci_upper': -0.52,
            'r2': 0.61
        }
    }

    # Parallel trends data (approximated from Figure 2 in paper)
    # These are the coefficient estimates relative to year -1
    parallel_trends = {
        'all': [
            {'year': -7, 'coef': 0.2, 'ci_lower': -0.8, 'ci_upper': 1.2},
            {'year': -6, 'coef': -0.8, 'ci_lower': -1.8, 'ci_upper': 0.2},
            {'year': -5, 'coef': -0.3, 'ci_lower': -1.3, 'ci_upper': 0.7},
            {'year': -4, 'coef': -0.2, 'ci_lower': -1.2, 'ci_upper': 0.8},
            {'year': -3, 'coef': -0.5, 'ci_lower': -1.5, 'ci_upper': 0.5},
            {'year': -2, 'coef': -0.3, 'ci_lower': -1.3, 'ci_upper': 0.7},
            {'year': -1, 'coef': 0, 'ci_lower': 0, 'ci_upper': 0},  # Reference
            {'year': 0, 'coef': -0.8, 'ci_lower': -1.8, 'ci_upper': 0.2},
            {'year': 1, 'coef': -2.19, 'ci_lower': -3.2, 'ci_upper': -1.2},
            {'year': 2, 'coef': -1.5, 'ci_lower': -2.5, 'ci_upper': -0.5},
            {'year': 3, 'coef': -1.3, 'ci_lower': -2.3, 'ci_upper': -0.3},
            {'year': 4, 'coef': -1.5, 'ci_lower': -2.5, 'ci_upper': -0.5},
            {'year': 5, 'coef': -1.8, 'ci_lower': -2.8, 'ci_upper': -0.8},
            {'year': 6, 'coef': -2.0, 'ci_lower': -3.0, 'ci_upper': -1.0},
            {'year': 7, 'coef': -2.0, 'ci_lower': -3.0, 'ci_upper': -1.0},
        ],
        'Beijing': [
            {'year': -7, 'coef': 0.5, 'ci_lower': -1.5, 'ci_upper': 2.5},
            {'year': -6, 'coef': 0.0, 'ci_lower': -2.0, 'ci_upper': 2.0},
            {'year': -5, 'coef': 0.3, 'ci_lower': -1.7, 'ci_upper': 2.3},
            {'year': -4, 'coef': 0.0, 'ci_lower': -2.0, 'ci_upper': 2.0},
            {'year': -3, 'coef': -0.5, 'ci_lower': -2.5, 'ci_upper': 1.5},
            {'year': -2, 'coef': 0.0, 'ci_lower': -2.0, 'ci_upper': 2.0},
            {'year': -1, 'coef': 0, 'ci_lower': 0, 'ci_upper': 0},
            {'year': 0, 'coef': -1.5, 'ci_lower': -3.5, 'ci_upper': 0.5},
            {'year': 1, 'coef': -2.5, 'ci_lower': -4.5, 'ci_upper': -0.5},
            {'year': 2, 'coef': -3.0, 'ci_lower': -5.0, 'ci_upper': -1.0},
            {'year': 3, 'coef': -3.2, 'ci_lower': -5.2, 'ci_upper': -1.2},
            {'year': 4, 'coef': -3.5, 'ci_lower': -5.5, 'ci_upper': -1.5},
            {'year': 5, 'coef': -3.8, 'ci_lower': -5.8, 'ci_upper': -1.8},
            {'year': 6, 'coef': -4.0, 'ci_lower': -6.0, 'ci_upper': -2.0},
            {'year': 7, 'coef': -3.8, 'ci_lower': -5.8, 'ci_upper': -1.8},
        ],
        'Shanghai': [
            {'year': -7, 'coef': 0.5, 'ci_lower': -1.5, 'ci_upper': 2.5},
            {'year': -6, 'coef': 0.3, 'ci_lower': -1.7, 'ci_upper': 2.3},
            {'year': -5, 'coef': 0.0, 'ci_lower': -2.0, 'ci_upper': 2.0},
            {'year': -4, 'coef': -0.3, 'ci_lower': -2.3, 'ci_upper': 1.7},
            {'year': -3, 'coef': 0.0, 'ci_lower': -2.0, 'ci_upper': 2.0},
            {'year': -2, 'coef': 0.2, 'ci_lower': -1.8, 'ci_upper': 2.2},
            {'year': -1, 'coef': 0, 'ci_lower': 0, 'ci_upper': 0},
            {'year': 0, 'coef': -0.5, 'ci_lower': -2.5, 'ci_upper': 1.5},
            {'year': 1, 'coef': -1.2, 'ci_lower': -3.2, 'ci_upper': 0.8},
            {'year': 2, 'coef': -1.0, 'ci_lower': -3.0, 'ci_upper': 1.0},
            {'year': 3, 'coef': -1.5, 'ci_lower': -3.5, 'ci_upper': 0.5},
            {'year': 4, 'coef': -1.3, 'ci_lower': -3.3, 'ci_upper': 0.7},
            {'year': 5, 'coef': -1.8, 'ci_lower': -3.8, 'ci_upper': 0.2},
            {'year': 6, 'coef': -1.5, 'ci_lower': -3.5, 'ci_upper': 0.5},
            {'year': 7, 'coef': -2.0, 'ci_lower': -4.0, 'ci_upper': 0.0},
        ],
        'Guangzhou': [
            {'year': -7, 'coef': 1.0, 'ci_lower': -2.0, 'ci_upper': 4.0},
            {'year': -6, 'coef': 0.5, 'ci_lower': -2.5, 'ci_upper': 3.5},
            {'year': -5, 'coef': 0.0, 'ci_lower': -3.0, 'ci_upper': 3.0},
            {'year': -4, 'coef': -0.5, 'ci_lower': -3.5, 'ci_upper': 2.5},
            {'year': -3, 'coef': 0.0, 'ci_lower': -3.0, 'ci_upper': 3.0},
            {'year': -2, 'coef': 0.3, 'ci_lower': -2.7, 'ci_upper': 3.3},
            {'year': -1, 'coef': 0, 'ci_lower': 0, 'ci_upper': 0},
            {'year': 0, 'coef': -0.8, 'ci_lower': -3.8, 'ci_upper': 2.2},
            {'year': 1, 'coef': -1.5, 'ci_lower': -4.5, 'ci_upper': 1.5},
            {'year': 2, 'coef': -0.8, 'ci_lower': -3.8, 'ci_upper': 2.2},
            {'year': 3, 'coef': -0.5, 'ci_lower': -3.5, 'ci_upper': 2.5},
            {'year': 4, 'coef': -0.3, 'ci_lower': -3.3, 'ci_upper': 2.7},
            {'year': 5, 'coef': -0.8, 'ci_lower': -3.8, 'ci_upper': 2.2},
            {'year': 6, 'coef': -1.5, 'ci_lower': -4.5, 'ci_upper': 1.5},
            {'year': 7, 'coef': -2.5, 'ci_lower': -5.5, 'ci_upper': 0.5},
        ]
    }

    return {
        'did_coefficients': did_results,
        'parallel_trends': parallel_trends
    }


def main():
    print("Preparing web data...")

    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load and save settlements GeoJSON
    print("\n1. Processing settlement polygons...")
    geojson, city_metadata = load_settlements()

    with open(OUTPUT_DIR / 'settlements.geojson', 'w') as f:
        json.dump(geojson, f)
    print(f"   Saved {len(geojson['features'])} features to settlements.geojson")

    # Save city metadata
    with open(OUTPUT_DIR / 'cities.json', 'w') as f:
        json.dump(city_metadata, f, indent=2)
    print(f"   Saved city metadata to cities.json")

    # Create and save regression results
    print("\n2. Creating regression results...")
    regression_data = create_regression_results()

    with open(OUTPUT_DIR / 'regression_results.json', 'w') as f:
        json.dump(regression_data, f, indent=2)
    print("   Saved regression results to regression_results.json")

    print("\nDone! Data files saved to:", OUTPUT_DIR)


if __name__ == '__main__':
    main()
