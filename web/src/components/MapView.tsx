import { useEffect, useMemo, useRef, useState } from 'react';
import { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GeoJsonLayer } from '@deck.gl/layers';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { scaleSequential } from 'd3-scale';
import { interpolateYlOrRd } from 'd3-scale-chromatic';
import type { SettlementsGeoJSON, CityMetadataMap, CitySelection } from '../types';

interface MapViewProps {
  settlements: SettlementsGeoJSON;
  cities: CityMetadataMap;
  selectedCity: CitySelection;
}

// Color schemes
const CONTROL_COLOR: [number, number, number, number] = [64, 224, 208, 200]; // Cyan/turquoise for control (matching paper figure)

// Year range for color scale (2004-2022)
const MIN_YEAR = 2004;
const MAX_YEAR = 2022;

// Create color scale for treatment year (yellow to red)
const yearColorScale = scaleSequential(interpolateYlOrRd)
  .domain([MIN_YEAR, MAX_YEAR]);

// Convert d3 color string to RGBA array
function getYearColor(year: number, alpha: number = 220): [number, number, number, number] {
  const clampedYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
  const colorStr = yearColorScale(clampedYear);
  // Parse rgb(r, g, b) string
  const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3]), alpha];
  }
  return [255, 200, 0, alpha]; // Fallback yellow
}

export default function MapView({ settlements, cities, selectedCity }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const overlay = useRef<MapboxOverlay | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter settlements by city
  const filteredFeatures = useMemo(() => {
    if (selectedCity === 'all') {
      return settlements.features;
    }
    return settlements.features.filter(
      (f) => f.properties.city === selectedCity
    );
  }, [settlements, selectedCity]);

  // Create deck.gl layer
  const layers = useMemo(() => {
    return [
      new GeoJsonLayer({
        id: 'settlements',
        data: {
          type: 'FeatureCollection',
          features: filteredFeatures,
        },
        pickable: true,
        stroked: true,
        filled: true,
        extruded: false,
        lineWidthMinPixels: 1,
        getFillColor: (d: any) => {
          const isHovered = d.properties.id === hoveredId;
          const alpha = isHovered ? 255 : 200;

          if (d.properties.demolished && d.properties.treatment_year) {
            // Use year-based color scale (yellow to red)
            return getYearColor(d.properties.treatment_year, alpha);
          }
          // Control group uses cyan
          return isHovered
            ? [CONTROL_COLOR[0], CONTROL_COLOR[1], CONTROL_COLOR[2], 255]
            : CONTROL_COLOR;
        },
        getLineColor: (d: any) => {
          if (d.properties.demolished && d.properties.treatment_year) {
            const baseColor = getYearColor(d.properties.treatment_year, 255);
            // Darker border
            return [
              Math.max(0, baseColor[0] - 50),
              Math.max(0, baseColor[1] - 50),
              Math.max(0, baseColor[2] - 50),
              255
            ];
          }
          return [0, 128, 128, 255]; // Teal border for control
        },
        getLineWidth: 2,
        updateTriggers: {
          getFillColor: [hoveredId],
        },
        onHover: (info: any) => {
          if (info.object) {
            setHoveredId(info.object.properties.id);
          } else {
            setHoveredId(null);
          }
        },
      }),
    ];
  }, [filteredFeatures, hoveredId]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [116.4, 31.2],
      zoom: 4,
    });

    overlay.current = new MapboxOverlay({
      layers: [],
    });

    map.current.on('load', () => {
      if (map.current && overlay.current) {
        map.current.addControl(overlay.current as any);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update layers
  useEffect(() => {
    if (overlay.current) {
      overlay.current.setProps({ layers });
    }
  }, [layers]);

  // Update view when city selection changes
  useEffect(() => {
    if (!map.current) return;

    if (selectedCity === 'all') {
      // Fit to all cities in China
      map.current.flyTo({
        center: [116.4, 31.2],
        zoom: 4,
        duration: 1000,
      });
    } else {
      const cityData = cities[selectedCity];
      if (cityData) {
        map.current.flyTo({
          center: cityData.center,
          zoom: cityData.zoom,
          duration: 1000,
        });
      }
    }
  }, [selectedCity, cities]);

  // Tooltip content
  const tooltipContent = useMemo(() => {
    if (!hoveredId) return null;
    const feature = filteredFeatures.find((f) => f.properties.id === hoveredId);
    if (!feature) return null;

    const { name, city, demolished, treatment_year, area_km2 } = feature.properties;
    return {
      name,
      city,
      status: demolished ? 'Demolished (Treatment)' : 'Informal Settlement (Control)',
      demolitionYear: treatment_year,
      area: area_km2 ? `${(area_km2 * 1000000).toFixed(0)} m²` : 'N/A',
    };
  }, [hoveredId, filteredFeatures]);

  return (
    <div className="map-wrapper">
      <div className="map-container">
        <div ref={mapContainer} className="map" />

        {tooltipContent && (
          <div className="map-tooltip">
            <strong>{tooltipContent.name}</strong>
            <br />
            <span>City: {tooltipContent.city}</span>
            <br />
            <span>Status: {tooltipContent.status}</span>
            {tooltipContent.demolitionYear && (
              <>
                <br />
                <span>Demolished: {tooltipContent.demolitionYear}</span>
              </>
            )}
            <br />
            <span>Area: {tooltipContent.area}</span>
          </div>
        )}
      </div>

      {/* Legend below map */}
      <div className="map-legend">
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: `rgb(${CONTROL_COLOR[0]}, ${CONTROL_COLOR[1]}, ${CONTROL_COLOR[2]})` }}
          />
          <span className="legend-label">Informal Settlements</span>
        </div>
        <div className="legend-item legend-gradient">
          <span className="legend-label">Demolished:</span>
          <span className="gradient-year">{MIN_YEAR}</span>
          <div className="gradient-bar" />
          <span className="gradient-year">{MAX_YEAR}</span>
        </div>
      </div>
    </div>
  );
}
