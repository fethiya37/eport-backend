import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class RouteFilterDto {
  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  route_group_id?: number;

  @ApiPropertyOptional({ example: 'Addis' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  departure_contains?: string;

  @ApiPropertyOptional({ example: 'Adama' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  arrival_contains?: string;
}
