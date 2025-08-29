import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateDriverDto {
  @ApiProperty({ example: 'Getachew A.', required: false })
  @IsOptional() @IsString() @MaxLength(100)
  full_name?: string;

  @ApiProperty({ example: '0911000009', required: false })
  @IsOptional() @IsString() @MaxLength(20)
  phone_number?: string;

  @ApiProperty({ example: 'D-98765', required: false })
  @IsOptional() @IsString() @MaxLength(50)
  license_no?: string | null;

  @ApiProperty({ example: '2027-01-01', required: false })
  @IsOptional() @IsDateString()
  license_expiry?: string | null;

  @ApiProperty({ enum: ['AVAILABLE','ON_TRIP','OFFLINE','SUSPENDED'], required: false })
  @IsOptional() @IsIn(['AVAILABLE','ON_TRIP','OFFLINE','SUSPENDED'])
  status?: 'AVAILABLE' | 'ON_TRIP' | 'OFFLINE' | 'SUSPENDED';

  @ApiProperty({
    example: 100,
    required: false,
    description: 'Set a new vehicle id to reassign; send null to end current assignment',
  })
  @IsOptional() @IsInt()
  vehicle_id?: any; // allow null in JSON
}
