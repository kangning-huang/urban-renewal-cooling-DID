import type { CitySelection } from '../types';

interface CitySelectorProps {
  selectedCity: CitySelection;
  onCityChange: (city: CitySelection) => void;
}

const CITIES: { value: CitySelection; label: string; emoji: string }[] = [
  { value: 'all', label: 'All Cities', emoji: '🇨🇳' },
  { value: 'Beijing', label: 'Beijing', emoji: '🏮' },
  { value: 'Shanghai', label: 'Shanghai', emoji: '🗼' },
  { value: 'Guangzhou', label: 'Guangzhou', emoji: '🐏' },
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
            <span className="city-emoji">{city.emoji}</span>
            <span className="city-name">{city.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
