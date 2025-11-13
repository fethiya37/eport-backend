import { ApiProperty } from '@nestjs/swagger';

export class LogResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ nullable: true })
  user_id: number | null;

  @ApiProperty({ nullable: true })
  user_name: string | null;

  @ApiProperty({ nullable: true })
  user_phone_number: string | null;

  @ApiProperty({ nullable: true })
  user_type: string | null;

  @ApiProperty({ nullable: true })
  association_id: number | null;

  @ApiProperty({ nullable: true })
  association_name: string | null;

  @ApiProperty()
  action: string;

  @ApiProperty({ nullable: true })
  entity_type: string | null;

  @ApiProperty({ nullable: true })
  entity_id: number | null;

  @ApiProperty({ nullable: true })
  ip_address: string | null;

  @ApiProperty()
  created_at: Date;
}
