import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Map from '../../components/Map';

// Mock the Google Maps Loader
vi.mock('@googlemaps/js-api-loader', () => ({
  Loader: class {
    load() {
      return Promise.resolve();
    }
  }
}));

// Mock the global google object
const mockMap = {
  Map: vi.fn(),
  Marker: vi.fn(),
  DirectionsRenderer: vi.fn(),
  SymbolPath: {
    CIRCLE: 0,
    BACKWARD_CLOSED_ARROW: 0
  }
};

global.google = {
  maps: mockMap
} as any;

describe('Map Component', () => {
  const mockProps = {
    userLocation: { lat: 0, lng: 0 },
    spots: [],
    selectedSpot: null,
    onSpotSelect: vi.fn()
  };

  it('renders loading state initially', () => {
    render(<Map {...mockProps} />);
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('initializes map with correct props', () => {
    render(<Map {...mockProps} />);
    expect(mockMap.Map).toHaveBeenCalled();
  });
});