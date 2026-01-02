import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class AssociationFilterDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;

  @ApiPropertyOptional({ example: 'Addis' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @NoHtml({ message: 'name must not include HTML or script tags' })
  name?: string;
}
