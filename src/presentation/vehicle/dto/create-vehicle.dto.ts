import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ example: 'AB-12345' })
  @IsString() @IsNotEmpty() @MaxLength(20)
  plate_number!: string;

  @ApiProperty({ example: 'LBR-7890', required: false })
  @IsOptional() @IsString() @MaxLength(100)
  libre_no?: string | null;

  @ApiProperty({ example: 10, description: 'Owner id (must belong to this association)' })
  @IsInt()
  owner_id!: number;

  @ApiProperty({ example: 'Toyota', required: false })
  @IsOptional() @IsString() @MaxLength(100)
  make?: string | null;

  @ApiProperty({ example: 'Yaris', required: false })
  @IsOptional() @IsString() @MaxLength(100)
  model?: string | null;

  @ApiProperty({ example: 'White', required: false })
  @IsOptional() @IsString() @MaxLength(50)
  color?: string | null;

  @ApiProperty({ example: 4, required: false })
  @IsOptional() @IsInt() @IsPositive()
  capacity?: number | null;
}
