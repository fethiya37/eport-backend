import { PrismaService } from '../../../prisma/prisma.service';
import { IAssociationRepository, AssociationFilter } from '../../domain/repositories/association.repository';
import { Association } from '@prisma/client';
export declare class PrismaAssociationRepository implements IAssociationRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: {
        name: string;
        phone_number?: string | null;
        logo?: string | null;
    }): Promise<Association>;
    findAll(filter?: AssociationFilter): Promise<Association[]>;
    findById(id: number): Promise<Association | null>;
    update(id: number, data: Partial<Association>): Promise<Association>;
    exists(id: number): Promise<boolean>;
}
