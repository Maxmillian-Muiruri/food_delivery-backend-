import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Driver } from './entities/driver.entity';
import { DriverDocument } from './entities/driver-document.entity';
import { CreateDriverDto } from './dto/create-driver.dto';
import { ConfigService } from '@nestjs/config';

type NearbyDriver = Driver & { distanceKm?: number; routeDurationSec?: number };

interface OrsRouteSummary {
  distance?: number;
  duration?: number;
}
interface OrsRoute {
  summary?: OrsRouteSummary;
}
interface OrsResponse {
  routes?: OrsRoute[];
}

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);
  // simple in-memory cache for ORS responses to avoid hitting rate limits
  private orsCache = new Map<string, { duration: number; ts: number }>();
  private readonly ORS_CACHE_TTL_MS = 60 * 1000; // 60s

  constructor(
    @InjectRepository(Driver)
    private driversRepo: Repository<Driver>,
    @InjectRepository(DriverDocument)
    private docsRepo: Repository<DriverDocument>,
    private configService: ConfigService,
  ) {}

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371; // Earth radius km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private async getOrsRouteDuration(
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
  ): Promise<number | null> {
    const key = `${startLat},${startLon}:${endLat},${endLon}`;
    const cached = this.orsCache.get(key);
    const now = Date.now();
    if (cached && now - cached.ts < this.ORS_CACHE_TTL_MS) {
      return cached.duration;
    }

    const apiKey = this.configService.get<string>('ORS_API_KEY');
    if (!apiKey) return null;

    try {
      const params = {
        start: `${startLon},${startLat}`,
        end: `${endLon},${endLat}`,
      };
      const resp = await axios.get<OrsResponse>(
        'https://api.openrouteservice.org/v2/directions/driving-car',
        { params, timeout: 5000, headers: { Authorization: apiKey } },
      );
      const duration = resp.data?.routes?.[0]?.summary?.duration;
      if (typeof duration === 'number') {
        this.orsCache.set(key, { duration, ts: now });
        return duration;
      }
      return null;
    } catch (e) {
      this.logger.debug('ORS request failed', e?.message ?? String(e));
      return null;
    }
  }

  /**
   * Find nearby available drivers by calculating straight-line distance (Haversine).
   * Optionally uses OpenRouteService routing to refine by route duration when API key is provided.
   */
  async findNearbyAvailable(
    startLat: number,
    startLon: number,
    radiusKm = 10,
    limit = 5,
    useRouting = false,
  ): Promise<NearbyDriver[]> {
    const allAvailable = await this.driversRepo.find({
      where: { availabilityStatus: 'available' },
    });

    // filter drivers that have coordinates
    const candidates = allAvailable.filter(
      (d) =>
        d.currentLatitude !== null &&
        d.currentLatitude !== undefined &&
        d.currentLongitude !== null &&
        d.currentLongitude !== undefined,
    );

    const withDistance: NearbyDriver[] = candidates
      .map((d) => ({
        ...d,
        distanceKm: this.haversineKm(
          startLat,
          startLon,
          Number(d.currentLatitude),
          Number(d.currentLongitude),
        ),
      }))
      .filter((d) => d.distanceKm <= radiusKm)
      .sort((a, b) => (a.distanceKm > b.distanceKm ? 1 : -1))
      .slice(0, limit);

    // If routing requested and API key present, call ORS to get real route durations and re-sort
    const orsKey = this.configService.get<string>('ORS_API_KEY');
    if (useRouting && orsKey && withDistance.length > 0) {
      // fetch durations concurrently but allow failures per-driver
      await Promise.all(
        withDistance.map(async (d) => {
          try {
            const dur = await this.getOrsRouteDuration(
              startLat,
              startLon,
              Number(d.currentLatitude),
              Number(d.currentLongitude),
            );
            if (typeof dur === 'number') d.routeDurationSec = dur;
          } catch (e) {
            this.logger.debug(
              'Per-driver ORS call failed',
              e?.message ?? String(e),
            );
          }
        }),
      );

      // If any have routeDuration, sort by it, otherwise keep distance order
      withDistance.sort((a, b) => {
        if (a.routeDurationSec && b.routeDurationSec)
          return a.routeDurationSec - b.routeDurationSec;
        if (a.routeDurationSec) return -1;
        if (b.routeDurationSec) return 1;
        return a.distanceKm! - b.distanceKm!;
      });
    }

    return withDistance;
  }

  async register(userId: number, dto: CreateDriverDto) {
    const driver = this.driversRepo.create({
      userId,
      licensePlate: dto.licensePlate,
      vehicleType: dto.vehicleType,
      availabilityStatus: 'offline',
    });
    return this.driversRepo.save(driver);
  }

  findOne(id: number) {
    return this.driversRepo.findOne({ where: { id } });
  }

  findByUserId(userId: number) {
    return this.driversRepo.findOne({ where: { userId } });
  }

  findAll() {
    return this.driversRepo.find();
  }

  async updateAvailability(userId: number, status: string) {
    const driver = await this.findByUserId(userId);
    if (!driver) throw new NotFoundException('Driver not found');
    driver.availabilityStatus = status;
    return this.driversRepo.save(driver);
  }

  async updateLocation(userId: number, latitude: number, longitude: number) {
    const driver = await this.findByUserId(userId);
    if (!driver) throw new NotFoundException('Driver not found');
    driver.currentLatitude = latitude;
    driver.currentLongitude = longitude;
    return this.driversRepo.save(driver);
  }

  async addDocument(
    driverId: number,
    documentUrl: string,
    publicId: string,
    documentType: string,
  ) {
    const doc = this.docsRepo.create({
      driverId,
      documentType,
      documentUrl,
      cloudinaryPublicId: publicId,
      status: 'pending',
    });
    return this.docsRepo.save(doc);
  }
}
