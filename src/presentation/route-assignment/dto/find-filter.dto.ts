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
  MaxLength,
} from 'class-validator';
import { RouteAssignmentStatus, PaymentStatus } from '@prisma/client';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class RouteAssignmentFilterDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  association_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  route_id?: number;

  @ApiPropertyOptional({ enum: RouteAssignmentStatus })
  @IsOptional()
  @IsEnum(RouteAssignmentStatus)
  status?: RouteAssignmentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_weekly?: boolean;

  @ApiPropertyOptional({ example: '2017-01-01' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @NoHtml({ message: 'date_from must not include HTML or script tags' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'date_from must be YYYY-MM-DD' })
  date_from?: string;

  @ApiPropertyOptional({ example: '2017-01-07' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @NoHtml({ message: 'date_to must not include HTML or script tags' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'date_to must be YYYY-MM-DD' })
  date_to?: string;

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

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  payment_status?: PaymentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  route_quota_id?: number;
}
