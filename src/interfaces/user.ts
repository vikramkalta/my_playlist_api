import { IAuditInfo } from './audit-info';
import { IOwner } from './owner';
import { IUserClaims } from './user-claims';

export interface IUser {
  _id?: string;
  Name: string;
  Username: string;
  Mobile?: string;
  Email?: string;
  MobileVerified?: boolean;
  EmailVerified?: boolean;
  Password?: string;
  Salt?: string;
  Owner?: IOwner;
  Claims?: IUserClaims[];
  AuditInfo?: IAuditInfo;
  token?: string;
}