import { OwnerService } from '../../application/services/owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import type { UserContext } from 'src/common/context/user-context';
export declare class OwnerController {
    private readonly service;
    constructor(service: OwnerService);
    findAll(user: UserContext, association_id?: number): Promise<{
        association_id: number;
        id: number;
        created_at: Date;
        full_name: string;
        phone_number: string;
        updated_at: Date;
    }[]>;
    findOne(user: UserContext, id: number): Promise<{
        association_id: number;
        id: number;
        created_at: Date;
        full_name: string;
        phone_number: string;
        updated_at: Date;
    }>;
    create(user: UserContext, dto: CreateOwnerDto): Promise<{
        association_id: number;
        id: number;
        created_at: Date;
        full_name: string;
        phone_number: string;
        updated_at: Date;
    }>;
    update(user: UserContext, id: number, dto: UpdateOwnerDto): Promise<{
        association_id: number;
        id: number;
        created_at: Date;
        full_name: string;
        phone_number: string;
        updated_at: Date;
    }>;
    remove(user: UserContext, id: number): Promise<{
        association_id: number;
        id: number;
        created_at: Date;
        full_name: string;
        phone_number: string;
        updated_at: Date;
    }>;
}
