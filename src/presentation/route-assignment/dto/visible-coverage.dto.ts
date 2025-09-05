import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class VisibleCoverageQueryDto {
  @ApiPropertyOptional({ example: 'AB-12345', description: 'Plate number to search by (active vehicle assignment required)' })
  @IsOptional()
  @IsString()
  plate_number?: string;

  @ApiPropertyOptional({ example: 10, description: 'Driver id to search by' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  driver_id?: number;

  // Require at least one of plate_number or driver_id
  @ValidateIf(o => !o.plate_number && !o.driver_id)
  _atLeastOne() {
    return false; // validator hook; we’ll also check in service to return a 400
  }
}
