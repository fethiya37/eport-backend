import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OwnerStatus } from '@prisma/client';

export class UpdateOwnerDto {
  @ApiPropertyOptional({ example: 'New Name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  full_name?: string;

  @ApiPropertyOptional({ example: '+251922233344' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone_number?: string;

  @ApiPropertyOptional({ enum: OwnerStatus })
  @IsOptional()
  @IsEnum(OwnerStatus)
  status?: OwnerStatus; // ACTIVE | SUSPENDED
}
