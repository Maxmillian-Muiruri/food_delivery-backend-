import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  UserLoginEvent,
  UserPreferencesUpdatedEvent,
  UserAllergensUpdatedEvent,
  UserLocationChangedEvent,
  EventTypes,
} from '../../../events';
import {
  UserSearchedEvent,
  RestaurantViewedEvent,
  MenuItemViewedEvent,
  CategoryBrowsedEvent,
  RecommendationsGeneratedEvent,
  UserBehaviorLearnedEvent,
  PersonalizationTriggeredEvent,
} from '../../../events/personalization.events';
import { User } from '../entities/user.entity';
import { RestaurantsService } from '../../restaurants/restaurants.service';
import { MenuItemsService } from '../../menu-items/menu-items.service';

@Injectable()
export class PersonalizationListener {
  private readonly logger = new Logger(PersonalizationListener.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly restaurantsService: RestaurantsService,
    private readonly menuItemsService: MenuItemsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @OnEvent(EventTypes.USER_LOGIN)
  async handleUserLogin(event: UserLoginEvent) {
    try {
      this.logger.log(`🔐 Processing UserLoginEvent for User #${event.userId}`);

      // Trigger personalization on login
      await this.triggerPersonalization(event.userId, 'login', {
        location: event.location,
        timestamp: new Date(),
      });

      this.logger.log(
        `✅ User login personalization completed for User #${event.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to process user login personalization for User #${event.userId}`,
        error,
      );
    }
  }

  @OnEvent(EventTypes.USER_PREFERENCES_UPDATED)
  async handleUserPreferencesUpdated(event: UserPreferencesUpdatedEvent) {
    try {
      this.logger.log(
        `⚙️ Processing UserPreferencesUpdatedEvent for User #${event.userId}`,
      );

      // Learn from preference updates
      await this.learnFromPreferences(event);

      // Trigger personalization update
      await this.triggerPersonalization(event.userId, 'preferences_updated', {
        preferences: event.preferences,
        allergens: event.allergens,
      });

      this.logger.log(
        `✅ User preferences personalization completed for User #${event.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to process user preferences personalization for User #${event.userId}`,
        error,
      );
    }
  }

  @OnEvent(EventTypes.USER_ALLERGENS_UPDATED)
  async handleUserAllergensUpdated(event: UserAllergensUpdatedEvent) {
    try {
      this.logger.log(
        `🥜 Processing UserAllergensUpdatedEvent for User #${event.userId}`,
      );

      // Trigger personalization update for allergen changes
      await this.triggerPersonalization(event.userId, 'allergens_updated', {
        allergens: event.allergens,
      });

      this.logger.log(
        `✅ User allergens personalization completed for User #${event.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to process user allergens personalization for User #${event.userId}`,
        error,
      );
    }
  }

  @OnEvent(EventTypes.USER_LOCATION_CHANGED)
  async handleUserLocationChanged(event: UserLocationChangedEvent) {
    try {
      this.logger.log(
        `📍 Processing UserLocationChangedEvent for User #${event.userId}`,
      );

      // Trigger location-based personalization
      await this.triggerPersonalization(event.userId, 'location_changed', {
        location: event.location,
      });

      this.logger.log(
        `✅ User location personalization completed for User #${event.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to process user location personalization for User #${event.userId}`,
        error,
      );
    }
  }

  @OnEvent(EventTypes.USER_SEARCHED)
  async handleUserSearched(event: UserSearchedEvent) {
    try {
      this.logger.log(
        `🔍 Processing UserSearchedEvent for User #${event.userId}`,
      );

      // Learn from search behavior
      await this.learnFromSearch(event);

      this.logger.log(
        `✅ User search behavior learning completed for User #${event.userId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to process user search behavior for User #${event.userId}`,
        error,
      );
    }
  }

  @OnEvent(EventTypes.RESTAURANT_VIEWED)
  async handleRestaurantViewed(event: RestaurantViewedEvent) {
    try {
      this.logger.log(
        `🏪 Processing RestaurantViewedEvent for User #${event.userId}, Restaurant #${event.restaurantId}`,
      );

      // Learn from restaurant viewing behavior
      await this.learnFromRestaurantView(event);

      this.logger.log(`✅ Restaurant view behavior learning completed`);
    } catch (error) {
      this.logger.error(`❌ Failed to process restaurant view behavior`, error);
    }
  }

  @OnEvent(EventTypes.MENU_ITEM_VIEWED)
  async handleMenuItemViewed(event: MenuItemViewedEvent) {
    try {
      this.logger.log(
        `🍽️ Processing MenuItemViewedEvent for User #${event.userId}, MenuItem #${event.menuItemId}`,
      );

      // Learn from menu item viewing behavior
      await this.learnFromMenuItemView(event);

      this.logger.log(`✅ Menu item view behavior learning completed`);
    } catch (error) {
      this.logger.error(`❌ Failed to process menu item view behavior`, error);
    }
  }

  @OnEvent(EventTypes.CATEGORY_BROWSED)
  async handleCategoryBrowsed(event: CategoryBrowsedEvent) {
    try {
      this.logger.log(
        `📂 Processing CategoryBrowsedEvent for User #${event.userId}, Category: ${event.category}`,
      );

      // Learn from category browsing behavior
      await this.learnFromCategoryBrowse(event);

      this.logger.log(`✅ Category browse behavior learning completed`);
    } catch (error) {
      this.logger.error(`❌ Failed to process category browse behavior`, error);
    }
  }

  private async triggerPersonalization(
    userId: number,
    triggerType: string,
    context: any,
  ) {
    try {
      this.logger.log(
        `🎯 Triggering personalization for User #${userId}, trigger: ${triggerType}`,
      );

      // Emit personalization triggered event
      this.eventEmitter.emit(
        EventTypes.PERSONALIZATION_TRIGGERED,
        new PersonalizationTriggeredEvent(userId, triggerType, context),
      );

      // Generate new recommendations based on trigger
      const recommendations = await this.generateRecommendations(
        userId,
        triggerType,
        context,
      );

      // Emit recommendations generated event
      this.eventEmitter.emit(
        EventTypes.RECOMMENDATIONS_GENERATED,
        new RecommendationsGeneratedEvent(
          userId,
          [recommendations],
          triggerType,
        ),
      );

      this.logger.log(
        `✅ Personalization triggered and recommendations generated for User #${userId}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to trigger personalization for User #${userId}`,
        error,
      );
    }
  }

  private async generateRecommendations(
    userId: number,
    triggerType: string,
    context: any,
  ) {
    try {
      // Get user profile and preferences
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['favorites'],
      });

      if (!user) {
        throw new Error(`User ${userId} not found`);
      }

      // Basic recommendation logic (can be enhanced with ML algorithms)
      const recommendations = {
        restaurants: [] as number[],
        menuItems: [] as number[],
        categories: [] as string[],
      };

      // For now, return basic recommendations
      // This can be enhanced with actual recommendation algorithms
      // based on user preferences, order history, location, etc.

      // Placeholder: recommend first few restaurants and menu items
      // In production, this would use sophisticated algorithms
      recommendations.restaurants = [1, 2]; // Placeholder restaurant IDs
      recommendations.menuItems = [1, 2, 3]; // Placeholder menu item IDs
      recommendations.categories = ['Italian', 'Pizza']; // Placeholder categories

      return recommendations;
    } catch (error) {
      this.logger.error(
        `❌ Failed to generate recommendations for User #${userId}`,
        error,
      );
      return { restaurants: [], menuItems: [], categories: [] };
    }
  }

  private async learnFromPreferences(event: UserPreferencesUpdatedEvent) {
    try {
      // Emit behavior learned event
      this.eventEmitter.emit(
        EventTypes.USER_BEHAVIOR_LEARNED,
        new UserBehaviorLearnedEvent(event.userId, {
          action: 'preferences_updated',
          itemId: event.userId,
          category: 'preferences',
          timestamp: new Date(),
          metadata: {
            preferences: event.preferences,
            allergens: event.allergens,
          },
        }),
      );
    } catch (error) {
      this.logger.error(`❌ Failed to learn from preferences update`, error);
    }
  }

  private async learnFromSearch(event: UserSearchedEvent) {
    try {
      // Emit behavior learned event
      this.eventEmitter.emit(
        EventTypes.USER_BEHAVIOR_LEARNED,
        new UserBehaviorLearnedEvent(event.userId, {
          action: 'search',
          itemId: 0,
          category: 'search',
          timestamp: new Date(),
          metadata: {
            query: event.query,
            filters: event.filters,
            resultsCount: event.resultsCount,
          },
        }),
      );
    } catch (error) {
      this.logger.error(`❌ Failed to learn from search behavior`, error);
    }
  }

  private async learnFromRestaurantView(event: RestaurantViewedEvent) {
    try {
      // Emit behavior learned event
      this.eventEmitter.emit(
        EventTypes.USER_BEHAVIOR_LEARNED,
        new UserBehaviorLearnedEvent(event.userId, {
          action: 'restaurant_view',
          itemId: event.restaurantId,
          category: 'restaurant',
          timestamp: new Date(),
          metadata: {
            source: event.source,
            viewDuration: event.viewDuration,
          },
        }),
      );
    } catch (error) {
      this.logger.error(`❌ Failed to learn from restaurant view`, error);
    }
  }

  private async learnFromMenuItemView(event: MenuItemViewedEvent) {
    try {
      // Emit behavior learned event
      this.eventEmitter.emit(
        EventTypes.USER_BEHAVIOR_LEARNED,
        new UserBehaviorLearnedEvent(event.userId, {
          action: 'menu_item_view',
          itemId: event.menuItemId,
          category: 'menu_item',
          timestamp: new Date(),
          metadata: {
            restaurantId: event.restaurantId,
            source: event.source,
            viewDuration: event.viewDuration,
          },
        }),
      );
    } catch (error) {
      this.logger.error(`❌ Failed to learn from menu item view`, error);
    }
  }

  private async learnFromCategoryBrowse(event: CategoryBrowsedEvent) {
    try {
      // Emit behavior learned event
      this.eventEmitter.emit(
        EventTypes.USER_BEHAVIOR_LEARNED,
        new UserBehaviorLearnedEvent(event.userId, {
          action: 'category_browse',
          itemId: 0,
          category: 'category',
          timestamp: new Date(),
          metadata: {
            category: event.category,
            subcategories: event.subcategories,
          },
        }),
      );
    } catch (error) {
      this.logger.error(`❌ Failed to learn from category browse`, error);
    }
  }
}
