import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() phone_number!: string;
  @ApiProperty({ enum: ['Superadmin','Admin','Association','Driver','Controller','Owner'] })
  user_type!: 'Superadmin' | 'Admin' | 'Association' | 'Driver' | 'Controller' | 'Owner';
  @ApiProperty({ nullable: true }) name!: string | null;
  @ApiProperty({ nullable: true }) association_id!: number | null;
  @ApiProperty() is_locked!: boolean;
  @ApiProperty() created_at!: Date;
  @ApiProperty({ required: false }) updated_at?: Date;
}
