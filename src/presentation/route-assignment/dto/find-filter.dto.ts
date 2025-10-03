// src/presentation/route-assignment/dto/find-filter.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RouteAssignmentStatus, PaymentStatus } from '@prisma/client';

export class RouteAssignmentFilterDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) association_id?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) route_id?: number;

  @ApiPropertyOptional({ enum: RouteAssignmentStatus })
  @IsOptional() @IsEnum(RouteAssignmentStatus)
  status?: RouteAssignmentStatus;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_weekly?: boolean;

  @ApiPropertyOptional({ example: '2017-01-01' })
  @IsOptional() @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date_from?: string;

  @ApiPropertyOptional({ example: '2017-01-07' })
  @IsOptional() @IsString() @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date_to?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  driver_id?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  vehicle_id?: number;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional() @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  // ✅ NEW
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  route_quota_id?: number;
}
