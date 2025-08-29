import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, IsInt } from 'class-validator';

const USER_TYPES = ['Superadmin', 'Admin', 'Association', 'Driver', 'Controller', 'Owner'] as const;
type UserType = typeof USER_TYPES[number];

export class CreateUserDto {
  @ApiProperty({ example: '0911223344' })
  @IsString() @IsNotEmpty() @MaxLength(20)
  phone_number!: string;

  @ApiProperty({ enum: USER_TYPES, example: 'Association' })
  @IsString() @IsIn(USER_TYPES as unknown as string[])
  user_type!: UserType;

  @ApiProperty({ example: 'TempPass123' })
  @IsString() @IsNotEmpty()
  password!: string;

  @ApiProperty({ example: 'Association Admin', required: false })
  @IsOptional() @IsString() @MaxLength(100)
  name?: string | null;

  @ApiProperty({ example: 1, required: false, description: 'Required when user_type = Association' })
  @IsOptional() @IsInt()
  association_id?: number;
}
