import { IAuditInfo } from './audit-info';
import { IPermission } from './permissions';

export interface IUserRoles {
  roleName: string;
  permissions?: IPermission[];
  auditInfo?: IAuditInfo;
}