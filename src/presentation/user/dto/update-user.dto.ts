import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

const USER_TYPES = ['Superadmin', 'Admin', 'Association', 'Driver', 'Controller', 'Owner'] as const;
type UserType = typeof USER_TYPES[number];

export class UpdateUserDto {
  @ApiProperty({ example: '0911333555', required: false })
  @IsOptional() @IsString() @MaxLength(20)
  phone_number?: string;

  @ApiProperty({ enum: USER_TYPES, required: false })
  @IsOptional() @IsString() @IsIn(USER_TYPES as unknown as string[])
  user_type?: UserType;

  @ApiProperty({ example: 'Name Updated', required: false })
  @IsOptional() @IsString() @MaxLength(100)
  name?: string | null;

  @ApiProperty({ example: false, required: false })
  @IsOptional() @IsBoolean()
  is_locked?: boolean;

  @ApiProperty({ example: 2, required: false, description: 'Required if user_type is Association' })
  @IsOptional() @IsInt()
  association_id?: number | null;
}
