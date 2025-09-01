import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { RouteInputDto } from './route-input.dto';

export class UpsertGroupWithRoutesDto {
  @ApiPropertyOptional({ example: 5, description: 'Use existing group if provided; else a new group will be created from route_group' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  route_group_id?: number;

  @ApiPropertyOptional({ example: 'Addis – Adama Corridor', description: 'Required only when creating a new group (no route_group_id supplied)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  route_group?: string;

  @ApiProperty({ type: [RouteInputDto] })
  @ValidateNested({ each: true })
  @Type(() => RouteInputDto)
  @ArrayMinSize(1)
  routes!: RouteInputDto[];
}
