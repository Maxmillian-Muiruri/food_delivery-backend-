// Order Lifecycle Events
export class OrderCreatedEvent {
  constructor(
    public readonly orderId: number,
    public readonly userId: number,
    public readonly restaurantId: number,
    public readonly totalAmount: number,
    public readonly orderData: any,
  ) {}
}

export class OrderConfirmedEvent {
  constructor(
    public readonly orderId: number,
    public readonly userId: number,
    public readonly restaurantId: number,
  ) {}
}

export class OrderPreparingEvent {
  constructor(
    public readonly orderId: number,
    public readonly restaurantId: number,
  ) {}
}

export class OrderReadyEvent {
  constructor(
    public readonly orderId: number,
    public readonly restaurantId: number,
  ) {}
}

export class DriverAssignedEvent {
  constructor(
    public readonly orderId: number,
    public readonly driverId: number,
    public readonly driverData: any,
  ) {}
}

export class OrderPickedUpEvent {
  constructor(
    public readonly orderId: number,
    public readonly driverId: number,
  ) {}
}

export class OrderDeliveredEvent {
  constructor(
    public readonly orderId: number,
    public readonly driverId: number,
    public readonly userId: number,
  ) {}
}

export class OrderCancelledEvent {
  constructor(
    public readonly orderId: number,
    public readonly userId: number,
    public readonly reason: string,
  ) {}
}

// Payment Events
export class PaymentInitiatedEvent {
  constructor(
    public readonly orderId: number,
    public readonly paymentId: number,
    public readonly userId: number,
    public readonly amount: number,
    public readonly paymentData: any,
  ) {}
}

export class PaymentCompletedEvent {
  constructor(
    public readonly orderId: number,
    public readonly paymentId: number,
    public readonly userId: number,
    public readonly amount: number,
    public readonly transactionId: string,
    public readonly paymentData: any,
  ) {}
}

export class PaymentFailedEvent {
  constructor(
    public readonly orderId: number,
    public readonly paymentId: number,
    public readonly userId: number,
    public readonly amount: number,
    public readonly failureReason: string,
    public readonly paymentData: any,
  ) {}
}

export class PaymentRefundedEvent {
  constructor(
    public readonly orderId: number,
    public readonly paymentId: number,
    public readonly userId: number,
    public readonly originalAmount: number,
    public readonly refundAmount: number,
    public readonly refundReason: string,
  ) {}
}

// User Events
export class UserRegisteredEvent {
  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly name: string,
    public readonly userData: any,
  ) {}
}

export class UserLoginEvent {
  constructor(
    public readonly userId: number,
    public readonly email: string,
    public readonly location?: {
      latitude: number;
      longitude: number;
      city: string;
    },
  ) {}
}

export class UserPreferencesUpdatedEvent {
  constructor(
    public readonly userId: number,
    public readonly preferences: {
      dietary_restrictions: string[];
      favorite_cuisines: string[];
      price_range: string;
      spice_level: string;
    },
    public readonly allergens: string[],
  ) {}
}

export class UserAllergensUpdatedEvent {
  constructor(
    public readonly userId: number,
    public readonly allergens: string[],
  ) {}
}

export class UserLocationChangedEvent {
  constructor(
    public readonly userId: number,
    public readonly location: {
      latitude: number;
      longitude: number;
      city: string;
      address: string;
    },
  ) {}
}

// Restaurant Events
export class RestaurantCreatedEvent {
  constructor(
    public readonly restaurantId: number,
    public readonly ownerId: number,
    public readonly restaurantData: any,
  ) {}
}

export class MenuItemAddedEvent {
  constructor(
    public readonly restaurantId: number,
    public readonly menuItemId: number,
    public readonly menuItemData: any,
  ) {}
}

export class RestaurantStatusChangedEvent {
  constructor(
    public readonly restaurantId: number,
    public readonly status: string,
    public readonly reason?: string,
  ) {}
}

