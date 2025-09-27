import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty() id!: number;
  @ApiProperty() phone_number!: string;
  @ApiProperty({ enum: ['Superadmin','Admin','Association','Driver','Controller'] })
  user_type!: 'Superadmin'|'Admin'|'Association'|'Driver'|'Controller';
  @ApiProperty({ nullable: true }) association_id!: number | null;
  @ApiProperty({ nullable: true }) name!: string | null;
}

export class AuthResponseDto {
  @ApiProperty() access_token!: string;
  @ApiProperty({ type: AuthUserDto }) user!: AuthUserDto;
}
