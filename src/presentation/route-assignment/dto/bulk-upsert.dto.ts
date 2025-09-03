// src/presentation/route-assignment/dto/bulk-upsert.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsBoolean, IsInt, IsOptional, Min, Matches, IsString } from 'class-validator';
import { Type } from 'class-transformer';

class BulkUpsertItemDto {
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1)
  route_id!: number;

  @ApiProperty() @Type(() => Number) @IsInt() @Min(1)
  driver_id!: number;

  @ApiProperty() @Type(() => Number) @IsInt() @Min(1)
  vehicle_id!: number;

  // Optional update path
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

  // NEW: Allow UI to pass a specific quota (Association users)
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  route_quota_id?: number;
}

export class BulkUpsertAssignmentsDto {
  // Associations must omit this (service derives from JWT); Admin/Superadmin may pass it
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  association_id?: number;

  @ApiProperty({ type: [BulkUpsertItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpsertItemDto)
  items!: BulkUpsertItemDto[];
}
