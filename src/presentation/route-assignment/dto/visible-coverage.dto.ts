// src/presentation/route-assignment/dto/visible-coverage.dto.ts
import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class VisibleCoverageQueryDto {
  @IsOptional()
  @IsString()
  plate_number?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  driver_id?: number;
}
