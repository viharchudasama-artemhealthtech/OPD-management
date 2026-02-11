import { BaseEntity } from './base.model';
export { Department } from './enums/department.enum';
export { UserRole } from './enums/user-role.enum';
export { UserStatus } from './enums/user-status.enum';

import { Department } from './enums/department.enum';
import { UserRole } from './enums/user-role.enum';
import { UserStatus } from './enums/user-status.enum';

export interface User extends BaseEntity {
  readonly username: string;
  readonly fullName: string;
  readonly role: UserRole;
  readonly email?: string;
  readonly token?: string;
  readonly avatar?: string;
  readonly department?: Department;
}

export interface AppUser extends User {
  readonly email: string;
  readonly status: UserStatus;
  readonly lastLogin?: Date;
  readonly password?: string;
  readonly department?: Department;
}
