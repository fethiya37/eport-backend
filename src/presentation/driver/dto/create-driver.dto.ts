import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({ example: 'Getachew Alemu' })
  @IsString() @IsNotEmpty() @MaxLength(100)
  full_name!: string;

  @ApiProperty({ example: '0911555666' })
  @IsString() @IsNotEmpty() @MaxLength(20)
  phone_number!: string;

  @ApiProperty({ example: 'D-12345', required: false })
  @IsOptional() @IsString() @MaxLength(50)
  license_no?: string | null;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional() @IsDateString()
  license_expiry?: string | null;

  @ApiProperty({ example: 42, required: false, description: 'Optional initial vehicle assignment' })
  @IsOptional() @IsInt()
  vehicle_id?: number;
}
