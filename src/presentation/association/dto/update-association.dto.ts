import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { AssociationStatus } from '@prisma/client';

export class UpdateAssociationDto {
  @ApiPropertyOptional({ example: 'New Association Name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '+251922233344' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone_number?: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/new-logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  logo?: string | null;

  // If provided, triggers lock/unlock cascade
  @ApiPropertyOptional({ enum: AssociationStatus, example: 'SUSPENDED' })
  @IsOptional()
  @IsEnum(AssociationStatus)
  status?: AssociationStatus;
}
