import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { UserType } from '@prisma/client';
import { Type } from 'class-transformer';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class UpdateUserDto {
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

  @ApiPropertyOptional({ example: 'New Name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @NoHtml({ message: 'name must not include HTML or script tags' })
  name?: string | null;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_locked?: boolean;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  association_id?: number | null;
}
