import { IAuditInfo } from './audit-info';

export interface IUserRoles {
  RoleName: string;
  Permissions?: any[];
  AuditInfo?: IAuditInfo;
}