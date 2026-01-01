import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches, IsUrl } from 'class-validator';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class CreateAssociationDto {
  @ApiProperty({ example: 'Addis Ababa Drivers Coop' })
  @IsString()
  @MaxLength(100)
  @NoHtml({ message: 'name must not include HTML/JS tags' })
  name!: string;

  @ApiPropertyOptional({ example: '+251911223344' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @NoHtml({ message: 'phone_number must not include HTML/JS tags' })
  @Matches(/^\+?[0-9]{7,20}$/u, { message: 'phone_number must be a valid phone number' })
  phone_number?: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @NoHtml({ message: 'logo must not include HTML/JS tags' })
  @IsUrl({ require_protocol: true }, { message: 'logo must be a valid URL' })
  logo?: string | null;
}
