import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOwnerDto {
  @ApiProperty({ example: 'Abebe K.', required: false })
  @IsOptional() @IsString() @MaxLength(100)
  full_name?: string;

  @ApiProperty({ example: '0911333555', required: false })
  @IsOptional() @IsString() @MaxLength(20)
  phone_number?: string;

  @ApiProperty({ enum: ['ACTIVE','SUSPENDED'], required: false })
  @IsOptional() @IsIn(['ACTIVE','SUSPENDED'])
  status?: 'ACTIVE' | 'SUSPENDED';
}
