import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  IsIn,
  MaxLength,
} from 'class-validator';
import { RouteAssignmentHistoryStatus } from '@prisma/client';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class UpdateAssignmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  route_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  driver_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  vehicle_id?: number;

  @ApiPropertyOptional({ example: '2017-01-01' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @NoHtml({ message: 'start_date must not include HTML or script tags' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'start_date must be YYYY-MM-DD' })
  start_date?: string;

  @ApiPropertyOptional({ example: '2017-01-07' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @NoHtml({ message: 'end_date must not include HTML or script tags' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'end_date must be YYYY-MM-DD' })
  end_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_weekly?: boolean;

  @ApiPropertyOptional({ enum: ['Approved', 'Pending'] as const })
  @IsOptional()
  @IsIn(['Approved', 'Pending'], { message: 'status must be Approved or Pending' })
  status?: 'Approved' | 'Pending';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  route_quota_id?: number | null;

  @ApiPropertyOptional({ enum: RouteAssignmentHistoryStatus })
  @IsOptional()
  @IsEnum(RouteAssignmentHistoryStatus)
  history_status?: RouteAssignmentHistoryStatus;
}
