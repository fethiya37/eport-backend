import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  IsUrl,
} from 'class-validator';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class UpdateAssociationDto {
  @ApiPropertyOptional({ example: 'New Association Name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @NoHtml({ message: 'name must not include HTML or script tags' })
  name?: string;

  @ApiPropertyOptional({ example: '+251922233344' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @NoHtml({ message: 'phone_number must not include HTML or script tags' })
  @Matches(/^\+?[0-9]{7,20}$/u, {
    message: 'phone_number must be a valid phone number',
  })
  phone_number?: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/new-logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @NoHtml({ message: 'logo must not include HTML or script tags' })
  @IsUrl({ require_protocol: true }, { message: 'logo must be a valid URL' })
  logo?: string | null;
}
