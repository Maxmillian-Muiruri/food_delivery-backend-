// Business Logic Automation Events - Phase 4
// Restaurant Management, Analytics, and Admin Events

import { Restaurant } from '../modules/restaurants/entities/restaurant.entity';
import { MenuItem } from '../modules/menu-items/entities/menu-item.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { User } from '../modules/users/entities/user.entity';

// Event Types Enum
export enum BusinessEventTypes {
  // Restaurant Management Events
  RESTAURANT_CREATED = 'restaurant.created',
  MENU_ITEM_ADDED = 'menu_item.added',
  MENU_ITEM_UPDATED = 'menu_item.updated',
  RESTAURANT_STATUS_CHANGED = 'restaurant.status_changed',
  ORDER_RECEIVED = 'order.received',

  // Analytics & Reporting Events
  ORDER_ANALYTICS = 'analytics.order',
  REVENUE_ANALYTICS = 'analytics.revenue',
  USER_BEHAVIOR = 'analytics.user_behavior',
  PERFORMANCE_METRICS = 'analytics.performance',

  // Admin & Moderation Events
  RESTAURANT_VERIFICATION = 'admin.restaurant_verification',
  USER_REPORTED = 'admin.user_reported',
  CONTENT_MODERATED = 'admin.content_moderated',
  SYSTEM_ALERT = 'admin.system_alert',
}

// Base Business Event Class
export class BusinessEvent {
  constructor(
    public readonly eventType: BusinessEventTypes,
    public readonly timestamp: Date = new Date(),
  ) {}
}

// ============================================================================
// RESTAURANT MANAGEMENT EVENTS
// ============================================================================

export class RestaurantCreatedEvent extends BusinessEvent {
  constructor(
    public readonly restaurantId: number,
    public readonly ownerId: number,
    public readonly restaurantData: Partial<Restaurant>,
  ) {
    super(BusinessEventTypes.RESTAURANT_CREATED);
  }
}

export class MenuItemUpdatedEvent extends BusinessEvent {
  constructor(
    public readonly menuItemId: number,
    public readonly restaurantId: number,
    public readonly changes: Partial<MenuItem>,
    public readonly previousData?: Partial<MenuItem>,
  ) {
    super(BusinessEventTypes.MENU_ITEM_UPDATED);
  }
}

export class RestaurantActiveStatusChangedEvent extends BusinessEvent {
  constructor(
    public readonly restaurantId: number,
    public readonly previousStatus: boolean,
    public readonly newStatus: boolean,
    public readonly reason?: string,
  ) {
    super(BusinessEventTypes.RESTAURANT_STATUS_CHANGED);
  }
}

export class OrderReceivedEvent extends BusinessEvent {
  constructor(
    public readonly orderId: number,
    public readonly restaurantId: number,
    public readonly orderData: Partial<Order>,
    public readonly customerData: Partial<User>,
  ) {
    super(BusinessEventTypes.ORDER_RECEIVED);
  }
}

// ============================================================================
// ANALYTICS & REPORTING EVENTS
// ============================================================================

export class OrderAnalyticsEvent extends BusinessEvent {
  constructor(
    public readonly orderId: number,
    public readonly restaurantId: number,
    public readonly customerId: number,
    public readonly orderValue: number,
    public readonly itemsCount: number,
    public readonly preparationTime?: number,
    public readonly deliveryTime?: number,
  ) {
    super(BusinessEventTypes.ORDER_ANALYTICS);
  }
}

export class RevenueAnalyticsEvent extends BusinessEvent {
  constructor(
    public readonly restaurantId: number,
    public readonly period: 'daily' | 'weekly' | 'monthly',
    public readonly revenue: number,
    public readonly orderCount: number,
    public readonly averageOrderValue: number,
    public readonly commission: number,
  ) {
    super(BusinessEventTypes.REVENUE_ANALYTICS);
  }
}

export class BusinessUserBehaviorEvent extends BusinessEvent {
  constructor(
    public readonly userId: number,
    public readonly action:
      | 'search'
      | 'view_restaurant'
      | 'view_menu_item'
      | 'add_to_cart'
      | 'place_order'
      | 'cancel_order',
    public readonly metadata: Record<string, any>,
    public readonly sessionId?: string,
  ) {
    super(BusinessEventTypes.USER_BEHAVIOR);
  }
}

export class PerformanceMetricsEvent extends BusinessEvent {
  constructor(
    public readonly metricType:
      | 'order_processing_time'
      | 'driver_assignment_time'
      | 'delivery_time'
      | 'api_response_time',
    public readonly value: number,
    public readonly unit: 'milliseconds' | 'seconds' | 'minutes',
    public readonly context?: Record<string, any>,
  ) {
    super(BusinessEventTypes.PERFORMANCE_METRICS);
  }
}

// ============================================================================
// ADMIN & MODERATION EVENTS
// ============================================================================

export class RestaurantVerificationEvent extends BusinessEvent {
  constructor(
    public readonly restaurantId: number,
    public readonly status:
      | 'pending'
      | 'approved'
      | 'rejected'
      | 'requires_changes',
    public readonly adminId: number,
    public readonly notes?: string,
    public readonly requiredChanges?: string[],
  ) {
    super(BusinessEventTypes.RESTAURANT_VERIFICATION);
  }
}

export class UserReportedEvent extends BusinessEvent {
  constructor(
    public readonly reportedUserId: number,
    public readonly reporterUserId: number,
    public readonly reportType:
      | 'inappropriate_content'
      | 'spam'
      | 'harassment'
      | 'fake_account'
      | 'other',
    public readonly description: string,
    public readonly evidence?: string[],
  ) {
    super(BusinessEventTypes.USER_REPORTED);
  }
}

export class ContentModeratedEvent extends BusinessEvent {
  constructor(
    public readonly contentType:
      | 'restaurant'
      | 'menu_item'
      | 'review'
      | 'user_profile',
    public readonly contentId: number,
    public readonly action: 'approved' | 'rejected' | 'flagged' | 'removed',
    public readonly moderatorId: number,
    public readonly reason?: string,
  ) {
    super(BusinessEventTypes.CONTENT_MODERATED);
  }
}

export class SystemAlertEvent extends BusinessEvent {
  constructor(
    public readonly alertType: 'error' | 'warning' | 'info' | 'critical',
    public readonly title: string,
    public readonly message: string,
    public readonly context?: Record<string, any>,
    public readonly requiresAction: boolean = false,
  ) {
    super(BusinessEventTypes.SYSTEM_ALERT);
  }
}
