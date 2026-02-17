import type { CitySelection } from '../types';

interface CitySelectorProps {
  selectedCity: CitySelection;
  onCityChange: (city: CitySelection) => void;
}

const CITIES: { value: CitySelection; label: string }[] = [
  { value: 'all', label: 'All Cities' },
  { value: 'Beijing', label: 'Beijing' },
  { value: 'Shanghai', label: 'Shanghai' },
  { value: 'Guangzhou', label: 'Guangzhou' },
];

export default function CitySelector({ selectedCity, onCityChange }: CitySelectorProps) {
  return (
    <div className="city-selector">
      <span className="selector-label">Select City:</span>
      <div className="city-buttons">
        {CITIES.map((city) => (
          <button
            key={city.value}
            className={`city-button ${selectedCity === city.value ? 'active' : ''}`}
            onClick={() => onCityChange(city.value)}
          >
            {city.label}
          </button>
        ))}
      </div>
    </div>
  );
}
