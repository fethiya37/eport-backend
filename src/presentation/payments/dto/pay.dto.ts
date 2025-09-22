import { IsISO8601, IsInt, IsNumber, IsOptional, IsString, Min, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PayDto {
  // You may identify the target by driver_id OR plate_number
  @ApiPropertyOptional({ description: 'Driver ID if paying for a specific driver' })
  @IsOptional()
  @IsInt()
  driver_id?: number;

  @ApiPropertyOptional({ description: 'Vehicle plate number if paying by vehicle' })
  @IsOptional()
  @IsString()
  plate_number?: string;

  // Plan used for validation and price
  @ApiProperty({
    description: 'Whether the plan is weekly (true) or monthly (false)',
    example: true,
  })
  @IsBoolean()
  is_weekly!: boolean;

  // How many future periods to prepay (0 = only clear overdue/current)
  @ApiProperty({
    description: 'Number of periods to prepay (0 = only clear overdue/current)',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  prepay_qty!: number;

  // Coverage window (GC ISO 8601, inclusive)
  @ApiProperty({
    description: 'Coverage start date (ISO 8601, inclusive)',
    example: '2025-09-01',
  })
  @IsISO8601()
  covered_start_date!: string;

  @ApiProperty({
    description: 'Coverage end date (ISO 8601, inclusive)',
    example: '2025-09-07',
  })
  @IsISO8601()
  covered_end_date!: string;

  // Optional safeguard to ensure client/server totals match
  @ApiPropertyOptional({
    description: 'Optional safeguard to ensure client/server totals match',
    example: 500.0,
  })
  @IsOptional()
  @IsNumber()
  total_override?: number;

  // Optional: record how it was paid (string matches DB enum)
  @ApiPropertyOptional({
    description: 'Payment method used',
    enum: ['CASH', 'CARD', 'BANK', 'MOBILE', 'OTHER'],
    example: 'CASH',
  })
  @IsOptional()
  @IsString()
  payment_method?: string; // CASH | CARD | BANK | MOBILE | OTHER
}
