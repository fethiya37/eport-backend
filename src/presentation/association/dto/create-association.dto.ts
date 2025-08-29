import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAssociationDto {
  @ApiProperty({ example: 'Bahir Dar Taxi Association' })
  @IsString() @MaxLength(100)
  name!: string;

  @ApiProperty({ example: '0911223344', required: false, description: 'Optional phone number for the association' })
  @IsOptional() @IsString() @MaxLength(20)
  phone_number?: string | null;  // 👈 optional

  @ApiProperty({ example: '/uploads/logo.png', required: false })
  @IsOptional() @IsString()
  logo?: string | null;
}
