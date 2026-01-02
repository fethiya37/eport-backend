import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MaxLength,
  Matches,
  IsIn,
} from 'class-validator';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class PayDto {
  @ApiPropertyOptional({ description: 'Driver ID if paying for a specific driver' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  driver_id?: number;

  @ApiPropertyOptional({ description: 'Vehicle plate number if paying by vehicle' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @NoHtml({ message: 'plate_number must not include HTML or script tags' })
  @Matches(/^[A-Za-z0-9-]+$/u, { message: 'plate_number contains invalid characters' })
  plate_number?: string;

  @ApiProperty({
    description: 'Plan type',
    enum: ['WEEKLY', 'MONTHLY'],
    example: 'WEEKLY',
  })
  @IsIn(['WEEKLY', 'MONTHLY'], { message: 'fee_plan must be WEEKLY or MONTHLY' })
  fee_plan!: 'WEEKLY' | 'MONTHLY';

  @ApiProperty({
    description: 'Number of periods to prepay (0 = only clear overdue/current)',
    example: 1,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  prepaid_qty!: number;

  @ApiProperty({
    description: 'Coverage start date (ISO 8601, inclusive)',
    example: '2025-09-01',
  })
  @IsISO8601()
  @NoHtml({ message: 'covered_start_date must not include HTML or script tags' })
  covered_start_date!: string;

  @ApiProperty({
    description: 'Coverage end date (ISO 8601, inclusive)',
    example: '2025-09-07',
  })
  @IsISO8601()
  @NoHtml({ message: 'covered_end_date must not include HTML or script tags' })
  covered_end_date!: string;

  @ApiPropertyOptional({
    description: 'Optional safeguard to ensure client/server totals match',
    example: 500.0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Payment method used',
    enum: ['CASH', 'BANK', 'MOBILE', 'OTHER'],
    example: 'CASH',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @NoHtml({ message: 'payment_method must not include HTML or script tags' })
  @IsIn(['CASH', 'BANK', 'MOBILE', 'OTHER'], {
    message: 'payment_method must be CASH, BANK, MOBILE, or OTHER',
  })
  payment_method?: 'CASH' | 'BANK' | 'MOBILE' | 'OTHER';
}
