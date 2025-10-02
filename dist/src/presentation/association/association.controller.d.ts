import { AssociationService } from '../../application/services/association.service';
import { CreateAssociationDto } from './dto/create-association.dto';
import { UpdateAssociationDto } from './dto/update-association.dto';
import { AssociationFilterDto } from './dto/association-filter.dto';
import type { UserContext } from 'src/common/context/user-context';
export declare class AssociationController {
    private readonly service;
    constructor(service: AssociationService);
    publicList(filter: AssociationFilterDto): Promise<{
        id: number;
        phone_number: string | null;
        name: string;
        created_at: Date;
        updated_at: Date;
        logo: string | null;
    }[]>;
    publicGet(id: number): Promise<{
        id: number;
        phone_number: string | null;
        name: string;
        created_at: Date;
        updated_at: Date;
        logo: string | null;
    }>;
    create(user: UserContext, dto: CreateAssociationDto): Promise<{
        id: number;
        phone_number: string | null;
        name: string;
        created_at: Date;
        updated_at: Date;
        logo: string | null;
    }>;
    update(user: UserContext, id: number, dto: UpdateAssociationDto): Promise<{
        id: number;
        phone_number: string | null;
        name: string;
        created_at: Date;
        updated_at: Date;
        logo: string | null;
    }>;
    delete(user: UserContext, id: number): Promise<{
        message: string;
    }>;
}
