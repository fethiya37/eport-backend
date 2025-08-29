import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAssociationDto {
  @ApiProperty({ example: 'New Association Name', required: false })
  @IsOptional() @IsString() @MaxLength(100)
  name?: string;

  @ApiProperty({ example: '0911333555', required: false })
  @IsOptional() @IsString() @MaxLength(20)
  phone_number?: string | null;   // 👈 optional

  @ApiProperty({ example: '/uploads/new-logo.png', required: false })
  @IsOptional() @IsString()
  logo?: string | null;

  @ApiProperty({ enum: ['ACTIVE','SUSPENDED'], required: false })
  @IsOptional() @IsIn(['ACTIVE','SUSPENDED'])
  status?: 'ACTIVE' | 'SUSPENDED';
}
