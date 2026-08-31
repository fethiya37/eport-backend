import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';
import { NoHtml } from '../../../common/decorators/no-html.decorator';

export class CreateAssociationDto {
  @ApiProperty({ example: 'Addis Ababa Drivers Coop' })
  @IsString()
  @MaxLength(100)
  @NoHtml({ message: 'name must not include HTML/JS tags' })
  name!: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @NoHtml({ message: 'logo must not include HTML/JS tags' })
  @IsUrl({ require_protocol: true }, { message: 'logo must be a valid URL' })
  logo?: string | null;
}
