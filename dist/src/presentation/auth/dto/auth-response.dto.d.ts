export declare class AuthUserDto {
    id: number;
    phone_number: string;
    user_type: 'Superadmin' | 'Admin' | 'Association' | 'Driver' | 'Controller';
    association_id: number | null;
    name: string | null;
}
export declare class AuthResponseDto {
    access_token: string;
    user: AuthUserDto;
}
