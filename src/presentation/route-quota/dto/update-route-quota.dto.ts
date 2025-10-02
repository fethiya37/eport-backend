import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, IsString, Matches, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { RouteQuotaStatus } from '@prisma/client';

export class UpdateRouteQuotaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'start_date must be YYYY-MM-DD' })
  start_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'end_date must be YYYY-MM-DD' })
  end_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  no_vehicles?: number;

  @ApiPropertyOptional({ enum: RouteQuotaStatus })
  @IsOptional()
  @IsEnum(RouteQuotaStatus)
  status?: RouteQuotaStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  remaining_vehicles?: number;
}
