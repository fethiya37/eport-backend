// src/presentation/payments/dto/list-payments.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumberString, IsString } from 'class-validator';
import { FeePlan, PaymentMethod } from '@prisma/client';

export class ListPaymentsDto {
  @ApiPropertyOptional({ description: 'Filter by association ID' })
  @IsOptional()
  @IsNumberString()
  association_id?: string;

  @ApiPropertyOptional({ description: 'Filter by driver ID' })
  @IsOptional()
  @IsNumberString()
  driver_id?: string;

  @ApiPropertyOptional({ description: 'Filter by user who created payment' })
  @IsOptional()
  @IsNumberString()
  created_by_user_id?: string;

  @ApiPropertyOptional({ enum: FeePlan, description: 'Filter by fee plan' })
  @IsOptional()
  @IsEnum(FeePlan)
  fee_plan?: FeePlan;

  @ApiPropertyOptional({ description: 'Filter by plate number' })
  @IsOptional()
  @IsString()
  plate_number?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Filter by payment method' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Start date (inclusive, YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  from_date?: string;

  @ApiPropertyOptional({ description: 'End date (inclusive, YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  to_date?: string;
}
