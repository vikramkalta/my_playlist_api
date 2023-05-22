import { IAuditInfo } from './audit-info';
import { IPermission } from './permissions';

export interface IUserRoles {
  RoleName: string;
  Permissions?: IPermission[];
  AuditInfo?: IAuditInfo;
}