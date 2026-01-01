import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RouteInputDto } from './route-input.dto';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class UpsertGroupWithRoutesDto {
  @ApiPropertyOptional({
    example: 5,
    description: 'Use existing group if provided; else a new group will be created from route_group',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  route_group_id?: number;

  @ApiPropertyOptional({
    example: 'Addis – Adama Corridor',
    description: 'Required only when creating a new group (no route_group_id supplied)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @NoHtml({ message: 'route_group must not include HTML or script tags' })
  route_group?: string;

  @ApiProperty({ type: [RouteInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RouteInputDto)
  routes!: RouteInputDto[];
}
