import { Association } from '@prisma/client';
export declare const ASSOCIATION_REPOSITORY: unique symbol;
export type AssociationFilter = {
    id?: number;
    name?: string;
};
export interface IAssociationRepository {
    create(data: {
        name: string;
        logo?: string | null;
    }): Promise<Association>;
    findAll(filter?: AssociationFilter): Promise<Association[]>;
    findById(id: number): Promise<Association | null>;
    update(id: number, data: Partial<{
        name: string;
        logo: string | null;
    }>): Promise<Association>;
    exists(id: number): Promise<boolean>;
}
