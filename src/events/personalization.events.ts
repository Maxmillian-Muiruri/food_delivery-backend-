// Personalization & Recommendation Events
export class RecommendationsGeneratedEvent {
  constructor(
    public readonly userId: number,
    public readonly recommendations: any[],
    public readonly trigger: string, // 'login', 'preferences_update', 'location_change', etc.
  ) {}
}

export class RecommendationsUpdatedEvent {
  constructor(
    public readonly userId: number,
    public readonly oldRecommendations: any[],
    public readonly newRecommendations: any[],
    public readonly reason: string,
  ) {}
}

export class UserBehaviorLearnedEvent {
  constructor(
    public readonly userId: number,
    public readonly behavior: {
      action: string;
      itemId?: number;
      category?: string;
      timestamp: Date;
      metadata?: any;
    },
  ) {}
}

export class PersonalizationTriggeredEvent {
  constructor(
    public readonly userId: number,
    public readonly triggerType: string,
    public readonly data: any,
  ) {}
}

// Search & Discovery Events
export class UserSearchedEvent {
  constructor(
    public readonly userId: number,
    public readonly query: string,
    public readonly filters: {
      cuisine?: string;
      priceRange?: string;
      dietary?: string[];
      location?: string;
    },
    public readonly resultsCount: number,
  ) {}
}

export class RestaurantViewedEvent {
  constructor(
    public readonly userId: number,
    public readonly restaurantId: number,
    public readonly source: string, // 'search', 'recommendation', 'favorites', etc.
    public readonly viewDuration?: number,
  ) {}
}

export class MenuItemViewedEvent {
  constructor(
    public readonly userId: number,
    public readonly menuItemId: number,
    public readonly restaurantId: number,
    public readonly source: string,
    public readonly viewDuration?: number,
  ) {}
}

export class CategoryBrowsedEvent {
  constructor(
    public readonly userId: number,
    public readonly category: string,
    public readonly subcategories?: string[],
  ) {}
}

// Time-based Events
export class MorningRecommendationsEvent {
  constructor(
    public readonly userId: number,
    public readonly breakfastItems: any[],
    public readonly timestamp: Date,
  ) {}
}

export class LunchRecommendationsEvent {
  constructor(
    public readonly userId: number,
    public readonly lunchItems: any[],
    public readonly timestamp: Date,
  ) {}
}

export class DinnerRecommendationsEvent {
  constructor(
    public readonly userId: number,
    public readonly dinnerItems: any[],
    public readonly timestamp: Date,
  ) {}
}

// Location-based Events
export class LocationBasedRecommendationsEvent {
  constructor(
    public readonly userId: number,
    public readonly location: {
      latitude: number;
      longitude: number;
      city: string;
    },
    public readonly nearbyRestaurants: any[],
    public readonly nearbyItems: any[],
  ) {}
}

// Trending & Popular Events
export class TrendingItemEvent {
  constructor(
    public readonly itemId: number,
    public readonly restaurantId: number,
    public readonly orderCount: number,
    public readonly timeWindow: string, // 'hour', 'day', 'week'
  ) {}
}

export class PopularRestaurantEvent {
  constructor(
    public readonly restaurantId: number,
    public readonly orderCount: number,
    public readonly rating: number,
    public readonly timeWindow: string,
  ) {}
}

// User Engagement Events
export class FavoriteAddedEvent {
  constructor(
    public readonly userId: number,
    public readonly itemType: 'restaurant' | 'menu_item',
    public readonly itemId: number,
  ) {}
}

export class FavoriteRemovedEvent {
  constructor(
    public readonly userId: number,
    public readonly itemType: 'restaurant' | 'menu_item',
    public readonly itemId: number,
  ) {}
}

export class ReviewSubmittedEvent {
  constructor(
    public readonly userId: number,
    public readonly reviewId: number,
    public readonly itemType: 'restaurant' | 'menu_item',
    public readonly itemId: number,
    public readonly rating: number,
  ) {}
}

// Personalization Event Types
export enum PersonalizationEventTypes {
  // Recommendation Events
  RECOMMENDATIONS_GENERATED = 'recommendations.generated',
  RECOMMENDATIONS_UPDATED = 'recommendations.updated',
  USER_BEHAVIOR_LEARNED = 'user.behavior.learned',
  PERSONALIZATION_TRIGGERED = 'personalization.triggered',

  // Search Events
  USER_SEARCHED = 'user.searched',
  RESTAURANT_VIEWED = 'restaurant.viewed',
  MENU_ITEM_VIEWED = 'menu_item.viewed',
  CATEGORY_BROWSED = 'category.browsed',

  // Time-based Events
  MORNING_RECOMMENDATIONS = 'morning.recommendations',
  LUNCH_RECOMMENDATIONS = 'lunch.recommendations',
  DINNER_RECOMMENDATIONS = 'dinner.recommendations',

  // Location Events
  LOCATION_BASED_RECOMMENDATIONS = 'location.based.recommendations',

  // Trending Events
  TRENDING_ITEM = 'trending.item',
  POPULAR_RESTAURANT = 'popular.restaurant',

  // Engagement Events
  FAVORITE_ADDED = 'favorite.added',
  FAVORITE_REMOVED = 'favorite.removed',
  REVIEW_SUBMITTED = 'review.submitted',
}
