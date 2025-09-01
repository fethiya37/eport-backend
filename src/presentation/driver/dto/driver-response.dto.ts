import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DriverStatus } from '@prisma/client';

export class DriverResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() user_id!: number;
  @ApiProperty() association_id!: number;
  @ApiProperty() full_name!: string;
  @ApiProperty() phone_number!: string;
  @ApiProperty({ enum: DriverStatus }) status!: DriverStatus;

  @ApiPropertyOptional() license_no?: string | null;
  @ApiPropertyOptional() license_expiry?: Date | null;

  // For edit screen convenience
  @ApiPropertyOptional({ description: 'Active vehicle id if any' })
  active_vehicle_id?: number | null;
}
