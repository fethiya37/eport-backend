import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { AssociationContextGuard } from '../../infrastructure/auth/association-context.guard';
import { OwnerService } from '../../application/services/owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { OwnerResponseDto } from './dto/owner-response.dto';

@ApiTags('owners')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard, AssociationContextGuard)
@Controller('associations/:associationId/owners')
export class OwnerController {
  constructor(private readonly service: OwnerService) {}

  @Post()
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'Create owner (also creates linked user with password = phone)' })
  @ApiResponse({ status: 201, type: OwnerResponseDto })
  async create(@Req() req: any, @Body() dto: CreateOwnerDto): Promise<OwnerResponseDto> {
    const association_id = req.context.associationId as number;
    const o = await this.service.createOwner({
      association_id,
      full_name: dto.full_name,
      phone_number: dto.phone_number,
    });
    return {
      id: o.id,
      user_id: o.user_id,
      association_id: o.association_id,
      full_name: o.full_name,
      phone_number: o.phone_number,
      status: o.status,
      created_at: o.created_at!,
      updated_at: o.updated_at!,
    };
  }

  @Get()
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'List owners in this association' })
  @ApiResponse({ status: 200, type: OwnerResponseDto, isArray: true })
  async list(
    @Req() req: any,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: 'ACTIVE' | 'SUSPENDED',
    @Query('search') search?: string,
  ): Promise<OwnerResponseDto[]> {
    const association_id = req.context.associationId as number;
    const data = await this.service.list({
      association_id,
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      status,
      search,
    });
    return data.map((o) => ({
      id: o.id,
      user_id: o.user_id,
      association_id: o.association_id,
      full_name: o.full_name,
      phone_number: o.phone_number,
      status: o.status,
      created_at: o.created_at!,
      updated_at: o.updated_at!,
    }));
  }

  @Get(':id')
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'Get one owner by id (scoped to association)' })
  @ApiResponse({ status: 200, type: OwnerResponseDto })
  async findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number): Promise<OwnerResponseDto> {
    const association_id = req.context.associationId as number;
    const o = await this.service.getByIdScoped(id, association_id);
    return {
      id: o.id,
      user_id: o.user_id,
      association_id: o.association_id,
      full_name: o.full_name,
      phone_number: o.phone_number,
      status: o.status,
      created_at: o.created_at!,
      updated_at: o.updated_at!,
    };
  }

  @Patch(':id')
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'Update owner (status SUSPENDED locks user)' })
  @ApiResponse({ status: 200, type: OwnerResponseDto })
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOwnerDto,
  ): Promise<OwnerResponseDto> {
    const association_id = req.context.associationId as number;
    const o = await this.service.updateOwner({
      id,
      association_id,
      full_name: dto.full_name,
      phone_number: dto.phone_number,
      status: dto.status,
    });
    return {
      id: o.id,
      user_id: o.user_id,
      association_id: o.association_id,
      full_name: o.full_name,
      phone_number: o.phone_number,
      status: o.status,
      created_at: o.created_at!,
      updated_at: o.updated_at!,
    };
  }

  @Delete(':id')
  @Roles('Superadmin', 'Admin', 'Association')
  @ApiOperation({ summary: 'Delete owner (locks user first)' })
  @ApiResponse({ status: 200, schema: { example: { status: 'ok' } } })
  async remove(@Req() req: any, @Param('id', ParseIntPipe) id: number): Promise<{ status: 'ok' }> {
    const association_id = req.context.associationId as number;
    await this.service.deleteOwner(id, association_id);
    return { status: 'ok' };
  }
}
