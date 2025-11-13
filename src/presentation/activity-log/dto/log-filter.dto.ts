import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class LogFilterDto {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  user_id?: number;

  @ApiPropertyOptional({ description: 'Filter by association ID (admins only)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  association_id?: number;

  @ApiPropertyOptional({ description: 'Filter by action string' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Filter by entity type, e.g. OWNER, DRIVER' })
  @IsOptional()
  @IsString()
  entity_type?: string;

  @ApiPropertyOptional({ description: 'Filter by entity ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  entity_id?: number;

  @ApiPropertyOptional({ description: 'Created from date (ISO string)' })
  @IsOptional()
  @IsString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'Created to date (ISO string)' })
  @IsOptional()
  @IsString()
  date_to?: string;

  @ApiPropertyOptional({ description: 'Pagination: skip', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  skip?: number = 0;

  @ApiPropertyOptional({ description: 'Pagination: take', default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  take?: number = 100;
}
