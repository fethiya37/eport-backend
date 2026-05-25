import type { UserContext } from '../../common/context/user-context';
import { AssociationSubaccountService } from '../../application/services/association-subaccount.service';
import { ChapaApiService } from '../../infrastructure/payments/chapa-api.service';
import { CreateSubaccountDto } from './dto/create-subaccount.dto';
export declare class ChapaSubaccountController {
    private readonly svc;
    private readonly chapa;
    constructor(svc: AssociationSubaccountService, chapa: ChapaApiService);
    listBanks(country?: string): Promise<any>;
    create(user: UserContext, dto: CreateSubaccountDto): Promise<{
        association_id: number;
        id: number;
        created_at: Date;
        chapa_id: string;
        business_name: string;
        account_name: string;
        account_number: string;
    }>;
    getMine(user: UserContext): Promise<{
        association_id: number;
        id: number;
        created_at: Date;
        chapa_id: string;
        business_name: string;
        account_name: string;
        account_number: string;
    }>;
    remove(user: UserContext, id: number): Promise<{
        status: string;
    }>;
}
