import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserType } from '@prisma/client';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class UserFilterDto {
  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id?: number;

  @ApiPropertyOptional({ example: '+251912345678' })
  @IsOptional()
  @IsString()
  @MaxLength(13)
  @NoHtml({ message: 'phone_number must not include HTML or script tags' })
  @Matches(/^\+2519\d{8}$/u, { message: 'phone_number must be in +2519XXXXXXXX format' })
  phone_number?: string;

  @ApiPropertyOptional({ enum: UserType })
  @IsOptional()
  @IsEnum(UserType)
  user_type?: UserType;

  @ApiPropertyOptional({ example: 'Wingo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @NoHtml({ message: 'name must not include HTML or script tags' })
  name?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBooleanString()
  is_locked?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  association_id?: number;
}
