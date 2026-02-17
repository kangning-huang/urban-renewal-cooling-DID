import { useEffect, useMemo, useRef, useState } from 'react';
import { Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { GeoJsonLayer } from '@deck.gl/layers';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { SettlementsGeoJSON, CityMetadataMap, CitySelection } from '../types';

interface MapViewProps {
  settlements: SettlementsGeoJSON;
  cities: CityMetadataMap;
  selectedCity: CitySelection;
}

// Color schemes
const CONTROL_COLOR: [number, number, number, number] = [59, 130, 246, 180]; // Blue
const TREATMENT_COLOR: [number, number, number, number] = [239, 68, 68, 220]; // Red

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
          const baseColor = d.properties.demolished ? TREATMENT_COLOR : CONTROL_COLOR;
          if (isHovered) {
            return [baseColor[0], baseColor[1], baseColor[2], 255];
          }
          return baseColor;
        },
        getLineColor: (d: any) => {
          return d.properties.demolished ? [180, 30, 30, 255] : [30, 80, 180, 255];
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

    const { name, city, demolished, area_km2 } = feature.properties;
    return {
      name,
      city,
      status: demolished ? 'Demolished (Treatment)' : 'Not Demolished (Control)',
      area: area_km2 ? `${(area_km2 * 1000000).toFixed(0)} m²` : 'N/A',
    };
  }, [hoveredId, filteredFeatures]);

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
      {tooltipContent && (
        <div className="map-tooltip">
          <strong>{tooltipContent.name}</strong>
          <br />
          <span>City: {tooltipContent.city}</span>
          <br />
          <span>Status: {tooltipContent.status}</span>
          <br />
          <span>Area: {tooltipContent.area}</span>
        </div>
      )}
    </div>
  );
}
