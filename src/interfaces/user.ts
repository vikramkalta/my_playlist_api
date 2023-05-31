import { IAuditInfo } from './audit-info';
import { IOwner } from './owner';
import { IUserClaims } from './user-claims';

export interface IUser {
  _id?: string;
  firstName: string;
  lastName: string;
  username: string;
  contact?: string;
  email?: string;
  dob?: Date;
  contactVerified?: boolean;
  emailVerified?: boolean;
  password?: string;
  salt?: string;
  owner?: IOwner;
  claims?: IUserClaims[];
  auditInfo?: IAuditInfo;
  token?: string;
}