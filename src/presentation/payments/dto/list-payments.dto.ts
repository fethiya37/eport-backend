import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumberString, IsString, Matches, MaxLength } from 'class-validator';
import { FeePlan, PaymentMethod } from '@prisma/client';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

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
  @MaxLength(20)
  @NoHtml({ message: 'plate_number must not include HTML or script tags' })
  @Matches(/^[A-Za-z0-9-]+$/u, { message: 'plate_number contains invalid characters' })
  plate_number?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, description: 'Filter by payment method' })
  @IsOptional()
  @IsEnum(PaymentMethod)
  payment_method?: PaymentMethod;

  @ApiPropertyOptional({ description: 'Start date (inclusive, YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'from_date must be YYYY-MM-DD' })
  from_date?: string;

  @ApiPropertyOptional({ description: 'End date (inclusive, YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'to_date must be YYYY-MM-DD' })
  to_date?: string;
}
