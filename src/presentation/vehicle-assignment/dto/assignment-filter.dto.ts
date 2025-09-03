import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsDateString, IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class VehicleAssignmentFilterDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  driver_id?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  vehicle_id?: number;

  @ApiPropertyOptional({ example: 'true', description: 'true or false' })
  @IsOptional() @IsBooleanString()
  active?: string;

  // Date-only supported: 'YYYY-MM-DD'. Inclusive range.
  @ApiPropertyOptional({ example: '2025-09-01', description: 'inclusive start of window' })
  @IsOptional() @IsDateString()
  range_start?: string;

  @ApiPropertyOptional({ example: '2025-09-30', description: 'inclusive end of window' })
  @IsOptional() @IsDateString()
  range_end?: string;
}
