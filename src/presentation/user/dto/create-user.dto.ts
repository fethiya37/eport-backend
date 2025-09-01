import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, IsInt, Min } from 'class-validator';
import { UserType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ example: '+251911223344' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone_number!: string; // password = phone_number (hashed)

  @ApiProperty({ enum: UserType, example: UserType.Admin })
  @IsEnum(UserType)
  user_type!: UserType;

  @ApiPropertyOptional({ example: 'Wingo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string | null;

  // Required only when user_type === 'Association'; otherwise we will set it to null in service.
  @ApiPropertyOptional({ example: 1, description: 'Required only if user_type = Association' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  association_id?: number | null;
}
