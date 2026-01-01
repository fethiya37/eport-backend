import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class CreateDriverDto {
  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @NoHtml({ message: 'full_name must not include HTML or script tags' })
  full_name!: string;

  @ApiProperty({ example: '+251912345678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(13)
  @NoHtml({ message: 'phone_number must not include HTML or script tags' })
  @Matches(/^\+2519\d{8}$/u, { message: 'phone_number must be in +2519XXXXXXXX format' })
  phone_number!: string;

  @ApiPropertyOptional({ example: 'D-123456' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  @NoHtml({ message: 'license_no must not include HTML or script tags' })
  @Matches(/^[A-Za-z0-9-]+$/u, { message: 'license_no contains invalid characters' })
  license_no?: string | null;

  @ApiPropertyOptional({ example: '2030-12-31' })
  @IsOptional()
  @IsDateString()
  license_expiry?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  has_smartphone?: boolean;
}
