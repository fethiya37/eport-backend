export type user_type =
  | 'Superadmin'
  | 'Admin'
  | 'Association'
  | 'Driver'
  | 'Controller'
  | 'Owner';

export class User {
  constructor(
    public readonly id: number,
    public readonly phone_number: string,
    public readonly user_type: user_type,
    public readonly name: string | null,
    public readonly association_id: number | null,  
    public readonly password_hash: string | null,   
    public readonly is_locked: boolean,             
    public readonly created_at?: Date,
    public readonly updated_at?: Date,
  ) {}
}
