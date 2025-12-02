// Advanced Features Events - Phase 5
// Real-time Communication, External Integration, and Background Processing

// ============================================================================
// REAL-TIME COMMUNICATION EVENTS
// ============================================================================

export enum RealTimeEventTypes {
  WEBSOCKET_CONNECTED = 'realtime.websocket_connected',
  WEBSOCKET_DISCONNECTED = 'realtime.websocket_disconnected',
  LIVE_TRACKING_UPDATE = 'realtime.live_tracking',
  ORDER_STATUS_UPDATE = 'realtime.order_status_update',
  DRIVER_LOCATION_UPDATE = 'realtime.driver_location_update',
  CHAT_MESSAGE = 'realtime.chat_message',
  NOTIFICATION_RECEIVED = 'realtime.notification_received',
}

export class WebSocketConnectedEvent {
  constructor(
    public readonly userId: number,
    public readonly connectionId: string,
    public readonly userAgent?: string,
    public readonly ipAddress?: string,
  ) {}
}

export class WebSocketDisconnectedEvent {
  constructor(
    public readonly userId: number,
    public readonly connectionId: string,
    public readonly disconnectReason?: string,
  ) {}
}

export class LiveTrackingUpdateEvent {
  constructor(
    public readonly orderId: number,
    public readonly driverId: number,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly heading?: number,
    public readonly speed?: number,
    public readonly accuracy?: number,
  ) {}
}

export class RealTimeOrderStatusUpdateEvent {
  constructor(
    public readonly orderId: number,
    public readonly userId: number,
    public readonly status: string,
    public readonly message: string,
    public readonly estimatedDeliveryTime?: number,
  ) {}
}

export class DriverLocationUpdateEvent {
  constructor(
    public readonly driverId: number,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly isActive: boolean,
    public readonly lastUpdate: Date = new Date(),
  ) {}
}

