export class UserEntity {
  id?: string;
  email: string;
  password: string;
  isActive?: boolean;
}

export const listKeysToValidate: string[] = ['email', 'password'];
