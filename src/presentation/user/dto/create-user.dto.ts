import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { UserType } from '@prisma/client';
import { Type } from 'class-transformer';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class CreateUserDto {
  @ApiProperty({ example: '+251912345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  @NoHtml({ message: 'phone_number must not include HTML or script tags' })
  @Matches(/^\+2519\d{8}$/u, { message: 'phone_number must be in +2519XXXXXXXX format' })
  phone_number!: string;

  @ApiProperty({ enum: UserType, example: UserType.Admin })
  @IsEnum(UserType)
  user_type!: UserType;

  @ApiPropertyOptional({ example: 'Wingo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @NoHtml({ message: 'name must not include HTML or script tags' })
  name?: string | null;

  @ApiPropertyOptional({ example: 1, description: 'Required only if user_type = Association' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  association_id?: number | null;
}
