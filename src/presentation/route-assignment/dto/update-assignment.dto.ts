import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RouteAssignmentHistoryStatus } from '@prisma/client';

export class UpdateAssignmentDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) route_id?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) driver_id?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) vehicle_id?: number;

  @ApiPropertyOptional({ example: '2017-01-01' })
  @IsOptional() @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'start_date must be YYYY-MM-DD' })
  start_date?: string;

  @ApiPropertyOptional({ example: '2017-01-07' })
  @IsOptional() @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'end_date must be YYYY-MM-DD' })
  end_date?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean() is_weekly?: boolean;

  // Admin/Superadmin only
  @ApiPropertyOptional({ enum: ['Approved', 'Pending'] as const }) @IsOptional()
  status?: 'Approved' | 'Pending';

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  route_quota_id?: number | null;

  // ✅ NEW field
  @ApiPropertyOptional({ enum: RouteAssignmentHistoryStatus })
  @IsOptional()
  @IsEnum(RouteAssignmentHistoryStatus)
  history_status?: RouteAssignmentHistoryStatus;
}
