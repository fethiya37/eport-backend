import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { RouteQuotaStatus } from '@prisma/client';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class UpdateRouteQuotaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @NoHtml({ message: 'start_date must not include HTML or script tags' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'start_date must be YYYY-MM-DD' })
  start_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @NoHtml({ message: 'end_date must not include HTML or script tags' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'end_date must be YYYY-MM-DD' })
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
