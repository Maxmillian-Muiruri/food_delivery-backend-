import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface OrsGeocodeFeature {
  properties: {
    label?: string;
    country?: string;
    region?: string;
    county?: string;
    locality?: string;
    neighbourhood?: string;
    street?: string;
    housenumber?: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface OrsGeocodeResponse {
  features: OrsGeocodeFeature[];
}

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Geocode an address using OpenRouteService
   */
  async geocodeAddress(address: string): Promise<{
    latitude: number;
    longitude: number;
    formattedAddress?: string;
    components?: {
      country?: string;
      region?: string;
      county?: string;
      locality?: string;
      neighbourhood?: string;
      street?: string;
      housenumber?: string;
    };
  } | null> {
    const apiKey = this.configService.get<string>('ORS_API_KEY');
    if (!apiKey) {
      this.logger.warn('ORS_API_KEY not configured, skipping geocoding');
      return null;
    }

    try {
      const response = await axios.get<OrsGeocodeResponse>(
        'https://api.openrouteservice.org/geocode/search',
        {
          params: {
            api_key: apiKey,
            text: address,
            size: 1, // Get only the best match
          },
          timeout: 5000,
        }
      );

      const features = response.data.features;
      if (!features || features.length === 0) {
        return null;
      }

      const feature = features[0];
      const [longitude, latitude] = feature.geometry.coordinates;

      return {
        latitude,
        longitude,
        formattedAddress: feature.properties.label,
        components: {
          country: feature.properties.country,
          region: feature.properties.region,
          county: feature.properties.county,
          locality: feature.properties.locality,
          neighbourhood: feature.properties.neighbourhood,
          street: feature.properties.street,
          housenumber: feature.properties.housenumber,
        },
      };
    } catch (error) {
      this.logger.error('ORS geocoding failed', error?.message ?? String(error));
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<{
    formattedAddress?: string;
    components?: {
      country?: string;
      region?: string;
      county?: string;
      locality?: string;
      neighbourhood?: string;
      street?: string;
      housenumber?: string;
    };
  } | null> {
    const apiKey = this.configService.get<string>('ORS_API_KEY');
    if (!apiKey) {
      this.logger.warn('ORS_API_KEY not configured, skipping reverse geocoding');
      return null;
    }

    try {
      const response = await axios.get<OrsGeocodeResponse>(
        'https://api.openrouteservice.org/geocode/reverse',
        {
          params: {
            api_key: apiKey,
            'point.lon': longitude,
            'point.lat': latitude,
            size: 1,
          },
          timeout: 5000,
        }
      );

      const features = response.data.features;
      if (!features || features.length === 0) {
        return null;
      }

      const feature = features[0];

      return {
        formattedAddress: feature.properties.label,
        components: {
          country: feature.properties.country,
          region: feature.properties.region,
          county: feature.properties.county,
          locality: feature.properties.locality,
          neighbourhood: feature.properties.neighbourhood,
          street: feature.properties.street,
          housenumber: feature.properties.housenumber,
        },
      };
    } catch (error) {
      this.logger.error('ORS reverse geocoding failed', error?.message ?? String(error));
      return null;
    }
  }

  /**
   * Search for locations using ORS autocomplete
   */
  async searchLocations(query: string, limit = 5): Promise<Array<{
    label: string;
    latitude: number;
    longitude: number;
    components?: {
      country?: string;
      region?: string;
      county?: string;
      locality?: string;
      neighbourhood?: string;
      street?: string;
      housenumber?: string;
    };
  }>> {
    const apiKey = this.configService.get<string>('ORS_API_KEY');
    if (!apiKey) {
      this.logger.warn('ORS_API_KEY not configured, returning mock results for development');
      return this.getMockLocationResults(query, limit);
    }

    try {
      const response = await axios.get<OrsGeocodeResponse>(
        'https://api.openrouteservice.org/geocode/autocomplete',
        {
          params: {
            api_key: apiKey,
            text: query,
            size: limit,
          },
          timeout: 8000, // Increased timeout
        }
      );

      const features = response.data.features || [];

      if (features.length === 0) {
        this.logger.warn(`No results found for query: ${query}, returning mock results`);
        return this.getMockLocationResults(query, limit);
      }

      return features.map(feature => {
        const [longitude, latitude] = feature.geometry.coordinates;
        return {
          label: feature.properties.label || '',
          latitude,
          longitude,
          components: {
            country: feature.properties.country,
            region: feature.properties.region,
            county: feature.properties.county,
            locality: feature.properties.locality,
            neighbourhood: feature.properties.neighbourhood,
            street: feature.properties.street,
            housenumber: feature.properties.housenumber,
          },
        };
      });
    } catch (error) {
      this.logger.error('ORS location search failed, returning mock results', error?.message ?? String(error));
      return this.getMockLocationResults(query, limit);
    }
  }

  /**
   * Get mock location results for development/fallback
   */
  private getMockLocationResults(query: string, limit: number): Array<{
    label: string;
    latitude: number;
    longitude: number;
    components?: {
      country?: string;
      region?: string;
      county?: string;
      locality?: string;
      neighbourhood?: string;
      street?: string;
      housenumber?: string;
    };
  }> {
    // Return some mock results based on the query
    const mockResults = [
      {
        label: `${query}, Nairobi, Kenya`,
        latitude: -1.2864,
        longitude: 36.8172,
        components: {
          country: 'Kenya',
          region: 'Nairobi County',
          locality: 'Nairobi',
        },
      },
      {
        label: `${query}, Mombasa, Kenya`,
        latitude: -4.0435,
        longitude: 39.6682,
        components: {
          country: 'Kenya',
          region: 'Mombasa County',
          locality: 'Mombasa',
        },
      },
      {
        label: `${query}, Kisumu, Kenya`,
        latitude: -0.0917,
        longitude: 34.7680,
        components: {
          country: 'Kenya',
          region: 'Kisumu County',
          locality: 'Kisumu',
        },
      },
    ];

    return mockResults.slice(0, limit);
  }
}
