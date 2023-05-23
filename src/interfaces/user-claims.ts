import { IAuditInfo } from './audit-info';

export interface IUserClaims {
  UserId?: string;
  ClaimType: string;
  ClaimValue?: string;
  AuditInfo?: IAuditInfo;
}