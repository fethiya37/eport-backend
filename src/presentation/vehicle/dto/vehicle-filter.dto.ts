import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  Min,
} from 'class-validator';
import { VehicleStatus } from '@prisma/client';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class VehicleFilterDto {
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
  id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @NoHtml({ message: 'plate_number must not include HTML or script tags' })
  @Matches(/^[A-Za-z0-9-]+$/u, { message: 'plate_number contains invalid characters' })
  plate_number?: string;

  @ApiPropertyOptional({ enum: VehicleStatus })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  owner_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  driver_id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @NoHtml({ message: 'make must not include HTML or script tags' })
  make?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @NoHtml({ message: 'model must not include HTML or script tags' })
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @NoHtml({ message: 'color must not include HTML or script tags' })
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_weekly?: boolean;
}
