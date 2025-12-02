import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  IsEmail,
  IsUrl,
  Min,
  IsOptional,
} from 'class-validator';
import {
  PaymentGateway,
  PaymentMethod,
  PaymentStatus,
} from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({ description: 'User ID making the payment' })
  @IsNumber()
  user_id: number;

  @ApiProperty({ description: 'Order ID for the payment' })
  @IsNumber()
  order_id: number;

  @ApiProperty({ description: 'Customer email address' })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Payment amount in KES' })
  @IsNumber()
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @ApiProperty({
    description: 'Callback URL for payment completion',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  callback_url?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsOptional()
  payment_method?: PaymentMethod;

  @ApiProperty()
  @IsOptional()
  @IsString()
  reference: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  transaction_id?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  authorization_url?: string;

  @ApiProperty({ enum: PaymentGateway })
  @IsOptional()
  gateway_reference: PaymentGateway;

  @ApiProperty({ enum: PaymentStatus })
  @IsOptional()
  status: PaymentStatus;

  @ApiProperty()
  @IsString()
  @IsOptional()
  gateway_response?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  metadata?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  failure_reason?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  refunded_amount: number;
}

export interface VerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    gateway_response: string;
    created_at: string;
    channel: string;
    currency: string;
    fees: number;
    customer: {
      id: number;
      first_name: string | null;
      last_name: string | null;
      email: string;
      customer_code: string;
    };
    order_id: number | null;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
    transaction_date: string;
  };
}

export interface FetchTransactionResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    receipt_number: string | null;
    amount: number;
    gateway_response: string;
    created_at: string;
    channel: string;
    currency: string;
    fees_split: any | null;
    authorization: {
      channel: string;
      card_type: string;
    };
    order_id: number | null;
    paidAt: string;
    createdAt: string;
    requested_amount: number;
  };
}
