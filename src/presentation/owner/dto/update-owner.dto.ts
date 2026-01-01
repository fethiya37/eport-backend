import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  Matches,
} from 'class-validator';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class UpdateOwnerDto {
  @ApiPropertyOptional({ example: 'New Name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @NoHtml({ message: 'full_name must not include HTML or script tags' })
  full_name?: string;

  @ApiPropertyOptional({ example: '+251912345678' })
  @IsOptional()
  @IsString()
  @MaxLength(13)
  @NoHtml({ message: 'phone_number must not include HTML or script tags' })
  @Matches(/^\+2519\d{8}$/u, { message: 'phone_number must be in +2519XXXXXXXX format' })
  phone_number?: string;
}
