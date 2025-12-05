import { Controller, Get, Query, Logger } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  private readonly logger = new Logger(LocationsController.name);

  constructor(private readonly locationsService: LocationsService) {}

  @Get('search')
  async searchLocations(
    @Query('q') query: string,
    @Query('limit') limit?: string,
  ) {
    if (!query || query.trim().length < 2) {
      return { results: [] };
    }

    const limitNum = limit ? parseInt(limit, 10) : 5;
    const results = await this.locationsService.searchLocations(
      query.trim(),
      Math.min(limitNum, 10), // Max 10 results
    );

    return { results };
  }

  @Get('geocode')
  async geocodeAddress(@Query('address') address: string) {
    if (!address || address.trim().length < 3) {
      return { error: 'Address query too short' };
    }

    const result = await this.locationsService.geocodeAddress(address.trim());
    return { result };
  }

  @Get('reverse-geocode')
  async reverseGeocode(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return { error: 'Invalid coordinates' };
    }

    const result = await this.locationsService.reverseGeocode(
      latitude,
      longitude,
    );
    return { result };
  }
}
