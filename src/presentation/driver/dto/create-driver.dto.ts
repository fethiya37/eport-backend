import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength, IsBoolean } from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({ example: 'Abebe Kebede' })
  @IsString()
  @MaxLength(100)
  full_name!: string;

  @ApiProperty({ example: '+251911223344' })
  @IsString()
  @MaxLength(20)
  phone_number!: string;

  @ApiPropertyOptional({ example: 'D-123456' })
  @IsOptional()
  @IsString()
  license_no?: string | null;

  @ApiPropertyOptional({ example: '2030-12-31' })
  @IsOptional()
  @IsDateString()
  license_expiry?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  has_smartphone?: boolean;   // ✅ new
}
