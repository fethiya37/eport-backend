import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

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
  @NoHtml({ message: 'departure_contains must not include HTML or script tags' })
  departure_contains?: string;

  @ApiPropertyOptional({ example: 'Adama' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @NoHtml({ message: 'arrival_contains must not include HTML or script tags' })
  arrival_contains?: string;
}
