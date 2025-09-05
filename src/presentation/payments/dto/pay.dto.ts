import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PayDto {
  @ApiPropertyOptional({ example: 123 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  driver_id?: number;

  @ApiPropertyOptional({ example: 'AB-12345' })
  @IsOptional()
  @IsString()
  plate_number?: string;

  @ApiPropertyOptional({ example: 3, description: 'Prepay N future periods (>=0). Allowed even if overdue.' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  prepay_qty?: number;

  @ApiPropertyOptional({ example: 0, description: 'Override total (optional); if provided we will validate against expected.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  total_override?: number;
}
