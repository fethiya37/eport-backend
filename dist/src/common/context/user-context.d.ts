import type { Role } from '../../common/decorators/roles.decorator';
export type UserContext = {
    userId: number;
    user_type: Role;
    association_id: number | null;
};