// Driver Events
export class DriverAvailableEvent {
  constructor(
    public readonly driverId: number,
    public readonly location: {
      latitude: number;
      longitude: number;
    },
  ) {}
}

export class DriverLocationUpdatedEvent {
  constructor(
    public readonly driverId: number,
    public readonly location: {
      latitude: number;
      longitude: number;
    },
  ) {}
}

export class DeliveryStartedEvent {
  constructor(
    public readonly orderId: number,
    public readonly driverId: number,
  ) {}
}

export class DeliveryCompletedEvent {
  constructor(
    public readonly orderId: number,
    public readonly driverId: number,
  ) {}
}

// Notification Events
export class OrderStatusChangedEvent {
  constructor(
    public readonly orderId: number,
    public readonly userId: number,
    public readonly status: string,
    public readonly message: string,
  ) {}
}

export class PaymentStatusChangedEvent {
  constructor(
    public readonly paymentId: number,
    public readonly userId: number,
    public readonly status: string,
    public readonly message: string,
  ) {}
}

// Analytics Events
export class OrderAnalyticsEvent {
  constructor(
    public readonly orderId: number,
    public readonly restaurantId: number,
    public readonly amount: number,
    public readonly timestamp: Date,
  ) {}
}

export class UserBehaviorEvent {
  constructor(
    public readonly userId: number,
    public readonly action: string,
    public readonly data: any,
  ) {}
}

// System Events
export class SystemAlertEvent {
  constructor(
    public readonly type: string,
    public readonly message: string,
    public readonly data?: any,
  ) {}
}

// Event Types Enum for consistency
export enum EventTypes {
  // Order Events
  ORDER_CREATED = 'order.created',
  ORDER_CONFIRMED = 'order.confirmed',
  ORDER_PREPARING = 'order.preparing',
  ORDER_READY = 'order.ready',
  DRIVER_ASSIGNED = 'driver.assigned',
  ORDER_PICKED_UP = 'order.picked_up',
  ORDER_DELIVERED = 'order.delivered',
  ORDER_CANCELLED = 'order.cancelled',

  // Payment Events
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PAYMENT_REFUNDED = 'payment.refunded',

  // User Events
  USER_REGISTERED = 'user.registered',
  USER_LOGIN = 'user.login',
  USER_PREFERENCES_UPDATED = 'user.preferences.updated',
  USER_ALLERGENS_UPDATED = 'user.allergens.updated',
  USER_LOCATION_CHANGED = 'user.location.changed',

  // Restaurant Events
  RESTAURANT_CREATED = 'restaurant.created',
  MENU_ITEM_ADDED = 'menu_item.added',
  RESTAURANT_STATUS_CHANGED = 'restaurant.status.changed',

  // Driver Events
  DRIVER_AVAILABLE = 'driver.available',
  DRIVER_LOCATION_UPDATED = 'driver.location.updated',
  DELIVERY_STARTED = 'delivery.started',
  DELIVERY_COMPLETED = 'delivery.completed',

  // Notification Events
  ORDER_STATUS_CHANGED = 'order.status.changed',
  PAYMENT_STATUS_CHANGED = 'payment.status.changed',

  // Analytics Events
  ORDER_ANALYTICS = 'order.analytics',
  USER_BEHAVIOR = 'user.behavior',

  // Personalization Events
  RECOMMENDATIONS_GENERATED = 'recommendations.generated',
  RECOMMENDATIONS_UPDATED = 'recommendations.updated',
  USER_BEHAVIOR_LEARNED = 'user.behavior.learned',
  PERSONALIZATION_TRIGGERED = 'personalization.triggered',

  // Search Events
  USER_SEARCHED = 'user.searched',
  RESTAURANT_VIEWED = 'restaurant.viewed',
  MENU_ITEM_VIEWED = 'menu_item.viewed',
  CATEGORY_BROWSED = 'category.browsed',

  // System Events
  SYSTEM_ALERT = 'system.alert',
}