export class ChatMessageEvent {
  constructor(
    public readonly chatId: string,
    public readonly senderId: number,
    public readonly receiverId: number,
    public readonly message: string,
    public readonly messageType: 'text' | 'image' | 'location' | 'system',
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class RealTimeNotificationEvent {
  constructor(
    public readonly userId: number,
    public readonly notificationId: number,
    public readonly title: string,
    public readonly message: string,
    public readonly type: string,
    public readonly priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  ) {}
}

// ============================================================================
// EXTERNAL INTEGRATION EVENTS
// ============================================================================

export enum IntegrationEventTypes {
  CLOUDINARY_UPLOAD_SUCCESS = 'integration.cloudinary.upload_success',
  CLOUDINARY_UPLOAD_FAILED = 'integration.cloudinary.upload_failed',
  PAYSTACK_WEBHOOK_RECEIVED = 'integration.paystack.webhook',
  SMS_NOTIFICATION_SENT = 'integration.sms.sent',
  SMS_NOTIFICATION_FAILED = 'integration.sms.failed',
  EMAIL_DELIVERED = 'integration.email.delivered',
  EMAIL_BOUNCED = 'integration.email.bounced',
  PUSH_NOTIFICATION_SENT = 'integration.push.sent',
  PUSH_NOTIFICATION_FAILED = 'integration.push.failed',
}

export class CloudinaryUploadEvent {
  constructor(
    public readonly fileType:
      | 'restaurant_logo'
      | 'restaurant_banner'
      | 'menu_item'
      | 'user_profile'
      | 'review_photo',
    public readonly entityId: number,
    public readonly publicId: string,
    public readonly url: string,
    public readonly format: string,
    public readonly size: number,
    public readonly success: boolean,
    public readonly errorMessage?: string,
  ) {}
}

export class PaystackWebhookEvent {
  constructor(
    public readonly eventType: string,
    public readonly paymentId: number,
    public readonly transactionReference: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly status: 'success' | 'failed' | 'pending',
    public readonly customerEmail: string,
    public readonly rawPayload: any,
  ) {}
}

export class SMSNotificationEvent {
  constructor(
    public readonly phoneNumber: string,
    public readonly message: string,
    public readonly messageType:
      | 'order_update'
      | 'driver_assignment'
      | 'delivery_alert'
      | 'verification',
    public readonly success: boolean,
    public readonly errorMessage?: string,
    public readonly providerResponse?: any,
  ) {}
}

export class EmailDeliveryEvent {
  constructor(
    public readonly emailId: string,
    public readonly to: string,
    public readonly subject: string,
    public readonly status:
      | 'delivered'
      | 'bounced'
      | 'complained'
      | 'opened'
      | 'clicked',
    public readonly timestamp: Date = new Date(),
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class PushNotificationEvent {
  constructor(
    public readonly userId: number,
    public readonly deviceToken: string,
    public readonly title: string,
    public readonly body: string,
    public readonly data?: Record<string, any>,
    public readonly success: boolean = true,
    public readonly errorMessage?: string,
  ) {}
}

// ============================================================================
// BACKGROUND PROCESSING EVENTS
// ============================================================================

export enum BackgroundEventTypes {
  SCHEDULED_TASK_EXECUTED = 'background.scheduled_task',
  DATA_CLEANUP_COMPLETED = 'background.data_cleanup',
  CACHE_INVALIDATION_TRIGGERED = 'background.cache_invalidation',
  BACKUP_COMPLETED = 'background.backup_completed',
  ANALYTICS_PROCESSING_STARTED = 'background.analytics_started',
  ANALYTICS_PROCESSING_COMPLETED = 'background.analytics_completed',
  RECOMMENDATION_UPDATE_TRIGGERED = 'background.recommendation_update',
  NOTIFICATION_CLEANUP_COMPLETED = 'background.notification_cleanup',
}

export class ScheduledTaskEvent {
  constructor(
    public readonly taskName: string,
    public readonly taskType:
      | 'daily'
      | 'hourly'
      | 'weekly'
      | 'monthly'
      | 'custom',
    public readonly executionTime: Date,
    public readonly duration: number, // in milliseconds
    public readonly success: boolean,
    public readonly errorMessage?: string,
    public readonly metadata?: Record<string, any>,
  ) {}
}

export class DataCleanupEvent {
  constructor(
    public readonly cleanupType:
      | 'expired_sessions'
      | 'old_logs'
      | 'inactive_users'
      | 'temp_files'
      | 'old_notifications',
    public readonly recordsProcessed: number,
    public readonly recordsDeleted: number,
    public readonly duration: number,
    public readonly success: boolean,
  ) {}
}

export class CacheInvalidationEvent {
  constructor(
    public readonly cacheType:
      | 'restaurant'
      | 'menu_item'
      | 'user'
      | 'analytics'
      | 'recommendations',
    public readonly reason: 'update' | 'delete' | 'expiration' | 'manual',
    public readonly affectedKeys: string[],
    public readonly entityId?: number,
  ) {}
}

export class BackupCompletedEvent {
  constructor(
    public readonly backupType: 'database' | 'files' | 'full_system',
    public readonly backupPath: string,
    public readonly size: number, // in bytes
    public readonly duration: number, // in milliseconds
    public readonly success: boolean,
    public readonly checksum?: string,
    public readonly errorMessage?: string,
  ) {}
}

export class AnalyticsProcessingEvent {
  constructor(
    public readonly processingType:
      | 'user_behavior'
      | 'revenue'
      | 'performance'
      | 'recommendations',
    public readonly period: 'hourly' | 'daily' | 'weekly' | 'monthly',
    public readonly recordsProcessed: number,
    public readonly duration: number,
    public readonly success: boolean,
    public readonly insights?: Record<string, any>,
  ) {}
}

export class RecommendationUpdateEvent {
  constructor(
    public readonly userId: number,
    public readonly updateType:
      | 'behavioral'
      | 'collaborative'
      | 'content_based'
      | 'full_refresh',
    public readonly recommendationsGenerated: number,
    public readonly duration: number,
    public readonly success: boolean,
  ) {}
}

export class NotificationCleanupEvent {
  constructor(
    public readonly cleanupType:
      | 'read_notifications'
      | 'expired_notifications'
      | 'old_notifications',
    public readonly daysOld: number,
    public readonly notificationsDeleted: number,
    public readonly success: boolean,
  ) {}
}

// ============================================================================
// MONITORING & PERFORMANCE EVENTS
// ============================================================================

export enum MonitoringEventTypes {
  API_RESPONSE_TIME = 'monitoring.api_response_time',
  DATABASE_QUERY_TIME = 'monitoring.database_query_time',
  EXTERNAL_API_LATENCY = 'monitoring.external_api_latency',
  MEMORY_USAGE = 'monitoring.memory_usage',
  ERROR_OCCURRED = 'monitoring.error_occurred',
  PERFORMANCE_DEGRADED = 'monitoring.performance_degraded',
}

export class ApiResponseTimeEvent {
  constructor(
    public readonly endpoint: string,
    public readonly method: string,
    public readonly responseTime: number, // in milliseconds
    public readonly statusCode: number,
    public readonly userId?: number,
    public readonly timestamp: Date = new Date(),
  ) {}
}

export class DatabaseQueryEvent {
  constructor(
    public readonly query: string,
    public readonly executionTime: number,
    public readonly operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    public readonly slowQuery: boolean = false,
    public readonly tableName?: string,
  ) {}
}

export class ExternalApiLatencyEvent {
  constructor(
    public readonly service:
      | 'paystack'
      | 'cloudinary'
      | 'sms_provider'
      | 'email_provider',
    public readonly endpoint: string,
    public readonly latency: number,
    public readonly success: boolean,
    public readonly errorMessage?: string,
  ) {}
}

export class MemoryUsageEvent {
  constructor(
    public readonly heapUsed: number,
    public readonly heapTotal: number,
    public readonly external: number,
    public readonly rss: number,
    public readonly warning: boolean = false,
  ) {}
}

export class ErrorOccurredEvent {
  constructor(
    public readonly errorType:
      | 'application'
      | 'database'
      | 'external_api'
      | 'validation',
    public readonly errorMessage: string,
    public readonly stackTrace?: string,
    public readonly context?: Record<string, any>,
    public readonly userId?: number,
    public readonly severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  ) {}
}

export class PerformanceDegradedEvent {
  constructor(
    public readonly metric: string,
    public readonly currentValue: number,
    public readonly threshold: number,
    public readonly degradation: 'minor' | 'moderate' | 'severe',
    public readonly affectedService: string,
  ) {}
}
