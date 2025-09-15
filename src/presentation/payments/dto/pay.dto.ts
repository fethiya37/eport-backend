import { IsISO8601, IsInt, IsNumber, IsOptional, IsString, Min, IsBoolean } from 'class-validator';

export class PayDto {
  // You may identify the target by driver_id OR plate_number
  @IsOptional() @IsInt()
  driver_id?: number;

  @IsOptional() @IsString()
  plate_number?: string;

  // Plan used for validation and price
  @IsBoolean()
  is_weekly!: boolean;

  // How many future periods to prepay (0 = only clear overdue/current)
  @IsInt() @Min(0)
  prepay_qty!: number;

  // Coverage window (GC ISO 8601, inclusive)
  @IsISO8601()
  covered_start_date!: string;

  @IsISO8601()
  covered_end_date!: string;

  // Optional safeguard to ensure client/server totals match
  @IsOptional() @IsNumber()
  total_override?: number;

  // Optional: record how it was paid (string matches DB enum)
  @IsOptional() @IsString()
  payment_method?: string; // CASH | CARD | BANK | MOBILE | OTHER
}
