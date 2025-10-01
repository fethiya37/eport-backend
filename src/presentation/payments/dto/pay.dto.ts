import {
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PayDto {
  @ApiPropertyOptional({ description: 'Driver ID if paying for a specific driver' })
  @IsOptional()
  @IsInt()
  driver_id?: number; // DB: driver_id

  @ApiPropertyOptional({ description: 'Vehicle plate number if paying by vehicle' })
  @IsOptional()
  @IsString()
  plate_number?: string; // DB: plate_number

  @ApiProperty({
    description: 'Plan type',
    enum: ['WEEKLY', 'MONTHLY'],
    example: 'WEEKLY',
  })
  @IsEnum(['WEEKLY', 'MONTHLY'], {
    message: 'fee_plan must be WEEKLY or MONTHLY',
  })
  fee_plan!: 'WEEKLY' | 'MONTHLY'; // DB: fee_plan

  @ApiProperty({
    description: 'Number of periods to prepay (0 = only clear overdue/current)',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  prepaid_qty!: number; // DB: prepaid_qty

  @ApiProperty({
    description: 'Coverage start date (ISO 8601, inclusive)',
    example: '2025-09-01',
  })
  @IsISO8601()
  covered_start_date!: string; // DB: covered_start_date

  @ApiProperty({
    description: 'Coverage end date (ISO 8601, inclusive)',
    example: '2025-09-07',
  })
  @IsISO8601()
  covered_end_date!: string; // DB: covered_end_date

  @ApiPropertyOptional({
    description: 'Optional safeguard to ensure client/server totals match',
    example: 500.0,
  })
  @IsOptional()
  @IsNumber()
  amount?: number; // DB: amount

  @ApiPropertyOptional({
    description: 'Payment method used',
    enum: ['CASH', 'BANK', 'MOBILE', 'OTHER'],
    example: 'CASH',
  })
  @IsOptional()
  @IsString()
  payment_method?: string; // DB: payment_method
}
