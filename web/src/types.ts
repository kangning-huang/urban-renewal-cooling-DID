// Type definitions for the Urban Renewal Cooling DID visualization

export interface Settlement {
  id: string;
  name: string;
  city: string;
  type: 'control' | 'treatment';
  demolished: boolean;
  area_km2: number | null;
  centroid: [number, number];
}

export interface SettlementFeature {
  type: 'Feature';
  geometry: GeoJSON.Geometry;
  properties: Settlement;
}

export interface SettlementsGeoJSON {
  type: 'FeatureCollection';
  features: SettlementFeature[];
}

export interface CityMetadata {
  code: string;
  center: [number, number];
  zoom: number;
  bounds: [number, number, number, number]; // [minx, miny, maxx, maxy]
  slums_count: number;
  deslums_count: number;
}

export interface CityMetadataMap {
  [cityName: string]: CityMetadata;
}

export interface DIDResult {
  effect: number;
  se: number;
  p_value: number;
  ci_lower: number;
  ci_upper: number;
  r2: number;
}

export interface ParallelTrendPoint {
  year: number;
  coef: number;
  ci_lower: number;
  ci_upper: number;
}

export interface RegressionResults {
  did_coefficients: {
    all: DIDResult;
    Beijing: DIDResult;
    Shanghai: DIDResult;
    Guangzhou: DIDResult;
  };
  parallel_trends: {
    all: ParallelTrendPoint[];
    Beijing: ParallelTrendPoint[];
    Shanghai: ParallelTrendPoint[];
    Guangzhou: ParallelTrendPoint[];
  };
}

export type CitySelection = 'all' | 'Beijing' | 'Shanghai' | 'Guangzhou';
