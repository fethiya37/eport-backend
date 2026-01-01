import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { RouteAssignmentHistoryStatus } from '@prisma/client';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

class BulkUpsertItemDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  route_id!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  vehicle_id!: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;

  @ApiProperty({ example: '2017-01-01' })
  @IsString()
  @MaxLength(10)
  @NoHtml({ message: 'start_date must not include HTML or script tags' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'start_date must be YYYY-MM-DD' })
  start_date!: string;

  @ApiProperty({ example: '2017-01-07' })
  @IsString()
  @MaxLength(10)
  @NoHtml({ message: 'end_date must not include HTML or script tags' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/u, { message: 'end_date must be YYYY-MM-DD' })
  end_date!: string;

  @ApiProperty()
  @IsBoolean()
  is_weekly!: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  route_quota_id?: number;

  @ApiProperty({ required: false, enum: RouteAssignmentHistoryStatus })
  @IsOptional()
  @IsEnum(RouteAssignmentHistoryStatus)
  history_status?: RouteAssignmentHistoryStatus | null;
}

export class BulkUpsertAssignmentsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  association_id?: number;

  @ApiProperty({ type: [BulkUpsertItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => BulkUpsertItemDto)
  items!: BulkUpsertItemDto[];
}
