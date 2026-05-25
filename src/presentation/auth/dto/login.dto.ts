import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { UserType } from '@prisma/client';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class LoginDto {
  @ApiProperty({ example: '+251912345678' })
  @IsString()
  @IsNotEmpty()
  @MinLength(13)
  @MaxLength(13)
  @NoHtml({ message: 'phone_number must not include HTML or script tags' })
  @Matches(/^\+2519\d{8}$/, {
    message: 'phone_number must be in +2519XXXXXXXX format',
  })
  phone_number!: string;

  @ApiProperty({ example: 'StrongP@ssw0rd', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(64)
  @NoHtml({ message: 'password must not include HTML or script tags' })
  password!: string;

  @ApiPropertyOptional({
    enum: UserType,
    description:
      'Sent implicitly by client: Driver (mobile) or Association (web)',
  })
  @IsOptional()
  @IsEnum(UserType)
  as?: UserType;
}
