import React, { useEffect, useState } from 'react';

// Type definitions
interface AssistantResponse {
  role: 'assistant';
  content: string;
}

interface LocationData {
  name: string;
  description: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

type Geometry = {
  type: 'Point';
  coordinates: [number, number];
};

type Feature = {
  type: 'Feature';
  geometry: Geometry;
  properties: {
    name: string;
    description: string;
    address?: string;
  };
};

type FeatureCollection = {
  type: 'FeatureCollection';
  features: Feature[];
};

// Mistral tool definition for location extraction
const locationTool = {
  type: 'function',
  function: {
    name: 'report_geojson_locations',
    description:
      'Extract geographic locations with their contextual descriptions',
    parameters: {
      type: 'object',
      properties: {
        locations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
            },
            required: ['name', 'description'],
          },
        },
      },
      required: ['locations'],
    },
  },
};

const useGeoJSONGenerator = ({
  assistantResponse,
}: {
  assistantResponse: AssistantResponse;
}) => {
  const [featureCollection, setFeatureCollection] =
    useState<FeatureCollection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Reset retry counter when input changes
  useEffect(() => {
    setRetryCount(0);
  }, [featureCollection]);

  useEffect(() => {
    const processResponse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Step 1: Extract locations using Mistral function calling
        const locations = await extractLocations(assistantResponse.content);

        // Step 2: Geocode locations with individual error handling
        const features = await Promise.all(
          locations.map(async (location) => {
            try {
              const coords = await geocodeLocation(location.name);
              return createGeoJSONFeature(coords, location);
            } catch (err) {
              console.error(`Geocoding failed for ${location.name}:`, err);
              return null;
            }
          }),
        );

        // Step 3: Construct FeatureCollection
        const validFeatures = features.filter(Boolean) as Feature[];
        const tempFeatureCollection: FeatureCollection = {
          type: 'FeatureCollection',
          features: validFeatures,
        };

        // Validate GeoJSON structure
        if (!isValidGeoJSON(tempFeatureCollection)) {
          if (retryCount < maxRetries) {
            setRetryCount((prev) => prev + 1);
            return;
          }
          throw new Error(
            `Maximum retries (${maxRetries}) exceeded - could not generate valid GeoJSON`,
          );
        }

        setFeatureCollection(tempFeatureCollection);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to process response',
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (assistantResponse?.content) {
      processResponse();
    }
  }, [featureCollection, retryCount]);

  // GeoJSON validation function
  const isValidGeoJSON = (fc: FeatureCollection): boolean => {
    try {
      if (fc.type !== 'FeatureCollection') return false;
      if (!Array.isArray(fc.features) || fc.features.length === 0) return false;

      for (const feature of fc.features) {
        if (feature.type !== 'Feature') return false;
        if (feature.geometry.type !== 'Point') return false;
        if (!Array.isArray(feature.geometry.coordinates)) return false;
        if (feature.geometry.coordinates.length !== 2) return false;
        if (
          typeof feature.geometry.coordinates[0] !== 'number' ||
          typeof feature.geometry.coordinates[1] !== 'number'
        ) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  // Helper functions
  const extractLocations = async (content: string): Promise<LocationData[]> => {
    try {
      // Mock Mistral API call - replace with actual implementation
      const mockResponse = {
        tool_calls: [
          {
            function: {
              arguments: JSON.stringify({
                locations: [
                  {
                    name: 'Eiffel Tower',
                    description: 'Iconic landmark in Paris',
                  },
                  {
                    name: 'Statue of Liberty',
                    description: 'Famous monument in New York',
                  },
                ],
              }),
            },
          },
        ],
      };

      // In real implementation:
      // const response = await mistral.chat.completions.create({
      //   model: 'mistral-large-latest',
      //   messages: [{ role: 'user', content }],
      //   tools: [locationTool]
      // });

      return JSON.parse(mockResponse.tool_calls[0].function.arguments)
        .locations;
    } catch (err) {
      throw new Error(
        `Failed to extract locations from response: ${err.message}`,
      );
    }
  };

  const geocodeLocation = async (query: string): Promise<[number, number]> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json`,
        {
          headers: {
            'User-Agent': 'redAtlas/1.0 ',
          },
        },
      );

      if (!response.ok) throw new Error('Geocoding API failed');
      const data: NominatimResponse[] = await response.json();

      if (data.length === 0) throw new Error('No coordinates found');
      if (data.length > 1)
        throw new Error('Ambiguous location - multiple results');

      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } catch (err) {
      throw new Error(
        `Geocoding failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    }
  };

  const createGeoJSONFeature = (
    coords: [number, number],
    location: LocationData,
  ): Feature => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: coords,
    },
    properties: {
      name: location.name,
      description: location.description,
    },
  });

  return [featureCollection, isLoading];
};
export default useGeoJSONGenerator;
