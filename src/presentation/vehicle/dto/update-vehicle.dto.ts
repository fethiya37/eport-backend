import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class UpdateVehicleDto {
  @ApiProperty({ example: 'AB-54321', required: false })
  @IsOptional() @IsString() @MaxLength(20)
  plate_number?: string;

  @ApiProperty({ example: 'LBR-0001', required: false })
  @IsOptional() @IsString() @MaxLength(100)
  libre_no?: string | null;

  @ApiProperty({ example: 11, required: false })
  @IsOptional() @IsInt()
  owner_id?: number;

  @ApiProperty({ example: 'Hyundai', required: false })
  @IsOptional() @IsString() @MaxLength(100)
  make?: string | null;

  @ApiProperty({ example: 'i10', required: false })
  @IsOptional() @IsString() @MaxLength(100)
  model?: string | null;

  @ApiProperty({ example: 'Blue', required: false })
  @IsOptional() @IsString() @MaxLength(50)
  color?: string | null;

  @ApiProperty({ example: 4, required: false })
  @IsOptional() @IsInt() @IsPositive()
  capacity?: number | null;

  @ApiProperty({ enum: ['ACTIVE','MAINTENANCE','RETIRED','SUSPENDED','RESIGNED'], required: false })
  @IsOptional() @IsIn(['ACTIVE','MAINTENANCE','RETIRED','SUSPENDED','RESIGNED'])
  status?: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED' | 'SUSPENDED' | 'RESIGNED';
}
