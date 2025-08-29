// src/presentation/association/association.controller.ts
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AssociationService } from '../../application/services/association.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { AssociationResponseDto } from './dto/association-response.dto';
import { RolesGuard } from '../../infrastructure/auth/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('associations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('associations')
export class AssociationController {
  constructor(private readonly service: AssociationService) {}

  @Post()
  @Roles('Superadmin', 'Admin')
  @ApiOperation({ summary: 'Create a new association (status defaults to ACTIVE)' })
  @ApiResponse({ status: 201, type: AssociationResponseDto })
  async create(@Body() dto: CreateAssociationDto): Promise<AssociationResponseDto> {
    const a = await this.service.createAssociation({
      name: dto.name,
      phone_number: dto.phone_number ?? null, // 👈
      logo: dto.logo ?? null,
    });
    return {
      id: a.id,
      name: a.name,
      phone_number: a.phone_number,  // 👈
      logo: a.logo,
      status: a.status,
      created_at: a.created_at!,
      updated_at: a.updated_at!,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get association by id' })
  @ApiResponse({ status: 200, type: AssociationResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<AssociationResponseDto> {
    const a = await this.service.getById(id);
    return {
      id: a.id,
      name: a.name,
      phone_number: a.phone_number,  // 👈
      logo: a.logo,
      status: a.status,
      created_at: a.created_at!,
      updated_at: a.updated_at!,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List associations' })
  @ApiResponse({ status: 200, type: AssociationResponseDto, isArray: true })
  async list(@Query('skip') skip?: string, @Query('take') take?: string): Promise<AssociationResponseDto[]> {
    const data = await this.service.list({ skip: skip ? +skip : undefined, take: take ? +take : undefined });
    return data.map(a => ({
      id: a.id,
      name: a.name,
      phone_number: a.phone_number,  // 👈
      logo: a.logo,
      status: a.status,
      created_at: a.created_at!,
      updated_at: a.updated_at!,
    }));
  }

  @Patch(':id')
  @Roles('Superadmin', 'Admin')
  @ApiOperation({ summary: 'Update association (SUSPENDED locks all its users)' })
  @ApiResponse({ status: 200, type: AssociationResponseDto })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAssociationDto): Promise<AssociationResponseDto> {
    const a = await this.service.updateAssociation({
      id,
      name: dto.name,
      phone_number: dto.phone_number ?? undefined,  // 👈
      logo: dto.logo ?? undefined,
      status: dto.status,
    });
    return {
      id: a.id,
      name: a.name,
      phone_number: a.phone_number,  // 👈
      logo: a.logo,
      status: a.status,
      created_at: a.created_at!,
      updated_at: a.updated_at!,
    };
  }

  @Delete(':id')
  @Roles('Superadmin', 'Admin')
  @ApiOperation({ summary: 'Delete association (locks all its users first)' })
  @ApiResponse({ status: 200, schema: { example: { status: 'ok' } } })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ status: 'ok' }> {
    await this.service.deleteAssociation(id);
    return { status: 'ok' };
  }
}
