import { IAuditInfo } from './audit-info';

export interface ITrack {
  _id?: string;
  trackUrl: string;
  auditInfo?: IAuditInfo;
}