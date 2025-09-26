import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsBoolean, IsInt, IsOptional, Min, Matches, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { RouteAssignmentHistoryStatus } from '@prisma/client';

class BulkUpsertItemDto {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1)
  route_id!: number;

  @ApiProperty() @Type(() => Number) @IsInt() @Min(1)
  vehicle_id!: number;

  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  id?: number;

  @ApiProperty({ example: '2017-01-01' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'start_date must be YYYY-MM-DD' })
  start_date!: string;

  @ApiProperty({ example: '2017-01-07' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'end_date must be YYYY-MM-DD' })
  end_date!: string;

  @ApiProperty() @IsBoolean()
  is_weekly!: boolean;

  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  route_quota_id?: number;

  // ✅ NEW
  @ApiProperty({ required: false, enum: RouteAssignmentHistoryStatus })
  @IsOptional()
  @IsEnum(RouteAssignmentHistoryStatus)
  history_status?: RouteAssignmentHistoryStatus | null;
}

export class BulkUpsertAssignmentsDto {
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  association_id?: number;

  @ApiProperty({ type: [BulkUpsertItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpsertItemDto)
  items!: BulkUpsertItemDto[];
}
