import { IAuditInfo } from './audit-info';

export interface IEmail {
  email: string;
  auditInfo?: IAuditInfo;
}